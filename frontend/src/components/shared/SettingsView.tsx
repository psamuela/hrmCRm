import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sliders, 
  Layers, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard,
  Zap,
  Globe
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';

export const SettingsView: React.FC = () => {
  const { company, plan, updateSubscriptionPlan } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Settings State
  const [pensionEmp, setPensionEmp] = useState('8.0');
  const [pensionEmployer, setPensionEmployer] = useState('10.0');
  const [nhfRate, setNhfRate] = useState('2.5');
  const [vatRate, setVatRate] = useState('7.5');
  const [paystackActive, setPaystackActive] = useState(true);
  const [flutterwaveActive, setFlutterwaveActive] = useState(true);

  const handlePlanSelect = async (newPlan: SubscriptionPlan) => {
    await updateSubscriptionPlan(newPlan);
    setFeedback(`Active subscription switched to ${newPlan.toUpperCase().replace('_', ' ')}`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveStatutory = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Nigerian statutory deduction rates saved successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          3.7 Platform Administration & Subscription Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure subscription licensing, Nigerian statutory tax policies, payment gateways, and multi-tenant isolation.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Subscription Packaging Section (The Business Model Specified by User) */}
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

          {/* Plan 3: Enterprise Package (Both HRM + CRM) */}
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

      {/* Nigerian Tax & Statutory Rules Form */}
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
                  type="text"
                  value={pensionEmp}
                  onChange={(e) => setPensionEmp(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employer Pension (%)</label>
                <input
                  type="text"
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
                  type="text"
                  value={nhfRate}
                  onChange={(e) => setNhfRate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nigerian VAT Rate (%)</label>
                <input
                  type="text"
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

        {/* Payment Gateways & Branch Profiles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            Payment Gateway & Branch Locations
          </h3>
          <p className="text-xs text-slate-500">
            Connected payment infrastructure for processing online customer card payments.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Paystack Gateway API</p>
                <p className="text-[11px] text-slate-500">Auto-reconciliation for Nigerian Naira cards and USSD</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                CONNECTED
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Flutterwave Enterprise</p>
                <p className="text-[11px] text-slate-500">Cross-border USD and Pan-African payment processing</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                CONNECTED
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-800 mb-2">Registered Branch Locations</p>
              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> <strong>Lagos Head Office (HQ):</strong> 14B Victoria Island, Lagos</p>
                <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> <strong>Abuja Regional Branch:</strong> Constitution Ave, CBD, Abuja</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
