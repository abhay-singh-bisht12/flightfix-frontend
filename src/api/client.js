import axios from 'axios';

/**
 * FlightFix Centralized Axios Client
 * Configured with baseURL from environment variables, JWT token injection,
 * queue-safe automatic token refresh via POST /api/auth/refresh/,
 * and robust error propagation.
 */

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://flightfix-backend.onrender.com/api';
// Normalize URL so there is no trailing slash for the base
export const API_BASE_URL = rawBaseURL.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach JWT access token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flightfix_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh synchronization state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle 401 Unauthorized with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or original request already handled, pass error through
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/register/') ||
      originalRequest.url?.includes('/auth/refresh/');

    // Handle 401 Unauthorized for protected endpoints
    if (is401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('flightfix_refresh_token');

      // If no refresh token available, session is terminated
      if (!refreshToken) {
        localStorage.removeItem('flightfix_access_token');
        localStorage.removeItem('flightfix_refresh_token');
        localStorage.removeItem('flightfix_user');
        window.dispatchEvent(new CustomEvent('flightfix:auth_expired'));
        return Promise.reject(error);
      }

      // If already refreshing, queue this request until the refresh is resolved
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Execute POST /api/auth/refresh/ using clean axios instance to avoid interceptor loop
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('flightfix_access_token', newAccessToken);

        // If backend rotated the refresh token, store the new one
        if (refreshResponse.data.refresh) {
          localStorage.setItem('flightfix_refresh_token', refreshResponse.data.refresh);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('flightfix_access_token');
        localStorage.removeItem('flightfix_refresh_token');
        localStorage.removeItem('flightfix_user');
        window.dispatchEvent(new CustomEvent('flightfix:auth_expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
