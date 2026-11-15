import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  Calendar,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { ExpenseClaim } from '../../types';

export const ExpensesView: React.FC = () => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'transport',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/hrm/expenses');
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load expenses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await api.post('/hrm/expenses', {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      });

      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Expense claim submitted successfully!' });
        setTimeout(() => {
          setShowAddModal(false);
          setFeedback(null);
          setFormData({
            title: '',
            category: 'transport',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
          });
          fetchExpenses();
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to submit expense' });
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected' | 'reimbursed') => {
    try {
      const res = await api.put(`/hrm/expenses/${id}/status`, { status });
      if (res.data.success) {
        fetchExpenses();
      }
    } catch (e) {
      console.error('Failed to update expense status:', e);
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filtered = expenses.filter((exp) => {
    const matchSearch = exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.employee?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (exp.employee?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'all' || exp.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const approvedTotal = expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((acc, c) => acc + Number(c.amount), 0);

  const canApprove = user?.role === 'super_admin' || user?.role === 'hr_manager' || user?.role === 'accountant';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            1.9 Expense & Reimbursement Claims
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit, approve, and disburse official corporate travel, transportation, client entertainment, and equipment claims.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit Expense Claim
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Claims Incurred</p>
            <p className="text-xl font-bold text-slate-900">{formatMoney(totalAmount)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pending Review</p>
            <p className="text-xl font-bold text-slate-900">{pendingCount} Claims</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Approved / Reimbursed</p>
            <p className="text-xl font-bold text-slate-900">{formatMoney(approvedTotal)}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, staff member, or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="reimbursed">Reimbursed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading expense claims...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No expense claims found</p>
            <p className="text-xs text-slate-500 mt-1">Submit your receipt claims using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Claim Title</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  {canApprove && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {claim.title}
                      {claim.description && (
                        <p className="text-[11px] font-normal text-slate-500 max-w-xs truncate">{claim.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{claim.employee?.first_name} {claim.employee?.last_name}</p>
                      <p className="text-[10px] text-slate-400">{claim.employee?.designation}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {claim.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{claim.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatMoney(claim.amount)}</td>
                    <td className="py-3.5 px-4">
                      {claim.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Approved
                        </span>
                      )}
                      {claim.status === 'reimbursed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Disbursed
                        </span>
                      )}
                      {claim.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </td>
                    {canApprove && (
                      <td className="py-3.5 px-4 text-right">
                        {claim.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded text-[11px] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {claim.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, 'reimbursed')}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded text-[11px] transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                Submit New Expense Claim
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 my-3 rounded-lg text-xs flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Claim Title / Purpose *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flight to Abuja Client Meeting"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="transport">Transportation / Taxi</option>
                    <option value="travel">Inter-state Flight / Rail</option>
                    <option value="accommodation">Hotel / Accommodation</option>
                    <option value="meals">Client Meals & Hospitality</option>
                    <option value="equipment">Hardware / Equipment</option>
                    <option value="software">Software / Cloud Licenses</option>
                    <option value="other">Other Operational Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="45000"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date Incurred *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detailed Description & Receipt Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reference invoice # or project code related to this expenditure..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
