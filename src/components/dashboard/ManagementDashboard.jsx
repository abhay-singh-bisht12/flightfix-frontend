import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Clock,
  Activity,
  Package,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Wrench,
  FileText,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  ChevronRight,
  Boxes,
  Layers,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ManagementDashboard({ data }) {
  if (!data) return null;

  const {
    total_aircraft = 0,
    active_aircraft = 0,
    total_maintenance_schedules = 0,
    pending_maintenance_schedules = 0,
    overdue_maintenance_schedules = 0,
    completed_maintenance_schedules = 0,
    total_work_orders = 0,
    open_work_orders = 0,
    completed_work_orders = 0,
    total_maintenance_executions = 0,
    total_spare_parts = 0,
    low_stock_spare_parts = 0,
    out_of_stock_spare_parts = 0,
    open_compliance_requirements = 0,
    non_compliant_requirements = 0,
    expired_requirements = 0,
    total_suppliers = 0,
    active_suppliers = 0,
    purchase_orders_by_status = {},
  } = data;

  const inactiveAircraft = Math.max(0, total_aircraft - active_aircraft);
  const woCompletionRate = total_work_orders > 0
    ? Math.round((completed_work_orders / total_work_orders) * 100)
    : 0;

  const complianceAlertCount = non_compliant_requirements + expired_requirements;

  const quickNav = [
    { name: 'Aircraft Fleet', path: '/aircraft', icon: Plane, label: `${total_aircraft} Units` },
    { name: 'Maintenance Planning', path: '/maintenance', icon: Clock, label: `${total_maintenance_schedules} Schedules` },
    { name: 'Work Orders', path: '/work-orders', icon: Activity, label: `${open_work_orders} Open` },
    { name: 'Spare Parts Inventory', path: '/inventory', icon: Package, label: `${total_spare_parts} SKUs` },
    { name: 'Maintenance Execution', path: '/execution', icon: Wrench, label: `${total_maintenance_executions} Logs` },
    { name: 'Regulatory Compliance', path: '/compliance', icon: ShieldCheck, label: `${open_compliance_requirements} Directives` },
    { name: 'Supply Chain & Vendors', path: '/supply-chain', icon: Truck, label: `${active_suppliers} Active` },
    { name: 'Analytics & Reporting', path: '/analytics', icon: TrendingUp, label: 'KPIs & Reports' },
  ];

  return (
    <div className="space-y-8">
      {/* Critical Operational Alerts Banner (only shown if critical items exist) */}
      {(overdue_maintenance_schedules > 0 || complianceAlertCount > 0 || out_of_stock_spare_parts > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="font-semibold text-white">Active Operational Notices: </strong>
              <span>
                {overdue_maintenance_schedules > 0 && `${overdue_maintenance_schedules} overdue maintenance schedule(s). `}
                {complianceAlertCount > 0 && `${complianceAlertCount} compliance alert(s). `}
                {out_of_stock_spare_parts > 0 && `${out_of_stock_spare_parts} out-of-stock part(s).`}
              </span>
            </div>
          </div>
          <Link
            to="/compliance"
            className="inline-flex items-center space-x-1 text-amber-300 hover:text-white font-semibold underline underline-offset-4"
          >
            <span>Review Compliance Directives</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Grid Row 1: Fleet & Maintenance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Readiness Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Fleet Airworthiness & Readiness</h2>
                  <p className="text-xs text-slate-400">Aircraft operational statuses</p>
                </div>
              </div>
              <Link to="/aircraft" className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>Manage Fleet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Fleet</span>
                <div className="text-2xl font-extrabold text-white mt-1">{total_aircraft}</div>
                <span className="text-[10px] text-slate-500">Registered</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Airworthy</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{active_aircraft}</div>
                <span className="text-[10px] text-emerald-500/80">Active in Service</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">In Shop / Offline</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{inactiveAircraft}</div>
                <span className="text-[10px] text-slate-500">Scheduled / Grounded</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Availability Index:</span>
            <span className="font-semibold text-white font-mono">
              {total_aircraft > 0 ? `${Math.round((active_aircraft / total_aircraft) * 100)}% Available` : '0% (No Aircraft)'}
            </span>
          </div>
        </div>

        {/* Maintenance Planning & Execution Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Maintenance Inspection Cycles</h2>
                  <p className="text-xs text-slate-400">A/B/C/D checks & execution records</p>
                </div>
              </div>
              <Link to="/maintenance" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                <span>View Schedules</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2.5 my-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Total</span>
                <div className="text-xl font-bold text-white mt-1">{total_maintenance_schedules}</div>
                <span className="text-[9px] text-slate-500">Schedules</span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-center">
                <span className="text-[10px] font-medium text-sky-400 uppercase">Pending</span>
                <div className="text-xl font-bold text-sky-400 mt-1">{pending_maintenance_schedules}</div>
                <span className="text-[9px] text-sky-500/80">In Progress</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[10px] font-medium text-rose-400 uppercase">Overdue</span>
                <div className="text-xl font-bold text-rose-400 mt-1">{overdue_maintenance_schedules}</div>
                <span className="text-[9px] text-rose-500/80">Past Due</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                <span className="text-[10px] font-medium text-emerald-400 uppercase">Completed</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{completed_maintenance_schedules}</div>
                <span className="text-[9px] text-emerald-500/80">Signed Off</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Maintenance Executions Signed:</span>
            <span className="font-semibold text-indigo-400 font-mono">{total_maintenance_executions} Logged Records</span>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Work Orders & Spare Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Orders Lifecycle Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Work Order Management</h2>
                  <p className="text-xs text-slate-400">Dispatch, technician queues & sign-offs</p>
                </div>
              </div>
              <Link to="/work-orders" className="text-xs text-violet-400 hover:text-violet-300 flex items-center space-x-1">
                <span>Work Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Created</span>
                <div className="text-2xl font-extrabold text-white mt-1">{total_work_orders}</div>
                <span className="text-[10px] text-slate-500">All Time</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Active Open</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{open_work_orders}</div>
                <span className="text-[10px] text-amber-500/80">In Shop Queue</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Completed</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{completed_work_orders}</div>
                <span className="text-[10px] text-emerald-500/80">Released</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Overall Completion Rate:</span>
                <span className="font-semibold text-white font-mono">{woCompletionRate}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${woCompletionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Shop Floor Status:</span>
            <span className="font-semibold text-slate-300">
              {open_work_orders === 0 ? 'All Work Orders Closed' : `${open_work_orders} Active in Queue`}
            </span>
          </div>
        </div>

        {/* Spare Parts Logistics Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Spare Parts Inventory</h2>
                  <p className="text-xs text-slate-400">Stock levels & warehouse bins</p>
                </div>
              </div>
              <Link to="/inventory" className="text-xs text-teal-400 hover:text-teal-300 flex items-center space-x-1">
                <span>View Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total SKUs</span>
                <div className="text-2xl font-extrabold text-white mt-1">{total_spare_parts}</div>
                <span className="text-[10px] text-slate-500">Catalogued</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Low Stock</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{low_stock_spare_parts}</div>
                <span className="text-[10px] text-amber-500/80">Below Threshold</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">Out of Stock</span>
                <div className="text-2xl font-extrabold text-rose-400 mt-1">{out_of_stock_spare_parts}</div>
                <span className="text-[10px] text-rose-500/80">Critical Depletion</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Logistics Stock Health:</span>
            <span className="font-semibold text-slate-300">
              {out_of_stock_spare_parts > 0 ? (
                <span className="text-rose-400">Reorders Urgently Required</span>
              ) : low_stock_spare_parts > 0 ? (
                <span className="text-amber-400">Replenishment Recommended</span>
              ) : (
                <span className="text-emerald-400">Stock Levels Optimal</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Regulatory Compliance & Supply Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance & Airworthiness Directives */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Regulatory Compliance & Directives</h2>
                  <p className="text-xs text-slate-400">FAA / EASA ADs & Service Bulletins</p>
                </div>
              </div>
              <Link to="/compliance" className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1">
                <span>Compliance Directives</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Open / Pending</span>
                <div className="text-2xl font-extrabold text-blue-400 mt-1">{open_compliance_requirements}</div>
                <span className="text-[10px] text-slate-500">Under Review</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">Non-Compliant</span>
                <div className="text-2xl font-extrabold text-rose-400 mt-1">{non_compliant_requirements}</div>
                <span className="text-[10px] text-rose-500/80">Immediate Action</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Expired / Past Due</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{expired_requirements}</div>
                <span className="text-[10px] text-amber-500/80">Grounding Risk</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Airworthiness Safety Status:</span>
            <span className="font-semibold text-slate-200">
              {non_compliant_requirements === 0 && expired_requirements === 0 ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  Full Airworthiness Compliance
                </span>
              ) : (
                <span className="text-rose-400 flex items-center space-x-1">
                  <AlertOctagon className="w-3.5 h-3.5 inline mr-1" />
                  Audit Action Required
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ERP & Supply Chain Procurement */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">ERP & Vendor Supply Chain</h2>
                  <p className="text-xs text-slate-400">Aviation suppliers & purchase orders</p>
                </div>
              </div>
              <Link to="/supply-chain" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
                <span>Supply Chain</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Approved Suppliers</span>
                <div className="text-2xl font-extrabold text-white mt-1">{total_suppliers}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">{active_suppliers} Active</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">PO Pipeline</span>
                <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {Object.values(purchase_orders_by_status).reduce((a, b) => a + b, 0)}
                </div>
                <span className="text-[10px] text-slate-400">Total Purchase Orders</span>
              </div>
            </div>

            {/* PO Status Breakdown Pills */}
            <div className="space-y-1.5 mt-2">
              <span className="text-[11px] font-medium text-slate-400">Purchase Orders by Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(purchase_orders_by_status).map(([st, count]) => (
                  <span
                    key={st}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                  >
                    <span className="text-slate-400">{st}:</span>
                    <strong className="text-blue-400">{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Procurement Pipeline:</span>
            <span className="font-semibold text-slate-300">
              {active_suppliers > 0 ? `${active_suppliers} Active Vendors Connected` : 'No Active Vendors'}
            </span>
          </div>
        </div>
      </div>

      {/* Module Workspace Fast Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">MRO Operational Workspace Direct Access</h2>
          <span className="text-xs text-slate-500 font-mono">10 Modules Online</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {quickNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:text-white group-hover:bg-blue-600 transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
