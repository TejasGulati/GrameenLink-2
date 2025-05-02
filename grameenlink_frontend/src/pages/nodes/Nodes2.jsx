import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { NodesContext } from '../../context/NodesContext';
import NodesTabs from './NodesTabs';
import NodesModals from './NodesModals';
import NodesSections from './NodesSections';
import { Package } from 'lucide-react';

const Nodes2 = () => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    loading: authLoading,
    apiRequest
  } = useContext(AuthContext);
  
  const {
    // Node management
    fetchNodes,
    fetchNodeDetail,
    createNode,
    updateNode,
    deleteNode,
    
    // Inventory management
    fetchNodeInventory,
    fetchInventoryDetail,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Performance tracking
    fetchNodePerformance,
    fetchNodeSpecificPerformance,
    generateNodeAIInsights,
    
    // Route optimization
    fetchRouteOptimizations,
    createRouteOptimization,
    generateRouteOptimization,
    
    // Maintenance logs
    fetchMaintenanceLogs,
    fetchNodeMaintenanceLogs,
    fetchMaintenanceLogDetail,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog
  } = useContext(NodesContext);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('nodesActiveTab') || 'nodes';
  });

  const [data, setData] = useState({
    nodes: [],
    inventory: [],
    performance: [],
    routes: [],
    maintenanceLogs: [],
    aiInsights: null,
    selectedNodeDetails: null
  });

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ 
    page: 1, 
    pageSize: 20, 
    total: 0 
  });

  useEffect(() => {
    localStorage.setItem('nodesActiveTab', activeTab);
  }, [activeTab]);

  const extractData = useCallback((response) => {
    if (!response) return { data: [], pagination: { count: 0, page: 1, pageSize: 20 } };
    
    if (response.error || response.status >= 400) {
      throw new Error(response.error || 'Failed to fetch data');
    }
    
    // Handle paginated responses
    if (response.results !== undefined) {
      return {
        data: response.results,
        pagination: {
          count: response.count || response.results.length,
          page: response.page || 1,
          pageSize: response.page_size || 20
        }
      };
    }
    
    // Handle array responses
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: {
          count: response.length,
          page: 1,
          pageSize: response.length
        }
      };
    }
    
    // Handle single object responses
    if (typeof response === 'object' && !Array.isArray(response)) {
      return {
        data: [response],
        pagination: {
          count: 1,
          page: 1,
          pageSize: 1
        }
      };
    }
    
    console.warn('Unexpected response format:', response);
    return {
      data: [],
      pagination: {
        count: 0,
        page: 1,
        pageSize: 20
      }
    };
  }, []);

  const loadData = useCallback(async (type, resetPagination = false) => {
    if (!type) type = activeTab;
    
    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));
    
    try {
      const params = { 
        search: searchQuery,
        page: resetPagination ? 1 : pagination.page,
        page_size: pagination.pageSize,
        ...filters[type]
      };

      let response;
      
      switch(type) {
        case 'nodes':
          response = await fetchNodes(params);
          const result = extractData(response);
          setData(prev => ({ 
            ...prev, 
            nodes: result.data,
            selectedNodeDetails: selectedItem?.id === prev.selectedItem?.id ? prev.selectedNodeDetails : null
          }));
          setPagination(prev => ({
            ...prev,
            total: result.pagination.count,
            page: result.pagination.page,
            pageSize: result.pagination.pageSize
          }));
          break;
          
        case 'inventory':
          response = await fetchNodeInventory(params);
          const inventoryResult = extractData(response);
          setData(prev => ({ ...prev, inventory: inventoryResult.data }));
          setPagination(prev => ({
            ...prev,
            total: inventoryResult.pagination.count,
            page: inventoryResult.pagination.page,
            pageSize: inventoryResult.pagination.pageSize
          }));
          break;
          
        case 'performance':
          response = selectedItem ? 
            await fetchNodeSpecificPerformance(selectedItem.id, params) :
            await fetchNodePerformance(params);
          const perfResult = extractData(response);
          setData(prev => ({ ...prev, performance: perfResult.data }));
          setPagination(prev => ({
            ...prev,
            total: perfResult.pagination.count,
            page: perfResult.pagination.page,
            pageSize: perfResult.pagination.pageSize
          }));
          break;
          
        case 'routes':
          response = await fetchRouteOptimizations(params);
          const routesResult = extractData(response);
          setData(prev => ({ ...prev, routes: routesResult.data }));
          setPagination(prev => ({
            ...prev,
            total: routesResult.pagination.count,
            page: routesResult.pagination.page,
            pageSize: routesResult.pagination.pageSize
          }));
          break;
          
        case 'maintenance':
          response = selectedItem ? 
            await fetchNodeMaintenanceLogs(selectedItem.id, params) :
            await fetchMaintenanceLogs(params);
          const maintResult = extractData(response);
          setData(prev => ({ ...prev, maintenanceLogs: maintResult.data }));
          setPagination(prev => ({
            ...prev,
            total: maintResult.pagination.count,
            page: maintResult.pagination.page,
            pageSize: maintResult.pagination.pageSize
          }));
          break;
          
        default:
          throw new Error(`Unknown data type: ${type}`);
      }

      if (resetPagination) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to load ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [
    activeTab, searchQuery, pagination.page, pagination.pageSize, filters,
    selectedItem, extractData, fetchNodes, fetchNodeInventory,
    fetchNodePerformance, fetchNodeSpecificPerformance, fetchRouteOptimizations,
    fetchMaintenanceLogs, fetchNodeMaintenanceLogs
  ]);

  const handleSubmit = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));
    
    try {
      let response;

      switch(type) {
        case 'node':
          response = selectedItem ? 
            await updateNode(selectedItem.id, formData) :
            await createNode(formData);
          break;
          
        case 'inventory':
          response = selectedItem ? 
            await updateInventoryItem(selectedItem.id, formData) :
            await createInventoryItem(formData);
          break;
          
        case 'route':
          response = selectedItem ? 
            await createRouteOptimization(formData) :
            await generateRouteOptimization();
          break;
          
        case 'maintenance':
          response = selectedItem ? 
            await updateMaintenanceLog(selectedItem.id, formData) :
            await createMaintenanceLog(formData);
          break;
          
        default:
          throw new Error(`Unknown submission type: ${type}`);
      }

      if (response) {
        setShowModal(null);
        setSelectedItem(null);
        setFormData({});
        loadData(activeTab, true);
      }
    } catch (err) {
      console.error(`Error in ${type} submission:`, err);
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to ${selectedItem ? 'update' : 'create'} ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      switch(type) {
        case 'node': 
          await deleteNode(id); 
          break;
        case 'inventory': 
          await deleteInventoryItem(id); 
          break;
        case 'route':
          await deleteMaintenanceLog(id);
          break;
        case 'maintenance': 
          await deleteMaintenanceLog(id); 
          break;
        default:
          throw new Error(`Unknown deletion type: ${type}`);
      }
      loadData(activeTab, true);
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to delete ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleAI = async () => {
    if (!selectedItem) return;
    
    setLoading(prev => ({ ...prev, aiInsights: true }));
    try {
      const response = await generateNodeAIInsights(selectedItem.id);
      const result = extractData(response);
      setAiResult(result.data?.insights || result.data || result);
      setShowModal('aiResult');
    } catch (err) {
      setErrors(prev => ({ ...prev, aiInsights: err.message || 'Failed to generate insights' }));
    } finally {
      setLoading(prev => ({ ...prev, aiInsights: false }));
    }
  };

  const loadNodeDetails = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(prev => ({ ...prev, details: true }));
      const response = await fetchNodeDetail(selectedItem.id);
      const result = extractData(response);
      setData(prev => ({ ...prev, selectedNodeDetails: result.data[0] || result.data }));
    } catch (err) {
      console.error('Error loading node details:', err);
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  }, [selectedItem, fetchNodeDetail, extractData]);

  // Load data when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, activeTab, loadData]);

  // Load node details when selected item changes
  useEffect(() => {
    if (selectedItem) {
      loadNodeDetails();
      if (activeTab === 'performance') {
        loadData('performance');
      }
    }
  }, [selectedItem, activeTab, loadData, loadNodeDetails]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!authLoading && !isAuthenticated ? (
        <div className="text-center py-20">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Node Access Required</h2>
          <p className="text-gray-600">Please sign in to access the node management features</p>
        </div>
      ) : (
        <div>
          <NodesTabs
            user={user}
            isAdmin={isAdmin}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setPagination={setPagination}
            data={data}
            loading={loading}
            errors={errors}
            setSelectedItem={setSelectedItem}
            setFormData={setFormData}
            setShowModal={setShowModal}
            handleAI={handleAI}
            filters={filters}
            setFilters={setFilters}
            pagination={pagination}
            loadData={loadData}
          >
            <NodesSections
              activeTab={activeTab}
              user={user}
              isAdmin={isAdmin}
              data={data}
              loading={loading}
              errors={errors}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedItem={setSelectedItem}
              setFormData={setFormData}
              setShowModal={setShowModal}
              handleAI={handleAI}
              filters={filters}
              setFilters={setFilters}
              pagination={pagination}
              setPagination={setPagination}
              loadData={loadData}
            />
          </NodesTabs>
          
          <NodesModals
            showModal={showModal}
            setShowModal={setShowModal}
            selectedItem={selectedItem}
            formData={formData}
            setFormData={setFormData}
            data={data}
            loading={loading}
            errors={errors}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            aiResult={aiResult}
            user={user}
            activeTab={activeTab}
          />
        </div>
      )}
    </div>
  );
};

export default Nodes2;