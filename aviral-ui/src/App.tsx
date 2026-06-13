/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { School, Student, Teacher, Notice, Role } from './types';
import {
  login,
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
  Bell,
  
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
  const [loginRole, setLoginRole] = useState<Role>('school_admin');
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

  const determineFrontendRole = (username: string, school: School | null): Role => {
    const normalized = username.trim().toLowerCase();
    if (school && normalized === school.adminUsername.trim().toLowerCase()) return 'school_admin';
    if (normalized.includes('superadmin') || normalized.includes('super_admin')) return 'super_admin';
    if (school) {
      const teacher = teachers.find(t => t.schoolId === school.id && ((t.teacherUsername || '').trim().toLowerCase() === normalized || (t.email || '').trim().toLowerCase() === normalized));
      if (teacher) return teacher.designation || 'teacher';
      const student = students.find(s => s.schoolId === school.id && s.parentUsername.trim().toLowerCase() === normalized);
      if (student) return 'parent';
    }
    return 'parent';
  };

  // Submit school code (fetch schools on demand)
  const handleSchoolCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolCodeError(null);
    const code = enteredSchoolCode.trim().toUpperCase();
    if (!code) {
      setSchoolCodeError("Please enter a valid school code.");
      return;
    }

    try {
      let currentSchools = schools;
      let justFetched = false;

      if (currentSchools.length === 0) {
        // fetch school list on demand (only when user attempts to access a school)
        const fsSchools = await fetchSchools().catch(() => []);
        currentSchools = fsSchools || [];
        setSchools(currentSchools);
        justFetched = true;
      }

      let matchedSchool = currentSchools.find(s => s.schoolCode.toUpperCase() === code);

      if (!matchedSchool && !justFetched) {
         const freshSchools = await fetchSchools().catch(() => []);
         matchedSchool = freshSchools.find((s: any) => s.schoolCode.toUpperCase() === code);
         if (freshSchools.length > 0) setSchools(freshSchools);
      }

      if (matchedSchool) {
        setResolvedSchool(matchedSchool);
        setActiveSchoolId(matchedSchool.id);
        setLoginError(null);
      } else {
        setSchoolCodeError(`School access code "${code}" not found. Try 'DPS101', 'VPG202' or 'SBN303'.`);
      }
    } catch (err: any) {
      setSchoolCodeError('Failed to load school directory. Try again later.');
    }
  };

  // School standard whitelabel login submit (UNIFIED - AUTO DETECTS ROLE)
  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!resolvedSchool) {
      setLoginError("No active school context detected. / कोई सक्रिय स्कूल प्रसंग नहीं मिला।");
      return;
    }

    const user = loginUsername.trim();
    const pass = loginPassword;

    try {
      const loginRes = await login(user, pass, resolvedSchool.id);
      let frontendRole = determineFrontendRole(user, resolvedSchool);
      if (loginRes?.role) {
        frontendRole = loginRes.role.toLowerCase();
      }
      setActiveRole(frontendRole);
      setLoginRole(frontendRole === 'school_admin' || frontendRole === 'teacher' || frontendRole === 'accountant' || frontendRole === 'principle' || frontendRole === 'parent' ? frontendRole : 'school_admin');
      setActiveSchoolId(resolvedSchool.id);

      if (frontendRole === 'teacher') {
        const foundTeacher = teachers.find(t => t.schoolId === resolvedSchool.id && (t.teacherUsername === user || t.email === user));
        if (foundTeacher) setLoggedInTeacher(foundTeacher);
      }
      if (frontendRole === 'parent') {
        const foundStudent = students.find(s => s.schoolId === resolvedSchool.id && s.parentUsername === user);
        if (foundStudent) setLoggedInStudent(foundStudent);
      }
      if (frontendRole === 'super_admin') {
        setIsSuperAdminLogMode(true);
      }
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err?.message || "Invalid username or password PIN code for this school tenancy / उपयोगकर्ता नाम या पासवर्ड पिन गलत है।");
    }
  };

  // Central Super Admin login through API
  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const user = loginUsername.trim();
    const pass = loginPassword;

    try {
      await login(user, pass);
      setActiveRole('super_admin');
      setActiveSchoolId('system');
      setIsAuthenticated(true);
      setIsSuperAdminLogMode(true);
    } catch (err: any) {
      setLoginError(err?.message || "Access denied. Invalid Super Admin principal credentials.");
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

  // Defer any backend integration until user interaction to avoid pre-login API failures
  useEffect(() => {
    // Intentionally no automatic API calls on mount.
    // This prevents failing network requests before a user attempts login.
    setIsLoading(false);
    setFirebaseActive(false);
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
      return;
    } catch (err: any) {
      const msg = `Failed to update fee payment: ${err?.message || err}`;
      setSyncError(msg);
      // rethrow so callers (ParentPortal) can show an error message
      throw new Error(msg);
    }
  };

  // Active School display helper
  const selectedSchoolInfo = schools.find(s => s.id === activeSchoolId);

  return (
    <div id="school-management-application-frame" className="app-container min-h-screen bg-slate-50 flex flex-col">
      
      {/* CORPORATE APP HEADER (AUTHENTICATED ONLY) */}
      {isAuthenticated && (
        <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Branding & Tenant Context */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                {selectedSchoolInfo ? "🏫" : "🎓"}
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {selectedSchoolInfo ? selectedSchoolInfo.name : "AviralVidhya Administration"}
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {activeRole.replace('_', ' ')} Workspace
                </p>
              </div>
            </div>

            {/* Right: Profile Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-650 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition-all shadow-sm bg-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 flex flex-col">
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
            {/* Left Panel: Corporate Info & Value Proposition */}
            <div className="hidden lg:flex lg:w-3/5 bg-slate-900 text-white p-16 flex-col justify-between relative overflow-hidden">
              {/* Glowing backdrops */}
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
              <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none"></div>
              
              {/* Top Branding */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-md">
                  🎓
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                    AviralVidhya
                  </h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Enterprise School ERP Suite
                  </p>
                </div>
              </div>

              {/* Central Marketing Prop */}
              <div className="my-auto max-w-lg space-y-8 relative z-10">
                <div className="space-y-4">
                  <span className="inline-block px-3.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Next-Gen Educational ERP
                  </span>
                  <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Centralized Operations, Elevated Education.
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Connecting school administrators, teaching faculty, parents, and students in one integrated workspace. Designed with absolute data isolation and dynamic whitelabel modules.
                  </p>
                </div>

                {/* Counter Metric Row */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
                  <div>
                    <h4 className="text-xl font-bold text-white">500+</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Institutes</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">200K+</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Students</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">99.9%</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Uptime SLA</p>
                  </div>
                </div>

                {/* Key Checklist Features */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">✓</div>
                    <span className="text-xs font-semibold text-slate-300">Multi-tenant institutional isolation layers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">✓</div>
                    <span className="text-xs font-semibold text-slate-300">White-labeled visual interface customization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">✓</div>
                    <span className="text-xs font-semibold text-slate-300">Centralized fees ledger & dynamic timetable blocks</span>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright details */}
              <div className="text-[11px] text-slate-500 flex justify-between items-center relative z-10 border-t border-slate-800/60 pt-6">
                <p>© 2026 AviralVidhya. All rights reserved.</p>
                <div className="flex gap-4">
                  <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
                  <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Use</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Portal Access Form */}
            <div className="w-full lg:w-2/5 p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-slate-50/50 min-h-screen">
              {/* Mobile Branding Header */}
              <div className="flex lg:hidden items-center justify-between pb-8 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-md shadow-sm">🎓</div>
                  <h1 className="text-base font-extrabold text-slate-900">AviralVidhya</h1>
                </div>
                <button
                  onClick={() => {
                    setIsSuperAdminLogMode(!isSuperAdminLogMode);
                    setResolvedSchool(null);
                    setEnteredSchoolCode('');
                    setLoginError(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {isSuperAdminLogMode ? "School Portal" : "Super Admin Console"}
                </button>
              </div>

              {/* Desktop Console Toggle */}
              <div className="hidden lg:flex justify-end pb-4">
                <button
                  onClick={() => {
                    setIsSuperAdminLogMode(!isSuperAdminLogMode);
                    setResolvedSchool(null);
                    setEnteredSchoolCode('');
                    setLoginError(null);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow cursor-pointer"
                >
                  {isSuperAdminLogMode ? "🏫 Exit Admin Console" : "🔑 Super Admin Console"}
                </button>
              </div>

              {/* Main Credentials Box */}
              <div className="my-auto max-w-sm w-full mx-auto space-y-6">
                
                {/* STATE 1: Enter School Access Code */}
                {!resolvedSchool && !isSuperAdminLogMode && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="heading-1">School Portal</h3>
                      <p className="text-body mt-2">Enter your institution's registration code to access the tenancy.</p>
                    </div>

                    <form onSubmit={handleSchoolCodeSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="school-code-input" className="form-label">School Access Code</label>
                        <div className="relative">
                          <input
                            id="school-code-input"
                            type="text"
                            maxLength={10}
                            value={enteredSchoolCode}
                            onChange={(e) => setEnteredSchoolCode(e.target.value.toUpperCase())}
                            placeholder="e.g. DPS101, VPG202"
                            className="form-input text-center font-mono font-bold text-lg tracking-widest text-slate-900 py-3.5 focus:border-blue-500"
                            required
                          />
                          <Building className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                        </div>
                        {schoolCodeError && (
                          <p className="text-xs text-rose-600 font-semibold mt-1">⚠️ {schoolCodeError}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Access Dashboard</span>
                        <ArrowRight className="icon-sm" />
                      </button>
                    </form>

                    {/* Preloaded Demo Tenant Selector */}
                    {schools.length > 0 && (
                      <div className="pt-6 border-t border-slate-200 space-y-3">
                        <p className="text-caption text-slate-400">Sample Schools:</p>
                        <div className="grid grid-cols-2 gap-2">
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
                              className="p-3 bg-white hover:bg-blue-50/40 border border-slate-200 rounded-xl text-left transition hover:border-blue-300/80 cursor-pointer"
                            >
                              <span className="block text-xs font-mono font-bold text-blue-600">{s.schoolCode}</span>
                              <span className="block text-[11px] font-semibold text-slate-700 truncate mt-0.5">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STATE 2: Authenticated School Credentials input */}
                {resolvedSchool && !isSuperAdminLogMode && (
                  <div className="space-y-6 animate-fade-in">
                    <button
                      onClick={() => {
                        setResolvedSchool(null);
                        setEnteredSchoolCode('');
                        setLoginError(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-750 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="icon-sm" />
                      <span>Back to Portal Search</span>
                    </button>

                    <div className="pb-4 border-b border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-3 shadow-sm">
                        🏫
                      </div>
                      <h3 className="heading-2">{resolvedSchool.name}</h3>
                      <p className="text-xs text-slate-550 mt-1">📍 {resolvedSchool.city}, {resolvedSchool.state}</p>
                    </div>

                    <form onSubmit={handleSchoolLogin} className="space-y-4.5">
                      <div className="space-y-1.5">
                        <label htmlFor="school-user-input" className="form-label">Username / Email ID</label>
                        <input
                          id="school-user-input"
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="e.g. principal@dps.edu"
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="school-pass-input" className="form-label">Password Pin</label>
                        <input
                          id="school-pass-input"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="form-input"
                          required
                        />
                      </div>

                      {loginError && (
                        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl font-medium leading-relaxed">
                          ⚠️ {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="icon-sm" />
                        <span>Sign In</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* STATE 3: Super Admin Console credentials form */}
                {isSuperAdminLogMode && !resolvedSchool && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="lg:hidden">
                      <button
                        onClick={() => {
                          setIsSuperAdminLogMode(false);
                          setLoginError(null);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="icon-sm" />
                        <span>Exit Console</span>
                      </button>
                    </div>

                    <div>
                      <h3 className="heading-1">Super Admin</h3>
                      <p className="text-body mt-2">Authenticate to configure multi-tenant licenses and configure system modules.</p>
                    </div>

                    <form onSubmit={handleSuperAdminLogin} className="space-y-4.5">
                      <div className="space-y-1.5">
                        <label htmlFor="super-user-input" className="form-label">Principal Email address</label>
                        <input
                          id="super-user-input"
                          type="email"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="admin@system.local"
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="super-pass-input" className="form-label">Root Password</label>
                        <input
                          id="super-pass-input"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="form-input"
                          required
                        />
                      </div>

                      {loginError && (
                        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl font-medium leading-relaxed">
                          ⚠️ {loginError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="icon-sm" />
                        <span>Sign In as Admin</span>
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Portal isolation warning label */}
              <div className="text-center text-[10px] text-slate-400 font-mono">
                Isolated database connections active.
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Core Stage */
          <div id="management-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 flex flex-col">
            
            {/* Elegant Header Card replacing traditional Indian Motif banner patterns */}
            <IndianMotifHeader 
              title="AviralVidhya School Management" 
              subtitle="Centralized school enterprise management for modern multi-tenant environments."
            />

            {/* Sync Error Alert Banner */}
            {syncError && (
              <div id="firestore-error-reporter" className="bg-rose-50 border border-rose-250 text-rose-955 rounded-2xl p-4.5 text-xs space-y-2 animate-bounce-short">
                <div className="flex items-center gap-2 font-bold uppercase text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>System Synchronization Warning</span>
                </div>
                <p>A recent state synchronization write operation was refused. Security context and trace details:</p>
                <pre className="p-3 bg-rose-100/60 border border-rose-200 text-rose-950 rounded-xl font-mono text-[10.5px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {syncError}
                </pre>
                <button
                  onClick={() => setSyncError(null)}
                  className="text-xs font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
                >
                  Acknowledge and Resolve
                </button>
              </div>
            )}

            {/* SYSTEM AUTHENTICATION SWITCHER (ROLE SEGMENTED TAB HUB) */}
            {loginRole === 'super_admin' && (
              <div id="system-auth-hub" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Workspace Portal Impersonation</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle active preview context roles dynamically</p>
                  </div>

                  {/* Multi-Tenant School Context Dropdown Filter (Available to Impersonating Admins) */}
                  {activeRole !== 'super_admin' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs w-full sm:w-fit shadow-subtle">
                      <label htmlFor="school-context-dropdown" className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Active Tenant:</label>
                      <select
                        id="school-context-dropdown"
                        value={activeSchoolId}
                        onChange={(e) => setActiveSchoolId(e.target.value)}
                        className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
                      >
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Styled Segmented Tab Layout Buttons */}
                <div id="role-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Portal Navigation Actions">
                  
                  {/* Switch to Super Admin Portal View */}
                  <button
                    onClick={() => setActiveRole('super_admin')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      activeRole === 'super_admin' 
                        ? 'bg-blue-50/50 border-blue-300 text-blue-900 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'super_admin'}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeRole === 'super_admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-650'}`}>
                        <Shield className="icon-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Super Admin View</p>
                        <p className="text-[10px] opacity-75 mt-0.5">Global Tenant allocation</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Switch to School Admin Portal View */}
                  <button
                    onClick={() => setActiveRole('school_admin')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      activeRole === 'school_admin' 
                        ? 'bg-orange-50/50 border-orange-300 text-orange-950 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'school_admin'}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeRole === 'school_admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-650'}`}>
                        <GraduationCap className="icon-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">School Admin View</p>
                        <p className="text-[10px] opacity-75 mt-0.5">Faculty & Enrollments</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Switch to Parent Portal View */}
                  <button
                    onClick={() => setActiveRole('parent')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      activeRole === 'parent' 
                        ? 'bg-rose-50/50 border-rose-350 text-rose-950 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'parent'}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeRole === 'parent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-650'}`}>
                        <Users className="icon-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Parent Portal View</p>
                        <p className="text-[10px] opacity-75 mt-0.5">Homework, Fees & Memos</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                </div>
              </div>
            )}

            {/* DASHBOARD CONTAINER INNER ROUTER */}
            {isLoading ? (
              <div id="management-loader" className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-3 shadow-sm flex-1 flex flex-col justify-center items-center">
                <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Checking isolation locks...</p>
              </div>
            ) : (
              <main id="main-content-canvas" className="flex-1 flex flex-col">
                {activeRole === 'super_admin' && (
                  <SuperAdminDashboard 
                    schools={schools}
                    onUpdateSchoolFeatures={handleUpdateSchoolFeatures}
                    onAddSchool={handleAddSchool}
                    isFirebaseActive={firebaseActive}
                  />
                )}

                {(activeRole === 'school_admin' || activeRole === 'accountant' || activeRole === 'principle') && (
                  <SchoolAdminDashboard 
                    schoolId={activeSchoolId}
                    role={activeRole}
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
      </main>

    </div>
  );
}
