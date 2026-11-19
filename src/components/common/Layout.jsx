import React from 'react';
import Navbar from './Navbar';
import { Shield, ExternalLink, GitBranch, Terminal } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">FlightFix</span>
            <span>&bull; Aviation Maintenance Management System (MRO)</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Backend: {API_BASE_URL}</span>
            </span>
            <span className="flex items-center space-x-1">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>v1.0.0</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
