/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, Student, Teacher, Notice } from '../types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school_delhi_public',
    schoolCode: 'DPS101',
    name: 'Delhi Vidya Mandir Higher Secondary',
    hindiName: 'दिल्ली विद्या मंदिर उच्चतर माध्यमिक',
    city: 'New Delhi',
    state: 'Delhi',
    registeredAt: '2025-01-10T08:00:00Z',
    studentCount: 1420,
    teacherCount: 58,
    primaryColor: 'indigo',
    logoUrl: '🏫 Delhi Vidya Mandir',
    adminUsername: 'principal@dpsdelhi.edu.in',
    adminPassword: 'admin',
    contactMobile: '9876543210',
    contactEmail: 'contact@dpsdelhi.edu.in',
    activeFeatures: {
      feeManagement: true,
      attendanceTracking: true,
      homeworkLMS: true,
      examGrading: true,
      transportTracking: true,
      smsNotifications: true,
    }
  },
  {
    id: 'school_vedanta_academy',
    schoolCode: 'VPG202',
    name: 'Vedanta Public Gurukul',
    hindiName: 'वेदांत पब्लिक गुरुकुल',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    registeredAt: '2025-03-24T09:30:00Z',
    studentCount: 850,
    teacherCount: 34,
    primaryColor: 'amber',
    logoUrl: '🕉️ Vedanta Gurukul',
    adminUsername: 'director@vedantagurukul.org',
    adminPassword: 'admin',
    contactMobile: '9123456789',
    contactEmail: 'info@vedantagurukul.org',
    activeFeatures: {
      feeManagement: true,
      attendanceTracking: true,
      homeworkLMS: false,
      examGrading: true,
      transportTracking: false,
      smsNotifications: true,
    }
  },
  {
    id: 'school_saraswati_pune',
    schoolCode: 'SBN303',
    name: 'Saraswati Bal Niketan',
    hindiName: 'सरस्वती बाल निकेतन',
    city: 'Pune',
    state: 'Maharashtra',
    registeredAt: '2025-05-18T14:15:00Z',
    studentCount: 512,
    teacherCount: 22,
    primaryColor: 'emerald',
    logoUrl: '🌺 Saraswati Bal Niketan',
    adminUsername: 'principal@saraswati.edu',
    adminPassword: 'admin',
    contactMobile: '9234567890',
    contactEmail: 'admin@saraswati.edu',
    activeFeatures: {
      feeManagement: false,
      attendanceTracking: true,
      homeworkLMS: true,
      examGrading: false,
      transportTracking: false,
      smsNotifications: false,
    }
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // Delhi Public School students
  {
    id: 'student_1',
    name: 'Aarav Sharma',
    rollNo: 'DVM-2026-004',
    class: 'Class IX',
    section: 'A',
    schoolId: 'school_delhi_public',
    parentUsername: 'sharma.family@gmail.com',
    parentPassword: 'password',
    attendance: {
      presentDays: 145,
      totalDays: 160,
      history: [
        { date: '2026-06-01', status: 'present' },
        { date: '2026-06-02', status: 'present' },
        { date: '2026-06-03', status: 'present' },
        { date: '2026-06-04', status: 'absent' },
        { date: '2026-06-05', status: 'present' },
      ]
    },
    fees: {
      totalDue: 45000,
      paidAmount: 45000,
      status: 'paid',
      dueDate: '2026-05-30'
    },
    homework: [
      { id: 'hw_1', subject: 'Mathematics', title: 'Solve Quadratic Equations Exercise 4.2', dueDate: '2026-06-08', status: 'completed', hindiTitle: 'द्विघात समीकरण प्रश्नावली 4.2 हल करें', hinglishTitle: 'Maths ki Quadratic Equations Exercise 4.2 solve kijiye' },
      { id: 'hw_2', subject: 'Science', title: 'Write Chemistry Lab Report on Acid-Base Titration', dueDate: '2026-06-10', status: 'pending', hindiTitle: 'अम्ल-क्षार अनुमापन पर रसायन विज्ञान प्रयोगशाला रिपोर्ट लिखें', hinglishTitle: 'Acid-Base Titration par Science Lab manual complete karein' }
    ]
  },
  {
    id: 'student_2',
    name: 'Ananya Iyer',
    rollNo: 'DVM-2026-078',
    class: 'Class X',
    section: 'B',
    schoolId: 'school_delhi_public',
    parentUsername: 'iyer.family@gmail.com',
    parentPassword: 'password',
    attendance: {
      presentDays: 158,
      totalDays: 160,
      history: [
        { date: '2026-06-01', status: 'present' },
        { date: '2026-06-02', status: 'present' },
        { date: '2026-06-03', status: 'present' },
        { date: '2026-06-04', status: 'present' },
        { date: '2026-06-05', status: 'present' },
      ]
    },
    fees: {
      totalDue: 45000,
      paidAmount: 20000,
      status: 'partial',
      dueDate: '2026-05-30'
    },
    homework: [
      { id: 'hw_3', subject: 'English Literature', title: 'Write an essay on Shakespearean tragedy themes', dueDate: '2026-06-07', status: 'completed', hindiTitle: 'शेक्सपियर की त्रासदी के विषयों पर एक निबंध लिखें', hinglishTitle: 'Shakespearean drama tragedy ke main themes par essay likhein' }
    ]
  },

  // Vedanta Gurukul students
  {
    id: 'student_3',
    name: 'Ishaan Mishra',
    rollNo: 'VPG-441',
    class: 'Class VIII',
    section: 'A',
    schoolId: 'school_vedanta_academy',
    parentUsername: 'mishra.family@gmail.com',
    parentPassword: 'password',
    attendance: {
      presentDays: 120,
      totalDays: 155,
      history: [
        { date: '2026-06-01', status: 'present' },
        { date: '2026-06-02', status: 'present' },
        { date: '2026-06-03', status: 'absent' },
        { date: '2026-06-04', status: 'absent' },
        { date: '2026-06-05', status: 'present' },
      ]
    },
    fees: {
      totalDue: 28000,
      paidAmount: 8500,
      status: 'partial',
      dueDate: '2026-06-15'
    },
    homework: [
      { id: 'hw_4', subject: 'Sanskrit', title: 'Learn 10 Shlokas from Gita chapter 2', dueDate: '2026-06-09', status: 'pending', hindiTitle: 'गीता अध्याय २ से १० श्लोक याद करें', hinglishTitle: 'Gita chapter 2 se 10 shlokas achhe se padh kar yaad karein' }
    ]
  },
  {
    id: 'student_4',
    name: 'Aditi Verma',
    rollNo: 'VPG-102',
    class: 'Class VII',
    section: 'C',
    schoolId: 'school_vedanta_academy',
    parentUsername: 'verma.family@gmail.com',
    parentPassword: 'password',
    attendance: {
      presentDays: 152,
      totalDays: 155,
      history: [
        { date: '2026-06-01', status: 'present' },
        { date: '2026-06-02', status: 'present' },
        { date: '2026-06-03', status: 'present' },
        { date: '2026-06-04', status: 'present' },
        { date: '2026-06-05', status: 'present' },
      ]
    },
    fees: {
      totalDue: 28000,
      paidAmount: 0,
      status: 'pending',
      dueDate: '2026-06-15'
    },
    homework: [
      { id: 'hw_5', subject: 'Social Tech', title: 'Draw map of major Indian rivers', dueDate: '2026-06-12', status: 'completed', hindiTitle: 'भारत की प्रमुख नदियों का मानचित्र बनाएं', hinglishTitle: 'Bharat ki main rivers ka clean map draw karein file mein' }
    ]
  },

  // Saraswati Bal Niketan
  {
    id: 'student_5',
    name: 'Devendra Kulkarni',
    rollNo: 'SBN-112',
    class: 'Class VI',
    section: 'A',
    schoolId: 'school_saraswati_pune',
    parentUsername: 'kulkarni.family@gmail.com',
    parentPassword: 'password',
    attendance: {
      presentDays: 138,
      totalDays: 140,
      history: [
        { date: '2026-06-01', status: 'present' },
        { date: '2026-06-02', status: 'present' },
        { date: '2026-06-03', status: 'present' },
        { date: '2026-06-04', status: 'present' },
        { date: '2026-06-05', status: 'present' },
      ]
    },
    fees: {
      totalDue: 15000,
      paidAmount: 15000,
      status: 'paid',
      dueDate: '2026-04-10'
    },
    homework: [
      { id: 'hw_6', subject: 'Marathi Literature', title: 'Write summary of chapter 5', dueDate: '2026-06-06', status: 'completed', hindiTitle: 'अध्याय ५ का सारांश अपनी नोटबुक में लिखें', hinglishTitle: 'Hindi/Marathi Chapter 5 ki details note down karein' }
    ]
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  { id: 't_1', name: 'Dr. Rajesh Deshmukh', subject: 'Mathematics', schoolId: 'school_delhi_public', email: 'rajesh.m@dvm.edu', teacherUsername: 'teacher.rajesh', teacherPassword: 'password' },
  { id: 't_2', name: 'Mrs. Shweta Sen', subject: 'Science', schoolId: 'school_delhi_public', email: 'shweta.sen@dvm.edu', teacherUsername: 'teacher.shweta', teacherPassword: 'password' },
  { id: 't_3', name: 'Shri Girdhari Lal', subject: 'Sanskrit & Vedic Studies', schoolId: 'school_vedanta_academy', email: 'girdhari.lal@vedanta.edu', teacherUsername: 'teacher.girdhari', teacherPassword: 'password' },
  { id: 't_4', name: 'Mrs. Priya Patil', subject: 'English', schoolId: 'school_saraswati_pune', email: 'priya.patil@saraswati.edu', teacherUsername: 'teacher.priya', teacherPassword: 'password' }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice_1',
    title: 'Upcoming Summer Vacation Extended',
    hindiTitle: 'ग्रीष्मकालीन अवकाश की अवधि बढ़ाई गई',
    hinglishTitle: 'Garmion ki holidays extend ho gayi hain',
    content: 'Due to severe upcoming weather alerts, the summer vacations are extended by one week. Classes resume on 15th June 2026.',
    hindiContent: 'मौसम की चेतावनी के कारण, ग्रीष्मकालीन अवकाश एक सप्ताह के लिए बढ़ा दिया गया है। कक्षाएं १५ जून २०२६ से शुरू होंगी।',
    hinglishContent: 'Extreme weather warnings ki wajah se summer holidays ek week ke liye badha di gayi hain. Classes ab 15th June 2026 se reopen hongi.',
    schoolId: 'school_delhi_public',
    date: '2026-06-04',
    category: 'holiday'
  },
  {
    id: 'notice_2',
    title: 'Term I Fee Submission Deadline',
    hindiTitle: 'प्रथम त्रैमासिक शुल्क जमा करने की अंतिम तिथि',
    hinglishTitle: 'Term 1 fees jama karne ki last date paas hai',
    content: 'Please submit Term-I school fee dues by June 15th, 2026 to avoid late fees penalty charges.',
    hindiContent: 'विलंब शुल्क से बचने के लिए कृपया १५ जून २०२६ तक प्रथम त्रैमासिक स्कूल शुल्क जमा करें।',
    hinglishContent: 'Apni term 1 ki fees dues 15 June 2026 se pehle submit kar dein, taaki extra penalty charges na lagein.',
    schoolId: 'school_vedanta_academy',
    date: '2026-06-03',
    category: 'fees'
  },
  {
    id: 'notice_3',
    title: 'Annual Cultural Fest - Sanskriti 2026',
    hindiTitle: 'वार्षिक सांस्कृतिक उत्सव - संस्कृति २०२६',
    hinglishTitle: 'Annual Cultural Festival - Sanskriti 2026 hone wala hai',
    content: 'Registrations are open for dance, theater, and music events at the school auditoriums. Contact your class teacher.',
    hindiContent: 'नृत्य, नाटक और संगीत प्रतियोगिताओं के लिए पंजीकरण शुरू हो गए हैं। अपने वर्ग शिक्षक से संपर्क करें।',
    hinglishContent: 'Dance, music aur drama rules register karne ke liye form mil rahe hain. Apne class teacher se milkar apply karein.',
    schoolId: 'school_delhi_public',
    date: '2026-06-02',
    category: 'events'
  }
];

export const LOCALIZED_STRINGS = {
  en: {
    dashboardTitle: "Parent Dashboard Portal",
    welcomeUser: "Welcome Back, Parent",
    childSelect: "Select Child Profile",
    attendanceTitle: "Attendance Tracker",
    attendanceStatus: "Present Ratio",
    daysOutOf: "Days Attended out of",
    feesTitle: "Fee Management Hub",
    feesPaid: "Paid Amount",
    feesDue: "Pending Amount",
    feesStatus: "Payment Status",
    homeworkTitle: "LMS & Homework Assignments",
    pendingTasks: "Pending Assignments",
    completedTasks: "Successfully Completed",
    noticesTitle: "Circular Board & Notices",
    switchLanguage: "Select Language Preference",
    tenantIsolateNotice: "Tenant Isolation Active",
    paymentButton: "Secure Online Fee Payment",
    statusPaid: "Paid",
    statusPending: "Pending",
    statusPartial: "Partially Paid",
    attendanceSafe: "Your child attendance is satisfactory.",
    attendanceWarning: "Shortage of attendance! Keep attending classes.",
    academicOverview: "Academic Section",
    noHomework: "No pending homework registered.",
    noNotices: "No circular notifications issued.",
    dueDateLabel: "Due Date",
    clickPaySuccess: "Payment process initiated. Connected to School Portal.",
  },
  hi: {
    dashboardTitle: "अभिभावक डैशबोर्ड पोर्टल",
    welcomeUser: "स्वागत है, प्रिय अभिभावक",
    childSelect: "बच्चे की प्रोफाइल चुनें",
    attendanceTitle: "उपस्थिति ट्रैकर (हाजिरी)",
    attendanceStatus: "उपस्थिति दर",
    daysOutOf: "कुल दिनों में से उपस्थित दिन:",
    feesTitle: "स्कूल शुल्क प्रबंधन केंद्र",
    feesPaid: "जमा राशि",
    feesDue: "शेष राशि",
    feesStatus: "भुगतान की स्थिति",
    homeworkTitle: "एलएमएस और गृहकार्य असाइनमेंट",
    pendingTasks: "शेष गृहकार्य असाइनमेंट",
    completedTasks: "सफलतापूर्वक पूर्ण",
    noticesTitle: "सूचना पट्ट और परिपत्र",
    switchLanguage: "भाषा प्राथमिकता चुनें",
    tenantIsolateNotice: "स्कूल डेटा सुरक्षित (पृथक्करण सक्रिय)",
    paymentButton: "सुरक्षित ऑनलाइन शुल्क भुगतान करें",
    statusPaid: "पूर्ण भुगतान",
    statusPending: "बाकी है",
    statusPartial: "आंशिक भुगतान",
    attendanceSafe: "आपके बच्चे की उपस्थिति संतोषजनक और सुरक्षित है।",
    attendanceWarning: "उपस्थिति कम है! नियमित रूप से क्लास आने के लिए बोलें।",
    academicOverview: "शैक्षणिक अनुभाग",
    noHomework: "कोई गृहकार्य बकाया नहीं है।",
    noNotices: "कोई सूचना जारी नहीं की गई है।",
    dueDateLabel: "अंतिम तारीख",
    clickPaySuccess: "भुगतान का कार्य शुरू कर दिया गया है। पोर्टल से जुड़ रहा है।",
  },
  hinglish: {
    dashboardTitle: "Parent Dashboard Portal",
    welcomeUser: "Welcome Back, Parent Ji",
    childSelect: "Mera Bachha Select Karein",
    attendanceTitle: "Attendance Tracker",
    attendanceStatus: "Present Percentage",
    daysOutOf: "Total Classes me se present days:",
    feesTitle: "Fee & Payment Hub",
    feesPaid: "Jama ki gayi amount",
    feesDue: "Baki dues amount",
    feesStatus: "Payment Status",
    homeworkTitle: "Homework aur assignments",
    pendingTasks: "Pending homework list",
    completedTasks: "Complete ho chuke hain",
    noticesTitle: "Naye Notice aur Circulars",
    switchLanguage: "Apni language select karein",
    tenantIsolateNotice: "Tenant Data Private & Safe hai",
    paymentButton: "Online safe Payment karein",
    statusPaid: "Poori Paid",
    statusPending: "Full Pending",
    statusPartial: "Adhi Paid / Partial",
    attendanceSafe: "Aapka attendance safe hai. Very good!",
    attendanceWarning: "Attendance kam hai! Bachhe ko daily school bhejein.",
    academicOverview: "Syllabus aur Padhai Section",
    noHomework: "Abhi koi homework pending nahi hai.",
    noNotices: "Sarkulo se koi naya notice abhi nahi aaya.",
    dueDateLabel: "De dena hai by date",
    clickPaySuccess: "Payment start ho gaya hai direct banking se.",
  },
};
