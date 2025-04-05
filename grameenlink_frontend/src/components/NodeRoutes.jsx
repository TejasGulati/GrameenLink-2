import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MapPin,
  Truck,
  Route as RouteIcon,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  Package,
  Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const NodeRoutes = () => {
  const { 
    user, 
    loading: authLoading,
    fetchRoutes,
    generateOptimizedRoute
  } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India center
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const nodeId = new URLSearchParams(window.location.search).get('node');
        const data = await fetchRoutes({ node: nodeId || user.id });
        setRoutes(data);
        
        // Set map center to first route's coordinates if available
        if (data.length > 0 && data[0].optimized_route?.optimized_routes?.[0]?.waypoints?.[0]) {
          const firstWaypoint = data[0].optimized_route.optimized_routes[0].waypoints[0];
          setMapCenter([firstWaypoint.lat, firstWaypoint.lng]);
        }
      } catch (err) {
        setError('Failed to load routes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadRoutes();
    }
  }, [user, fetchRoutes]);

  const handleGenerateRoute = async () => {
    try {
      setLoading(true);
      const nodeId = new URLSearchParams(window.location.search).get('node');
      const result = await generateOptimizedRoute({ node: nodeId || user.id });
      setOptimizedRoute(result);
      
      // Update routes list
      const data = await fetchRoutes({ node: nodeId || user.id });
      setRoutes(data);
    } catch (err) {
      console.error('Failed to generate route:', err);
      setError('Failed to generate optimized route');
    } finally {
      setLoading(false);
    }
  };

  const renderRouteWaypoints = (route) => {
    if (!route.optimized_route?.optimized_routes?.[0]?.waypoints) return null;
    
    return route.optimized_route.optimized_routes[0].waypoints.map((waypoint, index) => ({
      position: [waypoint.lat, waypoint.lng],
      popup: `${index + 1}. ${waypoint.name}`,
      isRetailer: index > 0 // First waypoint is the node itself
    }));
  };

  const renderRoutePolyline = (route) => {
    if (!route.optimized_route?.optimized_routes?.[0]?.waypoints) return null;
    
    const waypoints = route.optimized_route.optimized_routes[0].waypoints;
    return waypoints.map(waypoint => [waypoint.lat, waypoint.lng]);
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Optimization</h1>
          <p className="text-gray-600">
            Optimize delivery routes for maximum efficiency
          </p>
        </div>
        
        <button
          onClick={handleGenerateRoute}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Optimize Routes
        </button>
      </div>

      {/* Optimized Route Result */}
      {optimizedRoute && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-green-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">New Optimized Route</h2>
            <button 
              onClick={() => setOptimizedRoute(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Route Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Distance:</span>
                  <span className="font-medium">{optimizedRoute.total_savings?.distance || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Time Savings:</span>
                  <span className="font-medium">{optimizedRoute.total_savings?.time || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Orders:</span>
                  <span className="font-medium">{optimizedRoute.optimized_routes?.[0]?.orders?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Route Sequence</h3>
              {optimizedRoute.optimized_routes?.[0]?.sequence ? (
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  {optimizedRoute.optimized_routes[0].sequence.map((location, i) => (
                    <li key={i}>{location}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">No sequence data available</p>
              )}
            </div>
            
            <div className="bg-white border border-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Implementation Notes</h3>
              <p className="text-sm text-gray-700">
                {optimizedRoute.implementation_notes || 'No specific notes provided.'}
              </p>
            </div>
          </div>
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
        <div className="space-y-8">
          {/* Route Map */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                Route Visualization
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-green-600">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-96 w-full">
              <MapContainer 
                center={mapCenter} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {routes.length > 0 && renderRouteWaypoints(routes[0])?.map((waypoint, index) => (
                  <Marker key={index} position={waypoint.position}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-medium">{waypoint.popup}</div>
                        {waypoint.isRetailer && (
                          <div className="mt-1 text-xs text-gray-500">
                            Retailer location
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {routes.length > 0 && renderRoutePolyline(routes[0]) && (
                  <Polyline 
                    positions={renderRoutePolyline(routes[0])} 
                    color="#10B981" 
                    weight={3}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Route List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <RouteIcon className="w-5 h-5 text-green-600 mr-2" />
                Optimized Routes
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-green-600">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Optimization Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated Savings
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
                  {routes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No optimized routes found. Generate your first route to get started.
                      </td>
                    </tr>
                  ) : (
                    routes.map((route) => (
                      <tr key={route.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(route.optimization_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(route.optimization_date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {route.optimized_route?.optimized_routes?.[0]?.orders?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{route.estimated_savings?.toLocaleString() || '0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Optimized
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setShowRouteDetails(showRouteDetails === route.id ? null : route.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {showRouteDetails === route.id ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Expanded Route Details */}
            {showRouteDetails && routes.find(r => r.id === showRouteDetails) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-2" />
                      Route Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Optimized On</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(routes.find(r => r.id === showRouteDetails).optimization_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Estimated Savings</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{routes.find(r => r.id === showRouteDetails).estimated_savings.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Orders Included</span>
                        <span className="text-sm font-medium text-gray-900">
                          {routes.find(r => r.id === showRouteDetails).optimized_route?.optimized_routes?.[0]?.orders?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="w-5 h-5 text-green-600 mr-2" />
                      Retailers Served
                    </h3>
                    {routes.find(r => r.id === showRouteDetails).optimized_route?.optimized_routes?.[0]?.sequence ? (
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {routes.find(r => r.id === showRouteDetails).optimized_route.optimized_routes[0].sequence.map((location, i) => (
                          <li key={i}>{location}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-500">No sequence data available</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Package className="w-5 h-5 text-green-600 mr-2" />
                    Implementation Notes
                  </h3>
                  <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                    {routes.find(r => r.id === showRouteDetails).optimized_route?.implementation_notes || 
                     'No specific implementation notes provided.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeRoutes;