import React, { useState, useEffect } from 'react'; // Add useState and useEffect to imports
import {
  HardDrive, Box, Activity, Wrench, Plus, Loader, AlertCircle, Eye, Edit,
  Trash2, XCircle, ChevronDown, ChevronLeft, ChevronRight, Search, Route, 
  AlertTriangle, Clock, BarChart, RefreshCw, Map, Package, User, Sliders,
  Info, CircleDollarSign, Truck, Calendar, CheckCircle
} from 'lucide-react';
import { DataTable, statusBadge, formatDate, formatDateTime, formatCurrency } from './NodesUtils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const NodesSections = ({
  activeTab, user, isAdmin, data, loading, errors, searchQuery,selectedItem,
  setSearchQuery, setSelectedItem, setFormData, setShowModal,
  handleAI, filters, setFilters, pagination, setPagination, loadData
}) => {
  const FilterDropdown = ({ options, currentValue, onChange, label }) => (
    <div className="relative">
      <select
        value={currentValue || ''}
        onChange={onChange}
        className="appearance-none pl-3 pr-8 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown size={16} />
      </div>
    </div>
  );

  const RefreshButton = ({ tab }) => (
    <button
      onClick={() => loadData(tab, true)}
      className="btn bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
      disabled={loading[tab]}
    >
      {loading[tab] ? (
        <Loader className="animate-spin" size={16} />
      ) : (
        <RefreshCw size={16} />
      )}
      <span className="hidden sm:inline">Refresh</span>
    </button>
  );

  const PaginationControls = ({ tab }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
        </div>
        <select 
          value={pagination.pageSize}
          onChange={(e) => setPagination(prev => ({ 
            ...prev, 
            pageSize: Number(e.target.value),
            page: 1
          }))}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
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
  );

  const NodeSection = () => {
    const nodeColumns = [
      { 
        key: 'operator_name', 
        label: 'Operator',
        render: item => item.operator_name || 'N/A'
      },
      { 
        key: 'node_type', 
        label: 'Type',
        render: item => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            item.node_type === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {item.node_type === 'primary' ? 'Primary' : 'Sub Node'}
          </span>
        )
      },
      { 
        key: 'coverage_area', 
        label: 'Coverage Area',
        render: item => item.coverage_area || 'N/A'
      },
      { 
        key: 'status', 
        label: 'Status',
        render: item => statusBadge(item.status, 'node')
      },
      { 
        key: 'capacity', 
        label: 'Capacity',
        render: item => `${item.capacity} m³`
      },
      { 
        key: 'established_date', 
        label: 'Established',
        render: item => formatDate(item.established_date)
      }
    ];

    const nodeActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('nodeDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit node',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            operator: item.operator?.id,
            node_type: item.node_type,
            parent_node: item.parent_node?.id,
            coverage_area: item.coverage_area,
            capacity: item.capacity,
            status: item.status,
            service_hours: item.service_hours,
            contact_number: item.contact_number
          });
          setShowModal('nodeForm');
        },
        condition: () => isAdmin
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete node',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteNode');
        },
        condition: () => isAdmin
      }
    ];

    const statusOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Maintenance' }
    ];

    const typeOptions = [
      { value: 'primary', label: 'Primary' },
      { value: 'sub', label: 'Sub' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <HardDrive className="text-indigo-600" /> Nodes
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <FilterDropdown
                options={statusOptions}
                currentValue={filters.nodes?.status}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  nodes: { ...prev.nodes, status: e.target.value || undefined }
                }))}
                label="Status"
              />
              
              <FilterDropdown
                options={typeOptions}
                currentValue={filters.nodes?.node_type}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  nodes: { ...prev.nodes, node_type: e.target.value || undefined }
                }))}
                label="Type"
              />
              
              <RefreshButton tab="nodes" />
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setFormData({
                      node_type: 'sub',
                      status: 'active',
                      capacity: 100,
                      service_hours: "9:00 AM - 6:00 PM"
                    });
                    setShowModal('nodeForm');
                  }}
                  className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Node</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {errors.nodes && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.nodes}
          </div>
        )}

        <DataTable
          items={data.nodes}
          columns={nodeColumns}
          actions={nodeActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('nodeDetails');
          }}
          loading={loading.nodes}
          emptyMessage="No nodes found. Try adjusting your search or create a new node."
        />

        {pagination.total > 0 && <PaginationControls tab="nodes" />}
      </div>
    );
  };

  const InventorySection = () => {
    const inventoryColumns = [
      { 
        key: 'product_details.name', 
        label: 'Product',
        render: item => item.product_details?.name || 'N/A'
      },
      { 
        key: 'quantity', 
        label: 'Quantity',
        render: item => `${item.quantity} ${item.product_details?.unit || 'units'}`
      },
      { 
        key: 'threshold', 
        label: 'Threshold',
        render: item => `${item.threshold} ${item.product_details?.unit || 'units'}`
      },
      { 
        key: 'needs_restock', 
        label: 'Status',
        render: item => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            item.needs_restock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {item.needs_restock ? 'Needs Restock' : 'In Stock'}
          </span>
        )
      },
      { 
        key: 'last_updated', 
        label: 'Last Updated',
        render: item => formatDateTime(item.last_updated)
      }
    ];

    const inventoryActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('inventoryDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit inventory',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            product: item.product,
            quantity: item.quantity,
            threshold: item.threshold,
            node: item.node
          });
          setShowModal('inventoryForm');
        },
        condition: (item) => isAdmin || (user.node_id && user.node_id === item.node)
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete inventory',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteInventory');
        },
        condition: (item) => isAdmin || (user.node_id && user.node_id === item.node)
      }
    ];

    const statusOptions = [
      { value: 'needs_restock', label: 'Needs Restock' },
      { value: 'in_stock', label: 'In Stock' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Box className="text-indigo-600" /> Inventory
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <FilterDropdown
                options={statusOptions}
                currentValue={filters.inventory?.status}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  inventory: { ...prev.inventory, status: e.target.value || undefined }
                }))}
                label="Status"
              />
              
              <RefreshButton tab="inventory" />
              
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFormData({
                    product: '',
                    quantity: 0,
                    threshold: 5,
                    node: user.node_id
                  });
                  setShowModal('inventoryForm');
                }}
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                disabled={!user.node_id}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Inventory</span>
              </button>
            </div>
          </div>
        </div>

        {errors.inventory && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.inventory}
          </div>
        )}

        <DataTable
          items={data.inventory}
          columns={inventoryColumns}
          actions={inventoryActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('inventoryDetails');
          }}
          loading={loading.inventory}
          emptyMessage="No inventory items found. Try adjusting your search or add new inventory."
        />

        {pagination.total > 0 && <PaginationControls tab="inventory" />}
      </div>
    );
  };

  const PerformanceSection = () => {
    const [dateRange, setDateRange] = useState({
      from: null,
      to: null
    });

    useEffect(() => {
      if (dateRange.from || dateRange.to) {
        setFilters(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            date_from: dateRange.from ? dateRange.from.toISOString().split('T')[0] : undefined,
            date_to: dateRange.to ? dateRange.to.toISOString().split('T')[0] : undefined
          }
        }));
      }
    }, [dateRange, setFilters]);

    const performanceColumns = [
      { 
        key: 'date', 
        label: 'Date',
        render: item => formatDate(item.date)
      },
      { 
        key: 'orders_processed', 
        label: 'Orders',
        render: item => item.orders_processed
      },
      { 
        key: 'revenue_generated', 
        label: 'Revenue',
        render: item => formatCurrency(item.revenue_generated)
      },
      { 
        key: 'retailers_served', 
        label: 'Retailers',
        render: item => item.retailers_served
      },
      { 
        key: 'fulfillment_rate_display', 
        label: 'Fulfillment',
        render: item => item.fulfillment_rate_display || `${item.fulfillment_rate}%`
      },
      { 
        key: 'avg_order_value', 
        label: 'Avg Order',
        render: item => formatCurrency(item.avg_order_value)
      }
    ];
  
    const dateOptions = [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'year', label: 'This Year' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="text-indigo-600" /> Performance Metrics
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex gap-2">
              <FilterDropdown
                options={dateOptions}
                currentValue={filters.performance?.time_range}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  performance: { ...prev.performance, time_range: e.target.value || undefined }
                }))}
                label="Time Range"
              />
              
              <RefreshButton tab="performance" />
              
              <button
  onClick={() => handleAI()}
  className="btn bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-2 whitespace-nowrap"
  disabled={loading.aiInsights || !selectedItem}
>
  {loading.aiInsights ? (
    <Loader className="animate-spin" size={16} />
  ) : (
    <>
      <BarChart size={16} />
      <span className="hidden sm:inline">Generate Insights</span>
    </>
  )}
</button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <DatePicker
                  selected={dateRange.from}
                  onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  selectsStart
                  startDate={dateRange.from}
                  endDate={dateRange.to}
                  placeholderText="From date"
                  className="border rounded px-2 py-1 text-sm w-28"
                />
                <span>to</span>
                <DatePicker
                  selected={dateRange.to}
                  onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  selectsEnd
                  startDate={dateRange.from}
                  endDate={dateRange.to}
                  minDate={dateRange.from}
                  placeholderText="To date"
                  className="border rounded px-2 py-1 text-sm w-28"
                />
                {(dateRange.from || dateRange.to) && (
                  <button 
                    onClick={() => setDateRange({ from: null, to: null })}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {errors.performance && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.performance}
          </div>
        )}
  
        <DataTable
          items={data.performance}
          columns={performanceColumns}
          onRowClick={(item) => {
            setSelectedItem(item);
          }}
          loading={loading.performance}
          emptyMessage="No performance data available."
        />
  
        {pagination.total > 0 && <PaginationControls tab="performance" />}
      </div>
    );
  };

  const RoutesSection = () => {
    const routeColumns = [
      { 
        key: 'optimization_date', 
        label: 'Date',
        render: item => formatDateTime(item.optimization_date)
      },
      { 
        key: 'route_distance', 
        label: 'Distance',
        render: item => `${item.route_distance} km`
      },
      { 
        key: 'estimated_savings', 
        label: 'Estimated Savings',
        render: item => `${item.estimated_savings}%`
      },
      { 
        key: 'actual_savings', 
        label: 'Actual Savings',
        render: item => item.actual_savings ? `${item.actual_savings}%` : 'N/A'
      },
      { 
        key: 'execution_time_display', 
        label: 'Execution Time',
        render: item => item.execution_time_display || 'N/A'
      }
    ];

    const routeActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('routeDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit route',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            node: item.node,
            optimized_route: item.optimized_route,
            notes: item.notes,
            actual_savings: item.actual_savings,
            execution_time: item.execution_time
          });
          setShowModal('routeForm');
        },
        condition: (item) => isAdmin || (user.node_id && user.node_id === item.node)
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete route',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteRoute');
        },
        condition: (item) => isAdmin || (user.node_id && user.node_id === item.node)
      }
    ];

    const strategyOptions = [
      { value: 'time', label: 'Time Optimization' },
      { value: 'distance', label: 'Distance Optimization' },
      { value: 'cost', label: 'Cost Optimization' }
    ];

    const handleGenerateRoute = async () => {
      try {
        await handleAI('generateRoute');
        loadData('routes', true);
      } catch (error) {
        setErrors(prev => ({ ...prev, routes: error.message || 'Failed to generate route' }));
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Route className="text-indigo-600" /> Route Optimizations
          </h2>
          
          <div className="flex gap-2">
            <FilterDropdown
              options={strategyOptions}
              currentValue={filters.routes?.strategy}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                routes: { ...prev.routes, strategy: e.target.value || undefined }
              }))}
              label="Strategy"
            />
            
            <RefreshButton tab="routes" />
            
            <button
              onClick={handleGenerateRoute}
              className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
              disabled={!user.node_id || loading.routes}
            >
              {loading.routes ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <>
                  <Plus size={16} />
                  <span className="hidden sm:inline">Generate Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errors.routes && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.routes}
          </div>
        )}

        <DataTable
          items={data.routes}
          columns={routeColumns}
          actions={routeActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('routeDetails');
          }}
          loading={loading.routes}
          emptyMessage="No route optimizations found. Generate a new route to get started."
        />

        {pagination.total > 0 && <PaginationControls tab="routes" />}
      </div>
    );
  };

  const MaintenanceSection = () => {
    const maintenanceColumns = [
      { 
        key: 'maintenance_type', 
        label: 'Type',
        render: item => item.maintenance_type
      },
      { 
        key: 'performed_by_name', 
        label: 'Performed By',
        render: item => item.performed_by_name || 'N/A'
      },
      { 
        key: 'start_time', 
        label: 'Start Time',
        render: item => formatDateTime(item.start_time)
      },
      { 
        key: 'end_time', 
        label: 'End Time',
        render: item => item.end_time ? formatDateTime(item.end_time) : 'Ongoing'
      },
      { 
        key: 'resolved', 
        label: 'Status',
        render: item => statusBadge(item.resolved ? 'completed' : 'pending', 'maintenance')
      },
      { 
        key: 'description', 
        label: 'Description',
        render: item => item.description ? `${item.description.substring(0, 30)}...` : 'N/A'
      }
    ];

    const maintenanceActions = [
      {
        name: 'view',
        icon: Eye,
        color: 'text-blue-600 hover:bg-blue-50',
        tooltip: 'View details',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('maintenanceDetails');
        }
      },
      {
        name: 'edit',
        icon: Edit,
        color: 'text-indigo-600 hover:bg-indigo-50',
        tooltip: 'Edit log',
        handler: (item) => {
          setSelectedItem(item);
          setFormData({
            node: item.node,
            maintenance_type: item.maintenance_type,
            description: item.description,
            start_time: item.start_time,
            end_time: item.end_time,
            resolved: item.resolved,
            performed_by: item.performed_by
          });
          setShowModal('maintenanceForm');
        },
        condition: (item) => isAdmin || (user.node_id && user.node_id === item.node)
      },
      {
        name: 'delete',
        icon: Trash2,
        color: 'text-red-600 hover:bg-red-50',
        tooltip: 'Delete log',
        handler: (item) => {
          setSelectedItem(item);
          setShowModal('deleteMaintenance');
        },
        condition: () => isAdmin
      }
    ];

    const statusOptions = [
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' }
    ];

    const typeOptions = [
      { value: 'routine', label: 'Routine' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'repair', label: 'Repair' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wrench className="text-indigo-600" /> Maintenance Logs
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search maintenance logs..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <FilterDropdown
                options={statusOptions}
                currentValue={filters.maintenance?.status}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maintenance: { ...prev.maintenance, status: e.target.value || undefined }
                }))}
                label="Status"
              />
              
              <FilterDropdown
                options={typeOptions}
                currentValue={filters.maintenance?.type}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maintenance: { ...prev.maintenance, type: e.target.value || undefined }
                }))}
                label="Type"
              />
              
              <RefreshButton tab="maintenance" />
              
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFormData({
                    node: user.node_id,
                    maintenance_type: 'Routine Check',
                    description: '',
                    start_time: new Date().toISOString(),
                    resolved: false,
                    performed_by: user.id
                  });
                  setShowModal('maintenanceForm');
                }}
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                disabled={!user.node_id}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Log</span>
              </button>
            </div>
          </div>
        </div>

        {errors.maintenance && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
            <AlertCircle size={18} /> {errors.maintenance}
          </div>
        )}

        <DataTable
          items={data.maintenanceLogs}
          columns={maintenanceColumns}
          actions={maintenanceActions}
          onRowClick={(item) => {
            setSelectedItem(item);
            setShowModal('maintenanceDetails');
          }}
          loading={loading.maintenance}
          emptyMessage="No maintenance logs found. Add a new log to get started."
        />

        {pagination.total > 0 && <PaginationControls tab="maintenance" />}
      </div>
    );
  };

  return (
    <>
      {activeTab === 'nodes' && <NodeSection />}
      {activeTab === 'inventory' && <InventorySection />}
      {activeTab === 'performance' && <PerformanceSection />}
      {activeTab === 'routes' && <RoutesSection />}
      {activeTab === 'maintenance' && <MaintenanceSection />}
    </>
  );
};

export default NodesSections;