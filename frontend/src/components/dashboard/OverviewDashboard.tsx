import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  FileCheck,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Building2,
  DollarSign,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';

export const OverviewDashboard: React.FC<{ onNavigate: (module: 'hrm' | 'crm', submenu: string) => void }> = ({ onNavigate }) => {
  const { user, company, plan } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hrm = stats?.hrm || {};
  const crm = stats?.crm || {};
  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${val?.toLocaleString() || '0'}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {company?.name || 'Innowise Africa Ltd'} · {company?.currency || 'NGN'}
              </span>
              <span className="text-xs text-slate-400">
                Lagos Head Office & Abuja Branch
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Unified enterprise operations center connecting Human Resource Management with your customer sales pipeline and cashflow.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('hrm', 'employees')}
              className="px-3.5 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Manage Staff
            </button>
            <button
              onClick={() => onNavigate('crm', 'pipeline')}
              className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              Sales Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Headcount & Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workforce & Presence</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{hrm.total_employees || 5}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {hrm.attendance_rate || 80}% Present
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{hrm.present_today || 4} clocked in today</span>
            <span>{hrm.on_leave_today || 1} on leave</span>
          </div>
        </div>

        {/* Card 2: CRM Sales Pipeline Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deal Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{formatMoney(crm.pipeline_value || 40300000)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{crm.new_leads || 3} active leads</span>
            <span className="text-emerald-600 font-medium">{crm.total_customers || 3} corporate accounts</span>
          </div>
        </div>

        {/* Card 3: Invoiced Cashflow */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{formatMoney(crm.total_paid_revenue || 15050000)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Receivables:</span>
            <span className="font-semibold text-amber-600">{formatMoney(crm.outstanding_invoices || 4300000)}</span>
          </div>
        </div>

        {/* Card 4: Monthly Payroll Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Payroll</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{formatMoney(hrm.monthly_payroll_expenditure || 3810000)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>PAYE & Pension:</span>
            <span className="text-slate-600 font-medium">Auto-computed</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Revenue vs Payroll Trends */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Financial Trajectory (Revenue vs Payroll Cost)</h3>
              <p className="text-xs text-slate-400">Monthly comparison in {company?.currency || 'NGN'}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Payroll
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.charts?.revenue_vs_payroll || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(val: any) => [formatMoney(val), '']} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="payroll" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPay)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Pipeline Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Deal Pipeline by Stage</h3>
                <p className="text-xs text-slate-400">Total pipeline: {formatMoney(crm.pipeline_value || 40300000)}</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.charts?.pipeline_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatMoney(val), 'Value']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Won deals closed:</span>
            <span className="font-bold text-emerald-600">{formatMoney(crm.won_deals_total || 15000000)}</span>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Activities & Pending Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Platform Activities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Unified Activity & Audit Trail
            </h3>
            <button 
              onClick={() => onNavigate('hrm', 'audit')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Full Logs
            </button>
          </div>

          <div className="space-y-3">
            {(stats?.recent_activities || []).map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                  item.module === 'HRM' ? 'bg-blue-100 text-blue-700' :
                  item.module === 'CRM' ? 'bg-emerald-100 text-emerald-700' :
                  item.module === 'FINANCE' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.module}
                </span>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{item.user_name}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Tasks & Approvals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Action Items & Client Follow-ups
            </h3>
            <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              {(crm.upcoming_tasks || []).length + (hrm.pending_leave_approvals || 0)} Required
            </span>
          </div>

          <div className="space-y-3">
            {hrm.pending_leave_approvals > 0 && (
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Leave Approval Pending</p>
                    <p className="text-[11px] text-slate-600">Femi Adebayo applied for 2 days Casual Leave</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('hrm', 'leaves')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-100 rounded border border-blue-300 shadow-xs"
                >
                  Review
                </button>
              </div>
            )}

            {(crm.upcoming_tasks || []).map((t: any) => (
              <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                    <p className="text-[11px] text-slate-500">Priority: <span className="capitalize font-medium text-amber-700">{t.priority}</span> · Due {new Date(t.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  {t.type}
                </span>
              </div>
            ))}

            {crm.pending_tickets > 0 && (
              <div className="p-3 bg-rose-50/60 border border-rose-200/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-rose-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Urgent Support Ticket</p>
                    <p className="text-[11px] text-slate-600">Zenith FinTech Labs webhook latency incident</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('crm', 'tickets')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-rose-700 hover:bg-rose-100 rounded border border-rose-300 shadow-xs"
                >
                  Respond
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
