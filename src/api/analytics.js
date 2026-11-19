import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * FlightFix Analytics & Reporting API Service
 * Handles executive and management read-only operational telemetry and metrics.
 * Note: Restricted to ADMIN, SAFETY_OFFICER, and CONTRACTS_MANAGER roles.
 * FIELD_TECHNICIAN receives HTTP 403 Forbidden.
 */
export const analyticsApi = {
  /**
   * Fetch the executive analytics dashboard KPIs across all modules.
   * GET /api/analytics/dashboard/
   * @returns {Promise<Object>} Executive dashboard metrics
   */
  async getDashboard() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  /**
   * Fetch maintenance operations KPIs: schedules, work orders, executions,
   * completed vs pending, and overdue counts.
   * GET /api/analytics/maintenance-summary/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
   * @param {Object} [params] - Optional query parameters: start_date, end_date
   * @returns {Promise<Object>} Maintenance analytics
   */
  async getMaintenanceSummary(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.MAINTENANCE_SUMMARY, { params });
    return response.data;
  },

  /**
   * Fetch fleet analytics: status breakdown, aircraft type distribution,
   * manufacturer breakdown, and airframe maintenance activity.
   * GET /api/analytics/aircraft-summary/
   * @returns {Promise<Object>} Aircraft fleet summary
   */
  async getAircraftSummary() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.AIRCRAFT_SUMMARY);
    return response.data;
  },

  /**
   * Fetch inventory & spare parts analytics: stock statuses, transaction
   * frequencies, top-issued parts, and low/out-of-stock items.
   * GET /api/analytics/inventory-summary/
   * @returns {Promise<Object>} Inventory summary
   */
  async getInventorySummary() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.INVENTORY_SUMMARY);
    return response.data;
  },

  /**
   * Fetch regulatory compliance analytics: requirements by status/priority/type,
   * overdue/expired mandates, compliant vs non-compliant, and audit verification statuses.
   * GET /api/analytics/compliance-summary/
   * @returns {Promise<Object>} Compliance summary
   */
  async getComplianceSummary() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.COMPLIANCE_SUMMARY);
    return response.data;
  },

  /**
   * Fetch supply chain & procurement analytics: supplier statuses, purchase
   * order commitments, total order values, and delivery tracking.
   * GET /api/analytics/supply-chain-summary/
   * @returns {Promise<Object>} Supply chain summary
   */
  async getSupplyChainSummary() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.SUPPLY_CHAIN_SUMMARY);
    return response.data;
  },

  /**
   * Fetch technician operational performance: assigned/completed work orders,
   * executions logged, actual labor hours, and task progress.
   * GET /api/analytics/technician-performance/
   * @returns {Promise<Object>} Technician performance data
   */
  async getTechnicianPerformance() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.TECHNICIAN_PERFORMANCE);
    return response.data;
  },

  // Backwards-compatible aliases
  async getFleetStatus() {
    return this.getAircraftSummary();
  },

  async getMaintenanceMetrics(params = {}) {
    return this.getMaintenanceSummary(params);
  },
};

export default analyticsApi;
