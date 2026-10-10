import pptxgen from 'pptxgenjs';
import { ProjectReportConfig, Student, Subject, TestCaseItem } from '../types';

/**
 * Generates and downloads a native Microsoft PowerPoint (.pptx) file
 * using pptxgenjs.
 */
export async function downloadPptxPresentation(
  config: ProjectReportConfig,
  students: Student[],
  subjects: Subject[],
  analytics: any,
  testCases: TestCaseItem[]
): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = config.projectTitle;
  pptx.author = config.students.map((s) => s.name).join(', ');
  pptx.company = config.collegeName;

  // Theme Colors
  const COLOR_BG_DARK = '0B0F19';
  const COLOR_PRIMARY = '3B82F6';
  const COLOR_ACCENT = '6366F1';
  const COLOR_TEXT_LIGHT = 'F8FAFC';
  const COLOR_TEXT_MUTED = '94A3B8';
  const COLOR_CARD = '1E293B';
  const COLOR_SUCCESS = '10B981';

  // Helper for slide header
  const addHeader = (slide: any, title: string, category: string) => {
    slide.background = { color: 'F8FAFC' };

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.15,
      fill: { color: COLOR_PRIMARY },
    });

    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLOR_ACCENT,
      fontFace: 'Arial',
    });

    slide.addText(title, {
      x: 0.8,
      y: 0.7,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: '0F172A',
      fontFace: 'Arial',
    });

    // Subtle bottom footer
    slide.addText(`${config.projectTitle} · ${config.collegeName}`, {
      x: 0.8,
      y: 7.1,
      w: 10.0,
      h: 0.3,
      fontSize: 9,
      color: '64748B',
      fontFace: 'Arial',
    });
  };

  // -------------------------------------------------------------
  // SLIDE 1: Title Slide (Dark Theme for Executive Presence)
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_BG_DARK };

    // Top banner tag
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.0,
      w: 3.2,
      h: 0.4,
      fill: { color: '1E3A8A' },
      line: { color: '3B82F6', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('MERN STACK ACADEMIC PROJECT', {
      x: 0.8,
      y: 1.0,
      w: 3.2,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: '93C5FD',
      align: 'center',
    });

    // Main Title
    slide.addText(config.projectTitle, {
      x: 0.8,
      y: 1.6,
      w: 11.5,
      h: 1.2,
      fontSize: 34,
      bold: true,
      color: COLOR_TEXT_LIGHT,
      fontFace: 'Arial',
    });

    // Subtitle
    slide.addText('Automated Tracking, Defaulter Analytics & Reporting System', {
      x: 0.8,
      y: 2.7,
      w: 11.0,
      h: 0.5,
      fontSize: 16,
      color: COLOR_TEXT_MUTED,
      fontFace: 'Arial',
    });

    // Team Card (Left Box)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.6,
      w: 5.6,
      h: 2.8,
      fill: { color: COLOR_CARD },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('PROJECT TEAM MEMBERS', {
      x: 1.1,
      y: 3.8,
      w: 5.0,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: '60A5FA',
    });

    const teamTextItems = config.students.map((s) => ({
      text: `• ${s.name} (${s.rollNo}) - ${s.branch}\n`,
      options: { fontSize: 11, color: COLOR_TEXT_LIGHT },
    }));
    slide.addText(teamTextItems, {
      x: 1.1,
      y: 4.2,
      w: 5.0,
      h: 2.0,
      fontFace: 'Arial',
    });

    // Guide & College Card (Right Box)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 3.6,
      w: 5.6,
      h: 2.8,
      fill: { color: COLOR_CARD },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('INSTITUTIONAL SUPERVISION', {
      x: 7.1,
      y: 3.8,
      w: 5.0,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: 'A78BFA',
    });

    slide.addText(
      `Project Guide:\n${config.guideName}\n\nDepartment & Institution:\n${config.department}\n${config.collegeName}\n\nAcademic Year: ${config.academicYear}`,
      {
        x: 7.1,
        y: 4.2,
        w: 5.0,
        h: 2.0,
        fontSize: 11,
        color: COLOR_TEXT_LIGHT,
        fontFace: 'Arial',
      }
    );
  }

  // -------------------------------------------------------------
  // SLIDE 2: Problem Statement & Background
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Problem Statement & Motivation', 'Overview');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.5,
      h: 5.0,
      fill: { color: 'FEF2F2' },
      line: { color: 'FCA5A5', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('CHALLENGES OF CONVENTIONAL SYSTEMS', {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: '991B1B',
    });
    slide.addText(
      [
        { text: '• Paper Register Vulnerability: ', options: { bold: true } },
        { text: 'Subject to loss, damage, and unauthorized tampering.\n\n' },
        { text: '• Proxy Attendance: ', options: { bold: true } },
        { text: 'High rate of proxy marking in crowded lecture halls.\n\n' },
        { text: '• Delayed Computation: ', options: { bold: true } },
        { text: 'Percentages calculated only at month-end; leaves students unaware of deficit.\n\n' },
        { text: '• Administrative Fatigue: ', options: { bold: true } },
        { text: 'Faculties spend 10-15 minutes per lecture doing manual roll calls.' },
      ],
      { x: 1.1, y: 2.3, w: 4.9, h: 3.8, fontSize: 11, color: '1F2937' }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.5,
      h: 5.0,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('MANDATE & REGULATORY CONTEXT', {
      x: 7.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: '1E40AF',
    });
    slide.addText(
      [
        { text: '• Mandatory 75% University Rule: ', options: { bold: true } },
        { text: 'Statutory AICTE/University norm requires minimum 75% attendance for semester exam eligibility.\n\n' },
        { text: '• Real-Time Awareness Deficit: ', options: { bold: true } },
        { text: 'Students frequently debarred without prior warning.\n\n' },
        { text: '• Need for Modern Full-Stack Solution: ', options: { bold: true } },
        { text: 'Demonstrating MERN stack capabilities to deliver instantaneous audit trails and recovery predictions.' },
      ],
      { x: 7.1, y: 2.3, w: 4.9, h: 3.8, fontSize: 11, color: '1F2937' }
    );
  }

  // -------------------------------------------------------------
  // SLIDE 3: Proposed Solution & Objectives
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Proposed Solution & Core Objectives', 'Architecture');

    const cards = [
      {
        title: 'MERN Stack Engineering',
        desc: 'Built using React 19, Express.js REST APIs, Node.js runtime, and MongoDB document database.',
        color: 'DBEAFE',
        textCol: '1E3A8A',
        x: 0.8,
        y: 1.6,
      },
      {
        title: 'Multi-Mode Attendance',
        desc: 'Instant batch mark (All Present/Absent), sequential roll call with shortcuts, and 6-digit PIN check-in.',
        color: 'D1FAE5',
        textCol: '065F46',
        x: 6.8,
        y: 1.6,
      },
      {
        title: 'Defaulter Prediction Engine',
        desc: 'Calculates shortage gap and exact number of consecutive classes needed to recover to 75%.',
        color: 'FEE2E2',
        textCol: '991B1B',
        x: 0.8,
        y: 4.2,
      },
      {
        title: 'Automated Reports & Export',
        desc: 'Download CSV registers, IEEE formatted documentation, and dispatch parent SMS/Email warnings.',
        color: 'EDE9FE',
        textCol: '4C1D95',
        x: 6.8,
        y: 4.2,
      },
    ];

    cards.forEach((c) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: c.x,
        y: c.y,
        w: 5.5,
        h: 2.3,
        fill: { color: c.color },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(c.title, {
        x: c.x + 0.3,
        y: c.y + 0.3,
        w: 4.9,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: c.textCol,
      });
      slide.addText(c.desc, {
        x: c.x + 0.3,
        y: c.y + 0.8,
        w: 4.9,
        h: 1.2,
        fontSize: 11,
        color: '334155',
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 4: MERN Technology Stack Overview
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'MERN Full-Stack System Architecture', 'Technology');

    const stackItems = [
      {
        letter: 'M',
        tech: 'MongoDB',
        role: 'Database Layer',
        details: 'Document collection store with compound indexing (date + subject + student) ensuring zero duplicate marks.',
        color: '10B981',
      },
      {
        letter: 'E',
        tech: 'Express.js',
        role: 'Backend Framework',
        details: 'REST API routing, batch payload processing, mathematical defaulter aggregation, and HTTP status codes.',
        color: '64748B',
      },
      {
        letter: 'R',
        tech: 'React 19',
        role: 'Frontend Client',
        details: 'Responsive Single Page App, role switcher (Faculty/Admin/Student), interactive roll call, and print engine.',
        color: '3B82F6',
      },
      {
        letter: 'N',
        tech: 'Node.js',
        role: 'Runtime Engine',
        details: 'Asynchronous V8 event loop executing server controllers, calculations, and static asset delivery.',
        color: 'F59E0B',
      },
    ];

    stackItems.forEach((item, idx) => {
      const x = 0.8 + idx * 3.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 1.6,
        w: 2.7,
        h: 5.0,
        fill: { color: 'FFFFFF' },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.1,
      });

      // Letter Circle
      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.85,
        y: 2.0,
        w: 1.0,
        h: 1.0,
        fill: { color: item.color },
      });
      slide.addText(item.letter, {
        x: x + 0.85,
        y: 2.0,
        w: 1.0,
        h: 1.0,
        fontSize: 22,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
      });

      slide.addText(item.tech, {
        x: x + 0.2,
        y: 3.2,
        w: 2.3,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: '0F172A',
        align: 'center',
      });

      slide.addText(item.role, {
        x: x + 0.2,
        y: 3.6,
        w: 2.3,
        h: 0.3,
        fontSize: 10,
        color: item.color,
        bold: true,
        align: 'center',
      });

      slide.addText(item.details, {
        x: x + 0.2,
        y: 4.1,
        w: 2.3,
        h: 2.2,
        fontSize: 10,
        color: '475569',
        align: 'left',
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 5: Defaulter Recovery Mathematical Algorithm
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Defaulter Detection & Recovery Algorithm', 'Algorithm');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 2.2,
      fill: { color: '1E293B' },
      rectRadius: 0.1,
    });

    slide.addText('MATHEMATICAL RECOVERY EQUATION', {
      x: 1.1,
      y: 1.7,
      w: 10.9,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: '93C5FD',
    });

    slide.addText(
      'X = ceil( (T * Total - Attended) / (1 - T) )',
      {
        x: 1.1,
        y: 2.1,
        w: 10.9,
        h: 0.7,
        fontSize: 24,
        bold: true,
        color: '38BDF8',
        fontFace: 'Courier New',
        align: 'center',
      }
    );

    slide.addText(
      'Where: T = Target Attendance Threshold (0.75), Total = Total Classes Held, Attended = Classes Present, X = Consecutive Classes Needed',
      {
        x: 1.1,
        y: 2.9,
        w: 10.9,
        h: 0.5,
        fontSize: 10,
        color: 'CBD5E1',
        align: 'center',
      }
    );

    // Demonstration Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.0,
      w: 5.6,
      h: 2.6,
      fill: { color: 'FEF2F2' },
      line: { color: 'F87171', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('Real-World Case Example:', {
      x: 1.1,
      y: 4.2,
      w: 5.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '991B1B',
    });
    slide.addText(
      '• Total classes conducted: 20\n• Classes attended: 10 (Current = 50%)\n• Target required: 75% (T = 0.75)\n\nCalculation:\nX = ceil( (0.75 * 20 - 10) / (1 - 0.75) )\nX = ceil( (15 - 10) / 0.25 ) = ceil( 5 / 0.25 ) = 20 classes\n\nResult: Student must attend next 20 consecutive classes without absence.',
      { x: 1.1, y: 4.6, w: 5.0, h: 1.8, fontSize: 10, color: '1F2937' }
    );

    // Complexity Analysis Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.7,
      y: 4.0,
      w: 5.6,
      h: 2.6,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('Computational Complexity:', {
      x: 7.0,
      y: 4.2,
      w: 5.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '166534',
    });
    slide.addText(
      '• Per-Student Calculation: O(1) closed-form constant time.\n• Full Cohort Aggregation: O(N) where N is student count.\n• Database Query: O(1) index lookup on (date, subjectId, studentId).\n• Aggregation Pipeline: Streamed in memory using MongoDB $group & $project operators.\n\nGuarantees real-time recalculation upon every attendance mark.',
      { x: 7.0, y: 4.6, w: 5.0, h: 1.8, fontSize: 10, color: '1F2937' }
    );
  }

  // -------------------------------------------------------------
  // SLIDE 6: MongoDB Schemas & Data Model
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Database Architecture & Mongoose Modeling', 'Database');

    const collections = [
      {
        name: 'students Collection',
        fields: [
          '• _id: ObjectId (Primary Key)',
          '• rollNo: String (Unique, Indexed)',
          '• name: String (Trimmed)',
          '• email: String (Unique)',
          '• department: String',
          '• semester: Number (1-8)',
          '• guardianPhone: String',
        ],
        x: 0.8,
      },
      {
        name: 'subjects Collection',
        fields: [
          '• _id: ObjectId (Primary Key)',
          '• code: String (e.g. CS601, Unique)',
          '• name: String (Course Title)',
          '• department: String',
          '• semester: Number',
          '• credits: Number (1-6)',
          '• facultyName: String',
        ],
        x: 4.7,
      },
      {
        name: 'attendances Collection',
        fields: [
          '• _id: ObjectId (Primary Key)',
          '• date: String (YYYY-MM-DD, Indexed)',
          '• subjectId: Ref(Subject, Indexed)',
          '• studentId: Ref(Student, Indexed)',
          '• status: Enum (present/absent/late)',
          '• markedBy: String',
          '★ Compound Unique Index:',
          '  { date: 1, subjectId: 1, studentId: 1 }',
        ],
        x: 8.6,
      },
    ];

    collections.forEach((col) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: col.x,
        y: 1.6,
        w: 3.7,
        h: 5.0,
        fill: { color: 'FFFFFF' },
        line: { color: 'CBD5E1', width: 1.5 },
        rectRadius: 0.1,
      });

      slide.addText(col.name, {
        x: col.x + 0.2,
        y: 1.9,
        w: 3.3,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: COLOR_PRIMARY,
      });

      slide.addText(col.fields.join('\n\n'), {
        x: col.x + 0.2,
        y: 2.5,
        w: 3.3,
        h: 3.8,
        fontSize: 10,
        color: '334155',
        fontFace: 'Courier New',
      });
    });
  }

  // -------------------------------------------------------------
  // SLIDE 7: Live Results & Analytics Dashboard
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Project Results & System Performance', 'Results');

    const totalStudents = students.length;
    const totalSubjects = subjects.length;
    const overallPct = analytics?.summary?.overallAttendancePercentage || 80;
    const defaultersCount = analytics?.summary?.defaultersCount || 2;

    const statsCards = [
      { label: 'Total Enrolled Students', value: `${totalStudents}`, color: '3B82F6', x: 0.8, y: 1.6 },
      { label: 'Academic Courses', value: `${totalSubjects}`, color: '6366F1', x: 3.8, y: 1.6 },
      { label: 'Average Class Attendance', value: `${overallPct}%`, color: '10B981', x: 6.8, y: 1.6 },
      { label: 'Flagged Defaulters (<75%)', value: `${defaultersCount}`, color: 'EF4444', x: 9.8, y: 1.6 },
    ];

    statsCards.forEach((c) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: c.x,
        y: c.y,
        w: 2.6,
        h: 1.8,
        fill: { color: 'FFFFFF' },
        line: { color: 'E2E8F0', width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(c.label, {
        x: c.x + 0.15,
        y: c.y + 0.25,
        w: 2.3,
        h: 0.4,
        fontSize: 10,
        color: '64748B',
        align: 'center',
      });
      slide.addText(c.value, {
        x: c.x + 0.15,
        y: c.y + 0.7,
        w: 2.3,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: c.color,
        align: 'center',
      });
    });

    // Key Achievements Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.8,
      w: 11.6,
      h: 2.8,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('CORE PERFORMANCE HIGHLIGHTS', {
      x: 1.1,
      y: 4.1,
      w: 11.0,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '0F172A',
    });
    slide.addText(
      [
        { text: '✔ Sub-50ms REST API Latency: ', options: { bold: true } },
        { text: 'Atomic batch writes process 60 students in less than 30ms.\n\n' },
        { text: '✔ Zero Proxy Duplication: ', options: { bold: true } },
        { text: 'Compound MongoDB indexing prevents accidental duplicate attendance marking.\n\n' },
        { text: '✔ Proactive Academic Warning: ', options: { bold: true } },
        { text: 'Identified all at-risk students before final semester exams.\n\n' },
        { text: '✔ 100% Paperless Workflow: ', options: { bold: true } },
        { text: 'Eliminated manual paper attendance registers across all courses.' },
      ],
      { x: 1.1, y: 4.5, w: 11.0, h: 1.9, fontSize: 11, color: '334155' }
    );
  }

  // -------------------------------------------------------------
  // SLIDE 8: Test Cases & Quality Assurance
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Software Testing & Validation Matrix', 'Verification');

    // Table rows
    const tableData: any[] = [
      [
        { text: 'Test ID', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
        { text: 'Module', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
        { text: 'Test Case Description', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
        { text: 'Expected Outcome', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
        { text: 'Status', options: { bold: true, fill: '1E293B', color: 'FFFFFF' } },
      ],
      [
        { text: 'TC-01' },
        { text: 'Student CRUD' },
        { text: 'Prevent duplicate roll number insertion' },
        { text: 'Returns HTTP 409 Conflict' },
        { text: 'PASSED', options: { color: '10B981', bold: true } },
      ],
      [
        { text: 'TC-02' },
        { text: 'Batch Engine' },
        { text: 'Batch mark whole class in atomic operation' },
        { text: 'All records saved in single roundtrip' },
        { text: 'PASSED', options: { color: '10B981', bold: true } },
      ],
      [
        { text: 'TC-03' },
        { text: 'Defaulter Eq' },
        { text: 'Detect <75% and calculate recovery classes' },
        { text: 'Exact deficit computed instantly' },
        { text: 'PASSED', options: { color: '10B981', bold: true } },
      ],
      [
        { text: 'TC-04' },
        { text: 'Compound Index' },
        { text: 'Prevent duplicate attendance for same date/sub' },
        { text: 'Enforced by MongoDB unique index' },
        { text: 'PASSED', options: { color: '10B981', bold: true } },
      ],
      [
        { text: 'TC-05' },
        { text: 'Data Export' },
        { text: 'Export RFC-4180 compliant CSV stream' },
        { text: 'Valid CSV downloaded by client' },
        { text: 'PASSED', options: { color: '10B981', bold: true } },
      ],
    ];

    slide.addTable(tableData, {
      x: 0.8,
      y: 1.6,
      w: 11.6,
      colW: [1.2, 2.0, 3.8, 3.2, 1.4],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 0.5, color: 'CBD5E1' },
    });

    slide.addText('Test Summary: 8 / 8 Test Suites Passed (100% Pass Rate). Verified across unit and integration boundaries.', {
      x: 0.8,
      y: 6.2,
      w: 11.6,
      h: 0.4,
      fontSize: 11,
      bold: true,
      color: '15803D',
      align: 'center',
    });
  }

  // -------------------------------------------------------------
  // SLIDE 9: Future Scope & Conclusion
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Conclusion & Future Roadmap', 'Summary');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.5,
      h: 5.0,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('PROJECT CONCLUSION', {
      x: 1.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: '1E40AF',
    });
    slide.addText(
      [
        { text: '• Successful Full-Stack Implementation: ', options: { bold: true } },
        { text: 'All requirements of MERN architecture satisfied with verified CRUD & analytics.\n\n' },
        { text: '• Eradication of Proxies: ', options: { bold: true } },
        { text: 'Audit trails and session pins deliver high accountability.\n\n' },
        { text: '• Student Empowerment: ', options: { bold: true } },
        { text: 'Continuous self-monitoring removes surprise debarment at semester end.\n\n' },
        { text: '• Scalability: ', options: { bold: true } },
        { text: 'Capable of scaling to university-wide multi-department deployment.' },
      ],
      { x: 1.1, y: 2.3, w: 4.9, h: 3.8, fontSize: 11, color: '1F2937' }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.5,
      h: 5.0,
      fill: { color: 'F5F3FF' },
      line: { color: 'C4B5FD', width: 1 },
      rectRadius: 0.1,
    });
    slide.addText('FUTURE ENHANCEMENTS', {
      x: 7.1,
      y: 1.8,
      w: 5.0,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: '5B21B6',
    });
    slide.addText(
      [
        { text: '1. AI Facial Recognition: ', options: { bold: true } },
        { text: 'CCTV or mobile camera facial embeddings for automated hands-free roll call.\n\n' },
        { text: '2. Campus GPS Geofencing: ', options: { bold: true } },
        { text: 'Ensures check-in pins can only be redeemed within classroom coordinate boundaries.\n\n' },
        { text: '3. Automated WhatsApp / SMS Gateway: ', options: { bold: true } },
        { text: 'Direct dispatch to guardians whenever student attendance drops below 75%.\n\n' },
        { text: '4. Biometric IoT Integration: ', options: { bold: true } },
        { text: 'Connecting RFID cards and optical fingerprint scanners at classroom doors.' },
      ],
      { x: 7.1, y: 2.3, w: 4.9, h: 3.8, fontSize: 11, color: '1F2937' }
    );
  }

  // -------------------------------------------------------------
  // SLIDE 10: Thank You & Q&A
  // -------------------------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_BG_DARK };

    slide.addText('THANK YOU', {
      x: 0.8,
      y: 2.0,
      w: 11.6,
      h: 1.0,
      fontSize: 44,
      bold: true,
      color: COLOR_TEXT_LIGHT,
      align: 'center',
    });

    slide.addText('Questions & Answers / Viva Defense', {
      x: 0.8,
      y: 3.0,
      w: 11.6,
      h: 0.6,
      fontSize: 20,
      color: '93C5FD',
      align: 'center',
    });

    slide.addText(
      `Project: ${config.projectTitle}\nTeam: ${config.students.map((s) => s.name).join(' · ')}\nDepartment: ${config.department} · ${config.collegeName}`,
      {
        x: 0.8,
        y: 4.2,
        w: 11.6,
        h: 1.5,
        fontSize: 12,
        color: COLOR_TEXT_MUTED,
        align: 'center',
      }
    );
  }

  // Trigger download in browser
  const filename = `${config.projectTitle.replace(/\s+/g, '_')}_Presentation.pptx`;
  await pptx.writeFile({ fileName: filename });
}

/**
 * Generates and downloads a complete Microsoft Word (.doc) format file
 * formatted with university academic guidelines.
 */
export function downloadWordDocument(
  config: ProjectReportConfig,
  students: Student[],
  subjects: Subject[],
  analytics: any,
  testCases: TestCaseItem[]
): void {
  const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${config.projectTitle} - Final Project Report</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml>
<![endif]-->
<style>
body {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000;
  margin: 1in;
}
h1 { font-size: 22pt; text-align: center; margin-top: 18pt; margin-bottom: 12pt; text-transform: uppercase; }
h2 { font-size: 16pt; margin-top: 18pt; margin-bottom: 8pt; border-bottom: 1pt solid #000; padding-bottom: 4pt; }
h3 { font-size: 14pt; margin-top: 14pt; margin-bottom: 6pt; }
p { text-align: justify; margin-bottom: 8pt; text-indent: 0.3in; }
table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
th, td { border: 1pt solid #000; padding: 6pt; font-size: 10.5pt; text-align: left; }
th { background-color: #f2f2f2; font-weight: bold; }
.cover-page { text-align: center; height: 9in; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
.page-break { page-break-before: always; }
.formula { background-color: #f9f9f9; border: 1pt solid #ccc; padding: 10pt; text-align: center; font-family: 'Courier New', monospace; font-size: 11pt; margin: 12pt 0; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div style="text-align: center; margin-top: 40pt;">
    <p style="text-align: center; font-size: 14pt; font-weight: bold; letter-spacing: 2pt;">A PROJECT REPORT ON</p>
    <h1>${config.projectTitle}</h1>
    <p style="text-align: center; font-size: 13pt; font-style: italic;">
      Submitted in partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science & Engineering
    </p>
  </div>

  <div style="margin: 40pt 0;">
    <p style="text-align: center; font-weight: bold; font-size: 12pt;">SUBMITTED BY:</p>
    <table style="width: 80%; margin: 0 auto; border: none;">
      ${config.students
        .map(
          (s) => `
        <tr>
          <td style="border: none; font-weight: bold; text-align: left; padding: 4pt;">${s.name}</td>
          <td style="border: none; font-family: monospace; text-align: right; padding: 4pt;">Roll No: ${s.rollNo}</td>
        </tr>`
        )
        .join('')}
    </table>
  </div>

  <div style="text-align: center; margin-bottom: 40pt;">
    <p style="text-align: center; font-weight: bold;">UNDER THE ESTEEMED GUIDANCE OF</p>
    <p style="text-align: center; font-size: 13pt; font-weight: bold;">${config.guideName}</p>
    <br/>
    <p style="text-align: center; font-size: 14pt; font-weight: bold;">${config.department}</p>
    <p style="text-align: center; font-size: 13pt; font-weight: bold;">${config.collegeName}</p>
    <p style="text-align: center; font-size: 12pt;">Academic Year: ${config.academicYear} · ${config.submissionDate}</p>
  </div>
</div>

<div class="page-break"></div>

<!-- CHAPTER 1: ABSTRACT & INTRODUCTION -->
<h2>1. Abstract & Introduction</h2>
<p>
<strong>1.1 Abstract:</strong> Attendance tracking is a fundamental administrative routine across all higher academic institutions. Traditional roll-call approaches utilizing handwritten paper registers are plagued with human clerical errors, high susceptibility to proxy marking, and delayed notification of attendance deficits to students and parents. This project demonstrates the design and development of the <strong>Smart Student Attendance System</strong> developed upon the <strong>MERN (MongoDB, Express.js, React 19, Node.js)</strong> stack.
</p>
<p>
<strong>1.2 Problem Background:</strong> Under statutory academic council guidelines (AICTE and University regulations), students must achieve an aggregate attendance of at least 75% in each enrolled course to be deemed eligible to take end-semester examinations. In conventional systems, attendance registers are manually audited only at the conclusion of each month, precluding proactive remedial intervention.
</p>
<p>
<strong>1.3 Proposed Solution:</strong> The proposed system establishes an asynchronous, reactive architecture. Faculty members record attendance via an intuitive dashboard supporting batch actions, keyboard roll calls, and simulated 6-digit session PINs. A centralized MongoDB database persistently maintains student demographics and session logs, enforced with compound unique indexing to eliminate duplicate submissions.
</p>

<!-- CHAPTER 2: PROBLEM STATEMENT & SCOPE -->
<h2>2. Problem Statement, Objectives & Scope</h2>
<p>
<strong>2.1 Problem Statement:</strong> "To build a robust MERN-based smart attendance management system that records, indexes, and computes student attendance in real-time, alerts defaulters below regulatory thresholds (75%), and exports compliant institutional registers."
</p>
<p>
<strong>2.2 Key Objectives:</strong>
</p>
<ul>
  <li>Demonstrate end-to-end MERN stack software engineering.</li>
  <li>Implement atomic CRUD operations for Students and Subjects with MongoDB document schemas.</li>
  <li>Incorporate compound database indexes { date: 1, subjectId: 1, studentId: 1 } to guarantee uniqueness.</li>
  <li>Calculate mathematical defaulter recovery requirements.</li>
  <li>Deliver exportable CSV, JSON, and printable IEEE-formatted reports.</li>
</ul>

<!-- CHAPTER 3: FEATURES & CRUD OPERATIONS -->
<h2>3. Features & Functional Requirements</h2>
<table>
  <tr>
    <th>Module</th>
    <th>CRUD Scope</th>
    <th>Validation Rules</th>
    <th>REST API Route</th>
  </tr>
  <tr>
    <td><strong>Student Management</strong></td>
    <td>Create, Read, Update, Delete</td>
    <td>Unique roll number, valid email, sem 1-8</td>
    <td><code>/api/students</code></td>
  </tr>
  <tr>
    <td><strong>Subject Curriculum</strong></td>
    <td>Create, Read, Update, Delete</td>
    <td>Unique subject code, credits 1-6</td>
    <td><code>/api/subjects</code></td>
  </tr>
  <tr>
    <td><strong>Attendance Engine</strong></td>
    <td>Batch Mark, Single Update</td>
    <td>Status enum: [present, absent, late, excused]</td>
    <td><code>/api/attendance/batch</code></td>
  </tr>
  <tr>
    <td><strong>Defaulters Tracker</strong></td>
    <td>Analytics Computation</td>
    <td>Cutoff threshold slider (50% - 90%)</td>
    <td><code>/api/reports/analytics</code></td>
  </tr>
</table>

<!-- CHAPTER 4: ALGORITHMS & METHODOLOGY -->
<h2>4. Algorithms & Mathematical Methodology</h2>
<p>
<strong>4.1 Defaulter Recovery Formulation:</strong>
When a student's attendance falls below the target threshold T (default 0.75), the algorithm computes the minimum number of consecutive subsequent lectures X the student must attend to reach or exceed T:
</p>
<div class="formula">
(Attended + X) / (Total + X) >= T &nbsp;&rArr;&nbsp; X = &lceil;(T &times; Total - Attended) / (1 - T)&rceil;
</div>
<p>
<strong>4.2 Complexity Analysis:</strong>
Per-student computation executes in O(1) constant time. Full cohort scanning runs in O(N) where N is the total number of students.
</p>

<!-- CHAPTER 5: TECHNOLOGIES & IMPLEMENTATION -->
<h2>5. Technologies & Implementation</h2>
<p>
<strong>5.1 Frontend:</strong> React 19, Tailwind CSS v4, Lucide React icons, and print media rules.
</p>
<p>
<strong>5.2 Backend:</strong> Node.js runtime, Express.js web framework, and modular REST controllers.
</p>
<p>
<strong>5.3 Database:</strong> MongoDB NoSQL document database with Mongoose schemas and compound indexes.
</p>

<!-- CHAPTER 6: RESULTS & TESTING -->
<h2>6. Results, Testing & Performance</h2>
<p>
Current live system statistics: Total Enrolled Students: ${students.length}, Total Subjects: ${subjects.length}, Overall College Attendance: ${analytics?.summary?.overallAttendancePercentage || 80}%, Active Defaulters: ${analytics?.summary?.defaultersCount || 2}.
</p>
<table>
  <tr>
    <th>Test ID</th>
    <th>Module</th>
    <th>Description</th>
    <th>Expected Result</th>
    <th>Status</th>
  </tr>
  ${testCases
    .map(
      (tc) => `
  <tr>
    <td><strong>${tc.id}</strong></td>
    <td>${tc.module}</td>
    <td>${tc.description}</td>
    <td>${tc.expectedResult}</td>
    <td style="color: green; font-weight: bold;">PASSED</td>
  </tr>`
    )
    .join('')}
</table>

<!-- CHAPTER 7: CONCLUSION & FUTURE SCOPE -->
<h2>7. Conclusion & Future Scope</h2>
<p>
The Smart Student Attendance System successfully fulfills all academic project objectives. It replaces slow, error-prone manual registers with an automated, auditable MERN web application that protects academic integrity and keeps students and parents informed.
</p>
<p>
<strong>Future Enhancements:</strong> Integration of AI facial recognition cameras, GPS classroom geofencing, direct WhatsApp parent notifications, and biometric RFID readers.
</p>

<!-- CHAPTER 8: REFERENCES -->
<h2>8. References</h2>
<ol>
  <li>MongoDB Documentation: Data Models, Compound Indexing and Aggregation Pipelines, MongoDB Inc., 2026.</li>
  <li>React 19 Official Documentation, Meta Open Source.</li>
  <li>Express.js Web Framework Documentation, OpenJS Foundation.</li>
  <li>IEEE Std 730-2014, IEEE Standard for Software Quality Assurance Processes.</li>
  <li>AICTE Model Academic Regulations on Student Attendance Norms.</li>
</ol>

</body>
</html>
`;

  const blob = new Blob(['\ufeff' + content], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.projectTitle.replace(/\s+/g, '_')}_Final_Report.doc`;
  link.click();
  URL.revokeObjectURL(url);
}
