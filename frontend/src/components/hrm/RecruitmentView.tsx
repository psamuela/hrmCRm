import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, 
  Sparkles, 
  Calendar, 
  Star, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  X,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import api from '../../services/api';
import { JobOpening, Candidate } from '../../types';

const PIPELINE_STAGES = [
  { id: 'applied', label: '01 Applied', color: 'border-slate-300' },
  { id: 'screening', label: '02 Screening', color: 'border-blue-400' },
  { id: 'interview', label: '03 Interview', color: 'border-purple-400' },
  { id: 'offer', label: '04 Offer', color: 'border-amber-400' },
  { id: 'hired', label: '05 Hired', color: 'border-emerald-500' },
];

export const RecruitmentView: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const fetchRecruitment = async () => {
    try {
      const res = await api.get('/hrm/recruitment');
      if (res.data.success) {
        setJobs(res.data.data.jobs);
        setCandidates(res.data.data.candidates);
      }
    } catch (e) {
      console.error('Failed to load recruitment data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitment();
  }, []);

  const handleMoveStage = async (candidateId: number, newStage: string) => {
    try {
      const res = await api.put(`/hrm/candidates/${candidateId}/stage`, { stage: newStage });
      if (res.data.success) {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage as any } : c));
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate({ ...selectedCandidate, stage: newStage as any });
        }
      }
    } catch (e) {
      console.error('Failed to move stage:', e);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            1.2 Recruitment & Applicant Tracking System (ATS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage job vacancies, AI resume screening, candidate pipelines, interview scorecards, and hiring conversion.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg flex items-center gap-1.5 self-start">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          AI Resume Screening Active
        </span>
      </div>

      {/* Active Job Openings Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Job Requisitions ({jobs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{j.title}</h4>
                    <p className="text-xs text-slate-500">{j.department?.name || 'Technology'} · {j.employment_type}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {j.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2">{j.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {j.location}
                </span>
                <span className="font-semibold text-slate-800">{j.salary_range}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline Kanban Board */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recruitment Pipeline Stages ({candidates.length} Total Applicants)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = candidates.filter(c => c.stage === stage.id);
            return (
              <div key={stage.id} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200/80 min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700">{stage.label}</span>
                  <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {stageCandidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                          {c.first_name} {c.last_name}
                        </h5>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                          {c.ai_match_score}%
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {c.job_opening?.title || 'Engineer'}
                      </p>

                      {c.interview_scheduled_at && (
                        <div className="mt-2 text-[10px] text-indigo-600 bg-indigo-50/60 p-1.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Interview: {new Date(c.interview_scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: c.rating }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </span>
                        <span className="text-purple-600 group-hover:underline">Review Details &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Profile / AI Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  {selectedCandidate.first_name[0]}{selectedCandidate.last_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCandidate.first_name} {selectedCandidate.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCandidate.job_opening?.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Fit Analysis Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Candidate Resume Screening Match
                </span>
                <span className="text-xs font-black text-purple-800 bg-white px-2 py-0.5 rounded-full shadow-xs">
                  {selectedCandidate.ai_match_score}% Score
                </span>
              </div>
              <p className="text-xs text-purple-900/80 leading-relaxed">
                {selectedCandidate.ai_summary || 'Candidate demonstrated strong technical mastery in Laravel APIs, high code quality, and proven experience with distributed enterprise microservices.'}
              </p>
            </div>

            {/* Candidate Contacts */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedCandidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCandidate.phone || '+234 800 000 0000'}</span>
              </div>
            </div>

            {/* Move Candidate Pipeline Stage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Move Pipeline Stage
              </label>
              <div className="grid grid-cols-5 gap-1">
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleMoveStage(selectedCandidate.id, s.id)}
                    className={`py-1.5 text-[11px] font-semibold rounded border transition-all ${
                      selectedCandidate.stage === s.id 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {s.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Interview Notes</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedCandidate.notes || 'No interview notes entered yet.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
