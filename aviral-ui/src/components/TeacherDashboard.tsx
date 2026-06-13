/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { School, Student, Teacher, Notice } from '../types';
import { 
  PlusCircle, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Clipboard,
  FileSpreadsheet
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: Teacher;
  school: School;
  students: Student[];
  notices: Notice[];
  onAddNotice: (notice: Omit<Notice, 'id' | 'date'>) => Promise<void>;
  onAddHomeworkToClass?: (classLevel: string, subject: string, title: string, dueDate: string) => Promise<void>;
  onMarkAttendance?: (studentId: string, status: 'present' | 'absent') => Promise<void>;
}

export default function TeacherDashboard({
  teacher,
  school,
  students,
  notices,
  onAddNotice,
  onAddHomeworkToClass,
  onMarkAttendance
}: TeacherDashboardProps) {
  // Filter students belonging to this school
  const schoolStudents = students.filter(s => s.schoolId === school.id);
  const schoolNotices = notices.filter(n => n.schoolId === school.id);

  // States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Homework submission
  const [homeworkClass, setHomeworkClass] = useState('Class IX');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkHindiTitle, setHomeworkHindiTitle] = useState('');
  const [homeworkHinglishTitle, setHomeworkHinglishTitle] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState('');

  // Circular Announcement submission
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'academic' | 'fees' | 'events' | 'holiday'>('academic');

  const handlePostHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkTitle || !homeworkDueDate) {
      setErrorMsg('Homework Title and Due Date are required.');
      return;
    }

    if (onAddHomeworkToClass) {
      onAddHomeworkToClass(homeworkClass, teacher.subject, homeworkTitle, homeworkDueDate);
      setSuccessMsg(`Homework posted successfully for all ${homeworkClass} students!`);
      setHomeworkTitle('');
      setHomeworkHindiTitle('');
      setHomeworkHinglishTitle('');
      setHomeworkDueDate('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setSuccessMsg(`Homework posted to ${homeworkClass} (Simulated).`);
      setHomeworkTitle('');
      setHomeworkHindiTitle('');
      setHomeworkHinglishTitle('');
      setHomeworkDueDate('');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) {
      setErrorMsg('Announcement title and content are required.');
      return;
    }

    try {
      await onAddNotice({
        title: noticeTitle,
        content: noticeContent,
        category: noticeCategory,
        schoolId: school.id,
      });

      setSuccessMsg('Circular Notice published on school board successfully!');
      setNoticeTitle('');
      setNoticeContent('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg('Failed to post announcement.');
    }
  };

  const handleAttendanceToggle = (studentId: string, status: 'present' | 'absent') => {
    if (onMarkAttendance) {
      onMarkAttendance(studentId, status);
      setSuccessMsg('Attendance record synchronized!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setSuccessMsg(`Marked student ${status} (Simulated).`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Color mappings
  const themeColors = {
    indigo: { text: 'text-indigo-800', border: 'border-indigo-100', bg: 'bg-indigo-50', primary: 'bg-indigo-600 hover:bg-indigo-700' },
    orange: { text: 'text-orange-800', border: 'border-orange-100', bg: 'bg-orange-50', primary: 'bg-orange-600 hover:bg-orange-700' },
    emerald: { text: 'text-emerald-800', border: 'border-emerald-100', bg: 'bg-emerald-50', primary: 'bg-emerald-600 hover:bg-emerald-700' },
    blue: { text: 'text-blue-800', border: 'border-blue-100', bg: 'bg-blue-50', primary: 'bg-blue-600 hover:bg-blue-700' },
    rose: { text: 'text-rose-800', border: 'border-rose-100', bg: 'bg-rose-50', primary: 'bg-rose-600 hover:bg-rose-700' },
    amber: { text: 'text-amber-800', border: 'border-amber-100', bg: 'bg-amber-50', primary: 'bg-amber-600 hover:bg-amber-700' },
  };

  const activeTheme = themeColors[school.primaryColor] || themeColors.indigo;

  return (
    <div id="teacher-dashboard-container" className="space-y-8 animate-fade-in glass-panel border border-slate-200 bg-white shadow-sm p-6 rounded-2xl">
      
      {/* Teacher Profile Header card */}
      <div id="teacher-profile-banner" className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4.5">
          <div className={`p-4 rounded-xl ${activeTheme.bg} ${activeTheme.text} shadow-sm border ${activeTheme.border}`}>
            <User className="w-8 h-8" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Authenticated Staff Faculty</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Welcome, Professor {teacher.name}</h2>
            <p className="text-xs text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-600">Subject Specialty:</span> 
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${activeTheme.bg} ${activeTheme.text}`}>
                {teacher.subject}
              </span>
              <span>&bull;</span>
              <span>School: <strong className="text-slate-800">{school.name}</strong></span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-650 space-y-2 w-full md:w-auto text-left shadow-xs">
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-bold">Email Username:</span>
            <strong className="text-slate-800 font-semibold">{teacher.email}</strong>
          </p>
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-bold">Tenant Isolation ID:</span>
            <strong className="text-slate-800 font-semibold">{school.id}</strong>
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 font-semibold text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 font-semibold text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Core Columns */}
      <div id="teacher-workbench-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Post homework & bullet bulletin board notices */}
        <div id="teacher-forms-col" className="space-y-6 lg:col-span-1">
          
          {/* Today's Schedule Card */}
          <div id="teacher-schedule-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${activeTheme.border} ${activeTheme.text}`}>
              <Clock className="icon-md" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Today's Class Schedule</h3>
            </div>
            
            <div className="relative border-l border-slate-150 pl-4.5 ml-2 ml-2.5 space-y-4 text-left">
              <div className="relative">
                <div className="absolute -left-[23.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                <span className="text-[10px] text-emerald-600 font-bold font-mono block uppercase">08:30 AM - 09:15 AM</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">Period 1: Class IX-A ({teacher.subject})</span>
                <span className="text-[9.5px] text-slate-400 block font-semibold">Completed</span>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[23.5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 animate-pulse"></div>
                <span className="text-[10px] text-blue-600 font-bold font-mono block uppercase">09:30 AM - 10:15 AM</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">Period 2: Class X-B ({teacher.subject})</span>
                <span className="text-[9.5px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-bold inline-block mt-0.5">In Session Now</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[23.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-100"></div>
                <span className="text-[10px] text-slate-500 font-bold font-mono block uppercase">11:00 AM - 11:45 AM</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">Period 3: Class XI-A (Lab Practical)</span>
                <span className="text-[9.5px] text-slate-400 block font-semibold">Next Up</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[23.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-100"></div>
                <span className="text-[10px] text-slate-500 font-bold font-mono block uppercase">12:00 PM - 12:45 PM</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">Period 4: Class XII-A ({teacher.subject})</span>
                <span className="text-[9.5px] text-slate-400 block font-semibold">Scheduled</span>
              </div>
            </div>
          </div>

          {/* Post HomeWork assignment card */}
          <div id="teacher-post-homework-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left">
            <div className={`flex items-center gap-2 pb-2 border-b ${activeTheme.border} ${activeTheme.text}`}>
              <BookOpen className="icon-md" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Assign Class Homework</h3>
            </div>

            <form onSubmit={handlePostHomework} className="space-y-4">
              <div>
                <label className="form-label text-slate-500">Target Student Class</label>
                <select
                  value={homeworkClass}
                  onChange={(e) => setHomeworkClass(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="Class VIII">Class VIII</option>
                  <option value="Class IX">Class IX</option>
                  <option value="Class X">Class X</option>
                  <option value="Class XI">Class XI</option>
                  <option value="Class XII">Class XII</option>
                </select>
              </div>

              <div>
                <label className="form-label text-slate-500">Assignment Title (English) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={homeworkTitle}
                  onChange={(e) => setHomeworkTitle(e.target.value)}
                  placeholder="e.g. Solve Trigonometry Exercise 5"
                  className="form-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="form-label text-slate-500">Due Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={homeworkDueDate}
                  onChange={(e) => setHomeworkDueDate(e.target.value)}
                  className="form-input text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-white font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow hover:translate-y-[-0.5px] active:translate-y-0 ${activeTheme.primary}`}
              >
                Publish New Assignment
              </button>
            </form>
          </div>

          {/* Quick Notice board announcer card */}
          <div id="teacher-post-notice-card" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left">
            <div className={`flex items-center gap-2 pb-2 border-b ${activeTheme.border} ${activeTheme.text}`}>
              <PlusCircle className="icon-md" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Broadcast School Circular</h3>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="form-label text-slate-500">Circular Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Science Fair Submission Date"
                  className="form-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="form-label text-slate-500">Notice Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="form-input text-xs"
                >
                  <option value="academic">📚 Academic Class Update</option>
                  <option value="holiday">🎉 Holiday Circular</option>
                  <option value="events">🏆 Cultural Events</option>
                  <option value="fees">💰 Fees & Payments Memo</option>
                </select>
              </div>

              <div>
                <label className="form-label text-slate-500">Content Details</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Describe notice content circular here..."
                  rows={3}
                  className="form-input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-white font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow hover:translate-y-[-0.5px] active:translate-y-0 ${activeTheme.primary}`}
              >
                Post Notice circular
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (span-2): Active Class Students & Attendance Desk */}
        <div id="teacher-main-col" className="lg:col-span-2 space-y-6">
          
          {/* Section: Manage Attendance & Student Profiles */}
          <div id="teacher-students-desk" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-slate-500" />
                  <span>Student Attendance Management Desk</span>
                </h3>
                <p className="text-xs text-slate-500">Record check-ins for students matching this school tenant.</p>
              </div>
              <span className="text-xs font-mono font-black bg-slate-200 text-slate-700 px-3 py-1 rounded-lg">
                {schoolStudents.length} Students
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {schoolStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No students pre-enrolled in this school tenant domain yet. Use School Admin view to add students.
                </div>
              ) : (
                schoolStudents.map((student) => {
                  const currentTodayStr = new Date().toISOString().split('T')[0];
                  const todayStatus = student.attendance.history.find(h => h.date === currentTodayStr)?.status;
                  
                  const isPresentSelected = todayStatus === 'present';
                  const isAbsentSelected = todayStatus === 'absent';

                  return (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm font-bold text-slate-900">{student.name}</strong>
                          <span className="text-[10px] font-mono bg-slate-150 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Roll: {student.rollNo}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            {student.class} - {student.section}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Attendance: <span className="text-slate-800 font-bold">{student.attendance.presentDays}/{student.attendance.totalDays} Days</span> ({Math.round((student.attendance.presentDays / (student.attendance.totalDays || 1)) * 100)}% attendance rate)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleAttendanceToggle(student.id, 'present')}
                          className={`text-[10.5px] font-extrabold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isPresentSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-emerald-50/40 text-emerald-700 border-emerald-105 hover:bg-emerald-100/70 hover:border-emerald-200'
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => handleAttendanceToggle(student.id, 'absent')}
                          className={`text-[10.5px] font-extrabold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isAbsentSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-rose-50/40 text-rose-700 border-rose-105 hover:bg-rose-100/70 hover:border-rose-200'
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Live Circular memos view */}
          <div id="teacher-circular-view" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
              <Clipboard className="w-4.5 h-4.5 text-slate-500" />
              <span>Current School Notifications & Announcements board</span>
            </h3>

            <div className="space-y-3.5">
              {schoolNotices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No notifications on notice board.</p>
              ) : (
                schoolNotices.map((n) => (
                  <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{n.title}</h4>
                      <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded text-slate-650 capitalize">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 mt-1 leading-relaxed">{n.content}</p>
                    <p className="text-[9.5px] font-mono text-slate-400">Published: {n.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
