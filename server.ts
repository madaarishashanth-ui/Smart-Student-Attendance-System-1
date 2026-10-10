import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  generateInitialAttendance,
  INITIAL_PROJECT_REPORT_CONFIG,
} from './src/data/initialData.ts';
import type { Student, Subject, AttendanceRecord, ProjectReportConfig } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory MongoDB-compatible document collections (seeded with rich data)
let studentsCollection: Student[] = [...INITIAL_STUDENTS];
let subjectsCollection: Subject[] = [...INITIAL_SUBJECTS];
let attendanceCollection: AttendanceRecord[] = generateInitialAttendance();
let projectReportConfig: ProjectReportConfig = { ...INITIAL_PROJECT_REPORT_CONFIG };

const USERS_COLLECTION = [
  {
    _id: 'usr_admin_01',
    name: 'Dr. Ramesh Gupta (HOD)',
    email: 'admin@college.edu',
    password: 'password123',
    role: 'admin',
    department: 'Computer Science & Engineering',
  },
  {
    _id: 'usr_faculty_01',
    name: 'Dr. Rajesh Sen',
    email: 'faculty@college.edu',
    password: 'password123',
    role: 'faculty',
    department: 'Computer Science & Engineering',
  },
  {
    _id: 'usr_student_01',
    name: 'Aarav Sharma',
    email: 'student@college.edu',
    password: 'password123',
    role: 'student',
    rollNo: '21CS101',
    department: 'Computer Science & Engineering',
  },
];

// --- REST API ENDPOINTS ---

// Auth Endpoints (Demonstrating Role-Based Access Control)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (role && !email) {
    const user = USERS_COLLECTION.find((u) => u.role === role);
    if (user) {
      return res.json({
        token: `jwt_mock_${user.role}_${Date.now()}`,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, department: user.department },
      });
    }
  }

  const user = USERS_COLLECTION.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (!user || (password && user.password !== password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    token: `jwt_mock_${user.role}_${Date.now()}`,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, department: user.department },
  });
});

app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json(USERS_COLLECTION.map(({ password, ...u }) => u));
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    counts: {
      students: studentsCollection.length,
      subjects: subjectsCollection.length,
      attendanceRecords: attendanceCollection.length,
    },
  });
});

// Students CRUD
app.get('/api/students', (req: Request, res: Response) => {
  const { semester, department, search } = req.query;
  let results = [...studentsCollection];

  if (semester) {
    results = results.filter((s) => s.semester === parseInt(semester as string, 10));
  }
  if (department) {
    results = results.filter((s) => s.department.toLowerCase() === (department as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

app.post('/api/students', (req: Request, res: Response) => {
  const { rollNo, name, email, department, semester, section, guardianPhone, status } = req.body;

  if (!rollNo || !name || !email) {
    return res.status(400).json({ error: 'Roll number, Name, and Email are required fields.' });
  }

  // Check unique rollNo
  if (studentsCollection.some((s) => s.rollNo.toLowerCase() === rollNo.toLowerCase())) {
    return res.status(409).json({ error: `Student with Roll No ${rollNo} already exists.` });
  }

  const newStudent: Student = {
    _id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rollNo: rollNo.toUpperCase(),
    name,
    email,
    department: department || 'Computer Science & Engineering',
    semester: Number(semester) || 6,
    section: section || 'A',
    guardianPhone: guardianPhone || '',
    status: status || 'active',
    createdAt: new Date().toISOString(),
  };

  studentsCollection.unshift(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = studentsCollection.findIndex((s) => s._id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const updated: Student = {
    ...studentsCollection[index],
    ...req.body,
    _id: id, // preserve immutable ID
  };

  studentsCollection[index] = updated;
  res.json(updated);
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = studentsCollection.some((s) => s._id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Student not found' });
  }

  studentsCollection = studentsCollection.filter((s) => s._id !== id);
  // Also remove attendance records associated with student
  attendanceCollection = attendanceCollection.filter((a) => a.studentId !== id);

  res.json({ message: 'Student deleted successfully', deletedId: id });
});

// Subjects CRUD
app.get('/api/subjects', (_req: Request, res: Response) => {
  res.json(subjectsCollection);
});

app.post('/api/subjects', (req: Request, res: Response) => {
  const { code, name, department, semester, credits, facultyName, color } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Subject code and Subject name are required.' });
  }

  if (subjectsCollection.some((s) => s.code.toLowerCase() === code.toLowerCase())) {
    return res.status(409).json({ error: `Subject code ${code} already exists.` });
  }

  const newSubject: Subject = {
    _id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: code.toUpperCase(),
    name,
    department: department || 'Computer Science & Engineering',
    semester: Number(semester) || 6,
    credits: Number(credits) || 3,
    facultyName: facultyName || 'Faculty Incharge',
    color: color || '#3b82f6',
    createdAt: new Date().toISOString(),
  };

  subjectsCollection.push(newSubject);
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = subjectsCollection.findIndex((s) => s._id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const updated: Subject = {
    ...subjectsCollection[index],
    ...req.body,
    _id: id,
  };

  subjectsCollection[index] = updated;
  res.json(updated);
});

app.delete('/api/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  subjectsCollection = subjectsCollection.filter((s) => s._id !== id);
  attendanceCollection = attendanceCollection.filter((a) => a.subjectId !== id);
  res.json({ message: 'Subject deleted successfully', deletedId: id });
});

// Attendance Records CRUD & Batch Operations
app.get('/api/attendance', (req: Request, res: Response) => {
  const { date, subjectId, studentId } = req.query;
  let records = [...attendanceCollection];

  if (date) {
    records = records.filter((r) => r.date === date);
  }
  if (subjectId) {
    records = records.filter((r) => r.subjectId === subjectId);
  }
  if (studentId) {
    records = records.filter((r) => r.studentId === studentId);
  }

  res.json(records);
});

// Batch Save / Mark Attendance for a session
app.post('/api/attendance/batch', (req: Request, res: Response) => {
  const { date, subjectId, records, markedBy } = req.body;

  if (!date || !subjectId || !Array.isArray(records)) {
    return res.status(400).json({ error: 'date, subjectId, and records array are required' });
  }

  // Remove existing records for this date and subject to avoid duplicates
  attendanceCollection = attendanceCollection.filter(
    (r) => !(r.date === date && r.subjectId === subjectId)
  );

  const newRecords: AttendanceRecord[] = records.map((item: { studentId: string; status: any; remarks?: string }) => ({
    _id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date,
    subjectId,
    studentId: item.studentId,
    status: item.status || 'present',
    markedBy: markedBy || 'Faculty',
    remarks: item.remarks || '',
    timestamp: new Date().toISOString(),
  }));

  attendanceCollection.push(...newRecords);
  res.status(201).json({
    message: `Attendance marked successfully for ${newRecords.length} students.`,
    count: newRecords.length,
    records: newRecords,
  });
});

app.put('/api/attendance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = attendanceCollection.findIndex((a) => a._id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  attendanceCollection[index] = {
    ...attendanceCollection[index],
    ...req.body,
    _id: id,
    timestamp: new Date().toISOString(),
  };

  res.json(attendanceCollection[index]);
});

// Analytics & Reports
app.get('/api/reports/analytics', (req: Request, res: Response) => {
  const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 75;

  const totalStudents = studentsCollection.length;
  const totalSubjects = subjectsCollection.length;

  // Unique session keys: date + subjectId
  const sessions = new Set<string>();
  attendanceCollection.forEach((r) => sessions.add(`${r.date}__${r.subjectId}`));
  const totalSessions = sessions.size;

  let totalAttended = 0;
  attendanceCollection.forEach((r) => {
    if (r.status === 'present' || r.status === 'late') {
      totalAttended++;
    }
  });

  const overallPercentage = attendanceCollection.length > 0
    ? Math.round((totalAttended / attendanceCollection.length) * 100 * 10) / 10
    : 0;

  // Calculate per student attendance stats
  const studentStats = studentsCollection.map((student) => {
    const studentRecords = attendanceCollection.filter((r) => r.studentId === student._id);
    const totalClasses = studentRecords.length;
    const attended = studentRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const pct = totalClasses > 0 ? Math.round((attended / totalClasses) * 100 * 10) / 10 : 100;
    const isDefaulter = totalClasses > 0 && pct < threshold;

    // Defaulter recovery formula:
    // Required: (attended + x) / (total + x) >= threshold / 100
    // x = ceil((threshold/100 * total - attended) / (1 - threshold/100))
    let classesNeededForThreshold = 0;
    if (isDefaulter && threshold < 100) {
      const targetRatio = threshold / 100;
      classesNeededForThreshold = Math.max(
        0,
        Math.ceil((targetRatio * totalClasses - attended) / (1 - targetRatio))
      );
    }

    const subjectBreakdown = subjectsCollection.map((subj) => {
      const subjRecs = studentRecords.filter((r) => r.subjectId === subj._id);
      const subTotal = subjRecs.length;
      const subAtt = subjRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
      const subPct = subTotal > 0 ? Math.round((subAtt / subTotal) * 100) : 100;
      return {
        subjectId: subj._id,
        subjectCode: subj.code,
        subjectName: subj.name,
        total: subTotal,
        attended: subAtt,
        percentage: subPct,
      };
    });

    return {
      student,
      totalClasses,
      attendedClasses: attended,
      percentage: pct,
      isDefaulter,
      classesNeededFor75: classesNeededForThreshold,
      subjectBreakdown,
    };
  });

  const defaulters = studentStats.filter((s) => s.isDefaulter);

  // Subject statistics
  const subjectStats = subjectsCollection.map((subj) => {
    const subjRecs = attendanceCollection.filter((r) => r.subjectId === subj._id);
    const total = subjRecs.length;
    const att = subjRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
    const pct = total > 0 ? Math.round((att / total) * 100 * 10) / 10 : 0;
    // sessions count for this subject
    const subjDates = new Set(subjRecs.map((r) => r.date));

    return {
      _id: subj._id,
      code: subj.code,
      name: subj.name,
      facultyName: subj.facultyName,
      classesHeld: subjDates.size,
      totalRecordCount: total,
      averageAttendance: pct,
    };
  });

  // Recent attendance trend by date
  const dateMap: { [date: string]: { date: string; present: number; absent: number; late: number; total: number } } = {};
  attendanceCollection.forEach((r) => {
    if (!dateMap[r.date]) {
      dateMap[r.date] = { date: r.date, present: 0, absent: 0, late: 0, total: 0 };
    }
    dateMap[r.date].total++;
    if (r.status === 'present') dateMap[r.date].present++;
    else if (r.status === 'absent') dateMap[r.date].absent++;
    else if (r.status === 'late') dateMap[r.date].late++;
  });

  const trend = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    summary: {
      totalStudents,
      totalSubjects,
      totalSessions,
      overallAttendancePercentage: overallPercentage,
      defaultersCount: defaulters.length,
      threshold,
    },
    studentStats,
    defaulters,
    subjectStats,
    trend,
  });
});

// Project Report Metadata Configuration
app.get('/api/project-report/config', (_req: Request, res: Response) => {
  res.json(projectReportConfig);
});

app.post('/api/project-report/config', (req: Request, res: Response) => {
  projectReportConfig = {
    ...projectReportConfig,
    ...req.body,
  };
  res.json({ message: 'Project report configuration updated', config: projectReportConfig });
});

// MongoDB Schema & Query Sandbox information
app.get('/api/mongodb/info', (_req: Request, res: Response) => {
  res.json({
    databaseName: 'smart_attendance_db',
    collections: ['students', 'subjects', 'attendances', 'users'],
    schemas: {
      studentSchema: `const StudentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, uppercase: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  department: { type: String, required: true, default: 'Computer Science & Engineering' },
  semester: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, default: 'A' },
  guardianPhone: { type: String },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });`,
      subjectSchema: `const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  facultyName: { type: String, required: true },
  color: { type: String, default: '#3b82f6' }
}, { timestamps: true });`,
      attendanceSchema: `const AttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  markedBy: { type: String, default: 'Faculty' },
  remarks: { type: String }
}, { timestamps: true });

// Compound unique index prevents duplicate attendance records for same student, subject, and date
AttendanceSchema.index({ date: 1, subjectId: 1, studentId: 1 }, { unique: true });`,
    },
    sampleAggregationPipeline: `db.attendances.aggregate([
  { $match: { subjectId: ObjectId("sub01") } },
  {
    $group: {
      _id: "$studentId",
      totalClasses: { $sum: 1 },
      presentCount: {
        $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      studentId: "$_id",
      totalClasses: 1,
      presentCount: 1,
      percentage: { $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100] }
    }
  },
  { $sort: { percentage: 1 } }
]);`,
  });
});

// Setup Vite Dev Middleware / Static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Attendance System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
