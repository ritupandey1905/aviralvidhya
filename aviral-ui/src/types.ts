/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface School {
  id: string; // schoolId
  schoolCode: string; // Enter this code to open the school's whitelabel dashboard
  name: string;
  hindiName?: string;
  city: string;
  state: string;
  registeredAt: string;
  studentCount: number;
  teacherCount: number;
  primaryColor: 'indigo' | 'orange' | 'emerald' | 'blue' | 'rose' | 'amber'; // White-label color
  logoUrl?: string; // Customizable white label logo
  adminUsername: string; // Set by Super Admin
  adminPassword: string; // Set by Super Admin
  contactMobile?: string;
  contactEmail?: string;
  activeFeatures: {
    feeManagement: boolean;
    attendanceTracking: boolean;
    homeworkLMS: boolean;
    examGrading: boolean;
    transportTracking: boolean;
    smsNotifications: boolean;
  };
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  schoolId: string; // Multi-tenant Isolation key
  parentUsername: string; // Created by school admin
  parentPassword: string; // Created by school admin
  attendance: {
    presentDays: number;
    totalDays: number;
    history: { date: string; status: 'present' | 'absent' }[];
  };
  fees: {
    totalDue: number;
    paidAmount: number;
    status: 'paid' | 'partial' | 'pending';
    dueDate: string;
  };
  homework: {
    id: string;
    subject: string;
    title: string;
    dueDate: string;
    status: 'completed' | 'pending';
    hindiTitle?: string;
    hinglishTitle?: string;
  }[];
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  schoolId: string; // Multi-tenant Isolation key
  email: string;
  teacherUsername: string; // Created by school admin
  teacherPassword: string; // Created by school admin
  designation: 'teacher' | 'accountant' | 'principle'; // Role within school
}

export interface Notice {
  id: string;
  title: string;
  hindiTitle?: string;
  hinglishTitle?: string;
  content: string;
  hindiContent?: string;
  hinglishContent?: string;
  schoolId: string; // Multi-tenant Isolation key
  date: string;
  category: 'academic' | 'fees' | 'events' | 'holiday';
  targetAudience?: 'all' | 'teachers' | 'class' | 'student';
  targetValue?: string; // e.g. "Class IX", "student_1", "teacher_1"
}

export type Role = 'super_admin' | 'school_admin' | 'teacher' | 'accountant' | 'principle' | 'parent';

export type Language = 'en' | 'hi' | 'hinglish';

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  schoolId: string;
  startDate: string;
  endDate: string;
  reason: string;
  category: 'sick' | 'casual' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface Expense {
  id: string;
  schoolId: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  class: string;
  day: string; // e.g. Monday, Tuesday
  period: string; // e.g. Period 1, Period 2
  subject: string;
  teacherName: string;
  time: string;
}

export interface GradeEntry {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  examName: string;
}

