import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  ShieldCheck,
  Wrench,
  Package,
  Activity,
  BarChart3,
  Truck,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Server,
  Layers,
  Cpu,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { checkBackendHealth } from '../api/health';
import { API_BASE_URL } from '../api/client';

export default function LandingPage() {
  const [healthData, setHealthData] = useState(null);
  const [checking, setChecking] = useState(true);

  const fetchHealth = async () => {
    setChecking(true);
    const res = await checkBackendHealth();
    setHealthData(res);
    setChecking(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const modules = [
    {
      title: 'Aircraft Fleet & Equipment',
      desc: 'Tail numbers, serial numbers, total flight hours, flight cycles, and airworthiness status.',
      icon: Plane,
      path: '/aircraft',
      tag: 'Fleet',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Maintenance Planning',
      desc: 'A/B/C/D scheduled inspection cycles, intervals, threshold triggers, and automated schedules.',
      icon: Clock,
      path: '/maintenance',
      tag: 'Planning',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      title: 'Work Orders Management',
      desc: 'Technician assignment, priority dispatch, labor hour tracking, and sign-offs.',
      icon: Activity,
      path: '/work-orders',
      tag: 'Operations',
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Spare Parts Inventory',
      desc: 'Aviation-grade spare parts, stock levels, minimum stock alerts, and warehouse bins.',
      icon: Package,
      path: '/inventory',
      tag: 'Logistics',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Maintenance Execution',
      desc: 'Step-by-step task execution, technician remarks, actual labor logs, and digital documentation.',
      icon: Wrench,
      path: '/execution',
      tag: 'Shop Floor',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Regulatory Compliance',
      desc: 'FAA / EASA airworthiness directives (ADs), service bulletins (SBs), and audit trails.',
      icon: ShieldCheck,
      path: '/compliance',
      tag: 'Safety',
      color: 'from-rose-500 to-red-600',
    },
    {
      title: 'ERP & Supply Chain',
      desc: 'Aviation vendors, purchase orders, RFQs, goods receipt, and stock replenishment.',
      icon: Truck,
      path: '/supply-chain',
      tag: 'Procurement',
      color: 'from-teal-500 to-emerald-600',
    },
    {
      title: 'Mobile Field Support',
      desc: 'Optimized touch APIs for flight line technicians and ramp inspectors.',
      icon: Smartphone,
      path: '/mobile',
      tag: 'Field Tech',
      color: 'from-cyan-500 to-sky-600',
    },
    {
      title: 'Analytics & Reporting',
      desc: 'Executive KPIs, fleet availability, MTBF, maintenance expenditure, and audit reports.',
      icon: BarChart3,
      path: '/analytics',
      tag: 'Intelligence',
      color: 'from-fuchsia-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Aviation MRO Platform Foundation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Streamlining Aircraft <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Maintenance & Compliance
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            FlightFix unites fleet airworthiness tracking, scheduled maintenance cycles, work orders,
            aviation spare parts, and regulatory compliance into a unified aerospace operations cockpit.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={fetchHealth}
              disabled={checking}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${checking ? 'animate-spin' : ''}`} />
              <span>Verify Backend API</span>
            </button>
          </div>
        </div>

        {/* Live Backend Connection Status Card */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Backend Environment</span>
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-sm font-semibold text-white">Render Live Cloud</div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5" title={API_BASE_URL}>
              {API_BASE_URL}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Database</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-sm font-semibold text-white">Supabase PostgreSQL</div>
            <div className="text-[11px] text-slate-400 mt-0.5">310 Automated Tests Verified</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">API Health Status</span>
              {checking ? (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              ) : healthData?.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  checking
                    ? 'bg-amber-400 animate-pulse'
                    : healthData?.success
                    ? 'bg-emerald-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-sm font-semibold text-white">
                {checking ? 'Checking Health...' : healthData?.success ? 'Operational (200 OK)' : 'Standby / Waking up'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {healthData?.latency ? `Response time: ${healthData.latency}ms` : 'Endpoint: /api/health/'}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Integrated MRO Modules</h2>
            <p className="text-sm text-slate-400 mt-1">
              Engineered according to FAA, EASA, and Part 145 aircraft maintenance guidelines.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
            10 Backend Apps Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                to={m.path}
                className="group relative p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${m.color} flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60">
                      {m.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Technical Architecture Stack</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Designed for high reliability, airworthiness traceability, and low-latency response times.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Cpu className="w-6 h-6 mx-auto text-blue-400 mb-2" />
            <div className="text-sm font-semibold text-white">React 18 + Vite</div>
            <div className="text-xs text-slate-400 mt-1">Modern UI Runtime</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Server className="w-6 h-6 mx-auto text-indigo-400 mb-2" />
            <div className="text-sm font-semibold text-white">Django REST API</div>
            <div className="text-xs text-slate-400 mt-1">Render Production</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Database className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
            <div className="text-sm font-semibold text-white">PostgreSQL</div>
            <div className="text-xs text-slate-400 mt-1">Supabase Cloud</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <ShieldCheck className="w-6 h-6 mx-auto text-rose-400 mb-2" />
            <div className="text-sm font-semibold text-white">JWT + RBAC</div>
            <div className="text-xs text-slate-400 mt-1">Role-Based Security</div>
          </div>
        </div>
      </section>
    </div>
  );
}
