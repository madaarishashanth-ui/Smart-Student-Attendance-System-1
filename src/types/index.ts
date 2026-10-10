export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  _id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  section: string;
  guardianPhone?: string;
  status: 'active' | 'suspended';
  avatar?: string;
  createdAt?: string;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
  color?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  studentId: string;
  status: AttendanceStatus;
  markedBy?: string;
  remarks?: string;
  timestamp: string;
}

export interface AttendanceSummary {
  totalStudents: number;
  totalSubjects: number;
  totalSessions: number;
  overallAttendancePercentage: number;
  todayMarkedCount: number;
  defaultersCount: number; // Students with < 75%
  presentToday: number;
  absentToday: number;
}

export interface StudentAttendanceStat {
  student: Student;
  totalClasses: number;
  attendedClasses: number; // present + late
  percentage: number;
  isDefaulter: boolean;
  classesNeededFor75: number;
  subjectBreakdown: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    total: number;
    attended: number;
    percentage: number;
  }[];
}

export interface ProjectReportConfig {
  projectTitle: string;
  students: {
    name: string;
    rollNo: string;
    branch: string;
  }[];
  department: string;
  collegeName: string;
  guideName: string;
  academicYear: string;
  submissionDate: string;
}

export interface TestCaseItem {
  id: string;
  module: string;
  description: string;
  testInput: string;
  expectedResult: string;
  actualResult: string;
  status: 'passed' | 'failed' | 'pending';
  executionTimeMs: number;
}

export type UserRole = 'faculty' | 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNo?: string;
  department?: string;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

