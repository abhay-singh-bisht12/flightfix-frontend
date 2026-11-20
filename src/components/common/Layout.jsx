import React from 'react';
import Navbar from './Navbar';
import { Shield, GitBranch, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ children }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">FlightFix</span>
            <span>&bull; Aviation Maintenance Management System (MRO)</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>FAA Part 145 & EASA Compliant</span>
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
