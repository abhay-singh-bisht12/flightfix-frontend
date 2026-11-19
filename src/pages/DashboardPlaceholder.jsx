import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Wrench,
  ShieldCheck,
  FileText,
  Activity,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import { checkBackendHealth } from '../api/health';
import { API_BASE_URL } from '../api/client';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

export default function DashboardPlaceholder() {
  const { user, role, hasRole } = useAuth();
  const [healthStatus, setHealthStatus] = useState({ checking: true, data: null });

  const loadStatus = async () => {
    setHealthStatus({ checking: true, data: null });
    const res = await checkBackendHealth();
    setHealthStatus({ checking: false, data: res });
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const stats = [
    { label: 'Active Aircraft Fleet', value: '18 / 20', sub: '2 in scheduled maintenance', icon: Plane, color: 'text-blue-400', badge: 'ACTIVE' },
    { label: 'Open Work Orders', value: '7 Active', sub: '2 high-priority line items', icon: Activity, color: 'text-amber-400', badge: 'PENDING' },
    { label: 'A/B/C/D Checks', value: '4 Scheduled', sub: 'Next check in 48 hours', icon: Clock, color: 'text-indigo-400', badge: 'IN_PROGRESS' },
    { label: 'Parts Inventory', value: '142 Items', sub: '3 low-stock alert thresholds', icon: Package, color: 'text-emerald-400', badge: 'HEALTHY' },
  ];

  const quickNav = [
    { name: 'Aircraft Registry', path: '/aircraft', icon: Plane, count: 'Fleet Models & Equipment' },
    { name: 'Maintenance Planning', path: '/maintenance', icon: Clock, count: 'Schedules & Work Packages' },
    { name: 'Work Orders', path: '/work-orders', icon: Activity, count: 'Dispatch & Work Cards' },
    { name: 'Spare Parts Inventory', path: '/inventory', icon: Package, count: 'Stock & Bin Locations' },
    { name: 'Shop Execution', path: '/execution', icon: Wrench, count: 'Technician Labor Logs' },
    { name: 'Compliance & ADs', path: '/compliance', icon: ShieldCheck, count: 'Regulatory Directives' },
    { name: 'Supply Chain & POs', path: '/supply-chain', icon: FileText, count: 'Vendor Procurement' },
    { name: 'Field Tech Portal', path: '/mobile', icon: SlidersHorizontal, count: 'Mobile Touch Interface' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with User Clearance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {user?.first_name ? `${user.first_name} ${user.last_name}` : 'Operator'}
            </h1>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>JWT Authenticated</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Assigned Role: <strong className="text-blue-400">{ROLE_LABELS[role] || role}</strong> &bull; Username:{' '}
            <span className="font-mono text-slate-300">@{user?.username}</span> &bull; Email: {user?.email}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadStatus}
            disabled={healthStatus.checking}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthStatus.checking ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Backend Live Telemetry Status Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span
            className={`w-3 h-3 rounded-full ${
              healthStatus.checking
                ? 'bg-amber-400 animate-ping'
                : healthStatus.data?.success
                ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50'
                : 'bg-rose-400'
            }`}
          />
          <div>
            <span className="font-semibold text-slate-200">Production Backend: </span>
            <span className="font-mono text-slate-300">{API_BASE_URL}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <span>Latency: <strong className="text-slate-200">{healthStatus.data?.latency ? `${healthStatus.data.latency}ms` : '--'}</strong></span>
          <span>Database: <strong className="text-emerald-400">PostgreSQL (Supabase)</strong></span>
          <span>Security: <strong className="text-blue-400">JWT RBAC</strong></span>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{s.label}</span>
                <StatusBadge status={s.badge} />
              </div>
              <div className="mt-4 flex items-baseline space-x-3">
                <div className="text-2xl font-bold text-white tracking-tight">{s.value}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{s.sub}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Module Management Workspaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-white group-hover:bg-blue-600 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{item.count}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400">
                  <span>Open workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
