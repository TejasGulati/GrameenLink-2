import { createContext, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const MarketplaceContext = createContext();

export const MarketplaceProvider = ({ children }) => {
  const { apiRequest } = useContext(AuthContext);

  // Product Categories
  const fetchProductCategories = useCallback(async (params = {}) => {
    return apiRequest('get', '/marketplace/categories/', { params });
  }, [apiRequest]);

  const createProductCategory = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/categories/', { data });
  }, [apiRequest]);

  const fetchCategoryDetail = useCallback(async (categoryId) => {
    return apiRequest('get', `/marketplace/categories/${categoryId}/`);
  }, [apiRequest]);

  const updateProductCategory = useCallback(async (categoryId, data) => {
    return apiRequest('put', `/marketplace/categories/${categoryId}/`, { data });
  }, [apiRequest]);

  const deleteProductCategory = useCallback(async (categoryId) => {
    return apiRequest('delete', `/marketplace/categories/${categoryId}/`);
  }, [apiRequest]);

  // Products
  const fetchProducts = useCallback(async (params = {}) => {
    return apiRequest('get', '/marketplace/products/', { params });
  }, [apiRequest]);

  const createProduct = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/products/', { data });
  }, [apiRequest]);

  const fetchProductDetail = useCallback(async (productId) => {
    return apiRequest('get', `/marketplace/products/${productId}/`);
  }, [apiRequest]);

  const updateProduct = useCallback(async (productId, data) => {
    return apiRequest('put', `/marketplace/products/${productId}/`, { data });
  }, [apiRequest]);

  const deleteProduct = useCallback(async (productId) => {
    return apiRequest('delete', `/marketplace/products/${productId}/`);
  }, [apiRequest]);

  const generateProductDescription = useCallback(async (productId) => {
    return apiRequest('post', `/marketplace/products/${productId}/generate-description/`);
  }, [apiRequest]);

  const fetchProductPriceHistory = useCallback(async (productId, params = {}) => {
    return apiRequest('get', `/marketplace/products/${productId}/price-history/`, { params });
  }, [apiRequest]);

  // Orders
  const fetchOrders = useCallback(async (params = {}) => {
    return apiRequest('get', '/marketplace/orders/', { params });
  }, [apiRequest]);

  const fetchOrderDetail = useCallback(async (orderId) => {
    return apiRequest('get', `/marketplace/orders/${orderId}/`);
  }, [apiRequest]);

  const createOrder = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/orders/', { data });
  }, [apiRequest]);

  const updateOrder = useCallback(async (orderId, data) => {
    return apiRequest('put', `/marketplace/orders/${orderId}/`, { data });
  }, [apiRequest]);

  const cancelOrder = useCallback(async (orderId) => {
    return apiRequest('delete', `/marketplace/orders/${orderId}/`);
  }, [apiRequest]);

  // Retailer Demands
  const fetchRetailerDemands = useCallback(async (params = {}) => {
    return apiRequest('get', '/marketplace/demands/', { params });
  }, [apiRequest]);

  const fetchDemandDetail = useCallback(async (demandId) => {
    return apiRequest('get', `/marketplace/demands/${demandId}/`);
  }, [apiRequest]);

  const createDemand = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/demands/', { data });
  }, [apiRequest]);

  const updateDemand = useCallback(async (demandId, data) => {
    return apiRequest('put', `/marketplace/demands/${demandId}/`, { data });
  }, [apiRequest]);

  const deleteDemand = useCallback(async (demandId) => {
    return apiRequest('delete', `/marketplace/demands/${demandId}/`);
  }, [apiRequest]);

  const fulfillDemand = useCallback(async (demandId) => {
    return apiRequest('post', `/marketplace/demands/${demandId}/fulfill/`);
  }, [apiRequest]);

  // Product Reviews
  const fetchAllReviews = useCallback(async (params = {}) => {
    return apiRequest('get', '/marketplace/reviews/', { params });
  }, [apiRequest]);

  const fetchProductReviews = useCallback(async (productId, params = {}) => {
    return apiRequest('get', `/marketplace/reviews/${productId}/`, { params });
  }, [apiRequest]);

  const createProductReview = useCallback(async (productId, data) => {
    return apiRequest('post', `/marketplace/reviews/${productId}/`, { data });
  }, [apiRequest]);

  const fetchReviewDetail = useCallback(async (reviewId) => {
    return apiRequest('get', `/marketplace/reviews/detail/${reviewId}/`);
  }, [apiRequest]);

  const updateReview = useCallback(async (reviewId, data) => {
    return apiRequest('put', `/marketplace/reviews/detail/${reviewId}/`, { data });
  }, [apiRequest]);

  const approveProductReview = useCallback(async (reviewId) => {
    return apiRequest('post', `/marketplace/reviews/${reviewId}/approve/`);
  }, [apiRequest]);

  const deleteReview = useCallback(async (reviewId) => {
    return apiRequest('delete', `/marketplace/reviews/detail/${reviewId}/`);
  }, [apiRequest]);

  // Pricing & Analytics
  const getPricingRecommendations = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/products/pricing-recommendations/', { data });
  }, [apiRequest]);

  const getDemandPrediction = useCallback(async (data) => {
    return apiRequest('post', '/marketplace/demand-prediction/', { data });
  }, [apiRequest]);

  const contextValue = useMemo(() => ({
    // Product Categories
    fetchProductCategories,
    createProductCategory,
    fetchCategoryDetail,
    updateProductCategory,
    deleteProductCategory,

    // Products
    fetchProducts,
    createProduct,
    fetchProductDetail,
    updateProduct,
    deleteProduct,
    generateProductDescription,
    fetchProductPriceHistory,

    // Orders
    fetchOrders,
    createOrder,
    fetchOrderDetail,
    updateOrder,
    cancelOrder,

    // Retailer Demands
    fetchRetailerDemands,
    createDemand,
    fetchDemandDetail,
    updateDemand,
    deleteDemand,
    fulfillDemand,

    // Product Reviews
    fetchAllReviews,
    fetchProductReviews,
    createProductReview,
    fetchReviewDetail,
    updateReview,
    approveProductReview,
    deleteReview,

    // Pricing & Analytics
    getPricingRecommendations,
    getDemandPrediction

  }), [
    fetchProductCategories,
    createProductCategory,
    fetchCategoryDetail,
    updateProductCategory,
    deleteProductCategory,
    fetchProducts,
    createProduct,
    fetchProductDetail,
    updateProduct,
    deleteProduct,
    generateProductDescription,
    fetchProductPriceHistory,
    fetchOrders,
    createOrder,
    fetchOrderDetail,
    updateOrder,
    cancelOrder,
    fetchRetailerDemands,
    createDemand,
    fetchDemandDetail,
    updateDemand,
    deleteDemand,
    fulfillDemand,
    fetchAllReviews,
    fetchProductReviews,
    createProductReview,
    fetchReviewDetail,
    updateReview,
    approveProductReview,
    deleteReview,
    getPricingRecommendations,
    getDemandPrediction
  ]);

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};