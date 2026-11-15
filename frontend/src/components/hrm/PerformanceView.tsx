import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  Plus, 
  Search, 
  Star, 
  TrendingUp, 
  UserCheck, 
  Building2, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { PerformanceReview, Employee } from '../../types';

export const PerformanceView: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    review_period: 'Q4 2026',
    kpi_score: '4.5',
    goals_achievement: '4.2',
    manager_feedback: '',
    promotion_recommendation: false,
  });

  const fetchData = async () => {
    try {
      const [revRes, empRes] = await Promise.all([
        api.get('/hrm/performance'),
        api.get('/hrm/employees'),
      ]);
      if (revRes.data.success) setReviews(revRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (e) {
      console.error('Failed to load performance reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await api.post('/hrm/performance', {
        employee_id: parseInt(formData.employee_id) || (employees[0]?.id || 1),
        review_period: formData.review_period,
        kpi_score: parseFloat(formData.kpi_score),
        goals_achievement: parseFloat(formData.goals_achievement),
        manager_feedback: formData.manager_feedback,
        promotion_recommendation: formData.promotion_recommendation,
      });

      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Performance appraisal recorded successfully!' });
        setTimeout(() => {
          setShowAddModal(false);
          setFeedback(null);
          fetchData();
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to record appraisal' });
    }
  };

  const filtered = reviews.filter((r) => {
    const name = `${r.employee?.first_name || ''} ${r.employee?.last_name || ''}`.toLowerCase();
    const dept = r.employee?.department?.name?.toLowerCase() || '';
    const term = search.toLowerCase();
    return name.includes(term) || dept.includes(term) || r.review_period.toLowerCase().includes(term);
  });

  const avgScore = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + Number(curr.overall_score), 0) / reviews.length).toFixed(1)
    : '4.0';

  const promotionsRecommended = reviews.filter(r => r.promotion_recommendation).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500" />
            1.6 Performance Management & 360 Appraisals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate employee quarterly KPIs, goals achievement, 360-degree feedback, and promotion pipelines.
          </p>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setFormData(prev => ({ ...prev, employee_id: employees[0].id.toString() }));
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          Conduct Review / Appraisal
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Average Performance Rating</p>
            <p className="text-xl font-bold text-slate-900">{avgScore} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Promotion Recommendations</p>
            <p className="text-xl font-bold text-slate-900">{promotionsRecommended} Staff</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Reviews Recorded</p>
            <p className="text-xl font-bold text-slate-900">{reviews.length} Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appraisals by staff name, department, or period..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading performance records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No performance appraisals found</p>
            <p className="text-xs text-slate-500 mt-1">Click "Conduct Review / Appraisal" to log employee evaluation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">KPI Score</th>
                  <th className="py-3 px-4">Goals Achieved</th>
                  <th className="py-3 px-4">Overall Score</th>
                  <th className="py-3 px-4">Manager Feedback</th>
                  <th className="py-3 px-4">Promotion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.employee?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{rev.employee?.first_name} {rev.employee?.last_name}</p>
                          <p className="text-[11px] text-slate-400">{rev.employee?.designation} · {rev.employee?.department?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{rev.review_period}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{rev.kpi_score} / 5.0</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{rev.goals_achievement} / 5.0</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ★ {rev.overall_score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={rev.manager_feedback}>
                      {rev.manager_feedback || 'Meets and exceeds quarterly performance expectations.'}
                    </td>
                    <td className="py-3.5 px-4">
                      {rev.promotion_recommendation ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Recommended
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Maintained
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-600" />
                Record Employee Performance Appraisal
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
                <label className="block text-slate-700 font-semibold mb-1">Select Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Review Period *</label>
                  <input
                    type="text"
                    required
                    value={formData.review_period}
                    onChange={(e) => setFormData({ ...formData, review_period: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                    placeholder="Q4 2026"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">KPI Score (1-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={formData.kpi_score}
                    onChange={(e) => setFormData({ ...formData, kpi_score: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Goals Score (1-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={formData.goals_achievement}
                    onChange={(e) => setFormData({ ...formData, goals_achievement: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Manager Appraisal Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.manager_feedback}
                  onChange={(e) => setFormData({ ...formData, manager_feedback: e.target.value })}
                  placeholder="Summarize key accomplishments, technical delivery, leadership strengths, and improvement areas..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promRec"
                  checked={formData.promotion_recommendation}
                  onChange={(e) => setFormData({ ...formData, promotion_recommendation: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <label htmlFor="promRec" className="text-slate-700 font-semibold">
                  Recommend for Merit Promotion & Salary Increment
                </label>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
