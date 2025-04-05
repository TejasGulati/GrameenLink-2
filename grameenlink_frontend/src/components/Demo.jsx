import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Map, 
  Package, 
  ShoppingCart, 
  Shield,
  Truck,
  BarChart2,
  ArrowRight,
  Download,
  Clock,
  Users,
  DollarSign,
  Layers,
  LineChart,
  Hand,
  Activity,
  Box,
  Leaf,
  Check,
  ChevronDown,
  ChevronUp,
  Users2,
  TrendingUp,
  CircleDollarSign,
  Crop,
  Handshake,
  PieChart,
  Smartphone,
  Briefcase,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Demo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [simulationStatus, setSimulationStatus] = useState('paused');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [inventoryLevels, setInventoryLevels] = useState({
    rice: 85,
    flour: 60,
    oil: 45,
    pulses: 70
  });
  
  const mapRef = useRef(null);
  const deliveryMapRef = useRef(null);
  const markersRef = useRef([]);
  const deliveryMarkerRef = useRef(null);

  const distributionNodes = [
    { 
      id: 'n1', 
      name: 'Mohanpur Node', 
      lat: 28.61, 
      lng: 77.23, 
      retailers: 12, 
      lastDelivery: '2 hours ago', 
      distance: 8.5,
      type: 'primary',
      capacity: '1500kg',
      subNodes: 3
    },
    { 
      id: 'n2', 
      name: 'Sunderjhar Hub', 
      lat: 28.58, 
      lng: 77.18, 
      retailers: 8, 
      lastDelivery: '1 hour ago', 
      distance: 5.2,
      type: 'secondary',
      capacity: '800kg',
      subNodes: 2
    },
    { 
      id: 'n3', 
      name: 'Rampur Center', 
      lat: 28.65, 
      lng: 77.28, 
      retailers: 15, 
      lastDelivery: '3 hours ago', 
      distance: 10.1,
      type: 'primary',
      capacity: '2000kg',
      subNodes: 5
    }
  ];

  const demoSteps = [
    { id: 'order', title: "Retailer Order Placed", icon: <ShoppingCart size={18} /> },
    { id: 'inventory', title: "Inventory Checked", icon: <Package size={18} /> },
    { id: 'dispatch', title: "Goods Dispatched", icon: <Truck size={18} /> },
    { id: 'delivery', title: "Node Delivery", icon: <Check size={18} /> }
  ];

  const navTabs = [
    { id: 'dashboard', label: "Dashboard", icon: <BarChart2 size={18} /> },
    { id: 'network', label: "Node Network", icon: <Layers size={18} /> },
    { id: 'impact', label: "Impact", icon: <LineChart size={18} /> }
  ];

  const generateTxHash = () => {
    return '0x' + Math.random().toString(16).substr(2, 64);
  };

  const toggleSimulation = () => {
    if (simulationStatus === 'completed') {
      resetSimulation();
      return;
    }
    setSimulationStatus(prev => prev === 'running' ? 'paused' : 'running');
  };

  const resetSimulation = () => {
    setSimulationStatus('paused');
    setCurrentStep(0);
    setDeliveryProgress(0);
    setSelectedNode(null);
    setTransactionHash('');
    setInventoryLevels({
      rice: 85,
      flour: 60,
      oil: 45,
      pulses: 70
    });
    if (deliveryMarkerRef.current && deliveryMapRef.current) {
      deliveryMapRef.current.removeLayer(deliveryMarkerRef.current);
      deliveryMarkerRef.current = null;
    }
  };

  // Initialize main map
  useEffect(() => {
    if (!mapRef.current) {
      const mapInstance = L.map('map').setView([28.61, 77.23], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Add warehouse marker with improved styling
      L.marker([28.61, 77.20], {
        icon: L.divIcon({
          html: `
            <div class="flex items-center justify-center bg-blue-600 px-3 py-2 rounded-full shadow-lg">
              <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
              <span class="text-xs font-medium text-black whitespace-nowrap">Central Warehouse</span>
            </div>
          `,
          className: 'bg-transparent border-none'
        })
      }).addTo(mapInstance);

      // Add node markers with better styling
      const newMarkers = distributionNodes.map(node => {
        const nodeTypeClass = node.type === 'primary' ? 'bg-emerald-200' : 'bg-teal-200';
        return L.marker([node.lat, node.lng], {
          icon: L.divIcon({
            html: `
              <div class="${nodeTypeClass} px-3 py-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
                <div class="flex items-center">
                  <div class="w-2 h-2 rounded-full bg-black mr-2"></div>
                  <span class="text-xs font-medium text-black whitespace-nowrap">${node.name}</span>
                </div>
              </div>
            `,
            className: 'bg-transparent border-none'
          })
        }).addTo(mapInstance).on('click', () => {
          if (simulationStatus !== 'running') {
            setSelectedNode(node);
          }
        });
      });
      
      markersRef.current = newMarkers;
      mapRef.current = mapInstance;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize delivery map when network tab is active
  useEffect(() => {
    if (activeTab === 'network' && !deliveryMapRef.current) {
      const droneMapInstance = L.map('delivery-map').setView([28.61, 77.23], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(droneMapInstance);

      // Add warehouse marker with improved styling
      L.marker([28.61, 77.20], {
        icon: L.divIcon({
          html: `
            <div class="flex items-center justify-center bg-blue-600 px-3 py-2 rounded-full shadow-lg">
              <div class="w-2 h-2 bg-black rounded-full mr-2"></div>
              <span class="text-xs font-medium text-black whitespace-nowrap">Central Warehouse</span>
            </div>
          `,
          className: 'bg-transparent border-none'
        })
      }).addTo(droneMapInstance);

      deliveryMapRef.current = droneMapInstance;
    }

    return () => {
      if (deliveryMapRef.current) {
        deliveryMapRef.current.remove();
        deliveryMapRef.current = null;
      }
    };
  }, [activeTab]);

  // Simulation logic
  useEffect(() => {
    if (simulationStatus !== 'running') return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= demoSteps.length) {
          setSimulationStatus('completed');
          return prev;
        }
        return nextStep;
      });

      if (currentStep >= 2 && selectedNode && deliveryMapRef.current) {
        setDeliveryProgress(prev => {
          const newProgress = prev + (100 / (demoSteps.length - 2));
          if (newProgress >= 100) return 100;
          
          const warehousePos = [28.61, 77.20];
          const nodePos = [selectedNode.lat, selectedNode.lng];
          
          const lat = warehousePos[0] + (nodePos[0] - warehousePos[0]) * (newProgress / 100);
          const lng = warehousePos[1] + (nodePos[1] - warehousePos[1]) * (newProgress / 100);
          
          if (deliveryMarkerRef.current) {
            deliveryMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const newDeliveryMarker = L.marker([lat, lng], {
              icon: L.divIcon({
                html: `
                  <div class="flex items-center justify-center bg-emerald-200 p-2 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                  </div>
                `,
                className: 'bg-transparent border-none'
              })
            }).addTo(deliveryMapRef.current);
            deliveryMarkerRef.current = newDeliveryMarker;
          }
          
          return newProgress;
        });
      }

      if (currentStep === 3) {
        setInventoryLevels(prev => ({
          rice: Math.max(0, prev.rice - 15),
          flour: Math.max(0, prev.flour - 10),
          oil: Math.max(0, prev.oil - 5),
          pulses: Math.max(0, prev.pulses - 8)
        }));
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [simulationStatus, currentStep, selectedNode]);

  // Auto-select a random node when simulation starts
  useEffect(() => {
    if (simulationStatus === 'running' && !selectedNode) {
      const randomNode = distributionNodes[Math.floor(Math.random() * distributionNodes.length)];
      setSelectedNode(randomNode);
      setTransactionHash(generateTxHash());
    }
  }, [simulationStatus, selectedNode]);

  const sectionPadding = "py-12 md:py-16";
  const containerWidth = "container mx-auto px-5 w-full max-w-7xl";

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className={`${containerWidth} py-12`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">GramSeva Network Demo</h1>
              <p className="text-lg opacity-90 max-w-2xl">
                Experience our decentralized rural distribution network in action
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={toggleSimulation}
                className="flex items-center bg-white text-emerald-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition hover:bg-gray-50 font-medium"
              >
                {simulationStatus === 'running' ? (
                  <>
                    <Pause className="mr-2" size={18} />
                    Pause Demo
                  </>
                ) : simulationStatus === 'completed' ? (
                  <>
                    <RefreshCw className="mr-2" size={18} />
                    Restart Demo
                  </>
                ) : (
                  <>
                    <Play className="mr-2" size={18} />
                    Start Demo
                  </>
                )}
              </button>
              <Link
                to="/register"
                className="flex items-center bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition font-medium"
              >
                Join Network
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className={containerWidth}>
          <nav className="flex space-x-8 overflow-x-auto py-1 hide-scrollbar">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition flex items-center whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={containerWidth}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Process Steps */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Distribution Process</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
                    <div 
                      className="bg-emerald-500 w-0.5 transition-all duration-500"
                      style={{ height: `${(currentStep / (demoSteps.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-8">
                    {demoSteps.map((step, index) => (
                      <div key={step.id} className="relative pl-12">
                        <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-white ${
                          index < currentStep ? 'bg-emerald-500' : 
                          index === currentStep ? 'bg-emerald-300 animate-pulse' : 'bg-gray-200'
                        }`}></div>
                        <div className={`p-4 rounded-lg transition-all ${
                          index <= currentStep ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${index <= currentStep ? 'bg-white shadow-sm' : 'bg-gray-100'} mr-4`}>
                              {React.cloneElement(step.icon, { 
                                className: index <= currentStep ? 'text-emerald-600' : 'text-gray-400'
                              })}
                            </div>
                            <div>
                              <h3 className="font-medium">{step.title}</h3>
                              {index === currentStep && simulationStatus === 'running' && (
                                <p className="text-sm text-gray-500 mt-1 animate-pulse">Processing...</p>
                              )}
                              {index === currentStep && (
                                <div className="mt-3">
                                  {step.id === 'order' && selectedNode && (
                                    <div className="text-sm bg-white p-3 rounded border border-gray-200">
                                      <p><span className="font-medium">Node:</span> {selectedNode.name}</p>
                                      <p><span className="font-medium">Order:</span> 15kg Rice, 10kg Flour, 5L Oil</p>
                                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                                        <Smartphone className="w-3 h-3 mr-1" />
                                        Order placed via GramSeva app
                                      </p>
                                    </div>
                                  )}
                                  {step.id === 'dispatch' && (
                                    <div className="mt-3">
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-emerald-500 transition-all duration-500"
                                          style={{ width: `${deliveryProgress}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 text-right">
                                        {Math.round(deliveryProgress)}% complete
                                      </p>
                                    </div>
                                  )}
                                  {step.id === 'delivery' && selectedNode && (
                                    <div className="text-sm bg-white p-3 rounded border border-emerald-200">
                                      <p className="font-medium text-emerald-600 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Delivery Completed!
                                      </p>
                                      <p className="mt-1">Reached {selectedNode.name} in {(selectedNode.distance / 3).toFixed(1)} hours</p>
                                      <p className="mt-1 text-xs text-gray-500">
                                        Transaction: {transactionHash.substring(0, 16)}... recorded on blockchain
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network Map */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Network Map</h2>
                <div id="map" className="h-96 bg-gray-100 rounded-lg"></div>
                <div className="mt-4 text-sm text-gray-500">
                  {selectedNode && currentStep >= 2 && (
                    <p className="text-emerald-600 font-medium flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Delivery to {selectedNode.name} in progress
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Inventory Levels */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Warehouse Inventory</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Rice', level: inventoryLevels.rice, color: 'bg-emerald-500' },
                    { name: 'Flour', level: inventoryLevels.flour, color: 'bg-blue-500' },
                    { name: 'Cooking Oil', level: inventoryLevels.oil, color: 'bg-amber-500' },
                    { name: 'Pulses', level: inventoryLevels.pulses, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span>{item.level}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Info */}
              {selectedNode && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold mb-4">Selected Node</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{selectedNode.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium capitalize">{selectedNode.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium">{selectedNode.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retailers Served</span>
                      <span className="font-medium">{selectedNode.retailers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sub-Nodes</span>
                      <span className="font-medium">{selectedNode.subNodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Delivery</span>
                      <span className="font-medium">{selectedNode.lastDelivery}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Delivery Time', value: '3.5 hrs', change: '-65%', icon: <Clock size={16} className="text-emerald-600" /> },
                    { label: 'Cost Saved', value: '₹1200', change: '-52%', icon: <DollarSign size={16} className="text-blue-600" /> },
                    { label: 'Accuracy', value: '98.7%', change: '+12%', icon: <CheckCircle size={16} className="text-purple-600" /> },
                    { label: 'CO2 Saved', value: '4.2kg', change: '-78%', icon: <Leaf size={16} className="text-teal-600" /> }
                  ].map((metric, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg hover:shadow-xs transition flex flex-col items-center text-center">
                      <div className="mb-1">{metric.icon}</div>
                      <p className="text-sm text-gray-500">{metric.label}</p>
                      <p className="text-lg font-bold mt-1">{metric.value}</p>
                      <p className={`text-xs mt-1 ${
                        metric.change.includes('+') ? 'text-emerald-600' : 
                        metric.change.includes('-') ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change} vs traditional
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Live Delivery Tracking</h2>
              <div id="delivery-map" className="h-96 bg-gray-100 rounded-lg"></div>
              {deliveryProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>0%</span>
                    <span>{deliveryProgress}%</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${deliveryProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Warehouse</span>
                    <span>{selectedNode?.name || 'Node'}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6">Network Benefits</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Local Empowerment",
                    description: "Micro-entrepreneurs operate nodes, keeping profits in the community",
                    icon: <Users2 className="text-blue-500" size={18} />
                  },
                  {
                    title: "Cost Efficiency",
                    description: "Shared logistics reduce last-mile costs by 40-60%",
                    icon: <DollarSign className="text-emerald-500" size={18} />
                  },
                  {
                    title: "Inventory Visibility",
                    description: "Real-time tracking prevents stockouts and wastage",
                    icon: <Package className="text-amber-500" size={18} />
                  },
                  {
                    title: "Sustainability",
                    description: "Optimized routes and electric vehicles reduce emissions",
                    icon: <Leaf className="text-teal-500" size={18} />
                  }
                ].map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ x: 5 }}
                    className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-gray-100 mr-4">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 py-8">
            <h2 className="text-xl font-bold mb-6">Projected Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { 
                  title: "Nodes Operational", 
                  value: "120+", 
                  description: "Within first 18 months of operation",
                  icon: <Layers className="text-emerald-600" size={20} />
                },
                { 
                  title: "Retailers Reached", 
                  value: "10,000+", 
                  description: "Improved access to essential goods",
                  icon: <ShoppingCart className="text-blue-600" size={20} />
                },
                { 
                  title: "Delivery Time Reduction", 
                  value: "65%", 
                  description: "Compared to traditional supply chains",
                  icon: <Clock className="text-purple-600" size={20} />
                },
                { 
                  title: "Farmer Income Increase", 
                  value: "30%", 
                  description: "Through direct market access",
                  icon: <DollarSign className="text-amber-600" size={20} />
                }
              ].map((metric, index) => (
                <motion.div 
                  key={index} 
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4">
                      {metric.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{metric.title}</h3>
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-2">{metric.value}</p>
                  <p className="text-gray-600 text-sm">{metric.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-3">Sustainability Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200 hover:shadow-xs transition">
                  <p className="text-sm text-gray-500 mb-1">Carbon Emissions Reduced</p>
                  <p className="text-xl font-bold">78%</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200 hover:shadow-xs transition">
                  <p className="text-sm text-gray-500 mb-1">Fuel Consumption</p>
                  <p className="text-xl font-bold">65%</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-emerald-200 hover:shadow-xs transition">
                  <p className="text-sm text-gray-500 mb-1">Plastic Waste Reduced</p>
                  <p className="text-xl font-bold">45%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Join the Network?</h2>
            <p className="mb-6 opacity-90">
              Become part of the decentralized rural distribution revolution
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center"
              >
                Register as Node Operator
                <ArrowRight className="ml-2" />
              </Link>
              <button className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-medium hover:bg-white/10 transition flex items-center justify-center">
                Download Brochure
                <Download className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;