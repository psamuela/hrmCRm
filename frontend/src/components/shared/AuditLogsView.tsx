import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchSearch = l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchMod = selectedModule === 'all' || l.module.toLowerCase() === selectedModule.toLowerCase();
    return matchSearch && matchMod;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          3.8 Platform Audit Logs & Security Trails
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident system activity logging, role permission checks, transaction tracking, and forensic auditing.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, detail..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none text-slate-700"
        >
          <option value="all">All Security Modules</option>
          <option value="hrm">HRM Module</option>
          <option value="crm">CRM Module</option>
          <option value="finance">Finance / Payroll</option>
          <option value="auth">Authentication</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit trail...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.user_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.module === 'HRM' ? 'bg-blue-100 text-blue-700' :
                        log.module === 'CRM' ? 'bg-emerald-100 text-emerald-700' :
                        log.module === 'FINANCE' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
