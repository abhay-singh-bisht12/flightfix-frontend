import apiClient, { API_BASE_URL } from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Check backend health status
 * @returns {Promise<{status: string, timestamp?: string, details?: any}>}
 */
export async function checkBackendHealth() {
  try {
    const startTime = performance.now();
    const response = await apiClient.get(ENDPOINTS.HEALTH);
    const latency = Math.round(performance.now() - startTime);

    return {
      success: true,
      data: response.data,
      latency,
      endpoint: `${API_BASE_URL}${ENDPOINTS.HEALTH}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unable to connect to FlightFix backend',
      status: error.response?.status || 'NETWORK_ERROR',
      endpoint: `${API_BASE_URL}${ENDPOINTS.HEALTH}`,
    };
  }
}
