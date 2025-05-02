import React from 'react';
import {
  Package, ShoppingCart, ClipboardList, Star, Tag,
  Plus, Loader, AlertCircle, Archive, Eye, Edit,
  Trash2, XCircle, PackagePlus, TrendingUp,
  CheckCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { DataTable, formatCurrency, statusBadge, formatDate } from './MarketplaceUtils';

const MarketplaceSections = ({
  activeTab, 
  user, 
  isAdmin, 
  data, 
  loading, 
  errors, 
  searchQuery,
  setSearchQuery, 
  setSelectedItem, 
  setFormData, 
  setShowModal,
  handleAI, 
  filters, 
  setFilters, 
  pagination, 
  setPagination, 
  loadData
}) => {
  const ProductSection = () => {
    const productColumns = [
      { 
        key: 'name', 
        label: 'Product Name',
        render: item => (
          <div className="flex items-center">
            {item.name}
            {!item.is_active && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                Inactive
              </span>
            )}
          </div>
        )
      },
      { 
        key: 'category_name', 
        label: 'Category',
        render: item => item.category?.name || 'Uncategorized'
      },
      { 
        key: 'price_per_unit', 
        label: 'Price',
        render: item => formatCurrency(item.price_per_unit)
      },
      { 
        key: 'available_quantity', 
        label: 'Stock',
        render: item => `${item.available_quantity} ${item.unit}`
      },
      { 
        key: 'rating', 
        label: 'Rating',
        render: item => (
          <div className="flex items-center">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <span className="ml-1">{item.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        )
      },
      { 
        key: 'distributor_company', 
        label: 'Distributor',
        render: item => item.distributor?.company || 'N/A'
      }
    ];

    const productActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('productDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit product',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            name: item.name,
            category_id: item.category?.id,
            price_per_unit: item.price_per_unit,
            cost_per_unit: item.cost_per_unit,
            available_quantity: item.available_quantity,
            unit: item.unit,
            description: item.description,
            is_active: item.is_active,
            min_order_quantity: item.min_order_quantity,
            tags: item.tags || [],
            image: item.image
          });
          setShowModal('productForm');
        },
        condition: (item) => user.user_type === 'distributor' || isAdmin
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete product',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteProduct');
        },
        condition: (item) => (user.user_type === 'distributor' && item.distributor?.id === user.id) || isAdmin
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="text-indigo-600" /> Product Catalog
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            <div className="flex gap-2">
              {(user.user_type === 'distributor' || isAdmin) && (
                <>
                  <button
                    onClick={() => handleAI('pricing-recommendations')}
                    className="btn bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-2 whitespace-nowrap"
                    disabled={loading.recommendations}
                  >
                    {loading.recommendations ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <>
                        <TrendingUp size={16} />
                        <span className="hidden sm:inline">Pricing AI</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      setFormData({
                        name: '',
                        category_id: '',
                        price_per_unit: 0,
                        cost_per_unit: 0,
                        available_quantity: 0,
                        unit: 'kg',
                        min_order_quantity: 1,
                        description: '',
                        is_active: true,
                        tags: [],
                        image: null
                      });
                      setShowModal('productForm');
                    }}
                    className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Product</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {errors.products && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.products}
          </div>
        )}

        <DataTable
          items={data.products || []}
          columns={productColumns}
          actions={productActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('productDetails');
          }}
          loading={loading.products}
          emptyMessage="No products found. Try adjusting your search or create a new product."
        />

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} products
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  loadData();
                }}
                disabled={pagination.page === 1}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadData();
                }}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OrderSection = () => {
    const orderColumns = [
      { 
        key: 'id', 
        label: 'Order ID',
        render: item => `#${item.id}`
      },
      { 
        key: 'retailer_name', 
        label: 'Retailer',
        render: item => item.retailer?.name || 'N/A'
      },
      { 
        key: 'node_name', 
        label: 'Node',
        render: item => item.node?.name || 'Not assigned'
      },
      { 
        key: 'status', 
        label: 'Status',
        render: item => statusBadge(item.status, 'order')
      },
      { 
        key: 'total_amount', 
        label: 'Total',
        render: item => formatCurrency(item.total_amount)
      },
      { 
        key: 'order_date', 
        label: 'Date',
        render: item => formatDate(item.order_date)
      }
    ];

    const orderActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('orderDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit order',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            status: item.status,
            payment_status: item.payment_status,
            delivery_address: item.delivery_address,
            delivery_notes: item.delivery_notes,
            notes: item.notes,
            node_id: item.node?.id
          });
          setShowModal('orderForm');
        },
        condition: (item) => 
          (user.user_type === 'retailer' && item.status === 'pending') || 
          (isAdmin && ['pending', 'confirmed'].includes(item.status))
      },
      {
        name: 'cancel',
        icon: XCircle,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Cancel order',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('cancelOrder');
        },
        condition: (item) => 
          (user.user_type === 'retailer' && ['pending', 'confirmed'].includes(item.status)) ||
          (isAdmin && ['pending', 'confirmed', 'processing'].includes(item.status))
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" /> Orders
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            {user.user_type === 'retailer' && (
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFormData({
                    status: 'pending',
                    payment_status: 'pending',
                    delivery_address: '',
                    items: [],
                    node_id: null
                  });
                  setShowModal('orderForm');
                }}
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Create Order</span>
              </button>
            )}
          </div>
        </div>

        {errors.orders && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.orders}
          </div>
        )}

        <DataTable
          items={data.orders || []}
          columns={orderColumns}
          actions={orderActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('orderDetails');
          }}
          loading={loading.orders}
          emptyMessage="No orders found. Try adjusting your search or create a new order."
        />

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} orders
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  loadData();
                }}
                disabled={pagination.page === 1}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadData();
                }}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DemandSection = () => {
    const demandColumns = [
      { 
        key: 'product_name', 
        label: 'Product',
        render: item => item.product?.name || 'N/A'
      },
      { 
        key: 'quantity', 
        label: 'Quantity',
        render: item => `${item.quantity} ${item.product?.unit || ''}`
      },
      { 
        key: 'priority', 
        label: 'Priority',
        render: item => statusBadge(item.priority, 'demand')
      },
      { 
        key: 'fulfilled', 
        label: 'Status',
        render: item => statusBadge(item.fulfilled ? 'fulfilled' : 'pending', 'demand')
      },
      { 
        key: 'recorded_at', 
        label: 'Date',
        render: item => formatDate(item.recorded_at)
      },
      { 
        key: 'retailer_name', 
        label: 'Retailer',
        render: item => item.retailer?.name || 'N/A'
      }
    ];

    const demandActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('demandDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit demand',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            product_id: item.product?.id,
            quantity: item.quantity,
            priority: item.priority,
            notes: item.notes
          });
          setShowModal('demandForm');
        },
        condition: (item) => user.user_type === 'retailer' && !item.fulfilled
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete demand',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteDemand');
        },
        condition: (item) => user.user_type === 'retailer' && !item.fulfilled
      },
      {
        name: 'fulfill',
        icon: CheckCircle,
        color: 'text-green-600 hover:bg-green-50',
        tooltip: 'Fulfill demand',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('fulfillDemand');
        },
        condition: (item) => !item.fulfilled && (user.user_type === 'node' || isAdmin)
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ClipboardList className="text-indigo-600" /> Retailer Demands
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search demands..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            {user.user_type === 'retailer' && (
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFormData({
                    product_id: '',
                    quantity: 1,
                    priority: 'medium',
                    notes: ''
                  });
                  setShowModal('demandForm');
                }}
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Create Demand</span>
              </button>
            )}
          </div>
        </div>

        {errors.demands && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.demands}
          </div>
        )}

        <DataTable
          items={data.demands || []}
          columns={demandColumns}
          actions={demandActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('demandDetails');
          }}
          loading={loading.demands}
          emptyMessage="No demands found. Try adjusting your search or create a new demand."
        />

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} demands
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  loadData();
                }}
                disabled={pagination.page === 1}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadData();
                }}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReviewSection = () => {
    const reviewColumns = [
      { 
        key: 'product_name', 
        label: 'Product',
        render: item => item.product?.name || 'N/A'
      },
      { 
        key: 'rating', 
        label: 'Rating',
        render: item => (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                size={16}
              />
            ))}
          </div>
        )
      },
      { 
        key: 'is_approved', 
        label: 'Status',
        render: item => statusBadge(item.is_approved ? 'approved' : 'pending', 'review')
      },
      { 
        key: 'created_at', 
        label: 'Date',
        render: item => formatDate(item.created_at)
      },
      { 
        key: 'retailer_name', 
        label: 'Retailer',
        render: item => item.retailer?.name || 'N/A'
      }
    ];

    const reviewActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('reviewDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit review',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            rating: item.rating,
            review: item.review
          });
          setShowModal('reviewForm');
        },
        condition: (item) => item.retailer?.id === user.id
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete review',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteReview');
        },
        condition: (item) => item.retailer?.id === user.id || isAdmin
      },
      {
        name: 'approve',
        icon: CheckCircle,
        color: 'text-green-600 hover:bg-green-50',
        tooltip: 'Approve review',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('approveReview');
        },
        condition: (item) => !item.is_approved && isAdmin
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Star className="text-indigo-600" /> Product Reviews
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
          </div>
        </div>

        {errors.reviews && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.reviews}
          </div>
        )}

        <DataTable
          items={data.reviews || []}
          columns={reviewColumns}
          actions={reviewActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('reviewDetails');
          }}
          loading={loading.reviews}
          emptyMessage="No reviews found. Try adjusting your search."
        />

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} reviews
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  loadData();
                }}
                disabled={pagination.page === 1}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadData();
                }}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CategorySection = () => {
    const categoryColumns = [
      { 
        key: 'name', 
        label: 'Category Name'
      },
      { 
        key: 'product_count', 
        label: 'Products',
        render: item => `${item.product_count || 0} products`
      },
      { 
        key: 'created_at', 
        label: 'Created',
        render: item => formatDate(item.created_at)
      }
    ];

    const categoryActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('categoryDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit category',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            name: item.name,
            description: item.description,
            image: item.image
          });
          setShowModal('categoryForm');
        },
        condition: () => isAdmin
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete category',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteCategory');
        },
        condition: () => isAdmin
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Tag className="text-indigo-600" /> Product Categories
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFormData({
                    name: '',
                    description: '',
                    image: null
                  });
                  setShowModal('categoryForm');
                }}
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Category</span>
              </button>
            )}
          </div>
        </div>

        {errors.categories && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.categories}
          </div>
        )}

        <DataTable
          items={data.categories || []}
          columns={categoryColumns}
          actions={categoryActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('categoryDetails');
          }}
          loading={loading.categories}
          emptyMessage="No categories found. Try adjusting your search or create a new category."
        />

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} categories
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  loadData();
                }}
                disabled={pagination.page === 1}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadData();
                }}
                disabled={pagination.page * pagination.pageSize >= pagination.total}
                className="btn bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {activeTab === 'products' && <ProductSection />}
      {activeTab === 'orders' && <OrderSection />}
      {activeTab === 'demands' && <DemandSection />}
      {activeTab === 'reviews' && <ReviewSection />}
      {activeTab === 'categories' && <CategorySection />}
    </>
  );
};

export default MarketplaceSections;