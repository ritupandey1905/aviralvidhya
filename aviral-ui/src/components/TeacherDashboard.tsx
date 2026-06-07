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
    <div id="teacher-dashboard-container" className="space-y-8 animate-fade-in">
      
      {/* Teacher Profile Header card */}
      <div id="teacher-profile-banner" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4.5">
          <div className={`p-4 rounded-2xl ${activeTheme.bg} ${activeTheme.text}`}>
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Authenticated Staff Faculty</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Welcome, Professor {teacher.name}</h2>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Subject Specialty:</span> 
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${activeTheme.bg} ${activeTheme.text}`}>
                {teacher.subject}
              </span>
              <span>&bull;</span>
              <span>School: <strong className="text-slate-800">{school.name}</strong></span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-mono text-slate-600 space-y-1.5 w-full md:w-auto">
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-slate-400 uppercase tracking-widest text-[9.5px] font-bold">Email Username:</span>
            <strong className="text-slate-800 font-semibold">{teacher.email}</strong>
          </p>
          <p className="flex justify-between md:justify-start gap-4">
            <span className="text-slate-400 uppercase tracking-widest text-[9.5px] font-bold">Tenant Isolation ID:</span>
            <strong className="text-slate-800 font-semibold">{school.id}</strong>
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-emerald-800 font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-800 font-semibold text-xs flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Core Columns */}
      <div id="teacher-workbench-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Post homework & bullet bulletin board notices */}
        <div id="teacher-forms-col" className="space-y-6 lg:col-span-1">
          
          {/* Post HomeWork assignment card */}
          <div id="teacher-post-homework-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${activeTheme.border} ${activeTheme.text}`}>
              <BookOpen className="w-5 h-5" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Assign Class Homework</h3>
            </div>

            <form onSubmit={handlePostHomework} className="space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Student Class</label>
                <select
                  value={homeworkClass}
                  onChange={(e) => setHomeworkClass(e.target.value)}
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="Class VIII">Class VIII</option>
                  <option value="Class IX">Class IX</option>
                  <option value="Class X">Class X</option>
                  <option value="Class XI">Class XI</option>
                  <option value="Class XII">Class XII</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assignment Title (English) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={homeworkTitle}
                  onChange={(e) => setHomeworkTitle(e.target.value)}
                  placeholder="e.g. Solve Trigonometry Exercise 5"
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={homeworkDueDate}
                  onChange={(e) => setHomeworkDueDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-white font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer ${activeTheme.primary}`}
              >
                Publish New Assignment
              </button>
            </form>
          </div>

          {/* Quick Notice board announcer card */}
          <div id="teacher-post-notice-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className={`flex items-center gap-2 pb-2 border-b ${activeTheme.border} ${activeTheme.text}`}>
              <PlusCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Broadcast School Circular</h3>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Circular Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Science Fair Submission Date"
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notice Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="academic">📚 Academic Class Update</option>
                  <option value="holiday">🎉 Holiday Circular</option>
                  <option value="events">🏆 Cultural Events</option>
                  <option value="fees">💰 Fees & Payments Memo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Content Details</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Describe notice content circular here..."
                  rows={3}
                  className="w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-white font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer ${activeTheme.primary}`}
              >
                Post Notice circular
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (span-2): Active Class Students & Attendance Desk */}
        <div id="teacher-main-col" className="lg:col-span-2 space-y-6">
          
          {/* Section: Manage Attendance & Student Profiles */}
          <div id="teacher-students-desk" className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-slate-500" />
                  <span>Interactive Student Attendance Management desk</span>
                </h3>
                <p className="text-xs text-slate-500">Record fast check-ins for students isolate-tenancy matching this school.</p>
              </div>
              <span className="text-xs font-mono font-black bg-slate-200 text-slate-700 px-3 py-1 rounded-lg">
                {schoolStudents.length} Students
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {schoolStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No students pre-enrolled in this school tenant domain yet. Use School Admin view to add students.
                </div>
              ) : (
                schoolStudents.map((student) => (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-slate-900">{student.name}</strong>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border">
                          Roll: {student.rollNo}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {student.class} - {student.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Attendance: <span className="text-slate-700 font-bold">{student.attendance.presentDays}/{student.attendance.totalDays} Days</span> ({Math.round((student.attendance.presentDays / (student.attendance.totalDays || 1)) * 100)}% attendance rate)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleAttendanceToggle(student.id, 'present')}
                        className="text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        ✓ Mark Present
                      </button>
                      <button
                        onClick={() => handleAttendanceToggle(student.id, 'absent')}
                        className="text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-250 hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        ✗ Mark Absent
                      </button>
                    </div>
                  </div>
                ))
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
                  <div key={n.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-1">
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
