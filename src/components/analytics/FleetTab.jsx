import React, { useState, useMemo } from 'react';
import {
  Plane,
  Building2,
  Search,
  CheckCircle2,
  Wrench,
  AlertOctagon,
  Clock,
  Activity,
  FileCheck2,
  Layers
} from 'lucide-react';
import { DonutChart, HorizontalBarMeter, KpiCard, CHART_COLORS } from './AnalyticsCharts';
import StatusBadge from '../common/StatusBadge';

const AIRCRAFT_STATUS_COLORS = {
  ACTIVE: CHART_COLORS.emerald,
  MAINTENANCE: CHART_COLORS.amber,
  AOG: CHART_COLORS.rose,
  GROUNDED: CHART_COLORS.rose,
  DECOMMISSIONED: CHART_COLORS.slate,
};

export default function FleetTab({ data }) {
  const [search, setSearch] = useState('');

  if (!data) return null;

  const {
    aircraft_count_by_status = {},
    aircraft_count_by_aircraft_type = {},
    aircraft_count_by_manufacturer = {},
    maintenance_activity_per_aircraft = [],
  } = data;

  const totalAircraft = Object.values(aircraft_count_by_status).reduce((a, b) => a + Number(b), 0);
  const activeAircraft = Number(aircraft_count_by_status.ACTIVE || 0);
  const maintAircraft = Number(aircraft_count_by_status.MAINTENANCE || 0);
  const aogAircraft = Number(aircraft_count_by_status.AOG || 0) + Number(aircraft_count_by_status.GROUNDED || 0);
  const operationalReadiness = totalAircraft > 0 ? Math.round((activeAircraft / totalAircraft) * 100) : 0;

  // Filtered maintenance activity per airframe
  const filteredActivity = useMemo(() => {
    if (!search.trim()) return maintenance_activity_per_aircraft;
    const q = search.toLowerCase();
    return maintenance_activity_per_aircraft.filter(
      (ac) =>
        ac.registration_number?.toLowerCase().includes(q) ||
        ac.model?.toLowerCase().includes(q) ||
        ac.manufacturer?.toLowerCase().includes(q)
    );
  }, [maintenance_activity_per_aircraft, search]);

  return (
    <div className="space-y-6">
      {/* Fleet Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Fleet Size"
          value={totalAircraft}
          subtext="Registered airframes"
          icon={Plane}
          color="blue"
        />
        <KpiCard
          title="Active & Airworthy"
          value={activeAircraft}
          subtext={`${operationalReadiness}% operational readiness`}
          icon={CheckCircle2}
          color="emerald"
          badge={`${operationalReadiness}% Active`}
          badgeType="success"
        />
        <KpiCard
          title="In Maintenance"
          value={maintAircraft}
          subtext="Under active hangar servicing"
          icon={Wrench}
          color="amber"
          badge={maintAircraft > 0 ? 'Servicing' : 'Nominal'}
          badgeType="warning"
        />
        <KpiCard
          title="AOG / Grounded"
          value={aogAircraft}
          subtext={aogAircraft > 0 ? 'Critical airframe ground stop' : 'Zero aircraft grounded'}
          icon={AlertOctagon}
          color={aogAircraft > 0 ? 'rose' : 'slate'}
          badge={aogAircraft > 0 ? 'Critical' : 'All Clear'}
          badgeType={aogAircraft > 0 ? 'danger' : 'neutral'}
        />
      </div>

      {/* Visual Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          title="Fleet Operational Status"
          subtitle="Proportion of active, servicing, and grounded airframes"
          data={aircraft_count_by_status}
          colorMap={AIRCRAFT_STATUS_COLORS}
          centerLabel="Airframes"
        />
        <HorizontalBarMeter
          title="Airframes by Type"
          subtitle="Fleet composition by operational aircraft classification"
          data={aircraft_count_by_aircraft_type}
        />
        <HorizontalBarMeter
          title="Airframes by Manufacturer"
          subtitle="OEM manufacturer diversity across registered fleet"
          data={aircraft_count_by_manufacturer}
        />
      </div>

      {/* Airframe Operational Maintenance Activity Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Airframe Operational Maintenance Activity
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated work packages, scheduled servicing, and execution events per registered tail
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registration or model..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No aircraft found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Manufacturer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Schedules</th>
                  <th className="px-4 py-3 text-right">Work Orders</th>
                  <th className="px-4 py-3 text-right">Executions</th>
                  <th className="px-4 py-3 text-center">Maintenance Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredActivity.map((ac) => {
                  const totalActivity = (ac.schedules_count || 0) + (ac.work_orders_count || 0) + (ac.executions_count || 0);
                  return (
                    <tr key={ac.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                      <td className="px-4 py-3 font-bold text-white tracking-wider">
                        {ac.registration_number}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans">
                        {ac.model || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-sans">
                        {ac.manufacturer || '—'}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <StatusBadge status={ac.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-400">
                        {ac.schedules_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-400">
                        {ac.work_orders_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        {ac.executions_count || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${
                          totalActivity > 5
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : totalActivity > 0
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {totalActivity > 5 ? 'High Activity' : totalActivity > 0 ? 'Active' : 'Dormant'}
                        </span>
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
