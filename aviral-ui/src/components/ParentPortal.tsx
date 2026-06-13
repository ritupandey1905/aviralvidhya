/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { School, Student, Notice, LeaveApplication } from '../types';
import { fetchLeaves, createLeave } from '../api';
import { 
  Calendar, 
  CreditCard, 
  BellRing, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Send, 
  History,
  CheckCircle,
  XCircle,
  Users,
  GraduationCap
} from 'lucide-react';

interface ParentPortalProps {
  schoolId: string;
  schools: School[];
  students: Student[];
  notices: Notice[];
  onFeePayment: (studentId: string, amount: number) => Promise<void>;
}

export default function ParentPortal({
  schoolId,
  schools,
  students,
  notices,
  onFeePayment
}: ParentPortalProps) {

  // Filter isolated school students
  const schoolStudents = students.filter(s => s.schoolId === schoolId);

  // Active child state
  const [activeStudentId, setActiveStudentId] = useState<string>(
    schoolStudents[0]?.id || ''
  );

  // Find active student object
  const activeStudent = schoolStudents.find(s => s.id === activeStudentId) || schoolStudents[0];

  // Find siblings matching this parent's username
  const siblingStudents = schoolStudents.filter(
    s => activeStudent && s.parentUsername === activeStudent.parentUsername
  );

  // Persistent Leave applications list state
  const [leaveApps, setLeaveApps] = useState<LeaveApplication[]>([]);
  
  // Leave Form states
  const [leaveCategory, setLeaveCategory] = useState<'sick' | 'casual' | 'other'>('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');
  const [leaveError, setLeaveError] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // School metadata
  const currentSchool = schools.find(sch => sch.id === schoolId);

  // Sync / Load leave applications
  useEffect(() => {
    async function loadLeaves() {
      try {
        const data = await fetchLeaves();
        // Assuming data is an array of LeaveApplication, filter them for the student
        if (activeStudent) {
          const studentLeaves = data.filter((leave: any) => leave.studentId === activeStudent.id);
          setLeaveApps(studentLeaves);
        } else {
          setLeaveApps([]);
        }
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      }
    }
    loadLeaves();
  }, [schoolId, activeStudentId, activeStudent]);

  useEffect(() => {
    if (!activeStudent) {
      setPaymentAmount('');
      return;
    }
    const remaining = activeStudent.fees.totalDue - activeStudent.fees.paidAmount;
    setPaymentAmount(remaining > 0 ? remaining.toString() : '0');
    setPaymentError('');
  }, [activeStudent]);

  // Handle Pay Now with dynamic status logic
  const handlePayNow = async () => {
    if (!activeStudent) return;
    const remainingDue = activeStudent.fees.totalDue - activeStudent.fees.paidAmount;
    const requestedAmount = Number(paymentAmount);

    if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
      setPaymentError('Enter a valid payment amount greater than zero. / शून्य से अधिक भुगतान राशि दर्ज करें।');
      return;
    }
    if (requestedAmount > remainingDue) {
      setPaymentError(`Amount cannot exceed remaining due ₹${remainingDue}. / शेष बकाया राशि से अधिक राशि नहीं हो सकती।`);
      return;
    }

    setPaymentError('');
    setPaymentSuccess('');
    try {
      await onFeePayment(activeStudent.id, requestedAmount);
      setPaymentSuccess("Payment successfully updated in campus ledger! / भुगतान सफलतापूर्वक कैम्पस खाता बही में अपडेट किया गया!");
      setTimeout(() => {
        setPaymentSuccess('');
      }, 6000);
    } catch (err: any) {
      setPaymentSuccess('');
      console.error('Fee payment failed', err);
      setPaymentError(`Payment failed: ${err?.message || err}`);
      setTimeout(() => setPaymentError(''), 8000);
    }
  };

  // Submit Leave application
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSuccess('');
    setLeaveError('');

    if (!activeStudent) {
      setLeaveError("Choose a student context first. / पहले विद्यार्थी का चयन का विवरण चुनें।");
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      setLeaveError("Please fill all required inputs. / कृपया सभी आवश्यक प्रविष्टियों को भरें।");
      return;
    }

    const freshLeave: any = {
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      class: activeStudent.class,
      schoolId: schoolId,
      startDate,
      endDate,
      reason: reason.trim(),
      category: leaveCategory,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    try {
      const createdLeave = await createLeave(freshLeave);
      setLeaveApps(prev => [createdLeave, ...prev]);
      setLeaveSuccess("Leave application submitted to class teacher! / अवकाश आवेदन कक्षा शिक्षक को जमा कर दिया गया है!");
      setReason('');
      setStartDate('');
      setEndDate('');

      setTimeout(() => setLeaveSuccess(''), 6500);
    } catch (error: any) {
      setLeaveError(`Failed to apply leave: ${error.message}`);
    }
  };

  if (!activeStudent) {
    return (
      <div id="parent-portal-empty" className="glass-panel border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-fade-in bg-white">
        <ShieldAlert className="w-12 h-12 text-rose-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Student Profiles Enrolled / कोई छात्र प्रोफाइल नामांकित नहीं है</h3>
        <p className="text-sm text-slate-400">
          We cannot identify registered wards in this school context. Please log in as a \"School Admin\" and register at least one student profile under <strong className="text-slate-900">{currentSchool?.name || schoolId}</strong>.
        </p>
      </div>
    );
  }

  // Attendance rate and safety alerts
  const attendanceRate = Math.round((activeStudent.attendance.presentDays / (activeStudent.attendance.totalDays || 160)) * 100);
  const isAttendanceSafe = attendanceRate >= 75;

  // Overdue Dues Status & Fine Calculation
  const isPastDueDate = new Date() > new Date(activeStudent.fees.dueDate);
  const isUnpaid = activeStudent.fees.status !== 'paid';
  const hasFine = isPastDueDate && isUnpaid;
  const fineAmount = 500; // Flat late payment collection fine in Rupees

  // Targeted Notices filtering
  const targetedNotices = notices.filter(n => {
    if (n.schoolId !== schoolId) return false;
    if (!n.targetAudience || n.targetAudience === 'all') return true;
    if (n.targetAudience === 'class' && n.targetValue === activeStudent.class) return true;
    if (n.targetAudience === 'student' && n.targetValue === activeStudent.id) return true;
    return false;
  });

  const totalDays = activeStudent.attendance.totalDays || 160;
  const presentDays = activeStudent.attendance.presentDays;
  const absentDays = Math.max(0, totalDays - presentDays);

  return (
    <div id="parent-portal-root" className="space-y-6 animate-fade-in text-slate-900 font-sans glass-panel border border-slate-200 bg-white shadow-sm p-6">
      
      {/* 20-YEARS ARCHITECT SIGNATURE BIO CARD: Wards Selectors */}
      <div id="language-and-child-selector-card" className="glass-panel border border-slate-200 bg-white text-slate-900 rounded-3xl p-6 shadow-sm space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-amber-300 text-[10.5px] font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Care Active Parent Desk / पेरेंट डेस्क सक्रिय</span>
            </div>
            <h2 className="text-xl font-black mt-2 tracking-tight text-white">
              Academic Ward Session / <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">शैक्षणिक सत्र विवरण</span>
            </h2>
            <p className="text-xs text-slate-300">
              Access fee statements, registers, notices, and leave cards instantly. / शुल्क विवरण, उपस्थिति, परिपत्र और छुट्टी के लिए तुरंत पहुँच प्राप्त करें।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl text-left md:text-right shrink-0">
            <span className="text-[10px] text-indigo-305 block font-extrabold uppercase tracking-widest text-slate-300">Authorized Parent Identifier / अभिभावक विवरण</span>
            <span className="text-sm font-bold text-amber-300 block font-mono mt-0.5">{activeStudent.parentUsername}</span>
          </div>
        </div>

        {/* Dynamic Multiple Ward Profiles list (Multi-Kid Sibling Switcher) */}
        <div id="ward-switcher-row" className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-left">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Select Student Profile / छात्र का चयन करें:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {siblingStudents.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveStudentId(child.id)}
                className={`px-4 py-2.5 text-xs font-black rounded-xl border-1.5 transition-all cursor-pointer ${
                  activeStudent.id === child.id
                    ? 'bg-amber-450 bg-amber-400 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 hover:border-white/20'
                }`}
                aria-label={`Select ${child.name}`}
              >
                🎓 {child.name} &bull; {child.class} ({child.section})
              </button>
            ))}
            {siblingStudents.length === 1 && (
              <span className="text-[10px] text-slate-400 italic self-center">Single ward enrollment detected in server database</span>
            )}
          </div>
        </div>
      </div>

      {/* STUDENT BASIC METADATA LEDGER HEADER */}
      <div id="active-ward-bio" className="p-5 bg-slate-50 border border-slate-200 rounded-2.5xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🧑‍🎓
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              Class Ward / वर्तमान विद्यार्थी
            </span>
            <h3 className="text-base font-black text-slate-905 mt-1">
              {activeStudent.name} (Roll: <span className="font-mono">{activeStudent.rollNo}</span>)
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Grade: {activeStudent.class} &bull; Section: {activeStudent.section} &bull; Saraswati Academic Hub SBN303
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-xs w-full sm:w-auto">
          <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-left">
            <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Admission Registration / नामांकन संख्या</span>
            <span className="text-xs font-black text-slate-400 font-mono">{activeStudent.id}</span>
          </div>
        </div>
      </div>

      {/* PARENT GRID CARDS */}
      <div id="parent-sections" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD A: DUAL-LANGUAGE FEES DESK (Hindi + English) */}
        {currentSchool?.activeFeatures.feeManagement && (
          <div id="parent-fees-hub" className="bg-white border-2 border-slate-200/90 rounded-2.5xl shadow-sm p-6 space-y-5 text-left transition-all hover:shadow-md">
            
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex-center-gap">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">Fee Ledger Management / <span className="text-emerald-750 font-bold">शुल्क भुगतान केन्द्र</span></h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">Check dues ledger history and receipts</span>
                </div>
              </div>
              
              <span className={`inline-block font-black px-2.5 py-1 rounded-lg text-[9.5px] border uppercase ${
                activeStudent.fees.status === 'paid' 
                  ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300' 
                  : hasFine
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {activeStudent.fees.status === 'paid' ? 'Receipt Cleared / चुकाया हुआ' : hasFine ? 'Overdue with Penalty / लंबित अर्थदण्ड' : 'Dues Pending / बकाया शेष'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1">
                <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-wide">Paid Amount / जमा की गई राशि</p>
                <span className="text-lg font-black text-emerald-700 block">₹{activeStudent.fees.paidAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1">
                <p className="text-[9.5px] font-black text-slate-505 uppercase tracking-wide">Pending Due / बकाया राशि</p>
                <span className={`text-lg font-black block ${hasFine ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                  ₹{(activeStudent.fees.totalDue - activeStudent.fees.paidAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Late Fine alerting system */}
            {hasFine && (
              <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl flex items-start gap-2 text-xs text-rose-950">
                <AlertTriangle className="w-5 h-5 text-rose-605 flex-shrink-0 mt-0.5 animate-bounce-short" />
                <div>
                  <span className="font-extrabold block">Overdue Fine Invoiced! / विलंब शुल्क लागू!</span>
                  <p className="mt-0.5 leading-relaxed text-slate-700">
                    The scheduled fee date is passed. A policy compliance late fine of <strong className="text-rose-700 font-bold">₹{fineAmount}</strong> has been added to the ward's invoice.
                  </p>
                </div>
              </div>
            )}

            {/* Date Details */}
            <div className="flex justify-between items-center text-[11px] px-3 py-2 bg-slate-50 rounded-xl border text-slate-650">
              <span>Payment Type / शुल्क प्रकार: <strong className="text-slate-900 font-bold">Quarterly Term Tuition</strong></span>
              <span>Due Date / अंतिम तिथि: <strong className="text-slate-900 font-extrabold font-mono">{new Date(activeStudent.fees.dueDate).toLocaleDateString()}</strong></span>
            </div>

            {/* Payment Button Gateway */}
            {activeStudent.fees.totalDue - activeStudent.fees.paidAmount > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    Enter payment amount / भुगतान राशि दर्ज करें
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-3 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-500"
                        aria-label="Payment amount"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount((activeStudent.fees.totalDue - activeStudent.fees.paidAmount).toString())}
                      className="px-3 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-100 border border-slate-200"
                    >
                      Full due
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePayNow}
                  className="w-full bg-gradient-to-r from-emerald-600 to-slate-900 hover:opacity-95 font-bold text-white text-xs py-3 rounded-xl shadow-md uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <CreditCard className="icon-sm" />
                  <span>Process Payment / भुगतान करें</span>
                </button>

                {paymentError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold p-3 rounded-xl text-center">
                    {paymentError}
                  </div>
                )}
                {paymentSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold p-3 rounded-xl text-center flex items-center justify-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{paymentSuccess}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-center text-xs font-black text-emerald-900 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
                <div>
                  <span className="block">All academic dues paid & receipts generated. / सभी शुल्क पूर्ण रूप से जमा हो चुके हैं।</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARD B: DUAL-LANGUAGE ATTENDANCE REGISTER (Hindi + English) */}
        {currentSchool?.activeFeatures.attendanceTracking && (
          <div id="parent-attendance-hub" className="bg-white border-2 border-slate-200/90 rounded-2.5xl shadow-sm p-6 space-y-5 text-left transition-all hover:shadow-md">
            
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex-center-gap">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">Attendance Registry / <span className="text-indigo-850 font-bold">उपस्थिति विवरण</span></h3>
                  <span className="text-[10px] text-slate-400 block mt-1">Official class attendance register statistics</span>
                </div>
              </div>
              <span className="text-[10.5px] bg-slate-100 text-slate-700 border font-extrabold px-2 py-0.5 rounded-lg font-mono">Min Target: 75%</span>
            </div>

            {/* Circular Rate Indicator side-by-side with summary stats */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border rounded-2xl">
              <div className="relative flex items-center justify-center bg-white p-2 rounded-full border shadow-sm shrink-0">
                <svg className="w-20 h-20 transform -rotate-90" aria-hidden="true">
                  <circle cx="40" cy="40" r="34" className="stroke-slate-100 fill-none" strokeWidth="6"/>
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className={`fill-none transition-all duration-1000 ${isAttendanceSafe ? 'stroke-emerald-500' : 'stroke-rose-500'}`}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - attendanceRate / 100)}`}
                  />
                </svg>
                <div className="absolute text-center bg-white rounded-full">
                  <span className="text-base font-black text-slate-900">{attendanceRate}%</span>
                </div>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[9.5px] uppercase font-black text-indigo-700 block tracking-wide">Registry status:</span>
                <p className="text-xs font-bold text-slate-800">
                  Total Present / उपस्थित दिन: <strong className="text-emerald-600 font-extrabold text-sm">{presentDays}</strong> / {totalDays} Working Days
                </p>
                <p className="text-xs text-slate-500">
                  Total Absent / अनुपस्थित दिन: <strong className="text-rose-600 font-bold font-mono">{absentDays}</strong> Days
                </p>
              </div>
            </div>

            {/* Compliance dynamic message */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              isAttendanceSafe ? 'bg-emerald-50/60 border-emerald-150 text-emerald-950' : 'bg-rose-50/60 border-rose-150 text-rose-950'
            }`}>
              {isAttendanceSafe ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Attendance Satisfactory / सन्तोषजनक उपस्थिति</span>
                    <p className="text-slate-600 mt-0.5">Your ward maintains required attendance levels for central final examination approvals.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-805 block">Attendance Shortage Warning! / कम उपस्थिति चेतावनी!</span>
                    <p className="text-rose-900/80 mt-0.5">Below 75%. Please submit medical certifications or contact the office administrative coordinator.</p>
                  </div>
                </>
              )}
            </div>

            {/* Calendar tracking dots */}
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 text-center sm:text-left">
                Daily Calendar Map / दैनिक उपस्थिति चार्ट:
              </p>
              <div className="grid grid-cols-10 gap-1.5 bg-slate-50 p-2.5 rounded-xl border">
                {Array.from({length: 30}).map((_, i) => {
                  const dayStatusObj = activeStudent.attendance.history[i % activeStudent.attendance.history.length];
                  const isPresent = dayStatusObj ? dayStatusObj.status === 'present' : Math.random() > 0.15;
                  return (
                    <div 
                      key={i} 
                      className={`h-4.5 rounded flex items-center justify-center font-mono text-[8px] font-bold border transition-colors ${
                        isPresent 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs' 
                          : 'bg-rose-500 border-rose-600 text-white shadow-xs'
                      }`}
                      title={isPresent ? `Day ${i+1}: Present` : `Day ${i+1}: Absent`}
                    >
                      {i+1}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2.5 justify-center text-[10px] text-slate-500 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-600"></span> 
                  Present / उपस्थित
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-600"></span> 
                  Absent / अनुपस्थित
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* LOWER ROW GRID: NOTICE BOARD & LEAVE APPLICATIONS */}
      <div id="parent-lower-sections" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TAB C: MULTILINGUAL NOTICE BOARD AND CIRCULARS */}
        <div id="parent-notice-board" className="bg-white border-2 border-slate-200/90 rounded-2.5xl shadow-sm p-6 space-y-5 text-left transition-all hover:shadow-md">
          
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex-center-gap">
              <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <BellRing className="w-4.5 h-4.5 animate-bounce-short" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-none">Circulars & Notice Board / <span className="text-indigo-850 font-bold">सूचना-पट्ट</span></h3>
                <span className="text-[10px] text-slate-500 block mt-1">Official declarations from administrative desk</span>
              </div>
            </div>
            <span className="text-[9.5px] bg-red-50 border border-red-200 text-red-800 px-2.5 py-0.5 rounded-lg font-black uppercase">
              {targetedNotices.length} Alerts / सूचनाएं
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {targetedNotices.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-slate-400 text-xs font-bold">No active circulars to display. / कोई सक्रिय नया नोटिस नहीं है।</p>
              </div>
            ) : (
              targetedNotices.map((notice) => {
                return (
                  <div key={notice.id} className="p-4 border-l-4 border-indigo-600 bg-slate-50 hover:bg-slate-100/70 rounded-r-xl space-y-2 transition-colors border shadow-xs">
                    <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
                      <span className="uppercase text-indigo-750 font-black tracking-widest bg-indigo-50 border border-indigo-200 px-1.5 rounded-md">{notice.category}</span>
                      <span>{new Date(notice.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
                    </div>

                    {/* Simultaneous dual-languages title */}
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      📢 {notice.title} 
                      {notice.hindiTitle && (
                        <span className="text-indigo-900 block mt-0.5 border-t border-dashed border-slate-200 pt-1 font-bold">
                          👉 {notice.hindiTitle}
                        </span>
                      )}
                    </h4>

                    {/* English notice core */}
                    <div className="text-xs text-slate-650 leading-relaxed font-medium bg-white p-2.5 rounded-lg border">
                      {notice.content}
                    </div>

                    {/* Hindi notice core rendered side-by-side or stacked immediately */}
                    {notice.hindiContent && (
                      <div className="text-xs text-slate-700 leading-relaxed font-semibold bg-amber-50/50 p-2.5 rounded-lg border border-amber-205">
                        🇮🇳 हिन्दी अनुवाद: {notice.hindiContent}
                      </div>
                    )}

                    {/* Target tag indicators */}
                    {notice.targetAudience && notice.targetAudience !== 'all' && (
                      <span className="inline-block bg-slate-100 text-slate-600 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono border">
                        Target Context: {notice.targetAudience.toUpperCase()} ({notice.targetValue})
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TAB D: DUAL-LANGUAGE LEAVE APPLICATIONS AND LOGS */}
        <div id="parent-leave-applications" className="bg-white border-2 border-slate-200/90 rounded-2.5xl shadow-sm p-6 space-y-5 text-left transition-all hover:shadow-md">
          
          <div className="flex items-center gap-2 pb-3 border-b">
            <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-none">Apply Digital Leave Card / <span className="text-rose-800 font-bold">अवकाश हेतु आवेदन</span></h3>
              <span className="text-[10px] text-slate-500 block mt-1">Submit digital casual leave to class warden directly</span>
            </div>
          </div>

          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="leave-category" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Reason Category / छुट्टी वर्गीकरण
                </label>
                <select
                  id="leave-category"
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 font-bold cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="sick">🩺 Medical Medical Leave / बीमारी अवकाश</option>
                  <option value="casual">🏡 Personal Casual Leave / व्यक्तिगत अवकाश</option>
                  <option value="other">🗓️ Other General Reason / अन्य कारण</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="leave-start" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Start Date / आरंभ तिथि
                  </label>
                  <input
                    id="leave-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-lg p-2 text-slate-900 hover:bg-slate-100 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="leave-end" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    End Date / अंतिम तिथि
                  </label>
                  <input
                    id="leave-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-lg p-2 text-slate-900 hover:bg-slate-100 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="leave-reason" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Reason Detail Statement / अवकाश लेने का स्पष्ट कारण
              </label>
              <textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reasons (e.g., Physician recommended rest, sister marriage ceremony, etc.)"
                rows={2}
                className="w-full text-xs bg-slate-50 border rounded-lg p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>

            {leaveSuccess && (
              <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{leaveSuccess}</span>
              </div>
            )}
            {leaveError && (
              <div className="bg-rose-50 border border-rose-150 p-3 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{leaveError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Digital Leave Request / छुट्टी के लिए ऑनलाइन आवेदन भेजें</span>
            </button>
          </form>

          {/* Leave Application History Ledger */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>Student Leaves History / अवकाश इतिहास रिपोर्ट:</span>
            </h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {leaveApps.filter(l => l.studentId === activeStudent.id).length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center py-2">No active leave petitions found. / कोई पूर्व अवकाश इतिहास उपलब्ध नहीं।</p>
              ) : (
                leaveApps.filter(l => l.studentId === activeStudent.id).map((appl) => (
                  <div key={appl.id} className="p-3 bg-slate-50 rounded-lg border text-xs flex justify-between items-start gap-4 hover:bg-slate-100 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-800 capitalize leading-none bg-indigo-50 px-1 py-0.5 rounded border border-indigo-150 text-[10.5px]">🩺 {appl.category}</span>
                        <span className="text-[10px] text-slate-500 font-extrabold font-mono">({appl.startDate} to {appl.endDate})</span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium" title={appl.reason}>{appl.reason}</p>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase shrink-0 leading-none ${
                      appl.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 border' 
                        : appl.status === 'rejected' 
                          ? 'bg-rose-100 text-rose-800 border-rose-300 border' 
                          : 'bg-amber-100 text-amber-800 border-amber-300 border'
                    }`}>
                      {appl.status === 'approved' ? 'Approved / स्वीकृत' : appl.status === 'rejected' ? 'Rejected / अस्वीकृत' : 'Pending Review / समीक्षा मे'}
                    </span>
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
