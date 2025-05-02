import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Play, Pause, RefreshCw, Map, Package, ShoppingCart, Truck,
  BarChart2, ArrowRight, Clock, Users, DollarSign, Layers,
  LineChart, Check, ChevronDown, Users2, TrendingUp,
  CircleDollarSign, Handshake, PieChart, Smartphone,
  Briefcase, CheckCircle, Leaf, Hand, Sparkles,
  Activity, BarChart, ClipboardCheck, SmartphoneNfc,
  PackageCheck, ShoppingBasket, Percent, CalendarClock, User,
  Cloud, Route, Network, Handshake as HandshakeIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';
import animationVideo from '../assets/node-animation.mp4';

const Demo = () => {
  const { user } = useContext(AuthContext);
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
  const [scrollY, setScrollY] = useState(0);
  
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const networkFlowRef = useRef(null);

  // Data
  const distributionNodes = [
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
      subNodes: 2,
      performance: {
        deliveryTime: '1.5 hrs',
        costReduction: '35%',
        accuracy: '96%',
        co2Reduction: '2.1kg'
      }
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
      subNodes: 5,
      performance: {
        deliveryTime: '3.5 hrs',
        costReduction: '45%',
        accuracy: '97%',
        co2Reduction: '4.2kg'
      }
    }
  ];

  const demoSteps = [
    { 
      id: 'order', 
      title: "Retailer Order Placed", 
      icon: <ShoppingCart size={18} />,
      description: "Local retailer places order via GrameenLink mobile app"
    },
    { 
      id: 'inventory', 
      title: "Inventory Checked", 
      icon: <Package size={18} />,
      description: "System verifies warehouse and node inventory levels"
    },
    { 
      id: 'dispatch', 
      title: "Goods Dispatched", 
      icon: <Truck size={18} />,
      description: "Optimized route calculated and goods dispatched"
    },
    { 
      id: 'delivery', 
      title: "Node Delivery", 
      icon: <Check size={18} />,
      description: "Goods delivered to node for local distribution"
    }
  ];

  // Helper functions
  const generateTxHash = () => '0x' + Math.random().toString(16).substr(2, 64);

  const toggleSimulation = () => {
    if (simulationStatus === 'completed') {
      resetSimulation();
      return;
    }
    
    const newStatus = simulationStatus === 'running' ? 'paused' : 'running';
    setSimulationStatus(newStatus);
    
    if (newStatus === 'running' && networkFlowRef.current) {
      setTimeout(() => {
        networkFlowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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
  };

  // Effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const mapInstance = L.map('map').setView([28.61, 77.23], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Add warehouse marker
      L.marker([28.61, 77.20], {
        icon: L.divIcon({
          html: `
            <div class="flex items-center justify-center bg-blue-600 px-4 py-3 rounded-full shadow-lg text-white border-2 border-white">
              <span class="text-sm font-bold">Central Warehouse</span>
            </div>
          `,
          className: 'bg-transparent border-none',
          iconSize: [120, 40]
        })
      }).addTo(mapInstance);

      // Add node markers
      const newMarkers = distributionNodes.map(node => {
        const nodeTypeClass = node.type === 'primary' ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white';
        return L.marker([node.lat, node.lng], {
          icon: L.divIcon({
            html: `
              <div class="${nodeTypeClass} px-4 py-3 rounded-lg shadow-md border-2 border-white transform transition-transform hover:scale-105">
                <span class="text-sm font-bold whitespace-nowrap">${node.name}</span>
              </div>
            `,
            className: 'bg-transparent border-none',
            iconSize: [150, 40]
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

      if (currentStep >= 2 && selectedNode) {
        setDeliveryProgress(prev => {
          const newProgress = prev + (100 / (demoSteps.length - 2));
          return newProgress >= 100 ? 100 : newProgress;
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

  useEffect(() => {
    if (simulationStatus === 'running' && !selectedNode) {
      const randomNode = distributionNodes[Math.floor(Math.random() * distributionNodes.length)];
      setSelectedNode(randomNode);
      setTransactionHash(generateTxHash());
    }
  }, [simulationStatus, selectedNode]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-white">
      {/* Video Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 overflow-hidden w-full px-4" id="hero-section">
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
            
            {/* Video on left */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <div className="relative w-full aspect-[3/2]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    poster="placeholder-image.jpg"
                  >
                    <source src={animationVideo} type="video/mp4" />
                  </video>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white text-sm font-medium">
                    <Handshake className="inline w-4 h-4 mr-1" />
                    <span>GrameenLink Network Demo</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content on right */}
            <div className="w-full lg:w-1/2 text-center lg:text-left pt-10 lg:pt-0">
              <div className="inline-flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium mb-4 shadow-sm text-gray-700">
                <RefreshCw className="w-4 h-4 mr-1 text-gray-600" />
                <span>Interactive Simulation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-gray-800 leading-tight">
                <span className="text-emerald-600">GrameenLink</span> Demo Experience
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Watch the rural distribution network in action with our interactive supply chain simulation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={toggleSimulation}
                  className={`inline-flex items-center justify-center ${
                    simulationStatus === 'running'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : simulationStatus === 'completed'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  } text-white transition-colors px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg w-full sm:w-auto`}
                >
                  {simulationStatus === 'running' ? (
                    <>
                      <Pause size={18} className="mr-2" />
                      Pause Simulation
                    </>
                  ) : simulationStatus === 'completed' ? (
                    <>
                      <RefreshCw size={18} className="mr-2" />
                      Reset Simulation
                    </>
                  ) : (
                    <>
                      <Play size={18} className="mr-2" />
                      Start Simulation
                    </>
                  )}
                </button>
              </div>

              {/* Quick Demo Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0">
                {[
                  { text: "Real-time tracking", icon: <Activity className="w-4 h-4" />, color: "bg-purple-100 text-gray-700" },
                  { text: "Supply chain visibility", icon: <BarChart className="w-4 h-4" />, color: "bg-blue-100 text-gray-700" },
                  { text: "Inventory management", icon: <Layers className="w-4 h-4" />, color: "bg-emerald-100 text-gray-700" },
                  { text: "Delivery optimization", icon: <Route className="w-4 h-4" />, color: "bg-amber-100 text-gray-700" }
                ].map((item, index) => (
                  <div key={index} className={`${item.color} text-xs px-2 py-1 rounded-full flex items-center border border-gray-200`}>
                    {item.icon}
                    <span className="ml-1">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              <div className="hidden lg:flex justify-center mt-12 animate-bounce">
                <a 
                  href="#network-flow" 
                  className="text-gray-500 hover:text-gray-700 flex flex-col items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    networkFlowRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="text-xs mb-2">Scroll to see simulation</span>
                  <ChevronDown size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section 
        id="network-flow" 
        ref={networkFlowRef}
        className="py-16 w-full px-4 bg-gray-50 border-t border-gray-200"
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Simulation Panel
            </span>
            <h2 className="text-3xl font-bold text-gray-800">Network Distribution Flow</h2>
            <p className="mt-2 text-gray-600 max-w-xl mx-auto">
              Watch as orders move through our optimized distribution network
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Process Steps */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Distribution Flow</h2>
                  
                  {simulationStatus !== 'running' && (
                    <button
                      onClick={toggleSimulation}
                      className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      <Play size={14} className="mr-1" />
                      {simulationStatus === 'completed' ? 'Restart' : 'Start'}
                    </button>
                  )}
                </div>
                
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
                        <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-gray-200 ${
                          index < currentStep ? 'bg-emerald-500' : 
                          index === currentStep ? 'bg-emerald-300 animate-pulse' : 'bg-gray-100'
                        }`}></div>
                        <div className={`p-4 rounded-lg transition-all ${
                          index <= currentStep ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${index <= currentStep ? 'bg-emerald-100 shadow-sm' : 'bg-gray-100'} mr-4`}>
                              {React.cloneElement(step.icon, { 
                                className: index <= currentStep ? 'text-emerald-600' : 'text-gray-500'
                              })}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{step.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              
                              {index === currentStep && simulationStatus === 'running' && (
                                <p className="text-xs text-emerald-500 mt-2 animate-pulse">Processing...</p>
                              )}
                              
                              {index === currentStep && (
                                <div className="mt-3">
                                  {step.id === 'order' && selectedNode && (
                                    <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                      <p className="text-gray-800 font-medium">New Order Details:</p>
                                      <p className="text-gray-700"><span className="font-medium">Node:</span> {selectedNode.name}</p>
                                      <p className="text-gray-700"><span className="font-medium">Order:</span> 15kg Rice, 10kg Flour, 5L Oil</p>
                                      <p className="mt-1 text-xs text-gray-500 flex items-center">
                                        <Smartphone className="w-3 h-3 mr-1" />
                                        Order placed via GrameenLink app
                                      </p>
                                    </div>
                                  )}
                                  {step.id === 'inventory' && (
                                    <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                      <p className="text-gray-800 font-medium">Inventory Check:</p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                        <p className="text-gray-700 text-xs">Rice: {inventoryLevels.rice}% available</p>
                                        <p className="text-gray-700 text-xs">Flour: {inventoryLevels.flour}% available</p>
                                        <p className="text-gray-700 text-xs">Oil: {inventoryLevels.oil}% available</p>
                                        <p className="text-gray-700 text-xs">Pulses: {inventoryLevels.pulses}% available</p>
                                      </div>
                                      <p className="mt-2 text-xs text-emerald-500">Sufficient inventory confirmed</p>
                                    </div>
                                  )}
                                  {step.id === 'dispatch' && (
                                    <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                      <p className="text-gray-800 font-medium">Dispatch Progress:</p>
                                      <div className="mt-3">
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${deliveryProgress}%` }}
                                          ></div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                          <span>Warehouse</span>
                                          <span>{Math.round(deliveryProgress)}%</span>
                                          <span>{selectedNode?.name}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {step.id === 'delivery' && selectedNode && (
                                    <div className="text-sm bg-emerald-50 p-3 rounded border border-emerald-200">
                                      <p className="font-medium text-emerald-600 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Delivery Completed!
                                      </p>
                                      <p className="mt-1 text-gray-700">Reached {selectedNode.name} in {(selectedNode.distance / 3).toFixed(1)} hours</p>
                                      <div className="flex items-center mt-2 bg-gray-100 p-2 rounded overflow-hidden">
                                        <Clock className="w-3 h-3 text-gray-500 mr-1 flex-shrink-0" />
                                        <p className="text-xs text-gray-500 truncate">
                                          Transaction: {transactionHash.substring(0, 24)}... recorded on blockchain
                                        </p>
                                      </div>
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
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Network Coverage</h2>
                  
                  {selectedNode && (
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {selectedNode.name} Selected
                    </div>
                  )}
                </div>
                
                <div id="map" className="h-96 bg-gray-50 rounded-lg border border-gray-200"></div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="text-xs px-3 py-1.5 rounded-full flex items-center bg-blue-100 text-gray-700">
                    <Package className="w-3 h-3 mr-1" />
                    <span>Central Warehouse</span>
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-full flex items-center bg-emerald-100 text-gray-700">
                    <Network className="w-3 h-3 mr-1" />
                    <span>Primary Nodes</span>
                  </div>
                  <div className="text-xs px-3 py-1.5 rounded-full flex items-center bg-teal-100 text-gray-700">
                    <Map className="w-3 h-3 mr-1" />
                    <span>Secondary Nodes</span>
                  </div>
                  {selectedNode && currentStep >= 2 && (
                    <div className="text-xs px-3 py-1.5 rounded-full flex items-center bg-amber-100 text-amber-700 ml-auto">
                      <Truck className="w-3 h-3 mr-1" />
                      <span>{currentStep === 3 ? 'Delivery complete' : 'Delivery in progress'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Inventory Levels */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Warehouse Inventory</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Rice', level: inventoryLevels.rice, color: 'bg-emerald-500' },
                    { name: 'Flour', level: inventoryLevels.flour, color: 'bg-blue-500' },
                    { name: 'Cooking Oil', level: inventoryLevels.oil, color: 'bg-amber-500' },
                    { name: 'Pulses', level: inventoryLevels.pulses, color: 'bg-purple-500' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1 text-gray-700">
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
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Selected Node</h2>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Name", value: selectedNode.name },
                      { label: "Type", value: selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1) },
                      { label: "Capacity", value: selectedNode.capacity },
                      { label: "Retailers Served", value: selectedNode.retailers },
                      { label: "Sub-Nodes", value: selectedNode.subNodes },
                      { label: "Last Delivery", value: selectedNode.lastDelivery }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Performance Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(selectedNode ? [
                    { label: 'Delivery Time', value: selectedNode.performance.deliveryTime, change: '-65%', icon: <Clock size={16} className="text-emerald-500" /> },
                    { label: 'Cost Saved', value: selectedNode.performance.costReduction, change: '-52%', icon: <DollarSign size={16} className="text-blue-500" /> },
                    { label: 'Accuracy', value: selectedNode.performance.accuracy, change: '+12%', icon: <CheckCircle size={16} className="text-purple-500" /> },
                    { label: 'CO2 Saved', value: selectedNode.performance.co2Reduction, change: '-78%', icon: <Leaf size={16} className="text-teal-500" /> }
                  ] : [
                    { label: 'Delivery Time', value: '3.5 hrs', change: '-65%', icon: <Clock size={16} className="text-emerald-500" /> },
                    { label: 'Cost Saved', value: '42%', change: '-52%', icon: <DollarSign size={16} className="text-blue-500" /> },
                    { label: 'Accuracy', value: '97%', change: '+12%', icon: <CheckCircle size={16} className="text-purple-500" /> },
                    { label: 'CO2 Saved', value: '3.8kg', change: '-78%', icon: <Leaf size={16} className="text-teal-500" /> }
                  ]).map((metric, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg hover:shadow-sm transition flex flex-col items-center text-center">
                      <div className="mb-1">{metric.icon}</div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-lg font-bold mt-1 text-gray-800">{metric.value}</p>
                      <p className={`text-xs mt-1 ${
                        metric.change.includes('+') ? 'text-emerald-500' : 
                        metric.change.includes('-') ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {metric.change} vs traditional
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="py-16 w-full px-4 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Network Impact
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Measurable Benefits Across the Supply Chain
            </h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our node-based system delivers tangible improvements for all participants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Economic Growth", 
                value: "30%+", 
                description: "Increase in rural entrepreneur income",
                icon: <TrendingUp className="w-8 h-8 text-emerald-500" />
              },
              { 
                title: "Cost Reduction", 
                value: "40%", 
                description: "Lower logistics costs for retailers",
                icon: <DollarSign className="w-8 h-8 text-blue-500" />
              },
              { 
                title: "Delivery Speed", 
                value: "65%", 
                description: "Faster than traditional supply chains",
                icon: <Clock className="w-8 h-8 text-purple-500" />
              },
              { 
                title: "Sustainability", 
                value: "78%", 
                description: "Reduction in carbon emissions",
                icon: <Leaf className="w-8 h-8 text-teal-500" />
              }
            ].map((metric, index) => (
              <motion.div 
                key={index} 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 mb-4">
                  {metric.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">{metric.title}</h3>
                <p className="text-2xl font-bold mb-2 text-emerald-600">{metric.value}</p>
                <p className="text-gray-600 text-sm">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 w-full px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Join the Network?</h2>
              <p className="mb-6 opacity-90">
                Become part of the decentralized rural distribution revolution
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center"
                >
                  {user ? "Go to Dashboard" : "Register as Node Operator"}
                  <ArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;