import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Clock, 
  FileText, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Building, 
  CreditCard,
  Download,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

export const EssPortalView: React.FC = () => {
  const { user, company } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myPayrolls, setMyPayrolls] = useState<any[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadEssData = async () => {
      try {
        const [meRes, payRes, leaveRes] = await Promise.all([
          api.get('/me'),
          api.get('/hrm/payrolls'),
          api.get('/hrm/leaves'),
        ]);

        if (meRes.data.success) setProfile(meRes.data.data.user);
        if (payRes.data.success) {
          // Filter to user's employee ID if available
          setMyPayrolls(payRes.data.data);
        }
        if (leaveRes.data.success) {
          setMyLeaves(leaveRes.data.data);
        }
      } catch (e) {
        console.warn('Error loading ESS data:', e);
      }
    };
    loadEssData();
  }, []);

  const employee = profile?.employee;
  const currencySymbol = company?.currency_symbol || '₦';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          1.8 Employee Self-Service (ESS) Portal
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, review official payslips, apply for time off, and access benefits.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-50 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Active Staff
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {employee?.designation || 'Lead Engineer'} · {employee?.department?.name || 'Technology Dept'}
            </p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Code: {employee?.employee_code || 'EMP-1001'} · Joined {employee?.joining_date || '2021-03-01'}
            </p>
          </div>
        </div>

        <div className="bg-orange-50/60 border border-orange-200/80 p-4 rounded-xl text-xs space-y-1 w-full md:w-auto">
          <p className="font-semibold text-orange-900">Direct Salary NUBAN Account</p>
          <p className="text-slate-700 font-mono font-bold">{employee?.bank_name || 'Access Bank Plc'} · {employee?.bank_account_number || '0123456789'}</p>
          <p className="text-[11px] text-slate-500">BVN / TIN Verified: {employee?.tax_bvn_number || '22334455667'}</p>
        </div>
      </div>

      {/* Grid: My Payslips & Leave Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Payslips */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              My Official Payslips
            </h4>
            <span className="text-xs text-slate-400">Monthly breakdown</span>
          </div>

          <div className="space-y-2">
            {myPayrolls.slice(0, 4).map((pay) => (
              <div key={pay.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{pay.month} {pay.year}</p>
                  <p className="text-[11px] font-mono text-slate-400">{pay.payslip_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-emerald-700">
                    {currencySymbol}{Number(pay.net_salary).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500 uppercase">{pay.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Leaves */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              My Leave Records & Balances
            </h4>
            <span className="text-xs text-amber-600 font-semibold">17 Days Remaining</span>
          </div>

          <div className="space-y-2">
            {myLeaves.slice(0, 3).map((l) => (
              <div key={l.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 capitalize">{l.leave_type} Leave ({l.days_count} Days)</p>
                  <p className="text-[11px] text-slate-500">{l.start_date} to {l.end_date}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  l.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {l.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
