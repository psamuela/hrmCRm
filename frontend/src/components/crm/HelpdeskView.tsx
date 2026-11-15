import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Headphones, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  User,
  ShieldCheck,
  Building
} from 'lucide-react';
import api from '../../services/api';
import { SupportTicket } from '../../types';

export const HelpdeskView: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/crm/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
        if (!selectedTicket && res.data.data.length > 0) {
          setSelectedTicket(res.data.data[0]);
        } else if (selectedTicket) {
          const updated = res.data.data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error('Failed to load tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.post(`/crm/tickets/${selectedTicket.id}/reply`, {
        message: replyText,
      });
      if (res.data.success) {
        setReplyText('');
        fetchTickets();
      }
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-rose-600" />
          2.15 Customer Support & Helpdesk Ticketing
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          SLA-backed multi-channel customer ticketing, priority escalation, agent assignments, and client satisfaction (CSAT).
        </p>
      </div>

      {/* Main Split Interface */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading support desk...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ticket Queue ({tickets.length})
              </h3>
              <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.priority === 'urgent').length} Urgent
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[550px]">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedTicket?.id === t.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-indigo-700">{t.ticket_number}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                      t.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.customer_account?.name}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="capitalize">{t.status.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Clock className="w-2.5 h-2.5" /> SLA: 4h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Thread & Conversation Pane */}
          {selectedTicket ? (
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between min-h-[550px]">
              {/* Ticket Top Info */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700 text-xs">{selectedTicket.ticket_number}</span>
                    <span className="text-[11px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedTicket.status === 'open' ? 'bg-amber-100 text-amber-800' :
                    selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {selectedTicket.customer_account?.name}
                </p>
              </div>

              {/* Messages Flow */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Initial Client Issue Description
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedTicket.description}</p>
                </div>

                {(selectedTicket.messages || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'support' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-700">{msg.name}</span>
                      <span>· {msg.time}</span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                      msg.sender === 'support' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type an official support resolution or reply to customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={replyLoading || !replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 flex items-center justify-center">
              Select a ticket from the queue to review customer conversation history.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
