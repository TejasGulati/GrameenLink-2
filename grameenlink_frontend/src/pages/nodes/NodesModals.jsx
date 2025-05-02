import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader, AlertCircle, Check, HardDrive, Box, Activity,
  Wrench, Route, Map, Clock, User, ChevronDown, Sliders,
  Plus, AlertTriangle, CheckCircle, Calendar, ChevronRight,
  RefreshCw, BarChart, ClipboardList, Package, Truck
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { formatCurrency, statusBadge, formatDate, formatDateTime } from './NodesUtils';

const NodesModals = ({
  showModal, setShowModal, selectedItem, formData, setFormData,
  data, loading, errors, handleSubmit, handleDelete, aiResult, user,
  activeTab, fetchNodes, fetchNodeInventory, fetchRouteOptimizations, fetchMaintenanceLogs
}) => {
  // Reset form when modal changes
  React.useEffect(() => {
    if (!showModal) return;
    
    const resetForm = {
      nodeForm: {
        node_type: 'sub',
        status: 'active',
        coverage_area: '',
        capacity: '',
        service_hours: '9:00 AM - 6:00 PM',
        contact_number: '',
        parent_node: '',
        established_date: new Date().toISOString().slice(0, 10)
      },
      inventoryForm: {
        node: '',
        product: '',
        quantity: '',
        threshold: '5',
      },
      routeForm: {
        node: '',
        strategy: 'time',
        notes: '',
        vehicle_capacity: ''
      },
      maintenanceForm: {
        node: user.user_type === 'node' ? user.operated_node?.id : '',
        maintenance_type: '',
        description: '',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: '',
        resolved: false,
        performed_by: user.id
      }
    };

    if (selectedItem) {
      // Pre-fill form with selected item data
      setFormData({ ...resetForm[`${showModal.replace('Details', 'Form')}`], ...selectedItem });
    } else {
      // Reset to default form
      const formType = showModal.replace('generate', '').replace('delete', '').replace('Details', 'Form');
      setFormData(resetForm[formType] || {});
    }
  }, [showModal, selectedItem, user]);

  // Node Form
  const renderNodeForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Node Type*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.node_type || 'sub'}
            onChange={(e) => setFormData({...formData, node_type: e.target.value})}
            required
          >
            <option value="primary">Primary Node</option>
            <option value="sub">Sub Node</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.status || 'active'}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {formData.node_type === 'sub' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Node*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.parent_node || ''}
            onChange={(e) => setFormData({...formData, parent_node: e.target.value})}
            required={formData.node_type === 'sub'}
          >
            <option value="">Select Parent Node</option>
            {data.nodes
              ?.filter(node => node.node_type === 'primary')
              .map(node => (
                <option key={node.id} value={node.id}>{node.operator?.name || `Node ${node.id}`}</option>
              ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Area*</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.coverage_area || ''}
            onChange={(e) => setFormData({...formData, coverage_area: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (m³)*</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.capacity || ''}
            onChange={(e) => setFormData({...formData, capacity: parseFloat(e.target.value)})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Hours</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.service_hours || '9:00 AM - 6:00 PM'}
            onChange={(e) => setFormData({...formData, service_hours: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.contact_number || ''}
            onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
            pattern="[0-9]{10,15}"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Established Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-md bg-gray-100"
          value={formData.established_date || new Date().toISOString().slice(0, 10)}
          readOnly
        />
      </div>
    </div>
  );

  // Node Details
  const renderNodeDetails = () => {
    const performanceData = selectedItem.performance_records?.slice(0, 7).reverse() || [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <User size={16} /> Operator Info
            </h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{selectedItem.operator?.name || 'N/A'}</p>
              <p className="text-gray-600">{selectedItem.operator?.email || 'N/A'}</p>
              <p className="text-gray-600">{selectedItem.contact_number || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <HardDrive size={16} /> Node Info
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className={`font-medium ${
                  selectedItem.node_type === 'primary' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {selectedItem.node_type === 'primary' ? 'Primary' : 'Sub Node'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {statusBadge(selectedItem.status, 'node')}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{selectedItem.capacity} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Hours:</span>
                <span className="font-medium">{selectedItem.service_hours}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Map size={16} /> Coverage
            </h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Area</p>
              <p className="text-gray-600">{selectedItem.coverage_area}</p>
              {selectedItem.parent_node && (
                <>
                  <p className="font-medium mt-2">Parent Node</p>
                  <p className="text-gray-600">{selectedItem.parent_node?.operator?.name || `Node ${selectedItem.parent_node}`}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar size={16} /> Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Established:</span>
                <span className="font-medium">
                  {formatDate(selectedItem.established_date)}
                </span>
              </div>
              {selectedItem.last_maintenance_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Maintenance:</span>
                  <span className="font-medium">
                    {formatDate(selectedItem.last_maintenance_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity size={16} /> Stats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Inventory Items</p>
                <p className="font-medium">{selectedItem.inventory_items?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Maintenance Logs</p>
                <p className="font-medium">{selectedItem.maintenance_logs?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Sub Nodes</p>
                <p className="font-medium">{selectedItem.sub_nodes?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Optimized Routes</p>
                <p className="font-medium">{selectedItem.optimized_routes?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {performanceData.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Performance</h4>
            <div className="h-64">
              <Line
                data={{
                  labels: performanceData.map(p => formatDate(p.date)),
                  datasets: [{
                    label: 'Orders Processed',
                    data: performanceData.map(p => p.orders_processed),
                    borderColor: 'rgba(79, 70, 229, 1)',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    tension: 0.1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>
          </div>
        )}

        {selectedItem.capacity && (
          <div>
            <h4 className="font-medium mb-2">Capacity Utilization</h4>
            <div className="h-64">
              <Pie
                data={{
                  labels: ['Used', 'Available'],
                  datasets: [{
                    data: [
                      selectedItem.inventory_items?.reduce((sum, item) => sum + (item.quantity * (item.product?.volume || 1)), 0),
                      Math.max(0, selectedItem.capacity - selectedItem.inventory_items?.reduce((sum, item) => sum + (item.quantity * (item.product?.volume || 1)), 0))
                    ],
                    backgroundColor: ['rgba(79, 70, 229, 0.6)', 'rgba(16, 185, 129, 0.6)'],
                    borderColor: ['rgba(79, 70, 229, 1)', 'rgba(16, 185, 129, 1)'],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Inventory Form
  const renderInventoryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Node*</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={formData.node || ''}
          onChange={(e) => setFormData({...formData, node: e.target.value})}
          required
          disabled={user.user_type === 'node'}
        >
          <option value="">Select Node</option>
          {data.nodes?.map(node => (
            <option key={node.id} value={node.id}>
              {node.operator?.name || `Node ${node.id}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product*</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={formData.product || ''}
          onChange={(e) => setFormData({...formData, product: e.target.value})}
          required
        >
          <option value="">Select Product</option>
          {data.products?.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Threshold*</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.threshold || '5'}
            onChange={(e) => setFormData({...formData, threshold: parseFloat(e.target.value)})}
            required
          />
        </div>
      </div>
    </div>
  );

  // Inventory Details
  const renderInventoryDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            {selectedItem.product?.image ? (
              <img 
                src={selectedItem.product.image} 
                alt={selectedItem.product.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Package className="text-gray-400" size={48} />
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3 space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{selectedItem.product?.name}</h3>
            <p className="text-gray-600">{selectedItem.product?.category?.name || 'Uncategorized'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Quantity</p>
              <p className="text-lg font-semibold">
                {selectedItem.quantity} {selectedItem.product?.unit || 'units'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Restock Threshold</p>
              <p className="text-lg font-semibold">
                {selectedItem.threshold} {selectedItem.product?.unit || 'units'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedItem.quantity <= selectedItem.threshold ? 
                  'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedItem.quantity <= selectedItem.threshold ? 'Needs Restock' : 'In Stock'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm">
                {formatDateTime(selectedItem.last_updated)}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Node</p>
            <p className="font-medium">{selectedItem.node?.operator?.name || `Node ${selectedItem.node}`}</p>
          </div>
        </div>
      </div>
      
      {selectedItem.last_restocked && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2">Last Restock</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {formatDateTime(selectedItem.last_restocked)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Quantity Added:</span>
            <span className="font-medium">
              {selectedItem.last_restock_quantity || 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Route Form
  const renderRouteForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Node*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.node || ''}
            onChange={(e) => setFormData({...formData, node: e.target.value})}
            required
            disabled={user.user_type === 'node'}
          >
            <option value="">Select Node</option>
            {data.nodes?.map(node => (
              <option key={node.id} value={node.id}>{node.operator?.name || `Node ${node.id}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Strategy*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.strategy || 'time'}
            onChange={(e) => setFormData({...formData, strategy: e.target.value})}
            required
          >
            <option value="time">Minimize Time</option>
            <option value="distance">Minimize Distance</option>
            <option value="cost">Minimize Cost</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>
    </div>
  );

  // Route Details
  const renderRouteDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <HardDrive size={16} /> Node Info
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{selectedItem.node?.operator?.name || `Node ${selectedItem.node}`}</p>
            <p className="text-gray-600">{selectedItem.node?.coverage_area || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Route size={16} /> Optimization Info
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {formatDateTime(selectedItem.optimization_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">
                {selectedItem.route_distance} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Savings:</span>
              <span className="font-medium">
                {selectedItem.estimated_savings}%
              </span>
            </div>
            {selectedItem.actual_savings && (
              <div className="flex justify-between">
                <span className="text-gray-600">Actual Savings:</span>
                <span className="font-medium">
                  {selectedItem.actual_savings}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Optimized Route</h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="h-96">
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
              <Map size={48} className="text-gray-400" />
              <p className="mt-2 text-gray-500">Route visualization would appear here</p>
            </div>
          </div>
        </div>
      </div>

      {selectedItem.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">{selectedItem.notes}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Maintenance Form
  const renderMaintenanceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Node*</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={formData.node || ''}
          onChange={(e) => setFormData({...formData, node: e.target.value})}
          required
          disabled={user.user_type === 'node'}
        >
          <option value="">Select Node</option>
          {data.nodes?.map(node => (
            <option key={node.id} value={node.id}>{node.operator?.name || `Node ${node.id}`}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type*</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.maintenance_type || ''}
          onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time*</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.start_time || new Date().toISOString().slice(0, 16)}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.end_time || ''}
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="resolved"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.resolved || false}
          onChange={(e) => setFormData({...formData, resolved: e.target.checked})}
        />
        <label htmlFor="resolved" className="ml-2 block text-sm text-gray-700">
          Mark as resolved
        </label>
      </div>

      {user.is_admin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.performed_by || user.id}
            onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
          >
            {data.technicians?.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Maintenance Details
  const renderMaintenanceDetails = () => {
    const duration = selectedItem.end_time && selectedItem.start_time
      ? new Date(selectedItem.end_time) - new Date(selectedItem.start_time)
      : null;
    
    const hours = duration ? Math.floor(duration / (1000 * 60 * 60)) : 0;
    const minutes = duration ? Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)) : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <HardDrive size={16} /> Node Info
            </h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{selectedItem.node?.operator?.name || `Node ${selectedItem.node}`}</p>
              <p className="text-gray-600">{selectedItem.node?.coverage_area || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Wrench size={16} /> Maintenance Info
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{selectedItem.maintenance_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {statusBadge(selectedItem.resolved ? 'completed' : 'pending', 'maintenance')}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performed By:</span>
                <span className="font-medium">{selectedItem.performed_by?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock size={16} /> Timeline
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">
                  {formatDateTime(selectedItem.start_time)}
                </span>
              </div>
              {selectedItem.end_time && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End:</span>
                    <span className="font-medium">
                      {formatDateTime(selectedItem.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {hours > 0 ? `${hours}h ` : ''}{minutes}m
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              {selectedItem.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // AI Result
  const renderAIResult = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">AI Generated Insights</h3>
      {aiResult?.insights?.performance_analysis && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Performance Analysis</h4>
            <div className="bg-gray-50 p-3 rounded">
              {aiResult.insights.performance_analysis}
            </div>
          </div>
          
          {aiResult.insights.key_metrics && (
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(aiResult.insights.key_metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {aiResult.insights.recommendations && (
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-2">
                {aiResult.insights.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {aiResult.insights.risk_factors && (
            <div>
              <h4 className="font-medium mb-2">Risk Factors</h4>
              <ul className="list-disc pl-5 space-y-2">
                {aiResult.insights.risk_factors.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="text-sm text-gray-500 mt-4">
        Generated at: {formatDateTime(aiResult?.generated_at)}
      </div>
    </div>
  );

  // Delete Confirmation
  const renderDeleteConfirmation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Are you sure you want to delete this {activeTab.slice(0, -1)}?</h3>
      <p className="text-gray-600">This action cannot be undone. All associated data will be permanently removed.</p>
      {selectedItem && (
        <div className="bg-red-50 p-3 rounded-md">
          <p className="font-medium">{selectedItem.name || selectedItem.product?.name || `ID: ${selectedItem.id}`}</p>
        </div>
      )}
    </div>
  );

  // Generate Route
  const renderGenerateRoute = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Generate New Optimized Route</h3>
      <p className="text-gray-600">This will analyze all pending orders and generate the most efficient delivery route.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Strategy*</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={formData.strategy || 'time'}
            onChange={(e) => setFormData({...formData, strategy: e.target.value})}
            required
          >
            <option value="time">Minimize Time</option>
            <option value="distance">Minimize Distance</option>
            <option value="cost">Minimize Cost</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Capacity (kg)*</label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.vehicle_capacity || ''}
            onChange={(e) => setFormData({...formData, vehicle_capacity: parseInt(e.target.value)})}
            required
          />
        </div>
      </div>
    </div>
  );

  // Modal Content Selector
  const getModalContent = () => {
    if (!showModal) return null;
    
    const commonActions = [
      {
        label: 'Cancel',
        onClick: () => setShowModal(null),
        color: 'text-gray-700 hover:bg-gray-100'
      }
    ];

    switch(showModal) {
      case 'nodeForm':
        return {
          title: selectedItem ? 'Edit Node' : 'Add New Node',
          content: renderNodeForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('node'),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.node
            }
          ]
        };
      case 'nodeDetails':
        return {
          title: 'Node Details',
          content: renderNodeDetails(),
          actions: [
            ...commonActions,
            {
              label: 'Generate AI Insights',
              onClick: () => setShowModal('aiResult'),
              color: 'bg-purple-600 text-white hover:bg-purple-700',
              loading: loading.ai
            }
          ]
        };
      case 'deleteNode':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('node', selectedItem.id).then(() => fetchNodes()),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.node
            }
          ]
        };
      case 'inventoryForm':
        return {
          title: selectedItem ? 'Edit Inventory' : 'Add Inventory',
          content: renderInventoryForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('inventory').then(() => fetchNodeInventory()),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.inventory
            }
          ]
        };
      case 'inventoryDetails':
        return {
          title: 'Inventory Details',
          content: renderInventoryDetails(),
          actions: commonActions
        };
      case 'deleteInventory':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('inventory', selectedItem.id).then(() => fetchNodeInventory()),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.inventory
            }
          ]
        };
      case 'routeForm':
        return {
          title: selectedItem ? 'Edit Route' : 'Add Route',
          content: renderRouteForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('route').then(() => fetchRouteOptimizations()),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.route
            }
          ]
        };
      case 'routeDetails':
        return {
          title: 'Route Optimization Details',
          content: renderRouteDetails(),
          actions: commonActions
        };
      case 'generateRoute':
        return {
          title: 'Generate Optimized Route',
          content: renderGenerateRoute(),
          actions: [
            ...commonActions,
            {
              label: 'Generate',
              onClick: () => handleSubmit('route').then(() => fetchRouteOptimizations()),
              color: 'bg-green-600 text-white hover:bg-green-700',
              loading: loading.route
            }
          ]
        };
      case 'deleteRoute':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('route', selectedItem.id).then(() => fetchRouteOptimizations()),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.route
            }
          ]
        };
      case 'maintenanceForm':
        return {
          title: selectedItem ? 'Edit Maintenance Log' : 'Add Maintenance Log',
          content: renderMaintenanceForm(),
          actions: [
            ...commonActions,
            {
              label: selectedItem ? 'Update' : 'Create',
              onClick: () => handleSubmit('maintenance').then(() => fetchMaintenanceLogs()),
              color: 'bg-indigo-600 text-white hover:bg-indigo-700',
              loading: loading.maintenance
            }
          ]
        };
      case 'maintenanceDetails':
        return {
          title: 'Maintenance Log Details',
          content: renderMaintenanceDetails(),
          actions: commonActions
        };
      case 'deleteMaintenance':
        return {
          title: 'Confirm Deletion',
          content: renderDeleteConfirmation(),
          actions: [
            ...commonActions,
            {
              label: 'Delete',
              onClick: () => handleDelete('maintenance', selectedItem.id).then(() => fetchMaintenanceLogs()),
              color: 'bg-red-600 text-white hover:bg-red-700',
              loading: loading.maintenance
            }
          ]
        };
      case 'aiResult':
        return {
          title: 'AI Performance Insights',
          content: renderAIResult(),
          actions: commonActions
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <AnimatePresence>
      {modalContent && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{modalContent.title}</h2>
              <button 
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {errors[activeTab] && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2 mb-4">
                <AlertCircle size={18} /> {errors[activeTab]}
              </div>
            )}
            
            <div className="space-y-4">
              {modalContent.content}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              {modalContent.actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`px-4 py-2 rounded-md ${action.color} flex items-center gap-2 min-w-24 justify-center`}
                >
                  {action.loading ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    action.label
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodesModals;