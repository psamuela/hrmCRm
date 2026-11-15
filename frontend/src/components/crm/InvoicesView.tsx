import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileCheck2, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  DollarSign,
  Plus,
  X,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import { Invoice } from '../../types';

export const InvoicesView: React.FC = () => {
  const { company } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave' | 'bank_transfer'>('paystack');
  const [reference, setReference] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/crm/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await api.post(`/crm/invoices/${selectedInvoice.id}/pay`, {
        amount: parseFloat(paymentAmount),
        payment_gateway: paymentGateway,
        reference: reference || `PAY_${Date.now()}`,
      });
      if (res.data.success) {
        setShowPaymentModal(false);
        setFeedback('Payment logged and reconciled successfully!');
        setTimeout(() => setFeedback(null), 4000);
        fetchInvoices();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const formatMoney = (val: number) => {
    return `${currencySymbol}${Number(val || 0).toLocaleString()}`;
  };

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            2.10 Invoice & Payment Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue itemized commercial invoices, track partial disbursements, and reconcile Paystack / Flutterwave and Nigerian bank transfers.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Invoiced</span>
          <p className="text-xl font-bold text-slate-900 mt-2">{formatMoney(totalInvoiced)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Total Collected</span>
          <p className="text-xl font-bold text-emerald-700 mt-2">{formatMoney(totalPaid)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Outstanding Balance</span>
          <p className="text-xl font-bold text-amber-700 mt-2">{formatMoney(totalOutstanding)}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Commercial Invoices</h3>
          <span className="text-xs text-slate-400 font-medium">{invoices.length} Invoices</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Payment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inv.customer_account?.name || 'Customer Corp'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.issue_date}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.due_date}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatMoney(inv.total_amount)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{formatMoney(inv.paid_amount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inv.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        inv.payment_status === 'partially_paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.payment_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.payment_status !== 'paid' ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount((inv.total_amount - inv.paid_amount).toString());
                            setShowPaymentModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Fully Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Client Payment</h3>
                <p className="text-xs text-slate-500">{selectedInvoice.invoice_number} · {selectedInvoice.customer_account?.name}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount to Record ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Gateway / Method *</label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="paystack">Paystack Gateway Integration</option>
                  <option value="flutterwave">Flutterwave Gateway</option>
                  <option value="bank_transfer">Direct Nigerian NIP Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gateway Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. PSTK_TX_987654321"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Reconcile Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
