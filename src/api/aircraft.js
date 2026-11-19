import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Aircraft & Equipment Management API Service
 */
export const aircraftApi = {
  // Aircraft Fleet endpoints
  async getAircraftList(params = {}) {
    const response = await apiClient.get(ENDPOINTS.AIRCRAFT.LIST, { params });
    return response.data;
  },

  async getAircraftDetail(id) {
    const response = await apiClient.get(ENDPOINTS.AIRCRAFT.DETAIL(id));
    return response.data;
  },

  async createAircraft(data) {
    const response = await apiClient.post(ENDPOINTS.AIRCRAFT.LIST, data);
    return response.data;
  },

  async updateAircraft(id, data) {
    const response = await apiClient.put(ENDPOINTS.AIRCRAFT.DETAIL(id), data);
    return response.data;
  },

  async patchAircraft(id, data) {
    const response = await apiClient.patch(ENDPOINTS.AIRCRAFT.DETAIL(id), data);
    return response.data;
  },

  async deleteAircraft(id) {
    const response = await apiClient.delete(ENDPOINTS.AIRCRAFT.DETAIL(id));
    return response.data;
  },

  // Equipment endpoints
  async getEquipmentList(params = {}) {
    const response = await apiClient.get(ENDPOINTS.EQUIPMENT.LIST, { params });
    return response.data;
  },

  async getEquipmentDetail(id) {
    const response = await apiClient.get(ENDPOINTS.EQUIPMENT.DETAIL(id));
    return response.data;
  },

  async createEquipment(data) {
    const response = await apiClient.post(ENDPOINTS.EQUIPMENT.LIST, data);
    return response.data;
  },

  async updateEquipment(id, data) {
    const response = await apiClient.put(ENDPOINTS.EQUIPMENT.DETAIL(id), data);
    return response.data;
  },

  async patchEquipment(id, data) {
    const response = await apiClient.patch(ENDPOINTS.EQUIPMENT.DETAIL(id), data);
    return response.data;
  },

  async deleteEquipment(id) {
    const response = await apiClient.delete(ENDPOINTS.EQUIPMENT.DETAIL(id));
    return response.data;
  },
};

export default aircraftApi;
