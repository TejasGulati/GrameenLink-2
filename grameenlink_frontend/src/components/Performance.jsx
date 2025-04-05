import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart2,
  LineChart,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Performance = () => {
  const { 
    user, 
    loading: authLoading,
    fetchNodePerformance,
    fetchPerformanceTrends
  } = useContext(AuthContext);
  const [performance, setPerformance] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [showTrends, setShowTrends] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const nodeId = new URLSearchParams(window.location.search).get('node');
        const data = await fetchNodePerformance(nodeId || user.id);
        setPerformance(data);
      } catch (err) {
        setError('Failed to load performance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadPerformance();
    }
  }, [user, fetchNodePerformance]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const nodeId = new URLSearchParams(window.location.search).get('node');
      const data = await fetchPerformanceTrends({ node: nodeId || user.id, range: timeRange });
      setTrends(data);
      setShowTrends(true);
    } catch (err) {
      console.error('Failed to load trends:', err);
      setError('Failed to load performance trends');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: performance.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Orders Processed',
        data: performance.map(item => item.orders_processed),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.1
      },
      {
        label: 'Revenue Generated (₹)',
        data: performance.map(item => item.revenue_generated),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.1
      },
      {
        label: 'Retailers Served',
        data: performance.map(item => item.retailers_served),
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Node Performance Over Time',
      },
    },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Node Performance</h1>
          <p className="text-gray-600">
            Analyze performance metrics and trends for your distribution nodes
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={loadTrends}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Analyze Trends
          </button>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Trends Analysis */}
      {showTrends && trends && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-indigo-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">AI Performance Analysis</h2>
            <button 
              onClick={() => setShowTrends(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trends.trends.map((trend, index) => (
                  <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-indigo-800 capitalize">{trend.metric.replace('_', ' ')}</h4>
                        <p className="text-indigo-700">{trend.trend} ({trend.rate})</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trend.confidence === 'high' ? 'bg-green-100 text-green-800' : 
                        trend.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {trend.confidence} confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {trends.anomalies && trends.anomalies.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Anomalies Detected</h3>
                <div className="space-y-3">
                  {trends.anomalies.map((anomaly, index) => (
                    <div key={index} className="bg-white border border-red-100 rounded-lg p-4 shadow-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {new Date(anomaly.date).toLocaleDateString()} - {anomaly.metric.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-gray-600">{anomaly.deviation}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Anomaly
                        </span>
                      </div>
                      {anomaly.possible_reasons && anomaly.possible_reasons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Possible reasons:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                            {anomaly.possible_reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-800 mb-2">30-Day Forecast</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo-700">Expected Orders</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {trends.forecast?.next_30_days?.expected_orders || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-700">Expected Revenue</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {trends.forecast?.next_30_days?.expected_revenue ? `₹${trends.forecast.next_30_days.expected_revenue.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-indigo-100 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Recommendations</h3>
                {trends.recommendations && trends.recommendations.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {trends.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No specific recommendations available</p>
                )}
              </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <LineChart className="w-5 h-5 text-indigo-600 mr-2" />
                Performance Trends
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-indigo-600">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                Detailed Performance Metrics
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-indigo-600">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-1 text-gray-500 hover:text-indigo-600">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders Processed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retailers Served
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No performance data available.
                      </td>
                    </tr>
                  ) : (
                    performance.map((item) => (
                      <tr key={item.date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.orders_processed}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{item.revenue_generated.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.retailers_served}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.retailers_served > 0 
                              ? (item.orders_processed / item.retailers_served).toFixed(2) 
                              : 0} orders/retailer
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;