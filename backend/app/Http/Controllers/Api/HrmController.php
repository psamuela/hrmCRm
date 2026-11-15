<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Branch;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\JobOpening;
use App\Models\Candidate;
use App\Models\PerformanceReview;
use App\Models\ExpenseClaim;
use App\Models\DisciplinaryCase;
use App\Models\Training;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HrmController extends Controller
{
    // -------------------------------------------------------------
    // EMPLOYEES
    // -------------------------------------------------------------
    public function getEmployees(Request $request)
    {
        $companyId = $request->user()->company_id;
        $query = Employee::with(['department', 'branch', 'reportingManager'])
            ->where('company_id', $companyId);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('status')) {
            $query->where('employment_status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('first_name')->get();

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    public function storeEmployee(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string',
            'designation' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'branch_id' => 'nullable|exists:branches,id',
            'employment_type' => 'required|string',
            'joining_date' => 'required|date',
            'basic_salary' => 'required|numeric|min:0',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'tax_bvn_number' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
        ]);

        $employeeCode = 'EMP-' . (1000 + Employee::where('company_id', $companyId)->count() + 1);

        $employee = Employee::create(array_merge($validated, [
            'company_id' => $companyId,
            'employee_code' => $employeeCode,
            'employment_status' => 'active',
            'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        ]));

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'HRM',
            'action' => 'created_employee',
            'details' => "Registered new employee {$employee->first_name} {$employee->last_name} ({$employeeCode})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $employee->load(['department', 'branch']),
        ], 201);
    }

    public function updateEmployee(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $employee = Employee::where('company_id', $companyId)->findOrFail($id);

        $employee->update($request->only([
            'first_name', 'last_name', 'phone', 'designation', 'department_id',
            'branch_id', 'employment_type', 'employment_status', 'basic_salary',
            'bank_name', 'bank_account_number', 'emergency_contact_name', 'emergency_contact_phone'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully',
            'data' => $employee->load(['department', 'branch']),
        ]);
    }

    // -------------------------------------------------------------
    // ATTENDANCE
    // -------------------------------------------------------------
    public function getAttendance(Request $request)
    {
        $companyId = $request->user()->company_id;
        $date = $request->input('date', Carbon::today()->toDateString());

        $attendances = Attendance::with('employee.department')
            ->where('company_id', $companyId)
            ->whereDate('date', $date)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'date' => $date,
        ]);
    }

    public function clockIn(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'No employee profile linked to your user account.'], 400);
        }

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('company_id', $user->company_id)
            ->where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if ($attendance && $attendance->clock_in) {
            return response()->json(['success' => false, 'message' => 'You have already clocked in today at ' . $attendance->clock_in], 400);
        }

        $now = Carbon::now();
        $isLate = $now->gt(Carbon::today()->setTime(9, 0));

        if (!$attendance) {
            $attendance = Attendance::create([
                'company_id' => $user->company_id,
                'employee_id' => $employee->id,
                'date' => $today,
                'clock_in' => $now->toTimeString(),
                'status' => $isLate ? 'late' : 'present',
                'work_mode' => $request->input('work_mode', 'office'),
                'ip_address' => $request->ip(),
                'notes' => $request->input('notes'),
            ]);
        } else {
            $attendance->update([
                'clock_in' => $now->toTimeString(),
                'status' => $isLate ? 'late' : 'present',
                'work_mode' => $request->input('work_mode', 'office'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Clock-in recorded at ' . $now->format('h:i A'),
            'data' => $attendance,
        ]);
    }

    public function clockOut(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'No employee profile linked.'], 400);
        }

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('company_id', $user->company_id)
            ->where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return response()->json(['success' => false, 'message' => 'No clock-in record found for today.'], 400);
        }

        $now = Carbon::now();
        $clockInTime = Carbon::parse($today . ' ' . $attendance->clock_in);
        $hours = round($now->diffInMinutes($clockInTime) / 60, 2);
        $overtime = $hours > 8 ? round($hours - 8, 2) : 0;

        $attendance->update([
            'clock_out' => $now->toTimeString(),
            'working_hours' => $hours,
            'overtime_hours' => $overtime,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Clock-out recorded. Total duration: {$hours} hours.",
            'data' => $attendance,
        ]);
    }

    // -------------------------------------------------------------
    // LEAVE MANAGEMENT
    // -------------------------------------------------------------
    public function getLeaveRequests(Request $request)
    {
        $companyId = $request->user()->company_id;
        $requests = LeaveRequest::with(['employee.department', 'approver'])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function storeLeaveRequest(Request $request)
    {
        $companyId = $request->user()->company_id;
        $employee = $request->user()->employee;

        $employeeId = $request->input('employee_id', $employee ? $employee->id : null);
        if (!$employeeId) {
            return response()->json(['success' => false, 'message' => 'Employee ID is required.'], 400);
        }

        $validated = $request->validate([
            'leave_type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days_count' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $leave = LeaveRequest::create(array_merge($validated, [
            'company_id' => $companyId,
            'employee_id' => $employeeId,
            'status' => 'pending',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Leave application submitted successfully.',
            'data' => $leave->load('employee'),
        ], 201);
    }

    public function updateLeaveStatus(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $leave = LeaveRequest::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'status' => 'required|in:approved,rejected,cancelled',
            'rejection_reason' => 'nullable|string',
        ]);

        $leave->update([
            'status' => $request->status,
            'approved_by' => $request->user()->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'HRM',
            'action' => 'leave_' . $request->status,
            'details' => "Leave #{$leave->id} for employee ID {$leave->employee_id} marked as {$request->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Leave application {$request->status}.",
            'data' => $leave,
        ]);
    }

    // -------------------------------------------------------------
    // PAYROLL (NIGERIAN STATUTORY COMPLIANT)
    // -------------------------------------------------------------
    public function getPayrolls(Request $request)
    {
        $companyId = $request->user()->company_id;
        $month = $request->input('month', Carbon::now()->format('F'));
        $year = $request->input('year', Carbon::now()->year);

        $payrolls = Payroll::with(['employee.department'])
            ->where('company_id', $companyId)
            ->where('month', $month)
            ->where('year', $year)
            ->orderBy('id', 'desc')
            ->get();

        $totalGross = $payrolls->sum('gross_salary');
        $totalNet = $payrolls->sum('net_salary');
        $totalTaxPaye = $payrolls->sum('tax_paye');
        $totalPension = $payrolls->sum('pension_employee') + $payrolls->sum('pension_employer');

        return response()->json([
            'success' => true,
            'data' => $payrolls,
            'summary' => [
                'total_gross' => $totalGross,
                'total_net' => $totalNet,
                'total_tax_paye' => $totalTaxPaye,
                'total_pension' => $totalPension,
                'month' => $month,
                'year' => $year,
            ]
        ]);
    }

    public function generatePayrollBatch(Request $request)
    {
        $companyId = $request->user()->company_id;
        $month = $request->input('month', Carbon::now()->format('F'));
        $year = $request->input('year', Carbon::now()->year);

        $employees = Employee::where('company_id', $companyId)->where('employment_status', 'active')->get();
        $generated = 0;

        foreach ($employees as $emp) {
            $existing = Payroll::where('company_id', $companyId)
                ->where('employee_id', $emp->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if (!$existing) {
                // Nigerian Payroll Breakdown
                $basic = $emp->basic_salary;
                $housing = round($basic * 0.25, 2);
                $transport = round($basic * 0.12, 2);
                $gross = $basic + $housing + $transport;

                // Deductions:
                // Pension: 8% of (Basic + Housing + Transport)
                $pensionEmp = round($gross * 0.08, 2);
                $pensionEmployer = round($gross * 0.10, 2);
                // NHF: 2.5% of basic salary
                $nhf = round($basic * 0.025, 2);
                // PAYE progressive tax approximation: ~15% effective on gross
                $paye = round($gross * 0.15, 2);
                $totalDeductions = $pensionEmp + $nhf + $paye;
                $net = $gross - $totalDeductions;

                $slipNumber = 'PAY-' . $year . '-' . strtoupper(substr($month, 0, 3)) . '-' . str_pad($emp->id, 3, '0', STR_PAD_LEFT);

                Payroll::create([
                    'company_id' => $companyId,
                    'employee_id' => $emp->id,
                    'month' => $month,
                    'year' => $year,
                    'payslip_number' => $slipNumber,
                    'basic_salary' => $basic,
                    'housing_allowance' => $housing,
                    'transport_allowance' => $transport,
                    'other_allowances' => 0,
                    'bonuses' => 0,
                    'gross_salary' => $gross,
                    'tax_paye' => $paye,
                    'pension_employee' => $pensionEmp,
                    'pension_employer' => $pensionEmployer,
                    'nhf_deduction' => $nhf,
                    'other_deductions' => 0,
                    'net_salary' => $net,
                    'payment_status' => 'pending_approval',
                    'payment_method' => 'bank_transfer',
                ]);
                $generated++;
            }
        }

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'HRM',
            'action' => 'generated_payroll_batch',
            'details' => "Generated payroll batch for {$month} {$year} ({$generated} new payslips).",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Successfully generated {$generated} payslip records for {$month} {$year}.",
        ]);
    }

    public function updatePayrollStatus(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $payroll = Payroll::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'payment_status' => 'required|in:draft,pending_approval,approved,paid',
        ]);

        $payroll->update([
            'payment_status' => $request->payment_status,
            'payment_date' => $request->payment_status === 'paid' ? Carbon::today()->toDateString() : $payroll->payment_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Payroll status updated to {$request->payment_status}.",
            'data' => $payroll,
        ]);
    }

    // -------------------------------------------------------------
    // RECRUITMENT & ATS
    // -------------------------------------------------------------
    public function getRecruitment(Request $request)
    {
        $companyId = $request->user()->company_id;
        $jobs = JobOpening::with(['department', 'candidates'])
            ->where('company_id', $companyId)
            ->get();

        $candidates = Candidate::with('jobOpening')
            ->where('company_id', $companyId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'jobs' => $jobs,
                'candidates' => $candidates,
            ]
        ]);
    }

    public function updateCandidateStage(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $candidate = Candidate::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'stage' => 'required|in:applied,screening,interview,assessment,offer,hired,rejected',
        ]);

        $candidate->update(['stage' => $request->stage]);

        return response()->json([
            'success' => true,
            'message' => "Candidate moved to {$request->stage} stage.",
            'data' => $candidate,
        ]);
    }

    // -------------------------------------------------------------
    // EXPENSES, PERFORMANCES, TRAININGS
    // -------------------------------------------------------------
    public function getExpenses(Request $request)
    {
        $companyId = $request->user()->company_id;
        $expenses = ExpenseClaim::with(['employee.department', 'approver'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $expenses]);
    }

    public function storeExpense(Request $request)
    {
        $companyId = $request->user()->company_id;
        $employee = $request->user()->employee;

        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $claim = ExpenseClaim::create(array_merge($validated, [
            'company_id' => $companyId,
            'employee_id' => $employee ? $employee->id : Employee::where('company_id', $companyId)->first()->id,
            'currency' => 'NGN',
            'status' => 'pending',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Expense submitted for review',
            'data' => $claim->load('employee'),
        ], 201);
    }

    public function updateExpenseStatus(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $claim = ExpenseClaim::where('company_id', $companyId)->findOrFail($id);

        $request->validate([
            'status' => 'required|in:approved,rejected,reimbursed,pending',
        ]);

        $claim->update([
            'status' => $request->status,
            'approved_by' => in_array($request->status, ['approved', 'reimbursed']) ? $request->user()->id : null,
        ]);

        AuditLog::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'module' => 'HRM',
            'action' => 'expense_status_updated',
            'details' => "Expense '{$claim->title}' for ₦" . number_format($claim->amount, 2) . " marked as {$request->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Expense claim status updated to {$request->status}",
            'data' => $claim->load('employee'),
        ]);
    }

    public function getPerformanceReviews(Request $request)
    {
        $companyId = $request->user()->company_id;
        $reviews = PerformanceReview::with(['employee.department', 'reviewer'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function storePerformanceReview(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'review_period' => 'required|string',
            'kpi_score' => 'required|numeric|min:1|max:5',
            'goals_achievement' => 'required|numeric|min:1|max:5',
            'manager_feedback' => 'required|string',
            'promotion_recommendation' => 'boolean',
        ]);

        $overall = round(($validated['kpi_score'] + $validated['goals_achievement']) / 2, 1);

        $review = PerformanceReview::create([
            'company_id' => $companyId,
            'employee_id' => $validated['employee_id'],
            'reviewer_id' => $request->user()->id,
            'review_period' => $validated['review_period'],
            'kpi_score' => $validated['kpi_score'],
            'goals_achievement' => $validated['goals_achievement'],
            'overall_score' => $overall,
            'manager_feedback' => $validated['manager_feedback'],
            'promotion_recommendation' => $validated['promotion_recommendation'] ?? false,
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Performance review recorded successfully',
            'data' => $review->load(['employee.department', 'reviewer']),
        ], 201);
    }

    public function storeJobOpening(Request $request)
    {
        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'department_id' => 'required|exists:departments,id',
            'location' => 'required|string',
            'employment_type' => 'required|string',
            'min_salary' => 'nullable|numeric|min:0',
            'max_salary' => 'nullable|numeric|min:0',
            'openings_count' => 'required|integer|min:1',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
        ]);

        $job = JobOpening::create(array_merge($validated, [
            'company_id' => $companyId,
            'status' => 'open',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Job opening published successfully',
            'data' => $job->load('department'),
        ], 201);
    }

    public function getTrainings(Request $request)
    {
        $companyId = $request->user()->company_id;
        $trainings = Training::where('company_id', $companyId)->get();

        return response()->json(['success' => true, 'data' => $trainings]);
    }

    public function getDisciplinaryCases(Request $request)
    {
        $companyId = $request->user()->company_id;
        $cases = DisciplinaryCase::with('employee.department')
            ->where('company_id', $companyId)
            ->get();

        return response()->json(['success' => true, 'data' => $cases]);
    }
}
