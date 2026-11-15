import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarDays, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import { LeaveRequest } from '../../types';

export const LeaveView: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    days_count: 3,
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/hrm/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load leaves:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await api.post('/hrm/leaves', formData);
      if (res.data.success) {
        setFormMsg({ type: 'success', text: 'Leave application submitted successfully!' });
        setTimeout(() => {
          setShowApplyModal(false);
          setFormMsg(null);
          fetchLeaves();
        }, 1200);
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit application' });
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await api.put(`/hrm/leaves/${id}/status`, { status });
      if (res.data.success) {
        fetchLeaves();
      }
    } catch (e) {
      console.error('Failed to update leave status:', e);
    }
  };

  const canApprove = user?.role === 'super_admin' || user?.role === 'hr_manager';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-500" />
            1.4 Leave & Absence Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure leave entitlements, multi-level approvals, carry-forward accruals, and team leave schedules.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Annual Leave</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800">20</span>
            <span className="text-xs text-slate-400">/ 20 Days Available</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Sick Leave</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800">10</span>
            <span className="text-xs text-slate-400">/ 10 Days Available</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Casual Leave</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800">5</span>
            <span className="text-xs text-slate-400">/ 5 Days Available</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Pending Approvals</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">
              {leaves.filter(l => l.status === 'pending').length}
            </span>
            <span className="text-xs text-slate-400">Awaiting Manager</span>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Company Leave Applications</h3>
          <span className="text-xs text-slate-400 font-medium">{leaves.length} Applications</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  {canApprove && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <img
                          src={l.employee?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span>{l.employee ? `${l.employee.first_name} ${l.employee.last_name}` : `EMP #${l.employee_id}`}</span>
                          <span className="block text-[10px] text-slate-400">{l.employee?.department?.name || 'Staff'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {l.leave_type} Leave
                      </span>
                    </td>
                    <td className="py-3 px-4">{l.start_date}</td>
                    <td className="py-3 px-4">{l.end_date}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{l.days_count} Days</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        l.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="py-3 px-4 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'approved')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'rejected')}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Processed</span>
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-600" />
                Submit Leave Application
              </h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Leave Category</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Days</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.days_count}
                  onChange={(e) => setFormData({ ...formData, days_count: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide context for manager approval..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
