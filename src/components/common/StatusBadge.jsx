import React from 'react';

const statusStyles = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  compliant: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  in_progress: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low_stock: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  unhealthy: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  grounded: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  out_of_stock: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  non_compliant: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  default: 'bg-slate-700/50 text-slate-300 border-slate-600',
};

export default function StatusBadge({ status, label, className = '' }) {
  const normalizedKey = (status || '').toLowerCase().replace(/[\s-]/g, '_');
  const style = statusStyles[normalizedKey] || statusStyles.default;
  const displayLabel = label || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {displayLabel}
    </span>
  );
}
