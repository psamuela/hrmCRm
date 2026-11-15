import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  TrendingUp, 
  MapPin,
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { CustomerAccount } from '../../types';

export const AccountsView: React.FC = () => {
  const { company } = useAuth();
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    type: 'corporate',
    tier: 'growth',
    email: '',
    phone: '',
    website: '',
    billing_address: '',
  });

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/crm/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/crm/accounts', formData);
      if (res.data.success) {
        setShowAddModal(false);
        fetchAccounts();
      }
    } catch (e) {
      console.error('Create account error:', e);
    }
  };

  const currencySymbol = company?.currency_symbol || '₦';

  const filtered = accounts.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.industry && a.industry.toLowerCase().includes(search.toLowerCase())) ||
    a.account_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            2.3 Customer & B2B Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain organizations, corporate hierarchies, lifetime customer value (LTV), contacts, and deal histories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer Account
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by name, code, industry..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} Customer Accounts
        </span>
      </div>

      {/* Grid of Accounts */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading customer accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((acc) => (
            <div key={acc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{acc.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{acc.industry || 'Corporate Client'}</p>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{acc.account_code}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    acc.tier === 'vip' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    acc.tier === 'enterprise' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {acc.tier}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {acc.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{acc.email}</span>
                    </div>
                  )}
                  {acc.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{acc.phone}</span>
                    </div>
                  )}
                  {acc.billing_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{acc.billing_address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Lifetime Revenue:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {currencySymbol}{Number(acc.lifetime_revenue).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                Add Customer Account
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flutterwave Technologies"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Industry Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. FinTech / Banking"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="vip">VIP / Strategic</option>
                    <option value="starter">Starter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Billing Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Registered Billing Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
