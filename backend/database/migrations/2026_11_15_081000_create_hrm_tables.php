<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1.1 Employees
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('gender')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('designation');
            $table->string('employment_type')->default('full-time'); // full-time, part-time, contract, intern
            $table->string('employment_status')->default('active'); // active, on_leave, terminated, resigned
            $table->date('joining_date');
            $table->decimal('basic_salary', 14, 2)->default(0);
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('tax_bvn_number')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_relationship')->nullable();
            $table->foreignId('reporting_manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('avatar_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 1.3 Attendance
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->string('status')->default('present'); // present, late, half_day, absent, on_leave
            $table->string('work_mode')->default('office'); // office, remote
            $table->decimal('working_hours', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('ip_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 1.4 Leaves
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type'); // annual, sick, casual, maternity, paternity, unpaid, study
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('days_count')->default(1);
            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 1.5 Payroll
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('month');
            $table->integer('year');
            $table->string('payslip_number')->unique();
            $table->decimal('basic_salary', 14, 2);
            $table->decimal('housing_allowance', 14, 2)->default(0);
            $table->decimal('transport_allowance', 14, 2)->default(0);
            $table->decimal('other_allowances', 14, 2)->default(0);
            $table->decimal('bonuses', 14, 2)->default(0);
            $table->decimal('gross_salary', 14, 2);
            $table->decimal('tax_paye', 14, 2)->default(0); // Nigerian PAYE
            $table->decimal('pension_employee', 14, 2)->default(0); // 8%
            $table->decimal('pension_employer', 14, 2)->default(0); // 10%
            $table->decimal('nhf_deduction', 14, 2)->default(0); // 2.5% NHF
            $table->decimal('other_deductions', 14, 2)->default(0);
            $table->decimal('net_salary', 14, 2);
            $table->string('payment_status')->default('draft'); // draft, pending_approval, approved, paid
            $table->string('payment_method')->default('bank_transfer'); // bank_transfer, paystack, flutterwave
            $table->date('payment_date')->nullable();
            $table->timestamps();
        });

        // 1.2 Recruitment / ATS
        Schema::create('job_openings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('employment_type')->default('full-time');
            $table->string('location')->default('Headquarters / Hybrid');
            $table->string('salary_range')->nullable();
            $table->integer('positions_count')->default(1);
            $table->date('closing_date')->nullable();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->string('status')->default('open'); // open, interviewing, closed, on_hold
            $table->timestamps();
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_opening_id')->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('stage')->default('applied'); // applied, screening, interview, assessment, offer, hired, rejected
            $table->integer('rating')->default(3); // 1-5
            $table->integer('ai_match_score')->default(85); // 0-100%
            $table->text('ai_summary')->nullable();
            $table->string('resume_url')->nullable();
            $table->dateTime('interview_scheduled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 1.6 Performance Reviews
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('review_period'); // Q3 2026, Annual 2026
            $table->decimal('kpi_score', 4, 1)->default(4.0); // 1.0 - 5.0
            $table->decimal('goals_achievement', 4, 1)->default(4.2);
            $table->decimal('overall_score', 4, 1)->default(4.1);
            $table->text('manager_feedback')->nullable();
            $table->text('employee_self_assessment')->nullable();
            $table->boolean('promotion_recommendation')->default(false);
            $table->string('status')->default('completed'); // draft, submitted, completed
            $table->timestamps();
        });

        // 1.9 Expenses
        Schema::create('expense_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category')->default('transport'); // travel, food, transport, equipment, software, other
            $table->decimal('amount', 14, 2);
            $table->string('currency')->default('NGN');
            $table->date('date');
            $table->string('receipt_url')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, reimbursed
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 1.7 Trainings
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('trainer')->nullable();
            $table->string('type')->default('internal'); // internal, external, online_lms
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('capacity')->default(20);
            $table->integer('enrolled_count')->default(0);
            $table->string('status')->default('upcoming'); // upcoming, in_progress, completed
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 1.10 Disciplinary Cases
        Schema::create('disciplinary_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('case_number')->unique();
            $table->string('title');
            $table->string('severity')->default('medium'); // low, medium, high, critical
            $table->date('incident_date');
            $table->text('description')->nullable();
            $table->string('status')->default('reported'); // reported, under_investigation, hearing_scheduled, action_taken, closed
            $table->string('action_taken')->nullable(); // verbal_warning, written_warning, suspension, dismissal, exonerated
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplinary_cases');
        Schema::dropIfExists('trainings');
        Schema::dropIfExists('expense_claims');
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('job_openings');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('employees');
    }
};
