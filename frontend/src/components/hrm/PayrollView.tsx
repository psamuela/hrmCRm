import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Printer, 
  X,
  Building,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { Payroll } from '../../types';

export const PayrollView: React.FC = () => {
  const { user, company } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hrm/payrolls?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data.success) {
        setPayrolls(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error('Failed to load payrolls:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth, selectedYear]);

  const handleGenerateBatch = async () => {
    try {
      const res = await api.post('/hrm/payrolls/generate-batch', {
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.data.success) {
        setActionFeedback(res.data.message);
        setTimeout(() => setActionFeedback(null), 4000);
        fetchPayrolls();
      }
    } catch (e: any) {
      console.error('Batch generation error:', e);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'paid') => {
    try {
      const res = await api.put(`/hrm/payrolls/${id}/status`, { payment_status: status });
      if (res.data.success) {
        fetchPayrolls();
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const canManage = user?.role === 'super_admin' || user?.role === 'hr_manager' || user?.role === 'accountant';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            1.5 Payroll Management & Nigerian Statutory Compliance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated monthly payroll generation with PAYE tax, Pension (8% emp / 10% employer), and National Housing Fund (NHF 2.5%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 shadow-xs"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 shadow-xs"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          {canManage && (
            <button
              onClick={handleGenerateBatch}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate Batch
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionFeedback}
        </div>
      )}

      {/* KPI Stats Cards - Opedia Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Payroll</span>
          <p className="text-xl font-bold text-slate-900 mt-2">{formatMoney(summary?.total_gross || 3810000)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total before statutory deductions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Net Take-Home Pay</span>
          <p className="text-xl font-bold text-emerald-700 mt-2">{formatMoney(summary?.total_net || 2886200)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Direct NUBAN bank disbursements</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">PAYE Tax Withheld</span>
          <p className="text-xl font-bold text-purple-700 mt-2">{formatMoney(summary?.total_tax_paye || 559000)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Remittable to State Internal Revenue</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Total Pension (18%)</span>
          <p className="text-xl font-bold text-indigo-700 mt-2">{formatMoney(summary?.total_pension || 585000)}</p>
          <p className="text-[11px] text-slate-400 mt-1">8% Employee + 10% Employer</p>
        </div>
      </div>

      {/* Payroll Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {selectedMonth} {selectedYear} Payroll Schedule
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {payrolls.length} Payslips Processed
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payroll schedule...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No payroll records generated for {selectedMonth} {selectedYear}. Click "Generate Batch" to calculate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Slip #</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Basic</th>
                  <th className="py-3 px-4">Gross</th>
                  <th className="py-3 px-4">PAYE Tax</th>
                  <th className="py-3 px-4">Pension (8%)</th>
                  <th className="py-3 px-4">NHF (2.5%)</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Net Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{p.payslip_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.employee?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span>{p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : `EMP #${p.employee_id}`}</span>
                          <span className="block text-[10px] text-slate-400">{p.employee?.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{formatMoney(p.basic_salary)}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{formatMoney(p.gross_salary)}</td>
                    <td className="py-3 px-4 font-mono text-purple-700">{formatMoney(p.tax_paye)}</td>
                    <td className="py-3 px-4 font-mono text-indigo-700">{formatMoney(p.pension_employee)}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{formatMoney(p.nhf_deduction)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatMoney(p.net_salary)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.payment_status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        p.payment_status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {p.payment_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                          title="View Official Payslip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {canManage && p.payment_status === 'pending_approval' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            Approve
                          </button>
                        )}

                        {canManage && p.payment_status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'paid')}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 border border-slate-200">
            {/* Header / Employer Details */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                    H
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{company?.name || 'Innowise Africa Ltd'}</h3>
                    <p className="text-[11px] text-slate-500">{company?.address || 'Victoria Island, Lagos, Nigeria'}</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-2">TIN: {company?.tax_id || 'TIN-98745612-0001'}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                  Official Payslip
                </span>
                <p className="text-xs font-mono text-slate-600 font-semibold mt-2">{selectedPayslip.payslip_number}</p>
                <p className="text-xs text-slate-500">{selectedPayslip.month} {selectedPayslip.year}</p>
              </div>
            </div>

            {/* Employee Particulars */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="text-slate-400">Employee Name:</p>
                <p className="font-bold text-slate-800">{selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}</p>
                <p className="text-slate-400 mt-1.5">Designation:</p>
                <p className="font-semibold text-slate-700">{selectedPayslip.employee?.designation}</p>
              </div>
              <div>
                <p className="text-slate-400">Bank & Account:</p>
                <p className="font-bold text-slate-800">{selectedPayslip.employee?.bank_name} - {selectedPayslip.employee?.bank_account_number}</p>
                <p className="text-slate-400 mt-1.5">BVN / Tax ID:</p>
                <p className="font-mono text-slate-700">{selectedPayslip.employee?.tax_bvn_number}</p>
              </div>
            </div>

            {/* Earnings and Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 text-emerald-700">
                  Earnings
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.basic_salary)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Housing Allowance</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.housing_allowance)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Transport Allowance</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.transport_allowance)}</span>
                </div>
                {selectedPayslip.bonuses > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Performance Bonuses</span>
                    <span className="font-mono">{formatMoney(selectedPayslip.bonuses)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Gross Earnings:</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.gross_salary)}</span>
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 text-purple-700">
                  Statutory Deductions
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">PAYE Tax Withheld</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.tax_paye)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Employee Pension (8%)</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.pension_employee)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Employer Pension (10%)</span>
                  <span className="font-mono text-slate-400">{formatMoney(selectedPayslip.pension_employer)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">NHF (2.5% Basic)</span>
                  <span className="font-mono">{formatMoney(selectedPayslip.nhf_deduction)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-purple-900">
                  <span>Total Deductions:</span>
                  <span className="font-mono">
                    {formatMoney(
                      Number(selectedPayslip.tax_paye) +
                      Number(selectedPayslip.pension_employee) +
                      Number(selectedPayslip.nhf_deduction)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-emerald-900">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block">Total Net Salary Paid</span>
                <span className="text-xs text-emerald-600">Disbursed to Access Bank Plc · NUBAN 0123456789</span>
              </div>
              <span className="text-2xl font-mono font-bold">{formatMoney(selectedPayslip.net_salary)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Generated securely by Antigravity Cloud Platform</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Payslip
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
