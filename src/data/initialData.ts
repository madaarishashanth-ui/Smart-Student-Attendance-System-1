import type { Student, Subject, AttendanceRecord, ProjectReportConfig } from '../types/index.ts';

export const INITIAL_STUDENTS: Student[] = [
  {
    _id: '66a101b7e01',
    rollNo: '21CS101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43210',
    status: 'active',
  },
  {
    _id: '66a101b7e02',
    rollNo: '21CS102',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43211',
    status: 'active',
  },
  {
    _id: '66a101b7e03',
    rollNo: '21CS103',
    name: 'Rohan Verma',
    email: 'rohan.verma@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43212',
    status: 'active',
  },
  {
    _id: '66a101b7e04',
    rollNo: '21CS104',
    name: 'Sneha Patel',
    email: 'sneha.patel@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43213',
    status: 'active',
  },
  {
    _id: '66a101b7e05',
    rollNo: '21CS105',
    name: 'Vikram Malhotra',
    email: 'vikram.m@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43214',
    status: 'active',
  },
  {
    _id: '66a101b7e06',
    rollNo: '21CS106',
    name: 'Pooja Hegde',
    email: 'pooja.h@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43215',
    status: 'active',
  },
  {
    _id: '66a101b7e07',
    rollNo: '21CS107',
    name: 'Aditya Rao',
    email: 'aditya.rao@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43216',
    status: 'active',
  },
  {
    _id: '66a101b7e08',
    rollNo: '21CS108',
    name: 'Diya Krishnan',
    email: 'diya.k@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43217',
    status: 'active',
  },
  {
    _id: '66a101b7e09',
    rollNo: '21CS109',
    name: 'Kunal Deshmukh',
    email: 'kunal.d@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43218',
    status: 'active',
  },
  {
    _id: '66a101b7e10',
    rollNo: '21CS110',
    name: 'Meera Nambiar',
    email: 'meera.n@college.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    guardianPhone: '+91 98765 43219',
    status: 'active',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    _id: 'sub01',
    code: 'CS601',
    name: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    facultyName: 'Dr. Rajesh Sen',
    color: '#3b82f6', // blue
  },
  {
    _id: 'sub02',
    code: 'CS602',
    name: 'Web Technologies & Cloud',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    facultyName: 'Prof. Anjali Saxena',
    color: '#10b981', // emerald
  },
  {
    _id: 'sub03',
    code: 'CS603',
    name: 'Computer Networks',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 3,
    facultyName: 'Dr. K. Srinivas',
    color: '#8b5cf6', // purple
  },
  {
    _id: 'sub04',
    code: 'CS604',
    name: 'Operating Systems & Security',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    facultyName: 'Prof. Sunita Pillai',
    color: '#f59e0b', // amber
  },
  {
    _id: 'sub05',
    code: 'CS605',
    name: 'Machine Learning Fundamentals',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 3,
    facultyName: 'Dr. Amitav Ghosh',
    color: '#ec4899', // pink
  },
];

// Helper to generate past 10 days of attendance
export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const subjectIds = INITIAL_SUBJECTS.map((s) => s._id);
  const studentIds = INITIAL_STUDENTS.map((s) => s._id);

  // Past 10 academic days (excluding Sundays)
  const dates = [
    '2026-09-28',
    '2026-09-29',
    '2026-09-30',
    '2026-10-01',
    '2026-10-02',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07',
    '2026-10-08',
    '2026-10-09',
  ];

  let recordCounter = 1;

  dates.forEach((date, dateIdx) => {
    // 2-3 subjects per day
    const subjectsForDay = subjectIds.slice((dateIdx % 3), (dateIdx % 3) + 3);

    subjectsForDay.forEach((subjId) => {
      studentIds.forEach((studId, studIdx) => {
        // Seed deterministic attendance patterns:
        // Student 101, 102, 104, 108 have high attendance (>= 90%)
        // Student 103, 105 have moderate attendance (~75-80%)
        // Student 107 (Aditya) and Student 109 (Kunal) have low attendance (< 75%) to trigger Defaulter status
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';

        if (studIdx === 6) {
          // Aditya Rao: frequent absent (~60%)
          status = (dateIdx + studIdx) % 3 === 0 ? 'absent' : (dateIdx % 4 === 0 ? 'late' : 'absent');
        } else if (studIdx === 8) {
          // Kunal Deshmukh: defaulter (~55%)
          status = dateIdx % 2 === 0 ? 'absent' : 'present';
        } else if (studIdx === 4 && dateIdx % 4 === 0) {
          // Vikram: occasional absence
          status = 'absent';
        } else if (studIdx === 2 && dateIdx % 3 === 0) {
          // Rohan
          status = 'late';
        } else if (dateIdx % 7 === 0 && studIdx % 5 === 0) {
          status = 'absent';
        }

        records.push({
          _id: `rec_${recordCounter++}`,
          date,
          subjectId: subjId,
          studentId: studId,
          status,
          markedBy: 'Faculty Member',
          timestamp: new Date(`${date}T10:00:00Z`).toISOString(),
        });
      });
    });
  });

  return records;
};

export const INITIAL_PROJECT_REPORT_CONFIG: ProjectReportConfig = {
  projectTitle: 'Smart Student Attendance System',
  students: [
    { name: 'Aarav Sharma', rollNo: '21CS101', branch: 'Computer Science & Engineering' },
    { name: 'Ananya Iyer', rollNo: '21CS102', branch: 'Computer Science & Engineering' },
    { name: 'Rohan Verma', rollNo: '21CS103', branch: 'Computer Science & Engineering' },
    { name: 'Sneha Patel', rollNo: '21CS104', branch: 'Computer Science & Engineering' },
  ],
  department: 'Department of Computer Science & Engineering',
  collegeName: 'National Institute of Technology / Engineering College',
  guideName: 'Dr. Rajesh Sen, Associate Professor',
  academicYear: '2025 - 2026',
  submissionDate: 'October 2026',
};
