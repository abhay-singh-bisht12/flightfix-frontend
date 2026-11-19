import React from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowDownUp,
  MapPin,
  Layers,
  Sparkles
} from 'lucide-react';
import { DonutChart, HorizontalBarMeter, KpiCard, CHART_COLORS } from './AnalyticsCharts';
import StatusBadge from '../common/StatusBadge';

const STOCK_STATUS_COLORS = {
  IN_STOCK: CHART_COLORS.emerald,
  LOW_STOCK: CHART_COLORS.amber,
  OUT_OF_STOCK: CHART_COLORS.rose,
  DISCONTINUED: CHART_COLORS.slate,
};

const TX_COLORS = {
  ISSUE: CHART_COLORS.blue,
  RECEIPT: CHART_COLORS.emerald,
  ADJUSTMENT: CHART_COLORS.amber,
  RETURN: CHART_COLORS.indigo,
  SCRAP: CHART_COLORS.rose,
};

export default function InventoryTab({ data }) {
  if (!data) return null;

  const {
    total_spare_parts = 0,
    in_stock_count = 0,
    low_stock_count = 0,
    out_of_stock_count = 0,
    discontinued_count = 0,
    inventory_transactions_by_type = {},
    most_frequently_issued_parts = [],
    parts_with_low_stock = [],
  } = data;

  const stockBreakdown = {
    IN_STOCK: in_stock_count,
    LOW_STOCK: low_stock_count,
    OUT_OF_STOCK: out_of_stock_count,
    DISCONTINUED: discontinued_count,
  };

  const criticalShortage = low_stock_count + out_of_stock_count;

  return (
    <div className="space-y-6">
      {/* Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Spare Parts Catalog"
          value={total_spare_parts}
          subtext="Distinct registered components"
          icon={Package}
          color="blue"
        />
        <KpiCard
          title="In Stock & Available"
          value={in_stock_count}
          subtext="Healthy inventory levels"
          icon={CheckCircle2}
          color="emerald"
          badge={total_spare_parts > 0 ? `${Math.round((in_stock_count / total_spare_parts) * 100)}% Available` : '100%'}
          badgeType="success"
        />
        <KpiCard
          title="Low Stock Warning"
          value={low_stock_count}
          subtext="At or below minimum threshold"
          icon={AlertTriangle}
          color="amber"
          badge={low_stock_count > 0 ? 'Reorder Soon' : 'Optimal'}
          badgeType={low_stock_count > 0 ? 'warning' : 'neutral'}
        />
        <KpiCard
          title="Out of Stock (Zero Units)"
          value={out_of_stock_count}
          subtext={out_of_stock_count > 0 ? 'AOG & replenishment risk' : 'Zero depleted SKUs'}
          icon={TrendingDown}
          color={out_of_stock_count > 0 ? 'rose' : 'emerald'}
          badge={out_of_stock_count > 0 ? 'Critical' : 'All Clear'}
          badgeType={out_of_stock_count > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Visual Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title="Spare Parts Stock Status Breakdown"
          subtitle="Inventory balance between healthy, low, and depleted stock items"
          data={stockBreakdown}
          colorMap={STOCK_STATUS_COLORS}
          centerLabel="Catalog Items"
        />
        <HorizontalBarMeter
          title="Inventory Transactions by Type"
          subtitle="Historical flow of inventory movements, issues, receipts, and scrap"
          data={inventory_transactions_by_type}
          colorMap={TX_COLORS}
        />
      </div>

      {/* Two Column Tables: Most Issued Parts & Critical Low Stock Alert Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Issued Parts */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top 10 Most Frequently Issued Components
            </h3>
            <p className="text-xs text-slate-400">
              High-demand rotables and consumables consumed in maintenance work orders
            </p>
          </div>

          {most_frequently_issued_parts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No parts issuance records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700/80">
                  <tr>
                    <th className="px-4 py-2.5">Part Number</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-right">Qty Issued</th>
                    <th className="px-4 py-2.5 text-right">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {most_frequently_issued_parts.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-white tracking-wider">
                        {p.part_number}
                      </td>
                      <td className="px-4 py-2.5 font-sans text-slate-300 truncate max-w-xs">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-blue-400">
                        {p.total_quantity_issued ?? 0}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {p.issue_transactions_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Critical Low & Out of Stock Watchlist */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Critical Low Stock & Out-of-Stock Watchlist</span>
              </h3>
              <p className="text-xs text-slate-400">
                Components below threshold or depleted requiring procurement orders
              </p>
            </div>
            {criticalShortage > 0 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {criticalShortage} Items
              </span>
            )}
          </div>

          {parts_with_low_stock.length === 0 ? (
            <div className="py-10 text-center text-emerald-400 text-xs flex flex-col items-center justify-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-1" />
              <span>All spare parts are currently above minimum stock levels.</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700/80 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">Part Number</th>
                    <th className="px-4 py-2.5">Location</th>
                    <th className="px-4 py-2.5 text-right">In Stock</th>
                    <th className="px-4 py-2.5 text-right">Min Stock</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {parts_with_low_stock.map((p, idx) => {
                    const isZero = Number(p.quantity_in_stock) <= 0;
                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5">
                          <span className="font-bold text-white block">{p.part_number}</span>
                          <span className="font-sans text-[11px] text-slate-400 truncate block max-w-[140px]">
                            {p.name}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 font-sans">
                          {p.location || '—'}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-bold ${isZero ? 'text-rose-400' : 'text-amber-400'}`}>
                          {p.quantity_in_stock}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400">
                          {p.minimum_stock_level}
                        </td>
                        <td className="px-4 py-2.5 text-center font-sans">
                          <StatusBadge status={p.status || (isZero ? 'OUT_OF_STOCK' : 'LOW_STOCK')} />
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
    </div>
  );
}
