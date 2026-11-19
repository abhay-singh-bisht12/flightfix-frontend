import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * FlightFix Mobile / Field Technician API Service
 * Handles field technician work packages, assigned tasks, and quick updates.
 * Restricted to FIELD_TECHNICIAN and ADMIN roles.
 */
export const mobileApi = {
  /**
   * Fetch compact field technician dashboard.
   * GET /api/mobile/dashboard/
   * @returns {Promise<Object>} Technician summary and assigned entities
   */
  async getTechnicianDashboard() {
    const response = await apiClient.get(ENDPOINTS.MOBILE.DASHBOARD);
    return response.data;
  },

  /**
   * Fetch maintenance tasks assigned to the technician.
   * GET /api/mobile/my-tasks/
   */
  async getMyTasks(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MOBILE.MY_TASKS, { params });
    return response.data;
  },

  /**
   * Fetch work orders assigned to the technician.
   * GET /api/mobile/my-work-orders/
   */
  async getMyWorkOrders(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MOBILE.MY_WORK_ORDERS, { params });
    return response.data;
  },

  /**
   * Fetch aircraft currently associated with the technician's assigned tasks.
   * GET /api/mobile/my-aircraft/
   */
  async getMyAircraft(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MOBILE.MY_AIRCRAFT, { params });
    return response.data;
  },
};

export default mobileApi;
