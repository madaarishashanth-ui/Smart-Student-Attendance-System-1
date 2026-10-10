import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  CheckCheck,
  XCircle,
  Clock,
  HelpCircle,
  QrCode,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Student, Subject, AttendanceRecord, AttendanceStatus } from '../types';
import { api } from '../services/api';

interface MarkAttendanceViewProps {
  students: Student[];
  subjects: Subject[];
  onAttendanceSaved: () => void;
}

export const MarkAttendanceView: React.FC<MarkAttendanceViewProps> = ({
  students,
  subjects,
  onAttendanceSaved,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0]._id : ''
  );
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [sessionPin, setSessionPin] = useState<string>('849201');
  const [rollCallIndex, setRollCallIndex] = useState<number | null>(null);

  // Sync selected subject if empty
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0]._id);
    }
  }, [subjects, selectedSubjectId]);

  // Load existing attendance for selected date and subject
  useEffect(() => {
    async function loadExistingRecords() {
      if (!selectedDate || !selectedSubjectId) return;
      setLoading(true);
      try {
        const records: AttendanceRecord[] = await api.getAttendance(selectedDate, selectedSubjectId);
        const map: Record<string, AttendanceStatus> = {};
        const rems: Record<string, string> = {};

        // Default all active students to 'present' initially if no record exists
        students.forEach((s) => {
          map[s._id] = 'present';
        });

        // Apply saved records
        records.forEach((r) => {
          map[r.studentId] = r.status;
          if (r.remarks) rems[r.studentId] = r.remarks;
        });

        setStudentStatusMap(map);
        setRemarksMap(rems);
      } catch (e) {
        console.error('Failed to load attendance', e);
      } finally {
        setLoading(false);
      }
    }
    loadExistingRecords();
  }, [selectedDate, selectedSubjectId, students]);

  // Filter students based on section and search
  const filteredStudents = students.filter((s) => {
    if (selectedSection !== 'All' && s.section !== selectedSection) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedSubject = subjects.find((s) => s._id === selectedSubjectId);

  // Stats calculation
  const totalInView = filteredStudents.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  filteredStudents.forEach((s) => {
    const status = studentStatusMap[s._id] || 'present';
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'late') lateCount++;
    else if (status === 'excused') excusedCount++;
  });

  const attendanceRate =
    totalInView > 0 ? Math.round(((presentCount + lateCount) / totalInView) * 100) : 0;

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const updated = { ...studentStatusMap };
    filteredStudents.forEach((s) => {
      updated[s._id] = status;
    });
    setStudentStatusMap(updated);
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudentStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedDate || !selectedSubjectId) return;
    setLoading(true);
    setSaveSuccess(null);
    try {
      const payloadRecords = students.map((s) => ({
        studentId: s._id,
        status: studentStatusMap[s._id] || 'present',
        remarks: remarksMap[s._id] || '',
      }));

      await api.batchSaveAttendance(
        selectedDate,
        selectedSubjectId,
        payloadRecords,
        selectedSubject?.facultyName || 'Faculty Incharge'
      );

      setSaveSuccess(`Attendance for ${selectedSubject?.name || 'Class'} successfully saved to MongoDB!`);
      onAttendanceSaved();
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert('Error saving attendance: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Roll-call mode progression
  const currentRollCallStudent =
    rollCallIndex !== null && filteredStudents[rollCallIndex]
      ? filteredStudents[rollCallIndex]
      : null;

  const handleRollCallAnswer = (status: AttendanceStatus) => {
    if (currentRollCallStudent) {
      handleSetStudentStatus(currentRollCallStudent._id, status);
      if (rollCallIndex! < filteredStudents.length - 1) {
        setRollCallIndex(rollCallIndex! + 1);
      } else {
        setRollCallIndex(null);
      }
    }
  };

  // Generate new QR session pin
  const handleGeneratePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionPin(pin);
    setQrModalOpen(true);
  };

  const handleSimulateStudentCheckIns = () => {
    // Randomly mark 90% of students as present
    const updated = { ...studentStatusMap };
    filteredStudents.forEach((s) => {
      updated[s._id] = Math.random() > 0.15 ? 'present' : 'absent';
    });
    setStudentStatusMap(updated);
    setQrModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Session Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Select Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.code} - {sub.name} ({sub.facultyName})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Session Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Section / Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Section / Batch
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="All">All Sections (A & B)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>

          {/* Quick Date buttons */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedDate === todayStr
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                setSelectedDate(y.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 transition-colors"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={handleGeneratePin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 transition-colors"
              title="Smart QR / PIN Student Check-in"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Smart Check-In Code</span>
            </button>
          </div>
        </div>

        {selectedSubject && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold">{selectedSubject.code}:</span>
              <span>{selectedSubject.name}</span>
              <span className="text-slate-600">·</span>
              <span>Faculty: {selectedSubject.facultyName}</span>
              <span className="text-slate-600">·</span>
              <span>Credits: {selectedSubject.credits}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="text-slate-500">MongoDB ref:</span>
              <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">
                {selectedSubject._id}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Session Metrics Card */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 font-medium block">Total Students</span>
          <span className="text-xl font-bold text-white mt-1 block">{totalInView}</span>
          <span className="text-[11px] text-slate-500">In current filter</span>
        </div>

        <div className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">Present</span>
            <CheckCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-emerald-300 mt-1 block">{presentCount}</span>
          <span className="text-[11px] text-emerald-500/80">
            {totalInView > 0 ? Math.round((presentCount / totalInView) * 100) : 0}% attended
          </span>
        </div>

        <div className="bg-slate-900/80 border border-rose-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-medium">Absent</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-xl font-bold text-rose-300 mt-1 block">{absentCount}</span>
          <span className="text-[11px] text-rose-500/80">Marked absent</span>
        </div>

        <div className="bg-slate-900/80 border border-amber-900/40 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Late / Excused</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-amber-300 mt-1 block">
            {lateCount + excusedCount}
          </span>
          <span className="text-[11px] text-amber-500/80">With remarks</span>
        </div>

        <div className="bg-slate-900/80 border border-blue-900/40 rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <span className="text-xs text-blue-400 font-medium block">Session Attendance</span>
          <span className="text-xl font-bold text-blue-300 mt-1 block">{attendanceRate}%</span>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">201 CREATED</span>
        </div>
      )}

      {/* Interactive Roll-Call Banner if active */}
      {rollCallIndex !== null && currentRollCallStudent && (
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-700/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-blue-300 uppercase">
                Interactive Roll-Call Mode ({rollCallIndex + 1} of {filteredStudents.length})
              </span>
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {currentRollCallStudent.name}{' '}
              <span className="text-blue-300 font-mono text-sm">
                ({currentRollCallStudent.rollNo})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRollCallAnswer('present')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Present (P)
            </button>
            <button
              onClick={() => handleRollCallAnswer('absent')}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Absent (A)
            </button>
            <button
              onClick={() => handleRollCallAnswer('late')}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> Late (L)
            </button>
            <button
              onClick={() => setRollCallIndex(null)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Main Student Attendance Table & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-950/50 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
            <button
              type="button"
              onClick={() => setRollCallIndex(0)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Start Roll-Call</span>
            </button>

            {/* Save to MongoDB Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleSaveAttendance}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save to MongoDB</span>
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4 text-center">Status Selection</th>
                <th className="py-3 px-4">Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const currentStatus = studentStatusMap[student._id] || 'present';
                  return (
                    <tr
                      key={student._id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        currentStatus === 'absent' ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {student.rollNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-[11px] text-slate-500">{student.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-400">Sec {student.section}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student._id, 'present')}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-emerald-300 hover:border-emerald-800'
                            }`}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student._id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-rose-300 hover:border-rose-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student._id, 'late')}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          {/* Excused Button */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student._id, 'excused')}
                            className={`px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-all flex items-center gap-1 ${
                              currentStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-blue-300'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g., Medical certificate, Sports duty"
                          value={remarksMap[student._id] || ''}
                          onChange={(e) =>
                            setRemarksMap((prev) => ({ ...prev, [student._id]: e.target.value }))
                          }
                          className="w-full bg-slate-950/70 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Session: <strong className="text-slate-200">{selectedDate}</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span>
              Subject:{' '}
              <strong className="text-slate-200">{selectedSubject?.code || 'None'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              Changes stay local until saved to MongoDB
            </span>
          </div>
        </div>
      </div>

      {/* Smart Check-In / QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Student Self-Check-In</h3>
            <p className="text-xs text-slate-400 mt-1">
              Students can scan this QR code or enter this 6-digit session code in their student portal.
            </p>

            {/* Generated QR visual mock + Code */}
            <div className="my-6 p-6 bg-slate-950 border border-slate-800 rounded-xl inline-block">
              {/* Simulated QR Code matrix */}
              <div className="w-40 h-40 mx-auto bg-white p-2 rounded-lg flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-9 h-9 bg-black border-4 border-black p-1 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                  <div className="w-9 h-9 bg-black border-4 border-black p-1 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center text-[10px] font-mono font-bold text-slate-800">
                  SMART ATTEND
                </div>
                <div className="flex justify-between">
                  <div className="w-9 h-9 bg-black border-4 border-black p-1 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                  <div className="w-6 h-6 bg-slate-900 rounded-sm self-end" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-[11px] text-slate-500 block">Session Passcode</span>
                <span className="text-3xl font-mono font-extrabold text-blue-400 tracking-widest mt-1 block">
                  {sessionPin}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Expires in 15 minutes</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSimulateStudentCheckIns}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Student Check-Ins</span>
              </button>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
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
