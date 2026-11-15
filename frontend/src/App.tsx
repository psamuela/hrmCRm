import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { EmployeesView } from './components/hrm/EmployeesView';
import { AttendanceView } from './components/hrm/AttendanceView';
import { LeaveView } from './components/hrm/LeaveView';
import { PayrollView } from './components/hrm/PayrollView';
import { RecruitmentView } from './components/hrm/RecruitmentView';
import { EssPortalView } from './components/hrm/EssPortalView';
import { PerformanceView } from './components/hrm/PerformanceView';
import { ExpensesView } from './components/hrm/ExpensesView';
import { PipelineView } from './components/crm/PipelineView';
import { LeadsView } from './components/crm/LeadsView';
import { AccountsView } from './components/crm/AccountsView';
import { InvoicesView } from './components/crm/InvoicesView';
import { HelpdeskView } from './components/crm/HelpdeskView';
import { ProductsView } from './components/crm/ProductsView';
import { QuotationsView } from './components/crm/QuotationsView';
import { CampaignsView } from './components/crm/CampaignsView';
import { SettingsView } from './components/shared/SettingsView';
import { AutomationsView } from './components/shared/AutomationsView';
import { AuditLogsView } from './components/shared/AuditLogsView';
import { AiCopilotModal } from './components/ai/AiCopilotModal';

const MainLayout: React.FC = () => {
  const { activeModule, activeSubmenu, switchModule, setActiveSubmenu, isLoading } = useAuth();
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading Enterprise Platform...</p>
      </div>
    );
  }

  const handleNavigate = (mod: 'hrm' | 'crm', submenu: string) => {
    switchModule(mod);
    setActiveSubmenu(submenu);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenAiCopilot={() => setIsAiOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {/* OVERVIEW MODULE */}
          {activeModule === 'overview' && (
            <>
              {activeSubmenu === 'dashboard' && <OverviewDashboard onNavigate={handleNavigate} />}
              {activeSubmenu === 'automations' && <AutomationsView />}
              {activeSubmenu === 'audit' && <AuditLogsView />}
            </>
          )}

          {/* HRM MODULE */}
          {activeModule === 'hrm' && (
            <>
              {activeSubmenu === 'employees' && <EmployeesView />}
              {activeSubmenu === 'attendance' && <AttendanceView />}
              {activeSubmenu === 'leaves' && <LeaveView />}
              {activeSubmenu === 'payroll' && <PayrollView />}
              {activeSubmenu === 'recruitment' && <RecruitmentView />}
              {activeSubmenu === 'ess' && <EssPortalView />}
              {activeSubmenu === 'performance' && <PerformanceView />}
              {activeSubmenu === 'expenses' && <ExpensesView />}
            </>
          )}

          {/* CRM MODULE */}
          {activeModule === 'crm' && (
            <>
              {activeSubmenu === 'pipeline' && <PipelineView />}
              {activeSubmenu === 'leads' && <LeadsView />}
              {activeSubmenu === 'accounts' && <AccountsView />}
              {activeSubmenu === 'invoices' && <InvoicesView />}
              {activeSubmenu === 'tickets' && <HelpdeskView />}
              {activeSubmenu === 'products' && <ProductsView />}
              {activeSubmenu === 'quotations' && <QuotationsView />}
              {activeSubmenu === 'campaigns' && <CampaignsView />}
            </>
          )}

          {/* SETTINGS MODULE */}
          {activeModule === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* AI Copilot Drawer / Modal */}
      <AiCopilotModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
