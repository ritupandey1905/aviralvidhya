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
    <div id="school-management-application-frame" className="app-container">
      
      {/* CORPORATE HEADER */}
      <header className="border-b border-slate-200/60 sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex-center-gap-lg">
            <div className="text-2xl font-black text-indigo-600">🎓</div>
            <div>
              <h1 className="heading-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">AviralVidhya</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">School Management Platform</p>
            </div>
          </div>

          {/* Navigation & Super Admin Link */}
          <nav className="flex items-center gap-6">
            {!isAuthenticated && (
              <>
                <a href="#features" className="text-sm text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Features</a>
                <a href="#pricing" className="text-sm text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Pricing</a>
                <a href="#contact" className="text-sm text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Support</a>
                <button
                  onClick={() => {
                    setIsSuperAdminLogMode(true);
                    setResolvedSchool(null);
                    setLoginError(null);
                    setEnteredSchoolCode('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 shadow-sm"
                >
                  Admin Login
                </button>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {!isAuthenticated ? (
          <div className="space-y-0">
            {/* HERO SECTION WITH SCHOOL LOGIN */}
            <section className="relative py-24 px-4 hero-mesh overflow-hidden">
              <div className="absolute inset-0 pattern-grid opacity-60"></div>
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* Left: Hero Text & Value Prop */}
                  <div className="space-y-8">
                    <div>
                      <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm border border-indigo-200/50">
                        For Schools & Parents
                      </span>
                      <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        Modern School <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Management Platform</span>
                      </h2>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                      Streamline student management, attendance tracking, fee collection, and parent communication in one unified, elegant portal. Trusted by 500+ top schools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-white/60 px-4 py-2 rounded-xl border border-slate-200 backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5 text-indigo-500" />
                        <span>Real-time tracking</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-white/60 px-4 py-2 rounded-xl border border-slate-200 backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5 text-indigo-500" />
                        <span>Automated fees</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-white/60 px-4 py-2 rounded-xl border border-slate-200 backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5 text-indigo-500" />
                        <span>Smart portals</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: School Login Form (MAIN CTA) */}
                  <div className="space-y-6 relative">
                    {/* Decorative blurred blob behind the card */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-400 to-blue-300 opacity-20 blur-3xl rounded-full z-0"></div>
                    {!resolvedSchool && !isSuperAdminLogMode ? (
                      <div className="auth-card">
                        <div>
                          <h3 className="heading-2">School Portal Login</h3>
                          <p className="text-sm text-slate-600 mt-2">Access your school dashboard</p>
                        </div>

                        <form onSubmit={handleSchoolCodeSubmit} className="space-y-4">
                          <div>
                            <label className="form-label">School Access Code</label>
                            <div className="relative">
                              <input
                                id="school-code-input"
                                type="text"
                                maxLength={10}
                                value={enteredSchoolCode}
                                onChange={(e) => setEnteredSchoolCode(e.target.value.toUpperCase())}
                                placeholder="e.g., DPS101"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-mono font-bold text-lg tracking-widest"
                                required
                              />
                              <Building className="w-5 h-5 text-slate-400 absolute right-4 top-3 pointer-events-none" />
                            </div>
                            {schoolCodeError && (
                              <p className="text-xs text-rose-600 mt-2 font-semibold">⚠️ {schoolCodeError}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary w-full flex-center gap-2"
                          >
                            <ArrowRight className="icon-sm" />
                            Continue to Login
                          </button>
                        </form>

                        {schools.length > 0 && (
                          <div className="border-t pt-4 space-y-3">
                            <p className="text-caption">Sample Schools:</p>
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
                                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-center transition text-sm font-semibold text-slate-700 hover:text-blue-700"
                                >
                                  <p className="text-xs text-blue-600 font-bold">{s.schoolCode}</p>
                                  <p className="text-[11px] text-slate-600 mt-0.5">{s.name.split(' ')[0]}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : resolvedSchool && !isSuperAdminLogMode ? (
                      <div className="glass-panel rounded-2xl p-8 space-y-6 animate-fade-in">
                        <button
                          onClick={() => {
                            setResolvedSchool(null);
                            setEnteredSchoolCode('');
                            setLoginError(null);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                          <ChevronLeft className="icon-sm" />
                          Back
                        </button>

                        <div className="border-b pb-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mb-3">🏫</div>
                          <h3 className="heading-3">{resolvedSchool.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">📍 {resolvedSchool.city}, {resolvedSchool.state}</p>
                        </div>

                        <form onSubmit={handleSchoolLogin} className="space-y-4">
                          <div>
                            <label className="form-label">Username or Email</label>
                            <input
                              id="school-user-input"
                              type="text"
                              value={loginUsername}
                              onChange={(e) => setLoginUsername(e.target.value)}
                              placeholder="admin@school.com"
                              className="form-input"
                              required
                            />
                          </div>

                          <div>
                            <label className="form-label">Password</label>
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
                            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg font-semibold">⚠️ {loginError}</p>
                          )}

                          <button
                            type="submit"
                            className="btn btn-primary w-full flex-center gap-2"
                          >
                            <Lock className="icon-sm" />
                            Sign In
                          </button>
                        </form>
                      </div>
                    ) : isSuperAdminLogMode && !resolvedSchool ? (
                      <div className="glass-panel rounded-2xl p-8 space-y-6 animate-fade-in">
                        <button
                          onClick={() => {
                            setIsSuperAdminLogMode(false);
                            setLoginError(null);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                          <ChevronLeft className="icon-sm" />
                          Back
                        </button>

                        <div>
                          <h3 className="heading-2">Super Admin Access</h3>
                          <p className="text-sm text-slate-600 mt-2">Manage tenants and system settings</p>
                        </div>

                        <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                          <div>
                            <label className="form-label">Email</label>
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

                          <div>
                            <label className="form-label">Password</label>
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
                            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg font-semibold">⚠️ {loginError}</p>
                          )}

                          <button
                            type="submit"
                            className="btn-primary w-full py-3 rounded-xl font-semibold uppercase tracking-wide text-sm"
                          >
                            Sign In as Admin
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="py-20 px-4 bg-white">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="heading-1">Powerful Features</h2>
                  <p className="text-lg text-slate-600">Everything you need to run your school efficiently</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="feature-card">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="heading-4">Student Management</h3>
                    <p className="text-body">Manage student profiles, attendance, grades, and fees in one place</p>
                  </div>

                  <div className="feature-card">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="heading-4">Teacher Portal</h3>
                    <p className="text-body">Mark attendance, assign homework, and manage grades easily</p>
                  </div>

                  <div className="feature-card">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="heading-4">Parent Updates</h3>
                    <p className="text-body">Keep parents informed about fees, attendance, and school events</p>
                  </div>

                  <div className="feature-card">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="heading-4">Fee Collection</h3>
                    <p className="text-body">Track payments, generate invoices, and send reminders automatically</p>
                  </div>

                  <div className="feature-card">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="heading-4">Notifications</h3>
                    <p className="text-body">Send instant alerts to parents about important school updates</p>
                  </div>

                  <div className="feature-card">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="heading-4">Secure & Scalable</h3>
                    <p className="text-body">Enterprise-grade security with cloud-based infrastructure</p>
                  </div>
                </div>
              </div>
            </section>

            {/* PRICING SECTION */}
            <section id="pricing" className="py-20 px-4 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                  <h2 className="heading-1">Transparent Pricing</h2>
                  <p className="text-lg text-slate-600">Choose the plan that works for your school</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="glass-panel rounded-2xl p-8 space-y-6 border border-slate-200 hover:border-blue-300 transition">
                    <div>
                      <h3 className="heading-3">Basic</h3>
                      <p className="text-3xl font-black text-slate-900 mt-2">₹9,999<span className="text-sm text-slate-600 font-normal">/mo</span></p>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Up to 500 students</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Attendance tracking</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Basic reporting</li>
                    </ul>
                    <button className="w-full py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-100 transition">Get Started</button>
                  </div>

                  <div className="glass-panel rounded-2xl p-8 space-y-6 border-2 border-blue-500 shadow-lg scale-105">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">POPULAR</span>
                      <h3 className="heading-3">Professional</h3>
                      <p className="text-3xl font-black text-slate-900 mt-2">₹14,999<span className="text-sm text-slate-600 font-normal">/mo</span></p>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> 500-1000 students</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Full parent portal</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Fee management</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Priority support</li>
                    </ul>
                    <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Try Free</button>
                  </div>

                  <div className="glass-panel rounded-2xl p-8 space-y-6 border border-slate-200 hover:border-blue-300 transition">
                    <div>
                      <h3 className="heading-3">Enterprise</h3>
                      <p className="text-3xl font-black text-slate-900 mt-2">Custom</p>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Multi-campus support</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Custom integrations</li>
                      <li className="flex-center-gap"><CheckCircle className="w-4 h-4 text-emerald-500" /> Dedicated support</li>
                    </ul>
                    <button className="w-full py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-100 transition">Contact Sales</button>
                  </div>
                </div>
              </div>
            </section>

            {/* CONTACT/SUPPORT SECTION */}
            <section id="contact" className="py-20 px-4 bg-white">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="heading-1">Get Support</h2>
                  <p className="text-lg text-slate-600">We're here to help you succeed</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <a href="mailto:support@aviralvidhya.com" className="glass-panel rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition space-y-3">
                    <div className="text-2xl">📧</div>
                    <h3 className="font-bold text-slate-900">Email Support</h3>
                    <p className="text-body">support@aviralvidhya.com</p>
                  </a>
                  <a href="tel:+919876543210" className="glass-panel rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition space-y-3">
                    <div className="text-2xl">📞</div>
                    <h3 className="font-bold text-slate-900">Phone Support</h3>
                    <p className="text-body">+91 9876-543-210</p>
                  </a>
                  <a href="#" className="glass-panel rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition space-y-3">
                    <div className="text-2xl">💬</div>
                    <h3 className="font-bold text-slate-900">Live Chat</h3>
                    <p className="text-body">Chat with us now</p>
                  </a>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div id="management-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
            
            {/* Dynamic Header */}
            <IndianMotifHeader 
              title="AviralVidhya School Management" 
              subtitle="Modern, centralized school management for multi-tenant organizations."
            />

            {/* Error Notification */}
            {syncError && (
              <div id="firestore-error-reporter" className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl p-4 text-xs space-y-2 animate-bounce-short">
                <div className="flex items-center gap-2 font-bold uppercase text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>System Warning</span>
                </div>
                <p>A recent state synchronization write was refused by security rules. Secure system details shown below:</p>
                <pre className="p-3 bg-rose-100 text-rose-900 rounded-xl font-mono text-[10.5px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {syncError}
                </pre>
                <button
                  onClick={() => setSyncError(null)}
                  className="text-[11px] font-extrabold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Acknowledge and Resolve
                </button>
              </div>
            )}

            {/* SYSTEM AUTHENTICATION SWITCHER (ROLE CONTROL PANEL) */}
            {loginRole === 'super_admin' && (
              <div id="system-auth-hub" className="dashboard-card">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-4.5 h-4.5 text-blue-600" />
                      <span>Switch Active Workspace Portal View</span>
                    </h2>
                    <p className="text-xs text-slate-500">Fast-switch tenant workflows in this authenticated session</p>
                  </div>

                  {/* School isolation select element - displays only if not Super Admin */}
                  {activeRole !== 'super_admin' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs w-full sm:w-fit">
                      <label htmlFor="school-context-dropdown" className="font-bold text-slate-600 uppercase tracking-wider">Active School:</label>
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
                        ? 'bg-blue-50 border-blue-300 text-slate-900 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'super_admin'}
                  >
                    <div className="flex-center-gap-lg">
                      <div className={`p-2.5 rounded-lg ${activeRole === 'super_admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Shield className="icon-md" />
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
                        ? 'bg-orange-50 border-orange-300 text-slate-900 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'school_admin'}
                  >
                    <div className="flex-center-gap-lg">
                      <div className={`p-2.5 rounded-lg ${activeRole === 'school_admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        <GraduationCap className="icon-md" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">School Admin View</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Memos, enrollments & staff</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>

                  {/* Parent Portal Tab */}
                  <button
                    onClick={() => setActiveRole('parent')}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      activeRole === 'parent' 
                        ? 'bg-rose-50 border-rose-300 text-slate-900 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    role="tab"
                    aria-selected={activeRole === 'parent'}
                  >
                    <div className="flex-center-gap-lg">
                      <div className={`p-2.5 rounded-lg ${activeRole === 'parent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Users className="icon-md" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">Parent Portal View</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Homework, fees & notices</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>

                </div>
              </div>
            )}

            {/* LOADING INDICATOR */}
            {isLoading ? (
              <div id="management-loader" className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-700 mx-auto animate-spin" />
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

      {/* FOOTER */}
      {!isAuthenticated && (
        <footer className="bg-slate-900 text-slate-200 py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-black text-white text-lg">AviralVidhya</h3>
              <p className="text-sm text-slate-400">Modern ERP platform for schools across India.</p>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-white">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-white">LinkedIn</a>
                <a href="#" className="text-slate-400 hover:text-white">Facebook</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#contact" className="hover:text-white">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2024 AviralVidhya. All rights reserved.</p>
            <p>Made with ❤️ for Indian schools</p>
          </div>
        </footer>
      )}
    </div>
  );
}
