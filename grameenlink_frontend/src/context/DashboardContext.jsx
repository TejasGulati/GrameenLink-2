import { createContext, useContext, useCallback, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { AuthContext } from './AuthContext';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { apiRequest } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Admin Dashboard Analytics
  const fetchDashboardAnalytics = useCallback(async (params = {}) => {
    return apiRequest('get', '/dashboard/admin/analytics/', { params });
  }, [apiRequest]);

  const generateDashboardAnalytics = useCallback(async (data) => {
    return apiRequest('post', '/dashboard/admin/analytics/generate/', { data });
  }, [apiRequest]);

  const generateAIAnalyticsInsights = useCallback(async (data) => {
    return apiRequest('post', '/dashboard/admin/analytics/generate-ai-insights/', { data });
  }, [apiRequest]);

  // KPIs Management
  const fetchKPIs = useCallback(async (params = {}) => {
    return apiRequest('get', '/dashboard/admin/kpis/', { params });
  }, [apiRequest]);

  const fetchKPIDetail = useCallback(async (kpiId) => {
    return apiRequest('get', `/dashboard/admin/kpis/${kpiId}/`);
  }, [apiRequest]);

  const createKPI = useCallback(async (data) => {
    return apiRequest('post', '/dashboard/admin/kpis/', { data });
  }, [apiRequest]);

  const updateKPI = useCallback(async (kpiId, data) => {
    return apiRequest('put', `/dashboard/admin/kpis/${kpiId}/`, { data });
  }, [apiRequest]);

  const deleteKPI = useCallback(async (kpiId) => {
    return apiRequest('delete', `/dashboard/admin/kpis/${kpiId}/`);
  }, [apiRequest]);

  const updateAllKPIs = useCallback(async () => {
    return apiRequest('post', '/dashboard/admin/kpis/update-all/');
  }, [apiRequest]);

  // User Dashboard
  const fetchUserDashboard = useCallback(async () => {
    return apiRequest('get', '/dashboard/user/');
  }, [apiRequest]);

  const updateDashboardPreferences = useCallback(async (data) => {
    return apiRequest('patch', '/dashboard/user/', { data });
  }, [apiRequest]);

  const generatePersonalizedInsights = useCallback(async (data) => {
    return apiRequest('post', '/dashboard/user/generate-insights/', { data });
  }, [apiRequest]);

  // Notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    return apiRequest('get', '/dashboard/notifications/', { params });
  }, [apiRequest]);
  
  const fetchNotificationDetail = useCallback(async (notificationId) => {
    return apiRequest('get', `/dashboard/notifications/${notificationId}/`);
  }, [apiRequest]);

  const markAllNotificationsRead = useCallback(async () => {
    return apiRequest('post', '/dashboard/notifications/mark-all-read/');
  }, [apiRequest]);

  const deleteNotification = useCallback(async (notificationId) => {
    return apiRequest('delete', `/dashboard/notifications/${notificationId}/`);
  }, [apiRequest]);

  const getUnreadNotificationCount = useCallback(async () => {
    return apiRequest('get', '/dashboard/notifications/unread-count/');
  }, [apiRequest]);

  // Context value
  const contextValue = useMemo(() => ({
    // Analytics
    fetchDashboardAnalytics,
    generateDashboardAnalytics,
    generateAIAnalyticsInsights,
    
    // KPIs
    fetchKPIs,
    fetchKPIDetail,
    createKPI,
    updateKPI,
    deleteKPI,
    updateAllKPIs,
    
    // User Dashboard
    fetchUserDashboard,
    updateDashboardPreferences,
    generatePersonalizedInsights,
    
    // Notifications
    fetchNotifications,
    fetchNotificationDetail,
    markAllNotificationsRead,
    deleteNotification,
    getUnreadNotificationCount,
    
    // Helper functions
    invalidateDashboardQueries: () => {
      queryClient.invalidateQueries('dashboard');
      queryClient.invalidateQueries('analytics');
      queryClient.invalidateQueries('kpis');
      queryClient.invalidateQueries('notifications');
    }
  }), [
    fetchDashboardAnalytics,
    generateDashboardAnalytics,
    generateAIAnalyticsInsights,
    fetchKPIs,
    fetchKPIDetail,
    createKPI,
    updateKPI,
    deleteKPI,
    updateAllKPIs,
    fetchUserDashboard,
    updateDashboardPreferences,
    generatePersonalizedInsights,
    fetchNotifications,
    fetchNotificationDetail,
    markAllNotificationsRead,
    deleteNotification,
    getUnreadNotificationCount,
    queryClient
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};