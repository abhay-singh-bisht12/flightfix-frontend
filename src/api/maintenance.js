import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Maintenance Planning & Scheduling API Service
 */
export const maintenanceApi = {
  // Maintenance Schedule endpoints
  async getSchedules(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE.SCHEDULES, { params });
    return response.data;
  },

  async getScheduleDetail(id) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id));
    return response.data;
  },

  async createSchedule(data) {
    const response = await apiClient.post(ENDPOINTS.MAINTENANCE.SCHEDULES, data);
    return response.data;
  },

  async updateSchedule(id, data) {
    const response = await apiClient.put(ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id), data);
    return response.data;
  },

  async patchSchedule(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id), data);
    return response.data;
  },

  async deleteSchedule(id) {
    const response = await apiClient.delete(ENDPOINTS.MAINTENANCE.SCHEDULE_DETAIL(id));
    return response.data;
  },

  // Maintenance Task endpoints
  async getTasks(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE.TASKS, { params });
    return response.data;
  },

  async getTaskDetail(id) {
    const response = await apiClient.get(ENDPOINTS.MAINTENANCE.TASK_DETAIL(id));
    return response.data;
  },

  async createTask(data) {
    const response = await apiClient.post(ENDPOINTS.MAINTENANCE.TASKS, data);
    return response.data;
  },

  async updateTask(id, data) {
    const response = await apiClient.put(ENDPOINTS.MAINTENANCE.TASK_DETAIL(id), data);
    return response.data;
  },

  async patchTask(id, data) {
    const response = await apiClient.patch(ENDPOINTS.MAINTENANCE.TASK_DETAIL(id), data);
    return response.data;
  },

  async deleteTask(id) {
    const response = await apiClient.delete(ENDPOINTS.MAINTENANCE.TASK_DETAIL(id));
    return response.data;
  },
};

export default maintenanceApi;
