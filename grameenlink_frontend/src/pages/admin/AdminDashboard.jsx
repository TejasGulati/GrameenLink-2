import { useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DashboardContext } from '../../context/DashboardContext';
import { 
  Users, Activity, PieChart,
  AlertCircle, ArrowUpRight, ClipboardList, Loader,
  RefreshCw, BarChart2, Shield, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle, Zap, Info,
  Eye, Box, ShieldCheck, BarChart3, Heart
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
  
  // Handle nested response structures
  if (response.results) return response.results;
  if (response.data) return response.data;
  if (Array.isArray(response)) return response;
  
  console.warn('Unexpected response format:', response);
  return null;
};

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const { 
    fetchDashboardAnalytics,
    generateDashboardAnalytics,
    generateAIAnalyticsInsights,
    fetchKPIs,
    updateAllKPIs,
    invalidateDashboardQueries
  } = useContext(DashboardContext);
  
  const [dashboardData, setDashboardData] = useState({
    analytics: [],
    kpis: [],
    latestAnalytics: null,
    aiInsights: null
  });
  
  const [loading, setLoading] = useState({
    analytics: false,
    kpis: false,
    insights: false,
    refreshing: false
  });
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(() => {
    // Get active tab from localStorage or default to 'analytics'
    return localStorage.getItem('adminDashboardActiveTab') || 'analytics';
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  // Tab persistence handling
  useEffect(() => {
    // Save active tab to localStorage whenever it changes
    localStorage.setItem('adminDashboardActiveTab', activeTab);
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
    
    // Handle window resize events
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
        case 'analytics':
          response = await fetchDashboardAnalytics();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            analytics: data?.data || [],
            latestAnalytics: data?.data?.[0] || null
          }));
          break;
          
        case 'kpis':
          response = await fetchKPIs();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            kpis: data?.data || []
          }));
          break;
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to load ${type}` }));
      console.error(`Error loading ${type}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [activeTab, fetchDashboardAnalytics, fetchKPIs]);

  const generateAIInsights = useCallback(async () => {
    if (!dashboardData.latestAnalytics) return;
    
    setLoading(prev => ({ ...prev, insights: true }));
    setErrors(prev => ({ ...prev, insights: null }));
    
    try {
      const response = await generateAIAnalyticsInsights({
        time_range: dashboardData.latestAnalytics.time_range
      });
      const insights = extractData(response)?.insights;
      
      if (insights) {
        setDashboardData(prev => ({
          ...prev,
          aiInsights: insights,
          latestAnalytics: {
            ...prev.latestAnalytics,
            ai_generated_insights: insights
          }
        }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, insights: err.message || 'Failed to generate insights' }));
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  }, [generateAIAnalyticsInsights, dashboardData.latestAnalytics]);

  const refreshData = useCallback(async (type) => {
    if (!type) type = activeTab;
    
    setLoading(prev => ({ ...prev, refreshing: true }));
    
    try {
      let response;
      let data;
      switch(type) {
        case 'analytics':
          response = await generateDashboardAnalytics();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            analytics: data?.data || [],
            latestAnalytics: data?.data?.[0] || null
          }));
          break;
          
        case 'kpis':
          await updateAllKPIs();
          response = await fetchKPIs();
          data = extractData(response);
          setDashboardData(prev => ({
            ...prev,
            kpis: data?.data || []
          }));
          break;
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      invalidateDashboardQueries();
    } catch (err) {
      setErrors(prev => ({ ...prev, [type]: err.message || `Failed to refresh ${type}` }));
    } finally {
      setLoading(prev => ({ ...prev, refreshing: false }));
    }
  }, [activeTab, generateDashboardAnalytics, fetchKPIs, updateAllKPIs, invalidateDashboardQueries]);

  useEffect(() => {
    fetchData(activeTab);
  }, [fetchData, activeTab]);

  const statsCards = useMemo(() => {
    const stats = dashboardData.latestAnalytics || {};
    const activeUsers = stats.active_users || {};
    const userTypeCounts = stats.user_type_counts || {};
    
    return [
      {
        title: 'Total Users',
        value: Object.values(userTypeCounts).reduce((sum, val) => sum + val, 0),
        icon: <Users className="w-5 h-5" />,
        change: '8.3%',
        trend: 'up',
        color: 'from-blue-600 to-indigo-700',
        textColor: 'text-blue-50'
      },
      {
        title: 'Active Users',
        value: Object.values(activeUsers).reduce((sum, val) => sum + val, 0),
        icon: <Activity className="w-5 h-5" />,
        change: '12.7%',
        trend: 'up',
        color: 'from-emerald-500 to-teal-600',
        textColor: 'text-green-50'
      },
      {
        title: 'Total Orders',
        value: stats.total_orders || 0,
        icon: <ClipboardList className="w-5 h-5" />,
        change: '3.2%',
        trend: 'up',
        color: 'from-violet-500 to-purple-700',
        textColor: 'text-purple-50'
      },
      {
        title: 'Total Revenue',
        value: stats.total_revenue ? `₹${parseFloat(stats.total_revenue).toLocaleString()}` : '₹0',
        icon: <PieChart className="w-5 h-5" />,
        change: '5.4%',
        trend: 'up',
        color: 'from-pink-500 to-rose-600',
        textColor: 'text-pink-50'
      }
    ];
  }, [dashboardData.latestAnalytics]);

  // Tab indicator component
  const TabIndicator = () => (
    <div 
      className="absolute h-[3px] bottom-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-t shadow-glow"
      style={{ 
        left: tabIndicator.left,
        width: tabIndicator.width 
      }}
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {statsCards.map((card, index) => (
                <div
                  key={card.title}
                  className={`p-6 rounded-xl shadow-lg bg-gradient-to-br ${card.color} ${card.textColor} relative overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-sm font-medium text-white/90">{card.title}</p>
                      <div className="text-2xl font-bold mt-2">
                        {loading.analytics ? (
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
                      ) : (
                        <ChevronDown className="w-4 h-4 mr-1" />
                      )}
                      {card.change}
                    </span>
                    <span className="text-white/70 ml-2">vs last period</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights Section */}
            {(dashboardData.aiInsights || dashboardData.latestAnalytics?.ai_generated_insights) && (
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-50 border-b flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-800">
                      <Zap className="text-indigo-600" size={22} strokeWidth={2.5} /> 
                      AI-Generated Insights
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated at: {new Date(dashboardData.latestAnalytics?.generated_at).toLocaleString() || 'Recently'}
                    </p>
                  </div>
                </div>
                
                <div className="divide-y">
                  {Object.entries(dashboardData.aiInsights || dashboardData.latestAnalytics?.ai_generated_insights).map(([section, content], index) => {
                    if (typeof content !== 'object' || content === null) return null;
                    
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
                            <ChevronDown className="text-gray-400" />
                          </div>
                        </button>
                        
                        {expandedInsight === section && (
                          <div className="mt-4">
                            {/* Special handling for performance_summary -> key_metrics */}
                            {section === 'performance_summary' && content.key_metrics && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(content.key_metrics).map(([metric, data], idx) => {
                                    if (typeof data === 'string' || typeof data === 'number') {
                                      return (
                                        <div 
                                          key={metric}
                                          className="border rounded-lg p-4 hover:border-indigo-300 transition-all duration-200 bg-white shadow-sm"
                                        >
                                          <h5 className="font-medium capitalize text-indigo-700">{metric.replace(/_/g, ' ')}</h5>
                                          <p className="text-2xl font-semibold mt-2 text-gray-800">{data}</p>
                                        </div>
                                      );
                                    }
                                    
                                    if (data && typeof data === 'object' && !Array.isArray(data)) {
                                      const trendColor = {
                                        'Increasing': 'text-emerald-600',
                                        'Decreasing': 'text-red-600',
                                        'Stable': 'text-blue-600',
                                        'Slightly Increasing': 'text-emerald-500',
                                        'Slightly Decreasing': 'text-red-500'
                                      }[data.trend] || 'text-gray-600';
                                      
                                      return (
                                        <div 
                                          key={metric}
                                          className="border rounded-lg p-4 hover:border-indigo-300 transition-all duration-200 bg-white shadow-sm"
                                        >
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <h5 className="font-medium capitalize text-indigo-700">{metric.replace(/_/g, ' ')}</h5>
                                              <div className="flex items-center mt-2">
                                                <span className={`text-sm ${trendColor} flex items-center font-medium`}>
                                                  {data.trend === 'Increasing' ? (
                                                    <ChevronUp className="w-4 h-4 mr-1" />
                                                  ) : data.trend === 'Decreasing' ? (
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                  ) : (
                                                    <span className="w-4 h-4 mr-1">→</span>
                                                  )}
                                                  {data.trend}
                                                </span>
                                              </div>
                                            </div>
                                            {Array.isArray(data.values) && (
                                              <div className="flex items-end gap-1 h-12">
                                                {data.values.map((value, i) => (
                                                  <div 
                                                    key={i}
                                                    style={{ 
                                                      height: `${Math.min(100, (i === 0 ? 50 : 
                                                        (Number(data.values[i]) / Number(data.values[0]) * 50)))}%` 
                                                    }}
                                                    className={`w-4 rounded-t-sm ${
                                                      data.trend === 'Increasing' ? 'bg-emerald-400' : 
                                                      data.trend === 'Decreasing' ? 'bg-red-400' : 'bg-blue-400'
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          
                                          {Array.isArray(data.values) && (
                                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                              {data.values.map((value, i) => (
                                                <div key={i} className="text-center">
                                                  <p className="text-gray-500">
                                                    {i === 0 ? '3 days ago' : i === 1 ? '2 days ago' : 'Today'}
                                                  </p>
                                                  <p className="font-medium text-gray-800">{value}</p>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {data.description && (
                                            <p className="text-sm text-gray-600 mt-3">{data.description}</p>
                                          )}
                                        </div>
                                      );
                                    }
                                    
                                    return null;
                                  })}
                                </div>
                                
                                {/* Render other performance_summary content */}
                                {Object.entries(content).map(([key, value], idx) => {
                                  if (key === 'key_metrics') return null;
                                  return (
                                    <div 
                                      key={key}
                                      className="mt-4 bg-white p-4 rounded-lg shadow-sm"
                                    >
                                      <h5 className="font-medium capitalize text-indigo-700 mb-2">
                                        {key.replace(/_/g, ' ')}
                                      </h5>
                                      {typeof value === 'string' ? (
                                        <p className="text-gray-700">{value}</p>
                                      ) : Array.isArray(value) ? (
                                        <ul className="list-disc pl-5 space-y-1">
                                          {value.map((item, i) => (
                                            <li key={i} className="text-gray-700">{item}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-gray-700">{JSON.stringify(value)}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {/* Default rendering for other sections */}
                            {section !== 'performance_summary' && (
                              <div className="space-y-4">
                                {typeof content === 'string' ? (
                                  <p className="text-gray-700">{content}</p>
                                ) : Array.isArray(content) ? (
                                  <ul className="list-disc pl-5 space-y-2">
                                    {content.map((item, i) => (
                                      <li key={i} className="text-gray-700">{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  Object.entries(content).map(([key, value], idx) => (
                                    <div 
                                      key={key}
                                      className="border rounded-lg p-4 bg-white shadow-sm transition-all duration-200"
                                    >
                                      <h5 className="font-medium capitalize mb-2 text-indigo-700">{key.replace(/_/g, ' ')}</h5>
                                      {typeof value === 'string' ? (
                                        <p className="text-gray-700">{value}</p>
                                      ) : Array.isArray(value) ? (
                                        <ul className="list-disc pl-5 space-y-1">
                                          {value.map((item, i) => (
                                            <li key={i} className="text-gray-700">{item}</li>
                                          ))}
                                        </ul>
                                      ) : typeof value === 'object' && value !== null ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                          {Object.entries(value).map(([subKey, subValue], subIdx) => (
                                            <div 
                                              key={subKey}
                                              className="bg-indigo-50/50 p-3 rounded"
                                            >
                                              <p className="text-sm font-medium capitalize text-indigo-600">
                                                {subKey.replace(/_/g, ' ')}
                                              </p>
                                              <p className="text-gray-700 mt-1">
                                                {typeof subValue === 'string' ? subValue : JSON.stringify(subValue)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-gray-700">{JSON.stringify(value)}</p>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* System Analytics */}
            <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50">
                <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                  <BarChart2 size={20} strokeWidth={2.5} className="text-indigo-600" /> 
                  System Analytics
                </h3>
              </div>
              
              {dashboardData.analytics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* Order Trends Chart */}
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="font-semibold mb-4 text-indigo-700 flex items-center gap-2">
                      <BarChart3 size={18} /> Order Trends
                    </h4>
                    <div className="h-64">
                      <Line
                        data={{
                          labels: dashboardData.analytics.slice(0, 7).map(a => 
                            new Date(a.date).toLocaleDateString()
                          ).reverse(),
                          datasets: [{
                            label: 'Orders',
                            data: dashboardData.analytics.slice(0, 7).map(a => a.total_orders).reverse(),
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            tension: 0.4,
                            fill: {
                              target: 'origin',
                              above: 'rgba(99, 102, 241, 0.1)'
                            }
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.raw}`;
                                }
                              }
                            }
                          },
                          elements: {
                            point: {
                              radius: 5,
                              hoverRadius: 7,
                              backgroundColor: '#4338ca'
                            }
                          },
                          scales: {
                            y: {
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                              }
                            },
                            x: {
                              grid: {
                                color: 'rgba(0, 0, 0, 0.02)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Revenue Trends Chart */}
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="font-semibold mb-4 text-emerald-700 flex items-center gap-2">
                      <TrendingUp size={18} /> Revenue Trends
                    </h4>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: dashboardData.analytics.slice(0, 7).map(a => 
                            new Date(a.date).toLocaleDateString()
                          ).reverse(),
                          datasets: [{
                            label: 'Revenue (₹)',
                            data: dashboardData.analytics.slice(0, 7).map(a => parseFloat(a.total_revenue)).reverse(),
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderRadius: 6,
                            hoverBackgroundColor: 'rgba(5, 150, 105, 0.9)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `Revenue: ₹${context.raw.toLocaleString()}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              ticks: {
                                callback: function(value) {
                                  return '₹' + value.toLocaleString();
                                }
                              },
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                              }
                            },
                            x: {
                              grid: {
                                color: 'rgba(0, 0, 0, 0.02)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* User Distribution */}
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="font-semibold mb-4 text-purple-700 flex items-center gap-2">
                      <Users size={18} /> User Distribution
                    </h4>
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: Object.keys(dashboardData.latestAnalytics?.user_type_counts || {}),
                          datasets: [{
                            data: Object.values(dashboardData.latestAnalytics?.user_type_counts || {}),
                            backgroundColor: [
                              'rgba(99, 102, 241, 0.7)',
                              'rgba(16, 185, 129, 0.7)',
                              'rgba(245, 158, 11, 0.7)',
                              'rgba(236, 72, 153, 0.7)',
                              'rgba(59, 130, 246, 0.7)'
                            ],
                            borderWidth: 1,
                            hoverOffset: 10
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((value / total) * 100);
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Fulfillment Rate */}
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="font-semibold mb-4 text-cyan-700 flex items-center gap-2">
                      <CheckCircle size={18} /> Fulfillment Metrics
                    </h4>
                    <div className="h-64">
                      <Line
                        data={{
                          labels: dashboardData.analytics.slice(0, 7).map(a => 
                            new Date(a.date).toLocaleDateString()
                          ).reverse(),
                          datasets: [{
                            label: 'Fulfillment Rate (%)',
                            data: dashboardData.analytics.slice(0, 7).map(a => parseFloat(a.order_fulfillment_rate)).reverse(),
                            borderColor: '#06b6d4',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            tension: 0.3,
                            fill: {
                              target: 'origin',
                              above: 'rgba(6, 182, 212, 0.1)'
                            }
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            y: {
                              min: 0,
                              max: 100,
                              ticks: {
                                callback: function(value) {
                                  return value + '%';
                                }
                              },
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                              }
                            },
                            x: {
                              grid: {
                                color: 'rgba(0, 0, 0, 0.02)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {loading.analytics ? (
                    <Loader className="mx-auto text-indigo-500" size={32} />
                  ) : (
                    'No analytics data available'
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'kpis':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50">
              <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                <Activity size={20} strokeWidth={2.5} className="text-indigo-600" /> 
                Key Performance Indicators
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {loading.kpis ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 rounded"
                  />
                ))
              ) : dashboardData.kpis.length > 0 ? (
                dashboardData.kpis.map((kpi, index) => {
                  const progress = parseFloat(kpi.progress);
                  const statusClass = progress >= 90 
                    ? 'bg-emerald-100 text-emerald-700'
                    : progress >= 75
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700';
                  
                  return (
                    <div
                      key={kpi.id}
                      className="p-6 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-indigo-700">{kpi.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{kpi.timeframe}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusClass}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-800 font-medium">{kpi.current_value} / {kpi.target_value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            style={{ width: `${Math.min(100, progress)}%` }}
                            className={`h-2.5 rounded-full ${
                              progress >= 90 ? 'bg-emerald-500' :
                              progress >= 75 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Target</p>
                          <p className="font-medium text-gray-800">{kpi.target_value}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current</p>
                          <p className="font-medium text-gray-800">{kpi.current_value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500 col-span-2">
                  No KPIs found
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (errors.analytics || errors.kpis) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center p-4 text-red-600 bg-red-100 rounded-lg shadow-sm">
          <AlertCircle className="mr-2 w-5 h-5" />
          {errors.analytics || errors.kpis}
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
            <Shield className="text-indigo-600" size={28} strokeWidth={2.5} /> Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-medium text-indigo-700">{user?.name || 'Admin'}</span> 👋
            {lastUpdated && (
              <span className="text-sm text-gray-400 ml-2">Last updated: {lastUpdated}</span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {activeTab === 'analytics' && (
            <>
              <button
                onClick={generateAIInsights}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg"
                disabled={loading.insights || loading.analytics || !dashboardData.latestAnalytics}
              >
                {loading.insights ? (
                  <Loader className="mr-2 w-5 h-5" />
                ) : (
                  <BarChart2 className="mr-2 w-5 h-5" />
                )}
                Generate Insights
              </button>
              
              <button
                onClick={() => refreshData('analytics')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md"
                disabled={loading.refreshing}
              >
                {loading.refreshing ? (
                  <Loader className="mr-2 w-5 h-5" />
                ) : (
                  <RefreshCw className="mr-2 w-5 h-5" />
                )}
                Refresh Analytics
              </button>
            </>
          )}
          
          {activeTab === 'kpis' && (
            <button
              onClick={() => refreshData('kpis')}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md"
              disabled={loading.refreshing}
            >
              {loading.refreshing ? (
                <Loader className="mr-2 w-5 h-5" />
              ) : (
                <RefreshCw className="mr-2 w-5 h-5" />
              )}
              Refresh KPIs
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['analytics', 'kpis'].map((tab) => (
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
            </button>
          ))}
        </nav>
        <TabIndicator />
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;