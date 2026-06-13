/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { School, Student, Teacher, Notice, Expense, GradeEntry, TimetableSlot, LeaveApplication } from '../types';
import { fetchExpenses, createExpense, fetchTimetable, createTimetableSlot, fetchGrades, createGrade, fetchLeaves, approveLeave, rejectLeave, deleteExpense, deleteTimetableSlot, deleteGrade } from '../api';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  PlusCircle, 
  AlertCircle, 
  Trash2, 
  HelpCircle, 
  Check, 
  Languages, 
  Key, 
  Clipboard, 
  UserCheck, 
  ShieldAlert,
  Sliders,
  DollarSign,
  TrendingUp,
  Inbox,
  UserCheck2,
  Calendar,
  Layers,
  Award,
  Search,
  BookOpen,
  Filter,
  X,
  Plus
} from 'lucide-react';

interface SchoolAdminDashboardProps {
  schoolId: string;
  role?: string;
  schools: School[];
  students: Student[];
  teachers: Teacher[];
  notices: Notice[];
  onAddStudent: (student: Omit<Student, 'attendance' | 'fees'>) => void;
  onAddNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  onDeleteNotice: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function SchoolAdminDashboard({
  schoolId,
  role = 'school_admin',
  schools,
  students,
  teachers,
  notices,
  onAddStudent,
  onAddNotice,
  onDeleteNotice,
  onDeleteStudent,
  onAddTeacher,
  onDeleteTeacher
}: SchoolAdminDashboardProps) {
  // Localization: English / Hindi toggle
  const [isAdminHindi, setIsAdminHindi] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'fees' | 'students' | 'teachers' | 'notices' | 'timetable_results'>('dashboard');

  // Quick Action Modal Overlay State
  const [modalType, setModalType] = useState<'none' | 'student' | 'teacher'>('none');

  // Directory Search criteria
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Persistent States for newer entities loaded from localStorage (with seed data fallback)
  const [expList, setExpList] = useState<Expense[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [leavesToReview, setLeavesToReview] = useState<LeaveApplication[]>([]);

  // Forms states
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentClass, setStudentClass] = useState('Class IX');
  const [studentSection, setStudentSection] = useState('A');
  const [parentUsername, setParentUsername] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherDesignation, setTeacherDesignation] = useState<'teacher' | 'accountant' | 'principle'>('teacher');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmt, setExpenseAmt] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Salaries');

  // Advanced notices states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeHindiTitle, setNoticeHindiTitle] = useState('');
  const [noticeHinglishTitle, setNoticeHinglishTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeHindiContent, setNoticeHindiContent] = useState('');
  const [noticeHinglishContent, setNoticeHinglishContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<Notice['category']>('academic');
  const [noticeAudience, setNoticeAudience] = useState<Notice['targetAudience']>('all');
  const [noticeTargetValue, setNoticeTargetValue] = useState('');

  // Timetable Form State
  const [ttClass, setTtClass] = useState('Class IX');
  const [ttDay, setTtDay] = useState('Monday');
  const [ttPeriod, setTtPeriod] = useState('Period 1');
  const [ttSubject, setTtSubject] = useState('');
  const [ttTeacher, setTtTeacher] = useState('');
  const [ttTime, setTtTime] = useState('08:30 AM - 09:15 AM');

  // Grading Form State
  const [gradeStudentId, setGradeStudentId] = useState('');
  const [gradeSubject, setGradeSubject] = useState('Science');
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeMaxMarks, setGradeMaxMarks] = useState('100');
  const [gradeExamName, setGradeExamName] = useState('Midterm Examination');

  const [studentSuccess, setStudentSuccess] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState('');
  const [noticeSuccess, setNoticeSuccess] = useState('');
  const [exprSuccess, setExprSuccess] = useState('');
  const [ttSuccess, setTtSuccess] = useState('');
  const [gradeSuccess, setGradeSuccess] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load from school tenant info
  const activeSchool = schools.find(s => s.id === schoolId);

  // Whitelabel Color Configuration Matching Model
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/30 text-white',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      borderFocus: 'focus:border-indigo-500 focus:ring-indigo-500/10',
      bgLight: 'bg-indigo-50 text-indigo-700',
      accent: 'bg-indigo-50/60 text-indigo-900 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gradient: 'from-indigo-600 to-indigo-850',
      sideActive: 'bg-indigo-50 border-indigo-650 text-indigo-900 font-extrabold'
    },
    orange: {
      bg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/30 text-white',
      text: 'text-orange-600',
      border: 'border-orange-200',
      borderFocus: 'focus:border-orange-500 focus:ring-orange-500/10',
      bgLight: 'bg-orange-50 text-orange-700',
      accent: 'bg-orange-50/60 text-orange-900 border-orange-200',
      badge: 'bg-orange-100 text-orange-850 border-orange-200',
      gradient: 'from-orange-600 to-orange-800',
      sideActive: 'bg-orange-50 border-orange-600 text-orange-950 font-extrabold'
    },
    emerald: {
      bg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/30 text-white',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/10',
      bgLight: 'bg-emerald-50 text-emerald-700',
      accent: 'bg-emerald-50/60 text-emerald-900 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-80 border-emerald-200',
      gradient: 'from-emerald-600 to-emerald-850',
      sideActive: 'bg-emerald-50 border-emerald-600 text-emerald-950 font-extrabold'
    },
    blue: {
      bg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/30 text-white',
      text: 'text-blue-600',
      border: 'border-blue-200',
      borderFocus: 'focus:border-blue-500 focus:ring-blue-500/10',
      bgLight: 'bg-blue-50 text-blue-700',
      accent: 'bg-blue-50/60 text-blue-900 border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      gradient: 'from-blue-600 to-blue-850',
      sideActive: 'bg-blue-50 border-blue-650 text-blue-950 font-extrabold'
    },
    rose: {
      bg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30 text-white',
      text: 'text-rose-600',
      border: 'border-rose-200',
      borderFocus: 'focus:border-rose-500 focus:ring-rose-500/10',
      bgLight: 'bg-rose-50 text-rose-700',
      accent: 'bg-rose-50/60 text-rose-900 border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      gradient: 'from-rose-600 to-rose-850',
      sideActive: 'bg-rose-50 border-rose-600 text-rose-950 font-extrabold'
    },
    amber: {
      bg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30 text-white',
      text: 'text-amber-700',
      border: 'border-amber-250',
      borderFocus: 'focus:border-amber-500 focus:ring-amber-500/10',
      bgLight: 'bg-amber-50 text-amber-800',
      accent: 'bg-amber-50/60 text-amber-950 border-amber-200',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      gradient: 'from-amber-600 to-amber-850',
      sideActive: 'bg-amber-50 border-amber-605 text-amber-950 font-extrabold'
    }
  };

  const aTheme = colorMap[activeSchool?.primaryColor || 'indigo'] || colorMap.indigo;

  // Multi-tenant Filtered Data - Strict isolation based on active schoolId
  const isolatedStudents = students.filter(s => s.schoolId === schoolId);
  const isolatedTeachers = teachers.filter(t => t.schoolId === schoolId);
  const isolatedNotices = notices.filter(n => n.schoolId === schoolId);

  // Sync / Load expenses, grading, timetable, leaves
  useEffect(() => {
    async function loadData() {
      try {
        const [expenses, timetables, gradesData, leaves] = await Promise.all([
          fetchExpenses(),
          fetchTimetable(),
          fetchGrades(),
          fetchLeaves()
        ]);

        setExpList(expenses.filter((e: any) => e.schoolId === schoolId));
        setTimetable(timetables.filter((t: any) => t.schoolId === schoolId));
        setGrades(gradesData.filter((g: any) => g.schoolId === schoolId));
        setLeavesToReview(leaves.filter((l: any) => l.schoolId === schoolId));
      } catch (error) {
        console.error("Failed to load school admin dashboard data:", error);
      }
    }
    
    loadData();
  }, [schoolId]);

  // Copy Clipboard Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Suggest Student Account Credentials
  const suggestStudentCredentials = () => {
    if (studentName) {
      const parentUser = studentName.trim().toLowerCase().split(' ').join('.') + '.parent@school.com';
      setParentUsername(parentUser);
      setParentPassword('');
    } else {
      setParentUsername('parent.' + Math.floor(100+Math.random()*900) + '@school.com');
      setParentPassword('');
    }
  };

  // Suggest Teacher Account Credentials
  const suggestTeacherCredentials = () => {
    if (teacherName) {
      const parsed = teacherName.trim().toLowerCase().replace(/dr\.|mr\.|mrs\./g, '').trim().split(' ').join('.');
      setTeacherUsername(`teacher.${parsed}`);
      setTeacherPassword('');
    } else {
      setTeacherUsername('teacher.' + Math.floor(100+Math.random()*900));
      setTeacherPassword('');
    }
  };

  // Submit student profile
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentRoll || !parentUsername || !parentPassword) {
      alert('Roll number, parent username, and password fields are mandatory.');
      return;
    }

    onAddStudent({
      id: `student_${Date.now()}`,
      name: studentName,
      rollNo: studentRoll,
      class: studentClass,
      section: studentSection,
      schoolId: schoolId,
      parentUsername: parentUsername.trim(),
      parentPassword: parentPassword.trim(),
      homework: [
        { id: `hw_auto_${Date.now()}`, subject: 'Mathematics', title: 'Algebra exercise 3.2', dueDate: '2026-06-15', status: 'pending', hindiTitle: 'बीजगणित अभ्यास ३.२', hinglishTitle: 'Algebra Assignment exercise 3.2' },
        { id: `hw_auto_2_${Date.now()}`, subject: 'Social Science', title: 'India Map pointing assignment', dueDate: '2026-06-18', status: 'pending', hindiTitle: 'भारत मानचित्र अंकन कार्य', hinglishTitle: 'India Map point assignments submit kare' }
      ]
    });

    setStudentSuccess(isAdminHindi ? "छात्र प्रोफ़ाइल सफलतापूर्वक दर्ज की गई!" : "Student profile and parent credentials recorded successfully.");
    setStudentName('');
    setStudentRoll('');
    setParentUsername('');
    setParentPassword('');
    setModalType('none');
    setTimeout(() => setStudentSuccess(''), 5000);
  };

  // Submit teacher profile
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherSubject || !teacherEmail || !teacherUsername || !teacherPassword) {
      alert('All faculty credentials and username/password fields are mandatory.');
      return;
    }

    onAddTeacher({
      id: `t_${Date.now()}`,
      name: teacherName,
      subject: teacherSubject,
      schoolId: schoolId,
      email: teacherEmail.trim(),
      teacherUsername: teacherUsername.trim(),
      teacherPassword: teacherPassword.trim(),
      designation: teacherDesignation
    });

    setTeacherSuccess(isAdminHindi ? "शिक्षक प्रोफ़ाइल और क्रेडेंशियल्स सफलतापूर्वक बनाए गए!" : "Teacher profile with custom credentials provisioned successfully.");
    setTeacherName('');
    setTeacherSubject('');
    setTeacherEmail('');
    setTeacherUsername('');
    setTeacherPassword('');
    setTeacherDesignation('teacher');
    setModalType('none');
    setTimeout(() => setTeacherSuccess(''), 5000);
  };

  // Submit custom Expense log entry
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmt) return;

    const freshExp: any = {
      schoolId,
      title: expenseTitle,
      amount: parseFloat(expenseAmt),
      category: expenseCategory,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const created = await createExpense(freshExp);
      setExpList(prev => [created, ...prev]);
      setExprSuccess(isAdminHindi ? "व्यय सफलतापूर्वक दर्ज किया गया!" : "Expense logged successfully in school book.");
      setExpenseTitle('');
      setExpenseAmt('');
      setTimeout(() => setExprSuccess(''), 4500);
    } catch (error: any) {
      console.error("Failed to add expense:", error);
    }
  };

  // Submit Timetable entry slot
  const handleTimetableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttSubject || !ttTeacher) return;

    const freshTt: any = {
      schoolId,
      class: ttClass,
      day: ttDay,
      period: ttPeriod,
      subject: ttSubject,
      teacherName: ttTeacher,
      time: ttTime
    };

    try {
      const created = await createTimetableSlot(freshTt);
      setTimetable(prev => [...prev, created]);
      setTtSuccess("Timetable slot registered.");
      setTtSubject('');
      setTtTeacher('');
      setTimeout(() => setTtSuccess(''), 4000);
    } catch (error: any) {
      console.error("Failed to add timetable slot:", error);
    }
  };

  // Submit student academic grade marks
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeStudentId || !gradeMarks) return;

    const selectedSt = isolatedStudents.find(s => s.id === gradeStudentId);
    if (!selectedSt) return;

    const mk = parseFloat(gradeMarks);
    const maxMk = parseFloat(gradeMaxMarks);
    const percentage = (mk / maxMk) * 100;
    
    // Auto calculate simple Indian grading criteria
    let assignedLetters = 'F';
    if (percentage >= 90) assignedLetters = 'A+';
    else if (percentage >= 80) assignedLetters = 'A';
    else if (percentage >= 70) assignedLetters = 'B';
    else if (percentage >= 60) assignedLetters = 'C';
    else if (percentage >= 40) assignedLetters = 'D';

    const freshGrade: any = {
      schoolId,
      studentId: gradeStudentId,
      studentName: selectedSt.name,
      class: selectedSt.class,
      subject: gradeSubject,
      marksObtained: mk,
      maxMarks: maxMk,
      grade: assignedLetters,
      examName: gradeExamName
    };

    try {
      const created = await createGrade(freshGrade);
      setGrades(prev => [created, ...prev]);
      setGradeSuccess("Grading report card marks logged.");
      setGradeMarks('');
      setTimeout(() => setGradeSuccess(''), 4000);
    } catch (error: any) {
      console.error("Failed to add grade:", error);
    }
  };

  // Submit advanced targeted circular memo
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    onAddNotice({
      title: noticeTitle,
      hindiTitle: noticeHindiTitle || undefined,
      hinglishTitle: noticeHinglishTitle || undefined,
      content: noticeContent,
      hindiContent: noticeHindiContent || undefined,
      hinglishContent: noticeHinglishContent || undefined,
      schoolId: schoolId,
      category: noticeCategory,
      targetAudience: noticeAudience,
      targetValue: noticeTargetValue || undefined
    });

    setNoticeSuccess(isAdminHindi ? "लक्षित नोटिस सफलतापूर्वक जारी किया गया!" : "Notice broadcast targeted successfully across active institutional nodes.");
    setNoticeTitle('');
    setNoticeHindiTitle('');
    setNoticeHinglishTitle('');
    setNoticeContent('');
    setNoticeHindiContent('');
    setNoticeHinglishContent('');
    setNoticeTargetValue('');
    setTimeout(() => setNoticeSuccess(''), 4000);
  };

  // Remove leave entry action
  const handleReviewLeave = async (id: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        await approveLeave(id);
      } else {
        await rejectLeave(id);
      }
      setLeavesToReview(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (error: any) {
      console.error("Failed to review leave:", error);
    }
  };

  // Delete Expense Helper
  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpList(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      console.error("Failed to delete expense:", error);
    }
  };

  // Delete Timetable Helper
  const handleDeleteTimetable = async (id: string) => {
    try {
      await deleteTimetableSlot(id);
      setTimetable(prev => prev.filter(t => t.id !== id));
    } catch (error: any) {
      console.error("Failed to delete timetable slot:", error);
    }
  };

  // Delete Grade entry helper
  const handleDeleteGrade = async (id: string) => {
    try {
      await deleteGrade(id);
      setGrades(prev => prev.filter(g => g.id !== id));
    } catch (error: any) {
      console.error("Failed to delete grade:", error);
    }
  };

  // English & Hindi dictionaries configuration
  const t = {
    en: {
      adminTitle: "Principal Dashboard Terminal",
      currentTenant: "Tenant Space Securing Isolation Active",
      multitenantWarning: "Enterprise database queries are matching matches with schoolId: ",
      langToggle: "Switch to हिन्दी",
      sidebarDashboard: "Dashboard",
      sidebarAttendance: "Daily attendance",
      sidebarFees: "Fees & Balances",
      sidebarStudents: "Students Index",
      sidebarTeachers: "Faculty Directory",
      sidebarNotices: "Target Notices",
      sidebarTimetables: "Timetable & Grading",
      cardStudents: "Enrolled Students",
      cardTeachers: "Active Faculty",
      cardNotices: "Notices Broadcasted",
      cardLeaveApplications: "Leave Requests Pending Review",
      quickAction: "Quick Actions menu",
      quickAddStudent: "Enlist Fresh Student",
      quickAddTeacher: "Appoint Faculty Member",
      financialMetricTotalCollected: "Total Collected Fees",
      financialMetricTotalDue: "Total Outstanding Dues",
      financialMetricCollectedThisMonth: "Collection This Month",
      financialMetricExpenses: "Logged Expenses total",
      liveAttendanceLabel: "Current Day Attendance Rate",
      noticeCategoryLabel: "Announcement Category",
      noticeAudienceLabel: "Target Audience targeting",
      noticeTargetValLabel: "Specific Target value (e.g. Class Name, Teacher ID, Student ID)",
      publishNoticeBtn: "Broadcast Circular Memo",
      actionDelete: "Remove Profile"
    },
    hi: {
      adminTitle: "प्राचार्य प्रशासनिक नियंत्रण कक्ष",
      currentTenant: "सक्रिय विद्यालय टेनेंसी नोड",
      multitenantWarning: "सख्त बहु-किराएदार (स्कूल) अलगाव सुरक्षा सक्रिय। फ़िल्टर कुंजी: ",
      langToggle: "English में बदलें",
      sidebarDashboard: "डैशबोर्ड",
      sidebarAttendance: "दैनिक उपस्थिति",
      sidebarFees: "शुल्क एवं बहीखाता",
      sidebarStudents: "विद्यार्थी सूची",
      sidebarTeachers: "शिक्षक संकाय",
      sidebarNotices: "लक्षित सूचनाएं",
      sidebarTimetables: "समय-सारणी और ग्रेडिंग",
      cardStudents: "नामांकित छात्र संख्या",
      cardTeachers: "सक्रिय शिक्षक संकाय",
      cardNotices: "प्रसारित सर्कुलर",
      cardLeaveApplications: "छुट्टी के लंबित आवेदन",
      quickAction: "त्वरित कार्रवाई",
      quickAddStudent: "नया छात्र नामांकित करें",
      quickAddTeacher: "नई शिक्षक नियुक्ति करें",
      financialMetricTotalCollected: "कुल संग्रहीत शुल्क",
      financialMetricTotalDue: "कुल बकाया अधिभार",
      financialMetricCollectedThisMonth: "इस माह संग्रहित राशि",
      financialMetricExpenses: "कुल दर्ज खर्च पुस्तकें",
      liveAttendanceLabel: "आज की लाइव उपस्थिति दर",
      noticeCategoryLabel: "सूचना की घोषणा श्रेणी",
      noticeAudienceLabel: "लक्षित दर्शक (लक्षित समूह)",
      noticeTargetValLabel: "विशिष्ट लक्षित नाम (उदा. कक्षा, छात्र आईडी, शिक्षक यूजरनेम)",
      publishNoticeBtn: "सूचना प्रसारित करें",
      actionDelete: "हटाएं"
    }
  };

  const curr = isAdminHindi ? t.hi : t.en;

  // Calculators
  const totalFeesCollected = isolatedStudents.reduce((sum, s) => sum + s.fees.paidAmount, 0);
  const totalDuesExpected = isolatedStudents.reduce((sum, s) => sum + (s.fees.totalDue - s.fees.paidAmount), 0);
  const totalExpenses = expList.reduce((sum, e) => sum + e.amount, 0);
  const studentPresentRate = isolatedStudents.length > 0 ? 8850 / 100 : 0; // Simulated day metric conforming to standards
  const facultyPresentRate = isolatedTeachers.length > 0 ? 9400 / 100 : 0;

  // Render directory search filtering
  const filteredStudents = isolatedStudents.filter(s => {
    const matchesKeyword = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                           s.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = studentClassFilter === 'All' || s.class === studentClassFilter;
    return matchesKeyword && matchesClass;
  });

  const filteredTeachers = isolatedTeachers.filter(t => {
    return t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
           t.subject.toLowerCase().includes(teacherSearch.toLowerCase());
  });

  return (
    <div id="school-admin-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left text-slate-900 animate-fade-in glass-panel border border-slate-200 bg-white shadow-sm">
      
      {copiedText && (
        <div id="school-copy-notif" className="fixed bottom-4 right-4 bg-slate-950 border border-slate-705 text-white rounded-lg px-4 py-2.5 text-xs font-semibold z-50 animate-bounce shadow-lg">
          Copied {copiedText} successfully!
        </div>
      )}

      {/* LEFT COLUMN: INTERACTIVE NAVIGATION SIDEBAR */}
      <div id="admin-sidebar" className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 flex flex-col h-fit text-slate-900">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="p-2.5 bg-cyan-500/15 text-cyan-200 rounded-xl font-bold font-mono">
            {activeSchool?.schoolCode || "SCH"}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-none">Vidyalaya ERP</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tenant Desk</span>
          </div>
        </div>

        {/* Sidebar Tabs List Buttons */}
        <nav className="flex flex-col gap-1.5" aria-label="Dashboard views navigation">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
              activeTab === 'dashboard' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>{curr.sidebarDashboard}</span>
          </button>

          {(role === 'school_admin' || role === 'principle') && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'attendance' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarAttendance}</span>
            </button>
          )}

          {(role === 'school_admin' || role === 'principle' || role === 'accountant') && (
            <button
              onClick={() => setActiveTab('fees')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'fees' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarFees}</span>
            </button>
          )}

          {(role === 'school_admin' || role === 'principle') && (
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'students' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarStudents}</span>
            </button>
          )}

          {(role === 'school_admin' || role === 'principle') && (
            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'teachers' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarTeachers}</span>
            </button>
          )}

          {(role === 'school_admin' || role === 'principle') && (
            <button
              onClick={() => setActiveTab('notices')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'notices' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarNotices}</span>
            </button>
          )}

          {(role === 'school_admin' || role === 'principle') && (
            <button
              onClick={() => setActiveTab('timetable_results')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border border-transparent cursor-pointer ${
                activeTab === 'timetable_results' ? aTheme.sideActive : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-slate-500" />
              <span>{curr.sidebarTimetables}</span>
            </button>
          )}

        </nav>

        {/* Security Warning Panel */}
        <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-[11px] text-amber-900 mt-auto space-y-1">
          <p className="font-extrabold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>ISOLATION ACTIVE</span>
          </p>
          <p className="leading-normal">
            Multi-Tenant schema constraints only query data mapped to: <code className="bg-amber-100 font-bold px-1 py-0.5 rounded text-amber-955">{schoolId}</code>.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CONTENT WORKSPACE AREA */}
      <div id="admin-main-stage" className="lg:col-span-9 space-y-6">
        
        {/* UPPER CONTEXT CARD HEADER */}
        <div id="admin-header-card" className="bg-white text-slate-900 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 shadow-sm">
          <div className="flex-center-gap-lg">
            <div className={`p-3 rounded-xl bg-white/10 ${aTheme.text} font-bold text-lg`}>
              ⭐
            </div>
            <div>
              <p className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">{curr.currentTenant}</p>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                {isAdminHindi && activeSchool?.hindiName ? activeSchool.hindiName : activeSchool?.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                 Principal Console &bull; Code: <strong className="text-amber-300">{activeSchool?.schoolCode}</strong>
              </p>
            </div>
          </div>

          <button
            id="admin-lang-swapper"
            onClick={() => setIsAdminHindi(!isAdminHindi)}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${aTheme.bg}`}
          >
            <Languages className="icon-sm" />
            <span>{curr.langToggle}</span>
          </button>
        </div>

        {/* ======================= TAB RESPONSES PANEL ======================= */}

        {/* VIEW 1: DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div id="view-dashboard-tab" className="space-y-6 animate-fade-in">
            
            {/* Quick action triggers row inside dashboard tab */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800">{curr.quickAction}</h3>
                <p className="text-xs text-slate-400">Launch overlays to log new entities directly on this tenant</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModalType('student')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${aTheme.bg}`}
                >
                  <Plus className="icon-sm" />
                  <span>{curr.quickAddStudent}</span>
                </button>
                <button
                  onClick={() => setModalType('teacher')}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-800 bg-white"
                >
                  <Plus className="icon-sm" />
                  <span>{curr.quickAddTeacher}</span>
                </button>
              </div>
            </div>

            {/* FINANCIAL STATS CARDS GRID */}
            <div>
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3">Institutional Capital Ledger balances</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-950/80 border border-slate-700/40 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.financialMetricTotalCollected}</p>
                  <h4 className="text-lg font-black text-emerald-400">₹{totalFeesCollected.toLocaleString('en-IN')}</h4>
                </div>

                <div className="bg-slate-950/80 border border-slate-700/40 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.financialMetricTotalDue}</p>
                  <h4 className="text-lg font-black text-rose-400">₹{totalDuesExpected.toLocaleString('en-IN')}</h4>
                </div>

                <div className="bg-slate-950/80 border border-slate-700/40 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.financialMetricCollectedThisMonth}</p>
                  <h4 className="text-lg font-black text-slate-100">₹{Math.round(totalFeesCollected * 0.15).toLocaleString('en-IN')}</h4>
                </div>

                <div className="bg-slate-950/80 border border-slate-700/40 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.financialMetricExpenses}</p>
                  <h4 className="text-lg font-black text-amber-400">₹{totalExpenses.toLocaleString('en-IN')}</h4>
                </div>

              </div>
            </div>

            {/* OPERATIONAL RATIOS & ATTENDANCE INDICATORS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Attendance statistics</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Students Present</span>
                      <span className="text-emerald-400 font-extrabold">{studentPresentRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${studentPresentRate}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Teachers Live</span>
                      <span className="text-cyan-400 font-extrabold">{facultyPresentRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${facultyPresentRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-5 space-y-2 text-center md:text-left">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Ratios Index</h4>
                <div className="pt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Student to Teacher Ratio</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {isolatedStudents.length}:{isolatedTeachers.length || 1}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Matches standard Indian educational framework.
                  </p>
                </div>
              </div>

              {/* NOTICE LISTING PREVIEW WIDGET */}
              <div className="bg-white border rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex justify-between">
                  <span>Recent Announcements</span>
                  <span className="text-[10.5px] lowercase italic text-orange-300">{isolatedNotices.length} issued</span>
                </h4>
                <div className="pt-2 space-y-2 overflow-y-auto max-h-[120px] pr-1">
                  {isolatedNotices.slice(0, 3).map((not) => (
                    <div key={not.id} className="text-xs p-2.5 bg-slate-50 border-l-2 border-orange-500 rounded-r-lg">
                      <p className="font-extrabold truncate">{not.title}</p>
                      <span className="text-[9.5px] text-slate-400 font-mono">{not.category}</span>
                    </div>
                  ))}
                  {isolatedNotices.length === 0 && (
                    <p className="text-[11px] text-slate-400 py-4 text-center">No live notices broadcasted</p>
                  )}
                </div>
              </div>

            </div>

            {/* LEAVE APPLICATIONS REVIEW CORNER */}
            <div className="bg-white border rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-wide">Reviews outstanding Leave Applications</h4>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
                  {leavesToReview.filter(l => l.status === 'pending').length} Actions Required
                </span>
              </div>

              <div className="space-y-2 divide-y">
                {leavesToReview.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No sick/casual leave applications submitted yet by parents</p>
                ) : (
                  leavesToReview.map((lv) => (
                    <div key={lv.id} className="pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-medium">
                      <div className="space-y-1">
                        <div className="flex-center-gap">
                          <strong className="text-slate-900 text-sm">{lv.studentName}</strong>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] rounded font-bold uppercase">{lv.class}</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-black capitalize">{lv.category} leave</span>
                        </div>
                        <p className="text-slate-600"><span className="font-bold text-slate-700">Days:</span> {lv.startDate} to {lv.endDate}</p>
                        <p className="text-slate-400 italic">Reason: "{lv.reason}"</p>
                      </div>

                      {/* Approve/Reject Buttons inline */}
                      {lv.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReviewLeave(lv.id, 'approved')}
                            className="bg-emerald-600 text-white font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewLeave(lv.id, 'rejected')}
                            className="bg-rose-100 text-rose-800 font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg hover:bg-rose-200 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase ${
                          lv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {lv.status}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: ATTENDANCE TAB */}
        {activeTab === 'attendance' && (role === 'school_admin' || role === 'principle') && (
          <div id="view-attendance-tab" className="bg-slate-950/90 border border-slate-700/40 rounded-2xl p-6 space-y-6 animate-fade-in text-slate-100">
            <div>
              <h3 className="text-base font-black text-white">Attendances Register Log</h3>
              <p className="text-xs text-slate-400 mt-1">Review check in statuses for teachers/staff and pupil groups today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Pupils check-in simulation */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-2">Class Attendance Logs Today</h4>
                <div className="divide-y text-xs font-semibold space-y-3 pt-1">
                  <div className="flex justify-between items-center bg-slate-900/70 p-2.5 rounded-xl">
                    <span>Class VI - section A:</span>
                    <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-black">92% Checked in</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/70 p-2.5 rounded-xl">
                    <span>Class VII - section A:</span>
                    <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-black">88% Checked in</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/70 p-2.5 rounded-xl">
                    <span>Class VIII - section B:</span>
                    <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-black">95% Checked in</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/70 p-2.5 rounded-xl">
                    <span>Class IX - section A:</span>
                    <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-black">90% Checked in</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/70 p-2.5 rounded-xl">
                    <span>Class X - section C:</span>
                    <span className="text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded font-black">74% Shortage alert</span>
                  </div>
                </div>
              </div>

              {/* Staff and teachers attendance log */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-2">Teacher Staff Clocking Grid</h4>
                <div className="space-y-3.5 text-xs">
                  {isolatedTeachers.map((tc) => (
                    <div key={tc.id} className="flex justify-between items-center p-3 border rounded-xl bg-slate-900/60">
                      <div>
                        <p className="font-extrabold text-slate-900">{tc.name}</p>
                        <p className="text-[10px] text-rose-300 font-bold">{tc.subject}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded">
                        ● Present-In
                      </span>
                    </div>
                  ))}
                  {isolatedTeachers.length === 0 && (
                    <p className="text-xs text-slate-405 italic py-4 text-center">No teacher staff profiles to record attendance check ins matches.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: FEES TAB */}
        {activeTab === 'fees' && (role === 'school_admin' || role === 'principle' || role === 'accountant') && (
          <div id="view-fees-tab" className="space-y-6 animate-fade-in text-slate-950">
            
            {/* Dynamic log new expense form */}
            <div className="bg-white border rounded-2xl p-6 space-y-4 text-left">
              <h3 className="text-sm font-black text-slate-800">Log New School Expense Receipt</h3>
              <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="exp-title" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expense Title</label>
                  <input
                    id="exp-title"
                    type="text"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Science Beakers replacement"
                    className="input-small"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="exp-amount" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Receipt Amount (₹)</label>
                  <input
                    id="exp-amount"
                    type="number"
                    value={expenseAmt}
                    onChange={(e) => setExpenseAmt(e.target.value)}
                    placeholder="e.g. 3500"
                    className="input-small"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="exp-cat" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    id="exp-cat"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-semibold"
                  >
                    <option value="Salaries">Faculty Salaries</option>
                    <option value="Maintenance">Infrastructure Maintenance</option>
                    <option value="Equipment">Laboratory Equipment</option>
                    <option value="Library">Library Books Addition</option>
                    <option value="Cultural">Sport & Cultural events</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-xs font-bold rounded-lg cursor-pointer ${aTheme.bg}`}
                  >
                    Log Expense
                  </button>
                </div>
              </form>
              {exprSuccess && (
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 p-2 rounded-lg">{exprSuccess}</p>
              )}
            </div>

            {/* Invoices status tracking grid */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Invoices Tracking Index</h3>
                <span className="text-[10px] font-mono text-slate-400">Strictly isolated by pupil tenant node</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full whitespace-nowrap border-collapse text-xs text-left" role="table">
                  <thead>
                    <tr className="border-b text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Student Ward name</th>
                      <th className="py-2.5 px-3">Enrolled Class</th>
                      <th className="py-2.5 px-3">Total Billed Fees</th>
                      <th className="py-2.5 px-3">Paid amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Access account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isolatedStudents.map((st) => {
                      const balance = st.fees.totalDue - st.fees.paidAmount;
                      const hasF = new Date() > new Date(st.fees.dueDate) && balance > 0;
                      return (
                        <tr key={st.id} className="hover:bg-slate-900/60">
                          <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                          <td className="py-3 px-3">{st.class} - {st.section}</td>
                          <td className="py-3 px-3 font-mono">₹{st.fees.totalDue.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 font-bold text-emerald-700 font-mono">₹{st.fees.paidAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                              st.fees.status === 'paid' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : hasF
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {st.fees.status} {hasF && "+ late penalty"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300 text-right">{st.parentUsername}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPENSES LEDGER LIST */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-slate-50">
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Logged Expenses ledger</h3>
              </div>
              <div className="p-4">
                {expList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No expenses logged yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {expList.map((ep) => (
                      <div key={ep.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 border rounded-xl">
                        <div>
                          <p className="font-extrabold text-slate-900">{ep.title}</p>
                          <span className="inline-block px-2 py-0.5 text-[9.5px] bg-slate-100 text-slate-505 rounded mt-0.5 leading-none">{ep.category} &bull; {ep.date}</span>
                        </div>
                        <div className="flex-center-gap-lg">
                          <strong className="text-rose-700 font-extrabold">- ₹{ep.amount.toLocaleString('en-IN')}</strong>
                          <button
                            onClick={() => handleDeleteExpense(ep.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 4: STUDENT DIRECTORY TAB */}
        {activeTab === 'students' && (role === 'school_admin' || role === 'principle') && (
          <div id="view-students-tab" className="bg-white border rounded-2xl p-6 space-y-6 animate-fade-in text-slate-950">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Registered Isolated Students Directory</h3>
                <p className="text-xs text-slate-300 mt-1">Total {isolatedStudents.length} pupil profiles mapped to this school nodeId</p>
              </div>
              <button
                onClick={() => setModalType('student')}
                className={`flex items-center gap-1 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer ${aTheme.bg}`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Enlist Student</span>
              </button>
            </div>

            {/* Directory Filtering and Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search students by name, roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full text-xs bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex-center-gap">
                <Filter className="w-4.5 h-4.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-650">Filter Class:</span>
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="text-xs bg-slate-50 border rounded-xl p-2.5 font-bold"
                >
                  <option value="All">All Classes</option>
                  <option value="Class VI">Class VI</option>
                  <option value="Class VII">Class VII</option>
                  <option value="Class VIII">Class VIII</option>
                  <option value="Class IX">Class IX</option>
                  <option value="Class X">Class X</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap border-collapse text-xs text-left" role="table">
                <thead>
                  <tr className="border-b text-slate-505 font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll No/ID</th>
                    <th className="py-3 px-4">Class Suite</th>
                    <th className="py-3 px-4">Parent Login Acc credentials</th>
                    <th className="py-3 px-4 text-right">Record operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-900/60">
                      <td className="py-3.5 px-4 font-black text-slate-900">{stud.name}</td>
                      <td className="py-3.5 px-4 font-mono">{stud.rollNo}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded font-black text-[10px]">
                          {stud.class} - {stud.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 space-y-1 max-w-[250px]">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="truncate">U: <strong className="text-slate-900">{stud.parentUsername}</strong></span>
                            <button onClick={() => handleCopy(stud.parentUsername, 'Parent Username')} className="text-slate-400 hover:text-indigo-600">
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-[10.5px] border-t pt-1">
                            <span>P: <strong className="text-slate-900">{stud.parentPassword}</strong></span>
                            <button onClick={() => handleCopy(stud.parentPassword, 'Parent Password')} className="text-slate-400 hover:text-indigo-600">
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteStudent(stud.id)}
                          className="text-rose-650 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="icon-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">No matching student profiles found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: TEACHER DIRECTORY TAB */}
        {activeTab === 'teachers' && (role === 'school_admin' || role === 'principle') && (
          <div id="view-teachers-tab" className="bg-white border rounded-2xl p-6 space-y-6 animate-fade-in text-slate-950">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Faculty directory list</h3>
                <p className="text-xs text-slate-300 mt-1">Create or manage active teacher profiles authorized on this tenant</p>
              </div>
              <button
                onClick={() => setModalType('teacher')}
                className={`flex items-center gap-1 text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer ${aTheme.bg}`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Appoint Teacher</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search teachers by name, subject specialty..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeachers.map((tc) => (
                <div key={tc.id} className="p-4 border rounded-xl bg-slate-900/60 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{tc.name}</h4>
                      <p className="text-xs text-orange-700 font-extrabold">{tc.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{tc.email}</p>
                    </div>
                    <button
                      onClick={() => onDeleteTeacher(tc.id)}
                      className="text-slate-400 hover:text-red-650 p-1.5 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="icon-sm" />
                    </button>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span>U: <strong className="text-slate-900">{tc.teacherUsername}</strong></span>
                      <button onClick={() => handleCopy(tc.teacherUsername, 'Teacher Username')} className="text-slate-300 hover:text-indigo-600">
                        <Clipboard className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center border-t pt-1">
                      <span>P: <strong className="text-indigo-900">{tc.teacherPassword}</strong></span>
                      <button onClick={() => handleCopy(tc.teacherPassword, 'Teacher Password')} className="text-slate-300 hover:text-indigo-600">
                        <Clipboard className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTeachers.length === 0 && (
                <p className="text-xs text-slate-405 col-span-2 py-6 text-center">No teacher staff profiles matching search query</p>
              )}
            </div>
          </div>
        )}

        {/* VIEW 6: NOTICES BROADCAST (WITH ADVANCED TARGETING) */}
        {activeTab === 'notices' && (role === 'school_admin' || role === 'principle') && (
          <div id="view-notices-tab" className="space-y-6 animate-fade-in text-slate-950">
            
            {/* Extended Notice broadcaster form component containing translations & targeting fields */}
            <div className="bg-white border rounded-2xl p-6 space-y-4 text-left">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-extrabold">Broadcast Targeted Custom Circular Notices</h3>
              </div>

              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                
                {/* ADVANCED TARGETING DROPDOWNS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="notice-category-select" className="block text-xs font-bold text-slate-655 uppercase mb-1">{curr.noticeCategoryLabel}</label>
                    <select
                      id="notice-category-select"
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value as Notice['category'])}
                      className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-bold"
                    >
                      <option value="academic">📚 Academic Class updates</option>
                      <option value="fees">💰 Fees & Payments related</option>
                      <option value="holiday">🏖️ Holiday notices</option>
                      <option value="events">🎉 Cultural Event notifications</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notice-audience-select" className="block text-xs font-bold text-slate-655 uppercase mb-1">{curr.noticeAudienceLabel}</label>
                    <select
                      id="notice-audience-select"
                      value={noticeAudience}
                      onChange={(e) => setNoticeAudience(e.target.value as Notice['targetAudience'])}
                      className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-bold"
                    >
                      <option value="all">🌟 Whole School</option>
                      <option value="teachers">👨‍🏫 All Teachers</option>
                      <option value="class">🏫 Specific Class</option>
                      <option value="student">🎓 Specific Student</option>
                    </select>
                  </div>

                  {/* Dynamic optional targeted value */}
                  {noticeAudience !== 'all' && noticeAudience !== 'teachers' && (
                    <div>
                      <label htmlFor="notice-target-val" className="block text-xs font-bold text-slate-655 uppercase mb-1">{curr.noticeTargetValLabel}</label>
                      {noticeAudience === 'class' ? (
                        <select
                          id="notice-target-val"
                          value={noticeTargetValue}
                          onChange={(e) => setNoticeTargetValue(e.target.value)}
                          className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-semibold"
                          required
                        >
                          <option value="">-- Choose Class Target --</option>
                          <option value="Class VI">Class VI</option>
                          <option value="Class VII">Class VII</option>
                          <option value="Class VIII">Class VIII</option>
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                        </select>
                      ) : (
                        <select
                          id="notice-target-val"
                          value={noticeTargetValue}
                          onChange={(e) => setNoticeTargetValue(e.target.value)}
                          className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-semibold"
                          required
                        >
                          <option value="">-- Choose Student Target --</option>
                          {isolatedStudents.map(is => (
                            <option key={is.id} value={is.id}>{is.name} ({is.class})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Localized Titles Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="not-t-en" className="block text-xs font-bold text-slate-500 uppercase mb-1">Title (English) <span className="text-rose-500">*</span></label>
                    <input
                      id="not-t-en"
                      type="text"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="Title in English"
                      className="input-small"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="not-t-hi" className="block text-xs font-bold text-slate-500 uppercase mb-1">Hindi Title (हिन्दी)</label>
                    <input
                      id="not-t-hi"
                      type="text"
                      value={noticeHindiTitle}
                      onChange={(e) => setNoticeHindiTitle(e.target.value)}
                      placeholder="शीर्षक हिन्दी में"
                      className="input-small"
                    />
                  </div>
                  <div>
                    <label htmlFor="not-t-hl" className="block text-xs font-bold text-slate-500 uppercase mb-1">Hinglish Title (Hinglish)</label>
                    <input
                      id="not-t-hl"
                      type="text"
                      value={noticeHinglishTitle}
                      onChange={(e) => setNoticeHinglishTitle(e.target.value)}
                      placeholder="Title in Hinglish e.g. holiday warning"
                      className="input-small"
                    />
                  </div>
                </div>

                {/* Localized Contents Row */}
                <div>
                  <label htmlFor="not-c-en" className="block text-xs font-bold text-slate-500 uppercase mb-1">Circular Content (English) <span className="text-rose-500">*</span></label>
                  <textarea
                    id="not-c-en"
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    placeholder="Content body in English..."
                    rows={2}
                    className="input-small"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="not-c-hi" className="block text-xs font-bold text-slate-500 uppercase mb-1">Hindi Content (हिन्दी)</label>
                    <textarea
                      id="not-c-hi"
                      value={noticeHindiContent}
                      onChange={(e) => setNoticeHindiContent(e.target.value)}
                      placeholder="विवरण हिन्दी में..."
                      rows={2}
                      className="input-small"
                    />
                  </div>
                  <div>
                    <label htmlFor="not-c-hl" className="block text-xs font-bold text-slate-500 uppercase mb-1">Hinglish Content (Hinglish)</label>
                    <textarea
                      id="not-c-hl"
                      value={noticeHinglishContent}
                      onChange={(e) => setNoticeHinglishContent(e.target.value)}
                      placeholder="Content in Hinglish e.g. submit homework fast..."
                      rows={2}
                      className="input-small"
                    />
                  </div>
                </div>

                {noticeSuccess && (
                  <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 p-2 rounded-lg">{noticeSuccess}</p>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer ${aTheme.bg}`}
                >
                  {curr.publishNoticeBtn}
                </button>
              </form>
            </div>

            {/* General Circular announcements list matched in this school node */}
            <div className="bg-white border rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-700/40">Active Broadcast History</h3>
              <div className="divide-y space-y-4">
                {isolatedNotices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No active broadcasts published yet</p>
                ) : (
                  isolatedNotices.map((nt) => (
                    <div key={nt.id} className="pt-4 first:pt-0 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex-center-gap">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${aTheme.badge}`}>
                            {nt.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{nt.date}</span>
                          {nt.targetAudience && nt.targetAudience !== 'all' && (
                            <span className="bg-slate-100 ring-1 ring-slate-200 text-slate-600 text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase">
                              Target: {nt.targetAudience} ({nt.targetValue})
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold">{nt.title}</h4>
                        <p className="text-xs text-slate-600">{nt.content}</p>
                        
                        {(nt.hindiTitle || nt.hinglishTitle) && (
                          <div className="bg-slate-900/70 p-2 rounded border border-slate-700/40 space-y-1 mt-1 text-[11px] leading-normal font-medium text-slate-300">
                            {nt.hindiTitle && <p><strong className="text-amber-800">HI:</strong> {nt.hindiTitle} - {nt.hindiContent}</p>}
                            {nt.hinglishTitle && <p><strong className="text-teal-800">HL:</strong> "{nt.hinglishTitle} - {nt.hinglishContent}"</p>}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteNotice(nt.id)}
                        className="text-slate-400 hover:text-rose-650 p-2 hover:bg-rose-50 rounded"
                        title="Delete memo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 7: TIMETABLE & RESULTS/GRADING */}
        {activeTab === 'timetable_results' && (role === 'school_admin' || role === 'principle') && (
          <div id="view-timetable-grading-tab" className="space-y-8 animate-fade-in text-slate-950">
            
            {/* Sector A: Timetable Periodic Scheduling logs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 bg-white border rounded-2xl p-5 space-y-4 text-left h-fit">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-2">Add Period Scheduling Slot</h4>
                <form onSubmit={handleTimetableSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="tt-cls" className="block text-[10px] text-slate-500 font-bold uppercase">Class Suite</label>
                      <select id="tt-cls" value={ttClass} onChange={(e) => setTtClass(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg">
                        <option value="Class VI">Class VI</option>
                        <option value="Class VII">Class VII</option>
                        <option value="Class VIII">Class VIII</option>
                        <option value="Class IX">Class IX</option>
                        <option value="Class X">Class X</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tt-day" className="block text-[10px] text-slate-500 font-bold uppercase">Weekday</label>
                      <select id="tt-day" value={ttDay} onChange={(e) => setTtDay(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg">
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="tt-per" className="block text-[10px] text-slate-500 font-bold uppercase">Period index</label>
                      <select id="tt-per" value={ttPeriod} onChange={(e) => setTtPeriod(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg font-bold">
                        <option value="Period 1">Period 1</option>
                        <option value="Period 2">Period 2</option>
                        <option value="Period 3">Period 3</option>
                        <option value="Period 4">Period 4</option>
                        <option value="Period 5">Period 5</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tt-tme" className="block text-[10px] text-slate-500 font-bold uppercase">Time Slot</label>
                      <input id="tt-tme" type="text" value={ttTime} onChange={(e) => setTtTime(e.target.value)} placeholder="08:30 AM - 09:15 AM" className="w-full text-xs bg-slate-50 border p-2 rounded-lg font-mono" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tt-sub" className="block text-[10px] text-slate-500 font-bold uppercase">Subject Name</label>
                    <input id="tt-sub" type="text" value={ttSubject} onChange={(e) => setTtSubject(e.target.value)} placeholder="e.g. Mathematics" className="w-full text-xs bg-slate-50 border p-2 rounded-lg" required />
                  </div>

                  <div>
                    <label htmlFor="tt-tch" className="block text-[10px] text-slate-500 font-bold uppercase">Assigned Teacher</label>
                    <select id="tt-tch" value={ttTeacher} onChange={(e) => setTtTeacher(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg font-semibold" required>
                      <option value="">-- Choose Instructor --</option>
                      {isolatedTeachers.map(tc => (
                        <option key={tc.id} value={tc.name}>{tc.name} ({tc.subject})</option>
                      ))}
                    </select>
                  </div>

                  {ttSuccess && <p className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border p-1 rounded text-center">{ttSuccess}</p>}

                  <button type="submit" className={`w-full py-2 bg-slate-905 text-xs text-white font-black uppercase rounded bg-slate-900 cursor-pointer`}>
                    Save period Schedule
                  </button>
                </form>
              </div>

              <div className="md:col-span-7 bg-white border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b pb-2 text-left">Classes Period Schedule Logs</h4>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {timetable.map((slot) => (
                    <div key={slot.id} className="p-3 bg-slate-50 border rounded-xl text-xs text-left flex justify-between items-center">
                      <div>
                        <div className="flex-center-gap">
                          <strong className="text-slate-900 font-bold text-sm bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded leading-none">{slot.class}</strong>
                          <span className="text-[10px] text-slate-400 font-mono italic">{slot.day} &bull; {slot.period}</span>
                        </div>
                        <p className="mt-1 font-extrabold text-slate-100">{slot.subject} - <span className="text-cyan-300">{slot.teacherName}</span></p>
                        <p className="text-[10px] text-slate-500 font-mono">{slot.time}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTimetable(slot.id)}
                        className="text-slate-350 hover:text-red-655 p-1 hover:bg-rose-50 rounded"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {timetable.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No class timetables logged yet</p>}
                </div>
              </div>

            </div>

            {/* Sector B: Grading entries report sheet */}
            <div className="bg-white border rounded-2xl p-6 space-y-6 text-left">
              <div className="flex items-center gap-2 border-b pb-3">
                <Award className="w-5 h-5 text-cyan-300" />
                <h3 className="text-base font-extrabold">Report Card Exam Grading Entries</h3>
              </div>

              <form onSubmit={handleGradeSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label htmlFor="grade-st" className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Student Pupil</label>
                  <select
                    id="grade-st"
                    value={gradeStudentId}
                    onChange={(e) => setGradeStudentId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-bold"
                    required
                  >
                    <option value="">-- Choose Pupil --</option>
                    {isolatedStudents.map(is => (
                      <option key={is.id} value={is.id}>{is.name} ({is.class})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="grade-sb" className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Subject</label>
                  <select
                    id="grade-sb"
                    value={gradeSubject}
                    onChange={(e) => setGradeSubject(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-semibold"
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi Literature</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="grade-exam" className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Term / Exam Name</label>
                  <input
                    id="grade-exam"
                    type="text"
                    value={gradeExamName}
                    onChange={(e) => setGradeExamName(e.target.value)}
                    placeholder="Midterm, Finals..."
                    className="input-small"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="grade-marks-ob" className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Marks Obt.</label>
                    <input
                      id="grade-marks-ob"
                      type="number"
                      value={gradeMarks}
                      onChange={(e) => setGradeMarks(e.target.value)}
                      placeholder="e.g. 85"
                      className="input-small"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="grade-max" className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Max Marks</label>
                    <input
                      id="grade-max"
                      type="number"
                      value={gradeMaxMarks}
                      onChange={(e) => setGradeMaxMarks(e.target.value)}
                      placeholder="100"
                      className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-xs font-black uppercase rounded-lg cursor-pointer ${aTheme.bg}`}
                  >
                    Submit Grade marks
                  </button>
                </div>
              </form>
              {gradeSuccess && <p className="text-xs font-bold text-center text-emerald-800 bg-emerald-50 border rounded-lg p-2">{gradeSuccess}</p>}

              {/* Grading table list */}
              <div className="border-t pt-2 overflow-x-auto">
                <table className="w-full whitespace-nowrap border-collapse text-xs text-left" role="table">
                  <thead>
                    <tr className="border-b text-slate-455 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">Student pupil name</th>
                      <th className="py-2 px-3">Class Grade</th>
                      <th className="py-2 px-3">Subject exam</th>
                      <th className="py-2 px-3">Marks logged</th>
                      <th className="py-2 px-3">Indian Grade rating</th>
                      <th className="py-2 px-3 text-right">Delete grade Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {grades.map((gr) => (
                      <tr key={gr.id} className="hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{gr.studentName}</td>
                        <td className="py-2.5 px-3">{gr.class}</td>
                        <td className="py-2.5 px-3">{gr.subject} &bull; {gr.examName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{gr.marksObtained} / {gr.maxMarks}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-indigo-100 text-indigo-805 px-2.5 py-0.5 rounded font-black text-[10.5px]">
                            Grade {gr.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteGrade(gr.id)}
                            className="text-slate-350 hover:text-rose-650 p-1"
                            title="Delete slot entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {grades.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">No student grading reports entered yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================= OVERLAY DUAL ACTION WEBMODAL BOX ======================= */}
      {modalType !== 'none' && (
        <div id="quick-action-modal-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="quick-action-modal" className="bg-white border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 animate-fade-in text-left">
            
            <div className={`p-4 ${aTheme.bg} flex justify-between items-center text-white`}>
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                {modalType === 'student' ? 'Enlist Student (Generates Parent Account)' : 'Appoint Faculty (Generates Teacher Login)'}
              </h3>
              <button
                onClick={() => setModalType('none')}
                className="text-white hover:text-slate-200 outline-none cursor-pointer"
                aria-label="Close modal box"
              >
                <X className="icon-md" />
              </button>
            </div>

            <div className="p-6">
              
              {/* Form A: Quick Add Student */}
              {modalType === 'student' && (
                <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-st-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Student Full Name <span className="text-rose-500">*</span></label>
                      <input
                        id="modal-st-name"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Rahul Patil"
                        className="input-small"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-st-roll" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Roll No/ID <span className="text-rose-500">*</span></label>
                      <input
                        id="modal-st-roll"
                        type="text"
                        value={studentRoll}
                        onChange={(e) => setStudentRoll(e.target.value)}
                        placeholder="e.g. R-106"
                        className="input-small"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-st-class" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class Grade</label>
                      <select id="modal-st-class" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg">
                        <option value="Class VI">Class VI</option>
                        <option value="Class VII">Class VII</option>
                        <option value="Class VIII">Class VIII</option>
                        <option value="Class IX">Class IX</option>
                        <option value="Class X">Class X</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-st-sec" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                      <select id="modal-st-sec" value={studentSection} onChange={(e) => setStudentSection(e.target.value)} className="w-full text-xs bg-slate-50 border p-2 rounded-lg">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </div>

                  {/* Parental login setup */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-120 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>Parent Login credentials</span>
                      </span>
                      <button
                        type="button"
                        onClick={suggestStudentCredentials}
                        className="text-[9.5px] text-indigo-700 font-extrabold hover:underline"
                      >
                        ⚡ Autofill parent Account
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="modal-pt-user" className="block text-[9px] font-bold text-slate-500 uppercase">Parent Username</label>
                        <input
                          id="modal-pt-user"
                          type="text"
                          value={parentUsername}
                          onChange={(e) => setParentUsername(e.target.value)}
                          placeholder="U: parent.email@mail.com"
                          className="w-full text-xs bg-white border p-2 rounded tracking-wide font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-pt-ps" className="block text-[9px] font-bold text-slate-500 uppercase">Access Password</label>
                        <input
                          id="modal-pt-ps"
                          type="text"
                          value={parentPassword}
                          onChange={(e) => setParentPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full text-xs bg-white border p-2 rounded tracking-wide font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 text-xs font-black uppercase rounded-xl tracking-wider cursor-pointer ${aTheme.bg}`}
                  >
                    Confirm Student Profile Registration
                  </button>
                </form>
              )}

              {/* Form B: Quick Add Teacher */}
              {modalType === 'teacher' && (
                <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="modal-tc-name" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teacher Full Name <span className="text-rose-500">*</span></label>
                      <input
                        id="modal-tc-name"
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Deshmukh"
                        className="input-small"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="modal-tc-subject" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Specialization <span className="text-rose-500">*</span></label>
                      <input
                        id="modal-tc-subject"
                        type="text"
                        value={teacherSubject}
                        onChange={(e) => setTeacherSubject(e.target.value)}
                        placeholder="e.g. Mathematics"
                        className="input-small"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-tc-email" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teacher Email Address <span className="text-rose-500">*</span></label>
                    <input
                      id="modal-tc-email"
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="e.g. teacher.dev@vcs.edu"
                      className="input-small"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-tc-designation" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designation Role <span className="text-rose-500">*</span></label>
                    <select
                      id="modal-tc-designation"
                      value={teacherDesignation}
                      onChange={(e) => setTeacherDesignation(e.target.value as 'teacher' | 'accountant' | 'principle')}
                      className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="teacher">Teacher (Faculty)</option>
                      <option value="accountant">Accountant (Fee Manager)</option>
                      <option value="principle">Principal (Admin)</option>
                    </select>
                  </div>

                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-120 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>Faculty login credentials</span>
                      </span>
                      <button
                        type="button"
                        onClick={suggestTeacherCredentials}
                        className="text-[9.5px] text-emerald-800 font-extrabold hover:underline"
                      >
                        ⚡ Suggest Accounts credentials
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="modal-tc-user" className="block text-[9px] font-bold text-slate-500 uppercase">Login Username</label>
                        <input
                          id="modal-tc-user"
                          type="text"
                          value={teacherUsername}
                          onChange={(e) => setTeacherUsername(e.target.value)}
                          placeholder="e.g. teacher.rajesh"
                          className="w-full text-xs bg-white border p-2 rounded tracking-wide font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-tc-ps" className="block text-[9px] font-bold text-slate-500 uppercase">Pin/Password</label>
                        <input
                          id="modal-tc-ps"
                          type="text"
                          value={teacherPassword}
                          onChange={(e) => setTeacherPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full text-xs bg-white border p-2 rounded tracking-wide font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-800 tracking-wider transition-colors cursor-pointer"
                  >
                    Confirm Faculty Appointment Log Record
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
