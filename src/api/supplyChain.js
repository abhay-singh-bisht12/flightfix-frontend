import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * ERP & Supply Chain Management API Service
 * Interacts with /api/supply-chain/suppliers/, /api/supply-chain/purchase-orders/, and line items.
 */
export const supplyChainApi = {
  // --- Suppliers / Vendors ---
  async getSuppliers(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SUPPLY_CHAIN.SUPPLIERS, { params });
    return response.data;
  },

  async getSupplierDetail(id) {
    const response = await apiClient.get(ENDPOINTS.SUPPLY_CHAIN.SUPPLIER_DETAIL(id));
    return response.data;
  },

  async createSupplier(data) {
    const response = await apiClient.post(ENDPOINTS.SUPPLY_CHAIN.SUPPLIERS, data);
    return response.data;
  },

  async updateSupplier(id, data) {
    const response = await apiClient.put(ENDPOINTS.SUPPLY_CHAIN.SUPPLIER_DETAIL(id), data);
    return response.data;
  },

  async patchSupplier(id, data) {
    const response = await apiClient.patch(ENDPOINTS.SUPPLY_CHAIN.SUPPLIER_DETAIL(id), data);
    return response.data;
  },

  async deleteSupplier(id) {
    const response = await apiClient.delete(ENDPOINTS.SUPPLY_CHAIN.SUPPLIER_DETAIL(id));
    return response.data;
  },

  // --- Purchase Orders ---
  async getPurchaseOrders(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SUPPLY_CHAIN.PURCHASE_ORDERS, { params });
    return response.data;
  },

  async getPurchaseOrderDetail(id) {
    const response = await apiClient.get(ENDPOINTS.SUPPLY_CHAIN.PO_DETAIL(id));
    return response.data;
  },

  async createPurchaseOrder(data) {
    const response = await apiClient.post(ENDPOINTS.SUPPLY_CHAIN.PURCHASE_ORDERS, data);
    return response.data;
  },

  async updatePurchaseOrder(id, data) {
    const response = await apiClient.put(ENDPOINTS.SUPPLY_CHAIN.PO_DETAIL(id), data);
    return response.data;
  },

  async patchPurchaseOrder(id, data) {
    const response = await apiClient.patch(ENDPOINTS.SUPPLY_CHAIN.PO_DETAIL(id), data);
    return response.data;
  },

  async deletePurchaseOrder(id) {
    const response = await apiClient.delete(ENDPOINTS.SUPPLY_CHAIN.PO_DETAIL(id));
    return response.data;
  },

  /**
   * Receive goods for a purchase order (Goods Receipt).
   * Automatically increments stock in SparePart and logs InventoryTransaction(type=RECEIPT).
   * POST /api/supply-chain/purchase-orders/{id}/receive/
   */
  async receivePurchaseOrderItems(id, payload) {
    const response = await apiClient.post(ENDPOINTS.SUPPLY_CHAIN.PO_RECEIVE(id), payload);
    return response.data;
  },

  // --- Purchase Order Line Items ---
  async getOrderItems(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SUPPLY_CHAIN.PO_ITEMS, { params });
    return response.data;
  },

  async createOrderItem(data) {
    const response = await apiClient.post(ENDPOINTS.SUPPLY_CHAIN.PO_ITEMS, data);
    return response.data;
  },

  async updateOrderItem(id, data) {
    const response = await apiClient.put(ENDPOINTS.SUPPLY_CHAIN.PO_ITEM_DETAIL(id), data);
    return response.data;
  },

  async patchOrderItem(id, data) {
    const response = await apiClient.patch(ENDPOINTS.SUPPLY_CHAIN.PO_ITEM_DETAIL(id), data);
    return response.data;
  },

  async deleteOrderItem(id) {
    const response = await apiClient.delete(ENDPOINTS.SUPPLY_CHAIN.PO_ITEM_DETAIL(id));
    return response.data;
  },
};

export default supplyChainApi;
