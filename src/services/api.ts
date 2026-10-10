import { Student, Subject, AttendanceRecord, ProjectReportConfig } from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  generateInitialAttendance,
  INITIAL_PROJECT_REPORT_CONFIG,
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'smart_attend_students_v1',
  SUBJECTS: 'smart_attend_subjects_v1',
  ATTENDANCE: 'smart_attend_records_v1',
  REPORT_CONFIG: 'smart_attend_report_config_v1',
};

// Local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
}

// Initialize local cache if empty
if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
  setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}
if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
  setLocal(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
}
if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
  setLocal(STORAGE_KEYS.ATTENDANCE, generateInitialAttendance());
}
if (!localStorage.getItem(STORAGE_KEYS.REPORT_CONFIG)) {
  setLocal(STORAGE_KEYS.REPORT_CONFIG, INITIAL_PROJECT_REPORT_CONFIG);
}

export const api = {
  async getHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      status: 'online (client-emulated)',
      timestamp: new Date().toISOString(),
      stack: 'MERN Stack (MongoDB, Express.js, React 19, Node.js)',
      counts: {
        students: getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []).length,
        subjects: getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []).length,
        attendanceRecords: getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []).length,
      },
    };
  },

  async login(credentials: { email?: string; password?: string; role?: string }): Promise<{ token: string; user: any }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const role = (credentials.role || 'faculty') as 'faculty' | 'student' | 'admin';
    const names = {
      admin: 'Dr. Ramesh Gupta (HOD)',
      faculty: 'Dr. Rajesh Sen',
      student: 'Aarav Sharma',
    };
    return {
      token: `jwt_client_${role}_${Date.now()}`,
      user: {
        _id: `usr_${role}`,
        name: names[role],
        email: `${role}@college.edu`,
        role,
        rollNo: role === 'student' ? '21CS101' : undefined,
        department: 'Computer Science & Engineering',
      },
    };
  },

  async getStudents(search?: string, department?: string, semester?: number): Promise<Student[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (semester) params.append('semester', semester.toString());
      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.STUDENTS, data);
        return data;
      }
    } catch {
      // fallback to local
    }
    let list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
    }
    if (department) {
      list = list.filter((s) => s.department === department);
    }
    if (semester) {
      list = list.filter((s) => s.semester === semester);
    }
    return list;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) {
        const created = await res.json();
        const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
        setLocal(STORAGE_KEYS.STUDENTS, [created, ...list]);
        return created;
      }
      const err = await res.json();
      throw new Error(err.error || 'Failed to create student');
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
      // offline fallback creation
      const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
      if (list.some((s) => s.rollNo.toUpperCase() === studentData.rollNo?.toUpperCase())) {
        throw new Error(`Student with Roll No ${studentData.rollNo} already exists.`);
      }
      const newStudent: Student = {
        _id: `stu_${Date.now()}`,
        rollNo: (studentData.rollNo || '').toUpperCase(),
        name: studentData.name || '',
        email: studentData.email || '',
        department: studentData.department || 'Computer Science & Engineering',
        semester: Number(studentData.semester) || 6,
        section: studentData.section || 'A',
        guardianPhone: studentData.guardianPhone || '',
        status: studentData.status || 'active',
        createdAt: new Date().toISOString(),
      };
      setLocal(STORAGE_KEYS.STUDENTS, [newStudent, ...list]);
      return newStudent;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []).map((s) => (s._id === id ? updated : s));
        setLocal(STORAGE_KEYS.STUDENTS, list);
        return updated;
      }
    } catch {
      // fallback
    }
    const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const idx = list.findIndex((s) => s._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, _id: id };
      setLocal(STORAGE_KEYS.STUDENTS, list);
      return list[idx];
    }
    throw new Error('Student not found');
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []).filter((s) => s._id !== id);
    setLocal(STORAGE_KEYS.STUDENTS, list);
    // Also clean up attendance
    const att = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []).filter((a) => a.studentId !== id);
    setLocal(STORAGE_KEYS.ATTENDANCE, att);
  },

  async getSubjects(): Promise<Subject[]> {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.SUBJECTS, data);
        return data;
      }
    } catch {
      // fallback
    }
    return getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },

  async createSubject(subjectData: Partial<Subject>): Promise<Subject> {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectData),
      });
      if (res.ok) {
        const created = await res.json();
        const list = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
        setLocal(STORAGE_KEYS.SUBJECTS, [...list, created]);
        return created;
      }
      const err = await res.json();
      throw new Error(err.error || 'Failed to create subject');
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) throw e;
      const list = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
      if (list.some((s) => s.code.toUpperCase() === subjectData.code?.toUpperCase())) {
        throw new Error(`Subject code ${subjectData.code} already exists.`);
      }
      const newSubject: Subject = {
        _id: `sub_${Date.now()}`,
        code: (subjectData.code || '').toUpperCase(),
        name: subjectData.name || '',
        department: subjectData.department || 'Computer Science & Engineering',
        semester: Number(subjectData.semester) || 6,
        credits: Number(subjectData.credits) || 3,
        facultyName: subjectData.facultyName || 'Faculty Incharge',
        color: subjectData.color || '#3b82f6',
        createdAt: new Date().toISOString(),
      };
      setLocal(STORAGE_KEYS.SUBJECTS, [...list, newSubject]);
      return newSubject;
    }
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        const list = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []).map((s) => (s._id === id ? updated : s));
        setLocal(STORAGE_KEYS.SUBJECTS, list);
        return updated;
      }
    } catch {
      // fallback
    }
    const list = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
    const idx = list.findIndex((s) => s._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, _id: id };
      setLocal(STORAGE_KEYS.SUBJECTS, list);
      return list[idx];
    }
    throw new Error('Subject not found');
  },

  async deleteSubject(id: string): Promise<void> {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const list = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, []).filter((s) => s._id !== id);
    setLocal(STORAGE_KEYS.SUBJECTS, list);
    const att = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []).filter((a) => a.subjectId !== id);
    setLocal(STORAGE_KEYS.ATTENDANCE, att);
  },

  async getAttendance(date?: string, subjectId?: string, studentId?: string): Promise<AttendanceRecord[]> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (subjectId) params.append('subjectId', subjectId);
      if (studentId) params.append('studentId', studentId);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    let list = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    if (date) list = list.filter((r) => r.date === date);
    if (subjectId) list = list.filter((r) => r.subjectId === subjectId);
    if (studentId) list = list.filter((r) => r.studentId === studentId);
    return list;
  },

  async batchSaveAttendance(
    date: string,
    subjectId: string,
    records: { studentId: string; status: any; remarks?: string }[],
    markedBy = 'Faculty Member'
  ): Promise<any> {
    try {
      const res = await fetch('/api/attendance/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, subjectId, records, markedBy }),
      });
      if (res.ok) {
        const data = await res.json();
        // sync to local
        const existing = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []).filter(
          (r) => !(r.date === date && r.subjectId === subjectId)
        );
        setLocal(STORAGE_KEYS.ATTENDANCE, [...existing, ...data.records]);
        return data;
      }
    } catch {
      // fallback
    }
    // local fallback
    let current = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []).filter(
      (r) => !(r.date === date && r.subjectId === subjectId)
    );
    const newItems: AttendanceRecord[] = records.map((item) => ({
      _id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date,
      subjectId,
      studentId: item.studentId,
      status: item.status,
      markedBy,
      remarks: item.remarks,
      timestamp: new Date().toISOString(),
    }));
    setLocal(STORAGE_KEYS.ATTENDANCE, [...current, ...newItems]);
    return { count: newItems.length, records: newItems };
  },

  async getAnalytics(threshold = 75): Promise<any> {
    try {
      const res = await fetch(`/api/reports/analytics?threshold=${threshold}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback computation below
    }

    const students = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const subjects = getLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const attendances = getLocal<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);

    const sessions = new Set<string>();
    attendances.forEach((r) => sessions.add(`${r.date}__${r.subjectId}`));

    let totalAttended = 0;
    attendances.forEach((r) => {
      if (r.status === 'present' || r.status === 'late') totalAttended++;
    });

    const overallPct = attendances.length > 0
      ? Math.round((totalAttended / attendances.length) * 100 * 10) / 10
      : 0;

    const studentStats = students.map((student) => {
      const sRecs = attendances.filter((r) => r.studentId === student._id);
      const total = sRecs.length;
      const att = sRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
      const pct = total > 0 ? Math.round((att / total) * 100 * 10) / 10 : 100;
      const isDefaulter = total > 0 && pct < threshold;

      let classesNeededForThreshold = 0;
      if (isDefaulter && threshold < 100) {
        const targetRatio = threshold / 100;
        classesNeededForThreshold = Math.max(0, Math.ceil((targetRatio * total - att) / (1 - targetRatio)));
      }

      const subjectBreakdown = subjects.map((subj) => {
        const subjRecs = sRecs.filter((r) => r.subjectId === subj._id);
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
        totalClasses: total,
        attendedClasses: att,
        percentage: pct,
        isDefaulter,
        classesNeededFor75: classesNeededForThreshold,
        subjectBreakdown,
      };
    });

    const defaulters = studentStats.filter((s) => s.isDefaulter);

    const subjectStats = subjects.map((subj) => {
      const subjRecs = attendances.filter((r) => r.subjectId === subj._id);
      const total = subjRecs.length;
      const att = subjRecs.filter((r) => r.status === 'present' || r.status === 'late').length;
      const pct = total > 0 ? Math.round((att / total) * 100 * 10) / 10 : 0;
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

    const dateMap: { [date: string]: { date: string; present: number; absent: number; late: number; total: number } } = {};
    attendances.forEach((r) => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { date: r.date, present: 0, absent: 0, late: 0, total: 0 };
      }
      dateMap[r.date].total++;
      if (r.status === 'present') dateMap[r.date].present++;
      else if (r.status === 'absent') dateMap[r.date].absent++;
      else if (r.status === 'late') dateMap[r.date].late++;
    });

    const trend = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalStudents: students.length,
        totalSubjects: subjects.length,
        totalSessions: sessions.size,
        overallAttendancePercentage: overallPct,
        defaultersCount: defaulters.length,
        threshold,
      },
      studentStats,
      defaulters,
      subjectStats,
      trend,
    };
  },

  async getProjectReportConfig(): Promise<ProjectReportConfig> {
    try {
      const res = await fetch('/api/project-report/config');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.REPORT_CONFIG, data);
        return data;
      }
    } catch {
      // fallback
    }
    return getLocal<ProjectReportConfig>(STORAGE_KEYS.REPORT_CONFIG, INITIAL_PROJECT_REPORT_CONFIG);
  },

  async saveProjectReportConfig(config: ProjectReportConfig): Promise<ProjectReportConfig> {
    try {
      await fetch('/api/project-report/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch {
      // fallback
    }
    setLocal(STORAGE_KEYS.REPORT_CONFIG, config);
    return config;
  },

  async getMongoInfo(): Promise<any> {
    try {
      const res = await fetch('/api/mongodb/info');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      databaseName: 'smart_attendance_db',
      collections: ['students', 'subjects', 'attendances', 'users'],
    };
  },

  resetToDefaultData() {
    setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setLocal(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    setLocal(STORAGE_KEYS.ATTENDANCE, generateInitialAttendance());
    setLocal(STORAGE_KEYS.REPORT_CONFIG, INITIAL_PROJECT_REPORT_CONFIG);
  },
};
