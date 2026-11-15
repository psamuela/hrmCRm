import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  UserPlus,
  Award,
  Receipt,
  User,
  Kanban,
  Target,
  Building2,
  Package,
  FileText,
  FileCheck2,
  Headphones,
  Send,
  GitBranch,
  ShieldAlert,
  Sliders,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '../../services/api';

export const Sidebar: React.FC = () => {
  const { 
    user, 
    company, 
    plan, 
    activeModule, 
    activeSubmenu, 
    switchModule, 
    setActiveSubmenu, 
    switchCompany,
    logout 
  } = useAuth();

  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await api.get('/companies');
        if (res.data.success) {
          setCompaniesList(res.data.data);
        }
      } catch (e) {
        console.warn('Failed to load companies:', e);
      }
    };
    loadCompanies();
  }, []);

  const isHrmAllowed = plan === 'enterprise' || plan === 'hrm_only';
  const isCrmAllowed = plan === 'enterprise' || plan === 'crm_only';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 z-40 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
            H
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              HRM + CRM
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Cloud
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Unified Business Platform</p>
          </div>
        </div>

        {/* Multi-Company / Branch Selector */}
        <div className="mt-3 relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="w-full text-left px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 flex items-center justify-between transition-colors text-xs text-slate-200"
          >
            <div className="truncate pr-1">
              <span className="text-[10px] text-slate-400 block font-medium">Active Company</span>
              <span className="font-semibold text-white truncate block">{company?.name || 'Innowise Africa Ltd'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showCompanyMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-1.5 z-50 text-xs">
              <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Switch Tenant</p>
              {companiesList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { switchCompany(c.id); setShowCompanyMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-700/80 transition-colors ${company?.id === c.id ? 'bg-indigo-600/30 text-indigo-300 font-medium' : 'text-slate-300'}`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] px-1 rounded bg-slate-900 text-slate-400 uppercase">{c.plan?.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Module Switcher Pills */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-800/80">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
          Platform Modules
        </p>
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => switchModule('overview')}
            className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeModule === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard className="w-3 h-3" />
            Overview
          </button>

          <button
            onClick={() => switchModule('settings')}
            className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeModule === 'settings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Sliders className="w-3 h-3" />
            Settings
          </button>

          {isHrmAllowed ? (
            <button
              onClick={() => switchModule('hrm')}
              className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeModule === 'hrm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="w-3 h-3" />
              HRM
            </button>
          ) : (
            <div className="px-2 py-1.5 rounded text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed" title="Upgrade to HRM or Enterprise plan to unlock">
              <Users className="w-3 h-3" />
              HRM (Locked)
            </div>
          )}

          {isCrmAllowed ? (
            <button
              onClick={() => switchModule('crm')}
              className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeModule === 'crm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              <Target className="w-3 h-3" />
              CRM
            </button>
          ) : (
            <div className="px-2 py-1.5 rounded text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed" title="Upgrade to CRM or Enterprise plan to unlock">
              <Target className="w-3 h-3" />
              CRM (Locked)
            </div>
          )}
        </div>
      </div>

      {/* Navigation Submenu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* OVERVIEW SUBMENU */}
        {activeModule === 'overview' && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Executive Dashboard
            </div>
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Main KPI Overview" 
              active={activeSubmenu === 'dashboard'} 
              onClick={() => setActiveSubmenu('dashboard')} 
            />
            <NavItem 
              icon={<Zap className="w-4 h-4 text-amber-400" />} 
              label="Workflow Automations" 
              active={activeSubmenu === 'automations'} 
              onClick={() => setActiveSubmenu('automations')} 
              badge="Active"
            />
            <NavItem 
              icon={<ShieldAlert className="w-4 h-4" />} 
              label="Audit Logs & Security" 
              active={activeSubmenu === 'audit'} 
              onClick={() => setActiveSubmenu('audit')} 
            />
          </>
        )}

        {/* HRM SUBMENU */}
        {activeModule === 'hrm' && isHrmAllowed && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400 flex items-center justify-between">
              <span>Human Resources</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 rounded">8 Modules</span>
            </div>

            <NavItem 
              icon={<Users className="w-4 h-4 text-blue-400" />} 
              label="1.1 Employees Directory" 
              active={activeSubmenu === 'employees'} 
              onClick={() => setActiveSubmenu('employees')} 
            />
            <NavItem 
              icon={<CalendarCheck className="w-4 h-4 text-emerald-400" />} 
              label="1.3 Attendance Tracking" 
              active={activeSubmenu === 'attendance'} 
              onClick={() => setActiveSubmenu('attendance')} 
            />
            <NavItem 
              icon={<CalendarDays className="w-4 h-4 text-amber-400" />} 
              label="1.4 Leave Management" 
              active={activeSubmenu === 'leaves'} 
              onClick={() => setActiveSubmenu('leaves')} 
              badge="1 Pending"
            />
            <NavItem 
              icon={<CreditCard className="w-4 h-4 text-indigo-400" />} 
              label="1.5 Payroll (Nigerian PAYE)" 
              active={activeSubmenu === 'payroll'} 
              onClick={() => setActiveSubmenu('payroll')} 
              badge="Nov 2026"
            />
            <NavItem 
              icon={<UserPlus className="w-4 h-4 text-purple-400" />} 
              label="1.2 Recruitment & ATS" 
              active={activeSubmenu === 'recruitment'} 
              onClick={() => setActiveSubmenu('recruitment')} 
              badge="3 Openings"
            />
            <NavItem 
              icon={<Award className="w-4 h-4 text-rose-400" />} 
              label="1.6 Performance & 360" 
              active={activeSubmenu === 'performance'} 
              onClick={() => setActiveSubmenu('performance')} 
            />
            <NavItem 
              icon={<Receipt className="w-4 h-4 text-teal-400" />} 
              label="1.9 Expense Claims" 
              active={activeSubmenu === 'expenses'} 
              onClick={() => setActiveSubmenu('expenses')} 
            />
            <NavItem 
              icon={<User className="w-4 h-4 text-orange-400" />} 
              label="1.8 Employee Portal (ESS)" 
              active={activeSubmenu === 'ess'} 
              onClick={() => setActiveSubmenu('ess')} 
              badge="Self-Service"
            />
          </>
        )}

        {/* CRM SUBMENU */}
        {activeModule === 'crm' && isCrmAllowed && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span>Customer Relationship</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded">Pipeline</span>
            </div>

            <NavItem 
              icon={<Kanban className="w-4 h-4 text-emerald-400" />} 
              label="2.4 Sales Pipeline (Kanban)" 
              active={activeSubmenu === 'pipeline'} 
              onClick={() => setActiveSubmenu('pipeline')} 
              badge="₦40.3M"
            />
            <NavItem 
              icon={<Target className="w-4 h-4 text-blue-400" />} 
              label="2.1 Lead Management" 
              active={activeSubmenu === 'leads'} 
              onClick={() => setActiveSubmenu('leads')} 
              badge="3 Leads"
            />
            <NavItem 
              icon={<Building2 className="w-4 h-4 text-amber-400" />} 
              label="2.3 Accounts & Companies" 
              active={activeSubmenu === 'accounts'} 
              onClick={() => setActiveSubmenu('accounts')} 
            />
            <NavItem 
              icon={<Package className="w-4 h-4 text-indigo-400" />} 
              label="2.7 Products & Services" 
              active={activeSubmenu === 'products'} 
              onClick={() => setActiveSubmenu('products')} 
            />
            <NavItem 
              icon={<FileText className="w-4 h-4 text-purple-400" />} 
              label="2.8 Quotations & Proposals" 
              active={activeSubmenu === 'quotations'} 
              onClick={() => setActiveSubmenu('quotations')} 
            />
            <NavItem 
              icon={<FileCheck2 className="w-4 h-4 text-teal-400" />} 
              label="2.10 Invoices & Payments" 
              active={activeSubmenu === 'invoices'} 
              onClick={() => setActiveSubmenu('invoices')} 
              badge="Paystack"
            />
            <NavItem 
              icon={<Headphones className="w-4 h-4 text-rose-400" />} 
              label="2.15 Support & Helpdesk" 
              active={activeSubmenu === 'tickets'} 
              onClick={() => setActiveSubmenu('tickets')} 
              badge="1 Urgent"
            />
            <NavItem 
              icon={<Send className="w-4 h-4 text-cyan-400" />} 
              label="2.13 Campaigns (WhatsApp/Email)" 
              active={activeSubmenu === 'campaigns'} 
              onClick={() => setActiveSubmenu('campaigns')} 
            />
          </>
        )}

        {/* SETTINGS SUBMENU */}
        {activeModule === 'settings' && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              System Settings
            </div>
            <NavItem 
              icon={<Building2 className="w-4 h-4" />} 
              label="3.3 Multi-Company & Branches" 
              active={activeSubmenu === 'branches'} 
              onClick={() => setActiveSubmenu('branches')} 
            />
            <NavItem 
              icon={<Layers className="w-4 h-4" />} 
              label="Subscription Packages" 
              active={activeSubmenu === 'packages'} 
              onClick={() => setActiveSubmenu('packages')} 
            />
            <NavItem 
              icon={<Sliders className="w-4 h-4" />} 
              label="Tax & Statutory Deductions" 
              active={activeSubmenu === 'statutory'} 
              onClick={() => setActiveSubmenu('statutory')} 
            />
          </>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
            alt={user?.name} 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0" 
          />
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
  >
    <div className="flex items-center gap-2.5 truncate">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    {badge && (
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {badge}
      </span>
    )}
  </button>
);
