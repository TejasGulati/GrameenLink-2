import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MarketplaceContext } from '../../context/MarketplaceContext';
import MarketplaceTabs from './MarketplaceTabs';
import MarketplaceModals from './MarketplaceModals';
import MarketplaceSections from './MarketplaceSections';
import { ShoppingBag } from 'react-feather';

const Marketplace2 = () => {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useContext(AuthContext);
  const {
    fetchProducts, createProduct, updateProduct, deleteProduct, fetchProductPriceHistory, generateProductDescription,
    fetchProductCategories, createProductCategory, updateProductCategory, deleteProductCategory,
    fetchOrders, createOrder, updateOrder, cancelOrder, fetchOrderDetail,
    fetchRetailerDemands, createDemand, updateDemand, deleteDemand, fulfillDemand,
    fetchAllReviews, fetchProductReviews, createProductReview, updateReview, approveProductReview, deleteReview, fetchReviewDetail,
    getPricingRecommendations, getDemandPrediction
  } = useContext(MarketplaceContext);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('marketplaceActiveTab') || 'products';
  });

  const [data, setData] = useState({
    products: [], 
    categories: [], 
    orders: [], 
    orderItems: [], 
    demands: [], 
    reviews: [], 
    priceHistory: [], 
    recommendations: [], 
    predictions: [], 
    reviewDetail: null,
    productReviews: []
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
    pageSize: 10, 
    total: 0 
  });

  useEffect(() => {
    localStorage.setItem('marketplaceActiveTab', activeTab);
  }, [activeTab]);

  const extractData = useCallback((response) => {
    if (!response) return [];
    
    if (response.data?.results) return response.data.results;
    if (response.results?.data) return response.results.data;
    if (response.data?.data) return response.data.data;
    
    if (response.data) {
      if (Array.isArray(response.data)) return response.data;
      if (typeof response.data === 'object') return [response.data];
    }
    
    if (Array.isArray(response)) return response;
    if (typeof response === 'object') return [response];
    
    console.warn('Unexpected response format:', response);
    return [];
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
        case 'products':
          response = await fetchProducts(params);
          setData(prev => ({ ...prev, 
            products: extractData(response),
            priceHistory: selectedItem?.id === prev.selectedItem?.id ? prev.priceHistory : []
          }));
          break;
        case 'categories':
          response = await fetchProductCategories(params);
          setData(prev => ({ ...prev, categories: extractData(response) }));
          break;
        case 'orders':
          response = await fetchOrders(params);
          setData(prev => ({ ...prev, 
            orders: extractData(response),
            orderItems: []
          }));
          break;
        case 'orderItems':
          if (selectedItem) {
            response = await fetchOrderDetail(selectedItem.id);
            setData(prev => ({ ...prev, 
              orderItems: extractData(response)?.items || []
            }));
          }
          break;
        case 'demands':
          response = await fetchRetailerDemands(params);
          setData(prev => ({ ...prev, demands: extractData(response) }));
          break;
        case 'reviews':
          response = await fetchAllReviews(params);
          setData(prev => ({ ...prev, reviews: extractData(response) }));
          break;
        case 'productReviews':
          if (selectedItem) {
            response = await fetchProductReviews(selectedItem.id, params);
            setData(prev => ({ ...prev, productReviews: extractData(response) }));
          }
          break;
        case 'reviewDetail':
          if (selectedItem) {
            response = await fetchReviewDetail(selectedItem.id);
            setData(prev => ({ ...prev, 
              reviewDetail: extractData(response)[0] 
            }));
          }
          break;
        case 'priceHistory':
          if (selectedItem) {
            response = await fetchProductPriceHistory(selectedItem.id);
            setData(prev => ({ ...prev, priceHistory: extractData(response) }));
          }
          break;
        case 'recommendations':
          response = await getPricingRecommendations();
          setData(prev => ({ ...prev, recommendations: extractData(response)?.recommendations || [] }));
          break;
        case 'predictions':
          response = await getDemandPrediction({ days: 30 });
          setData(prev => ({ ...prev, predictions: extractData(response)?.predictions || [] }));
          break;
      }

      const paginationData = response?.data?.pagination || 
                           response?.pagination || 
                           { count: response?.data?.count, page: response?.data?.page };
      
      if (paginationData) {
        setPagination(prev => ({
          ...prev,
          total: paginationData.count || prev.total,
          page: paginationData.page || prev.page,
          pageSize: paginationData.page_size || prev.pageSize
        }));
      }
      
      if (resetPagination) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to load ${type}` }));
      console.error(`Error loading ${type}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [
    activeTab, searchQuery, pagination.page, pagination.pageSize, filters, 
    selectedItem, extractData, fetchProducts, fetchProductCategories, 
    fetchOrders, fetchOrderDetail, fetchRetailerDemands, fetchAllReviews,
    fetchReviewDetail, fetchProductPriceHistory, getPricingRecommendations,
    getDemandPrediction, fetchProductReviews
  ]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, activeTab, loadData]);

  useEffect(() => {
    if (selectedItem) {
      if (activeTab === 'products') loadData('priceHistory');
      if (activeTab === 'orders') loadData('orderItems');
      if (activeTab === 'reviews') loadData('reviewDetail');
      if (activeTab === 'products' && selectedItem) loadData('productReviews');
    }
  }, [selectedItem, activeTab, loadData]);

  const handleSubmit = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));
    
    try {
      let response;
      const commonData = {
        ...formData,
        ...(type === 'product' && { distributor_id: user.id }),
        ...(type === 'order' && { retailer_id: user.id }),
        ...(type === 'demand' && { retailer_id: user.id }),
        ...(type === 'review' && { retailer_id: user.id, product_id: selectedItem?.product?.id || selectedItem?.id })
      };

      switch(type) {
        case 'product':
          response = selectedItem ? 
            await updateProduct(selectedItem.id, commonData) :
            await createProduct(commonData);
          break;
        case 'category':
          response = selectedItem ? 
            await updateProductCategory(selectedItem.id, formData) :
            await createProductCategory(formData);
          break;
        case 'order':
          response = selectedItem ?
            await updateOrder(selectedItem.id, formData) :
            await createOrder({
              ...formData,
              items: formData.items?.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity
              }))
            });
          break;
        case 'demand':
          response = selectedItem ?
            await updateDemand(selectedItem.id, commonData) :
            await createDemand(commonData);
          break;
        case 'review':
          response = selectedItem ?
            await updateReview(selectedItem.id, formData) :
            await createProductReview(commonData);
          break;
        case 'fulfillDemand':
          response = await fulfillDemand(selectedItem.id);
          break;
        case 'approveReview':
          response = await approveProductReview(selectedItem.id);
          break;
        case 'cancelOrder':
          response = await cancelOrder(selectedItem.id);
          break;
      }

      if (response) {
        setShowModal(null);
        setSelectedItem(null);
        setFormData({});
        loadData(activeTab, true);
        if (type === 'product') loadData('recommendations');
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to ${selectedItem ? 'update' : 'create'} ${type}` }));
      console.error(`Error in ${type} submission:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      switch(type) {
        case 'product': await deleteProduct(id); break;
        case 'category': await deleteProductCategory(id); break;
        case 'demand': await deleteDemand(id); break;
        case 'review': await deleteReview(id); break;
      }
      loadData(activeTab, true);
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to delete ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleAI = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let response;
      if (type === 'description') {
        response = await generateProductDescription(selectedItem.id);
      } else if (type === 'recommendations') {
        response = await getPricingRecommendations();
      } else if (type === 'predictions') {
        response = await getDemandPrediction({ days: 30 });
      }
      
      const result = extractData(response);
      setAiResult(Array.isArray(result) ? result[0] : result);
      setShowModal('aiResult');
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to generate ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setFormData({});
    setSearchQuery('');
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(tab, true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadData(activeTab, true);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    loadData();
  };

  const handlePageSizeChange = (size) => {
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }));
    loadData(activeTab, true);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [filterType]: value
      }
    }));
    loadData(activeTab, true);
  };

  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    activeTab,
    data,
    loading,
    errors,
    searchQuery,
    selectedItem,
    formData,
    showModal,
    aiResult,
    filters,
    pagination,
    setActiveTab: handleTabChange,
    setSearchQuery: handleSearch,
    setSelectedItem,
    setFormData,
    setShowModal,
    handleAI,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    loadData
  }), [
    user,
    isAdmin,
    activeTab,
    data,
    loading,
    errors,
    searchQuery,
    selectedItem,
    formData,
    showModal,
    aiResult,
    filters,
    pagination,
    handleTabChange,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    loadData
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {!authLoading && !isAuthenticated ? (
        <div className="text-center py-20">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Marketplace Access Required</h2>
          <p className="text-gray-600">Please sign in to access the marketplace features</p>
        </div>
      ) : (
        <div>
          <MarketplaceTabs {...contextValue} />
          <MarketplaceSections {...contextValue} />
          <MarketplaceModals {...contextValue} />
        </div>
      )}
    </div>
  );
};

export default Marketplace2;