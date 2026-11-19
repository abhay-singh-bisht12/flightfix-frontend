import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Work Order Management API Service
 * Interacts with /api/work-orders/
 */
export const workOrdersApi = {
  /**
   * Fetch paginated list of work orders with optional filtering.
   * GET /api/work-orders/
   */
  async getWorkOrders(params = {}) {
    const response = await apiClient.get(ENDPOINTS.WORK_ORDERS.LIST, { params });
    return response.data;
  },

  /**
   * Fetch a single work order's complete details.
   * GET /api/work-orders/{id}/
   */
  async getWorkOrderDetail(id) {
    const response = await apiClient.get(ENDPOINTS.WORK_ORDERS.DETAIL(id));
    return response.data;
  },

  /**
   * Create a new work order.
   * POST /api/work-orders/
   */
  async createWorkOrder(data) {
    const response = await apiClient.post(ENDPOINTS.WORK_ORDERS.LIST, data);
    return response.data;
  },

  /**
   * Update full work order record.
   * PUT /api/work-orders/{id}/
   */
  async updateWorkOrder(id, data) {
    const response = await apiClient.put(ENDPOINTS.WORK_ORDERS.DETAIL(id), data);
    return response.data;
  },

  /**
   * Partially update work order (e.g. status transition, actual hours, findings).
   * PATCH /api/work-orders/{id}/
   */
  async patchWorkOrder(id, data) {
    const response = await apiClient.patch(ENDPOINTS.WORK_ORDERS.DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete work order record (ADMIN only).
   * DELETE /api/work-orders/{id}/
   */
  async deleteWorkOrder(id) {
    const response = await apiClient.delete(ENDPOINTS.WORK_ORDERS.DETAIL(id));
    return response.data;
  },
};

export default workOrdersApi;
