/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Globe } from 'lucide-react';

export default function IndianMotifHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div id="aviral-brand-header" className="glass-panel relative overflow-hidden rounded-[32px] p-8 shadow-glow border border-cyan-500/10">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-700 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            AviralVidhya Premium ERP
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">Empowering</p>
            <p className="mt-3 font-semibold text-cyan-950">Digital Education</p>
          </div>
          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-600">Streamlined</p>
            <p className="mt-3 font-semibold text-violet-950">School Administration</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900">
          <Globe className="w-4 h-4 text-cyan-600" />
          Seamless Parent-Teacher Connection
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-slate-900">
          <Sparkles className="w-4 h-4 text-violet-600" />
          Built for school leaders, faculty and parents
        </span>
      </div>
    </div>
  );
}
