<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\JobOpening;
use App\Models\Candidate;
use App\Models\PerformanceReview;
use App\Models\ExpenseClaim;
use App\Models\Training;
use App\Models\DisciplinaryCase;
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
use App\Models\Notification;
use App\Models\WorkflowAutomation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Primary Company
        $company = Company::create([
            'name' => 'Innowise Africa Technologies Ltd',
            'code' => 'INNO-AFRICA',
            'currency' => 'NGN',
            'currency_symbol' => '₦',
            'tax_id' => 'TIN-98745612-0001',
            'plan' => 'enterprise', // Complete HRM + CRM
            'email' => 'contact@innowise-africa.com',
            'phone' => '+234 803 123 4567',
            'address' => 'Plot 14B, Victoria Island',
            'city' => 'Lagos',
            'country' => 'Nigeria',
            'logo_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
            'settings' => [
                'timezone' => 'Africa/Lagos',
                'fiscal_year_start' => 'January',
                'pension_rate_employee' => 8.0,
                'pension_rate_employer' => 10.0,
                'nhf_rate' => 2.5,
                'vat_rate' => 7.5,
                'paystack_enabled' => true,
                'flutterwave_enabled' => true,
                'auto_lead_assignment' => true,
            ]
        ]);

        $secondaryCompany = Company::create([
            'name' => 'Opedia Retail Solutions',
            'code' => 'OPEDIA-RETAIL',
            'currency' => 'USD',
            'currency_symbol' => '$',
            'tax_id' => 'TIN-11223344-0002',
            'plan' => 'crm_only',
            'email' => 'sales@opediaretail.com',
            'phone' => '+234 812 999 8877',
            'address' => 'Central Business District',
            'city' => 'Abuja',
            'country' => 'Nigeria',
        ]);

        // 2. Branches
        $branchLagos = Branch::create([
            'company_id' => $company->id,
            'name' => 'Lagos Head Office',
            'code' => 'LOS-HQ',
            'city' => 'Lagos',
            'address' => '14B Victoria Island, Lagos',
            'is_headquarters' => true,
        ]);

        $branchAbuja = Branch::create([
            'company_id' => $company->id,
            'name' => 'Abuja Regional Branch',
            'code' => 'ABJ-01',
            'city' => 'Abuja',
            'address' => 'Constitution Avenue, Central Area, Abuja',
            'is_headquarters' => false,
        ]);

        // 3. Departments
        $deptEng = Department::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'name' => 'Engineering & Technology',
            'code' => 'ENG',
            'manager_name' => 'Femi Adebayo',
            'description' => 'Software engineering, cloud infrastructure, and security',
        ]);

        $deptHR = Department::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'name' => 'Human Resources & People',
            'code' => 'HRM',
            'manager_name' => 'Chidi Okeke',
            'description' => 'Talent acquisition, payroll, employee welfare and training',
        ]);

        $deptSales = Department::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'name' => 'Sales & Business Development',
            'code' => 'SBD',
            'manager_name' => 'Amaka Nwosu',
            'description' => 'Enterprise sales, lead generation, customer success and CRM operations',
        ]);

        $deptFinance = Department::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'name' => 'Finance & Accounts',
            'code' => 'FIN',
            'manager_name' => 'Babatunde Adeleke',
            'description' => 'Financial reporting, invoicing, audit, and tax compliance',
        ]);

        // 4. Users (Role-Based Access Control)
        $superAdmin = User::create([
            'name' => 'Oluwaseun Balogun',
            'email' => 'admin@innowise.com',
            'password' => Hash::make('password123'),
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'role' => 'super_admin',
            'phone' => '+234 802 111 2233',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $hrUser = User::create([
            'name' => 'Chidi Okeke',
            'email' => 'chidi.hrm@innowise.com',
            'password' => Hash::make('password123'),
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'role' => 'hr_manager',
            'phone' => '+234 803 222 3344',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $salesUser = User::create([
            'name' => 'Amaka Nwosu',
            'email' => 'amaka.crm@innowise.com',
            'password' => Hash::make('password123'),
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'role' => 'sales_manager',
            'phone' => '+234 805 333 4455',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $employeeUser = User::create([
            'name' => 'Femi Adebayo',
            'email' => 'femi.engineer@innowise.com',
            'password' => Hash::make('password123'),
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'role' => 'employee',
            'phone' => '+234 807 444 5566',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $salesRepUser = User::create([
            'name' => 'Ibrahim Musa',
            'email' => 'ibrahim.sales@innowise.com',
            'password' => Hash::make('password123'),
            'company_id' => $company->id,
            'branch_id' => $branchAbuja->id,
            'role' => 'sales_rep',
            'phone' => '+234 809 555 6677',
            'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        // 5. Employees
        $empFemi = Employee::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'department_id' => $deptEng->id,
            'user_id' => $employeeUser->id,
            'employee_code' => 'EMP-1001',
            'first_name' => 'Femi',
            'last_name' => 'Adebayo',
            'email' => 'femi.engineer@innowise.com',
            'phone' => '+234 807 444 5566',
            'gender' => 'Male',
            'date_of_birth' => '1992-06-15',
            'designation' => 'Lead Software Architect',
            'employment_type' => 'full-time',
            'employment_status' => 'active',
            'joining_date' => '2021-03-01',
            'basic_salary' => 850000.00,
            'bank_name' => 'Access Bank Plc',
            'bank_account_number' => '0123456789',
            'tax_bvn_number' => '22334455667',
            'emergency_contact_name' => 'Folake Adebayo',
            'emergency_contact_phone' => '+234 802 999 1122',
            'emergency_relationship' => 'Spouse',
            'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        ]);

        $empChidi = Employee::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'department_id' => $deptHR->id,
            'user_id' => $hrUser->id,
            'employee_code' => 'EMP-1002',
            'first_name' => 'Chidi',
            'last_name' => 'Okeke',
            'email' => 'chidi.hrm@innowise.com',
            'phone' => '+234 803 222 3344',
            'gender' => 'Male',
            'date_of_birth' => '1988-11-20',
            'designation' => 'Head of People & HR Operations',
            'employment_type' => 'full-time',
            'employment_status' => 'active',
            'joining_date' => '2020-01-10',
            'basic_salary' => 750000.00,
            'bank_name' => 'GTBank Plc',
            'bank_account_number' => '0246813579',
            'tax_bvn_number' => '22119988776',
            'emergency_contact_name' => 'Ngozi Okeke',
            'emergency_contact_phone' => '+234 803 888 2211',
            'emergency_relationship' => 'Sister',
            'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        ]);

        $empAmaka = Employee::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'department_id' => $deptSales->id,
            'user_id' => $salesUser->id,
            'employee_code' => 'EMP-1003',
            'first_name' => 'Amaka',
            'last_name' => 'Nwosu',
            'email' => 'amaka.crm@innowise.com',
            'phone' => '+234 805 333 4455',
            'gender' => 'Female',
            'date_of_birth' => '1993-04-12',
            'designation' => 'VP of Enterprise Sales',
            'employment_type' => 'full-time',
            'employment_status' => 'active',
            'joining_date' => '2021-08-15',
            'basic_salary' => 800000.00,
            'bank_name' => 'Zenith Bank Plc',
            'bank_account_number' => '1029384756',
            'tax_bvn_number' => '22446688001',
            'emergency_contact_name' => 'Emeka Nwosu',
            'emergency_contact_phone' => '+234 806 777 4433',
            'emergency_relationship' => 'Brother',
            'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        ]);

        $empIbrahim = Employee::create([
            'company_id' => $company->id,
            'branch_id' => $branchAbuja->id,
            'department_id' => $deptSales->id,
            'user_id' => $salesRepUser->id,
            'employee_code' => 'EMP-1004',
            'first_name' => 'Ibrahim',
            'last_name' => 'Musa',
            'email' => 'ibrahim.sales@innowise.com',
            'phone' => '+234 809 555 6677',
            'gender' => 'Male',
            'date_of_birth' => '1995-09-08',
            'designation' => 'Senior CRM Account Executive',
            'employment_type' => 'full-time',
            'employment_status' => 'active',
            'joining_date' => '2022-02-01',
            'basic_salary' => 500000.00,
            'bank_name' => 'First Bank of Nigeria',
            'bank_account_number' => '3019283746',
            'tax_bvn_number' => '22998877665',
            'emergency_contact_name' => 'Amina Musa',
            'emergency_contact_phone' => '+234 808 666 5544',
            'emergency_relationship' => 'Mother',
            'avatar_url' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        ]);

        $empZainab = Employee::create([
            'company_id' => $company->id,
            'branch_id' => $branchLagos->id,
            'department_id' => $deptEng->id,
            'employee_code' => 'EMP-1005',
            'first_name' => 'Zainab',
            'last_name' => 'Danjuma',
            'email' => 'zainab.ui@innowise.com',
            'phone' => '+234 803 777 8899',
            'gender' => 'Female',
            'date_of_birth' => '1996-01-25',
            'designation' => 'Senior UI/UX Product Designer',
            'employment_type' => 'full-time',
            'employment_status' => 'active',
            'joining_date' => '2022-06-01',
            'basic_salary' => 600000.00,
            'bank_name' => 'Stanbic IBTC Bank',
            'bank_account_number' => '0039281726',
            'tax_bvn_number' => '22557799113',
            'emergency_contact_name' => 'Aliyu Danjuma',
            'emergency_contact_phone' => '+234 802 333 9988',
            'emergency_relationship' => 'Father',
            'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        ]);

        // 6. Attendance Records
        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();

        Attendance::create([
            'company_id' => $company->id,
            'employee_id' => $empFemi->id,
            'date' => $today,
            'clock_in' => '08:45:00',
            'clock_out' => null,
            'status' => 'present',
            'work_mode' => 'office',
            'working_hours' => 6.5,
            'overtime_hours' => 0.0,
            'ip_address' => '192.168.1.45',
            'notes' => 'On-time arrival at VI Lagos Office',
        ]);

        Attendance::create([
            'company_id' => $company->id,
            'employee_id' => $empChidi->id,
            'date' => $today,
            'clock_in' => '08:52:00',
            'clock_out' => null,
            'status' => 'present',
            'work_mode' => 'office',
            'working_hours' => 6.2,
            'ip_address' => '192.168.1.12',
        ]);

        Attendance::create([
            'company_id' => $company->id,
            'employee_id' => $empAmaka->id,
            'date' => $today,
            'clock_in' => '09:15:00',
            'clock_out' => null,
            'status' => 'late',
            'work_mode' => 'remote',
            'working_hours' => 5.8,
            'ip_address' => '102.89.44.120',
            'notes' => 'Traffic on Lekki-Epe expressway; switched to remote sync',
        ]);

        Attendance::create([
            'company_id' => $company->id,
            'employee_id' => $empIbrahim->id,
            'date' => $today,
            'clock_in' => '08:30:00',
            'clock_out' => null,
            'status' => 'present',
            'work_mode' => 'office',
            'working_hours' => 6.7,
            'ip_address' => '192.168.2.10',
        ]);

        Attendance::create([
            'company_id' => $company->id,
            'employee_id' => $empZainab->id,
            'date' => $today,
            'clock_in' => null,
            'clock_out' => null,
            'status' => 'on_leave',
            'work_mode' => 'office',
            'working_hours' => 0.0,
            'notes' => 'Approved Annual Leave Day 2',
        ]);

        // 7. Leave Requests
        LeaveRequest::create([
            'company_id' => $company->id,
            'employee_id' => $empZainab->id,
            'leave_type' => 'annual',
            'start_date' => Carbon::now()->subDays(2)->toDateString(),
            'end_date' => Carbon::now()->addDays(3)->toDateString(),
            'days_count' => 5,
            'reason' => 'Annual family vacation to Calabar',
            'status' => 'approved',
            'approved_by' => $hrUser->id,
        ]);

        LeaveRequest::create([
            'company_id' => $company->id,
            'employee_id' => $empFemi->id,
            'leave_type' => 'casual',
            'start_date' => Carbon::now()->addDays(7)->toDateString(),
            'end_date' => Carbon::now()->addDays(8)->toDateString(),
            'days_count' => 2,
            'reason' => 'Personal family engagement and bank documentation',
            'status' => 'pending',
        ]);

        // 8. Payroll (Nigerian Statutory Rules: Basic + Housing + Transport, PAYE, Pension 8% emp / 10% employer, NHF 2.5%)
        Payroll::create([
            'company_id' => $company->id,
            'employee_id' => $empFemi->id,
            'month' => 'November',
            'year' => 2026,
            'payslip_number' => 'PAY-2026-11-001',
            'basic_salary' => 850000.00,
            'housing_allowance' => 250000.00,
            'transport_allowance' => 100000.00,
            'other_allowances' => 50000.00,
            'bonuses' => 100000.00,
            'gross_salary' => 1350000.00,
            'tax_paye' => 198500.00,
            'pension_employee' => 108000.00, // 8%
            'pension_employer' => 135000.00, // 10%
            'nhf_deduction' => 21250.00, // 2.5% of basic
            'other_deductions' => 0.00,
            'net_salary' => 1022250.00,
            'payment_status' => 'paid',
            'payment_method' => 'bank_transfer',
            'payment_date' => Carbon::now()->subDays(5)->toDateString(),
        ]);

        Payroll::create([
            'company_id' => $company->id,
            'employee_id' => $empAmaka->id,
            'month' => 'November',
            'year' => 2026,
            'payslip_number' => 'PAY-2026-11-002',
            'basic_salary' => 800000.00,
            'housing_allowance' => 200000.00,
            'transport_allowance' => 100000.00,
            'other_allowances' => 50000.00,
            'bonuses' => 250000.00, // Sales commission bonus
            'gross_salary' => 1400000.00,
            'tax_paye' => 212000.00,
            'pension_employee' => 112000.00,
            'pension_employer' => 140000.00,
            'nhf_deduction' => 20000.00,
            'other_deductions' => 0.00,
            'net_salary' => 1056000.00,
            'payment_status' => 'approved',
            'payment_method' => 'bank_transfer',
            'payment_date' => null,
        ]);

        Payroll::create([
            'company_id' => $company->id,
            'employee_id' => $empChidi->id,
            'month' => 'November',
            'year' => 2026,
            'payslip_number' => 'PAY-2026-11-003',
            'basic_salary' => 750000.00,
            'housing_allowance' => 200000.00,
            'transport_allowance' => 80000.00,
            'other_allowances' => 30000.00,
            'bonuses' => 0.00,
            'gross_salary' => 1060000.00,
            'tax_paye' => 148500.00,
            'pension_employee' => 84800.00,
            'pension_employer' => 106000.00,
            'nhf_deduction' => 18750.00,
            'other_deductions' => 0.00,
            'net_salary' => 807950.00,
            'payment_status' => 'pending_approval',
            'payment_method' => 'bank_transfer',
        ]);

        // 9. Recruitment / ATS
        $jobDev = JobOpening::create([
            'company_id' => $company->id,
            'department_id' => $deptEng->id,
            'title' => 'Senior Full-Stack Laravel + React Engineer',
            'employment_type' => 'full-time',
            'location' => 'Lagos / Hybrid',
            'salary_range' => '₦800,000 - ₦1,200,000 / month',
            'positions_count' => 2,
            'closing_date' => Carbon::now()->addDays(20)->toDateString(),
            'description' => 'We are seeking an experienced Full-Stack Engineer proficient in Laravel 11/12 REST APIs and modern React/TypeScript to build high-scale enterprise cloud solutions.',
            'requirements' => '5+ years PHP/Laravel, modern React, PostgreSQL/MySQL, automated CI/CD pipelines, Docker experience.',
            'status' => 'open',
        ]);

        $jobSales = JobOpening::create([
            'company_id' => $company->id,
            'department_id' => $deptSales->id,
            'title' => 'B2B Enterprise Account Executive',
            'employment_type' => 'full-time',
            'location' => 'Abuja / Hybrid',
            'salary_range' => '₦600,000 + Attractive Commissions',
            'positions_count' => 1,
            'closing_date' => Carbon::now()->addDays(15)->toDateString(),
            'description' => 'Drive enterprise SaaS software pipeline, engage corporate C-level stakeholders, and close high-value annual contracts.',
            'status' => 'open',
        ]);

        Candidate::create([
            'company_id' => $company->id,
            'job_opening_id' => $jobDev->id,
            'first_name' => 'Olumide',
            'last_name' => 'Bakare',
            'email' => 'olumide.bakare@gmail.com',
            'phone' => '+234 813 111 4455',
            'stage' => 'interview',
            'rating' => 5,
            'ai_match_score' => 96,
            'ai_summary' => 'Strong background in large-scale SaaS architectures. Demonstrated 6 years of production Laravel + React experience with high test coverage.',
            'interview_scheduled_at' => Carbon::now()->addDays(2)->setTime(14, 0),
            'notes' => 'Passed technical take-home test with 98% score.',
        ]);

        Candidate::create([
            'company_id' => $company->id,
            'job_opening_id' => $jobDev->id,
            'first_name' => 'Chioma',
            'last_name' => 'Eze',
            'email' => 'chioma.eze@yahoo.com',
            'phone' => '+234 802 444 7788',
            'stage' => 'offer',
            'rating' => 5,
            'ai_match_score' => 92,
            'ai_summary' => 'Exceptional frontend performance knowledge, Next.js / React micro-frontends, clean UI component design.',
            'notes' => 'Offer letter sent on Nov 12, awaiting candidate signature.',
        ]);

        Candidate::create([
            'company_id' => $company->id,
            'job_opening_id' => $jobSales->id,
            'first_name' => 'Tari',
            'last_name' => 'Alagoa',
            'email' => 'tari.alagoa@outlook.com',
            'phone' => '+234 809 333 1122',
            'stage' => 'screening',
            'rating' => 4,
            'ai_match_score' => 84,
            'ai_summary' => '4 years B2B selling FinTech solutions in Nigeria, extensive network of enterprise bank executives.',
        ]);

        // 10. Performance Reviews
        PerformanceReview::create([
            'company_id' => $company->id,
            'employee_id' => $empFemi->id,
            'reviewer_id' => $superAdmin->id,
            'review_period' => 'Q3 2026',
            'kpi_score' => 4.8,
            'goals_achievement' => 4.9,
            'overall_score' => 4.8,
            'manager_feedback' => 'Femi has consistently delivered top-tier architectural excellence, successfully spearheading our cloud migration with zero downtime.',
            'employee_self_assessment' => 'Achieved all Q3 sprint milestones ahead of schedule and mentored 3 junior engineers.',
            'promotion_recommendation' => true,
            'status' => 'completed',
        ]);

        // 11. Expense Claims
        ExpenseClaim::create([
            'company_id' => $company->id,
            'employee_id' => $empAmaka->id,
            'title' => 'Executive Client Dinner - Dangote Group Deal',
            'category' => 'food',
            'amount' => 145000.00,
            'currency' => 'NGN',
            'date' => Carbon::now()->subDays(4)->toDateString(),
            'description' => 'Strategy meeting with VP of Procurement and Technical Leads at Eko Hotels.',
            'status' => 'approved',
            'approved_by' => $superAdmin->id,
        ]);

        ExpenseClaim::create([
            'company_id' => $company->id,
            'employee_id' => $empIbrahim->id,
            'title' => 'Abuja Flight & Airport Taxi for Ministry Presentation',
            'category' => 'travel',
            'amount' => 195000.00,
            'currency' => 'NGN',
            'date' => Carbon::now()->subDays(2)->toDateString(),
            'description' => 'Return flight Air Peace LOS-ABV and taxi for RFP demonstration.',
            'status' => 'pending',
        ]);

        // 12. Trainings
        Training::create([
            'company_id' => $company->id,
            'title' => 'Modern Enterprise Architecture & Scalable Microservices',
            'trainer' => 'Dr. Andrew Martins (AWS Certified Principal)',
            'type' => 'internal',
            'start_date' => Carbon::now()->addDays(5)->toDateString(),
            'end_date' => Carbon::now()->addDays(7)->toDateString(),
            'capacity' => 25,
            'enrolled_count' => 18,
            'status' => 'upcoming',
            'description' => 'Hands-on intensive workshop on event-driven architecture, caching strategies, and SOC-2 compliance.',
        ]);

        // 13. Disciplinary Cases
        DisciplinaryCase::create([
            'company_id' => $company->id,
            'employee_id' => $empIbrahim->id,
            'case_number' => 'DISC-2026-004',
            'title' => 'Delayed Submission of Client Security Clearance Form',
            'severity' => 'low',
            'incident_date' => Carbon::now()->subDays(10)->toDateString(),
            'description' => 'Notice given regarding delayed NDA documentation submission. Issue resolved with written advisory.',
            'status' => 'closed',
            'action_taken' => 'verbal_warning',
        ]);

        // -------------------------------------------------------------
        // CRM SEED DATA
        // -------------------------------------------------------------

        // 14. Customer Accounts
        $accDangote = CustomerAccount::create([
            'company_id' => $company->id,
            'account_manager_id' => $salesUser->id,
            'name' => 'Dangote Group Conglomerate',
            'account_code' => 'ACC-DANGOTE',
            'industry' => 'Manufacturing & Logistics',
            'type' => 'corporate',
            'tier' => 'enterprise',
            'email' => 'enterprise-it@dangote.com',
            'phone' => '+234 1 271 2222',
            'website' => 'https://dangote.com',
            'billing_address' => 'Union Marble House, Falomo, Ikoyi, Lagos',
            'lifetime_revenue' => 45000000.00,
            'status' => 'active',
        ]);

        $accZenith = CustomerAccount::create([
            'company_id' => $company->id,
            'account_manager_id' => $salesUser->id,
            'name' => 'Zenith FinTech Labs',
            'account_code' => 'ACC-ZENITH',
            'industry' => 'Financial Services / Banking',
            'type' => 'corporate',
            'tier' => 'vip',
            'email' => 'innovations@zenithbank.com',
            'phone' => '+234 1 464 5000',
            'website' => 'https://zenithbank.com',
            'billing_address' => 'Plot 84, Ajose Adeogun, Victoria Island, Lagos',
            'lifetime_revenue' => 28000000.00,
            'status' => 'active',
        ]);

        $accPaystack = CustomerAccount::create([
            'company_id' => $company->id,
            'account_manager_id' => $salesRepUser->id,
            'name' => 'Paystack Merchant Fleet',
            'account_code' => 'ACC-PAYSTACK',
            'industry' => 'Payments & E-Commerce',
            'type' => 'corporate',
            'tier' => 'growth',
            'email' => 'partnerships@paystack.com',
            'phone' => '+234 1 631 6160',
            'website' => 'https://paystack.com',
            'billing_address' => '126 Joel Ogunnaike St, Ikeja GRA, Lagos',
            'lifetime_revenue' => 12500000.00,
            'status' => 'active',
        ]);

        // 15. Contacts
        Contact::create([
            'company_id' => $company->id,
            'customer_account_id' => $accDangote->id,
            'name' => 'Engr. Tajudeen Sanni',
            'title' => 'Chief Technology Officer',
            'email' => 't.sanni@dangote.com',
            'phone' => '+234 802 888 1234',
            'is_primary' => true,
            'notes' => 'Key decision maker for nationwide logistics and ERP rollouts.',
        ]);

        Contact::create([
            'company_id' => $company->id,
            'customer_account_id' => $accZenith->id,
            'name' => 'Kemi Williams',
            'title' => 'Head of Digital Banking Products',
            'email' => 'kemi.williams@zenithbank.com',
            'phone' => '+234 803 777 5678',
            'is_primary' => true,
            'notes' => 'Champion for API-driven customer onboarding solutions.',
        ]);

        // 16. Leads
        Lead::create([
            'company_id' => $company->id,
            'assigned_to' => $salesUser->id,
            'first_name' => 'Alhaji Mansur',
            'last_name' => 'Gwandu',
            'company_name' => 'Northern Energy Distribution Ltd',
            'email' => 'm.gwandu@northernenergy.ng',
            'phone' => '+234 803 666 9988',
            'source' => 'referral',
            'status' => 'negotiation',
            'lead_score' => 92,
            'estimated_value' => 18500000.00,
            'notes' => 'Needs unified HRM for 450 field engineers and CRM to manage utility corporate billing.',
        ]);

        Lead::create([
            'company_id' => $company->id,
            'assigned_to' => $salesRepUser->id,
            'first_name' => 'Somi',
            'last_name' => 'Nnoli',
            'company_name' => 'Apex Healthcare HMO',
            'email' => 'somi@apexhealth.ng',
            'phone' => '+234 812 555 4321',
            'source' => 'website',
            'status' => 'qualified',
            'lead_score' => 85,
            'estimated_value' => 8200000.00,
            'notes' => 'Requested demo via pricing calculator on website.',
        ]);

        Lead::create([
            'company_id' => $company->id,
            'assigned_to' => $salesRepUser->id,
            'first_name' => 'Adeola',
            'last_name' => 'Kuti',
            'company_name' => 'Kuti & Partners Legal Chambers',
            'email' => 'adeola@kutipartners.com',
            'phone' => '+234 805 111 8899',
            'source' => 'whatsapp',
            'status' => 'new',
            'lead_score' => 64,
            'estimated_value' => 3500000.00,
            'notes' => 'WhatsApp inquiry regarding payroll compliance & retainer billing.',
        ]);

        // 17. Deals (Pipeline Stages: lead -> qualification -> proposal -> negotiation -> closed_won -> closed_lost)
        Deal::create([
            'company_id' => $company->id,
            'customer_account_id' => $accDangote->id,
            'assigned_to' => $salesUser->id,
            'title' => 'Dangote Nationwide HRM & Automated Payroll SLA',
            'pipeline_stage' => 'negotiation',
            'deal_value' => 24000000.00,
            'currency' => 'NGN',
            'probability_percent' => 85,
            'expected_closing_date' => Carbon::now()->addDays(14)->toDateString(),
            'notes' => 'Draft contract shared with legal team. Awaiting board sign-off.',
        ]);

        Deal::create([
            'company_id' => $company->id,
            'customer_account_id' => $accZenith->id,
            'assigned_to' => $salesUser->id,
            'title' => 'Zenith CRM Enterprise Sales & Ticket Helpdesk License',
            'pipeline_stage' => 'closed_won',
            'deal_value' => 15000000.00,
            'currency' => 'NGN',
            'probability_percent' => 100,
            'expected_closing_date' => Carbon::now()->subDays(3)->toDateString(),
            'notes' => 'Deal closed! 1-year prepaid contract signed with Paystack integration.',
        ]);

        Deal::create([
            'company_id' => $company->id,
            'customer_account_id' => $accPaystack->id,
            'assigned_to' => $salesRepUser->id,
            'title' => 'Merchant Support Multi-Channel WhatsApp Ticketing',
            'pipeline_stage' => 'proposal',
            'deal_value' => 6500000.00,
            'currency' => 'NGN',
            'probability_percent' => 65,
            'expected_closing_date' => Carbon::now()->addDays(25)->toDateString(),
            'notes' => 'Quotation QT-2026-081 delivered to procurement.',
        ]);

        Deal::create([
            'company_id' => $company->id,
            'assigned_to' => $salesRepUser->id,
            'title' => 'Lekki Free Zone Manufacturing ERP Integration',
            'pipeline_stage' => 'qualification',
            'deal_value' => 9800000.00,
            'currency' => 'NGN',
            'probability_percent' => 40,
            'expected_closing_date' => Carbon::now()->addDays(40)->toDateString(),
        ]);

        // 18. Products & Services Catalog
        $prodEnterprise = Product::create([
            'company_id' => $company->id,
            'name' => 'Enterprise HRM + CRM Unified Cloud License',
            'sku' => 'LIC-UNIFIED-ENT',
            'category' => 'Cloud Software',
            'type' => 'service',
            'unit_price' => 1500000.00,
            'cost_price' => 250000.00,
            'tax_rate' => 7.5,
            'stock_quantity' => 999,
            'status' => 'in_stock',
            'description' => 'Unlimited users, full employee portal, payroll generator, sales CRM kanban, biometric API.',
        ]);

        $prodBiometric = Product::create([
            'company_id' => $company->id,
            'name' => 'ZKTeco AI Facial & Biometric Terminal (Hardware)',
            'sku' => 'HW-ZK-FACE-01',
            'category' => 'Hardware Device',
            'type' => 'product',
            'unit_price' => 280000.00,
            'cost_price' => 180000.00,
            'tax_rate' => 7.5,
            'stock_quantity' => 45,
            'status' => 'in_stock',
            'description' => 'Dual optical cameras with live anti-spoofing facial recognition and fingerprint sensor with LAN/WiFi sync.',
        ]);

        $prodWhatsApp = Product::create([
            'company_id' => $company->id,
            'name' => 'WhatsApp Business Cloud API Connect Pack',
            'sku' => 'SVC-WA-API',
            'category' => 'Addon Integration',
            'type' => 'service',
            'unit_price' => 450000.00,
            'cost_price' => 80000.00,
            'tax_rate' => 7.5,
            'stock_quantity' => 999,
            'status' => 'in_stock',
            'description' => 'Official Meta verified business gateway for CRM automated notifications, leads, and customer service.',
        ]);

        // 19. Quotations
        Quotation::create([
            'company_id' => $company->id,
            'customer_account_id' => $accPaystack->id,
            'quotation_number' => 'QT-2026-081',
            'subtotal' => 6000000.00,
            'tax_amount' => 450000.00,
            'discount_amount' => 250000.00,
            'grand_total' => 6200000.00,
            'status' => 'sent',
            'valid_until' => Carbon::now()->addDays(30)->toDateString(),
            'terms_and_conditions' => 'Payment terms: 50% on signature, 50% on deployment. 12-month SLA warranty included.',
            'items' => [
                ['name' => 'Enterprise HRM + CRM Unified Cloud License', 'qty' => 3, 'unit_price' => 1500000, 'total' => 4500000],
                ['name' => 'WhatsApp Business Cloud API Connect Pack', 'qty' => 2, 'unit_price' => 450000, 'total' => 900000],
                ['name' => 'Custom Nigerian Payroll & Tax Rule Tuning', 'qty' => 1, 'unit_price' => 600000, 'total' => 600000],
            ],
        ]);

        // 20. Invoices & Payments
        Invoice::create([
            'company_id' => $company->id,
            'customer_account_id' => $accZenith->id,
            'invoice_number' => 'INV-2026-042',
            'issue_date' => Carbon::now()->subDays(10)->toDateString(),
            'due_date' => Carbon::now()->addDays(20)->toDateString(),
            'subtotal' => 14000000.00,
            'tax_amount' => 1050000.00,
            'total_amount' => 15050000.00,
            'paid_amount' => 15050000.00,
            'payment_status' => 'paid',
            'payment_gateway' => 'paystack',
            'payment_reference' => 'PSTK_TX_99812481923',
            'items' => [
                ['name' => 'Enterprise CRM Platform License (Annual)', 'qty' => 1, 'price' => 12500000],
                ['name' => 'Dedicated Customer Success Support SLA', 'qty' => 1, 'price' => 1500000],
            ],
        ]);

        Invoice::create([
            'company_id' => $company->id,
            'customer_account_id' => $accDangote->id,
            'invoice_number' => 'INV-2026-043',
            'issue_date' => Carbon::now()->subDays(5)->toDateString(),
            'due_date' => Carbon::now()->addDays(25)->toDateString(),
            'subtotal' => 8000000.00,
            'tax_amount' => 600000.00,
            'total_amount' => 8600000.00,
            'paid_amount' => 4300000.00, // Partial payment
            'payment_status' => 'partially_paid',
            'payment_gateway' => 'bank_transfer',
            'payment_reference' => 'NIP_ZEN_TRF_887192',
            'items' => [
                ['name' => 'Phase 1 Core HRM Deployment & Biometrics', 'qty' => 1, 'price' => 8000000],
            ],
        ]);

        // 21. CRM Tasks
        CrmTask::create([
            'company_id' => $company->id,
            'assigned_to' => $salesUser->id,
            'related_type' => 'deal',
            'related_id' => 1,
            'title' => 'Present Revised SLA to Dangote Legal Counsel',
            'type' => 'meeting',
            'due_date' => Carbon::now()->addDay()->setTime(11, 0),
            'priority' => 'high',
            'status' => 'pending',
            'notes' => 'Ensure clause 4.2 data residency complies with NDPR requirements.',
        ]);

        CrmTask::create([
            'company_id' => $company->id,
            'assigned_to' => $salesRepUser->id,
            'related_type' => 'lead',
            'related_id' => 2,
            'title' => 'Follow up Somi at Apex Healthcare HMO on quote',
            'type' => 'call',
            'due_date' => Carbon::now()->addDays(2)->setTime(15, 30),
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // 22. Support Tickets
        SupportTicket::create([
            'company_id' => $company->id,
            'customer_account_id' => $accZenith->id,
            'assigned_to' => $employeeUser->id,
            'ticket_number' => 'TCK-2026-901',
            'subject' => 'Webhook latency during peak Friday transactions',
            'priority' => 'urgent',
            'status' => 'in_progress',
            'category' => 'technical',
            'sla_deadline' => Carbon::now()->addHours(4),
            'description' => 'Our monitoring logged occasional 1200ms latency spikes when receiving customer payment webhooks.',
            'messages' => [
                ['sender' => 'client', 'name' => 'Kemi Williams', 'time' => '10:15 AM', 'text' => 'Hi Team, we noticed webhook retry spikes between 10 AM and 11 AM.'],
                ['sender' => 'support', 'name' => 'Femi Adebayo', 'time' => '10:30 AM', 'text' => 'Investigating now. Redis queue worker scale-up in progress on our ingress node.'],
            ]
        ]);

        SupportTicket::create([
            'company_id' => $company->id,
            'customer_account_id' => $accDangote->id,
            'assigned_to' => $employeeUser->id,
            'ticket_number' => 'TCK-2026-898',
            'subject' => 'Request to configure new Port Harcourt branch IP subnet',
            'priority' => 'medium',
            'status' => 'resolved',
            'category' => 'onboarding',
            'description' => 'Branch firewall IP needs whitelist for biometric clock-in restrictions.',
            'customer_rating' => 5,
        ]);

        // 23. CRM Campaigns
        CrmCampaign::create([
            'company_id' => $company->id,
            'name' => 'Q4 Year-End HR & Tax Automation Promotion',
            'channel' => 'email',
            'target_segment' => 'all_leads',
            'status' => 'completed',
            'recipients_count' => 1450,
            'sent_count' => 1450,
            'open_rate' => 52.4,
            'click_rate' => 18.7,
            'message_body' => 'Simplify your 2026 statutory payroll filings with automated PAYE, Pension and NHF generation.',
        ]);

        CrmCampaign::create([
            'company_id' => $company->id,
            'name' => 'WhatsApp Flash Demo Invite for Retailers',
            'channel' => 'whatsapp',
            'target_segment' => 'vip_customers',
            'status' => 'completed',
            'recipients_count' => 320,
            'sent_count' => 320,
            'open_rate' => 88.0,
            'click_rate' => 41.2,
            'message_body' => 'Join our live 15-minute webinar on unifying CRM sales pipeline with warehouse delivery tracking.',
        ]);

        // 24. Shared Workflow Automations
        WorkflowAutomation::create([
            'company_id' => $company->id,
            'title' => 'Instant Lead Auto-Assignment & Welcome WhatsApp',
            'trigger_event' => 'on_new_lead',
            'action_type' => 'assign_rep',
            'description' => 'When a new lead arrives via website or WhatsApp, assign to next available Sales Rep in round-robin and send welcome template.',
            'is_active' => true,
            'execution_count' => 142,
        ]);

        WorkflowAutomation::create([
            'company_id' => $company->id,
            'title' => 'Auto-Generate Proforma Invoice on Deal Won',
            'trigger_event' => 'on_deal_won',
            'action_type' => 'create_invoice',
            'description' => 'Immediately generate invoice and email Paystack payment link to customer billing contact upon stage moving to Closed Won.',
            'is_active' => true,
            'execution_count' => 38,
        ]);

        // 25. Audit Logs
        AuditLog::create([
            'company_id' => $company->id,
            'user_id' => $superAdmin->id,
            'user_name' => 'Oluwaseun Balogun',
            'module' => 'FINANCE',
            'action' => 'processed_payroll',
            'details' => 'Processed November 2026 statutory payroll batch for Lagos & Abuja staff.',
            'ip_address' => '192.168.1.1',
        ]);

        AuditLog::create([
            'company_id' => $company->id,
            'user_id' => $salesUser->id,
            'user_name' => 'Amaka Nwosu',
            'module' => 'CRM',
            'action' => 'won_deal',
            'details' => 'Closed Won deal: Zenith CRM Enterprise Sales (₦15,000,000.00).',
            'ip_address' => '102.89.44.120',
        ]);

        // 26. Notifications
        Notification::create([
            'company_id' => $company->id,
            'user_id' => $superAdmin->id,
            'title' => 'Payroll Batch Approved',
            'message' => 'November 2026 payroll for 5 employees is ready for bank transfer disbursement.',
            'type' => 'success',
            'module' => 'hrm',
            'is_read' => false,
        ]);

        Notification::create([
            'company_id' => $company->id,
            'user_id' => $salesUser->id,
            'title' => 'New High-Score Lead Captured',
            'message' => 'Alhaji Mansur Gwandu scored 92% (Estimated value ₦18,500,000.00).',
            'type' => 'info',
            'module' => 'crm',
            'is_read' => false,
        ]);
    }
}
