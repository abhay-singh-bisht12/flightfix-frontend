import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-800 rounded-lg" />
          <div className="h-4 w-96 bg-slate-800/60 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-800 rounded-lg" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-5 w-16 bg-slate-800 rounded-full" />
            </div>
            <div className="h-8 w-20 bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Section Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 bg-slate-950 rounded-2xl" />
            <div className="h-24 bg-slate-950 rounded-2xl" />
            <div className="h-24 bg-slate-950 rounded-2xl" />
          </div>
          <div className="h-4 w-full bg-slate-800/40 rounded" />
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="grid grid-cols-4 gap-2.5">
            <div className="h-24 bg-slate-950 rounded-2xl" />
            <div className="h-24 bg-slate-950 rounded-2xl" />
            <div className="h-24 bg-slate-950 rounded-2xl" />
            <div className="h-24 bg-slate-950 rounded-2xl" />
          </div>
          <div className="h-4 w-full bg-slate-800/40 rounded" />
        </div>
      </div>
    </div>
  );
}
