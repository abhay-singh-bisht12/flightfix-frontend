import React from 'react';
import {
  Truck,
  Building2,
  DollarSign,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { DonutChart, HorizontalBarMeter, KpiCard, CHART_COLORS } from './AnalyticsCharts';

const PO_STATUS_COLORS = {
  DRAFT: CHART_COLORS.slate,
  APPROVED: CHART_COLORS.blue,
  ORDERED: CHART_COLORS.indigo,
  PARTIALLY_RECEIVED: CHART_COLORS.amber,
  RECEIVED: CHART_COLORS.emerald,
  CANCELLED: CHART_COLORS.rose,
};

const SUPPLIER_STATUS_COLORS = {
  ACTIVE: CHART_COLORS.emerald,
  INACTIVE: CHART_COLORS.slate,
  SUSPENDED: CHART_COLORS.rose,
};

const SUPPLIER_TYPE_COLORS = {
  OEM: CHART_COLORS.blue,
  DISTRIBUTOR: CHART_COLORS.indigo,
  REPAIR_STATION: CHART_COLORS.amber,
  LOGISTICS: CHART_COLORS.teal,
};

export default function SupplyChainTab({ data }) {
  if (!data) return null;

  const {
    suppliers_by_status = {},
    suppliers_by_type = {},
    purchase_orders_by_status = {},
    purchase_orders_by_priority = {},
    total_purchase_order_value = '0.00',
    pending_deliveries = 0,
    received_purchase_orders = 0,
  } = data;

  const totalSuppliers = Object.values(suppliers_by_status).reduce((a, b) => a + Number(b), 0);
  const activeSuppliers = Number(suppliers_by_status.ACTIVE || 0);
  const totalPOs = Object.values(purchase_orders_by_status).reduce((a, b) => a + Number(b), 0);

  const numericVal = parseFloat(total_purchase_order_value) || 0;
  const formattedVal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericVal);

  return (
    <div className="space-y-6">
      {/* Supply Chain KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Committed Procurement Value"
          value={formattedVal}
          subtext="Total value across all purchase order line items"
          icon={DollarSign}
          color="emerald"
        />
        <KpiCard
          title="Active Approved Vendors"
          value={activeSuppliers}
          subtext={`${totalSuppliers} total registered suppliers`}
          icon={Building2}
          color="blue"
          badge={totalSuppliers > 0 ? `${Math.round((activeSuppliers / totalSuppliers) * 100)}% Active` : '100%'}
          badgeType="success"
        />
        <KpiCard
          title="Pending Goods Inbound"
          value={pending_deliveries}
          subtext="Orders awaiting dock receipt"
          icon={Clock}
          color="amber"
          badge={pending_deliveries > 0 ? 'In Transit' : 'Clear'}
          badgeType={pending_deliveries > 0 ? 'warning' : 'neutral'}
        />
        <KpiCard
          title="Fulfilled Purchase Orders"
          value={received_purchase_orders}
          subtext={`${totalPOs} total purchase orders dispatched`}
          icon={PackageCheck}
          color="indigo"
          badge={totalPOs > 0 ? `${Math.round((received_purchase_orders / totalPOs) * 100)}% Fulfilled` : '0%'}
          badgeType="success"
        />
      </div>

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title="Purchase Orders by Status"
          subtitle="Procurement workflow progression from draft to delivery"
          data={purchase_orders_by_status}
          colorMap={PO_STATUS_COLORS}
          centerLabel="Orders"
        />
        <DonutChart
          title="Vendors by Operational Status"
          subtitle="Supplier partnership standing and compliance clearance"
          data={suppliers_by_status}
          colorMap={SUPPLIER_STATUS_COLORS}
          centerLabel="Suppliers"
        />
      </div>

      {/* Horizontal Bar Meters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarMeter
          title="Purchase Orders by Priority"
          subtitle="Procurement urgency from routine replenishment to critical AOG"
          data={purchase_orders_by_priority}
        />
        <HorizontalBarMeter
          title="Suppliers by Category Type"
          subtitle="Vendor portfolio distribution across OEMs, distributors, and repair stations"
          data={suppliers_by_type}
          colorMap={SUPPLIER_TYPE_COLORS}
        />
      </div>
    </div>
  );
}
