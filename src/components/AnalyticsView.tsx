import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  Printer,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Send,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentAttendanceStat, Subject } from '../types';

interface AnalyticsViewProps {
  analytics: {
    summary: {
      totalStudents: number;
      totalSubjects: number;
      totalSessions: number;
      overallAttendancePercentage: number;
      defaultersCount: number;
      threshold: number;
    };
    studentStats: StudentAttendanceStat[];
    defaulters: StudentAttendanceStat[];
    subjectStats: any[];
    trend: any[];
  } | null;
  subjects: Subject[];
  threshold: number;
  setThreshold: (val: number) => void;
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  subjects,
  threshold,
  setThreshold,
  onRefresh,
}) => {
  const [selectedStudentStat, setSelectedStudentStat] = useState<StudentAttendanceStat | null>(null);
  const [notifyModalStudent, setNotifyModalStudent] = useState<StudentAttendanceStat | null>(null);
  const [notifySentSuccess, setNotifySentSuccess] = useState<boolean>(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');

  if (!analytics) {
    return (
      <div className="py-12 text-center text-slate-400">
        Loading attendance analytics and reports...
      </div>
    );
  }

  const { summary, studentStats, defaulters, subjectStats, trend } = analytics;

  // Filter students if department selected
  const displayedStudents = studentStats.filter((st) => {
    if (filterDepartment !== 'All' && st.student.department !== filterDepartment) return false;
    return true;
  });

  const displayedDefaulters = displayedStudents.filter((s) => s.percentage < threshold);

  // CSV Export functions
  const handleExportDefaultersCSV = () => {
    const headers = ['Roll No', 'Name', 'Department', 'Semester', 'Classes Attended', 'Total Classes', 'Attendance %', 'Classes Needed to Reach 75%'];
    const rows = displayedDefaulters.map((d) => [
      d.student.rollNo,
      `"${d.student.name}"`,
      `"${d.student.department}"`,
      d.student.semester,
      d.attendedClasses,
      d.totalClasses,
      `${d.percentage}%`,
      d.classesNeededFor75,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `defaulter_list_${threshold}pct_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFullRegisterCSV = () => {
    const headers = ['Roll No', 'Name', 'Department', 'Semester', 'Total Classes', 'Attended Classes', 'Attendance %', 'Status'];
    const rows = displayedStudents.map((s) => [
      s.student.rollNo,
      `"${s.student.name}"`,
      `"${s.student.department}"`,
      s.student.semester,
      s.totalClasses,
      s.attendedClasses,
      `${s.percentage}%`,
      s.percentage < threshold ? 'Defaulter' : 'Clear',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_attendance_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendNotification = () => {
    setNotifySentSuccess(true);
    setTimeout(() => {
      setNotifySentSuccess(false);
      setNotifyModalStudent(null);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Threshold Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Attendance Analytics & Defaulters Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated threshold analysis compliant with University Academic Regulation (Standard: 75% minimum).
            </p>
          </div>

          {/* Threshold Slider & Quick Buttons */}
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">Defaulter Cutoff:</span>
              <span className="text-sm font-mono font-bold text-rose-400">{threshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-32 accent-rose-500 cursor-pointer"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleExportDefaultersCSV}
                className="px-2.5 py-1.5 text-xs font-semibold rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
                title="Export Defaulters to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Defaulter CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportFullRegisterCSV}
                className="px-2.5 py-1.5 text-xs font-semibold rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 transition-colors flex items-center gap-1.5"
                title="Export Full Attendance Sheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Register</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 text-xs rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Enrolled</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{summary.totalStudents}</div>
          <span className="text-[11px] text-slate-500">Across {summary.totalSubjects} subjects</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Sessions Held</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{summary.totalSessions}</div>
          <span className="text-[11px] text-slate-500">Total lecture slots</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {summary.overallAttendancePercentage}%
          </div>
          <span className="text-[11px] text-slate-500">Aggregate across college</span>
        </div>

        <div className="bg-slate-900 border border-rose-900/50 rounded-xl p-4 bg-gradient-to-br from-slate-900 to-rose-950/20">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-medium">Defaulters (&lt;{threshold}%)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-300">{displayedDefaulters.length}</div>
          <span className="text-[11px] text-rose-500/80">
            {summary.totalStudents > 0
              ? Math.round((displayedDefaulters.length / summary.totalStudents) * 100)
              : 0}
            % of total students
          </span>
        </div>
      </div>

      {/* Critical Defaulters Section */}
      <div className="bg-slate-900 border border-rose-900/40 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-rose-950/20 border-b border-rose-900/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Critical Defaulters List (&lt;{threshold}% Attendance Shortage)
            </h3>
            <p className="text-xs text-rose-400/80 mt-0.5">
              Students at risk of being debarred from semester examinations under University regulations.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-md">
            {displayedDefaulters.length} Students Flagged
          </span>
        </div>

        {displayedDefaulters.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">
              No students are currently below {threshold}% attendance.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All students meet the minimum attendance threshold!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department / Sem</th>
                  <th className="py-3 px-4">Classes Attended</th>
                  <th className="py-3 px-4">Current %</th>
                  <th className="py-3 px-4">Recovery Requirement</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {displayedDefaulters.map((item) => (
                  <tr key={item.student._id} className="hover:bg-rose-950/10 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-rose-200">
                      {item.student.rollNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.student.name}</div>
                      <div className="text-[11px] text-slate-500">{item.student.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.student.department} · Sem {item.student.semester}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-200">
                        {item.attendedClasses} / {item.totalClasses}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400 text-sm">
                          {item.percentage}%
                        </span>
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-medium">
                        Must attend <strong>{item.classesNeededFor75}</strong> more consecutive
                        classes
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNotifyModalStudent(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors flex items-center gap-1"
                          title="Send SMS/Email alert to Parent"
                        >
                          <Send className="w-3 h-3" />
                          <span>Alert Parent</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentStat(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subject-Wise Performance & Trends Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject wise stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Subject-Wise Attendance Distribution
          </h3>

          <div className="space-y-4">
            {subjectStats.map((sub: any) => (
              <div key={sub._id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-white font-mono mr-2">{sub.code}</span>
                    <span className="text-slate-300">{sub.name}</span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      sub.averageAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sub.averageAttendance}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.averageAttendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, sub.averageAttendance)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Faculty: {sub.facultyName}</span>
                  <span>{sub.classesHeld} classes recorded</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Attendance Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Daily Attendance Records Log ({trend.length} Dates)
          </h3>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {trend.slice(-8).reverse().map((day: any) => {
              const dayPct = day.total > 0 ? Math.round((day.present / day.total) * 100) : 0;
              return (
                <div
                  key={day.date}
                  className="p-3 bg-slate-950/50 border border-slate-800/70 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{day.date}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {day.present} Present · {day.absent} Absent · {day.late} Late
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        dayPct >= 75 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {dayPct}%
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {day.total} student logs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Student Master Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Student Master Attendance Register
          </h3>
          <span className="text-xs text-slate-400">
            Total {displayedStudents.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Attended / Total</th>
                <th className="py-3 px-4">Overall %</th>
                <th className="py-3 px-4">Academic Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {displayedStudents.map((st) => (
                <tr key={st.student._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                    {st.student.rollNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{st.student.name}</div>
                    <div className="text-[11px] text-slate-500">{st.student.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Sem {st.student.semester} ({st.student.section})</td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {st.attendedClasses} / {st.totalClasses}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono font-bold ${
                        st.percentage >= threshold ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {st.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {st.percentage < threshold ? (
                      <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 rounded">
                        Defaulter
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                        Eligible
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentStat(st)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Detailed Inspector Modal */}
      {selectedStudentStat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedStudentStat.student.name}</h3>
                <p className="text-xs text-slate-400">
                  Roll No: <span className="font-mono text-blue-400">{selectedStudentStat.student.rollNo}</span> ·{' '}
                  {selectedStudentStat.student.department} · Sem {selectedStudentStat.student.semester}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentStat(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Total Classes</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {selectedStudentStat.totalClasses}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Attended</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  {selectedStudentStat.attendedClasses}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
                <span
                  className={`text-lg font-bold mt-1 block ${
                    selectedStudentStat.percentage >= threshold
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedStudentStat.percentage}%
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Subject-Wise Breakdown
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedStudentStat.subjectBreakdown.map((sb) => (
                <div
                  key={sb.subjectId}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-300 mr-2">{sb.subjectCode}</span>
                    <span className="text-slate-300">{sb.subjectName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {sb.attended} of {sb.total} attended
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      sb.percentage >= threshold ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sb.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentStat(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Alert Modal Simulation */}
      {notifyModalStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Dispatch Parent Attendance Alert
              </h3>
              <button
                type="button"
                onClick={() => setNotifyModalStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3">
              <div>
                <span className="text-slate-400 block font-medium">To Guardian:</span>
                <span className="text-white font-semibold">
                  {notifyModalStudent.student.guardianPhone || '+91 98765 XXXXX'} (Parent of {notifyModalStudent.student.name})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Draft Message:</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                  [ATTENDANCE WARNING] Dear Parent, your ward {notifyModalStudent.student.name} (Roll No: {notifyModalStudent.student.rollNo}) has an attendance of {notifyModalStudent.percentage}%, which is below the mandatory university threshold of {threshold}%. Kindly ensure regular attendance to prevent semester debarment. - HOD, CSE.
                </div>
              </div>
            </div>

            {notifySentSuccess ? (
              <div className="p-3 bg-emerald-950 border border-emerald-700 rounded-lg text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Alert SMS & Email Dispatched Successfully!
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyModalStudent(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendNotification}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Warning Alert</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
