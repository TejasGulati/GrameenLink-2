import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  Database,
  Activity,
  MapPin,
  Package,
  Route,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const Nodes = () => {
  const { 
    user, 
    loading: authLoading,
    fetchNodes, 
    createNode, 
    updateNode, 
    deleteNode,
    fetchNodeDetail,
    fetchNodePerformance
  } = useContext(AuthContext);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNode, setNewNode] = useState({
    node_type: 'primary',
    coverage_area: '',
    capacity: '',
    parent_node: null
  });
  const [expandedNode, setExpandedNode] = useState(null);
  const [nodePerformance, setNodePerformance] = useState({});
  const [nodeDetails, setNodeDetails] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNodes = async () => {
      try {
        const data = await fetchNodes();
        setNodes(data);
      } catch (err) {
        setError('Failed to load nodes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && (user.user_type === 'admin' || user.user_type === 'node')) {
      loadNodes();
    }
  }, [user, fetchNodes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNode(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNode(newNode);
      const data = await fetchNodes();
      setNodes(data);
      setNewNode({
        node_type: 'primary',
        coverage_area: '',
        capacity: '',
        parent_node: null
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create node:', err);
      setError('Failed to create node. Please check your inputs.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateNode(editingNode.id, editingNode);
      const data = await fetchNodes();
      setNodes(data);
      setEditingNode(null);
    } catch (err) {
      console.error('Failed to update node:', err);
      setError('Failed to update node. Please check your inputs.');
    }
  };

  const handleDelete = async (nodeId) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      try {
        await deleteNode(nodeId);
        const data = await fetchNodes();
        setNodes(data);
      } catch (err) {
        console.error('Failed to delete node:', err);
        setError('Failed to delete node.');
      }
    }
  };

  const toggleNodeExpansion = async (nodeId) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
    } else {
      setExpandedNode(nodeId);
      try {
        const [details, performance] = await Promise.all([
          fetchNodeDetail(nodeId),
          fetchNodePerformance(nodeId)
        ]);
        setNodeDetails(prev => ({ ...prev, [nodeId]: details }));
        setNodePerformance(prev => ({ ...prev, [nodeId]: performance }));
      } catch (err) {
        console.error('Failed to load node details:', err);
      }
    }
  };

  const getNodeStatus = (node) => {
    if (!node.is_active) {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user || (user.user_type !== 'admin' && user.user_type !== 'node')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-colors"
            >
              Return to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Node Management</h1>
          <p className="text-gray-600">
            Manage your distribution nodes and optimize your supply chain network
          </p>
        </div>
        
        {user.user_type === 'admin' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Node
          </button>
        )}
      </div>

      {/* Create Node Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Create New Node</h2>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
                <select
                  name="node_type"
                  value={newNode.node_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="primary">Primary Node</option>
                  <option value="sub">Sub Node</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (m³)</label>
                <input
                  type="number"
                  name="capacity"
                  value={newNode.capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Area</label>
              <input
                type="text"
                name="coverage_area"
                value={newNode.coverage_area}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Enter coverage area (e.g., Village name, District)"
              />
            </div>
            
            {newNode.node_type === 'sub' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Node</label>
                <select
                  name="parent_node"
                  value={newNode.parent_node || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Parent Node</option>
                  {nodes
                    .filter(node => node.node_type === 'primary')
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.operator_name} - {node.coverage_area}
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors"
              >
                Create Node
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Edit Node Form */}
      {editingNode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Edit Node</h2>
            <button 
              onClick={() => setEditingNode(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
                <select
                  name="node_type"
                  value={editingNode.node_type}
                  onChange={(e) => setEditingNode({...editingNode, node_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="primary">Primary Node</option>
                  <option value="sub">Sub Node</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (m³)</label>
                <input
                  type="number"
                  name="capacity"
                  value={editingNode.capacity}
                  onChange={(e) => setEditingNode({...editingNode, capacity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Area</label>
              <input
                type="text"
                name="coverage_area"
                value={editingNode.coverage_area}
                onChange={(e) => setEditingNode({...editingNode, coverage_area: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            {editingNode.node_type === 'sub' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Node</label>
                <select
                  name="parent_node"
                  value={editingNode.parent_node || ''}
                  onChange={(e) => setEditingNode({...editingNode, parent_node: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Parent Node</option>
                  {nodes
                    .filter(node => node.node_type === 'primary' && node.id !== editingNode.id)
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.operator_name} - {node.coverage_area}
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors"
              >
                Update Node
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Nodes List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage Area
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No nodes found. {user.user_type === 'admin' && 'Create your first node to get started.'}
                    </td>
                  </tr>
                ) : (
                  nodes.map((node) => (
                    <motion.tr 
                      key={node.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{node.operator_name}</div>
                            <div className="text-sm text-gray-500">{node.operator_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{node.node_type}</div>
                        {node.parent_node_name && (
                          <div className="text-xs text-gray-500">Parent: {node.parent_node_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{node.coverage_area}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{node.capacity} m³</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNodeStatus(node).color}`}>
                          {getNodeStatus(node).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleNodeExpansion(node.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {expandedNode === node.id ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          
                          {user.user_type === 'admin' && (
                            <>
                              <button
                                onClick={() => setEditingNode(node)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(node.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Expanded Node Details */}
          {expandedNode && nodeDetails[expandedNode] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 p-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Node Details */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Database className="w-5 h-5 text-green-600 mr-2" />
                    Node Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Established Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(nodeDetails[expandedNode].established_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Operator</span>
                      <span className="text-sm font-medium text-gray-900">
                        {nodeDetails[expandedNode].operator_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {nodeDetails[expandedNode].node_type}
                      </span>
                    </div>
                    {nodeDetails[expandedNode].parent_node_name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Parent Node</span>
                        <span className="text-sm font-medium text-gray-900">
                          {nodeDetails[expandedNode].parent_node_name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${nodeDetails[expandedNode].is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {nodeDetails[expandedNode].is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    Performance Summary
                  </h3>
                  {nodePerformance[expandedNode] && nodePerformance[expandedNode].length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Last 30 Days Orders</span>
                        <span className="text-sm font-medium text-gray-900">
                          {nodePerformance[expandedNode][0].orders_processed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Revenue Generated</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{nodePerformance[expandedNode][0].revenue_generated.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Retailers Served</span>
                        <span className="text-sm font-medium text-gray-900">
                          {nodePerformance[expandedNode][0].retailers_served}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/performance?node=${expandedNode}`)}
                        className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        View full performance
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No performance data available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/inventory?node=${expandedNode}`}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Package className="w-4 h-4 mr-2 text-gray-500" />
                  View Inventory
                </Link>
                <Link
                  to={`/routes?node=${expandedNode}`}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Route className="w-4 h-4 mr-2 text-gray-500" />
                  View Routes
                </Link>
                {user.user_type === 'admin' && (
                  <button
                    onClick={() => {
                      setEditingNode(nodeDetails[expandedNode]);
                      setExpandedNode(null);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-blue-600 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Node
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Nodes;