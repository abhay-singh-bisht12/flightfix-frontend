import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, ROLES, ROLE_LABELS } from '../context/AuthContext';
import analyticsApi from '../api/analytics';
import mobileApi from '../api/mobile';
import ManagementDashboard from '../components/dashboard/ManagementDashboard';
import TechnicianDashboard from '../components/dashboard/TechnicianDashboard';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

export default function DashboardPlaceholder() {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isTechnician = role === ROLES.FIELD_TECHNICIAN;

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let result;
      if (isTechnician) {
        // Field technicians use dedicated line station operations dashboard
        result = await mobileApi.getTechnicianDashboard();
      } else {
        // Management roles (ADMIN, SAFETY_OFFICER, CONTRACTS_MANAGER) use management overview
        result = await analyticsApi.getDashboard();
      }

      setData(result);
    } catch (err) {
      console.error('FlightFix Dashboard Error:', err);
      let errMsg = 'Unable to load operational metrics from backend.';
      if (err.response?.status === 403) {
        errMsg = 'Access Forbidden (403): Your role is not authorized to access this dashboard view.';
      } else if (err.response?.status === 401) {
        errMsg = 'Session Expired (401): Please re-authenticate to refresh your workspace.';
      } else if (err.response?.data?.detail) {
        errMsg = `Unable to load operational metrics: ${err.response.data.detail}`;
      } else if (err.message) {
        errMsg = `Unable to load operational metrics: ${err.message}`;
      }
      setError(errMsg);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isTechnician]);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      {/* Top Banner: User Identity & Refresh Controls (Clean, professional, NO technical debug telemetry) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome, {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'Operator'}
            </h1>
            <span className="text-[11px] bg-blue-500/15 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Workspace</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Assigned Clearance: <strong className="text-blue-400">{ROLE_LABELS[role] || role}</strong> &bull; Username:{' '}
            <span className="font-mono text-slate-300">@{user?.username}</span> &bull; Email: {user?.email}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <div className="flex items-start space-x-3 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Operational Data Unavailable</h3>
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => fetchDashboardData(false)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Content Area: Skeleton, Technician View, or Management View */}
      {loading ? (
        <DashboardSkeleton />
      ) : data ? (
        isTechnician ? (
          <TechnicianDashboard data={data} />
        ) : (
          <ManagementDashboard data={data} />
        )
      ) : null}
    </div>
  );
}
