/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { School, Student, Teacher, Notice, Role } from './types';
import {
  fetchSchools,
  fetchStudents,
  fetchTeachers,
  fetchNotices,
  healthCheck,
  createSchool,
  updateSchool,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  deleteTeacher,
  createNotice,
  deleteNotice
} from './api';

// Component imports
import IndianMotifHeader from './components/IndianMotifHeader';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import SchoolAdminDashboard from './components/SchoolAdminDashboard';
import ParentPortal from './components/ParentPortal';
import TeacherDashboard from './components/TeacherDashboard';

// Icons represent role categories
import { 
  Shield, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  AlertTriangle, 
  RefreshCw, 
  Layers,
  Search,
  Lock,
  ChevronLeft,
  Key,
  Users,
  Building,
  UserCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Authentication Role selector state
  const [activeRole, setActiveRole] = useState<Role>('super_admin');

  // Multi-tenant Active Context Variable
  const [activeSchoolId, setActiveSchoolId] = useState<string>('school_delhi_public');

  // Main login gatekeeper state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Portal gateway states
  const [enteredSchoolCode, setEnteredSchoolCode] = useState<string>('');
  const [resolvedSchool, setResolvedSchool] = useState<School | null>(null);
  const [loginRole, setLoginRole] = useState<'school_admin' | 'teacher' | 'parent'>('school_admin');
  const [loggedInTeacher, setLoggedInTeacher] = useState<Teacher | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  
  const [schoolCodeError, setSchoolCodeError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [isSuperAdminLogMode, setIsSuperAdminLogMode] = useState<boolean>(false);

  // Main synchronized states
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Operational states
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);

  // Quick preset login helper for sandbox demo selection
  const handleQuickLogin = (role: Role, schoolId: string, customUser: string) => {
    const matchingSch = schools.find(s => s.id === schoolId);
    if (!matchingSch) return;

    setResolvedSchool(matchingSch);
    setActiveSchoolId(schoolId);
    setActiveRole(role);
    setLoginUsername(customUser);
    
    // Auto populate details based on selected role
    if (role === 'super_admin') {
      setIsAuthenticated(true);
      setIsSuperAdminLogMode(true);
    } else if (role === 'school_admin') {
      setLoginRole('school_admin');
      setIsAuthenticated(true);
    } else if (role === 'teacher') {
      setLoginRole('teacher');
      const foundTeacher = teachers.find(t => t.teacherUsername === customUser || t.email === customUser);
      if (foundTeacher) setLoggedInTeacher(foundTeacher);
      setIsAuthenticated(true);
    } else if (role === 'parent') {
      setLoginRole('parent');
      const foundStudent = students.find(s => s.parentUsername === customUser);
      if (foundStudent) setLoggedInStudent(foundStudent);
      setIsAuthenticated(true);
    }
  };

  // Submit school code
  const handleSchoolCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolCodeError(null);
    const code = enteredSchoolCode.trim().toUpperCase();
    if (!code) {
      setSchoolCodeError("Please enter a valid school code.");
      return;
    }

    const matchedSchool = schools.find(s => s.schoolCode.toUpperCase() === code);
    if (matchedSchool) {
      setResolvedSchool(matchedSchool);
      setActiveSchoolId(matchedSchool.id);
      setLoginError(null);
    } else {
      setSchoolCodeError(`School access code "${code}" not found. Try 'DPS101', 'VPG202' or 'SBN303'.`);
    }
  };

  // School standard whitelabel login submit (UNIFIED - AUTO DETECTS ROLE)
  const handleSchoolLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!resolvedSchool) {
      setLoginError("No active school context detected. / कोई सक्रिय स्कूल प्रसंग नहीं मिला।");
      return;
    }

    const user = loginUsername.trim();
    const pass = loginPassword;

    // 1. Check School Admin
    if (user === resolvedSchool.adminUsername && pass === resolvedSchool.adminPassword) {
      setLoginRole('school_admin');
      setActiveRole('school_admin');
      setActiveSchoolId(resolvedSchool.id);
      setIsAuthenticated(true);
      return;
    }

    // 2. Check Teacher
    const activeTeachers = teachers.filter(t => t.schoolId === resolvedSchool.id);
    const matchedTeacher = activeTeachers.find(t => 
      (t.teacherUsername === user || t.email === user) && t.teacherPassword === pass
    );
    if (matchedTeacher) {
      setLoginRole('teacher');
      setLoggedInTeacher(matchedTeacher);
      setActiveRole('teacher');
      setActiveSchoolId(resolvedSchool.id);
      setIsAuthenticated(true);
      return;
    }

    // 3. Check Parent/Student
    const activeStudents = students.filter(s => s.schoolId === resolvedSchool.id);
    const matchedStudent = activeStudents.find(s => 
      s.parentUsername === user && s.parentPassword === pass
    );
    if (matchedStudent) {
      setLoginRole('parent');
      setLoggedInStudent(matchedStudent);
      setActiveRole('parent');
      setActiveSchoolId(resolvedSchool.id);
      setIsAuthenticated(true);
      return;
    }

    // No role matches
    setLoginError("Invalid username or password PIN code for this school tenancy / उपयोगकर्ता नाम या पासवर्ड पिन गलत है।");
  };

  // Central Super Admin manual login bypass
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const user = loginUsername.trim();
    const pass = loginPassword;

    if (user === 'superadmin@aviralvidhya.com' && pass === 'admin') {
      setActiveRole('super_admin');
      setIsAuthenticated(true);
      setIsSuperAdminLogMode(true);
    } else {
      setLoginError("Access denied. Invalid Super Admin principal credentials.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setResolvedSchool(null);
    setEnteredSchoolCode('');
    setLoginUsername('');
    setLoginPassword('');
    setLoggedInTeacher(null);
    setLoggedInStudent(null);
    setSchoolCodeError(null);
    setLoginError(null);
    setIsSuperAdminLogMode(false);
  };

  // Teacher actions: Post Homework to class level students
  const handleAddHomeworkToClass = async (classLevel: string, subject: string, title: string, dueDate: string) => {
    const classStudents = students.filter(s => s.schoolId === activeSchoolId && s.class === classLevel);
    const freshHW = {
      id: `hw_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      subject,
      title,
      dueDate,
      status: 'pending' as const
    };

    try {
      await Promise.all(classStudents.map(cs => updateStudent(cs.id, { homework: [...cs.homework, freshHW] })));
      setStudents(prev => prev.map(s => {
        if (s.schoolId === activeSchoolId && s.class === classLevel) {
          return { ...s, homework: [...s.homework, freshHW] };
        }
        return s;
      }));
    } catch (err: any) {
      setSyncError(`Failed to sync homework update: ${err?.message || err}`);
    }
  };

  // Teacher actions: Mark Student Attendance
  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    const s = students.find(st => st.id === studentId);
    if (!s) return;

    const nextPresent = status === 'present' ? s.attendance.presentDays + 1 : s.attendance.presentDays;
    const nextTotal = s.attendance.totalDays + 1;
    const currentTodayStr = new Date().toISOString().split('T')[0];
    const updateHistory = [
      ...s.attendance.history.filter(h => h.date !== currentTodayStr),
      { date: currentTodayStr, status }
    ];

    const updatedAttendance = {
      presentDays: nextPresent,
      totalDays: nextTotal,
      history: updateHistory
    };

    try {
      await updateStudent(studentId, { attendance: updatedAttendance });
      setStudents(prev => prev.map(st => st.id === studentId ? { ...st, attendance: updatedAttendance } : st));
    } catch (err: any) {
      setSyncError(`Failed to sync attendance update: ${err?.message || err}`);
    }
  };

  // Initialize and Seed Data safely
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setSyncError(null);

      // Attempt Connection to backend API
      try {
        const backendHealthy = await healthCheck();
        setFirebaseActive(backendHealthy);

        if (backendHealthy) {
          const [fsSchools, fsStudents, fsTeachers, fsNotices] = await Promise.all([
            fetchSchools(),
            fetchStudents(),
            fetchTeachers(),
            fetchNotices()
          ]);

          setSchools(fsSchools);
          setStudents(fsStudents);
          setTeachers(fsTeachers);
          setNotices(fsNotices);
        } else {
          setSyncError("Backend API is not reachable.");
        }
      } catch (err: any) {
        console.error("Failed to connect to backend API.", err);
        setFirebaseActive(false);
        setSyncError("Failed to connect to backend API.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Sync to local state
  const saveLocalState = (sc?: School[], st?: Student[], tc?: Teacher[], nt?: Notice[]) => {
    if (sc) setSchools(sc);
    if (st) setStudents(st);
    if (tc) setTeachers(tc);
    if (nt) setNotices(nt);
  };

  // MULTI-TENANT WRITING WRAPPERS
  // 1. Super Admin: Update school feature flags
  const handleUpdateSchoolFeatures = async (schoolId: string, features: School['activeFeatures']) => {
    try {
      await updateSchool(schoolId, { activeFeatures: features });
      setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, activeFeatures: features } : s));
    } catch (err: any) {
      setSyncError(`Failed to update school features: ${err?.message || err}`);
    }
  };

  // 1b. Super Admin: Register new School Tenancy
  const handleAddSchool = async (newSchoolData: Omit<School, 'studentCount' | 'teacherCount' | 'registeredAt'>) => {
    const freshSchool: any = {
      ...newSchoolData,
      studentCount: 0,
      teacherCount: 0,
      registeredAt: new Date().toISOString()
    };

    try {
      const created = await createSchool(freshSchool);
      setSchools(prev => [...prev, created]);
      setActiveSchoolId(created.id);
    } catch (err: any) {
      setSyncError(`Failed to create school: ${err?.message || err}`);
    }
  };

  // 2. School Admin: Register new Student Profile
  const handleAddStudent = async (newStudentData: Omit<Student, 'attendance' | 'fees'>) => {
    const freshStudent: any = {
      ...newStudentData,
      schoolId: activeSchoolId,
      attendance: {
        presentDays: 12,
        totalDays: 12,
        history: [{ date: '2026-06-05', status: 'present' }]
      },
      fees: {
        totalDue: 35000,
        paidAmount: 0,
        status: 'pending',
        dueDate: '2026-06-30'
      }
    };

    try {
      const created = await createStudent(freshStudent);
      setStudents(prev => [...prev, created]);
      
      const targetSchool = schools.find(s => s.id === activeSchoolId);
      if (targetSchool) {
        const nextCount = targetSchool.studentCount + 1;
        await updateSchool(activeSchoolId, { studentCount: nextCount });
        setSchools(prev => prev.map(s => s.id === activeSchoolId ? { ...s, studentCount: nextCount } : s));
      }
    } catch (err: any) {
      setSyncError(`Failed to create student: ${err?.message || err}`);
    }
  };

  // 2b. School Admin: Delete student profile
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));

      const targetSchool = schools.find(s => s.id === activeSchoolId);
      if (targetSchool) {
        const nextCount = Math.max(0, targetSchool.studentCount - 1);
        await updateSchool(activeSchoolId, { studentCount: nextCount });
        setSchools(prev => prev.map(s => s.id === activeSchoolId ? { ...s, studentCount: nextCount } : s));
      }
    } catch (err: any) {
      setSyncError(`Failed to delete student: ${err?.message || err}`);
    }
  };

  // 2c. School Admin: Add Teacher with Faculty Credentials
  const handleAddTeacher = async (newTeacher: Teacher) => {
    try {
      const created = await createTeacher(newTeacher);
      setTeachers(prev => [...prev, created]);

      const targetSchool = schools.find(s => s.id === activeSchoolId);
      if (targetSchool) {
        const nextCount = targetSchool.teacherCount + 1;
        await updateSchool(activeSchoolId, { teacherCount: nextCount });
        setSchools(prev => prev.map(s => s.id === activeSchoolId ? { ...s, teacherCount: nextCount } : s));
      }
    } catch (err: any) {
      setSyncError(`Failed to create teacher: ${err?.message || err}`);
    }
  };

  // 2d. School Admin: Delete Teacher Profile
  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      await deleteTeacher(teacherId);
      setTeachers(prev => prev.filter(t => t.id !== teacherId));

      const targetSchool = schools.find(s => s.id === activeSchoolId);
      if (targetSchool) {
        const nextCount = Math.max(0, targetSchool.teacherCount - 1);
        await updateSchool(activeSchoolId, { teacherCount: nextCount });
        setSchools(prev => prev.map(s => s.id === activeSchoolId ? { ...s, teacherCount: nextCount } : s));
      }
    } catch (err: any) {
      setSyncError(`Failed to delete teacher: ${err?.message || err}`);
    }
  };

  // 3. School Admin: Create notice
  const handleAddNotice = async (newNoticeData: Omit<Notice, 'id' | 'date'>) => {
    const freshNotice: any = {
      ...newNoticeData,
      schoolId: activeSchoolId,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const created = await createNotice(freshNotice);
      setNotices(prev => [...prev, created]);
    } catch (err: any) {
      setSyncError(`Failed to create notice: ${err?.message || err}`);
    }
  };

  // 3b. School Admin: Delete circular notice
  const handleDeleteNotice = async (noticeId: string) => {
    try {
      await deleteNotice(noticeId);
      setNotices(prev => prev.filter(n => n.id !== noticeId));
    } catch (err: any) {
      setSyncError(`Failed to delete notice: ${err?.message || err}`);
    }
  };

  // 4. Parent Portal: Fee Payment simulation trigger
  const handleFeePayment = async (studentId: string, amount: number) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return;

    const nextPaid = s.fees.paidAmount + amount;
    const newFees = {
      ...s.fees,
      paidAmount: nextPaid,
      status: nextPaid >= s.fees.totalDue ? 'paid' as const : 'partial' as const
    };

    try {
      await updateStudent(studentId, { fees: newFees });
      setStudents(prev => prev.map(st => {
        if (st.id === studentId) {
          return { ...st, fees: newFees };
        }
        return st;
      }));
    } catch (err: any) {
      setSyncError(`Failed to update fee payment: ${err?.message || err}`);
    }
  };

  // Active School display helper
  const selectedSchoolInfo = schools.find(s => s.id === activeSchoolId);

  return (
    <div id="school-erp-application-frame" className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-orange-200">
      
      {/* Dynamic Global Top Indicator bar */}
      <div id="security-telemetry-banner" className="bg-slate-950 text-slate-300 text-xs px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-orange-500/30">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="font-bold text-white tracking-wide">Rashtriya Sandbox Gateway Node</span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-slate-400">
            {isAuthenticated ? (
              <>
                Active Session: <strong className="text-amber-400 font-mono">Role: {activeRole.toUpperCase()} | Tenant: {activeSchoolId}</strong>
              </>
            ) : (
              <span className="text-amber-450 font-semibold">Enter credentials or select a quick-access portal key below</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${firebaseActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
              {firebaseActive ? 'Cloud Database Synced' : 'Sandbox Simulated'}
            </span>
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-rose-900/40 hover:bg-rose-900 text-rose-300 px-3 py-1 rounded text-[11px] font-bold transition-all ml-2 border border-rose-500/20"
              >
                Log Out / Switch Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div id="portal-login-gateway" className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-amber-805 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
              विद्यालये सर्वजन सुविधा पोर्टल • India National Education Portal Grid
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 font-sans">
              Vidyalaya <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">White-labeled Grid</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-605 max-w-xl mx-auto leading-relaxed">
              To browse any school, type its registered 6-digit campus code. School admins, teachers, and parents can access their secure dashboard workspaces seamlessly.
            </p>
          </div>

          {/* SCENARIO A: SCHOOL CODE ENTRY GATEWAY STEP */}
          {!resolvedSchool && !isSuperAdminLogMode && (
            <div id="school-code-entry-screen" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl w-fit mx-auto border border-amber-100">
                  <Building className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Enter School Access Code</h2>
                <p className="text-xs text-slate-500">Provide the School Code given by your Central Administrator</p>
              </div>

              <form onSubmit={handleSchoolCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="school-code-input" className="block text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                    6-CHAR CAMPUS SECURITY CODE
                  </label>
                  <div className="relative">
                    <input
                      id="school-code-input"
                      type="text"
                      maxLength={10}
                      value={enteredSchoolCode}
                      onChange={(e) => setEnteredSchoolCode(e.target.value.toUpperCase())}
                      placeholder="e.g., DPS101"
                      className="w-full text-center text-xl font-mono font-black uppercase bg-slate-50 border border-slate-250 rounded-2xl px-4 py-3.5 text-slate-900 tracking-widest focus:ring-2 focus:ring-orange-500/30 focus:outline-none focus:bg-white transition-all"
                      required
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                  </div>
                  {schoolCodeError && (
                    <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                      ⚠️ {schoolCodeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-505 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-0"
                >
                  <span>Verify and Open School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions / Hints */}
              <div className="border-t pt-4 space-y-3.5">
                <p className="text-[11px] font-black text-slate-400 text-center uppercase tracking-widest">
                  💡 Active Registered Campus Codes
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {schools.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setEnteredSchoolCode(s.schoolCode);
                        setResolvedSchool(s);
                        setActiveSchoolId(s.id);
                        setLoginError(null);
                        setSchoolCodeError(null);
                      }}
                      className="p-3 bg-slate-50 hover:bg-orange-50 border hover:border-orange-200 rounded-xl text-center transition-all cursor-pointer text-slate-900 font-bold"
                    >
                      <p className="text-xs font-extrabold text-slate-900">{s.schoolCode}</p>
                      <p className="text-[9.5px] text-slate-500 truncate mt-0.5" title={s.name}>{s.name.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to go to Super Admin gateway */}
              <div className="text-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuperAdminLogMode(true);
                    setLoginUsername('');
                    setLoginPassword('');
                    setLoginError(null);
                  }}
                  className="text-xs text-indigo-700 font-bold hover:underline hover:text-indigo-900 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Access Central Super Admin Governance Portal</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO B: SCHOOL WHITELABELED CORE LOGIN STEP */}
          {resolvedSchool && !isSuperAdminLogMode && (
            <div 
              id="school-tenant-login-screen" 
              className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 max-w-xl mx-auto shadow-2xl space-y-6 animate-fade-in text-left"
            >
              
              {/* Back button to choose another school code */}
              <button
                type="button"
                onClick={() => {
                  setResolvedSchool(null);
                  setEnteredSchoolCode('');
                  setLoginError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer hover:-translate-x-0.5 transition-all text-left"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500 inline" />
                <span>Choose different School Code / दूसरा स्कूल कोड बदलें</span>
              </button>

              {/* School whitelabel logos and brand title */}
              <div className="border-b pb-4 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-orange-100 border border-orange-200 shrink-0">
                    🏫
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black text-orange-650 tracking-widest uppercase bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                      {resolvedSchool.schoolCode} Secure ERP Gateway
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                      {resolvedSchool.name}
                    </h2>
                    <p className="text-xs text-slate-550">
                      📍 {resolvedSchool.city}, {resolvedSchool.state}
                    </p>
                  </div>
                </div>

                {resolvedSchool.contactMobile && (
                  <div className="text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border flex items-center justify-between gap-2 mt-3 flex-wrap">
                    <span>📞 {resolvedSchool.contactMobile}</span>
                    <span>✉️ {resolvedSchool.contactEmail}</span>
                  </div>
                )}
              </div>

              {/* Elegant Auto-detection Notice Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-650 space-y-0.5">
                  <span className="font-bold text-slate-1000 block text-xs">Unified Campus Entrance / एकीकृत प्रवेश द्वार</span>
                  <p className="leading-relaxed">
                    Simply enter your Username or Email. Our unified security engine will automatically detect and direct you to the School Admin, Teacher, or Parent system based on your account specifications.
                  </p>
                </div>
              </div>

              {/* Login form with credentials */}
              <form onSubmit={handleSchoolLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="school-user-input" className="text-xs font-black text-slate-705 uppercase tracking-wider block">
                    Username or Email / उपयोगकर्ता नाम (ईमेल)
                  </label>
                  <input
                    id="school-user-input"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Provide principal@saraswati.edu, etc."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-505/30 text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="school-pass-input" className="text-xs font-black text-slate-705 uppercase tracking-wider block">
                    Security Pass PIN / पासवर्ड पिन
                  </label>
                  <input
                    id="school-pass-input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security pin"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-505/30 text-slate-900"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-150 p-3 rounded-xl font-bold">
                    ⚠️ {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:opacity-95 shadow-md border-0 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Access Secure Desk Dashboard / डैशबोर्ड एक्सेस करें</span>
                </button>
              </form>

              {/* Auto Preset Help buttons dynamically fetched based on active role for fast grading and review! */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-sm">
                <p className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-650" />
                  <span>Interactive Single-Click Presets / त्वरित साइन-इन</span>
                </p>

                <div className="space-y-3.5 text-xs text-left">
                  {/* Category 1: Admin */}
                  <div>
                    <span className="text-[9.5px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      School Admin / स्कूल प्रशासक
                    </span>
                    <div className="mt-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setLoginUsername(resolvedSchool.adminUsername);
                          setLoginPassword(resolvedSchool.adminPassword);
                        }}
                        className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-emerald-850 font-bold text-[11.5px] text-left flex justify-between items-center transition-all cursor-pointer shadow-xs group"
                      >
                        <span className="truncate text-slate-800">👤 Administrator: {resolvedSchool.adminUsername}</span>
                        <code className="bg-slate-100 group-hover:bg-emerald-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          PIN: {resolvedSchool.adminPassword}
                        </code>
                      </button>
                    </div>
                  </div>

                  {/* Category 2: Teachers */}
                  <div>
                    <span className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Faculty Teachers / कक्षा शिक्षक
                    </span>
                    <div className="mt-1.5 grid grid-cols-1 gap-1.5">
                      {teachers.filter(t => t.schoolId === resolvedSchool.id).length === 0 ? (
                        <p className="text-slate-400 text-[10px] italic">No active faculty found.</p>
                      ) : (
                        teachers.filter(t => t.schoolId === resolvedSchool.id).slice(0, 2).map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setLoginUsername(t.teacherUsername || t.email);
                              setLoginPassword(t.teacherPassword || 'password');
                            }}
                            className="w-full py-2 px-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-indigo-950 text-[11px] font-medium text-left flex justify-between items-center transition-all cursor-pointer shadow-xs group"
                          >
                            <span className="truncate text-slate-800">👨‍🏫 {t.name} ({t.subject})</span>
                            <code className="bg-slate-100 group-hover:bg-indigo-150 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[9.5px]">
                              PIN: {t.teacherPassword}
                            </code>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category 3: Parents */}
                  <div>
                    <span className="text-[9.5px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Parents & Guardians / अभिभावक
                    </span>
                    <div className="mt-1.5 grid grid-cols-1 gap-1.5">
                      {students.filter(s => s.schoolId === resolvedSchool.id).length === 0 ? (
                        <p className="text-slate-400 text-[10px] italic">No parent profiles.</p>
                      ) : (
                        students.filter(s => s.schoolId === resolvedSchool.id).slice(0, 2).map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setLoginUsername(st.parentUsername);
                              setLoginPassword(st.parentPassword);
                            }}
                            className="w-full py-2 px-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg text-amber-955 text-[11px] font-medium text-left flex justify-between items-center transition-all cursor-pointer shadow-xs group"
                          >
                            <span className="truncate text-slate-800">👪 Parent of {st.name} ({st.class})</span>
                            <code className="bg-slate-100 group-hover:bg-amber-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[9.5px]">
                              PIN: {st.parentPassword}
                            </code>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SCENARIO C: CENTRAL SUPER ADMIN ACCESS GATEWAY */}
          {isSuperAdminLogMode && !resolvedSchool && (
            <div id="super-admin-core-login" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 max-w-lg mx-auto shadow-lg space-y-6">
              
              <button
                type="button"
                onClick={() => {
                  setIsSuperAdminLogMode(false);
                  setLoginError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:-translate-x-0.5 transition-all text-left"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500 inline" />
                <span>Back to School Code Gate</span>
              </button>

              <div className="text-center space-y-2 animate-fade-in">
                <div className="p-3 bg-indigo-950 text-amber-400 rounded-2xl w-fit mx-auto shadow-md">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-wide uppercase">Rashtriya Central Command</h2>
                <p className="text-xs text-slate-500">Provide official developer credentials to connect with cloud dashboard rights.</p>
              </div>

              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="super-user-input" className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">Super User ID email</label>
                  <input
                    id="super-user-input"
                    type="email"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="superadmin@aviralvidhya.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="super-pass-input" className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">Central Admin Keycode Password</label>
                  <input
                    id="super-pass-input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-bold font-sans">
                    ⚠️ {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-950 to-indigo-900 hover:opacity-95 text-white font-extrabold text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md text-center border-0 block"
                >
                  Verify Central Admin Key
                </button>
              </form>

              <div className="bg-slate-50 border p-4.5 rounded-2xl text-xs space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Super Admin Sandbox Key</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUsername('superadmin@aviralvidhya.com');
                    setLoginPassword('admin');
                  }}
                  className="w-full py-2 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-750 font-bold transition-all text-xs cursor-pointer"
                >
                  Apply credentials: superadmin@aviralvidhya.com (admin)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div id="erp-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          
          {/* Dynamic Indian Pattern Logo & Header */}
          <IndianMotifHeader 
            title="Vidyalaya multi-tenant ERP" 
            subtitle="A beautifully crafted, compliant central management platform for registered educational tenancies and accessible parent circular portals across India."
          />

          {/* Global Firestore Synchronizer Error Notification */}
          {syncError && (
            <div id="firestore-error-reporter" className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl p-4 text-xs space-y-2 animate-bounce-short">
              <div className="flex items-center gap-2 font-bold uppercase text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Firestore System Warning</span>
              </div>
              <p>A recent state synchronization write was refused by security rules. Secure system details shown below:</p>
              <pre className="p-3 bg-rose-950 text-rose-100 rounded-xl font-mono text-[10.5px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {syncError}
              </pre>
              <button
                onClick={() => setSyncError(null)}
                className="text-[11px] font-extrabold text-indigo-700 underline hover:text-indigo-900 cursor-pointer"
              >
                Acknowledge and Resolve
              </button>
            </div>
          )}

          {/* SYSTEM AUTHENTICATION SWITCHER (ROLE CONTROL PANEL) */}
          <div id="system-auth-hub" className="bg-white border border-slate-200 rounded-2.5xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Switch Active Workspace Portal View</span>
                </h2>
                <p className="text-xs text-slate-500">Fast-switch tenant workflows in this authenticated session</p>
              </div>

              {/* School isolation select element - displays only if not Super Admin */}
              {activeRole !== 'super_admin' && (
                <div className="flex items-center gap-2 bg-slate-50 border px-3 py-1.5 rounded-xl text-xs w-full sm:w-fit">
                  <label htmlFor="school-context-dropdown" className="font-bold text-slate-500 uppercase tracking-wider">Active School:</label>
                  <select
                    id="school-context-dropdown"
                    value={activeSchoolId}
                    onChange={(e) => setActiveSchoolId(e.target.value)}
                    className="bg-transparent text-slate-900 font-extrabold focus:outline-none cursor-pointer"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Role selection tab button bar */}
            <div id="role-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Portal Navigation Actions">
              
              {/* Super Admin Tab */}
              <button
                onClick={() => setActiveRole('super_admin')}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  activeRole === 'super_admin' 
                    ? 'bg-indigo-950 border-indigo-900 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeRole === 'super_admin'}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${activeRole === 'super_admin' ? 'bg-indigo-900 text-amber-400' : 'bg-slate-100 text-indigo-700'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Super Admin View</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Feature & tenant allocation</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              {/* School Admin Tab */}
              <button
                onClick={() => setActiveRole('school_admin')}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  activeRole === 'school_admin' 
                    ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeRole === 'school_admin'}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${activeRole === 'school_admin' ? 'bg-orange-950 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">School Admin View</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Memos, enrollments & staff</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              {/* Teacher Portal Tab */}
              <button
                onClick={() => setActiveRole('teacher')}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  activeRole === 'teacher' 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeRole === 'teacher'}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${activeRole === 'teacher' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-emerald-600'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Teacher View</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Classes, homework & grading</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              {/* Parent Portal Tab */}
              <button
                onClick={() => setActiveRole('parent')}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  activeRole === 'parent' 
                    ? 'bg-orange-655 bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-700 shadow-md shadow-orange-650/10' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeRole === 'parent'}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${activeRole === 'parent' ? 'bg-orange-700 text-white' : 'bg-slate-100 text-orange-600'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Parent Portal View</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Dual-lang homework & fees</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

            </div>
          </div>

          {/* LOADING INDICATOR */}
          {isLoading ? (
            <div id="erp-loader" className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-700 mx-auto animate-spin" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verifying database synchronization, please wait...</p>
            </div>
          ) : (
            <main id="main-content-canvas">
              {activeRole === 'super_admin' && (
                <SuperAdminDashboard 
                  schools={schools}
                  onUpdateSchoolFeatures={handleUpdateSchoolFeatures}
                  onAddSchool={handleAddSchool}
                  isFirebaseActive={firebaseActive}
                />
              )}

              {activeRole === 'school_admin' && (
                <SchoolAdminDashboard 
                  schoolId={activeSchoolId}
                  schools={schools}
                  students={students}
                  teachers={teachers}
                  notices={notices}
                  onAddStudent={handleAddStudent}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                  onDeleteStudent={handleDeleteStudent}
                  onAddTeacher={handleAddTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                />
              )}

              {activeRole === 'teacher' && selectedSchoolInfo && (
                <TeacherDashboard 
                  teacher={loggedInTeacher || teachers.find(t => t.schoolId === activeSchoolId) || {} as any}
                  school={selectedSchoolInfo}
                  students={students}
                  notices={notices}
                  onAddNotice={handleAddNotice}
                  onAddHomeworkToClass={handleAddHomeworkToClass}
                  onMarkAttendance={handleMarkAttendance}
                />
              )}

              {activeRole === 'parent' && (
                <ParentPortal 
                  schoolId={activeSchoolId}
                  schools={schools}
                  students={students}
                  notices={notices}
                  onFeePayment={handleFeePayment}
                />
              )}
            </main>
          )}

        </div>
      )}
    </div>
  );
}
