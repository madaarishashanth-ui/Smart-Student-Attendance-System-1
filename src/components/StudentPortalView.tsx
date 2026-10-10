import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../types';
import { api } from '../services/api';

interface StudentPortalViewProps {
  students: Student[];
  subjects: Subject[];
  onAttendanceUpdated: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  students,
  subjects,
  onAttendanceUpdated,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0]._id : ''
  );
  const [inputPin, setInputPin] = useState<string>('');
  const [pinSubjectId, setPinSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0]._id : ''
  );
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  const currentStudent = students.find((s) => s._id === selectedStudentId);

  // Student specific check-in with session PIN simulation
  const handlePinCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;

    if (inputPin.length !== 6) {
      setCheckInStatus('Invalid session PIN. Must be 6 digits.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.batchSaveAttendance(
        todayStr,
        pinSubjectId,
        [{ studentId: selectedStudentId, status: 'present', remarks: 'Smart Student PIN Check-in' }],
        'Self Check-in'
      );
      setCheckInStatus('Successfully checked in! Attendance recorded for today.');
      setInputPin('');
      onAttendanceUpdated();
      setTimeout(() => setCheckInStatus(null), 4000);
    } catch (err: any) {
      setCheckInStatus('Check-in error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              Student Portal View
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulating student self-service experience: monitor eligibility, review shortage warnings, and submit instant PIN check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Log in as Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.rollNo} - {s.name} (Sec {s.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentStudent && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div>
              Student: <strong className="text-white">{currentStudent.name}</strong>
            </div>
            <span>·</span>
            <div>
              Roll No: <strong className="text-emerald-400 font-mono">{currentStudent.rollNo}</strong>
            </div>
            <span>·</span>
            <div>
              Dept: <span>{currentStudent.department}</span>
            </div>
            <span>·</span>
            <div>
              Semester: <span>Sem {currentStudent.semester}</span>
            </div>
          </div>
        )}
      </div>

      {/* Smart Quick Check-In Pin Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          Smart Session Check-In
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Enter the 6-digit active lecture passcode displayed on the classroom projector to register your presence.
        </p>

        <form onSubmit={handlePinCheckIn} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={pinSubjectId}
            onChange={(e) => setPinSubjectId(e.target.value)}
            className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            maxLength={6}
            placeholder="6-digit PIN (e.g., 849201)"
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
            className="w-full sm:w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono tracking-widest text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-center"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Submit Check-In</span>
          </button>
        </form>

        {checkInStatus && (
          <div className="mt-3 p-3 bg-indigo-950/70 border border-indigo-700 rounded-lg text-xs text-indigo-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{checkInStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
