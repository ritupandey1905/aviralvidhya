/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { School } from '../types';
import { Building2, Settings2, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck, Database, Sliders, MapPin, Eye, EyeOff, Palette, Key, Clipboard } from 'lucide-react';

interface SuperAdminDashboardProps {
  schools: School[];
  onUpdateSchoolFeatures: (schoolId: string, features: School['activeFeatures']) => void;
  onAddSchool: (school: Omit<School, 'studentCount' | 'teacherCount' | 'registeredAt'>) => void;
  isFirebaseActive: boolean;
}

export default function SuperAdminDashboard({
  schools,
  onUpdateSchoolFeatures,
  onAddSchool,
  isFirebaseActive
}: SuperAdminDashboardProps) {
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolState, setNewSchoolState] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolColor, setNewSchoolColor] = useState<School['primaryColor']>('indigo');
  const [newSchoolLogo, setNewSchoolLogo] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newContactMobile, setNewContactMobile] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  
  const [selectedFeatures, setSelectedFeatures] = useState<School['activeFeatures']>({
    feeManagement: true,
    attendanceTracking: true,
    homeworkLMS: true,
    examGrading: true,
    transportTracking: false,
    smsNotifications: true,
  });

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleGenerateCode = () => {
    if (newSchoolName) {
      const acronym = newSchoolName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewSchoolCode(`${acronym}${randomNum}`);
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewSchoolCode(`SCH${randomNum}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCity || !newSchoolState || !newSchoolCode || !newAdminUsername || !newAdminPassword) {
      setFormError('Please fill out all mandatory school identification fields, school code, and administrator credentials.');
      return;
    }

    const cleanCode = newSchoolCode.trim().toUpperCase();

    // Check for duplicate schoolId
    const newId = `school_${newSchoolName.toLowerCase().replace(/\s+/g, '_')}`;
    if (schools.some(s => s.id === newId)) {
      setFormError('A school tenancy with a similar name already exists.');
      return;
    }

    // Check for duplicate schoolCode
    if (schools.some(s => s.schoolCode.toUpperCase() === cleanCode)) {
      setFormError(`School code "${cleanCode}" is already taken. Please enter a unique code.`);
      return;
    }

    onAddSchool({
      id: newId,
      schoolCode: cleanCode,
      name: newSchoolName,
      city: newSchoolCity,
      state: newSchoolState,
      primaryColor: newSchoolColor,
      logoUrl: newSchoolLogo || `🏫 ${newSchoolName}`,
      adminUsername: newAdminUsername.trim(),
      adminPassword: newAdminPassword.trim(),
      contactMobile: newContactMobile.trim(),
      contactEmail: newContactEmail.trim(),
      activeFeatures: { ...selectedFeatures }
    });

    setFormSuccess(`School Tenancy "${newSchoolName}" created successfully! Code: ${cleanCode}`);
    setNewSchoolName('');
    setNewSchoolCity('');
    setNewSchoolState('');
    setNewSchoolCode('');
    setNewSchoolColor('indigo');
    setNewSchoolLogo('');
    setNewAdminUsername('');
    setNewAdminPassword('');
    setNewContactMobile('');
    setNewContactEmail('');
    setFormError('');

    setTimeout(() => setFormSuccess(''), 6000);
  };

  const handleFeatureToggle = (schoolId: string, feature: keyof School['activeFeatures']) => {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    const updatedFeatures = {
      ...school.activeFeatures,
      [feature]: !school.activeFeatures[feature],
    };
    onUpdateSchoolFeatures(schoolId, updatedFeatures);
  };

  return (
    <div id="super-admin-root" className="space-y-8 animate-fade-in">
      
      {/* Overview Cards Grid */}
      <div id="super-admin-status-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div id="stat-card-schools" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Registered Tenants</p>
              <h3 className="text-2xl font-bold text-slate-900">{schools.length} Schools</h3>
            </div>
          </div>
        </div>

        <div id="stat-card-students" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Isolated Queries</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {schools.reduce((acc, s) => acc + s.studentCount, 0)} Students
              </h3>
            </div>
          </div>
        </div>

        <div id="stat-card-security" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Storage Sync Mode</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full mt-1 ${isFirebaseActive ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-850'}`}>
                {isFirebaseActive ? 'Live Firebase Realtime DB' : 'Local Sandbox Synced'}
              </span>
            </div>
          </div>
        </div>

        <div id="stat-card-compliance" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">WCAG Accessibility</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-teal-100 text-teal-800 mt-1 uppercase">
                Level AA Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-semibold z-50 animate-bounce shadow-lg">
          Copied {copiedText} to clipboard!
        </div>
      )}

      {/* Main Content Layout */}
      <div id="super-admin-workspace" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Registered Schools Feature Manager */}
        <div id="schools-directory-section" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Tenant Isolation & School Module Rights</h2>
              <p className="text-sm text-slate-500">Configure feature authorization gates per tenant dynamically.</p>
            </div>
            <Settings2 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="divide-y divide-slate-100 p-6 space-y-6">
            {schools.map((school) => (
              <div id={`school-rights-${school.id}`} key={school.id} className="pt-6 first:pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
                      {school.name}
                      <span className="text-xs font-mono font-extrabold bg-orange-100 text-orange-850 px-2.5 py-0.5 rounded-full border border-orange-200">
                        School Code: {school.schoolCode}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {school.city}, {school.state} State &bull; Registered in {new Date(school.registeredAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Brand Theme Display badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Theme:</span>
                    <span className={`w-3.5 h-3.5 rounded-full bg-${school.primaryColor}-500 inline-block`} title={school.primaryColor}></span>
                    <span className="text-xs font-mono font-semibold bg-slate-50 px-2 py-1 rounded border text-slate-700 capitalize">
                      {school.primaryColor}
                    </span>
                  </div>
                </div>

                {/* CRITICAL: Display Whitelabel Logins & credentials created by Super Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-1.5">
                    <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      White-labeled Logo Label
                    </p>
                    <div className="bg-white border rounded px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <p>{school.logoUrl || `🏫 ${school.name}`}</p>
                      <button 
                        onClick={() => handleCopy(school.logoUrl || `🏫 ${school.name}`, 'Logo Label')}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                        title="Copy text logo"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      School Admin Account Credentials
                    </p>
                    <div className="bg-white border rounded px-3 py-1.5 text-xs font-mono text-slate-800 flex flex-col gap-1">
                      <div className="flex justify-between items-center border-b pb-1 last:border-0 last:pb-0">
                        <span>User: <strong className="text-slate-950 font-bold">{school.adminUsername}</strong></span>
                        <button 
                          type="button"
                          onClick={() => handleCopy(school.adminUsername, 'School Admin Username')}
                          className="text-slate-400 hover:text-indigo-650"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pass: <strong className="text-indigo-700 font-extrabold">{school.adminPassword}</strong></span>
                        <button 
                          type="button"
                          onClick={() => handleCopy(school.adminPassword, 'School Admin Password')}
                          className="text-slate-400 hover:text-indigo-650"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(school.contactMobile || school.contactEmail) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 text-slate-700">
                    {school.contactMobile && (
                      <div className="space-y-1 text-xs">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">📞 Mobile Number</p>
                        <p className="font-semibold text-slate-900">{school.contactMobile}</p>
                      </div>
                    )}
                    {school.contactEmail && (
                      <div className="space-y-1 text-xs">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">✉️ Email Address</p>
                        <p className="font-semibold text-slate-900">{school.contactEmail}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Checklist of Features allocated to this school */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">Provisioned Functional Modules:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(school.activeFeatures).map(([featureName, isEnabled]) => (
                      <label 
                        key={featureName}
                        className={`group flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isEnabled 
                            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                        aria-label={`Toggle feature ${featureName} for school ${school.name}`}
                      >
                        <span className="capitalize font-medium">
                          {featureName.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleFeatureToggle(school.id, featureName as keyof School['activeFeatures'])}
                          className="w-4.5 h-4.5 rounded text-indigo-700 bg-slate-100 border-slate-300 focus:ring-indigo-500 rounded-sm"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Register New School Tenant Card */}
        <div id="register-school-section" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-fit space-y-6">
          <div className="flex items-center gap-2">
            <PlusCircle className="text-indigo-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-950">Add School Tenant</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="school-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                School Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="school-name"
                type="text"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="e.g. Kendriya Vidyalaya No 1"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                required
              />
            </div>

            {/* School Code inputs */}
            <div>
              <label htmlFor="school-code" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                <span>Unique School Access Code <span className="text-rose-500">*</span></span>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                >
                  ⚡ Auto-suggest Code
                </button>
              </label>
              <input
                id="school-code"
                type="text"
                value={newSchoolCode}
                onChange={(e) => setNewSchoolCode(e.target.value.toUpperCase())}
                placeholder="e.g. KV101"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Schools will use this code to unlock their whitelabeled workspace login screen.</p>
            </div>

            {/* Brand primaryColor selection & customized Logo symbol */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="school-color" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Theme Color
                </label>
                <select
                  id="school-color"
                  value={newSchoolColor}
                  onChange={(e) => setNewSchoolColor(e.target.value as School['primaryColor'])}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                >
                  <option value="indigo">🌌 Indigo Blue</option>
                  <option value="orange">🌋 Royal Orange</option>
                  <option value="emerald">🌲 Emerald green</option>
                  <option value="blue">🌊 Ocean Blue</option>
                  <option value="rose">🌸 Rose Pink</option>
                  <option value="amber">🕉️ Warm Amber</option>
                </select>
              </div>

              <div>
                <label htmlFor="school-logo" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Logo / Emoji Text
                </label>
                <input
                  id="school-logo"
                  type="text"
                  value={newSchoolLogo}
                  onChange={(e) => setNewSchoolLogo(e.target.value)}
                  placeholder="e.g. 🏫 DPS Public"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-2">
              <div>
                <label htmlFor="school-city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="school-city"
                  type="text"
                  value={newSchoolCity}
                  onChange={(e) => setNewSchoolCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="school-state" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  State/UT <span className="text-rose-500">*</span>
                </label>
                <input
                  id="school-state"
                  type="text"
                  value={newSchoolState}
                  onChange={(e) => setNewSchoolState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Custom school contact details fields */}
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <div>
                <label htmlFor="contact-mobile" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="contact-mobile"
                  type="tel"
                  value={newContactMobile}
                  onChange={(e) => setNewContactMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. admin@school.edu"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* School Administrator Credentials - REQUIRED BY SPEC */}
            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-indigo-650" />
                <span>Admin Login Credentials</span>
              </p>
              
              <div>
                <label htmlFor="admin-username" className="block text-[10.5px] font-bold text-slate-655 uppercase tracking-wider mb-1">
                  Principal Admin Username / Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="admin-username"
                  type="email"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="principal@yourschool.edu"
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-[10.5px] font-bold text-slate-655 uppercase tracking-wider mb-1 flex justify-between">
                  <span>Pin / Password <span className="text-rose-500">*</span></span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
                      const pass = Array.from({length:6}, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join('') + Math.floor(100+Math.random()*900);
                      setNewAdminPassword(pass);
                    }}
                    className="text-[9.5px] text-indigo-600 font-extrabold hover:underline"
                  >
                    ⚡ Generate Password
                  </button>
                </label>
                <input
                  id="admin-password"
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Feature configuration preset for new school */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                Default Module Authorization
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {Object.keys(selectedFeatures).map((featKey) => (
                  <label key={`new-${featKey}`} className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeatures[featKey as keyof School['activeFeatures']]}
                      onChange={(e) => {
                        setSelectedFeatures({
                          ...selectedFeatures,
                          [featKey]: e.target.checked
                        });
                      }}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500/30"
                    />
                    <span className="capitalize">{featKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

            {formError && (
              <div className="bg-rose-50 text-rose-800 text-xs font-medium p-3 rounded-xl border border-rose-150 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-medium p-3 rounded-xl border border-emerald-150 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 text-white font-semibold text-sm py-3 rounded-xl hover:from-indigo-600 hover:to-indigo-500 transition-colors shadow-sm cursor-pointer"
            >
              Provisions Tenant Domain
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
