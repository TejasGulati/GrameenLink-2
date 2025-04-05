import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Truck,
  StoreIcon,
  DollarSign,
  Map,
  ShoppingBag,
  Users,
  TrendingUp,
  CircleDollarSign,
  UserPlus,
  Building,
  Leaf,
  Warehouse,
  Package,
  Scale,
  Handshake,
  Globe,
  PieChart,
  ArrowRight,
  Crop,
  Shield,
  CheckCircle,
  Sparkles,
  Activity,
  BarChart,
  ClipboardCheck,
  Smartphone,
  Clock,
  Users2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Hand,
  BarChart2,
  Heart,
  Send,
  X
} from 'lucide-react';
import animationVideo from '../assets/animation.mp4';
import Pilot1 from '../assets/pilot-1.png';
import Pilot2 from '../assets/pilot-2.png';
import Pilot3 from '../assets/pilot-3.png';
import Pilot4 from '../assets/pilot-4.png';
import Pilot5 from '../assets/pilot-5.png';
import Pilot6 from '../assets/pilot-6.png';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [expandedContact, setExpandedContact] = useState(false);
  const [expandedPartners, setExpandedPartners] = useState(false);
  const [expandedInvestors, setExpandedInvestors] = useState(false);

  const sectionPadding = "py-16 md:py-24";
  const containerWidth = "container mx-auto px-5 w-full max-w-7xl";

  // Scroll to problem section
  const scrollToProblem = () => {
    const problemSection = document.getElementById('problem-section');
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-white text-gray-800 font-sans antialiased">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 overflow-hidden w-full">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-50 opacity-70" />
        <div
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%239ca3af' fill-opacity='0.1'%3E%3Cpath fill-rule='evenodd' d='M0 0h20v1H0V0zm0 2h20v1H0V2zm0 2h20v1H0V4zm0 2h20v1H0V6zm0 2h20v1H0V8zm0 2h20v1H0v-1zm0 2h20v1H0v-1zm0 2h20v1H0v-1zm0 2h20v1H0v-1zm0 2h20v1H0v-1zm0 2h20v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 md:gap-16">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left pt-10 lg:pt-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-gray-900 leading-tight">
                Empowering <span className="text-emerald-600">Rural</span> Supply Chains
              </h1>

              <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                GramSeva connects rural communities through a decentralized network of micro-entrepreneurs, optimizing supply chains and creating economic opportunities.
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
                      className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors px-6 py-3 rounded-lg font-semibold text-base w-full sm:w-auto"
                    >
                      Learn More
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
                      className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors px-6 py-3 rounded-lg font-semibold text-base w-full sm:w-auto"
                    >
                      Browse Marketplace
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Video Section */}
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-xl shadow-xl overflow-hidden">
                <div className="w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster="placeholder-image.jpg"
                  >
                    <source src={animationVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem-section" className={`${sectionPadding} bg-white w-full`}>
        <div className={containerWidth}>
          <div className="text-center mb-16">
            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              The Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Rural Supply Chains Face Hurdles
            </h2>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Fragmented logistics, price volatility, and limited access hinder growth and prosperity in rural economies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: "Inefficient Logistics",
                description: "High costs and delays due to fragmented delivery systems and suboptimal routing in rural areas.",
                color: "emerald",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600"
              },
              {
                icon: Scale,
                title: "Price Disparities",
                description: "Multiple intermediaries lead to inflated prices, impacting both consumers and producers unfairly.",
                color: "sky",
                iconBg: "bg-sky-100",
                iconColor: "text-sky-600"
              },
              {
                icon: Warehouse,
                title: "Inventory & Access",
                description: "Limited product variety and availability in local stores despite existing demand.",
                color: "purple",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
              >
                <div className={`flex items-center justify-center ${item.iconBg} rounded-full w-14 h-14 mb-4`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} strokeWidth={1.5}/>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm flex-grow">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ground Research Section */}
      <section className={`${sectionPadding} bg-gray-50 w-full`}>
        <div className={containerWidth}>
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Field Research
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Jaunti Village Pilot Testing
            </h2>
            <p className="mt-4 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Our ground research in rural Delhi outskirts validated core assumptions about rural supply chain challenges.
            </p>
          </div>

          {/* Research Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Location Insights */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Map className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Location Insights</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                Situated on the rural outskirts of Delhi, bordering Haryana, offering a representative snapshot of regional supply chain dynamics.
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <ClipboardCheck className="w-3 h-3 mr-1" />
                <span>12-15 local shopkeepers interviewed</span>
              </div>
            </div>

            {/* Key Findings */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Key Findings</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">60% report middlemen increase costs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">70% experience weekly/monthly stock delays</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">75% report prices 10-20% higher than nearby towns</span>
                </li>
              </ul>
            </div>

            {/* Market Readiness */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Market Readiness</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-700">100%</div>
                  <div className="text-xs text-blue-600">Smartphone usage</div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-emerald-700">85%</div>
                  <div className="text-xs text-emerald-600">Use digital ordering</div>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-700">90%</div>
                  <div className="text-xs text-purple-600">Open to bulk purchasing</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <div className="text-xl font-bold text-amber-700">80%</div>
                  <div className="text-xs text-amber-600">Believe better inventory helps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">Field Research Gallery</h3>
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
                  <p className="mb-4 text-emerald-100 leading-relaxed text-sm">
                    Our research confirmed significant opportunities for rural economic improvement through supply chain optimization.
                  </p>
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

      {/* Solution Section */}
      <section className={`${sectionPadding} bg-gradient-to-b from-gray-50 to-white w-full`}>
        <div className={containerWidth}>
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Our Solution <Sparkles className="inline w-4 h-4 ml-1 opacity-70"/>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              A Network Built for Rural Empowerment
            </h2>
            <p className="mt-4 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We fuse a hyperlocal physical network of trusted entrepreneurs with a powerful digital platform, streamlining commerce and unlocking potential.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Hyperlocal Network Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex flex-col">
              <div className="flex items-center mb-5">
                <div className="bg-emerald-100 p-3 rounded-lg mr-3">
                  <Users className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Hyperlocal Network</h3>
              </div>
              <p className="mb-5 text-gray-700 text-sm leading-relaxed flex-grow">
                Micro-entrepreneurs act as local nodes, aggregating orders, coordinating logistics, and leveraging deep community understanding.
              </p>
              <ul className="space-y-2 mt-auto">
                {[
                  {icon: Leaf, text: "Deep community integration and trust"},
                  {icon: Package, text: "Order consolidation for efficiency"},
                  {icon: Map, text: "Optimized last-mile delivery"},
                  {icon: Handshake, text: "Strong local relationships & support"}
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Digital Platform Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md flex flex-col">
              <div className="flex items-center mb-5">
                <div className="bg-sky-100 p-3 rounded-lg mr-3">
                  <ShoppingBag className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Digital Platform</h3>
              </div>
              <p className="mb-5 text-gray-700 text-sm leading-relaxed flex-grow">
                A unified marketplace connecting farmers, retailers, nodes, and distributors with transparent data and powerful tools.
              </p>
              <ul className="space-y-2 mt-auto">
                {[
                  {icon: DollarSign, text: "Real-time transparent pricing"},
                  {icon: TrendingUp, text: "Data-driven demand insights"},
                  {icon: PieChart, text: "Optimized logistics planning"},
                  {icon: Globe, text: "Seamless stakeholder connections"}
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Node Innovation Section */}
      <section className={`${sectionPadding} bg-gradient-to-br from-emerald-800 to-teal-900 text-white w-full relative overflow-hidden`}>
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-white/5 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-80 h-80 bg-sky-400/10 rounded-full opacity-60 blur-3xl"></div>

        <div className={`${containerWidth} relative z-10`}>
          <div className="text-center mb-16">
            <span className="inline-block bg-white/20 text-emerald-100 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Smart Scaling
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Grassroots Distribution Power
            </h2>
            <p className="mt-4 text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Leveraging existing infrastructure and trusted relationships for rapid, capital-efficient, and sustainable network growth.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sub-Node System */}
              <div className="bg-emerald-700/80 backdrop-blur-sm p-6 rounded-xl border border-emerald-400/30 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Building className="w-6 h-6 text-emerald-100" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Sub-Node System</h3>
                </div>
                <p className="text-sm mb-5 text-emerald-100 leading-relaxed">
                  Retailers with existing distributor connections become sub-nodes, utilizing their access to serve nearby shops and generate extra income, expanding reach efficiently.
                </p>
                <div className="bg-emerald-800/80 p-4 rounded-lg border border-emerald-400/40 mt-3">
                  <h4 className="font-semibold mb-2 text-emerald-200 text-sm">Key Advantages:</h4>
                  <ul className="space-y-2">
                    {[
                      "Minimal new infrastructure",
                      "Leverages established trust",
                      "Enables rapid network scaling",
                      "Creates incremental revenue"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-300 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-emerald-50 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sustainable Growth & Stats */}
              <div className="bg-emerald-700/80 backdrop-blur-sm p-6 rounded-xl border border-emerald-400/30 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Activity className="w-6 h-6 text-emerald-100" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Measurable Impact</h3>
                </div>
                <p className="text-sm mb-5 text-emerald-100 leading-relaxed">
                  Our model enhances, not replaces, existing structures, fostering a win-win ecosystem with tangible benefits.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {[
                    {value: "25%+", label: "Cost Reduction", icon: TrendingUp},
                    {value: "15%+", label: "Margin Increase", icon: DollarSign},
                    {value: "Faster", label: "Delivery Speed", icon: Truck},
                    {value: "High", label: "Transparency", icon: Shield}
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-emerald-800/80 p-4 rounded-lg border border-emerald-400/40 text-center"
                    >
                      <item.icon className="w-6 h-6 text-emerald-300 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{item.value}</div>
                      <div className="text-xs text-emerald-200 uppercase tracking-wider">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Goals Section */}
      <section className={`${sectionPadding} bg-white w-full`}>
        <div className={containerWidth}>
          <div className="text-center mb-16">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mb-3 tracking-wide">
              Our Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Driving Transformative Outcomes
            </h2>
            <p className="mt-4 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We aim to create a thriving rural ecosystem with benefits for every participant in the value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Economic Empowerment", description: "Creating sustainable livelihoods for rural entrepreneurs via the node/sub-node system.", icon: Users, color: "emerald", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
              { title: "Fairer Pricing", description: "Reducing consumer prices and improving producer rates through efficiency gains.", icon: CircleDollarSign, color: "sky", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
              { title: "Retailer Growth", description: "Boosting retailer margins with better sourcing and lower logistics costs.", icon: TrendingUp, color: "amber", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              { title: "Wider Access", description: "Expanding product diversity and availability in previously underserved remote areas.", icon: ShoppingBag, color: "rose", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
              { title: "Farmer Benefits", description: "Enhancing farmer income and market access via direct, transparent connections.", icon: Crop, color: "lime", iconBg: "bg-lime-100", iconColor: "text-lime-600" },
              { title: "Sustainable Ecosystem", description: "Building a collaborative model that strengthens existing supply chain players.", icon: Handshake, color: "indigo", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col text-center items-center"
              >
                <div className={`flex items-center justify-center ${item.iconBg} rounded-full w-14 h-14 mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={1.5}/>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm flex-grow">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect With Us</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Explore investment opportunities, partnerships, or get in touch with our team
      </p>
    </div>
    
    <div className="space-y-6">
      {/* Investors Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 w-full">
        <div 
          className="p-6 cursor-pointer flex justify-between items-center"
          onClick={() => setExpandedInvestors(!expandedInvestors)}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Investor Opportunities</h3>
              <p className="text-gray-600 text-sm">Join us in building sustainable rural supply chains</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedInvestors ? 'rotate-180' : ''}`} />
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedInvestors ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Scalable Model", description: "Technology built to expand across 5,000+ villages", icon: <BarChart2 className="w-5 h-5 text-green-600" /> },
                { title: "Strong ROI", description: "3.2x projected return on investment", icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
                { title: "Social Impact", description: "Improve lives while generating returns", icon: <Heart className="w-5 h-5 text-purple-600" /> }
              ].map((benefit, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg flex items-center">
                  <div className="bg-white p-2 rounded-full mr-3">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link
              to={user ? "/dashboard" : "/register"}
              className="block w-full md:w-auto md:mx-auto md:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center"
            >
              {user ? "View Investor Dashboard" : "Register for Opportunities"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Partners Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 w-full">
        <div 
          className="p-6 cursor-pointer flex justify-between items-center"
          onClick={() => setExpandedPartners(!expandedPartners)}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full mr-4">
              <Hand className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Our Potential Partners</h3>
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
                <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{partner.name}</h4>
                    <span className="inline-block px-2 py-0.5 text-xs bg-white text-purple-800 rounded-full">
                      {partner.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{partner.description}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                setExpandedContact(true);
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="block w-full md:w-auto md:mx-auto md:px-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition flex items-center justify-center"
            >
              Become a Partner
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <div id="contact" className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 w-full">
        <div 
          className="p-6 cursor-pointer flex justify-between items-center"
          onClick={() => setExpandedContact(!expandedContact)}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-full mr-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Contact Us</h3>
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="investment">Investment</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                
                <div>
                  <textarea
                    rows="2"
                    placeholder="Your Message"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full md:w-auto md:px-8 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center justify-center text-sm"
                >
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </button>
              </form>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-sm">Call Us</span>
                  </div>
                  <p className="text-gray-700 text-sm">+91 98686 29191</p>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-sm">Visit Us</span>
                  </div>
                  <p className="text-gray-700 text-sm">Moti Nagar, Delhi, India</p>
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
      <section className={`${sectionPadding} bg-gradient-to-tr from-emerald-50 via-sky-50 to-teal-50 w-full`}>
        <div className={`${containerWidth} max-w-4xl text-center`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
            Ready to Transform Rural Commerce?
          </h2>
          <p className="text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Join GramSeva today. Be part of the movement revolutionizing rural supply chains and empowering communities across India.
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
              onClick={() => {
                setExpandedContact(true);
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors px-8 py-2.5 rounded-lg font-semibold text-base w-full sm:w-auto"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 w-full">
        <div className={containerWidth}>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand Info */}
            <div className="md:col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center mb-4 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-md mr-3 transition-transform duration-300 group-hover:scale-110">
                  GS
                </div>
                <span className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">GramSeva</span>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Digitally transforming rural supply chains through decentralized networks and empowering local entrepreneurs.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-2">
                <li><Link to="/marketplace" className="text-xs hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/demo" className="text-xs hover:text-white transition-colors">Demo</Link></li>
                <li><Link to="/node-management" className="text-xs hover:text-white transition-colors">Node Management</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-xs hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-xs hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-xs hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-xs hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} GramSeva Technologies Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;