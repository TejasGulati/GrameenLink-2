import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:8000/api';

  const initializeAxios = useCallback(() => {
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const setAuthTokens = useCallback((data) => {
    if (data?.access) {
      localStorage.setItem('access_token', data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    }
    if (data?.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    if (data?.user) {
      setUser(data.user);
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const apiRequest = useCallback(async (method, url, config = {}) => {
    try {
      const response = await axios({
        method,
        url,
        data: config.data,
        params: config.params,
        headers: config.headers
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      setError(errorData);
      
      // Only clear auth if the error is a 401 and not a token refresh endpoint
      if (error.response?.status === 401 && !url.includes('/auth/refresh/')) {
        clearAuth();
      }
      throw errorData;
    }
  }, [clearAuth]);

  // Auth functions
  const register = useCallback(async (userData) => {
    try {
      const data = await apiRequest('post', '/auth/register/', { data: userData });
      // Don't automatically authenticate the user after registration
      // Just return the registration data
      return data;
    } catch (error) {
      throw error;
    }
  }, [apiRequest]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiRequest('post', '/auth/login/', { 
        data: { email, password } 
      });
      setAuthTokens(data);
      return data.user;
    } catch (error) {
      throw error;
    }
  }, [apiRequest, setAuthTokens]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiRequest('post', '/auth/logout/', { 
          data: { refresh: refreshToken } 
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  }, [apiRequest, clearAuth]);

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error("No refresh token available");
      }
      
      const data = await apiRequest('post', '/auth/refresh/', { 
        data: { refresh } 
      });
      
      setAuthTokens({
        access: data.access,
        refresh: data.refresh || refresh
      });
      
      return data.access;
    } catch (err) {
      clearAuth();
      throw err;
    }
  }, [apiRequest, setAuthTokens, clearAuth]);

  // User management
  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await apiRequest('get', '/auth/user/');
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  }, [apiRequest]);

  const updateUserProfile = useCallback(async (userData) => {
    return apiRequest('put', '/auth/user/', { data: userData });
  }, [apiRequest]);

  // Admin endpoints
  const fetchAdminUsers = useCallback(async (params = {}) => {
    return apiRequest('get', '/auth/admin/users/', { params });
  }, [apiRequest]);

  const fetchAdminUserDetail = useCallback(async (userId) => {
    return apiRequest('get', `/auth/admin/users/${userId}/`);
  }, [apiRequest]);

  const createAdminUser = useCallback(async (userData) => {
    return apiRequest('post', '/auth/admin/users/', { data: userData });
  }, [apiRequest]);

  const updateAdminUser = useCallback(async (userId, userData) => {
    return apiRequest('put', `/auth/admin/users/${userId}/`, { data: userData });
  }, [apiRequest]);

  const deleteAdminUser = useCallback(async (userId) => {
    return apiRequest('delete', `/auth/admin/users/${userId}/`);
  }, [apiRequest]);

  // Initialize auth
  useEffect(() => {
    initializeAxios();
    
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await apiRequest('get', '/auth/validate-token/');
        await fetchUserProfile();
      } catch (err) {
        // Don't immediately clear auth on token validation failure
        // The interceptor will handle token refresh if needed
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [apiRequest, fetchUserProfile, clearAuth, initializeAxios]);

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Don't try to refresh if we're already trying to refresh
            if (originalRequest.url !== '/api/auth/refresh/') {
              const newToken = await refreshToken();
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear auth and proceed with rejection
            clearAuth();
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken, clearAuth]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    apiRequest,
    register,
    login,
    logout,
    refreshToken,
    fetchUserProfile,
    updateUserProfile,
    fetchAdminUsers,
    fetchAdminUserDetail,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    setAuthTokens,
    clearAuth
  }), [
    user,
    loading,
    error,
    apiRequest,
    register,
    login,
    logout,
    refreshToken,
    fetchUserProfile,
    updateUserProfile,
    fetchAdminUsers,
    fetchAdminUserDetail,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    setAuthTokens,
    clearAuth
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};