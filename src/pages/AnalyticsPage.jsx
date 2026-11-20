import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  RefreshCw,
  Download,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Plane,
  Clock,
  Activity,
  Package,
  Truck,
  Users,
  Layers,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  ChevronDown
} from 'lucide-react';
import { useAuth, ROLES, ROLE_LABELS } from '../context/AuthContext';
import analyticsApi from '../api/analytics';
import MaintenanceTab from '../components/analytics/MaintenanceTab';
import FleetTab from '../components/analytics/FleetTab';
import InventoryTab from '../components/analytics/InventoryTab';
import ComplianceTab from '../components/analytics/ComplianceTab';
import SupplyChainTab from '../components/analytics/SupplyChainTab';
import TechniciansTab from '../components/analytics/TechniciansTab';
import { KpiCard, DonutChart, HorizontalBarMeter, CHART_COLORS } from '../components/analytics/AnalyticsCharts';
import { exportAnalyticsJSON, dictToCSV, objectsToCSV, downloadFile } from '../utils/reportExport';

export default function AnalyticsPage() {
  const { user, role, hasRole, hasAnyRole } = useAuth();

  const isManagement = hasAnyRole([
    ROLES.ADMIN,
    ROLES.SAFETY_OFFICER,
    ROLES.CONTRACTS_MANAGER,
  ]);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Datasets State
  const [dashboardData, setDashboardData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [aircraftData, setAircraftData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [supplyChainData, setSupplyChainData] = useState(null);
  const [techniciansData, setTechniciansData] = useState(null);

  // Filter state for maintenance
  const [maintDateFilter, setMaintDateFilter] = useState({});

  // Loading & Telemetry State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Fetch all analytics datasets in parallel
  const fetchAllAnalytics = useCallback(async (isRefresh = false, customMaintFilter = maintDateFilter) => {
    if (!isManagement) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [
        dashRes,
        maintRes,
        airRes,
        invRes,
        compRes,
        scRes,
        techRes,
      ] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getMaintenanceSummary(customMaintFilter),
        analyticsApi.getAircraftSummary(),
        analyticsApi.getInventorySummary(),
        analyticsApi.getComplianceSummary(),
        analyticsApi.getSupplyChainSummary(),
        analyticsApi.getTechnicianPerformance(),
      ]);

      setDashboardData(dashRes);
      setMaintenanceData(maintRes);
      setAircraftData(airRes);
      setInventoryData(invRes);
      setComplianceData(compRes);
      setSupplyChainData(scRes);
      setTechniciansData(techRes);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load analytics dossier:', err);
      let msg = 'Unable to connect to analytics services.';
      if (err.response?.status === 403) {
        msg = 'Access Forbidden (403): You are not authorized to view management analytics.';
      } else if (err.response?.status === 401) {
        msg = 'Session expired. Please log in again.';
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isManagement, maintDateFilter]);

  useEffect(() => {
    fetchAllAnalytics(false);
  }, [fetchAllAnalytics]);

  // Handle date filter update for maintenance
  const handleMaintenanceFilterChange = (filter) => {
    setMaintDateFilter(filter);
    fetchAllAnalytics(true, filter);
  };

  // Export handlers
  const handleExportJSON = () => {
    const fullReport = {
      generated_at: new Date().toISOString(),
      generated_by: user?.username,
      dashboard: dashboardData,
      maintenance: maintenanceData,
      aircraft_fleet: aircraftData,
      inventory: inventoryData,
      compliance: complianceData,
      supply_chain: supplyChainData,
      technician_performance: techniciansData,
    };
    exportAnalyticsJSON('FlightFix_Executive_Analytics_Report', fullReport);
    setExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    let filename = `FlightFix_${activeTab}_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    let csvContent = '';

    if (activeTab === 'fleet' && aircraftData?.maintenance_activity_per_aircraft) {
      csvContent = objectsToCSV(aircraftData.maintenance_activity_per_aircraft);
    } else if (activeTab === 'inventory' && inventoryData?.parts_with_low_stock) {
      csvContent = objectsToCSV(inventoryData.parts_with_low_stock);
    } else if (activeTab === 'technicians' && techniciansData?.technicians) {
      csvContent = objectsToCSV(techniciansData.technicians);
    } else if (activeTab === 'maintenance' && maintenanceData?.work_orders_by_status) {
      csvContent = dictToCSV('Work Orders by Status', maintenanceData.work_orders_by_status);
    } else if (activeTab === 'compliance' && complianceData?.requirements_by_status) {
      csvContent = dictToCSV('Compliance Requirements by Status', complianceData.requirements_by_status);
    } else if (activeTab === 'supply_chain' && supplyChainData?.purchase_orders_by_status) {
      csvContent = dictToCSV('Purchase Orders by Status', supplyChainData.purchase_orders_by_status);
    } else {
      // General dashboard KPIs
      csvContent = dictToCSV('Executive KPI Summary', dashboardData || {});
    }

    if (csvContent) {
      downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
    }
    setExportMenuOpen(false);
  };

  // RBAC Access Restriction Gate for Field Technicians
  if (!isManagement) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 inline-block">
              Clearance Restricted &bull; HTTP 403 Forbidden
            </span>
            <h2 className="text-2xl font-black text-white">
              Management Analytics Clearance Required
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Access to cross-fleet executive reporting, financial procurement metrics, regulatory compliance summaries,
              and technician performance metrics are restricted exclusively to <strong>Admin</strong>,{' '}
              <strong>Safety Officer</strong>, and <strong>Contracts Manager</strong> credentials.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Go to Technician Dashboard
              </Link>
              <Link
                to="/work-orders"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Assigned Work Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation tab definitions
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'maintenance', label: 'Maintenance & Work Orders', icon: Activity },
    { id: 'fleet', label: 'Aircraft Fleet', icon: Plane },
    { id: 'inventory', label: 'Spare Parts & Stock', icon: Package },
    { id: 'compliance', label: 'Compliance & Audits', icon: ShieldCheck },
    { id: 'supply_chain', label: 'Supply Chain & ERP', icon: Truck },
    { id: 'technicians', label: 'Technician Performance', icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>Analytics & Reporting</span>
                <span className="text-[11px] bg-blue-500/15 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Executive Intelligence
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Executive intelligence, maintenance reliability KPIs, regulatory audits, and supply chain analytics
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Refresh, Export */}
        <div className="flex items-center flex-wrap gap-2.5">
          {lastUpdated && (
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Updated {lastUpdated}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => fetchAllAnalytics(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/10 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold block">Export Active Tab (CSV)</span>
                    <span className="text-[10px] text-slate-400">Spreadsheet table format</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                >
                  <FileJson className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-semibold block">Full Briefing (JSON)</span>
                    <span className="text-[10px] text-slate-400">Complete multi-domain snapshot</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAllAnalytics(true)}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Navigation Ribbon */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {loading && !dashboardData ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold font-mono">
            Loading operational metrics & executive analytics...
          </span>
        </div>
      ) : (
        <div>
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Cross-Domain KPI Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard
                  title="Total Fleet"
                  value={dashboardData?.total_aircraft ?? 0}
                  subtext={`${dashboardData?.active_aircraft ?? 0} airworthy tails`}
                  icon={Plane}
                  color="blue"
                  onClick={() => setActiveTab('fleet')}
                />
                <KpiCard
                  title="Maintenance"
                  value={dashboardData?.total_maintenance_schedules ?? 0}
                  subtext={`${dashboardData?.overdue_maintenance_schedules ?? 0} overdue schedules`}
                  icon={Clock}
                  color={dashboardData?.overdue_maintenance_schedules > 0 ? 'rose' : 'indigo'}
                  badge={dashboardData?.overdue_maintenance_schedules > 0 ? 'Overdue' : 'Nominal'}
                  badgeType={dashboardData?.overdue_maintenance_schedules > 0 ? 'danger' : 'neutral'}
                  onClick={() => setActiveTab('maintenance')}
                />
                <KpiCard
                  title="Work Orders"
                  value={dashboardData?.open_work_orders ?? 0}
                  subtext={`${dashboardData?.completed_work_orders ?? 0} completed WOs`}
                  icon={Activity}
                  color="emerald"
                  onClick={() => setActiveTab('maintenance')}
                />
                <KpiCard
                  title="Spare Parts"
                  value={dashboardData?.total_spare_parts ?? 0}
                  subtext={`${(dashboardData?.low_stock_spare_parts || 0) + (dashboardData?.out_of_stock_spare_parts || 0)} low/out items`}
                  icon={Package}
                  color={dashboardData?.out_of_stock_spare_parts > 0 ? 'amber' : 'blue'}
                  onClick={() => setActiveTab('inventory')}
                />
                <KpiCard
                  title="Compliance"
                  value={dashboardData?.open_compliance_requirements ?? 0}
                  subtext={`${dashboardData?.expired_requirements ?? 0} expired directives`}
                  icon={ShieldCheck}
                  color={dashboardData?.expired_requirements > 0 ? 'rose' : 'purple'}
                  onClick={() => setActiveTab('compliance')}
                />
                <KpiCard
                  title="Suppliers"
                  value={dashboardData?.total_suppliers ?? 0}
                  subtext={`${dashboardData?.active_suppliers ?? 0} active vendors`}
                  icon={Truck}
                  color="teal"
                  onClick={() => setActiveTab('supply_chain')}
                />
              </div>

              {/* Multi-Domain Executive Visuals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DonutChart
                  title="Purchase Orders by Status"
                  subtitle="Enterprise procurement commitments distribution"
                  data={dashboardData?.purchase_orders_by_status || {}}
                  centerLabel="Orders"
                />
                <DonutChart
                  title="Fleet Airworthiness Distribution"
                  subtitle="Active vs maintenance and grounded airframes"
                  data={aircraftData?.aircraft_count_by_status || {}}
                  centerLabel="Fleet"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HorizontalBarMeter
                  title="Airworthiness Mandates by Regulation Type"
                  subtitle="FAA & EASA regulatory compliance requirements"
                  data={complianceData?.requirements_by_regulation_type || {}}
                />
                <HorizontalBarMeter
                  title="Inventory Movement by Transaction Type"
                  subtitle="Spare parts issuance, receipt, and adjustment flows"
                  data={inventoryData?.inventory_transactions_by_type || {}}
                />
              </div>
            </div>
          )}

          {/* TAB 2: MAINTENANCE & WORK ORDERS */}
          {activeTab === 'maintenance' && (
            <MaintenanceTab
              data={maintenanceData}
              loading={refreshing}
              dateFilter={maintDateFilter}
              onDateFilterChange={handleMaintenanceFilterChange}
            />
          )}

          {/* TAB 3: FLEET & AIRFRAME ACTIVITY */}
          {activeTab === 'fleet' && <FleetTab data={aircraftData} />}

          {/* TAB 4: INVENTORY & SPARE PARTS */}
          {activeTab === 'inventory' && <InventoryTab data={inventoryData} />}

          {/* TAB 5: COMPLIANCE & AUDITS */}
          {activeTab === 'compliance' && <ComplianceTab data={complianceData} />}

          {/* TAB 6: SUPPLY CHAIN & ERP */}
          {activeTab === 'supply_chain' && <SupplyChainTab data={supplyChainData} />}

          {/* TAB 7: TECHNICIAN PERFORMANCE */}
          {activeTab === 'technicians' && <TechniciansTab data={techniciansData} />}
        </div>
      )}
    </div>
  );
}
