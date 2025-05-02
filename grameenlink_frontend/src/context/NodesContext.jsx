import { createContext, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const NodesContext = createContext();

export const NodesProvider = ({ children }) => {
  const { apiRequest } = useContext(AuthContext);

  // Node Management
  const fetchNodes = useCallback(async (params = {}) => {
    return apiRequest('get', '/nodes/', { params });
  }, [apiRequest]);

  const fetchNodeDetail = useCallback(async (nodeId) => {
    return apiRequest('get', `/nodes/${nodeId}/`);
  }, [apiRequest]);

  const createNode = useCallback(async (data) => {
    return apiRequest('post', '/nodes/', { data });
  }, [apiRequest]);

  const updateNode = useCallback(async (nodeId, data) => {
    return apiRequest('patch', `/nodes/${nodeId}/`, { data });
  }, [apiRequest]);

  const deleteNode = useCallback(async (nodeId) => {
    return apiRequest('delete', `/nodes/${nodeId}/`);
  }, [apiRequest]);

  // Node Inventory
  const fetchNodeInventory = useCallback(async (params = {}) => {
    return apiRequest('get', '/nodes/inventory/', { params });
  }, [apiRequest]);

  const fetchInventoryDetail = useCallback(async (inventoryId) => {
    return apiRequest('get', `/nodes/inventory/${inventoryId}/`);
  }, [apiRequest]);

  const createInventoryItem = useCallback(async (data) => {
    return apiRequest('post', '/nodes/inventory/', { data });
  }, [apiRequest]);

  const updateInventoryItem = useCallback(async (inventoryId, data) => {
    return apiRequest('put', `/nodes/inventory/${inventoryId}/`, { data });
  }, [apiRequest]);

  const deleteInventoryItem = useCallback(async (inventoryId) => {
    return apiRequest('delete', `/nodes/inventory/${inventoryId}/`);
  }, [apiRequest]);

  // Node Performance
  const fetchNodePerformance = useCallback(async (params = {}) => {
    return apiRequest('get', '/nodes/performance/', { params });
  }, [apiRequest]);

  const fetchNodeSpecificPerformance = useCallback(async (nodeId, params = {}) => {
    return apiRequest('get', `/nodes/${nodeId}/performance/`, { params });
  }, [apiRequest]);

  const generateNodeAIInsights = useCallback(async (nodeId) => {
    return apiRequest('post', `/nodes/${nodeId}/generate-ai-insights/`);
  }, [apiRequest]);

  // Route Optimization
  const fetchRouteOptimizations = useCallback(async (params = {}) => {
    return apiRequest('get', '/nodes/routes/', { params });
  }, [apiRequest]);

  const createRouteOptimization = useCallback(async (data) => {
    return apiRequest('post', '/nodes/routes/', { data });
  }, [apiRequest]);

  const generateRouteOptimization = useCallback(async () => {
    return apiRequest('post', '/nodes/routes/generate/');
  }, [apiRequest]);

  // Maintenance Logs
  const fetchMaintenanceLogs = useCallback(async (params = {}) => {
    return apiRequest('get', '/nodes/maintenance/', { params });
  }, [apiRequest]);

  const fetchMaintenanceLogDetail = useCallback(async (logId) => {
    return apiRequest('get', `/nodes/maintenance/${logId}/`);
  }, [apiRequest]);

  const fetchNodeMaintenanceLogs = useCallback(async (nodeId, params = {}) => {
    return apiRequest('get', `/nodes/${nodeId}/maintenance/`, { params });
  }, [apiRequest]);

  const createMaintenanceLog = useCallback(async (data) => {
    return apiRequest('post', '/nodes/maintenance/', { data });
  }, [apiRequest]);

  const updateMaintenanceLog = useCallback(async (logId, data) => {
    return apiRequest('put', `/nodes/maintenance/${logId}/`, { data });
  }, [apiRequest]);

  const deleteMaintenanceLog = useCallback(async (logId) => {
    return apiRequest('delete', `/nodes/maintenance/${logId}/`);
  }, [apiRequest]);

  const contextValue = useMemo(() => ({
    // Node Management
    fetchNodes,
    fetchNodeDetail,
    createNode,
    updateNode,
    deleteNode,
    
    // Inventory Management
    fetchNodeInventory,
    fetchInventoryDetail,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Performance Tracking
    fetchNodePerformance,
    fetchNodeSpecificPerformance,
    generateNodeAIInsights,
    
    // Route Optimization
    fetchRouteOptimizations,
    createRouteOptimization,
    generateRouteOptimization,
    
    // Maintenance Logs
    fetchMaintenanceLogs,
    fetchMaintenanceLogDetail,
    fetchNodeMaintenanceLogs,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
  }), [
    fetchNodes,
    fetchNodeDetail,
    createNode,
    updateNode,
    deleteNode,
    fetchNodeInventory,
    fetchInventoryDetail,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    fetchNodePerformance,
    fetchNodeSpecificPerformance,
    generateNodeAIInsights,
    fetchRouteOptimizations,
    createRouteOptimization,
    generateRouteOptimization,
    fetchMaintenanceLogs,
    fetchMaintenanceLogDetail,
    fetchNodeMaintenanceLogs,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog
  ]);

  return (
    <NodesContext.Provider value={contextValue}>
      {children}
    </NodesContext.Provider>
  );
};

export const useNodes = () => {
  const context = useContext(NodesContext);
  if (!context) {
    throw new Error('useNodes must be used within a NodesProvider');
  }
  return context;
};