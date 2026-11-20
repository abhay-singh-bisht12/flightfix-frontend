import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plane,
  ShieldCheck,
  Wrench,
  Package,
  Activity,
  BarChart3,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  UserCheck,
  FileCheck2,
  Truck,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated operators directly to the application dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Informational feature highlights (NO protected data exposed)
  const features = [
    {
      title: 'Fleet & Aircraft Management',
      desc: 'Centralized registry tracking registration tails, manufacturer serials, total flight hours, flight cycles, and airworthiness status.',
      icon: Plane,
      tag: 'Fleet Operations',
      color: 'from-blue-500 to-cyan-500',
      capabilities: ['Tail & serial registry', 'Flight hours & cycle logs', 'Airworthiness certification'],
    },
    {
      title: 'Maintenance Planning',
      desc: 'Structured planning for A/B/C/D scheduled inspection cycles, threshold intervals, and automated maintenance schedules.',
      icon: Clock,
      tag: 'Planning & Scheduling',
      color: 'from-indigo-500 to-blue-600',
      capabilities: ['A/B/C/D inspection intervals', 'Recurring maintenance schedules', 'Threshold trigger alerts'],
    },
    {
      title: 'Work Order Management',
      desc: 'End-to-end work order dispatch, technician assignment, priority classification, and supervisory completion sign-offs.',
      icon: Activity,
      tag: 'Operations Dispatch',
      color: 'from-violet-500 to-purple-600',
      capabilities: ['Technician task assignment', 'AOG & rush priority tiers', 'Labor hours & status tracking'],
    },
    {
      title: 'Spare Parts & Inventory',
      desc: 'Aviation-grade spare parts catalog, real-time stock levels, warehouse bin locations, and automated low-stock reorder alerts.',
      icon: Package,
      tag: 'Parts & Warehouse',
      color: 'from-emerald-500 to-teal-600',
      capabilities: ['Minimum stock warnings', 'Bin & warehouse locations', 'Goods issue & receipt logging'],
    },
    {
      title: 'Compliance Management',
      desc: 'Full regulatory conformity tracking for FAA Airworthiness Directives (ADs), EASA Service Bulletins, and physical verification audit logs.',
      icon: ShieldCheck,
      tag: 'Regulatory Safety',
      color: 'from-rose-500 to-red-600',
      capabilities: ['Mandatory AD & SB tracking', 'Physical verification dossiers', 'Overdue compliance alerts'],
    },
    {
      title: 'Analytics & Reporting',
      desc: 'Executive operational metrics, fleet readiness ratios, maintenance labor analytics, and downloadable compliance dossiers.',
      icon: BarChart3,
      tag: 'Executive Intelligence',
      color: 'from-fuchsia-500 to-pink-600',
      capabilities: ['Cross-fleet readiness KPIs', 'Technician performance roster', 'CSV & JSON report dossiers'],
    },
  ];

  const operationalPillars = [
    {
      title: 'Role-Based Access Control',
      desc: 'Tiered security clearances separating Field Technicians, Safety Officers, Contracts Managers, and Administrators.',
      icon: Users,
    },
    {
      title: 'Airworthiness Traceability',
      desc: 'Immutable audit records logging every maintenance execution, inspection finding, and replacement part installation.',
      icon: FileCheck2,
    },
    {
      title: 'Integrated Supply Chain',
      desc: 'Seamless purchase requisitioning, vendor quotation tracking, and direct inventory stock synchronization on receipt.',
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-20 py-4 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Commercial & Military Aviation MRO</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Streamlining Aircraft <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Maintenance & Compliance
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            FlightFix unites fleet airworthiness tracking, scheduled maintenance cycles, digital work orders,
            aviation spare parts, and regulatory compliance into a unified aerospace operations cockpit.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>

        {/* Enterprise Value Metrics Row (NO developer diagnostic data) */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Regulatory Standards
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-base font-bold text-white">FAA Part 145 & EASA</div>
            <div className="text-xs text-slate-400 mt-1">Conformity with global civil aviation mandates</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Airworthiness Cockpit
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-base font-bold text-white">Zero-Loss Traceability</div>
            <div className="text-xs text-slate-400 mt-1">Logged technician remarks & verified sign-offs</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Workforce Security
              </span>
              <UserCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-base font-bold text-white">Role-Based Clearance</div>
            <div className="text-xs text-slate-400 mt-1">Dedicated consoles for tech, safety & managers</div>
          </div>
        </div>
      </section>

      {/* Core Public Product Feature Highlights */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Integrated Aerospace MRO Platform
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to coordinate every dimension of aircraft maintenance from hangar floor to executive review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-4">
                    {f.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-center space-x-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <Link
                    to="/login"
                    className="flex items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>Sign in to access workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operational Pillars Section */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
        <div className="max-w-xl">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Built for High-Stakes Aerospace Operations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Engineered around the operational realities of air carriers, certified repair stations, and military squadrons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {operationalPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/30 border border-blue-500/30 text-center space-y-6 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ready to Modernize Your Aircraft Maintenance Operations?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Sign in to access your assigned operational workspace or create an account to begin.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            Create FlightFix Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            Sign In to Existing Workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
