import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * FlightFix Analytics API Service
 * Handles executive and management read-only operational telemetry and metrics.
 * Note: Restricted to ADMIN, SAFETY_OFFICER, and CONTRACTS_MANAGER roles.
 */
export const analyticsApi = {
  /**
   * Fetch the management analytics dashboard KPIs.
   * GET /api/analytics/dashboard/
   * @returns {Promise<Object>} Management dashboard metrics
   */
  async getDashboard() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.DASHBOARD);
    return response.data;
  },

  /**
   * Fetch fleet airworthiness status summary.
   * GET /api/analytics/fleet-status/
   */
  async getFleetStatus() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.FLEET_STATUS);
    return response.data;
  },

  /**
   * Fetch maintenance execution and labor metrics.
   * GET /api/analytics/maintenance-metrics/
   */
  async getMaintenanceMetrics() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.MAINTENANCE_METRICS);
    return response.data;
  },
};

export default analyticsApi;
