<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HrmController;
use App\Http\Controllers\Api\CrmController;
use App\Http\Controllers\Api\SharedController;
use App\Http\Controllers\Api\AiController;

// Public Auth Endpoints
Route::post('/login', [AuthController::class, 'login']);

// Protected Endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Identity
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/switch-company', [AuthController::class, 'switchCompany']);

    // Main Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Shared / Core Platform
    Route::get('/companies', [SharedController::class, 'getCompanies']);
    Route::post('/companies/subscription', [SharedController::class, 'updateSubscriptionPlan']);
    Route::post('/companies/statutory', [SharedController::class, 'updateStatutorySettings']);
    Route::get('/branches', [SharedController::class, 'getBranches']);
    Route::post('/branches', [SharedController::class, 'storeBranch']);
    Route::get('/departments', [SharedController::class, 'getDepartments']);
    Route::get('/notifications', [SharedController::class, 'getNotifications']);
    Route::post('/notifications/{id}/read', [SharedController::class, 'markNotificationRead']);
    Route::get('/audit-logs', [SharedController::class, 'getAuditLogs']);
    Route::get('/automations', [SharedController::class, 'getAutomations']);
    Route::post('/automations/{id}/toggle', [SharedController::class, 'toggleAutomation']);

    // HRM Module
    Route::prefix('hrm')->group(function () {
        // 1.1 Employees
        Route::get('/employees', [HrmController::class, 'getEmployees']);
        Route::post('/employees', [HrmController::class, 'storeEmployee']);
        Route::put('/employees/{id}', [HrmController::class, 'updateEmployee']);

        // 1.3 Attendance
        Route::get('/attendance', [HrmController::class, 'getAttendance']);
        Route::post('/attendance/clock-in', [HrmController::class, 'clockIn']);
        Route::post('/attendance/clock-out', [HrmController::class, 'clockOut']);

        // 1.4 Leave
        Route::get('/leaves', [HrmController::class, 'getLeaveRequests']);
        Route::post('/leaves', [HrmController::class, 'storeLeaveRequest']);
        Route::put('/leaves/{id}/status', [HrmController::class, 'updateLeaveStatus']);

        // 1.5 Payroll
        Route::get('/payrolls', [HrmController::class, 'getPayrolls']);
        Route::post('/payrolls/generate-batch', [HrmController::class, 'generatePayrollBatch']);
        Route::put('/payrolls/{id}/status', [HrmController::class, 'updatePayrollStatus']);

        // 1.2 Recruitment / ATS
        Route::get('/recruitment', [HrmController::class, 'getRecruitment']);
        Route::post('/jobs', [HrmController::class, 'storeJobOpening']);
        Route::put('/candidates/{id}/stage', [HrmController::class, 'updateCandidateStage']);

        // 1.9 Expenses
        Route::get('/expenses', [HrmController::class, 'getExpenses']);
        Route::post('/expenses', [HrmController::class, 'storeExpense']);
        Route::put('/expenses/{id}/status', [HrmController::class, 'updateExpenseStatus']);

        // 1.6 Performance, 1.7 Trainings, 1.10 Disciplinary
        Route::get('/performance', [HrmController::class, 'getPerformanceReviews']);
        Route::post('/performance', [HrmController::class, 'storePerformanceReview']);
        Route::get('/trainings', [HrmController::class, 'getTrainings']);
        Route::get('/disciplinary', [HrmController::class, 'getDisciplinaryCases']);
    });

    // CRM Module
    Route::prefix('crm')->group(function () {
        // 2.1 Leads
        Route::get('/leads', [CrmController::class, 'getLeads']);
        Route::post('/leads', [CrmController::class, 'storeLead']);
        Route::put('/leads/{id}/status', [CrmController::class, 'updateLeadStatus']);

        // 2.3 Customers / Accounts
        Route::get('/accounts', [CrmController::class, 'getCustomerAccounts']);
        Route::post('/accounts', [CrmController::class, 'storeCustomerAccount']);

        // 2.4 Deals / Sales Pipeline
        Route::get('/deals', [CrmController::class, 'getDeals']);
        Route::post('/deals', [CrmController::class, 'storeDeal']);
        Route::put('/deals/{id}/stage', [CrmController::class, 'updateDealStage']);

        // 2.7 Products & Services
        Route::get('/products', [CrmController::class, 'getProducts']);
        Route::post('/products', [CrmController::class, 'storeProduct']);

        // 2.8 Quotations
        Route::get('/quotations', [CrmController::class, 'getQuotations']);
        Route::post('/quotations', [CrmController::class, 'storeQuotation']);
        Route::put('/quotations/{id}/status', [CrmController::class, 'updateQuotationStatus']);

        // 2.10 Invoices & Payments
        Route::get('/invoices', [CrmController::class, 'getInvoices']);
        Route::post('/invoices/{id}/pay', [CrmController::class, 'recordPayment']);

        // 2.11 Tasks & Activities
        Route::get('/tasks', [CrmController::class, 'getTasks']);
        Route::post('/tasks', [CrmController::class, 'storeTask']);

        // 2.15 Support Tickets
        Route::get('/tickets', [CrmController::class, 'getSupportTickets']);
        Route::post('/tickets/{id}/reply', [CrmController::class, 'replySupportTicket']);

        // 2.13 Campaigns
        Route::get('/campaigns', [CrmController::class, 'getCampaigns']);
        Route::post('/campaigns', [CrmController::class, 'storeCampaign']);
    });

    // AI Engine / Copilot
    Route::prefix('ai')->group(function () {
        Route::post('/screen-candidate', [AiController::class, 'screenCandidate']);
        Route::post('/score-lead', [AiController::class, 'scoreLead']);
        Route::post('/generate-jd', [AiController::class, 'generateJobDescription']);
        Route::post('/draft-email', [AiController::class, 'draftSalesEmail']);
    });
});
