import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Truck,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  CircleDollarSign,
  BarChart2,
  PieChart,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle,
  Sparkles,
  ShoppingCart,
  Box,
  Warehouse,
  MapPin,
  CreditCard,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { 
    user, 
    loading: authLoading,
    fetchAnalyticsSummary,
    fetchUserRecommendations,
    generateAIAnalysis
  } = useContext(AuthContext);
  
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsData, recData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchUserRecommendations()
        ]);
        setAnalytics(analyticsData.data);
        setRecommendations(recData.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading, fetchAnalyticsSummary, fetchUserRecommendations]);

  const handleGenerateInsights = async () => {
    try {
      setLoading(true);
      const response = await generateAIAnalysis({ time_range: timeRange });
      setAiInsights(response.data.analysis);
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.name}. Here's what's happening with your {user.user_type === 'admin' ? 'platform' : 'account'} today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* User Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg mr-4">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <h3 className="font-semibold capitalize">{user.user_type}</h3>
              </div>
            </div>
            {user.location && (
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}
          </motion.div>

          {/* Orders Card */}
          {!loading && analytics && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {user.user_type === 'admin' ? 'Total Orders' : 
                     user.user_type === 'node' ? 'Orders Processed' : 'Your Orders'}
                  </p>
                  <h3 className="font-semibold text-xl">
                    {analytics.total_orders || analytics.orders_processed || 0}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}

          {/* Revenue Card */}
          {!loading && analytics && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <CircleDollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {user.user_type === 'admin' ? 'Total Revenue' : 
                     user.user_type === 'node' ? 'Revenue Generated' : 'Total Spent'}
                  </p>
                  <h3 className="font-semibold text-xl">
                    ₹{(analytics.total_revenue || analytics.revenue_generated || analytics.total_spent || 0).toLocaleString()}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <>
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: item * 0.1 }}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="animate-pulse flex items-center">
                    <div className="bg-gray-200 rounded-lg w-11 h-11 mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Insights Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                  AI-Powered Insights
                </h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <button
                    onClick={handleGenerateInsights}
                    disabled={loading}
                    className="text-xs bg-emerald-600 text-white px-3 py-1 rounded flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Activity className="w-3 h-3 mr-1" />
                    )}
                    Generate
                  </button>
                </div>
              </div>

              {aiInsights ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-sm mb-2">{aiInsights.summary}</h3>
                  <ul className="space-y-2 text-sm">
                    {aiInsights.key_points?.map((point, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {aiInsights.recommendations && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 mb-1">RECOMMENDATIONS</h4>
                      <p className="text-sm">{aiInsights.recommendations}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm">
                    Generate AI-powered insights based on your {user.user_type} activity
                  </p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <a
                  href="/marketplace"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mb-1" />
                  <span className="text-sm">Marketplace</span>
                </a>
                {user.user_type === 'node' && (
                  <a
                    href="/nodes"
                    className="bg-green-50 hover:bg-green-100 text-green-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                  >
                    <Warehouse className="w-5 h-5 mb-1" />
                    <span className="text-sm">Manage Node</span>
                  </a>
                )}
                {user.user_type === 'retailer' && (
                  <a
                    href="/orders"
                    className="bg-purple-50 hover:bg-purple-100 text-purple-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 mb-1" />
                    <span className="text-sm">Your Orders</span>
                  </a>
                )}
                <a
                  href="/inventory"
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                >
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-sm">Inventory</span>
                </a>
                {user.user_type === 'admin' && (
                  <a
                    href="/analytics"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                  >
                    <BarChart2 className="w-5 h-5 mb-1" />
                    <span className="text-sm">Analytics</span>
                  </a>
                )}
                <a
                  href="/settings"
                  className="bg-gray-50 hover:bg-gray-100 text-gray-800 p-3 rounded-lg text-center flex flex-col items-center transition-colors"
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-sm">History</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recommendations */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-emerald-500 mr-2" />
                Recommendations
              </h2>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : recommendations ? (
                <div className="space-y-4">
                  {recommendations.products_to_stock && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Products to Stock</h3>
                      <ul className="space-y-2">
                        {recommendations.products_to_stock.slice(0, 3).map((product) => (
                          <li key={product.id} className="flex items-center text-sm">
                            <Box className="w-4 h-4 text-gray-400 mr-2" />
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recommendations.products && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Popular in Your Area</h3>
                      <ul className="space-y-2">
                        {recommendations.products.slice(0, 3).map((product) => (
                          <li key={product.id} className="flex items-center text-sm">
                            <ShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                            {product.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!recommendations.products && !recommendations.products_to_stock) && (
                    <p className="text-gray-500 text-sm">No recommendations available yet</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recommendations available</p>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Recent Activity
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                <p className="text-gray-500 text-sm">Activity feed coming soon</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;