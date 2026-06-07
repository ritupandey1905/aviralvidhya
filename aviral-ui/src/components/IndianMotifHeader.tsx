/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Flag, Globe } from 'lucide-react';

export default function IndianMotifHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div id="indian-motif-wrapper" className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 text-white rounded-2xl p-6 md:p-8 shadow-xl border-b-4 border-yellow-400">
      
      {/* Decorative Traditional Border Accent (Upper side) */}
      <div id="motif-geometric-dots" className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

      {/* Modern Background Accent Overlay */}
      <div id="motif-decorative-circle-1" className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-400/20 blur-xl"></div>
      <div id="motif-decorative-circle-2" className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-red-400/20 blur-2xl"></div>

      {/* Decorative Border Accent (Lower side) */}
      <div id="motif-geometric-zig-zag" className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-400 opacity-80"></div>

      <div id="motif-content" className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div id="motif-badge" className="inline-flex items-center gap-1.5 bg-yellow-400/30 text-yellow-105 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-yellow-300/40 mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Rashtriya Shiksha Portal ERP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          
          <h1 id="motif-title" className="text-2xl md:text-3.5xl font-extrabold tracking-tight font-sans drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p id="motif-subtitle" className="text-orange-100 mt-2 text-sm md:text-base font-medium max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic National Tricolor Accent Ring */}
        <div id="motif-tricolor-ring" className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 self-start md:self-center">
          <div className="flex flex-col gap-0.5" aria-hidden="true">
            <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-sm"></div>
            <div className="w-8 h-1 bg-white rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-800"></div>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-sm"></div>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-widest text-orange-200">Akaanksha - Samridhi</p>
            <p className="text-xs font-semibold text-white">Digital Schooling ERP Suite</p>
          </div>
        </div>
      </div>
    </div>
  );
}
