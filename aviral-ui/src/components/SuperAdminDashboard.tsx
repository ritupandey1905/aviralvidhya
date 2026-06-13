/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { School } from '../types';
import { 
  Building2, 
  Settings2, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  MapPin, 
  Eye, 
  Palette, 
  Key, 
  Clipboard, 
  IndianRupee, 
  Activity, 
  TrendingDown,
  Sparkles,
  Search,
  Globe
} from 'lucide-react';

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
  const [activeView, setActiveView] = useState<'admin' | 'school' | 'parent'>('admin');
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
    <div id="super-admin-root" className="space-y-6 animate-fade-in flex flex-col flex-1">
      
      {/* Navigation Sub-Tabs bar */}
      <div className="flex border-b border-slate-200/80 bg-white p-1 rounded-2xl shadow-sm w-fit gap-1">
        <button 
          onClick={() => setActiveView('admin')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeView === 'admin' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Tenant Console
        </button>
        <button 
          onClick={() => setActiveView('school')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeView === 'school' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          School Logs Proxy
        </button>
        <button 
          onClick={() => setActiveView('parent')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeView === 'parent' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Parent View Proxy
        </button>
      </div>

      {activeView === 'admin' && (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Overview Cards Grid */}
          <div id="super-admin-status-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div id="stat-card-schools" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="icon-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tenants</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{schools.length} Schools</h3>
                </div>
              </div>
            </div>

            <div id="stat-card-revenue" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <IndianRupee className="icon-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Collected</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">₹24,50,000</h3>
                </div>
              </div>
            </div>

            <div id="stat-card-expenses" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <TrendingDown className="icon-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Expenses</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">₹12,30,000</h3>
                </div>
              </div>
            </div>

            <div id="stat-card-traffic" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Activity className="icon-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Sessions</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">45,231 Active</h3>
                </div>
              </div>
            </div>
          </div>

          {copiedText && (
            <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-semibold z-50 animate-bounce shadow-md">
              Copied {copiedText} to clipboard!
            </div>
          )}

          {/* Main Content Layout */}
          <div id="super-admin-workspace" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Registered Schools Feature Manager */}
            <div id="schools-directory-section" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Registered School Directory</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Edit license modules and fehér label parameters per tenant.</p>
                </div>
                <Settings2 className="w-4.5 h-4.5 text-blue-600" />
              </div>

              <div className="divide-y divide-slate-100 px-6 py-2">
                {schools.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    No school tenants registered. Fill the form to add a school context.
                  </div>
                ) : (
                  schools.map((school) => (
                    <div id={`school-rights-${school.id}`} key={school.id} className="py-6 space-y-4">
                      {/* Header block */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-slate-900 flex flex-wrap items-center gap-2">
                            <span>{school.name}</span>
                            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                              CODE: {school.schoolCode}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{school.city}, {school.state} &bull; Reg: {new Date(school.registeredAt).toLocaleDateString()}</span>
                          </p>
                        </div>

                        {/* Theme Badge */}
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color:</span>
                          <span className={`w-2.5 h-2.5 rounded-full bg-${school.primaryColor}-500 inline-block`} title={school.primaryColor}></span>
                          <span className="text-[11px] font-bold text-slate-700 capitalize font-mono">
                            {school.primaryColor}
                          </span>
                        </div>
                      </div>

                      {/* Whitelabel / Login Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                        {/* Text logo */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-slate-400" />
                            White-labeled Logo Name
                          </p>
                          <div className="bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between shadow-subtle">
                            <p>{school.logoUrl || `🏫 ${school.name}`}</p>
                            <button 
                              onClick={() => handleCopy(school.logoUrl || `🏫 ${school.name}`, 'Logo Label')}
                              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Copy Logo Label"
                            >
                              <Clipboard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Login Creds */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-blue-500" />
                            Admin Console Credentials
                          </p>
                          <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 flex flex-col gap-1.5 shadow-subtle">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                              <span>User: <strong className="text-slate-900 font-bold">{school.adminUsername}</strong></span>
                              <button 
                                type="button"
                                onClick={() => handleCopy(school.adminUsername, 'School Admin Username')}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Pass: <strong className="text-blue-600 font-bold">{school.adminPassword}</strong></span>
                              <button 
                                type="button"
                                onClick={() => handleCopy(school.adminPassword, 'School Admin Password')}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                              >
                                <Clipboard className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Mobile & Email */}
                      {(school.contactMobile || school.contactEmail) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                          {school.contactMobile && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📞 Contact Mobile</span>
                              <p className="font-bold text-slate-800">{school.contactMobile}</p>
                            </div>
                          )}
                          {school.contactEmail && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">✉️ Support Email</span>
                              <p className="font-bold text-slate-850 truncate">{school.contactEmail}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Features Switches */}
                      <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provisioned Modules</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {Object.entries(school.activeFeatures).map(([featureName, isEnabled]) => (
                            <label 
                              key={featureName}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-white text-xs cursor-pointer transition-all hover:border-slate-350 shadow-subtle"
                            >
                              <span className="capitalize font-semibold text-slate-700 truncate pr-1">
                                {featureName.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              
                              {/* Custom Toggle Switch */}
                              <div 
                                onClick={() => handleFeatureToggle(school.id, featureName as keyof School['activeFeatures'])}
                                className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                                  isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all duration-200 ${
                                  isEnabled ? 'left-4' : 'left-0.5'
                                }`} />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Register New School Tenant Card */}
            <div id="register-school-section" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 flex flex-col h-fit">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <PlusCircle className="text-blue-600 w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-900">Provision Tenant</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="school-name" className="form-label">School Name *</label>
                  <input
                    id="school-name"
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="form-input"
                    required
                  />
                </div>

                {/* School Code inputs */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="school-code" className="form-label">School Access Code *</label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[10px] text-blue-600 font-bold hover:underline mb-1.5 cursor-pointer"
                    >
                      ⚡ Generate Code
                    </button>
                  </div>
                  <input
                    id="school-code"
                    type="text"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DPS101"
                    className="form-input font-mono font-bold tracking-widest text-slate-900"
                    required
                  />
                </div>

                {/* Color & Logo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="school-color" className="form-label">Theme Color</label>
                    <select
                      id="school-color"
                      value={newSchoolColor}
                      onChange={(e) => setNewSchoolColor(e.target.value as School['primaryColor'])}
                      className="form-input bg-white"
                    >
                      <option value="indigo">🌌 Indigo Blue</option>
                      <option value="orange">🌋 Royal Orange</option>
                      <option value="emerald">🌲 Emerald green</option>
                      <option value="blue">🌊 Ocean Blue</option>
                      <option value="rose">🌸 Rose Pink</option>
                      <option value="amber">🕉️ Warm Amber</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="school-logo" className="form-label">Logo / Emoji</label>
                    <input
                      id="school-logo"
                      type="text"
                      value={newSchoolLogo}
                      onChange={(e) => setNewSchoolLogo(e.target.value)}
                      placeholder="e.g. 🏫 DPS Public"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="school-city" className="form-label">City *</label>
                    <input
                      id="school-city"
                      type="text"
                      value={newSchoolCity}
                      onChange={(e) => setNewSchoolCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="school-state" className="form-label">State *</label>
                    <input
                      id="school-state"
                      type="text"
                      value={newSchoolState}
                      onChange={(e) => setNewSchoolState(e.target.value)}
                      placeholder="e.g. Delhi"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Contact details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="contact-mobile" className="form-label">Mobile</label>
                    <input
                      id="contact-mobile"
                      type="tel"
                      value={newContactMobile}
                      onChange={(e) => setNewContactMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="form-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="form-label">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="e.g. admin@school.edu"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                {/* Administrator Credentials */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                    <span>Admin Credentials</span>
                  </p>
                  
                  <div className="space-y-1">
                    <label htmlFor="admin-username" className="text-[10px] text-slate-650 font-bold uppercase tracking-wider block">Username ID *</label>
                    <input
                      id="admin-username"
                      type="email"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="principal@school.edu"
                      className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label htmlFor="admin-password" className="text-[10px] text-slate-650 font-bold uppercase tracking-wider block">Password *</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          const alphabet = 'abcdefghijklmnopqrstuvwxyz';
                          const pass = Array.from({length:6}, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join('') + Math.floor(100+Math.random()*900);
                          setNewAdminPassword(pass);
                        }}
                        className="text-[9px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        ⚡ Generate
                      </button>
                    </div>
                    <input
                      id="admin-password"
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="e.g. adminPass"
                      className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Feature Preset selection */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Provision Modules Access
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.keys(selectedFeatures).map((featKey) => (
                      <label key={`new-${featKey}`} className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFeatures[featKey as keyof School['activeFeatures']]}
                          onChange={(e) => {
                            setSelectedFeatures({
                              ...selectedFeatures,
                              [featKey]: e.target.checked
                            });
                          }}
                          className="w-4 h-4 rounded text-blue-600 border-slate-350 focus:ring-blue-500/20"
                        />
                        <span className="capitalize text-[11px] truncate">{featKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="bg-rose-50 text-rose-800 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  Create Tenant Workspace
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {activeView === 'school' && (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col justify-center items-center">
          <Building2 className="w-10 h-10 text-slate-400 mb-3" />
          <h2 className="text-base font-bold text-slate-800">School Logs Proxy Mode</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">This dashboard allows Super Admins to view audit trails and live transaction logs for individual school namespaces.</p>
        </div>
      )}

      {activeView === 'parent' && (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col justify-center items-center">
          <Globe className="w-10 h-10 text-slate-400 mb-3" />
          <h2 className="text-base font-bold text-slate-800">Parent View Proxy Mode</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Simulate parent dashboards to review circular memo layouts and invoice payment flows.</p>
        </div>
      )}

    </div>
  );
}
