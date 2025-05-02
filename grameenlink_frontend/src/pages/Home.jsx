import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Truck, StoreIcon, DollarSign, Map, ShoppingBag, Users, TrendingUp,
  CircleDollarSign, UserPlus, Building, Leaf, Package,
  Scale, Handshake, Globe, PieChart, ArrowRight, Crop, Shield,
  CheckCircle, Sparkles, Activity, BarChart, ClipboardCheck,
  Smartphone, Clock, Users2, Briefcase, Mail, Phone, MapPin,
  ChevronDown, Hand, BarChart2, Heart, Send, X, Cpu, BrainCircuit,
  Bot, Database, Network, Warehouse, Route, Gauge, AlertCircle,
  SmartphoneNfc, PackageSearch, PackagePlus, PackageCheck,
  PackageX, ShoppingCart, ShoppingBasket, Percent, Tags,
  CalendarClock, RefreshCw, Cloud, CloudLightning, CloudRain,
  CloudSnow, CloudSun, CloudDrizzle, CloudFog, CloudHail, CloudMoon
} from 'lucide-react';
import animationVideo from '../assets/animation.mp4';
import Pilot1 from '../assets/pilot-1.png';
import Pilot2 from '../assets/pilot-2.png';
import Pilot3 from '../assets/pilot-3.png';
import Pilot4 from '../assets/pilot-4.png';
import Pilot5 from '../assets/pilot-5.png';
import Pilot6 from '../assets/pilot-6.png';
import DataVisIcon from '../assets/data-visualization.png';
import SupplyChainIcon from '../assets/supply-chain.png';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [expandedContact, setExpandedContact] = useState(false);
  const [expandedPartners, setExpandedPartners] = useState(false);
  const [expandedInvestors, setExpandedInvestors] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProblem = () => {
    const problemSection = document.getElementById('problem-section');
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    setExpandedContact(true);
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const yOffset = -90;
        const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150);
  };

  // Features Data
  const features = [
    {
      icon: <Network className="w-8 h-8 text-emerald-600" />,
      title: "Hyperlocal Nodes",
      description: "Micro-entrepreneurs act as local coordinators to aggregate orders and streamline logistics",
      benefits: [
        "Deep community integration",
        "Order consolidation for efficiency",
        "Optimized last-mile delivery"
      ]
    },
    {
      icon: <ShoppingBasket className="w-8 h-8 text-blue-600" />,
      title: "Digital Marketplace",
      description: "Connects retailers, distributors and nodes for transparent transactions",
      benefits: [
        "Real-time transparent pricing",
        "Better demand visibility",
        "Optimized routes based on node data"
      ]
    },
    {
      icon: <Route className="w-8 h-8 text-amber-600" />,
      title: "Sub-Node System",
      description: "Retailers with distributor relationships can service nearby shops",
      benefits: [
        "Minimal new infrastructure",
        "Leverages established trust",
        "Creates incremental revenue"
      ]
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-600" />,
      title: "Data Analytics",
      description: "Provides insights for better decision making across the supply chain",
      benefits: [
        "Demand forecasting",
        "Performance benchmarking",
        "Inventory optimization"
      ]
    }
  ];

  // Problem Data
  const problems = [
    {
      icon: <Truck className="w-7 h-7 text-emerald-600" />,
      title: "Logistics Bottleneck",
      description: "Limited reach & product variety due to inefficient distribution models",
      stats: "40% higher logistics costs in rural areas",
      color: "emerald"
    },
    {
      icon: <Scale className="w-7 h-7 text-blue-600" />,
      title: "Market Mismatch",
      description: "Retailers struggle to stock desired products due to distributor limitations",
      stats: "70% experience weekly stock delays",
      color: "blue"
    },
    {
      icon: <AlertCircle className="w-7 h-7 text-amber-600" />,
      title: "Middlemen Exploitation",
      description: "Farmers receive low prices while middlemen take significant margins",
      stats: "Farmers get only 30-40% of retail price",
      color: "amber"
    }
  ];

  // Pilot Findings
  const pilotFindings = [
    { label: "Middlemen increase costs", value: "60%", color: "bg-red-400" },
    { label: "Weekly stock delays", value: "70%", color: "bg-amber-400" },
    { label: "Prices higher than towns", value: "75%", color: "bg-purple-400" },
    { label: "Open to bulk purchasing", value: "90%", color: "bg-emerald-400" }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 overflow-hidden w-full px-4">
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 md:gap-16">
            <div className="w-full lg:w-1/2 text-center lg:text-left pt-10 lg:pt-0">
              <div className="inline-flex items-center bg-emerald-100 px-3 py-1 rounded-full text-xs font-medium mb-4 text-emerald-800">
                <Handshake className="w-4 h-4 mr-1" />
                <span>Rural Supply Chain Optimization</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-gray-900 leading-tight">
                <span className="text-emerald-600">Connecting</span> Rural Commerce Networks
              </h1>

              <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                GrameenLink combines hyperlocal nodes with digital technology to create India's most efficient rural supply chain platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center bg-emerald-600 text-white transition-colors px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg w-full sm:w-auto hover:bg-emerald-700"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Join the Network
                    </Link>
                    <button
                      onClick={scrollToProblem}
                      className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-600 transition-colors px-6 py-3 rounded-lg font-semibold text-base w-full sm:w-auto hover:bg-emerald-50"
                    >
                      See How It Works
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center bg-emerald-600 text-white transition-colors px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg w-full sm:w-auto hover:bg-emerald-700"
                    >
                      Go to Dashboard
                      <ArrowRight size={18} className="ml-2" />
                    </Link>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-semibold text-base w-full sm:w-auto hover:bg-emerald-50"
                    >
                      Explore Marketplace
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
                {[
                  { text: "10-15% profit increase", icon: <TrendingUp className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" },
                  { text: "60% fewer stockouts", icon: <PackageCheck className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
                  { text: "3-5 new jobs per node", icon: <Users className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-800" },
                  { text: "25% lower logistics cost", icon: <Truck className="w-4 h-4" />, color: "bg-amber-100 text-amber-800" }
                ].map((item, index) => (
                  <div key={index} className={`${item.color} text-xs px-2 py-1 rounded-full flex items-center`}>
                    {item.icon}
                    <span className="ml-1">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="relative rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <div className="w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]">
                  <video
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
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
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem-section" className="py-16 md:py-24 w-full px-4 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              The Rural Supply Chain Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Fragmented Systems, Lost Opportunities
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Traditional rural supply chains suffer from inefficiencies that our node-based platform solves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
              >
                <div className={`flex items-center justify-center bg-${item.color}-100 rounded-full w-14 h-14 mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-3">
                  {item.description}
                </p>
                <div className={`mt-auto text-xs font-medium bg-${item.color}-100 text-${item.color}-800 px-3 py-1 rounded-full`}>
                  {item.stats}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Data Visualization Component */}
          <div className="mt-16 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-bold mb-4 text-gray-900">The Cost of Inefficiency</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Our research shows rural supply chains lose 25-40% of potential value through systemic inefficiencies:
                </p>
                <ul className="space-y-3">
                  {pilotFindings.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700 flex-grow">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2">
                <img 
                  src={DataVisIcon} 
                  alt="Data visualization of rural supply chain inefficiencies" 
                  className="w-full max-w-[400px] h-auto rounded-lg mx-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 md:py-24 w-full px-4 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Our Solution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Nodes + Marketplace = Efficient Rural Commerce
            </h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines hyperlocal coordination with digital tools to optimize rural supply chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Network Diagram */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2">
                <h3 className="text-xl font-bold mb-4 text-gray-900">How GrameenLink Works</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Our model connects all participants in the rural supply chain ecosystem:
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: <StoreIcon className="w-5 h-5 text-blue-600" />, text: "Retailers access wider product range" },
                    { icon: <Users className="w-5 h-5 text-emerald-600" />, text: "Micro-entrepreneurs operate as nodes" },
                    { icon: <Truck className="w-5 h-5 text-amber-600" />, text: "Distributors optimize delivery routes" },
                    { icon: <Crop className="w-5 h-5 text-purple-600" />, text: "Farmers get better market access" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 bg-gray-100 p-1.5 rounded-lg mr-3 shadow-sm">
                        {item.icon}
                      </div>
                      <span className="text-sm text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2">
                <img 
                  src={SupplyChainIcon} 
                  alt="GrameenLink supply chain diagram" 
                  className="w-full max-w-[400px] h-auto rounded-lg mx-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Node Innovation Section */}
      <section className="py-16 md:py-24 w-full px-4 relative overflow-hidden bg-emerald-50">
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Smart Scaling
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              The Sub-Node Advantage
            </h2>
            <p className="mt-4 text-emerald-800 max-w-3xl mx-auto leading-relaxed">
              Our innovative sub-node system leverages existing infrastructure for rapid, capital-efficient network growth.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sub-Node System */}
              <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <Building className="w-6 h-6 text-emerald-800" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Sub-Node System</h3>
                </div>
                <p className="text-sm mb-5 text-gray-600 leading-relaxed">
                  Retailers with existing distributor connections become sub-nodes, utilizing their access to serve nearby shops and generate extra income, expanding reach efficiently.
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-3">
                  <h4 className="font-semibold mb-2 text-emerald-800 text-sm">Key Advantages:</h4>
                  <ul className="space-y-2">
                    {[
                      "Minimal new infrastructure",
                      "Leverages established trust",
                      "Enables rapid network scaling",
                      "Creates incremental revenue"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sustainable Growth & Stats */}
              <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <Activity className="w-6 h-6 text-emerald-800" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Measurable Impact</h3>
                </div>
                <p className="text-sm mb-5 text-gray-600 leading-relaxed">
                  Our model enhances, not replaces, existing structures, fostering a win-win ecosystem with tangible benefits.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {[
                    {value: "10-15%", label: "Retailer Profit Increase", icon: TrendingUp},
                    {value: "25%+", label: "Cost Reduction", icon: DollarSign},
                    {value: "3-5", label: "New Jobs Per Node", icon: Users},
                    {value: "60%", label: "Fewer Stockouts", icon: PackageCheck}
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-center"
                    >
                      <item.icon className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-emerald-700 uppercase tracking-wider">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Testing Section */}
      <section className="py-16 md:py-24 w-full px-4 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Field Research
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Jaunti Village Pilot Testing
            </h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our ground research in rural Delhi outskirts validated core assumptions about rural supply chain challenges.
            </p>
          </div>

          {/* Research Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Location Insights */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Map className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Location Insights</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3 text-sm">
                Situated on the rural outskirts of Delhi, bordering Haryana, offering a representative snapshot of regional supply chain dynamics.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <ClipboardCheck className="w-3 h-3 mr-1" />
                <span>12-15 local shopkeepers interviewed</span>
              </div>
            </div>

            {/* Key Findings */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Key Findings</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">60% report middlemen increase costs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">70% experience weekly/monthly stock delays</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">75% report prices 10-20% higher than nearby towns</span>
                </li>
              </ul>
            </div>

            {/* Market Readiness */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Market Readiness</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">100%</div>
                  <div className="text-xs text-blue-600">Smartphone usage</div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-emerald-600">85%</div>
                  <div className="text-xs text-emerald-600">Use digital ordering</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-600">90%</div>
                  <div className="text-xs text-purple-600">Open to bulk purchasing</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-amber-600">80%</div>
                  <div className="text-xs text-amber-600">Believe better inventory helps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Field Research Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[Pilot1, Pilot2, Pilot3, Pilot4, Pilot5, Pilot6].map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <img
                    src={img}
                    alt={`Field research in Jaunti Village ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Economic Impact */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/2">
                  <h3 className="text-xl font-bold mb-3">Economic Impact Potential</h3>
                  <p className="text-emerald-100 leading-relaxed text-sm">
                    Our research confirmed significant opportunities for rural economic improvement through supply chain optimization.                  </p>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-emerald-200" />
                    <div>
                      <div className="text-lg font-bold">3-5 new jobs</div>
                      <div className="text-xs text-emerald-200">per hyper-local node</div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">10-15%</div>
                    <div className="text-xs text-emerald-100">Expected profit increase</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">80%</div>
                    <div className="text-xs text-emerald-100">See inventory management value</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">70%</div>
                    <div className="text-xs text-emerald-100">Would recommend to peers</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">90%</div>
                    <div className="text-xs text-emerald-100">Interested in collaboration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Goals Section */}
      <section className="py-16 md:py-24 w-full px-4 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Our Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Driving Transformative Outcomes
            </h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We aim to create a thriving rural ecosystem with benefits for every participant in the value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Economic Empowerment", description: "Creating sustainable livelihoods for rural entrepreneurs via the node/sub-node system.", icon: Users, color: "emerald", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
              { title: "Fairer Pricing", description: "Reducing consumer prices and improving producer rates through efficiency gains.", icon: CircleDollarSign, color: "sky", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
              { title: "Retailer Growth", description: "Boosting retailer margins with better sourcing and lower logistics costs.", icon: TrendingUp, color: "amber", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              { title: "Wider Access", description: "Expanding product diversity and availability in previously underserved remote areas.", icon: ShoppingBag, color: "rose", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
              { title: "Farmer Benefits", description: "Enhancing farmer income and market access via direct, transparent connections.", icon: Crop, color: "lime", iconBg: "bg-lime-100", iconColor: "text-lime-600" },
              { title: "Sustainable Ecosystem", description: "Building a collaborative model that strengthens existing supply chain players.", icon: Handshake, color: "indigo", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col text-center items-center"
              >
                <div className={`flex items-center justify-center ${item.iconBg} rounded-full w-14 h-14 mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={1.5}/>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section className="py-16 w-full px-4 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect With Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore investment opportunities, partnerships, or get in touch with our team
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Investors Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 w-full">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setExpandedInvestors(!expandedInvestors)}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Investor Opportunities</h3>
                    <p className="text-gray-600 text-sm">Join us in building sustainable rural supply chains</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300                  ${expandedInvestors ? 'rotate-180' : ''}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedInvestors ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Scalable Model", description: "Technology built to expand across 5,000+ villages", icon: <BarChart2 className="w-5 h-5 text-emerald-600" /> },
                      { title: "Strong ROI", description: "3.2x projected return on investment", icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
                      { title: "Social Impact", description: "Improve lives while generating returns", icon: <Heart className="w-5 h-5 text-purple-600" /> }
                    ].map((benefit, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <div className="bg-white p-2 rounded-full mr-3">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                          <p className="text-gray-600 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className="block w-full md:w-auto md:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center"
                  >
                    {user ? "View Investor Dashboard" : "Register for Opportunities"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Partners Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 w-full">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setExpandedPartners(!expandedPartners)}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <Hand className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Our Potential Partners</h3>
                    <p className="text-gray-600 text-sm">Collaborations that drive rural transformation</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedPartners ? 'rotate-180' : ''}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedPartners ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Ministry of Rural Development", type: "Government", description: "Policy support and infrastructure" },
                      { name: "UN Development Programme", type: "International", description: "Funding and global best practices" },
                      { name: "Rural Innovation Foundation", type: "NGO", description: "Local community engagement" },
                      { name: "AgriTech Alliance", type: "Industry", description: "Technology and supply chain expertise" }
                    ].map((partner, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{partner.name}</h4>
                          <span className="inline-block px-2 py-0.5 text-xs bg-white text-purple-800 rounded-full">
                            {partner.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{partner.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={scrollToContact}
                    className="block w-full md:w-auto md:px-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition flex items-center justify-center"
                  >
                    Become a Partner
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div id="contact" className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 w-full">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setExpandedContact(!expandedContact)}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 rounded-full mr-4">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
                    <p className="text-gray-600 text-sm">Have questions? Get in touch with our team</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedContact ? 'rotate-180' : ''}`} />
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedContact ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <div className="max-w-3xl mx-auto">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400"
                            required
                          />
                        </div>
                        
                        <div>
                          <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <select
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        >
                          <option value="general" className="bg-white">General Inquiry</option>
                          <option value="partnership" className="bg-white">Partnership</option>
                          <option value="investment" className="bg-white">Investment</option>
                          <option value="support" className="bg-white">Support</option>
                        </select>
                      </div>
                      
                      <div>
                        <textarea
                          rows="2"
                          placeholder="Your Message"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400"
                          required
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full md:w-auto md:px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition flex items-center justify-center text-sm"
                      >
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </button>
                    </form>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Phone className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium text-sm text-gray-900">Call Us</span>
                        </div>
                        <p className="text-gray-600 text-sm">+91 98686 29191</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                          <span className="font-medium text-sm text-gray-900">Visit Us</span>
                        </div>
                        <p className="text-gray-600 text-sm">Moti Nagar, Delhi, India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 w-full px-4 bg-emerald-50">
        <div className="w-full max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
            Ready to Transform Rural Commerce?
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Join GrameenLink today. Be part of the movement revolutionizing rural supply chains and empowering communities across India.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 transition-colors px-8 py-2.5 rounded-lg font-semibold text-base shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors px-8 py-2.5 rounded-lg font-semibold text-base w-full sm:w-auto"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-100 w-full px-4 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600 tracking-wide">
            &copy; {new Date().getFullYear()} GrameenLink Technologies Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;