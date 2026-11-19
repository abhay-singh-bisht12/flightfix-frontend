import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Maintenance Execution & Documentation API Service
 * Interacts with /api/maintenance-execution/records/ and /api/maintenance-execution/documentation/
 */
export const executionApi = {
  /**
   * Fetch paginated list of maintenance execution records.
   * GET /api/maintenance-execution/records/
   */
  async getExecutionRecords(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE_EXECUTION.RECORDS, { params });
    return response.data;
  },

  /**
   * Fetch full details of an execution record (includes documentation_records array).
   * GET /api/maintenance-execution/records/{id}/
   */
  async getExecutionDetail(id) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE_EXECUTION.RECORD_DETAIL(id));
    return response.data;
  },

  /**
   * Create a new maintenance execution log.
   * POST /api/maintenance-execution/records/
   */
  async createExecutionRecord(data) {
    const response = await apiClient.post(ENDPOINTS.MAINTENANCE_EXECUTION.RECORDS, data);
    return response.data;
  },

  /**
   * Update full maintenance execution log.
   * PUT /api/maintenance-execution/records/{id}/
   */
  async updateExecutionRecord(id, data) {
    const response = await apiClient.put(ENDPOINTS.MAINTENANCE_EXECUTION.RECORD_DETAIL(id), data);
    return response.data;
  },

  /**
   * Partially update execution log (e.g. status transition, labor hours, findings, remarks).
   * PATCH /api/maintenance-execution/records/{id}/
   */
  async patchExecutionRecord(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MAINTENANCE_EXECUTION.RECORD_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete maintenance execution record (ADMIN only).
   * DELETE /api/maintenance-execution/records/{id}/
   */
  async deleteExecutionRecord(id) {
    const response = await apiClient.delete(ENDPOINTS.MAINTENANCE_EXECUTION.RECORD_DETAIL(id));
    return response.data;
  },

  /**
   * Fetch paginated documentation & sign-off records.
   * GET /api/maintenance-execution/documentation/
   */
  async getDocumentationRecords(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION, { params });
    return response.data;
  },

  /**
   * Fetch detail of single technical document.
   * GET /api/maintenance-execution/documentation/{id}/
   */
  async getDocumentationDetail(id) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION_DETAIL(id));
    return response.data;
  },

  /**
   * Create a technical documentation / CRS / sign-off record.
   * POST /api/maintenance-execution/documentation/
   */
  async createDocumentationRecord(data) {
    const response = await apiClient.post(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION, data);
    return response.data;
  },

  /**
   * Update full technical documentation record.
   * PUT /api/maintenance-execution/documentation/{id}/
   */
  async updateDocumentationRecord(id, data) {
    const response = await apiClient.put(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION_DETAIL(id), data);
    return response.data;
  },

  /**
   * Sign off or verify technical document.
   * PATCH /api/maintenance-execution/documentation/{id}/
   */
  async patchDocumentationRecord(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete technical documentation record (ADMIN only).
   * DELETE /api/maintenance-execution/documentation/{id}/
   */
  async deleteDocumentationRecord(id) {
    const response = await apiClient.delete(ENDPOINTS.MAINTENANCE_EXECUTION.DOCUMENTATION_DETAIL(id));
    return response.data;
  },
};

export default executionApi;
