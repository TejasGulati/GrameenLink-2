import { useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DashboardContext } from '../../context/DashboardContext';
import { 
  Activity, ClipboardList, Loader,
  RefreshCw, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle, Zap, Info,
  Box, Heart, Package, ShoppingCart, Truck, ShoppingBag, AlertCircle, BarChart2
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
);

const extractData = (response) => {
  if (!response) return null;
  
  if (response.results) return response.results;
  if (response.data) return response.data;
  if (Array.isArray(response)) return response;
  
  console.warn('Unexpected response format:', response);
  return null;
};

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const { 
    fetchUserDashboard,
    generatePersonalizedInsights,
    fetchNotifications,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    invalidateDashboardQueries
  } = useContext(DashboardContext);
  
  const [dashboardData, setDashboardData] = useState({
    dashboard: null,
    aiInsights: null,
    notifications: []
  });
  
  const [loading, setLoading] = useState({
    dashboard: false,
    insights: false,
    notifications: false,
    refreshing: false
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('userDashboardActiveTab') || 'overview';
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Tab persistence handling
  useEffect(() => {
    localStorage.setItem('userDashboardActiveTab', activeTab);
  }, [activeTab]);

  // Track tab element references
  const tabRefs = useMemo(() => ({}), []);

  // Update tab indicator
  const updateTabIndicator = useCallback(() => {
    const currentTab = tabRefs[activeTab];
    if (currentTab) {
      setTabIndicator({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth
      });
    }
  }, [activeTab, tabRefs]);

  // Set up resize observer for tab indicator
  useEffect(() => {
    updateTabIndicator();
    window.addEventListener('resize', updateTabIndicator);
    return () => {
      window.removeEventListener('resize', updateTabIndicator);
    };
  }, [updateTabIndicator]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const setTabRef = (tab, element) => {
    if (element && !tabRefs[tab]) {
      tabRefs[tab] = element;
      if (tab === activeTab) {
        updateTabIndicator();
      }
    }
  };

  const getIconForInsightType = (key) => {
    const iconProps = { className: "w-5 h-5", size: 18 };
    
    if (/trend|performance|growth/i.test(key)) return <TrendingUp {...iconProps} className="text-green-500" />;
    if (/threat|warning|alert|risk/i.test(key)) return <AlertTriangle {...iconProps} className="text-orange-500" />;
    if (/recommend|suggestion|advice/i.test(key)) return <CheckCircle {...iconProps} className="text-blue-500" />;
    if (/metric|stat|number|value/i.test(key)) return <BarChart2 {...iconProps} className="text-purple-500" />;
    if (/summary|overview|insight/i.test(key)) return <Info {...iconProps} className="text-indigo-500" />;
    
    return <Zap {...iconProps} className="text-yellow-500" />;
  };

  const fetchData = useCallback(async (type) => {
    if (!type) type = activeTab;
    
    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));
    
    try {
      let response;
      let data;
      
      switch(type) {
        case 'overview':
          response = await fetchUserDashboard();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            dashboard: data,
            aiInsights: data?.ai_insights || null
          }));
          break;
          
        case 'notifications':
          response = await fetchNotifications();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            notifications: data || []
          }));
          
          // Get unread count
          const unreadResponse = await getUnreadNotificationCount();
          setUnreadNotifications(unreadResponse?.data?.count || 0);
          break;
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to load ${type}` }));
      console.error(`Error loading ${type}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [activeTab, fetchUserDashboard, fetchNotifications, getUnreadNotificationCount]);

  const generateAIInsights = useCallback(async () => {
    setLoading(prev => ({ ...prev, insights: true }));
    setErrors(prev => ({ ...prev, insights: null }));
    
    try {
      const response = await generatePersonalizedInsights();
      const insights = extractData(response)?.data?.insights || extractData(response)?.insights || extractData(response);
      
      if (insights) {
        setDashboardData(prev => ({
          ...prev,
          aiInsights: insights
        }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, insights: err.message || 'Failed to generate insights' }));
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  }, [generatePersonalizedInsights]);

  const refreshData = useCallback(async (type) => {
    if (!type) type = activeTab;
    
    setLoading(prev => ({ ...prev, refreshing: true }));
    
    try {
      let response;
      let data;
      
      switch(type) {
        case 'overview':
          response = await fetchUserDashboard();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            dashboard: data,
            aiInsights: data?.ai_insights || null
          }));
          break;
          
        case 'notifications':
          response = await fetchNotifications();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            notifications: data || []
          }));
          
          const unreadResponse = await getUnreadNotificationCount();
          setUnreadNotifications(unreadResponse?.data?.count || 0);
          break;
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      invalidateDashboardQueries();
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to refresh ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, refreshing: false }));
    }
  }, [activeTab, fetchUserDashboard, fetchNotifications, getUnreadNotificationCount, invalidateDashboardQueries]);

  const markNotificationsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setUnreadNotifications(0);
      await fetchData('notifications');
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }, [markAllNotificationsRead, fetchData]);

  useEffect(() => {
    fetchData(activeTab);
  }, [fetchData, activeTab]);

  const statsCards = useMemo(() => {
    if (!dashboardData.dashboard) return [];
    
    const commonStats = [
      {
        title: 'Recent Orders',
        value: dashboardData.dashboard?.recent_orders?.length || 0,
        icon: <ShoppingCart className="w-5 h-5" />,
        change: '0%',
        trend: 'neutral',
        color: 'from-blue-600 to-indigo-700',
        textColor: 'text-blue-50'
      }
    ];
    
    if (user?.user_type === 'retailer') {
      return [
        ...commonStats,
        {
          title: 'Active Demands',
          value: dashboardData.dashboard?.retailer_demands?.length || 0,
          icon: <ClipboardList className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-emerald-500 to-teal-600',
          textColor: 'text-green-50'
        },
        {
          title: 'Favorite Products',
          value: dashboardData.dashboard?.preferred_products?.length || 0,
          icon: <Heart className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-violet-500 to-purple-700',
          textColor: 'text-purple-50'
        }
      ];
    } else if (user?.user_type === 'node') {
      return [
        ...commonStats,
        {
          title: 'Inventory Items',
          value: dashboardData.dashboard?.inventory_items?.length || 0,
          icon: <Package className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-amber-500 to-orange-600',
          textColor: 'text-orange-50'
        },
        {
          title: 'Fulfillment Rate',
          value: dashboardData.dashboard?.node_performance?.fulfillment_rate 
            ? `${Math.round(dashboardData.dashboard.node_performance.fulfillment_rate)}%` 
            : '0%',
          icon: <CheckCircle className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-green-500 to-emerald-600',
          textColor: 'text-green-50'
        }
      ];
    } else if (user?.user_type === 'distributor') {
      return [
        ...commonStats,
        {
          title: 'Products Listed',
          value: dashboardData.dashboard?.products_listed || 0,
          icon: <ShoppingBag className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-pink-500 to-rose-600',
          textColor: 'text-pink-50'
        },
        {
          title: 'Pending Demands',
          value: dashboardData.dashboard?.pending_demands?.length || 0,
          icon: <AlertCircle className="w-5 h-5" />,
          change: '0%',
          trend: 'neutral',
          color: 'from-red-500 to-rose-700',
          textColor: 'text-red-50'
        }
      ];
    }
    
    return commonStats;
  }, [dashboardData.dashboard, user?.user_type]);

  const TabIndicator = () => (
    <div 
      className="absolute h-[3px] bottom-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-t shadow-glow"
      style={{ 
        left: tabIndicator.left,
        width: tabIndicator.width 
      }}
    />
  );

  // Updated renderInsightContent function that properly formats JSON data
  const renderInsightContent = (content) => {
    // Handle string content
    if (typeof content === 'string') {
      return <p className="text-gray-700">{content}</p>;
    }
    
    // Handle array content
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-5 space-y-2">
          {content.map((item, i) => (
            <li key={i} className="text-gray-700">
              {renderInsightContent(item)}
            </li>
          ))}
        </ul>
      );
    }
    
    // Handle object content that appears to be product data
    if (typeof content === 'object' && content !== null) {
      // Check if it's a product-related object with specific fields
      if (content.product && (content.order_count || content.total_quantity || content.total_demand)) {
        return (
          <div className="flex items-center justify-between py-2">
            <span className="font-medium">{content.product}</span>
            <div className="flex gap-4">
              {content.order_count && (
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  Orders: {content.order_count}
                </span>
              )}
              {content.total_quantity && (
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                  Quantity: {content.total_quantity}
                </span>
              )}
              {content.total_demand && (
                <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  Demand: {content.total_demand}
                </span>
              )}
            </div>
          </div>
        );
      }
      
      // Handle nested objects
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([key, value]) => {
            // Skip rendering if value is null or undefined
            if (value === null || value === undefined) return null;
            
            // Handle special case for product data arrays
            if (Array.isArray(value) && value.length > 0 && 
                typeof value[0] === 'object' && value[0].product) {
              return (
                <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
                  <h5 className="font-medium capitalize mb-3 text-indigo-700 border-b pb-2">
                    {key.replace(/_/g, ' ')}
                  </h5>
                  <div className="space-y-2 divide-y">
                    {value.map((item, index) => (
                      <div key={index}>
                        {renderInsightContent(item)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Try to parse string that might be JSON
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              try {
                const parsedValue = JSON.parse(value);
                return (
                  <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
                    <h5 className="font-medium capitalize mb-2 text-indigo-700">
                      {key.replace(/_/g, ' ')}
                    </h5>
                    {renderInsightContent(parsedValue)}
                  </div>
                );
              } catch (e) {
                // If parsing fails, treat as regular string
              }
            }
            
            return (
              <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
                <h5 className="font-medium capitalize mb-2 text-indigo-700">
                  {key.replace(/_/g, ' ')}
                </h5>
                {renderInsightContent(value)}
              </div>
            );
          })}
        </div>
      );
    }
    
    // For other types like numbers, booleans, etc.
    return <p className="text-gray-700">{String(content)}</p>;
  };

  // Updated function for the "Top Products" and "Pending Demand" sections
  const renderProductMetrics = (products, title, type = 'orders') => {
    if (!products || products.length === 0) return null;
    
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h5 className="font-medium text-lg text-indigo-700 border-b pb-2 mb-4">{title}</h5>
        <div className="space-y-2 divide-y">
          {products.map((product, index) => (
            <div key={index} className="pt-2 flex justify-between items-center">
              <span className="font-medium">{product.product}</span>
              <div>
                {type === 'orders' && (
                  <div className="flex gap-2">
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      Orders: {product.order_count}
                    </span>
                    <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                      Qty: {product.total_quantity}
                    </span>
                  </div>
                )}
                {type === 'demand' && (
                  <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    Demand: {product.total_demand}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to safely parse JSON data from the API
  const parseInsightData = (data, section) => {
    if (!data || !data[section]) return [];
    
    // If data is already an array, use it
    if (Array.isArray(data[section])) {
      return data[section];
    }
    
    // If it's a string that might be JSON, try to parse it
    if (typeof data[section] === 'string') {
      try {
        return JSON.parse(data[section]);
      } catch (e) {
        console.error(`Failed to parse ${section} data:`, e);
        return [];
      }
    }
    
    // For other cases, try to extract data in a sensible way
    if (typeof data[section] === 'object') {
      return Object.values(data[section]);
    }
    
    return [];
  };

  const KeyMetricsSection = ({ aiInsights }) => {
    if (!aiInsights) return null;
    
    const topProducts = parseInsightData(aiInsights, 'top_products');
    const pendingDemand = parseInsightData(aiInsights, 'pending_demand');
    
    return (
      <div className="space-y-6">
        {topProducts.length > 0 && renderProductMetrics(topProducts, 'Top Products', 'orders')}
        {pendingDemand.length > 0 && renderProductMetrics(pendingDemand, 'Pending Demand', 'demand')}
        
        {/* Render other metrics as needed */}
        {Object.entries(aiInsights).map(([key, value]) => {
          // Skip the sections we've already handled
          if (['top_products', 'pending_demand'].includes(key)) return null;
          
          // Skip empty values
          if (!value) return null;
          
          return (
            <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
              <h5 className="font-medium capitalize mb-2 text-indigo-700 border-b pb-2">
                {key.replace(/_/g, ' ')}
              </h5>
              {renderInsightContent(value)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsCards.map((card, index) => (
                <div
                  key={card.title}
                  className={`p-6 rounded-xl shadow-lg bg-gradient-to-br ${card.color} ${card.textColor} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-sm font-medium text-white/90">{card.title}</p>
                      <div className="text-2xl font-bold mt-2">
                        {loading.dashboard ? (
                          <div className="h-8 bg-white/20 rounded w-24" />
                        ) : (
                          card.value
                        )}
                      </div>
                    </div>
                    <div className="bg-white/25 p-3 rounded-lg backdrop-blur-sm shadow-inner">
                      {card.icon}
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm relative z-10">
                    <span className={`flex items-center text-white/90`}>
                      {card.trend === 'up' ? (
                        <ChevronUp className="w-4 h-4 mr-1" />
                      ) : card.trend === 'down' ? (
                        <ChevronDown className="w-4 h-4 mr-1" />
                      ) : (
                        <span className="w-4 h-4 mr-1">→</span>
                      )}
                      {card.change}
                    </span>
                    <span className="text-white/70 ml-2">vs last period</span>
                  </div>
                </div>
              ))}
            </div>

            {dashboardData.aiInsights && (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-50 border-b flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-800">
                      <Zap className="text-indigo-600" size={22} strokeWidth={2.5} /> 
                      Personalized Insights
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated at: {new Date(dashboardData.dashboard?.ai_insights_generated_at).toLocaleString() || 'Recently'}
                    </p>
                  </div>
                  <button
                    onClick={generateAIInsights}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md"
                    disabled={loading.insights}
                  >
                    {loading.insights ? (
                      <Loader className="w-5 h-5" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    Regenerate
                  </button>
                </div>
                
                <div className="divide-y">
                  {Object.entries(dashboardData.aiInsights).map(([section, content], index) => {
                    if (!content) return null;
                    
                    return (
                      <div 
                        key={section}
                        className="p-6 hover:bg-indigo-50/30 transition-colors duration-200"
                      >
                        <button
                          onClick={() => setExpandedInsight(prev => prev === section ? null : section)}
                          className="flex justify-between items-center w-full text-left"
                        >
                          <h4 className="font-medium flex items-center gap-2 capitalize text-indigo-700">
                            {getIconForInsightType(section)}
                            {section.replace(/_/g, ' ')}
                          </h4>
                          <div>
                            {expandedInsight === section ? (
                              <ChevronUp className="text-gray-400" />
                            ) : (
                              <ChevronDown className="text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {expandedInsight === section && (
                          <div className="mt-4">
                            {section === 'key_metrics' ? (
                              <KeyMetricsSection aiInsights={content} />
                            ) : (
                              renderInsightContent(content)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50">
                <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                  <Activity size={20} strokeWidth={2.5} className="text-indigo-600" /> 
                  Recent Activity
                </h3>
              </div>
              
              {dashboardData.dashboard?.recent_orders?.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.dashboard.recent_orders.slice(0, 5).map((order, index) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-indigo-700">Order #{order.id}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.order_date).toLocaleDateString()} • {order.status}
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          ₹{parseFloat(order.total_amount).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Box className="w-4 h-4" />
                        <span>{order.items?.length || 0} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {loading.dashboard ? (
                    <Loader className="mx-auto text-indigo-500" size={32} />
                  ) : (
                    'No recent activity found'
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                <AlertCircle size={20} strokeWidth={2.5} className="text-indigo-600" /> 
                Notifications
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </h3>
              {unreadNotifications > 0 && (
                <button
                  onClick={markNotificationsRead}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark All Read
                </button>
              )}
            </div>
            
            {dashboardData.notifications.length > 0 ? (
              <div className="divide-y">
                {dashboardData.notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-indigo-700 flex items-center gap-2">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">New</span>
                          )}
                        </h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {loading.notifications ? (
                  <Loader className="mx-auto text-indigo-500" size={32} />
                ) : (
                  'No notifications found'
                )}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (errors.dashboard || errors.notifications) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center p-4 text-red-600 bg-red-100 rounded-lg shadow-sm">
          <AlertCircle className="mr-2 w-5 h-5" />
          {errors.dashboard || errors.notifications}
        </div>
        <button
          onClick={() => fetchData()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto shadow-md"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Loading Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {user?.user_type === 'retailer' ? (
              <ShoppingCart className="text-indigo-600" size={28} strokeWidth={2.5} />
            ) : user?.user_type === 'node' ? (
              <Package className="text-indigo-600" size={28} strokeWidth={2.5} />
            ) : (
              <Truck className="text-indigo-600" size={28} strokeWidth={2.5} />
            )}
            {user?.user_type === 'retailer' ? 'Retailer' : 
             user?.user_type === 'node' ? 'Operator' : 
             'Distributor'} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-medium text-indigo-700">{user?.name || 'User'}</span> 👋
            {lastUpdated && (
              <span className="text-sm text-gray-400 ml-2">Last updated: {lastUpdated}</span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => refreshData(activeTab)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md"
            disabled={loading.refreshing}
          >
            {loading.refreshing ? (
              <Loader className="mr-2 w-5 h-5" />
            ) : (
              <RefreshCw className="mr-2 w-5 h-5" />
            )}
            Refresh
          </button>
          
          {activeTab === 'overview' && (
            <button
              onClick={generateAIInsights}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg"
              disabled={loading.insights}
            >
              {loading.insights ? (
                <Loader className="mr-2 w-5 h-5" />
              ) : (
                <Zap className="mr-2 w-5 h-5" />
              )}
              Generate Insights
            </button>
          )}
        </div>
      </div>

      <div className="relative border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'notifications'].map((tab) => (
            <button
              key={tab}
              ref={(ref) => setTabRef(tab, ref)}
              onClick={() => handleTabChange(tab)}
              className={`pb-4 px-1 capitalize font-medium relative ${
                activeTab === tab
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'notifications' && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-4 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>
        <TabIndicator />
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;