import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Calendar, 
  Download, 
  Printer,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import { Quotation, CustomerAccount } from '../../types';

export const QuotationsView: React.FC = () => {
  const { company } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    customer_account_id: '',
    item_name: 'Enterprise Cloud Deployment & Consulting',
    quantity: '1',
    unit_price: '5000000',
    discount_amount: '0',
    valid_until: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    terms: 'Payment 70% upfront advance upon contract sign-off, 30% upon acceptance test sign-off.',
  });

  const fetchData = async () => {
    try {
      const [qRes, accRes] = await Promise.all([
        api.get('/crm/quotations'),
        api.get('/crm/accounts'),
      ]);
      if (qRes.data.success) setQuotations(qRes.data.data);
      if (accRes.data.success) setAccounts(accRes.data.data);
    } catch (e) {
      console.error('Failed to load quotations:', e);
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
      const qty = parseInt(formData.quantity) || 1;
      const price = parseFloat(formData.unit_price) || 0;
      const subtotal = qty * price;

      const res = await api.post('/crm/quotations', {
        customer_account_id: parseInt(formData.customer_account_id) || (accounts[0]?.id || 1),
        subtotal: subtotal,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        valid_until: formData.valid_until,
        terms_and_conditions: formData.terms,
        items: [
          {
            name: formData.item_name,
            qty: qty,
            unit_price: price,
            total: subtotal,
          }
        ],
      });

      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Commercial proposal created successfully!' });
        setTimeout(() => {
          setShowAddModal(false);
          setFeedback(null);
          fetchData();
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to create quotation' });
    }
  };

  const handleUpdateStatus = async (id: number, status: 'accepted' | 'rejected' | 'sent') => {
    try {
      const res = await api.put(`/crm/quotations/${id}/status`, { status });
      if (res.data.success) {
        fetchData();
        if (selectedQuote && selectedQuote.id === id) {
          setSelectedQuote(res.data.data);
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filtered = quotations.filter((q) => {
    const matchSearch = q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      (q.customer_account?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      q.status.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalPipelineQuotes = quotations.reduce((acc, curr) => acc + Number(curr.grand_total), 0);
  const acceptedQuotes = quotations.filter(q => q.status === 'accepted').reduce((acc, curr) => acc + Number(curr.grand_total), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            2.8 Commercial Quotations & Proposals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal B2B sales quotations, apply Nigerian 7.5% VAT, manage price discounts, and track client sign-offs.
          </p>
        </div>

        <button
          onClick={() => {
            if (accounts.length > 0) setFormData(prev => ({ ...prev, customer_account_id: accounts[0].id.toString() }));
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Quotations Issued</p>
            <p className="text-xl font-bold text-slate-900">{formatMoney(totalPipelineQuotes)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Accepted Proposals</p>
            <p className="text-xl font-bold text-slate-900">{formatMoney(acceptedQuotes)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Target Accounts</p>
            <p className="text-xl font-bold text-slate-900">{accounts.length} B2B Accounts</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations by quote #, client name, or status..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading quotations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No commercial quotations found</p>
            <p className="text-xs text-slate-500 mt-1">Generate your first quotation using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">VAT (7.5%)</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {quote.quotation_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {quote.customer_account?.name || 'Enterprise Client'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{formatMoney(quote.subtotal)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{formatMoney(quote.tax_amount)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatMoney(quote.grand_total)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{quote.valid_until || '30 days'}</td>
                    <td className="py-3.5 px-4">
                      {quote.status === 'accepted' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Accepted
                        </span>
                      )}
                      {quote.status === 'sent' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Sent to Client
                        </span>
                      )}
                      {quote.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      )}
                      {quote.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="View Full Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {quote.status === 'sent' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'accepted')}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded text-[10px]"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                              className="px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded text-[10px]"
                            >
                              Decline
                            </button>
                          </>
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

      {/* View Quotation Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  OFFICIAL COMMERCIAL PROPOSAL
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedQuote.quotation_number}</h3>
                <p className="text-xs text-slate-500">Prepared for: <strong>{selectedQuote.customer_account?.name}</strong></p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Deliverable / Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedQuote.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900">{it.name}</td>
                      <td className="p-3 text-slate-600">{it.qty}</td>
                      <td className="p-3 font-mono text-slate-600">{formatMoney(it.unit_price)}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 text-right">{formatMoney(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-2 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatMoney(selectedQuote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-mono text-rose-600">-{formatMoney(selectedQuote.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Nigerian VAT (7.5%):</span>
                  <span className="font-mono font-medium">{formatMoney(selectedQuote.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span className="font-mono text-purple-700">{formatMoney(selectedQuote.grand_total)}</span>
                </div>
              </div>
            </div>

            {selectedQuote.terms_and_conditions && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-bold text-slate-800 mb-0.5">Commercial Terms & Conditions:</p>
                <p>{selectedQuote.terms_and_conditions}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Valid until: {selectedQuote.valid_until}</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quotation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Draft Commercial Quotation
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
                <label className="block text-slate-700 font-semibold mb-1">Customer Account *</label>
                <select
                  required
                  value={formData.customer_account_id}
                  onChange={(e) => setFormData({ ...formData, customer_account_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Scope / Deliverable *</label>
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit Rate ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
                <textarea
                  rows={2}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Generate Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
