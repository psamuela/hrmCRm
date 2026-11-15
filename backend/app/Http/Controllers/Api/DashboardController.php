<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\Lead;
use App\Models\CustomerAccount;
use App\Models\Deal;
use App\Models\Invoice;
use App\Models\SupportTicket;
use App\Models\AuditLog;
use App\Models\CrmTask;
use App\Models\JobOpening;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $today = Carbon::today()->toDateString();
        $currentMonth = Carbon::now()->format('F');
        $currentYear = Carbon::now()->year;

        // HRM Metrics
        $totalEmployees = Employee::where('company_id', $companyId)->count();
        $activeEmployees = Employee::where('company_id', $companyId)->where('employment_status', 'active')->count();
        $totalDepartments = Department::where('company_id', $companyId)->count();

        $todayAttendance = Attendance::where('company_id', $companyId)->where('date', $today)->get();
        $presentCount = $todayAttendance->whereIn('status', ['present', 'late'])->count();
        $attendanceRate = $totalEmployees > 0 ? round(($presentCount / $totalEmployees) * 100, 1) : 0;

        $onLeaveToday = LeaveRequest::where('company_id', $companyId)
            ->where('status', 'approved')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->count();

        $pendingLeaveApprovals = LeaveRequest::where('company_id', $companyId)->where('status', 'pending')->count();

        $monthlyPayrollCost = Payroll::where('company_id', $companyId)
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->sum('gross_salary');

        $activeJobOpenings = JobOpening::where('company_id', $companyId)->where('status', 'open')->count();

        // CRM Metrics
        $totalCustomers = CustomerAccount::where('company_id', $companyId)->count();
        $newLeadsCount = Lead::where('company_id', $companyId)->where('status', 'new')->count();
        $totalLeads = Lead::where('company_id', $companyId)->count();
        $activeDeals = Deal::where('company_id', $companyId)->whereNotIn('pipeline_stage', ['closed_won', 'closed_lost'])->get();
        $pipelineValue = $activeDeals->sum('deal_value');

        $wonDealsSum = Deal::where('company_id', $companyId)->where('pipeline_stage', 'closed_won')->sum('deal_value');
        $totalInvoiced = Invoice::where('company_id', $companyId)->sum('total_amount');
        $totalPaidRevenue = Invoice::where('company_id', $companyId)->sum('paid_amount');
        $outstandingInvoices = Invoice::where('company_id', $companyId)->whereIn('payment_status', ['unpaid', 'partially_paid', 'overdue'])->sum('total_amount') - Invoice::where('company_id', $companyId)->whereIn('payment_status', ['unpaid', 'partially_paid', 'overdue'])->sum('paid_amount');

        $pendingTickets = SupportTicket::where('company_id', $companyId)->whereIn('status', ['open', 'in_progress'])->count();
        $upcomingTasks = CrmTask::where('company_id', $companyId)->where('status', 'pending')->orderBy('due_date', 'asc')->take(5)->get();

        // Recent Audit / Activity Logs
        $recentActivities = AuditLog::where('company_id', $companyId)->orderBy('created_at', 'desc')->take(7)->get();

        // Revenue & Headcount monthly chart data
        $revenueChart = [
            ['month' => 'Jun', 'revenue' => 12500000, 'payroll' => 2800000],
            ['month' => 'Jul', 'revenue' => 16200000, 'payroll' => 3100000],
            ['month' => 'Aug', 'revenue' => 19800000, 'payroll' => 3200000],
            ['month' => 'Sep', 'revenue' => 24500000, 'payroll' => 3500000],
            ['month' => 'Oct', 'revenue' => 29000000, 'payroll' => 3700000],
            ['month' => 'Nov', 'revenue' => 38100000, 'payroll' => 3810000],
        ];

        // Sales Pipeline Distribution
        $pipelineDistribution = [
            ['stage' => 'Lead', 'count' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'lead')->count(), 'value' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'lead')->sum('deal_value')],
            ['stage' => 'Qualified', 'count' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'qualification')->count(), 'value' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'qualification')->sum('deal_value')],
            ['stage' => 'Proposal', 'count' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'proposal')->count(), 'value' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'proposal')->sum('deal_value')],
            ['stage' => 'Negotiation', 'count' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'negotiation')->count(), 'value' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'negotiation')->sum('deal_value')],
            ['stage' => 'Won', 'count' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'closed_won')->count(), 'value' => Deal::where('company_id', $companyId)->where('pipeline_stage', 'closed_won')->sum('deal_value')],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'hrm' => [
                    'total_employees' => $totalEmployees,
                    'active_employees' => $activeEmployees,
                    'total_departments' => $totalDepartments,
                    'present_today' => $presentCount,
                    'attendance_rate' => $attendanceRate,
                    'on_leave_today' => $onLeaveToday,
                    'pending_leave_approvals' => $pendingLeaveApprovals,
                    'monthly_payroll_expenditure' => $monthlyPayrollCost,
                    'active_job_openings' => $activeJobOpenings,
                ],
                'crm' => [
                    'total_customers' => $totalCustomers,
                    'new_leads' => $newLeadsCount,
                    'total_leads' => $totalLeads,
                    'pipeline_value' => $pipelineValue,
                    'won_deals_total' => $wonDealsSum,
                    'total_paid_revenue' => $totalPaidRevenue,
                    'outstanding_invoices' => $outstandingInvoices,
                    'pending_tickets' => $pendingTickets,
                    'upcoming_tasks' => $upcomingTasks,
                ],
                'charts' => [
                    'revenue_vs_payroll' => $revenueChart,
                    'pipeline_distribution' => $pipelineDistribution,
                ],
                'recent_activities' => $recentActivities,
            ]
        ]);
    }
}
