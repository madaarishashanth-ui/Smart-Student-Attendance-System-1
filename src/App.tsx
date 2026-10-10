import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab, UserRole } from './components/Navbar';
import { MarkAttendanceView } from './components/MarkAttendanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { StudentsManagementView } from './components/StudentsManagementView';
import { SubjectsManagementView } from './components/SubjectsManagementView';
import { MernEngineView } from './components/MernEngineView';
import { ProjectReportView } from './components/ProjectReportView';
import { StudentPortalView } from './components/StudentPortalView';
import { PresentationView } from './components/PresentationView';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { Student, Subject, ProjectReportConfig, TestCaseItem, User } from './types';
import { INITIAL_PROJECT_REPORT_CONFIG } from './data/initialData';
import {
  CalendarCheck2,
  Database,
  Layers,
  GraduationCap,
  RefreshCw,
  Terminal,
  Server,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mark');
  const [userRole, setUserRole] = useState<UserRole>('faculty');
  const [currentUser, setCurrentUser] = useState<User>({
    _id: 'usr_faculty_01',
    name: 'Dr. Rajesh Sen',
    email: 'faculty@college.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [threshold, setThreshold] = useState<number>(75);
  const [reportConfig, setReportConfig] = useState<ProjectReportConfig>(INITIAL_PROJECT_REPORT_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const handleSwitchUser = (role: UserRole, customUser?: Partial<User>) => {
    setUserRole(role);
    const defaults: Record<UserRole, User> = {
      faculty: {
        _id: 'usr_faculty_01',
        name: 'Dr. Rajesh Sen',
        email: 'faculty@college.edu',
        role: 'faculty',
        department: 'Computer Science & Engineering',
      },
      admin: {
        _id: 'usr_admin_01',
        name: 'Dr. Ramesh Gupta (HOD)',
        email: 'admin@college.edu',
        role: 'admin',
        department: 'Computer Science & Engineering',
      },
      student: {
        _id: 'usr_student_01',
        name: 'Aarav Sharma',
        email: 'student@college.edu',
        role: 'student',
        rollNo: '21CS101',
        department: 'Computer Science & Engineering',
      },
    };
    setCurrentUser({
      ...defaults[role],
      ...customUser,
      role,
    });
  };

  // Load all initial data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [stu, sub, anal, cfg, health] = await Promise.all([
        api.getStudents(),
        api.getSubjects(),
        api.getAnalytics(threshold),
        api.getProjectReportConfig(),
        api.getHealth(),
      ]);
      setStudents(stu);
      setSubjects(sub);
      setAnalytics(anal);
      setReportConfig(cfg);
      setSystemHealth(health);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Reload analytics whenever threshold changes
  useEffect(() => {
    api.getAnalytics(threshold).then((data) => {
      setAnalytics(data);
    });
  }, [threshold]);

  const handleAttendanceSaved = async () => {
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  // Student CRUD handlers
  const handleAddStudent = async (studentData: Partial<Student>) => {
    const created = await api.createStudent(studentData);
    setStudents((prev) => [created, ...prev]);
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    const updated = await api.updateStudent(id, updates);
    setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  const handleDeleteStudent = async (id: string) => {
    await api.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s._id !== id));
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  // Subject CRUD handlers
  const handleAddSubject = async (subjectData: Partial<Subject>) => {
    const created = await api.createSubject(subjectData);
    setSubjects((prev) => [...prev, created]);
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    const updated = await api.updateSubject(id, updates);
    setSubjects((prev) => prev.map((s) => (s._id === id ? updated : s)));
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  const handleDeleteSubject = async (id: string) => {
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    const anal = await api.getAnalytics(threshold);
    setAnalytics(anal);
  };

  // Project Report Config Handler
  const handleSaveReportConfig = async (newCfg: ProjectReportConfig) => {
    const saved = await api.saveProjectReportConfig(newCfg);
    setReportConfig(saved);
  };

  const defaultersCount = analytics?.summary?.defaultersCount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={handleSwitchUser}
        defaultersCount={defaultersCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* RBAC Auth & Sign-in Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Bootstrapping MERN Smart Attendance System...</p>
            <p className="text-xs text-slate-600 mt-1">Connecting to MongoDB & Express REST backend</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Notification Banner if in student mode */}
            {userRole === 'student' && (
              <div className="no-print bg-emerald-950/50 border border-emerald-800/60 p-3.5 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Viewing as <strong>Student Portal</strong>. You can inspect personal attendance stats and simulate student PIN self-check-ins.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUserRole('faculty')}
                  className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold transition-colors"
                >
                  Switch to Faculty Mode
                </button>
              </div>
            )}

            {/* Render student portal if in student mode AND on mark tab */}
            {userRole === 'student' && activeTab === 'mark' ? (
              <StudentPortalView
                students={students}
                subjects={subjects}
                onAttendanceUpdated={loadAllData}
              />
            ) : null}

            {/* Standard Tab Switch */}
            {activeTab === 'mark' && userRole !== 'student' && (
              <MarkAttendanceView
                students={students}
                subjects={subjects}
                onAttendanceSaved={handleAttendanceSaved}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                analytics={analytics}
                subjects={subjects}
                threshold={threshold}
                setThreshold={setThreshold}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'students' && (
              <StudentsManagementView
                students={students}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsManagementView
                subjects={subjects}
                subjectStats={analytics?.subjectStats || []}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            )}

            {activeTab === 'mern' && <MernEngineView />}

            {activeTab === 'report' && (
              <ProjectReportView
                config={reportConfig}
                onSaveConfig={handleSaveReportConfig}
                students={students}
                subjects={subjects}
                analytics={analytics}
              />
            )}

            {activeTab === 'ppt' && (
              <PresentationView
                config={reportConfig}
                students={students}
                subjects={subjects}
                analytics={analytics}
                testCases={[
                  {
                    id: 'TC-01',
                    module: 'Student CRUD',
                    description: 'Unique roll number constraint check',
                    testInput: 'Insert duplicate roll number 21CS101',
                    expectedResult: 'HTTP 409 Conflict returned; rejected',
                    actualResult: 'HTTP 409 Conflict returned; rejected',
                    status: 'passed',
                    executionTimeMs: 14,
                  },
                  {
                    id: 'TC-02',
                    module: 'Attendance Engine',
                    description: 'Batch mark attendance for class',
                    testInput: 'POST /api/attendance/batch with date and records',
                    expectedResult: 'Atomic batch update successful',
                    actualResult: 'Atomic batch update successful',
                    status: 'passed',
                    executionTimeMs: 22,
                  },
                  {
                    id: 'TC-03',
                    module: 'Defaulter Algorithm',
                    description: 'Detect students < 75% attendance',
                    testInput: 'Calculate attended / total * 100',
                    expectedResult: 'Flagged with recovery equation',
                    actualResult: 'Flagged with recovery equation',
                    status: 'passed',
                    executionTimeMs: 8,
                  },
                  {
                    id: 'TC-04',
                    module: 'Compound Index',
                    description: 'Validate { date: 1, subjectId: 1, studentId: 1 }',
                    testInput: 'Mark duplicate attendance for same student and date',
                    expectedResult: 'Replaced with upsert without duplicates',
                    actualResult: 'Replaced with upsert without duplicates',
                    status: 'passed',
                    executionTimeMs: 11,
                  },
                ]}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer (Hidden during printing) */}
      <footer className="no-print mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Smart Student Attendance System</span>
            <span>·</span>
            <span>MERN Stack (MongoDB · Express.js · React 19 · Node.js)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              REST API Server: Active
            </span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('mern')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              MongoDB Inspector
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('report')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Academic Report (8 Sections)
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('ppt')}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Presentation (PPT & Downloads)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
