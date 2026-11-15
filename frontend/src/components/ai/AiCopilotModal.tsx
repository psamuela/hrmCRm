import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  FileText, 
  Target, 
  Send, 
  CheckCircle2, 
  BrainCircuit, 
  HelpCircle,
  Copy,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'lead' | 'jd' | 'email'>('screen');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Tab 1: CV Screening State
  const [candidateName, setCandidateName] = useState('Olumide Bakare');
  const [jobTitle, setJobTitle] = useState('Senior Fullstack Engineer');
  const [experienceSummary, setExperienceSummary] = useState(
    '6 years building production Laravel microservices, React, TypeScript, high-concurrency payment integrations, and automated CI/CD.'
  );

  // Tab 2: Lead Scoring State
  const [companyName, setCompanyName] = useState('Dangote Logistics');
  const [dealSize, setDealSize] = useState('24000000');
  const [inquiryNotes, setInquiryNotes] = useState(
    'Enterprise client needs unified HRM for 450 field drivers and CRM tracking for corporate fleet contracts.'
  );

  // Tab 3: JD Generator State
  const [jdTitle, setJdTitle] = useState('Cloud DevOps Architect');
  const [jdDept, setJdDept] = useState('Engineering & IT');
  const [jdLevel, setJdLevel] = useState('Principal');

  // Tab 4: Sales Email Drafter State
  const [emailClient, setEmailClient] = useState('Engr. Tajudeen Sanni');
  const [emailCompany, setEmailCompany] = useState('Dangote Group');

  if (!isOpen) return null;

  const handleScreenCV = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/screen-candidate', {
        candidate_name: candidateName,
        job_title: jobTitle,
        experience_summary: experienceSummary,
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreLead = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/score-lead', {
        company_name: companyName,
        deal_size: parseFloat(dealSize),
        inquiry_notes: inquiryNotes,
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJD = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-jd', {
        title: jdTitle,
        department: jdDept,
        level: jdLevel,
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftEmail = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/draft-email', {
        recipient_name: emailClient,
        company_name: emailCompany,
        intent: 'proposal_intro',
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Copilot for HRM & CRM
              </h3>
              <p className="text-xs text-slate-500">
                4.1 AI CV screening · 4.2 Lead scoring · Job descriptions · Sales drafter
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('screen'); setResult(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'screen' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4.1 CV Screening
          </button>
          <button
            onClick={() => { setActiveTab('lead'); setResult(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'lead' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4.2 Lead Scoring
          </button>
          <button
            onClick={() => { setActiveTab('jd'); setResult(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'jd' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Description
          </button>
          <button
            onClick={() => { setActiveTab('email'); setResult(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'email' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Email
          </button>
        </div>

        {/* TAB 1: CV SCREENING */}
        {activeTab === 'screen' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Opening</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Candidate Resume / CV Summary</label>
              <textarea
                rows={3}
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleScreenCV}
              disabled={loading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              <BrainCircuit className="w-4 h-4" />
              {loading ? 'Analyzing Profile...' : 'Run AI Resume Screening & Interview Guide'}
            </button>
          </div>
        )}

        {/* TAB 2: LEAD SCORING */}
        {activeTab === 'lead' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Lead Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deal Size (₦)</label>
                <input
                  type="number"
                  value={dealSize}
                  onChange={(e) => setDealSize(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Discovery Notes & Client Requirements</label>
              <textarea
                rows={3}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleScoreLead}
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              <Target className="w-4 h-4" />
              {loading ? 'Evaluating Deal Fit...' : 'Compute AI Win Probability & Lead Score'}
            </button>
          </div>
        )}

        {/* TAB 3: JOB DESCRIPTION */}
        {activeTab === 'jd' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role Title</label>
                <input
                  type="text"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={jdDept}
                  onChange={(e) => setJdDept(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Seniority Level</label>
                <input
                  type="text"
                  value={jdLevel}
                  onChange={(e) => setJdLevel(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateJD}
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Full Job Description'}
            </button>
          </div>
        )}

        {/* TAB 4: SALES EMAIL */}
        {activeTab === 'email' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Decision Maker</label>
                <input
                  type="text"
                  value={emailClient}
                  onChange={(e) => setEmailClient(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  value={emailCompany}
                  onChange={(e) => setEmailCompany(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleDraftEmail}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Drafting...' : 'Draft Personalized Executive Email'}
            </button>
          </div>
        )}

        {/* RESULT PRESENTATION */}
        {result && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                AI Generated Output
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            </div>

            {/* If CV Screening Result */}
            {activeTab === 'screen' && result.insights && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-purple-700">{result.match_score}% Match Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    {result.insights.overall_verdict}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mt-2">Key Candidate Strengths:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1">
                    {result.insights.key_strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mt-2">Recommended Interview Questions:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1">
                    {result.insights.recommended_interview_questions.map((q: string, idx: number) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* If Lead Scoring Result */}
            {activeTab === 'lead' && result.lead_score && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lead Fit Score</span>
                    <span className="text-2xl font-bold font-mono text-emerald-700">{result.lead_score}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Win Probability</span>
                    <span className="text-2xl font-bold font-mono text-indigo-700">{result.win_probability_percent}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="font-bold text-slate-800">Scoring Analysis Factors:</p>
                  <div className="mt-1 space-y-1 text-slate-600">
                    {Object.entries(result.factors).map(([k, v]) => (
                      <p key={k}><strong className="text-slate-700">{k}:</strong> {String(v)}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If Job Description Result */}
            {activeTab === 'jd' && result.description && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">{result.title}</h4>
                <p className="text-slate-600 leading-relaxed">{result.description}</p>
                <p className="font-bold text-slate-800 mt-2">Key Requirements:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  {result.requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* If Sales Email Result */}
            {activeTab === 'email' && result.body && (
              <div className="space-y-2">
                <p className="font-bold text-slate-800">Subject: {result.subject}</p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 font-sans whitespace-pre-line text-slate-700 leading-relaxed">
                  {result.body}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
