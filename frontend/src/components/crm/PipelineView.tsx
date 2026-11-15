import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Kanban, 
  Plus, 
  TrendingUp, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import { Deal, CustomerAccount, PipelineStage } from '../../types';

const STAGES: { id: PipelineStage; label: string; bg: string }[] = [
  { id: 'lead', label: '01 New Lead', bg: 'border-t-4 border-t-slate-400' },
  { id: 'qualification', label: '02 Qualification', bg: 'border-t-4 border-t-blue-500' },
  { id: 'proposal', label: '03 Proposal Sent', bg: 'border-t-4 border-t-purple-500' },
  { id: 'negotiation', label: '04 Negotiation', bg: 'border-t-4 border-t-amber-500' },
  { id: 'closed_won', label: '05 Closed Won', bg: 'border-t-4 border-t-emerald-500' },
];

export const PipelineView: React.FC = () => {
  const { company } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    customer_account_id: '',
    deal_value: '',
    pipeline_stage: 'lead' as PipelineStage,
    probability_percent: 50,
    expected_closing_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    notes: '',
  });

  const fetchPipeline = async () => {
    try {
      const [dealsRes, accRes] = await Promise.all([
        api.get('/crm/deals'),
        api.get('/crm/accounts'),
      ]);
      if (dealsRes.data.success) setDeals(dealsRes.data.data);
      if (accRes.data.success) setAccounts(accRes.data.data);
    } catch (e) {
      console.error('Failed to load deals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleStageChange = async (dealId: number, newStage: PipelineStage) => {
    try {
      const res = await api.put(`/crm/deals/${dealId}/stage`, { pipeline_stage: newStage });
      if (res.data.success) {
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, pipeline_stage: newStage } : d));
      }
    } catch (e) {
      console.error('Stage change error:', e);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/crm/deals', {
        ...formData,
        deal_value: parseFloat(formData.deal_value) || 1000000,
        customer_account_id: parseInt(formData.customer_account_id) || (accounts[0]?.id || 1),
      });
      if (res.data.success) {
        setShowAddModal(false);
        fetchPipeline();
      }
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Failed to create deal');
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString()}`;
  };

  const totalPipeline = deals
    .filter(d => d.pipeline_stage !== 'closed_lost')
    .reduce((sum, d) => sum + Number(d.deal_value), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-emerald-600" />
            2.4 Sales Pipeline Management (Kanban)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize deal velocity, manage stage movement from lead to closed won, and forecast quarterly revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Pipeline</span>
            <p className="text-sm font-bold text-emerald-700">{formatMoney(totalPipeline)}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Deal Opportunity
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading pipeline deals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.pipeline_stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.deal_value), 0);

            return (
              <div 
                key={stage.id} 
                className={`bg-slate-100/70 p-3 rounded-xl border border-slate-200/90 min-h-[460px] flex flex-col justify-between ${stage.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                    <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold font-mono text-slate-600 mb-3">
                    {formatMoney(stageTotal)}
                  </p>

                  <div className="space-y-2.5">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {deal.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{deal.customer_account?.name || 'Enterprise Client'}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-sm font-bold font-mono text-emerald-700">
                            {formatMoney(deal.deal_value)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {deal.probability_percent}% prob
                          </span>
                        </div>

                        {/* Stage Mover Buttons */}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Move:</span>
                          <select
                            value={deal.pipeline_stage}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as PipelineStage)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
                          >
                            <option value="lead">01 Lead</option>
                            <option value="qualification">02 Qual</option>
                            <option value="proposal">03 Proposal</option>
                            <option value="negotiation">04 Negot</option>
                            <option value="closed_won">05 Won</option>
                            <option value="closed_lost">Lost</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] text-slate-400">
                  {stageDeals.length === 0 && 'No deals in this stage'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Create New Deal Opportunity
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud License + SLA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Account *</label>
                <select
                  value={formData.customer_account_id}
                  onChange={(e) => setFormData({ ...formData, customer_account_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Account</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.tier})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deal Value (₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="15000000"
                    value={formData.deal_value}
                    onChange={(e) => setFormData({ ...formData, deal_value: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={formData.pipeline_stage}
                    onChange={(e) => setFormData({ ...formData, pipeline_stage: e.target.value as PipelineStage })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="lead">01 Lead</option>
                    <option value="qualification">02 Qualification</option>
                    <option value="proposal">03 Proposal</option>
                    <option value="negotiation">04 Negotiation</option>
                    <option value="closed_won">05 Closed Won</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Closing Date</label>
                <input
                  type="date"
                  value={formData.expected_closing_date}
                  onChange={(e) => setFormData({ ...formData, expected_closing_date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
