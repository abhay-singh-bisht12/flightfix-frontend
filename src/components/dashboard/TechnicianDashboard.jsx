import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  Activity,
  ShieldCheck,
  Plane,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  User,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function TechnicianDashboard({ data }) {
  if (!data) return null;

  const {
    technician = {},
    summary = {},
    assigned_aircraft = [],
    tasks = [],
    work_orders = [],
    recent_executions = [],
  } = data;

  const {
    assigned_schedules = 0,
    pending_tasks = 0,
    open_work_orders = 0,
    pending_compliance = 0,
  } = summary;

  return (
    <div className="space-y-8">
      {/* Field Line Station Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Field Maintenance Operations Terminal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Line Station: {technician.name || technician.username}
            </h2>
            <p className="text-xs text-slate-300">
              Assigned Base: Flight Line & Maintenance Hangars &bull; Station ID: #{technician.id} &bull; Contact: {technician.email}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/mobile"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mobile Touch Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Field Technician Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Work Orders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Work Orders</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white">{open_work_orders}</div>
            <span className="text-[11px] text-slate-400">Active Work Packages</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Status:</span>
            <span className="text-violet-400 font-semibold">{open_work_orders > 0 ? 'Action Required' : 'Up to Date'}</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white">{pending_tasks}</div>
            <span className="text-[11px] text-slate-400">Pending Execution Steps</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Queue:</span>
            <span className="text-sky-400 font-semibold">{pending_tasks > 0 ? 'Tasks Pending' : 'Clear Queue'}</span>
          </div>
        </div>

        {/* Assigned Schedules */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Schedules</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white">{assigned_schedules}</div>
            <span className="text-[11px] text-slate-400">Maintenance Cycles</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Checks:</span>
            <span className="text-indigo-400 font-semibold">Planned Inspections</span>
          </div>
        </div>

        {/* Compliance Sign-offs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white">{pending_compliance}</div>
            <span className="text-[11px] text-slate-400">Awaiting Sign-Off / Verification</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Airworthiness:</span>
            <span className="text-amber-400 font-semibold">{pending_compliance > 0 ? 'Verification Needed' : 'Compliant'}</span>
          </div>
        </div>
      </div>

      {/* Main Content: Assigned Work Orders & Task Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Work Orders Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assigned Work Orders</h3>
                  <p className="text-xs text-slate-400">Dispatched work packages for your shift</p>
                </div>
              </div>
              <Link to="/work-orders" className="text-xs text-violet-400 hover:text-violet-300 flex items-center space-x-1">
                <span>All Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List or Empty State */}
            {work_orders.length > 0 ? (
              <div className="space-y-3 mt-4">
                {work_orders.map((wo) => (
                  <div
                    key={wo.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-400">{wo.work_order_number}</span>
                      <StatusBadge status={wo.status} label={wo.status_display} />
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1.5">{wo.title}</h4>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                      <span>Tail: <strong className="text-slate-200">{wo.aircraft_registration || 'Unassigned'}</strong></span>
                      <span>Priority: <strong className="text-amber-400">{wo.priority_display || wo.priority}</strong></span>
                      {wo.estimated_hours && <span>Est: {wo.estimated_hours} hrs</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center my-4">
                <Wrench className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">No Active Work Orders Assigned</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  New maintenance packages assigned to you by shift supervisors will appear here automatically.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Shift Queue:</span>
            <span className="font-semibold text-slate-300">{work_orders.length} Package(s) Loaded</span>
          </div>
        </div>

        {/* Maintenance Tasks Queue Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pending Execution Tasks</h3>
                  <p className="text-xs text-slate-400">Inspection steps & component checks</p>
                </div>
              </div>
              <Link to="/execution" className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1">
                <span>Execution Records</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List or Empty State */}
            {tasks.length > 0 ? (
              <div className="space-y-3 mt-4">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{t.schedule_title || `Task #${t.id}`}</span>
                      <StatusBadge status={t.status} label={t.status_display} />
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{t.task_name}</h4>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                      <span>Aircraft: <strong className="text-slate-200">{t.aircraft_registration || 'N/A'}</strong></span>
                      {t.due_date && <span>Due: <strong className="text-amber-400">{t.due_date}</strong></span>}
                      {t.estimated_hours && <span>Labor: {t.estimated_hours}h</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center my-4">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">All Scheduled Steps Cleared</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You have no pending scheduled task steps in your queue.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Inspection Tasks:</span>
            <span className="font-semibold text-slate-300">{tasks.length} Step(s) Pending</span>
          </div>
        </div>
      </div>

      {/* Row 3: Assigned Aircraft Fleet Line & Parts Lookup Fast Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Aircraft */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Line Maintenance Aircraft</h3>
                <p className="text-xs text-slate-400">Aircraft linked to your current work queue</p>
              </div>
            </div>
            <Link to="/aircraft" className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
              <span>Fleet Registry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assigned_aircraft.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {assigned_aircraft.map((ac) => (
                <div key={ac.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-white">{ac.registration_number}</span>
                    <p className="text-xs text-slate-400">{ac.model} &bull; SN: {ac.serial_number}</p>
                  </div>
                  <StatusBadge status={ac.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
              No specific aircraft assigned directly to your shift queue at this moment.
            </div>
          )}
        </div>

        {/* Technician Quick Tool Links */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Technician Tools</h3>
            <p className="text-xs text-slate-400 mb-4">Ramp & hangar field utilities</p>

            <div className="space-y-2.5">
              <Link
                to="/inventory"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 group transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Check Spare Parts & Bins</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                to="/compliance"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 group transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>View AD Directives & SBs</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>

              <Link
                to="/execution"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 group transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Log Work & Sign-Off</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <span>Safety Rule: Ensure all steps have digital sign-offs before aircraft release.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
