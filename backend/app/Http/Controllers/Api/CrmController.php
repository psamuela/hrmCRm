<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\CustomerAccount;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\CrmTask;
use App\Models\SupportTicket;
use App\Models\CrmCampaign;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CrmController extends Controller
{
    // -------------------------------------------------------------
    // LEADS
    // -------------------------------------------------------------
    public function getLeads(Request $request)
    {
        $companyId = $request->user()->company_id;
        $query = Lead::with('assignedUser')->where('company_id', $companyId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('company_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('lead_score', 'desc')->get(),
        ]);
    }

    public function storeLead(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'company_name' => 'nullable|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'source' => 'required|string',
            'estimated_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Default lead score calculation based on company size/details
        $score = 50;
        if (!empty($validated['company_name'])) $score += 20;
        if (!empty($validated['phone'])) $score += 15;
        if (($validated['estimated_value'] ?? 0) > 5000000) $score += 10;

        $lead = Lead::create(array_merge($validated, [
            'company_id' => $companyId,
            'assigned_to' => $request->user()->id,
            'status' => 'new',
            'lead_score' => min($score, 99),
        ]));

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'CRM',
            'action' => 'created_lead',
            'details' => "Captured new lead {$lead->first_name} {$lead->last_name} ({$lead->company_name})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead created successfully',
            'data' => $lead->load('assignedUser'),
        ], 201);
    }

    public function updateLeadStatus(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $lead = Lead::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'status' => 'required|in:new,contacted,qualified,proposal,negotiation,converted,lost',
            'lost_reason' => 'nullable|string',
        ]);

        $lead->update([
            'status' => $request->status,
            'lost_reason' => $request->lost_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lead status moved to {$request->status}",
            'data' => $lead,
        ]);
    }

    // -------------------------------------------------------------
    // CUSTOMER ACCOUNTS & CONTACTS
    // -------------------------------------------------------------
    public function getCustomerAccounts(Request $request)
    {
        $companyId = $request->user()->company_id;
        $accounts = CustomerAccount::with(['accountManager', 'contacts', 'deals'])
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function storeCustomerAccount(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string',
            'industry' => 'nullable|string',
            'type' => 'required|string',
            'tier' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'billing_address' => 'nullable|string',
        ]);

        $code = 'ACC-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['name']), 0, 5)) . '-' . rand(100, 999);

        $account = CustomerAccount::create(array_merge($validated, [
            'company_id' => $companyId,
            'account_code' => $code,
            'account_manager_id' => $request->user()->id,
            'status' => 'active',
            'lifetime_revenue' => 0,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Customer account registered successfully',
            'data' => $account,
        ], 201);
    }

    // -------------------------------------------------------------
    // DEALS / SALES PIPELINE (KANBAN)
    // -------------------------------------------------------------
    public function getDeals(Request $request)
    {
        $companyId = $request->user()->company_id;
        $deals = Deal::with(['customerAccount', 'assignedUser', 'lead'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $deals,
        ]);
    }

    public function storeDeal(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'title' => 'required|string',
            'customer_account_id' => 'nullable|exists:customer_accounts,id',
            'lead_id' => 'nullable|exists:leads,id',
            'pipeline_stage' => 'required|in:lead,qualification,proposal,negotiation,closed_won,closed_lost',
            'deal_value' => 'required|numeric|min:0',
            'probability_percent' => 'required|integer|min:0|max:100',
            'expected_closing_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $deal = Deal::create(array_merge($validated, [
            'company_id' => $companyId,
            'assigned_to' => $request->user()->id,
            'currency' => 'NGN',
        ]));

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'CRM',
            'action' => 'created_deal',
            'details' => "Created deal '{$deal->title}' with value ₦" . number_format($deal->deal_value, 2),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Deal created successfully',
            'data' => $deal->load(['customerAccount', 'assignedUser']),
        ], 201);
    }

    public function updateDealStage(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $deal = Deal::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'pipeline_stage' => 'required|in:lead,qualification,proposal,negotiation,closed_won,closed_lost',
            'lost_reason' => 'nullable|string',
        ]);

        $prevStage = $deal->pipeline_stage;
        $newStage = $request->pipeline_stage;

        $probability = match ($newStage) {
            'lead' => 20,
            'qualification' => 40,
            'proposal' => 60,
            'negotiation' => 80,
            'closed_won' => 100,
            'closed_lost' => 0,
            default => 50,
        };

        $deal->update([
            'pipeline_stage' => $newStage,
            'probability_percent' => $probability,
            'lost_reason' => $request->lost_reason,
        ]);

        if ($newStage === 'closed_won' && $deal->customer_account_id) {
            // Update customer lifetime revenue
            $acc = CustomerAccount::find($deal->customer_account_id);
            if ($acc) {
                $acc->increment('lifetime_revenue', $deal->deal_value);
            }
        }

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'CRM',
            'action' => 'deal_stage_changed',
            'details' => "Deal '{$deal->title}' moved from {$prevStage} to {$newStage}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Deal moved to {$newStage}",
            'data' => $deal->load(['customerAccount', 'assignedUser']),
        ]);
    }

    // -------------------------------------------------------------
    // PRODUCTS & SERVICES
    // -------------------------------------------------------------
    public function getProducts(Request $request)
    {
        $companyId = $request->user()->company_id;
        $products = Product::where('company_id', $companyId)->get();

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function storeProduct(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:products,sku',
            'category' => 'required|string',
            'type' => 'required|in:product,service',
            'unit_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $product = Product::create(array_merge($validated, [
            'company_id' => $companyId,
            'tax_rate' => 7.50, // Nigerian 7.5% VAT
            'status' => 'in_stock',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Product saved to catalog',
            'data' => $product,
        ], 201);
    }

    // -------------------------------------------------------------
    // QUOTATIONS
    // -------------------------------------------------------------
    public function getQuotations(Request $request)
    {
        $companyId = $request->user()->company_id;
        $quotes = Quotation::with('customerAccount')
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $quotes]);
    }

    public function storeQuotation(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'customer_account_id' => 'required|exists:customer_accounts,id',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date',
            'items' => 'required|array',
            'terms_and_conditions' => 'nullable|string',
        ]);

        $subtotal = $validated['subtotal'];
        $discount = $validated['discount_amount'] ?? 0;
        $tax = round(($subtotal - $discount) * 0.075, 2); // 7.5% VAT
        $grandTotal = ($subtotal - $discount) + $tax;

        $qNumber = 'QT-' . date('Y') . '-' . str_pad(Quotation::where('company_id', $companyId)->count() + 1, 3, '0', STR_PAD_LEFT);

        $quotation = Quotation::create([
            'company_id' => $companyId,
            'customer_account_id' => $validated['customer_account_id'],
            'quotation_number' => $qNumber,
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'grand_total' => $grandTotal,
            'status' => 'sent',
            'valid_until' => $validated['valid_until'] ?? Carbon::now()->addDays(30)->toDateString(),
            'terms_and_conditions' => $validated['terms_and_conditions'] ?? 'Standard payment terms apply.',
            'items' => $validated['items'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quotation generated successfully',
            'data' => $quotation->load('customerAccount'),
        ], 201);
    }

    // -------------------------------------------------------------
    // INVOICES & PAYMENTS (PAYSTACK / FLUTTERWAVE READY)
    // -------------------------------------------------------------
    public function getInvoices(Request $request)
    {
        $companyId = $request->user()->company_id;
        $invoices = Invoice::with('customerAccount')
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $invoices]);
    }

    public function recordPayment(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_gateway' => 'required|in:paystack,flutterwave,bank_transfer,cash',
            'reference' => 'nullable|string',
        ]);

        $newPaid = $invoice->paid_amount + $request->amount;
        $status = $newPaid >= $invoice->total_amount ? 'paid' : 'partially_paid';

        $invoice->update([
            'paid_amount' => $newPaid,
            'payment_status' => $status,
            'payment_gateway' => $request->payment_gateway,
            'payment_reference' => $request->reference ?? ('REF-' . strtoupper(bin2hex(random_bytes(4)))),
        ]);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'FINANCE',
            'action' => 'recorded_invoice_payment',
            'details' => "Payment of ₦" . number_format($request->amount, 2) . " logged on invoice {$invoice->invoice_number} via {$request->payment_gateway}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $invoice,
        ]);
    }

    // -------------------------------------------------------------
    // CRM TASKS & SUPPORT TICKETS & CAMPAIGNS
    // -------------------------------------------------------------
    public function getTasks(Request $request)
    {
        $companyId = $request->user()->company_id;
        $tasks = CrmTask::with('assignedUser')
            ->where('company_id', $companyId)
            ->orderBy('due_date')
            ->get();

        return response()->json(['success' => true, 'data' => $tasks]);
    }

    public function storeTask(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'title' => 'required|string',
            'type' => 'required|string',
            'due_date' => 'required|date',
            'priority' => 'required|string',
            'related_type' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $task = CrmTask::create(array_merge($validated, [
            'company_id' => $companyId,
            'assigned_to' => $request->user()->id,
            'status' => 'pending',
        ]));

        return response()->json(['success' => true, 'data' => $task], 201);
    }

    public function getSupportTickets(Request $request)
    {
        $companyId = $request->user()->company_id;
        $tickets = SupportTicket::with(['customerAccount', 'assignedUser'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    public function replySupportTicket(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $ticket = SupportTicket::where('company_id', $companyId)->findOrFail($id);

        $request->validate(['message' => 'required|string']);

        $messages = $ticket->messages ?? [];
        $messages[] = [
            'sender' => 'support',
            'name' => $request->user()->name,
            'time' => Carbon::now()->format('h:i A'),
            'text' => $request->message,
        ];

        $ticket->update([
            'messages' => $messages,
            'status' => 'in_progress',
        ]);

        return response()->json(['success' => true, 'data' => $ticket]);
    }

    public function getCampaigns(Request $request)
    {
        $companyId = $request->user()->company_id;
        $campaigns = CrmCampaign::where('company_id', $companyId)->get();

        return response()->json(['success' => true, 'data' => $campaigns]);
    }
}
