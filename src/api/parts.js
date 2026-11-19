import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Spare Parts Inventory API Service
 * Interacts with /api/inventory/parts/ and /api/inventory/transactions/
 */
export const partsApi = {
  /**
   * Fetch paginated list of spare parts with optional search/filtering.
   * GET /api/inventory/parts/
   */
  async getParts(params = {}) {
    const response = await apiClient.get(ENDPOINTS.INVENTORY.PARTS, { params });
    return response.data;
  },

  /**
   * Fetch full details of a single spare part including recent transaction history.
   * GET /api/inventory/parts/{id}/
   */
  async getPartDetail(id) {
    const response = await apiClient.get(ENDPOINTS.INVENTORY.PART_DETAIL(id));
    return response.data;
  },

  /**
   * Create a new spare part.
   * POST /api/inventory/parts/
   */
  async createPart(data) {
    const response = await apiClient.post(ENDPOINTS.INVENTORY.PARTS, data);
    return response.data;
  },

  /**
   * Update full spare part record.
   * PUT /api/inventory/parts/{id}/
   */
  async updatePart(id, data) {
    const response = await apiClient.put(ENDPOINTS.INVENTORY.PART_DETAIL(id), data);
    return response.data;
  },

  /**
   * Partially update spare part (e.g. quantity, location, threshold).
   * PATCH /api/inventory/parts/{id}/
   */
  async patchPart(id, data) {
    const response = await apiClient.patch(ENDPOINTS.INVENTORY.PART_DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete spare part (ADMIN only).
   * DELETE /api/inventory/parts/{id}/
   */
  async deletePart(id) {
    const response = await apiClient.delete(ENDPOINTS.INVENTORY.PART_DETAIL(id));
    return response.data;
  },

  /**
   * Fetch paginated list of inventory transactions.
   * GET /api/inventory/transactions/
   */
  async getTransactions(params = {}) {
    const response = await apiClient.get(ENDPOINTS.INVENTORY.TRANSACTIONS, { params });
    return response.data;
  },

  /**
   * Record a new inventory transaction (Receipt, Issue, Adjustment, Return).
   * POST /api/inventory/transactions/
   */
  async createTransaction(data) {
    const response = await apiClient.post(ENDPOINTS.INVENTORY.TRANSACTIONS, data);
    return response.data;
  },
};

export default partsApi;
