<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Models\WorkflowAutomation;
use Illuminate\Http\Request;

class SharedController extends Controller
{
    public function getCompanies(Request $request)
    {
        $companies = Company::with('branches')->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    public function updateSubscriptionPlan(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:hrm_only,crm_only,enterprise',
        ]);

        $company = Company::findOrFail($request->user()->company_id);
        $company->update(['plan' => $request->plan]);

        AuditLog::create([
            'company_id' => $company->id,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'SECURITY',
            'action' => 'updated_subscription_plan',
            'details' => "Company plan changed to: {$request->plan}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Subscription package updated to " . strtoupper(str_replace('_', ' ', $request->plan)),
            'data' => $company,
        ]);
    }

    public function getDepartments(Request $request)
    {
        $companyId = $request->user()->company_id;
        $departments = Department::where('company_id', $companyId)->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    public function getNotifications(Request $request)
    {
        $companyId = $request->user()->company_id;
        $notifications = Notification::where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function markNotificationRead(Request $request, $id)
    {
        $notif = Notification::where('company_id', $request->user()->company_id)->findOrFail($id);
        $notif->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function getAuditLogs(Request $request)
    {
        $companyId = $request->user()->company_id;
        $logs = AuditLog::where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->take(50)
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }

    public function getAutomations(Request $request)
    {
        $companyId = $request->user()->company_id;
        $automations = WorkflowAutomation::where('company_id', $companyId)->get();

        return response()->json(['success' => true, 'data' => $automations]);
    }

    public function toggleAutomation(Request $request, $id)
    {
        $auto = WorkflowAutomation::where('company_id', $request->user()->company_id)->findOrFail($id);
        $auto->update(['is_active' => !$auto->is_active]);

        return response()->json([
            'success' => true,
            'message' => "Automation " . ($auto->is_active ? 'activated' : 'paused'),
            'data' => $auto,
        ]);
    }
}
