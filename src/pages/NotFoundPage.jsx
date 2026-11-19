import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 - Waypoint Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md">
        The requested aviation maintenance navigation route does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Return to Operations Center</span>
      </Link>
    </div>
  );
}
