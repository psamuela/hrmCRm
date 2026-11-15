<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 3.8 Audit Logs & Security
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->default('System');
            $table->string('module'); // HRM, CRM, CORE, FINANCE, AUTH
            $table->string('action'); // created_employee, clock_in, approve_leave, won_deal, etc.
            $table->text('details');
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });

        // 3.4 In-App Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, success, warning, urgent
            $table->string('module')->default('system'); // hrm, crm, system
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 4.3 Advanced Business Workflows & Automation
        Schema::create('workflow_automations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('trigger_event'); // on_new_lead, on_deal_won, on_leave_submitted, on_invoice_overdue
            $table->string('action_type'); // send_email, assign_rep, create_task, send_whatsapp_alert
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('execution_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_automations');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
    }
};
