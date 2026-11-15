<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 2.3 Company / Account Management
        Schema::create('customer_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('account_code')->unique();
            $table->string('industry')->nullable();
            $table->string('type')->default('corporate'); // corporate, individual
            $table->string('tier')->default('growth'); // starter, growth, enterprise, vip
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('billing_address')->nullable();
            $table->decimal('lifetime_revenue', 14, 2)->default(0);
            $table->string('status')->default('active'); // active, inactive, churn_risk
            $table->timestamps();
        });

        // 2.2 Contacts
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2.1 Lead Management
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('company_name')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('source')->default('website'); // website, social_media, referral, whatsapp, cold_outreach, event
            $table->string('status')->default('new'); // new, contacted, qualified, proposal, negotiation, converted, lost
            $table->integer('lead_score')->default(50); // 0-100
            $table->decimal('estimated_value', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('lost_reason')->nullable();
            $table->timestamps();
        });

        // 2.4 Sales Pipeline / Deals
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('pipeline_stage')->default('lead'); // lead, qualification, proposal, negotiation, closed_won, closed_lost
            $table->decimal('deal_value', 14, 2);
            $table->string('currency')->default('NGN');
            $table->integer('probability_percent')->default(50);
            $table->date('expected_closing_date')->nullable();
            $table->string('lost_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2.7 Products & Services
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('category')->default('Software');
            $table->string('type')->default('service'); // product, service
            $table->decimal('unit_price', 14, 2);
            $table->decimal('cost_price', 14, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(7.50); // Nigerian VAT 7.5%
            $table->integer('stock_quantity')->default(100);
            $table->string('status')->default('in_stock'); // in_stock, low_stock, out_of_stock
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2.8 Quotations
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deal_id')->nullable()->constrained()->nullOnDelete();
            $table->string('quotation_number')->unique();
            $table->decimal('subtotal', 14, 2);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('discount_amount', 14, 2)->default(0);
            $table->decimal('grand_total', 14, 2);
            $table->string('status')->default('draft'); // draft, sent, accepted, rejected, converted
            $table->date('valid_until')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->json('items')->nullable();
            $table->timestamps();
        });

        // 2.10 Invoices & Payments
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quotation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 14, 2);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total_amount', 14, 2);
            $table->decimal('paid_amount', 14, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // unpaid, partially_paid, paid, overdue
            $table->string('payment_gateway')->default('bank_transfer'); // paystack, flutterwave, bank_transfer, cash
            $table->string('payment_reference')->nullable();
            $table->json('items')->nullable();
            $table->timestamps();
        });

        // 2.11 Activities & Tasks
        Schema::create('crm_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('related_type')->default('deal'); // lead, deal, customer, general
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('title');
            $table->string('type')->default('follow_up'); // call, email, meeting, follow_up, demo
            $table->dateTime('due_date');
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('status')->default('pending'); // pending, in_progress, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2.15 Customer Support & Helpdesk
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ticket_number')->unique();
            $table->string('subject');
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->string('status')->default('open'); // open, in_progress, waiting_on_client, resolved, closed
            $table->string('category')->default('technical'); // technical, billing, feature_request, onboarding
            $table->dateTime('sla_deadline')->nullable();
            $table->integer('customer_rating')->nullable();
            $table->text('description')->nullable();
            $table->json('messages')->nullable();
            $table->timestamps();
        });

        // 2.13 & 2.14 Email, SMS & WhatsApp Campaigns
        Schema::create('crm_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('channel')->default('email'); // email, sms, whatsapp
            $table->string('target_segment')->default('all_leads');
            $table->string('status')->default('completed'); // draft, scheduled, sending, completed
            $table->integer('recipients_count')->default(100);
            $table->integer('sent_count')->default(100);
            $table->decimal('open_rate', 4, 1)->default(48.5);
            $table->decimal('click_rate', 4, 1)->default(14.2);
            $table->text('message_body')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_campaigns');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('crm_tasks');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('quotations');
        Schema::dropIfExists('products');
        Schema::dropIfExists('deals');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('customer_accounts');
    }
};
