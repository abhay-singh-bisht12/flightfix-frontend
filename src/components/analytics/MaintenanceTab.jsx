import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Filter,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DonutChart, HorizontalBarMeter, KpiCard, SegmentedProgressBar, CHART_COLORS } from './AnalyticsCharts';

const STATUS_COLORS = {
  PLANNED: CHART_COLORS.blue,
  IN_PROGRESS: CHART_COLORS.amber,
  COMPLETED: CHART_COLORS.emerald,
  CANCELLED: CHART_COLORS.rose,
  DEFERRED: CHART_COLORS.purple,
  OVERDUE: CHART_COLORS.rose,
  OPEN: CHART_COLORS.blue,
  ASSIGNED: CHART_COLORS.indigo,
  ON_HOLD: CHART_COLORS.amber,
  CLOSED: CHART_COLORS.slate,
};

const PRIORITY_COLORS = {
  LOW: CHART_COLORS.slate,
  MEDIUM: CHART_COLORS.blue,
  HIGH: CHART_COLORS.amber,
  CRITICAL: CHART_COLORS.rose,
  AOG: CHART_COLORS.rose,
};

const TYPE_COLORS = {
  ROUTINE: CHART_COLORS.blue,
  PREVENTIVE: CHART_COLORS.emerald,
  CORRECTIVE: CHART_COLORS.amber,
  EMERGENCY: CHART_COLORS.rose,
  INSPECTION: CHART_COLORS.purple,
  OVERHAUL: CHART_COLORS.cyan,
  MODIFICATION: CHART_COLORS.indigo,
};

export default function MaintenanceTab({
  data,
  loading = false,
  dateFilter,
  onDateFilterChange,
}) {
  const [startDate, setStartDate] = useState(dateFilter?.start_date || '');
  const [endDate, setEndDate] = useState(dateFilter?.end_date || '');

  if (!data) return null;

  const {
    schedules_by_status = {},
    schedules_by_maintenance_type = {},
    schedules_by_priority = {},
    work_orders_by_status = {},
    work_orders_by_priority = {},
    executions_by_status = {},
    completed_vs_pending_maintenance = {},
    overdue_maintenance_count = 0,
  } = data;

  const handleApply = (e) => {
    e.preventDefault();
    onDateFilterChange?.({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const handleQuickPreset = (days) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    onDateFilterChange?.({ start_date: start, end_date: end });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onDateFilterChange?.({});
  };

  const totalSchedules = Object.values(schedules_by_status).reduce((a, b) => a + Number(b), 0);
  const totalWorkOrders = Object.values(work_orders_by_status).reduce((a, b) => a + Number(b), 0);
  const totalExecutions = Object.values(executions_by_status).reduce((a, b) => a + Number(b), 0);

  const completedWO = completed_vs_pending_maintenance?.completed_work_orders || 0;
  const pendingWO = completed_vs_pending_maintenance?.pending_work_orders || 0;
  const woCompletionRate = totalWorkOrders > 0 ? Math.round((completedWO / totalWorkOrders) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date Range Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleApply} className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="font-semibold uppercase tracking-wider text-white">Period:</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center space-x-1"
          >
            <span>Apply</span>
          </button>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1"
              title="Reset date filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </form>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset(7)}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(30)}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(90)}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            90 Days
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Maintenance Schedules"
          value={totalSchedules}
          subtext={`${completed_vs_pending_maintenance?.pending_schedules || 0} currently active/planned`}
          icon={Clock}
          color="blue"
        />
        <KpiCard
          title="Work Orders"
          value={totalWorkOrders}
          subtext={`${pendingWO} pending / in progress`}
          icon={Activity}
          color="indigo"
          badge={`${woCompletionRate}% Closed`}
          badgeType={woCompletionRate >= 70 ? 'success' : 'warning'}
        />
        <KpiCard
          title="Maintenance Executions"
          value={totalExecutions}
          subtext="Logged execution records"
          icon={FileCheck2}
          color="emerald"
        />
        <KpiCard
          title="Overdue Maintenance"
          value={overdue_maintenance_count}
          subtext={overdue_maintenance_count > 0 ? 'Requires immediate supervisor action' : 'All schedules on track'}
          icon={AlertTriangle}
          color={overdue_maintenance_count > 0 ? 'rose' : 'emerald'}
          badge={overdue_maintenance_count > 0 ? 'Action Required' : 'Compliant'}
          badgeType={overdue_maintenance_count > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title="Work Orders by Status"
          subtitle="Operational lifecycle distribution of assigned work packages"
          data={work_orders_by_status}
          colorMap={STATUS_COLORS}
          centerLabel="Work Orders"
        />
        <DonutChart
          title="Maintenance Schedules by Status"
          subtitle="Status distribution of planned preventative and corrective schedules"
          data={schedules_by_status}
          colorMap={STATUS_COLORS}
          centerLabel="Schedules"
        />
      </div>

      {/* Horizontal Bar Meters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarMeter
          title="Work Orders by Priority"
          subtitle="Urgency classification from routine tasks to AOG critical events"
          data={work_orders_by_priority}
          colorMap={PRIORITY_COLORS}
        />
        <HorizontalBarMeter
          title="Schedules by Maintenance Type"
          subtitle="Breakdown of maintenance activities by operational category"
          data={schedules_by_maintenance_type}
          colorMap={TYPE_COLORS}
        />
      </div>

      {/* Execution Status Segmented Progress */}
      <SegmentedProgressBar
        title="Execution Task Completion Pipeline"
        totalLabel="Execution Records"
        segments={[
          { label: 'Completed', value: executions_by_status.COMPLETED || 0, color: CHART_COLORS.emerald },
          { label: 'In Progress', value: executions_by_status.IN_PROGRESS || 0, color: CHART_COLORS.blue },
          { label: 'Pending / Planned', value: (executions_by_status.PLANNED || 0) + (executions_by_status.PENDING || 0), color: CHART_COLORS.amber },
          { label: 'Cancelled / Interrupted', value: (executions_by_status.CANCELLED || 0) + (executions_by_status.FAILED || 0), color: CHART_COLORS.rose },
        ]}
      />
    </div>
  );
}
