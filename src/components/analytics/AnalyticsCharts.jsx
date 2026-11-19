import React from 'react';

/**
 * Standard palette for status/type charts.
 */
export const CHART_COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  indigo: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#a855f7',
  cyan: '#06b6d4',
  slate: '#64748b',
  teal: '#14b8a6',
  orange: '#f97316',
};

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#64748b', // slate
];

/**
 * Executive KPI Metric Card
 */
export function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'blue',
  badge = null,
  badgeType = 'neutral',
  onClick = null,
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      highlight: 'hover:border-blue-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      highlight: 'hover:border-emerald-500/40',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      highlight: 'hover:border-amber-500/40',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      highlight: 'hover:border-rose-500/40',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      highlight: 'hover:border-purple-500/40',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      highlight: 'hover:border-indigo-500/40',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-slate-900 border ${c.border} ${
        onClick ? `cursor-pointer transition-all duration-200 ${c.highlight}` : ''
      } flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${c.bg} ${c.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
          {value ?? 0}
        </span>
        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              badgeType === 'danger'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : badgeType === 'success'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : badgeType === 'warning'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}

/**
 * Interactive SVG Donut / Ring Chart
 */
export function DonutChart({
  title,
  subtitle,
  data = {},
  colorMap = {},
  size = 180,
  strokeWidth = 24,
  centerLabel = 'Total',
  emptyMessage = 'No telemetry data recorded',
}) {
  const entries = Object.entries(data).filter(([_, val]) => Number(val) > 0);
  const total = entries.reduce((acc, [_, val]) => acc + Number(val), 0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center mb-2">
            <span className="text-xs text-slate-400 font-mono">0</span>
          </div>
          <span className="text-xs">{emptyMessage}</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-1">
          {/* SVG Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {entries.map(([key, val], idx) => {
                const count = Number(val);
                const percent = count / total;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                const strokeColor = colorMap[key] || PALETTE[idx % PALETTE.length];

                return (
                  <circle
                    key={key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white font-mono">{total}</span>
              <span className="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">
                {centerLabel}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            {entries.map(([key, val], idx) => {
              const count = Number(val);
              const percent = Math.round((count / total) * 100);
              const color = colorMap[key] || PALETTE[idx % PALETTE.length];
              const formattedLabel = key.replace(/_/g, ' ');

              return (
                <div key={key} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-800/40">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-slate-300 capitalize truncate">{formattedLabel}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 font-mono">
                    <span className="font-bold text-white">{count}</span>
                    <span className="text-slate-400 text-[11px] w-9 text-right">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Horizontal Bar Breakdown Component
 */
export function HorizontalBarMeter({
  title,
  subtitle,
  data = {},
  colorMap = {},
  maxLabelWidth = 'w-36',
  emptyMessage = 'No data recorded',
}) {
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [_, val]) => acc + Number(val || 0), 0);
  const maxVal = Math.max(...entries.map(([_, v]) => Number(v || 0)), 1);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8 text-slate-400 text-xs">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 justify-center flex flex-col">
          {entries.map(([key, val], idx) => {
            const count = Number(val || 0);
            const percentOfTotal = total > 0 ? Math.round((count / total) * 100) : 0;
            const widthPercent = Math.round((count / maxVal) * 100);
            const color = colorMap[key] || PALETTE[idx % PALETTE.length];
            const formattedLabel = key.replace(/_/g, ' ');

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-slate-300 capitalize truncate font-medium">{formattedLabel}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 font-mono">
                    <span className="font-bold text-white">{count}</span>
                    <span className="text-slate-400 text-[11px]">({percentOfTotal}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Segmented Progress Bar (Multi-color single bar)
 */
export function SegmentedProgressBar({
  title,
  segments = [], // [{ label, value, color }]
  totalLabel = 'Total Operations',
}) {
  const total = segments.reduce((acc, s) => acc + Number(s.value || 0), 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
        <span className="text-xs font-mono font-bold text-slate-300">
          {total} <span className="text-slate-400 font-sans font-normal text-[11px]">{totalLabel}</span>
        </span>
      </div>

      {total === 0 ? (
        <div className="h-3 bg-slate-800 rounded-full" />
      ) : (
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
          {segments.map((seg, idx) => {
            const count = Number(seg.value || 0);
            const width = (count / total) * 100;
            if (width === 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${width}%`, backgroundColor: seg.color }}
                className="h-full transition-all duration-500 hover:opacity-90"
                title={`${seg.label}: ${count} (${Math.round(width)}%)`}
              />
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        {segments.map((seg, idx) => {
          const count = Number(seg.value || 0);
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-300 font-medium">{seg.label}:</span>
              <span className="font-mono text-white font-bold">{count}</span>
              <span className="text-slate-400 text-[11px]">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
