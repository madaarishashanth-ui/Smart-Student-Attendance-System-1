import React, { useState } from 'react';
import {
  Database,
  Server,
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

export const MernEngineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'api' | 'mongodb'>('architecture');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/health');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<string>('Click "Execute API Request" to test endpoint live.');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestApi = async () => {
    const start = performance.now();
    try {
      const res = await fetch(selectedEndpoint);
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setResponseTime(duration);
      setStatusCode(res.status);
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResponseTime(duration);
      setStatusCode(500);
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    }
  };

  const mongooseStudentSchema = `// models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email']
  },
  department: {
    type: String,
    required: true,
    default: 'Computer Science & Engineering'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  section: {
    type: String,
    default: 'A'
  },
  guardianPhone: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);`;

  const mongooseAttendanceSchema = `// models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  markedBy: {
    type: String,
    default: 'Faculty Member'
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Compound unique index prevents duplicate records for same student, subject, and date
AttendanceSchema.index({ date: 1, subjectId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);`;

  const aggregationPipeline = `// Defaulter Detection Aggregation Pipeline in MongoDB
db.attendances.aggregate([
  // Step 1: Match records for current academic semester/subject
  { 
    $match: { 
      subjectId: ObjectId("66a101b7e01") 
    } 
  },
  // Step 2: Group by studentId and calculate total vs attended sessions
  {
    $group: {
      _id: "$studentId",
      totalSessions: { $sum: 1 },
      attendedSessions: {
        $sum: {
          $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0]
        }
      }
    }
  },
  // Step 3: Compute attendance percentage
  {
    $project: {
      studentId: "$_id",
      totalSessions: 1,
      attendedSessions: 1,
      attendancePercentage: {
        $multiply: [
          { $divide: ["$attendedSessions", "$totalSessions"] },
          100
        ]
      }
    }
  },
  // Step 4: Join student demographic details via $lookup
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "studentInfo"
    }
  },
  { $unwind: "$studentInfo" },
  // Step 5: Filter defaulters with attendance < 75%
  { 
    $match: { 
      attendancePercentage: { $lt: 75 } 
    } 
  },
  // Step 6: Sort by critical shortage descending
  { $sort: { attendancePercentage: 1 } }
]);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">MERN Stack Architecture & Engine</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                Node.js + Express.js + React + MongoDB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete technical demonstration of REST API controllers, MongoDB document modeling, compound indexes, and aggregation pipelines.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REST API Playground
            </button>
            <button
              onClick={() => setActiveTab('mongodb')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'mongodb'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MongoDB Schemas & Aggregation
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">M - MongoDB</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Document-oriented NoSQL database. Stores students, subjects, attendance logs, and audit trails in flexible JSON-like BSON collections with compound indexing.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                Collections: students, subjects, attendances
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">E - Express.js</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Lightweight, fast web framework for Node.js. Handles routing, HTTP status codes, middleware, batch payload serialization, and analytics computation.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                Port: 3000 · REST Middleware
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">R - React.js 19</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Declarative, component-based user interface. Features responsive role dashboards, live roll-call shortcuts, real-time KPI aggregations, and printable reports.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                SPA · Tailwind CSS · Motion
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">N - Node.js</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Asynchronous event-driven JavaScript runtime engine. Executes server-side business logic, calculates defaulter thresholds, and generates structured outputs.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                V8 Engine · tsx runtime
              </div>
            </div>
          </div>

          {/* Data Flow Diagram Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              MERN End-to-End System Workflow (DFD Level 1)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-blue-400 block mb-1">1. User Interaction</span>
                <span className="text-slate-300">
                  Faculty selects Date & Subject, marks status (P/A/L/E) or generates PIN
                </span>
              </div>
              <div className="flex items-center justify-center text-slate-600 font-bold hidden md:flex">
                →
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-emerald-400 block mb-1">2. Express REST API</span>
                <span className="text-slate-300">
                  <code className="text-[11px]">POST /api/attendance/batch</code> parses payload and validates input
                </span>
              </div>
              <div className="flex items-center justify-center text-slate-600 font-bold hidden md:flex">
                →
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-cyan-400 block mb-1">3. MongoDB Document Write</span>
                <span className="text-slate-300">
                  Atomic batch upsert with compound index check <code className="text-[11px]">(date + sub + stu)</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: REST API Playground */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="font-mono text-xs font-bold px-3 py-2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {httpMethod}
              </span>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value="/api/health">GET /api/health - System stack & server heartbeat</option>
                <option value="/api/students">GET /api/students - List all student records</option>
                <option value="/api/subjects">GET /api/subjects - List all academic subjects</option>
                <option value="/api/attendance?date=2026-10-09">GET /api/attendance - Query attendance by date</option>
                <option value="/api/reports/analytics?threshold=75">GET /api/reports/analytics - Attendance analytics & defaulters</option>
                <option value="/api/mongodb/info">GET /api/mongodb/info - MongoDB schema & query docs</option>
              </select>
              <button
                type="button"
                onClick={handleTestApi}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute API Request</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              {statusCode !== null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-mono font-bold ${
                      statusCode >= 200 && statusCode < 300
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {statusCode} OK
                  </span>
                </div>
              )}
              {responseTime !== null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Response Latency:</span>
                  <span className="font-mono text-slate-200">{responseTime} ms</span>
                </div>
              )}
            </div>

            <div className="mt-3 relative">
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto leading-relaxed">
                {apiResponse}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MongoDB Schemas & Aggregation */}
      {activeTab === 'mongodb' && (
        <div className="space-y-6">
          {/* Mongoose Student Schema */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Mongoose Model: StudentSchema
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(mongooseStudentSchema, 'student')}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
              >
                {copiedCode === 'student' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'student' ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
              {mongooseStudentSchema}
            </pre>
          </div>

          {/* Compound Index Attendance Schema */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Mongoose Model: AttendanceSchema with Compound Index
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(mongooseAttendanceSchema, 'attendance')}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
              >
                {copiedCode === 'attendance' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'attendance' ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {mongooseAttendanceSchema}
            </pre>
          </div>

          {/* Aggregation Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                MongoDB Aggregation Pipeline for Defaulter Detection
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(aggregationPipeline, 'pipeline')}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
              >
                {copiedCode === 'pipeline' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'pipeline' ? 'Copied' : 'Copy Pipeline'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
              {aggregationPipeline}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
