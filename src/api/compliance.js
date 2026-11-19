import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Airworthiness & Regulatory Compliance API Service
 * Interacts with /api/compliance/requirements/ and /api/compliance/records/
 */
export const complianceApi = {
  /**
   * Fetch paginated list of compliance requirements (ADs, SBs, etc.)
   * GET /api/compliance/requirements/
   */
  async getRequirements(params = {}) {
    const response = await apiClient.get(ENDPOINTS.COMPLIANCE.REQUIREMENTS, { params });
    return response.data;
  },

  /**
   * Fetch full details of a compliance requirement (includes compliance_records array).
   * GET /api/compliance/requirements/{id}/
   */
  async getRequirementDetail(id) {
    const response = await apiClient.get(ENDPOINTS.COMPLIANCE.REQUIREMENT_DETAIL(id));
    return response.data;
  },

  /**
   * Create a new compliance requirement mandate.
   * POST /api/compliance/requirements/
   */
  async createRequirement(data) {
    const response = await apiClient.post(ENDPOINTS.COMPLIANCE.REQUIREMENTS, data);
    return response.data;
  },

  /**
   * Update full compliance requirement mandate.
   * PUT /api/compliance/requirements/{id}/
   */
  async updateRequirement(id, data) {
    const response = await apiClient.put(ENDPOINTS.COMPLIANCE.REQUIREMENT_DETAIL(id), data);
    return response.data;
  },

  /**
   * Partially update compliance requirement (e.g. status transition, notes, assigned_to).
   * PATCH /api/compliance/requirements/{id}/
   */
  async patchRequirement(id, data) {
    const response = await apiClient.patch(ENDPOINTS.COMPLIANCE.REQUIREMENT_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete compliance requirement (ADMIN only).
   * DELETE /api/compliance/requirements/{id}/
   */
  async deleteRequirement(id) {
    const response = await apiClient.delete(ENDPOINTS.COMPLIANCE.REQUIREMENT_DETAIL(id));
    return response.data;
  },

  /**
   * Fetch paginated compliance verification audit records.
   * GET /api/compliance/records/
   */
  async getRecords(params = {}) {
    const response = await apiClient.get(ENDPOINTS.COMPLIANCE.RECORDS, { params });
    return response.data;
  },

  /**
   * Fetch single verification audit record detail.
   * GET /api/compliance/records/{id}/
   */
  async getRecordDetail(id) {
    const response = await apiClient.get(ENDPOINTS.COMPLIANCE.RECORD_DETAIL(id));
    return response.data;
  },

  /**
   * Create a verification audit record.
   * POST /api/compliance/records/
   */
  async createRecord(data) {
    const response = await apiClient.post(ENDPOINTS.COMPLIANCE.RECORDS, data);
    return response.data;
  },

  /**
   * Update verification audit record.
   * PUT /api/compliance/records/{id}/
   */
  async updateRecord(id, data) {
    const response = await apiClient.put(ENDPOINTS.COMPLIANCE.RECORD_DETAIL(id), data);
    return response.data;
  },

  /**
   * Partially update verification audit record.
   * PATCH /api/compliance/records/{id}/
   */
  async patchRecord(id, data) {
    const response = await apiClient.patch(ENDPOINTS.COMPLIANCE.RECORD_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete verification audit record (ADMIN only).
   * DELETE /api/compliance/records/{id}/
   */
  async deleteRecord(id) {
    const response = await apiClient.delete(ENDPOINTS.COMPLIANCE.RECORD_DETAIL(id));
    return response.data;
  },
};

export default complianceApi;
