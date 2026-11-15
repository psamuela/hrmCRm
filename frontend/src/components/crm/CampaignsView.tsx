import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, 
  Plus, 
  Search, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  TrendingUp, 
  X,
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { CrmCampaign } from '../../types';

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    channel: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    target_segment: 'Qualified Pipeline Prospects',
    recipients_count: '250',
    message_body: 'Hello from Innowise Africa! We are pleased to announce our year-end ERP and HR modernization discount of 20% for leading Nigerian enterprises. Reply to this WhatsApp to schedule a demo.',
  });

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/crm/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await api.post('/crm/campaigns', {
        ...formData,
        recipients_count: parseInt(formData.recipients_count) || 100,
      });

      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Campaign broadcast dispatched successfully!' });
        setTimeout(() => {
          setShowAddModal(false);
          setFeedback(null);
          setFormData({
            name: '',
            channel: 'whatsapp',
            target_segment: 'Qualified Pipeline Prospects',
            recipients_count: '250',
            message_body: '',
          });
          fetchCampaigns();
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to dispatch campaign' });
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.target_segment.toLowerCase().includes(search.toLowerCase());
    const matchChan = selectedChannel === 'all' || c.channel === selectedChannel;
    return matchSearch && matchChan;
  });

  const totalAudience = campaigns.reduce((acc, c) => acc + (c.recipients_count || 0), 0);
  const avgOpenRate = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + Number(c.open_rate), 0) / campaigns.length).toFixed(1)
    : '55.0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-600" />
            2.13 Multi-Channel Marketing & Outreach Campaigns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute WhatsApp business broadcasts, targeted email drips, and SMS alerts to prospective accounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          Launch New Campaign
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Contacts Reached</p>
            <p className="text-xl font-bold text-slate-900">{totalAudience.toLocaleString()} Leads</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Average Engagement Rate</p>
            <p className="text-xl font-bold text-slate-900">{avgOpenRate}% Open Rate</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Primary Channel</p>
            <p className="text-xl font-bold text-slate-900">WhatsApp Business API</p>
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
            placeholder="Search campaigns by name or target audience..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none text-slate-700"
        >
          <option value="all">All Channels</option>
          <option value="whatsapp">WhatsApp Broadcasts</option>
          <option value="email">Email Campaigns</option>
          <option value="sms">SMS Outreach</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading campaigns...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No campaigns launched yet</p>
            <p className="text-xs text-slate-500 mt-1">Start your first customer outreach using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Audience Segment</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Open Rate</th>
                  <th className="py-3 px-4">Click-Through</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {camp.name}
                      {camp.message_body && (
                        <p className="text-[11px] font-normal text-slate-500 max-w-xs truncate">{camp.message_body}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {camp.channel === 'whatsapp' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </span>
                      )}
                      {camp.channel === 'email' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Mail className="w-3 h-3" /> Email
                        </span>
                      )}
                      {camp.channel === 'sms' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Smartphone className="w-3 h-3" /> SMS
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{camp.target_segment}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{camp.recipients_count} contacts</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {camp.open_rate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{camp.click_rate}%</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Launch Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-600" />
                Launch Multi-Channel Broadcast Campaign
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
                <label className="block text-slate-700 font-semibold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Q4 Executive ERP Modernization Promo"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Outreach Channel *</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="whatsapp">WhatsApp Business Broadcast (Recommended)</option>
                    <option value="email">Email Newsletter Blast</option>
                    <option value="sms">SMS Text Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Recipient Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.recipients_count}
                    onChange={(e) => setFormData({ ...formData, recipients_count: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Audience Segment *</label>
                <select
                  value={formData.target_segment}
                  onChange={(e) => setFormData({ ...formData, target_segment: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="All Captured Inbound Leads">All Captured Inbound Leads</option>
                  <option value="Qualified Pipeline Prospects">Qualified Pipeline Prospects</option>
                  <option value="VIP Commercial Accounts">VIP Commercial Accounts</option>
                  <option value="Cold Industry Outreaches">Cold Industry Outreaches</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Broadcast Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message_body}
                  onChange={(e) => setFormData({ ...formData, message_body: e.target.value })}
                  placeholder="Enter message template..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-sans"
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Send Broadcast Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
