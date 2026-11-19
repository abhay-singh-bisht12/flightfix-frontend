import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  Activity,
  FileCheck2,
  CheckCircle2,
  Search,
  Award,
  Sparkles
} from 'lucide-react';
import { KpiCard, HorizontalBarMeter, CHART_COLORS } from './AnalyticsCharts';

export default function TechniciansTab({ data }) {
  const [search, setSearch] = useState('');

  if (!data) return null;

  const { total_technicians = 0, technicians = [] } = data;

  const totalAssignedWO = technicians.reduce((acc, t) => acc + (t.assigned_work_orders || 0), 0);
  const totalCompletedWO = technicians.reduce((acc, t) => acc + (t.completed_work_orders || 0), 0);
  const totalExecutions = technicians.reduce((acc, t) => acc + (t.maintenance_executions || 0), 0);
  const totalLaborHours = technicians.reduce((acc, t) => acc + (parseFloat(t.total_actual_labor_hours) || 0), 0);

  const filteredTechs = useMemo(() => {
    if (!search.trim()) return technicians;
    const q = search.toLowerCase();
    return technicians.filter(
      (t) =>
        t.technician_name?.toLowerCase().includes(q) ||
        t.username?.toLowerCase().includes(q)
    );
  }, [technicians, search]);

  return (
    <div className="space-y-6">
      {/* Workforce KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Field Technicians"
          value={total_technicians}
          subtext="Licensed maintenance workforce"
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Total Logged Labor Hours"
          value={`${totalLaborHours.toFixed(1)}h`}
          subtext="Aggregated physical execution time"
          icon={Clock}
          color="emerald"
        />
        <KpiCard
          title="Completed Work Packages"
          value={totalCompletedWO}
          subtext={`${totalAssignedWO} total assigned work orders`}
          icon={CheckCircle2}
          color="indigo"
          badge={totalAssignedWO > 0 ? `${Math.round((totalCompletedWO / totalAssignedWO) * 100)}% Rate` : '0%'}
          badgeType="success"
        />
        <KpiCard
          title="Maintenance Executions"
          value={totalExecutions}
          subtext="Physical inspection dossiers completed"
          icon={FileCheck2}
          color="purple"
        />
      </div>

      {/* Technician Roster Performance Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Field Technician Operational Performance Roster
            </h3>
            <p className="text-xs text-slate-400">
              Work order completions, physical executions logged, actual labor hours, and task progress
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technician..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filteredTechs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No technicians registered or matching search.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3 text-right">Assigned WOs</th>
                  <th className="px-4 py-3 text-right">Completed WOs</th>
                  <th className="px-4 py-3 text-center">Completion Rate</th>
                  <th className="px-4 py-3 text-right">Executions</th>
                  <th className="px-4 py-3 text-right">Labor Hours</th>
                  <th className="px-4 py-3 text-right">Completed Tasks</th>
                  <th className="px-4 py-3 text-right">Pending Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredTechs.map((t) => {
                  const rate =
                    t.assigned_work_orders > 0
                      ? Math.round((t.completed_work_orders / t.assigned_work_orders) * 100)
                      : 0;

                  return (
                    <tr key={t.technician_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-sans">
                        <span className="font-bold text-white block">
                          {t.technician_name}
                        </span>
                        <span className="font-mono text-[11px] text-blue-400">
                          @{t.username}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        {t.assigned_work_orders}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        {t.completed_work_orders}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold w-8 text-right">
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-400">
                        {t.maintenance_executions}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-400">
                        {parseFloat(t.total_actual_labor_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        {t.completed_tasks}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {t.pending_tasks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
