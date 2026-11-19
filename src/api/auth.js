import apiClient, { API_BASE_URL } from './client';
import { ENDPOINTS } from './endpoints';
import axios from 'axios';

/**
 * Authentication API Service
 * Interacts directly with the FlightFix Django backend auth endpoints.
 */

export const authApi = {
  /**
   * Log in user with username/email and password.
   * POST /api/auth/login/
   */
  async login(username, password) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      username: username.trim(),
      password,
    });
    return response.data;
  },

  /**
   * Register a new user.
   * POST /api/auth/register/
   */
  async register(registrationData) {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
      username: registrationData.username.trim(),
      email: registrationData.email.trim(),
      password: registrationData.password,
      first_name: registrationData.first_name.trim(),
      last_name: registrationData.last_name.trim(),
      phone: registrationData.phone ? registrationData.phone.trim() : '',
      role: registrationData.role || 'FIELD_TECHNICIAN',
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user profile.
   * GET /api/auth/me/
   */
  async getCurrentUser() {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Refresh JWT access token.
   * POST /api/auth/refresh/
   */
  async refreshAccessToken(refreshToken) {
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },
};

export default authApi;
