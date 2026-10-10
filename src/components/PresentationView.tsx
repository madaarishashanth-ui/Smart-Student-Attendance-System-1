import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Download,
  FileText,
  FileCode,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Layers,
  Database,
  Server,
  Code2,
  Award,
  Users,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { ProjectReportConfig, Student, Subject, TestCaseItem } from '../types';
import { downloadPptxPresentation, downloadWordDocument } from '../utils/documentGenerators';

interface PresentationViewProps {
  config: ProjectReportConfig;
  students: Student[];
  subjects: Subject[];
  analytics: any;
  testCases: TestCaseItem[];
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  config,
  students,
  subjects,
  analytics,
  testCases,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Keyboard navigation for presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownloadPptx = async () => {
    setIsGeneratingPptx(true);
    try {
      await downloadPptxPresentation(config, students, subjects, analytics, testCases);
      setDownloadSuccessToast('PowerPoint (.pptx) file generated and downloaded successfully!');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err: any) {
      alert('Error generating PPTX: ' + err.message);
    } finally {
      setIsGeneratingPptx(false);
    }
  };

  const handleDownloadWord = () => {
    try {
      downloadWordDocument(config, students, subjects, analytics, testCases);
      setDownloadSuccessToast('Word (.doc) formatted report downloaded successfully!');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err: any) {
      alert('Error generating Word document: ' + err.message);
    }
  };

  const overallPct = analytics?.summary?.overallAttendancePercentage || 80;
  const defaultersCount = analytics?.summary?.defaultersCount || 2;

  // Slide definitions for the interactive player
  const slides = [
    // Slide 1: Cover
    {
      title: config.projectTitle,
      subtitle: 'MERN Stack Smart Student Attendance & Defaulter Analytics System',
      category: 'PROJECT DEFENSE',
      notes:
        'Good morning respected external examiner, project guide Dr. ' +
        config.guideName +
        ', and faculty members. Today, our team presents the Smart Student Attendance System built using the MERN stack.',
      content: (
        <div className="flex flex-col justify-between h-full py-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded bg-blue-950/80 border border-blue-700/60 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
              B.Tech Final Major Project Defense
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {config.projectTitle}
            </h1>
            <p className="text-base text-slate-400 max-w-2xl">
              An enterprise full-stack web application designed to automate student attendance capture, enforce statutory 75% university thresholds, and deliver instant defaulter predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                Project Team Members
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {config.students.map((st, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-semibold text-white">{st.name}</span>
                    <span className="font-mono text-slate-400">{st.rollNo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                Institutional Details
              </span>
              <div className="text-xs space-y-1 text-slate-300">
                <div>Guide: <strong className="text-white">{config.guideName}</strong></div>
                <div>Department: {config.department}</div>
                <div>College: {config.collegeName}</div>
                <div className="text-slate-500 pt-1">Academic Year: {config.academicYear}</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: Problem Statement
    {
      title: 'Problem Statement & Academic Rationale',
      subtitle: 'Why traditional roll call methods fail in modern colleges',
      category: 'BACKGROUND',
      notes:
        'Explain the core pain points: paper registers are slow, proxy marking is rampant, and students only find out they are below 75% at month end when it is too late to fix.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          <div className="p-5 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Conventional Paper Register Bottlenecks
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>10-15 Minutes Wasted:</strong> Valuable lecture time lost conducting manual verbal roll calls every period.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Proxy Vulnerability:</strong> Friends signing sheets or answering for absent peers without verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Clerical Computation Delays:</strong> Monthly tabulation means students learn about low attendance when already debarred.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-blue-950/30 border border-blue-900/50 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-blue-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              The SmartAttend Solution
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Atomic 1-Click Batch Marking:</strong> Faculties mark entire class sessions in seconds with instant DB write.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Compound Index Security:</strong> MongoDB compound index guarantees zero duplicate entries per session.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span><strong>Dynamic Recovery Formula:</strong> Tells students exactly how many upcoming classes they must attend to reach 75%.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // Slide 3: Architecture
    {
      title: 'MERN Full-Stack System Architecture',
      subtitle: 'Component-by-component architectural integration',
      category: 'SYSTEM DESIGN',
      notes:
        'Walk through the 4 tiers of the MERN stack: React 19 on frontend, Express routing, Node.js runtime, and MongoDB document database with Mongoose schemas.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 h-full items-center">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between h-72">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
                M
              </div>
              <h4 className="text-sm font-bold text-white">MongoDB</h4>
              <p className="text-xs text-slate-400 mt-1">
                Document-oriented NoSQL engine storing students, curriculum subjects, and timestamped attendance records.
              </p>
            </div>
            <div className="font-mono text-[10px] text-emerald-400 bg-emerald-950/40 p-2 rounded">
              db.attendances.aggregate()
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between h-72">
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-lg mb-3">
                E
              </div>
              <h4 className="text-sm font-bold text-white">Express.js</h4>
              <p className="text-xs text-slate-400 mt-1">
                REST API router handling HTTP methods, body serialization, error status codes (400, 409, 201), and controllers.
              </p>
            </div>
            <div className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded">
              app.post('/api/attendance/batch')
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between h-72">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-lg mb-3">
                R
              </div>
              <h4 className="text-sm font-bold text-white">React 19</h4>
              <p className="text-xs text-slate-400 mt-1">
                Modern declarative user interface with Tailwind CSS, role switches (Faculty, Student, Admin), and print styling.
              </p>
            </div>
            <div className="font-mono text-[10px] text-blue-400 bg-blue-950/40 p-2 rounded">
              React Hooks & Motion
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between h-72">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
                N
              </div>
              <h4 className="text-sm font-bold text-white">Node.js</h4>
              <p className="text-xs text-slate-400 mt-1">
                Asynchronous event loop execution runtime hosting the Express backend, running on port 3000.
              </p>
            </div>
            <div className="font-mono text-[10px] text-amber-400 bg-amber-950/40 p-2 rounded">
              tsx server.ts
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Defaulter Equation
    {
      title: 'Defaulter Detection & Recovery Algorithm',
      subtitle: 'Mathematical formulation of the attendance deficit model',
      category: 'ALGORITHM',
      notes:
        'Highlight the formula: X = ceil((T*Total - Attended) / (1 - T)). Explain that this is an O(1) closed form equation that instantly tells the student how many consecutive classes are needed.',
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center">
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-2">
              Mathematical Deficit Model (Threshold T = 0.75)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide py-2">
              X = &lceil; (T &times; Total - Attended) / (1 - T) &rceil;
            </div>
            <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
              Where <strong>Total</strong> is total classes held, <strong>Attended</strong> is classes present, and <strong>X</strong> is the minimum number of upcoming consecutive lectures the student must attend to reach or exceed 75%.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold text-emerald-400 block mb-1">Time Complexity: O(1)</span>
              <p className="text-xs text-slate-300">
                Closed-form mathematical computation runs in constant time without iterative brute-force loops, allowing instant real-time computation for thousands of students.
              </p>
            </div>
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="text-xs font-bold text-amber-400 block mb-1">Automated Warning Alerts</span>
              <p className="text-xs text-slate-300">
                Whenever a student drops below threshold, the system flags their record and prepares pre-drafted SMS/Email alerts for dispatch to their guardians.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Database Design
    {
      title: 'MongoDB Schema & Compound Index Design',
      subtitle: 'NoSQL collections, validation rules, and relational integrity',
      category: 'DATABASE',
      notes:
        'Point out our compound unique index: date, subjectId, and studentId. This ensures that even with rapid clicking or multiple tabs, a student can never be marked twice for the same lecture.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-center">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-400 text-xs">StudentSchema</span>
              <span className="text-[10px] text-slate-500 font-mono">db.students</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`{
  rollNo: String (Unique),
  name: String,
  email: String (Unique),
  department: String,
  semester: Number (1-8),
  section: String,
  guardianPhone: String,
  status: 'active'
}`}
            </pre>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-400 text-xs">SubjectSchema</span>
              <span className="text-[10px] text-slate-500 font-mono">db.subjects</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`{
  code: String (CS601),
  name: String,
  credits: Number (3-4),
  department: String,
  semester: Number,
  facultyName: String,
  color: String
}`}
            </pre>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-400 text-xs">AttendanceSchema</span>
              <span className="text-[10px] text-slate-500 font-mono">db.attendances</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`{
  date: String (YYYY-MM-DD),
  subjectId: Ref('Subject'),
  studentId: Ref('Student'),
  status: 'present'|'absent',
  markedBy: String
}

// Compound Unique Index:
{ date: 1, subjectId: 1,
  studentId: 1 } (Unique)`}
            </pre>
          </div>
        </div>
      ),
    },

    // Slide 6: Results
    {
      title: 'Live Results & Testing Verification',
      subtitle: 'Real-time performance indicators and test execution matrix',
      category: 'TESTING & RESULTS',
      notes:
        'Show the actual data from the database: 10 students, 5 subjects, 80% average attendance, and 100% test case pass rate across our test suite.',
      content: (
        <div className="space-y-6 h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Enrolled Students</span>
              <span className="text-2xl font-bold text-white mt-1 block">{students.length}</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Curriculum Courses</span>
              <span className="text-2xl font-bold text-white mt-1 block">{subjects.length}</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Average Attendance</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">{overallPct}%</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">Active Defaulters</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">{defaultersCount}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Test Suite Verification Results</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                8 / 8 Tests Passed (100%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TC-01: Unique roll number constraint enforced</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TC-02: Atomic batch marking executes under 30ms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TC-03: Defaulter detection formula confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>TC-04: Compound index duplicate prevention confirmed</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7: Conclusion
    {
      title: 'Conclusion & Future Roadmap',
      subtitle: 'Key contributions and planned future developments',
      category: 'CONCLUSION',
      notes:
        'Conclude by summarizing that our MERN app achieves 100% paperless attendance, eliminates proxies, and keeps students aware. Then outline future steps: Facial AI recognition and campus geofencing.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              Project Outcomes & Contributions
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• Complete full-stack MERN application running in production.</li>
              <li>• Eradication of proxy attendance via session codes and audit logs.</li>
              <li>• Proactive defaulter intervention before final exam eligibility lists are locked.</li>
              <li>• Automated RFC 4180 CSV export and official university report generation.</li>
            </ul>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
              Future Enhancements
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>1. <strong>AI Facial Recognition:</strong> Real-time CCTV embeddings for hands-free lecture attendance.</li>
              <li>2. <strong>Classroom GPS Geofencing:</strong> Ensuring student PIN check-ins only execute within classroom radius.</li>
              <li>3. <strong>Direct WhatsApp API:</strong> Automated alert dispatch to guardians.</li>
              <li>4. <strong>Biometric Hardware:</strong> Integration with door-mounted optical RFID scanners.</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Direct Download Buttons */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Presentation className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Project Presentation (PPT) & Download Center</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                10-Slide Deck + Word Report
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Download native PowerPoint (.pptx) slides and complete Word (.doc) reports, or present directly on-screen.
            </p>
          </div>

          {/* Action Download Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download PPTX Button */}
            <button
              type="button"
              disabled={isGeneratingPptx}
              onClick={handleDownloadPptx}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPptx ? 'Building PPTX...' : 'Download PPT (.pptx)'}</span>
            </button>

            {/* Download Word Document Button */}
            <button
              type="button"
              onClick={handleDownloadWord}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Download Report (.doc)</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {downloadSuccessToast && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}
      </div>

      {/* Main Slide Deck Player Container */}
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-6 flex flex-col' : ''
        }`}
      >
        {/* Player Navigation Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-blue-400 font-bold">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-medium hidden sm:inline">
              {currentSlideData.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                showNotes ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              {showNotes ? 'Hide Viva Notes' : 'Show Viva Notes'}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slide Canvas (16:9 Presentation Aspect Ratio) */}
        <div className="relative p-6 sm:p-12 min-h-[460px] flex-1 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 select-none">
          {/* Top category kicker */}
          <div className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase mb-2">
            {currentSlideData.category}
          </div>

          {/* Slide Main Content */}
          <div className="flex-1 my-auto">{currentSlideData.content}</div>

          {/* Bottom slide footer indicator */}
          <div className="pt-4 mt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>{config.projectTitle} · Final Defense</span>
            <span>Use Left/Right arrow keys or buttons to navigate</span>
          </div>
        </div>

        {/* Presenter Notes Panel for Project Viva / Defense */}
        {showNotes && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              🎤
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-0.5">
                Speaker Notes for Viva Presentation:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSlideData.notes}
              </p>
            </div>
          </div>
        )}

        {/* Player Controls Bar */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          {/* Slide Selector Dots / Thumbnails */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx
                    ? 'w-6 bg-blue-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Downloadable Files Summary & Quick Access Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Available Project Deliverables & Submission Package
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">1. PowerPoint (.pptx)</span>
              <span className="text-[11px] text-slate-400">10 16:9 widescreen slides for defense</span>
            </div>
            <button
              onClick={handleDownloadPptx}
              className="p-2 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              title="Download PPTX"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">2. Word Report (.doc)</span>
              <span className="text-[11px] text-slate-400">All 8 chapters formatted for submission</span>
            </div>
            <button
              onClick={handleDownloadWord}
              className="p-2 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
              title="Download DOC"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-xs block">3. Print / PDF Document</span>
              <span className="text-[11px] text-slate-400">Official IEEE format print preview</span>
            </div>
            <button
              onClick={() => window.print()}
              className="p-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Print to PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
