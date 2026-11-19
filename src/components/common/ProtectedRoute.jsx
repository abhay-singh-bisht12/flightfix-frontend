import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating with FlightFix security authority..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(role);
    if (!hasPermission) {
      return (
        <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Clearance Restricted</h2>
          <p className="text-xs text-slate-400">
            Your current role (<strong className="text-slate-200">{ROLE_LABELS[role] || role}</strong>) does not have
            authorization to access this FlightFix workspace.
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
            Required Clearance: {allowedRoles.join(', ')}
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      );
    }
  }

  return children;
}
