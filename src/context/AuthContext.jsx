import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'ADMIN',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  CONTRACTS_MANAGER: 'CONTRACTS_MANAGER',
  FIELD_TECHNICIAN: 'FIELD_TECHNICIAN',
};

export const ROLE_LABELS = {
  ADMIN: 'System Administrator',
  SAFETY_OFFICER: 'Airworthiness & Safety Officer',
  CONTRACTS_MANAGER: 'Contracts & Procurement Manager',
  FIELD_TECHNICIAN: 'Field Maintenance Technician',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('flightfix_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('flightfix_access_token') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('flightfix_refresh_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Clear session state and storage
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('flightfix_user');
    localStorage.removeItem('flightfix_access_token');
    localStorage.removeItem('flightfix_refresh_token');
  }, []);

  // Save session state and storage
  const saveSession = useCallback((userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    if (refresh) setRefreshToken(refresh);

    localStorage.setItem('flightfix_user', JSON.stringify(userData));
    localStorage.setItem('flightfix_access_token', access);
    if (refresh) {
      localStorage.setItem('flightfix_refresh_token', refresh);
    }
  }, []);

  // Login handler
  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    saveSession(data.user, data.access, data.refresh);
    return data;
  };

  // Register handler (automatic session establishment)
  const register = async (formData) => {
    const data = await authApi.register(formData);
    if (data.access && data.user) {
      saveSession(data.user, data.access, data.refresh);
    }
    return data;
  };

  // Fetch / update fresh user profile from backend
  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      localStorage.setItem('flightfix_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      // If unauthorized and refresh fails, logout is triggered via interceptor
      throw err;
    }
  }, []);

  // Role verification helpers
  const hasRole = useCallback(
    (targetRole) => {
      return user?.role === targetRole;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (allowedRoles) => {
      if (!user?.role || !Array.isArray(allowedRoles)) return false;
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  // Listen to expired event dispatched from axios interceptor
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };

    window.addEventListener('flightfix:auth_expired', handleExpired);
    return () => window.removeEventListener('flightfix:auth_expired', handleExpired);
  }, [logout]);

  // Session hydration on mount
  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const token = localStorage.getItem('flightfix_access_token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const freshUser = await authApi.getCurrentUser();
        if (isMounted) {
          setUser(freshUser);
          localStorage.setItem('flightfix_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        // Token was invalid and refresh failed
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const value = {
    user,
    role: user?.role || null,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken && user),
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
