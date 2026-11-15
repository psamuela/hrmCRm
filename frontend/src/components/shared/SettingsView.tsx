import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  Layers, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard,
  Zap,
  Globe,
  Plus,
  MapPin,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { SubscriptionPlan, Branch } from '../../types';

export const SettingsView: React.FC = () => {
  const { company, plan, updateSubscriptionPlan, activeSubmenu, setActiveSubmenu } = useAuth();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Tab: fallback to activeSubmenu if valid, or default to 'packages'
  const currentTab = ['branches', 'packages', 'statutory'].includes(activeSubmenu) 
    ? activeSubmenu 
    : 'packages';

  // Statutory Rates State
  const [pensionEmp, setPensionEmp] = useState('8.0');
  const [pensionEmployer, setPensionEmployer] = useState('10.0');
  const [nhfRate, setNhfRate] = useState('2.5');
  const [vatRate, setVatRate] = useState('7.5');

  // Branches State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    city: 'Lagos',
    address: '',
    is_headquarters: false,
  });

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load branches:', e);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    if (company?.settings) {
      if (company.settings.pension_rate_employee) setPensionEmp(company.settings.pension_rate_employee.toString());
      if (company.settings.pension_rate_employer) setPensionEmployer(company.settings.pension_rate_employer.toString());
      if (company.settings.nhf_rate) setNhfRate(company.settings.nhf_rate.toString());
      if (company.settings.vat_rate) setVatRate(company.settings.vat_rate.toString());
    }
  }, [company]);

  const handlePlanSelect = async (newPlan: SubscriptionPlan) => {
    try {
      await updateSubscriptionPlan(newPlan);
      setFeedback({
        type: 'success',
        text: `Active subscription switched to ${newPlan.toUpperCase().replace('_', ' ')}`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to update plan' });
    }
  };

  const handleSaveStatutory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/companies/statutory', {
        pension_rate_employee: parseFloat(pensionEmp),
        pension_rate_employer: parseFloat(pensionEmployer),
        nhf_rate: parseFloat(nhfRate),
        vat_rate: parseFloat(vatRate),
      });
      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Nigerian statutory deduction rates saved to company profile!' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to save statutory rates' });
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/branches', branchForm);
      if (res.data.success) {
        setShowAddBranchModal(false);
        setBranchForm({ name: '', code: '', city: 'Lagos', address: '', is_headquarters: false });
        setFeedback({ type: 'success', text: 'New branch location added successfully!' });
        setTimeout(() => setFeedback(null), 3000);
        fetchBranches();
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.response?.data?.message || 'Failed to create branch' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          3.7 Platform Administration & Enterprise Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure subscription licensing tiers, multi-branch office footprints, Nigerian statutory compliance, and gateways.
        </p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {feedback.text}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubmenu('packages')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            currentTab === 'packages'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Subscription Packages
        </button>

        <button
          onClick={() => setActiveSubmenu('branches')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            currentTab === 'branches'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          3.3 Multi-Company & Branches
        </button>

        <button
          onClick={() => setActiveSubmenu('statutory')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            currentTab === 'statutory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Tax & Statutory Deductions
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION PACKAGES */}
      {currentTab === 'packages' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Software Subscription Package & Feature Licensing
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Companies purchasing only HRM will have CRM hidden, and vice-versa. Switch packages below to test module isolation:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Plan 1: HRM Package */}
            <div className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
              plan === 'hrm_only' ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Package 1</span>
                  {plan === 'hrm_only' && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">HRM Package</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Dedicated human resource management for companies managing staff, payroll, and attendance.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Employee Profiles & Onboarding</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Biometric & Web Attendance</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Leave Management & Approvals</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Nigerian PAYE, Pension & NHF</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Recruitment & AI ATS</li>
                  <li className="flex items-center gap-2 text-slate-400 line-through">CRM Sales Pipeline (Disabled)</li>
                </ul>
              </div>

              <button
                onClick={() => handlePlanSelect('hrm_only')}
                disabled={plan === 'hrm_only'}
                className={`mt-5 w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                  plan === 'hrm_only' ? 'bg-blue-100 text-blue-700 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {plan === 'hrm_only' ? 'Current Package' : 'Activate HRM Only'}
              </button>
            </div>

            {/* Plan 2: CRM Package */}
            <div className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
              plan === 'crm_only' ? 'border-emerald-600 bg-emerald-50/30 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Package 2</span>
                  {plan === 'crm_only' && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">CRM Package</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sales-driven customer relationship platform for closing deals, sending quotes, and managing revenue.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Inbound Lead Capture & Scoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sales Pipeline Kanban Board</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Commercial Quotations & Invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paystack & Flutterwave Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Support Desk & SLAs</li>
                  <li className="flex items-center gap-2 text-slate-400 line-through">HR Payroll & Attendance (Disabled)</li>
                </ul>
              </div>

              <button
                onClick={() => handlePlanSelect('crm_only')}
                disabled={plan === 'crm_only'}
                className={`mt-5 w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                  plan === 'crm_only' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {plan === 'crm_only' ? 'Current Package' : 'Activate CRM Only'}
              </button>
            </div>

            {/* Plan 3: Enterprise Package */}
            <div className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
              plan === 'enterprise' ? 'border-purple-600 bg-purple-50/40 shadow-lg ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Full Enterprise</span>
                  {plan === 'enterprise' && (
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">RECOMMENDED</span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">Enterprise Platform</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Complete integrated solution uniting all HRM and CRM modules with shared cross-department workflows.
                </p>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Full HRM Suite (8 Modules)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Full CRM Suite (Sales & Helpdesk)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Multi-Company & Branch Switcher</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> AI Resume Match & Lead Scoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Cross-Module Workflow Automations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Unlimited Users & Dedicated SLA</li>
                </ul>
              </div>

              <button
                onClick={() => handlePlanSelect('enterprise')}
                disabled={plan === 'enterprise'}
                className={`mt-5 w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                  plan === 'enterprise' ? 'bg-purple-100 text-purple-700 cursor-default' : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {plan === 'enterprise' ? 'Current Package' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES & MULTI-COMPANY */}
      {currentTab === 'branches' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Branch Offices & Regional Locations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage operational branches across states for attendance geo-tracking, localized tax reporting, and headcount.
              </p>
            </div>

            <button
              onClick={() => setShowAddBranchModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Register New Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">{b.code}</span>
                    {b.is_headquarters ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        HEADQUARTERS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                        REGIONAL BRANCH
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{b.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {b.address || b.city}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                  <span>City: <strong>{b.city}</strong></span>
                  <span className="text-emerald-600 font-semibold">Active Operational Site</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY & PAYMENT RULES */}
      {currentTab === 'statutory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Configurable Nigerian Statutory Deductions
            </h3>
            <p className="text-xs text-slate-500">
              Effective-dated legislation parameters for Pension Reform Act, NHF, and Value Added Tax.
            </p>

            <form onSubmit={handleSaveStatutory} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee Pension (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={pensionEmp}
                    onChange={(e) => setPensionEmp(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employer Pension (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={pensionEmployer}
                    onChange={(e) => setPensionEmployer(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">National Housing Fund (NHF %)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={nhfRate}
                    onChange={(e) => setNhfRate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nigerian VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Statutory Rules
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Connected Payment Gateways
            </h3>
            <p className="text-xs text-slate-500">
              Payment channels enabled for instant invoice settlement and reconciliation.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Paystack Gateway API</p>
                  <p className="text-[11px] text-slate-500">Card payments, bank accounts, Apple Pay & USSD in NGN</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  CONNECTED
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Flutterwave Enterprise</p>
                  <p className="text-[11px] text-slate-500">Multi-currency pan-African payments (USD, EUR, GBP, KES)</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  CONNECTED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Register New Branch
              </h3>
              <button onClick={() => setShowAddBranchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="e.g. Port Harcourt Hub"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    placeholder="PHC-01"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="Port Harcourt"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="Street address..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
