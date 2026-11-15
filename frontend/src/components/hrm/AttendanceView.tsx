import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Building,
  Calendar,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { Attendance } from '../../types';

export const AttendanceView: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [clockMode, setClockMode] = useState<'office' | 'remote'>('office');
  const [clockNotes, setClockNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAttendance = async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/hrm/attendance?date=${date}`);
      if (res.data.success) {
        setAttendances(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleClockIn = async () => {
    setFeedback(null);
    try {
      const res = await api.post('/hrm/attendance/clock-in', {
        work_mode: clockMode,
        notes: clockNotes,
      });
      if (res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        setClockNotes('');
        fetchAttendance(selectedDate);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to punch in' });
    }
  };

  const handleClockOut = async () => {
    setFeedback(null);
    try {
      const res = await api.post('/hrm/attendance/clock-out');
      if (res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        fetchAttendance(selectedDate);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to punch out' });
    }
  };

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const lateCount = attendances.filter(a => a.status === 'late').length;
  const leaveCount = attendances.filter(a => a.status === 'on_leave').length;
  const remoteCount = attendances.filter(a => a.work_mode === 'remote').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            1.3 Attendance & Working Hours Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time clock-in/out records, shift compliance, biometric logging, and remote work validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium text-slate-700 shadow-xs"
          />
        </div>
      </div>

      {/* Clock In / Out Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shadow-inner">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Web & Mobile Time Attendance Terminal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.role?.replace('_', ' ')})
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="work_mode"
                  checked={clockMode === 'office'}
                  onChange={() => setClockMode('office')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Office (VI Lagos HQ)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="work_mode"
                  checked={clockMode === 'remote'}
                  onChange={() => setClockMode('remote')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <Laptop className="w-3.5 h-3.5 text-slate-500" />
                Remote / WFH
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Notes (optional e.g. traffic)"
            value={clockNotes}
            onChange={(e) => setClockNotes(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleClockIn}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              Clock In Today
            </button>
            <button
              onClick={handleClockOut}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              Clock Out
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.text}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">On-Time Present</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Late Arrivals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Remote Workers</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{remoteCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">On Scheduled Leave</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{leaveCount}</p>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Attendance Log for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {attendances.length} Records Logged
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading attendance data...</div>
        ) : attendances.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No attendance entries recorded for this date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Work Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={att.employee?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span>{att.employee ? `${att.employee.first_name} ${att.employee.last_name}` : `EMP #${att.employee_id}`}</span>
                          <span className="block text-[10px] text-slate-400">{att.employee?.employee_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{att.employee?.department?.name || 'General'}</td>
                    <td className="py-3 px-4 font-mono font-medium">{att.clock_in ? att.clock_in.substring(0, 5) : '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{att.clock_out ? att.clock_out.substring(0, 5) : 'Active'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{att.working_hours > 0 ? `${att.working_hours}h` : '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        att.work_mode === 'remote' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {att.work_mode === 'remote' ? <Laptop className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        <span className="capitalize">{att.work_mode}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        att.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        att.status === 'late' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        att.status === 'on_leave' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {att.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{att.notes || '—'}</td>
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
