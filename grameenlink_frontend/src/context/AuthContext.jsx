import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://localhost:8000/api';

  // Initialize axios defaults
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/auth/user/');
          setUser(response.data);
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post('/auth/register/', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data || { error: 'Registration failed' });
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/auth/login/', { email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      const userResponse = await axios.get('/auth/user/');
      setUser(userResponse.data);
      return userResponse.data;
    } catch (err) {
      setError(err.response?.data || { error: 'Login failed' });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token');
      
      const response = await axios.post('/auth/refresh/', { refresh });
      localStorage.setItem('access_token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      return response.data.access;
    } catch (err) {
      logout();
      throw err;
    }
  };

  // Node Management Functions
  const fetchNodes = async (params = {}) => {
    try {
      const response = await axios.get('/nodes/nodes/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createNode = async (nodeData) => {
    try {
      const response = await axios.post('/nodes/nodes/', nodeData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchNodeDetail = async (nodeId) => {
    try {
      const response = await axios.get(`/nodes/nodes/${nodeId}/`);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateNode = async (nodeId, nodeData) => {
    try {
      const response = await axios.put(`/nodes/nodes/${nodeId}/`, nodeData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteNode = async (nodeId) => {
    try {
      await axios.delete(`/nodes/nodes/${nodeId}/`);
    } catch (err) {
      throw err;
    }
  };

  const fetchNodePerformance = async (nodeId, params = {}) => {
    try {
      const response = await axios.get(`/nodes/nodes/${nodeId}/performance/`, { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const generateNodeAIInsights = async (nodeId, data) => {
    try {
      const response = await axios.post(`/nodes/nodes/${nodeId}/generate_ai_insights/`, data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Inventory Functions
  const fetchInventory = async (params = {}) => {
    try {
      const response = await axios.get('/nodes/inventory/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createInventoryItem = async (inventoryData) => {
    try {
      const response = await axios.post('/nodes/inventory/', inventoryData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateInventoryItem = async (itemId, inventoryData) => {
    try {
      const response = await axios.put(`/nodes/inventory/${itemId}/`, inventoryData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      await axios.delete(`/nodes/inventory/${itemId}/`);
    } catch (err) {
      throw err;
    }
  };

  const generateRestockRecommendations = async (data) => {
    try {
      const response = await axios.post('/nodes/inventory/generate_restock_recommendations/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Performance Monitoring
  const fetchPerformanceTrends = async (params = {}) => {
    try {
      const response = await axios.get('/nodes/performance/performance_trends/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Routes Optimization Functions
  const fetchRoutes = async (params = {}) => {
    try {
      const response = await axios.get('/nodes/routes/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createRoute = async (routeData) => {
    try {
      const response = await axios.post('/nodes/routes/', routeData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateRoute = async (routeId, routeData) => {
    try {
      const response = await axios.put(`/nodes/routes/${routeId}/`, routeData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteRoute = async (routeId) => {
    try {
      await axios.delete(`/nodes/routes/${routeId}/`);
    } catch (err) {
      throw err;
    }
  };

  const generateOptimizedRoute = async (data) => {
    try {
      const response = await axios.post('/nodes/routes/generate_optimized_route/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Marketplace Functions
  const fetchProducts = async (params = {}) => {
    try {
      const response = await axios.get('/marketplace/products/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchProductCategories = async () => {
    try {
      const response = await axios.get('/marketplace/categories/');
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await axios.post('/marketplace/products/', productData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await axios.put(`/marketplace/products/${productId}/`, productData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`/marketplace/products/${productId}/`);
    } catch (err) {
      throw err;
    }
  };

  const generateProductDescription = async (productId, data) => {
    try {
      const response = await axios.post(`/marketplace/products/${productId}/generate_description/`, data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const generatePricingRecommendations = async (data) => {
    try {
      const response = await axios.post('/marketplace/products/generate_pricing_recommendations/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchOrders = async (params = {}) => {
    try {
      const response = await axios.get('/marketplace/orders/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await axios.post('/marketplace/orders/', orderData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    try {
      const response = await axios.put(`/marketplace/orders/${orderId}/`, orderData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`/marketplace/orders/${orderId}/`);
    } catch (err) {
      throw err;
    }
  };

  const generateOrderSummary = async (orderId, data) => {
    try {
      const response = await axios.post(`/marketplace/orders/${orderId}/generate_summary/`, data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchRetailerDemands = async (params = {}) => {
    try {
      const response = await axios.get('/marketplace/demands/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const createRetailerDemand = async (demandData) => {
    try {
      const response = await axios.post('/marketplace/demands/', demandData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const predictFutureDemand = async (data) => {
    try {
      const response = await axios.post('/marketplace/demands/predict_future_demand/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Dashboard Functions
  const fetchAnalyticsSummary = async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/analytics/summary/', { params });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const generateAIAnalysis = async (data) => {
    try {
      const response = await axios.post('/dashboard/analytics/generate_ai_analysis/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchUserDashboard = async () => {
    try {
      const response = await axios.get('/dashboard/user/');
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchUserRecommendations = async () => {
    try {
      const response = await axios.get('/dashboard/user/recommendations/');
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const generatePersonalizedInsights = async (data) => {
    try {
      const response = await axios.post('/dashboard/user/generate_personalized_insights/', data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Set up axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      register, 
      login, 
      logout,
      
      // Node management
      fetchNodes,
      createNode,
      fetchNodeDetail,
      updateNode,
      deleteNode,
      fetchNodePerformance,
      generateNodeAIInsights,
      
      // Inventory
      fetchInventory,
      createInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      generateRestockRecommendations,
      
      // Performance Monitoring
      fetchPerformanceTrends,
      
      // Routes
      fetchRoutes,
      createRoute,
      updateRoute,
      deleteRoute,
      generateOptimizedRoute,
      
      // Marketplace - Products
      fetchProducts,
      fetchProductCategories,
      createProduct,
      updateProduct,
      deleteProduct,
      generateProductDescription,
      generatePricingRecommendations,
      
      // Marketplace - Orders
      fetchOrders,
      createOrder,
      updateOrder,
      deleteOrder,
      generateOrderSummary,
      
      // Marketplace - Demands
      fetchRetailerDemands,
      createRetailerDemand,
      predictFutureDemand,
      
      // Dashboard
      fetchAnalyticsSummary,
      generateAIAnalysis,
      fetchUserDashboard,
      fetchUserRecommendations,
      generatePersonalizedInsights
    }}>
      {children}
    </AuthContext.Provider>
  );
};