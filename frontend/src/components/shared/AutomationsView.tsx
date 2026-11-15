import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause, 
  Sparkles,
  GitBranch,
  BellRing
} from 'lucide-react';
import api from '../../services/api';
import { WorkflowAutomation } from '../../types';

export const AutomationsView: React.FC = () => {
  const [automations, setAutomations] = useState<WorkflowAutomation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/automations');
      if (res.data.success) {
        setAutomations(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load automations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const res = await api.post(`/automations/${id}/toggle`);
      if (res.data.success) {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
      }
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          4.3 Cross-Module Business Automation & Workflows
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Event-driven automations uniting HRM events (leave, payroll) with CRM operations (lead routing, deal closure, invoice generation).
        </p>
      </div>

      {/* Automations Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading automation workflows...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                auto.is_active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      auto.is_active ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{auto.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Trigger: {auto.trigger_event}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(auto.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                      auto.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {auto.is_active ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                    {auto.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {auto.description}
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Action:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                    {auto.action_type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Total Executions:</span>
                <span className="font-bold text-slate-700 font-mono">{auto.execution_count} runs</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
