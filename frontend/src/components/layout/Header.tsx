import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  Layers
} from 'lucide-react';
import api from '../../services/api';

interface HeaderProps {
  onOpenAiCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiCopilot }) => {
  const { 
    user, 
    company, 
    plan, 
    unreadCount, 
    notifications, 
    markNotificationRead,
    switchDemoPersona 
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMsg, setClockMsg] = useState<string | null>(null);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/hrm/attendance/clock-in', { work_mode: 'office' });
      setClockMsg(res.data.message || 'Clocked in successfully!');
      setTimeout(() => setClockMsg(null), 4000);
    } catch (e: any) {
      setClockMsg(e.response?.data?.message || 'Failed to clock in');
      setTimeout(() => setClockMsg(null), 4000);
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/hrm/attendance/clock-out');
      setClockMsg(res.data.message || 'Clocked out successfully!');
      setTimeout(() => setClockMsg(null), 4000);
    } catch (e: any) {
      setClockMsg(e.response?.data?.message || 'Failed to clock out');
      setTimeout(() => setClockMsg(null), 4000);
    } finally {
      setClockLoading(false);
    }
  };

  const getPlanBadge = () => {
    switch (plan) {
      case 'enterprise':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm flex items-center gap-1.5"><Layers className="w-3 h-3" /> Enterprise Suite</span>;
      case 'hrm_only':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5"><UserCheck className="w-3 h-3" /> HRM Package</span>;
      case 'crm_only':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> CRM Package</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, deals, invoices, candidates (Ctrl+K)..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Subscription Plan Badge */}
        {getPlanBadge()}

        {/* Quick Clock-In / Clock-Out for ESS */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
          <button
            onClick={handleClockIn}
            disabled={clockLoading}
            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-white hover:bg-emerald-50 rounded shadow-xs flex items-center gap-1.5 transition-all"
            title="Punch in for today"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={clockLoading}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
            title="End shift and record working hours"
          >
            Clock Out
          </button>
        </div>

        {clockMsg && (
          <div className="fixed top-20 right-6 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {clockMsg}
          </div>
        )}

        {/* AI Copilot Launcher */}
        <button
          onClick={onOpenAiCopilot}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>AI Assistant</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Notifications ({unreadCount} new)</span>
                <span className="text-[10px] text-indigo-600 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-50/40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{n.module}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Switch Demo Persona Quick Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-left"
          >
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
              alt={user?.name} 
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-indigo-600 font-medium capitalize">{user?.role?.replace('_', ' ') || 'Role'}</p>
            </div>
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Demo Persona</p>
                <p className="text-xs text-slate-600 mt-0.5">Test different RBAC roles & permissions:</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { switchDemoPersona('admin@innowise.com'); setShowPersonaMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Super Administrator</p>
                      <p className="text-[10px] text-slate-500">Oluwaseun Balogun (Full Access)</p>
                    </div>
                  </div>
                  {user?.role === 'super_admin' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </button>

                <button
                  onClick={() => { switchDemoPersona('chidi.hrm@innowise.com'); setShowPersonaMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">HR Manager</p>
                      <p className="text-[10px] text-slate-500">Chidi Okeke (Payroll, Leaves, ATS)</p>
                    </div>
                  </div>
                  {user?.role === 'hr_manager' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  onClick={() => { switchDemoPersona('amaka.crm@innowise.com'); setShowPersonaMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Sales VP / CRM Manager</p>
                      <p className="text-[10px] text-slate-500">Amaka Nwosu (Deals, Leads, Quotes)</p>
                    </div>
                  </div>
                  {user?.role === 'sales_manager' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => { switchDemoPersona('femi.engineer@innowise.com'); setShowPersonaMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Staff Employee (ESS Portal)</p>
                      <p className="text-[10px] text-slate-500">Femi Adebayo (My Clock-in, Payslips)</p>
                    </div>
                  </div>
                  {user?.role === 'employee' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
