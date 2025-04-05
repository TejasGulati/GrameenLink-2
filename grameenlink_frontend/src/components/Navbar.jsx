import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X,
  Home,
  Layers,
  BarChart2,
  ShoppingCart,
  BookOpen,
  Database,
  MapPin,
  Truck,
  Box,
  Activity,
  User, 
  ChevronDown,
  Settings,
  Key,
  LogOut,
  LogIn,
  UserPlus,
  Package,
  Route,
  ClipboardList,
  Warehouse,
  ShoppingBag,
  LineChart,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import logo from '../assets/logo-1.png';

const Navbar = () => {
  const { user, loading, error, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const getNavItems = () => {
    if (!user) {
      return [
        { 
          id: 'demo', 
          name: "Demo", 
          path: "/demo", 
          icon: <BarChart2 size={18} />
        }
      ];
    }

    const baseItems = [
      {
        id: 'dashboard',
        name: "Dashboard",
        path: "/dashboard",
        icon: <BarChart2 size={18} />
      }
    ];

    // Admin specific routes
    if (user.user_type === 'admin') {
      baseItems.push(
        {
          id: 'nodes',
          name: "Node Management",
          path: "/nodes",
          icon: <Layers size={18} />,
          subItems: [
            {
              id: 'nodes-list',
              name: "All Nodes",
              path: "/nodes",
              icon: <Warehouse size={16} className="mr-2" />,
              description: "Manage all distribution nodes"
            },
            {
              id: 'inventory',
              name: "Inventory",
              path: "/inventory",
              icon: <Package size={16} className="mr-2" />,
              description: "Track inventory across nodes"
            },
            {
              id: 'performance',
              name: "Performance",
              path: "/performance",
              icon: <Activity size={16} className="mr-2" />,
              description: "Node performance metrics"
            },
            {
              id: 'routes',
              name: "Route Optimization",
              path: "/routes",
              icon: <Route size={16} className="mr-2" />,
              description: "Optimize delivery routes"
            }
          ]
        },
        {
          id: 'marketplace',
          name: "Marketplace",
          path: "/marketplace",
          icon: <ShoppingCart size={18} />,
          subItems: [
            {
              id: 'products',
              name: "Products",
              path: "/products",
              icon: <ShoppingBag size={16} className="mr-2" />,
              description: "Browse available products"
            },
            {
              id: 'orders',
              name: "Orders",
              path: "/orders",
              icon: <ClipboardList size={16} className="mr-2" />,
              description: "Manage all orders"
            },
            {
              id: 'demands',
              name: "Demand Analysis",
              path: "/demands",
              icon: <LineChart size={16} className="mr-2" />,
              description: "Analyze retailer demands"
            }
          ]
        },
        {
          id: 'admin',
          name: "Admin",
          path: "/admin",
          icon: <Shield size={18} />,
          subItems: [
            {
              id: 'users',
              name: "User Management",
              path: "/admin/users",
              icon: <Users size={16} className="mr-2" />,
              description: "Manage system users"
            },
            {
              id: 'reports',
              name: "Reports",
              path: "/admin/reports",
              icon: <FileText size={16} className="mr-2" />,
              description: "System reports and analytics"
            }
          ]
        }
      );
    }

    // Node manager specific routes
    if (user.user_type === 'node') {
      baseItems.push(
        {
          id: 'node',
          name: "My Node",
          path: "/node",
          icon: <Warehouse size={18} />,
          subItems: [
            {
              id: 'node-dashboard',
              name: "Dashboard",
              path: "/node",
              icon: <BarChart2 size={16} className="mr-2" />,
              description: "Node overview and metrics"
            },
            {
              id: 'node-inventory',
              name: "Inventory",
              path: "/node/inventory",
              icon: <Package size={16} className="mr-2" />,
              description: "Manage node inventory"
            },
            {
              id: 'node-orders',
              name: "Orders",
              path: "/node/orders",
              icon: <ClipboardList size={16} className="mr-2" />,
              description: "View and fulfill orders"
            },
            {
              id: 'node-routes',
              name: "Delivery Routes",
              path: "/node/routes",
              icon: <Route size={16} className="mr-2" />,
              description: "Manage delivery routes"
            }
          ]
        }
      );
    }

    // Retailer specific routes
    if (user.user_type === 'retailer') {
      baseItems.push(
        {
          id: 'marketplace',
          name: "Marketplace",
          path: "/marketplace",
          icon: <ShoppingCart size={18} />,
          subItems: [
            {
              id: 'products',
              name: "Browse Products",
              path: "/products",
              icon: <ShoppingBag size={16} className="mr-2" />,
              description: "Browse available products"
            },
            {
              id: 'my-orders',
              name: "My Orders",
              path: "/orders",
              icon: <ClipboardList size={16} className="mr-2" />,
              description: "View your order history"
            },
            {
              id: 'demand',
              name: "Demand Forecast",
              path: "/demand",
              icon: <LineChart size={16} className="mr-2" />,
              description: "Plan your inventory needs"
            }
          ]
        }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}` 
      : names[0][0];
  };

  const toggleDropdown = (itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const renderDropdownItem = (item, isMobile = false) => (
    <Link 
      key={`sub-item-${item.id}`}
      to={item.path}
      className={`
        flex items-start px-4 py-3 hover:bg-gradient-to-r from-green-50 to-blue-50 transition-all
        ${isMobile ? 'text-sm rounded-md' : 'text-xs sm:text-sm rounded-md'}
        border border-transparent hover:border-green-100
      `}
    >
      <span className="text-green-600 mr-2 mt-0.5">{item.icon}</span>
      <div>
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="text-gray-500 mt-1 text-xs">{item.description}</div>
      </div>
    </Link>
  );

  const renderDropdownContent = (items, isMobile = false) => (
    <div className={isMobile ? 'space-y-2 pl-2 py-2' : 'grid grid-cols-1 gap-2 p-2 w-64'}>
      {items.map((item) => renderDropdownItem(item, isMobile))}
    </div>
  );

  if (loading) {
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 h-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        fixed top-0 left-0 right-0 z-50 
        ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xs' : 'bg-white/90 backdrop-blur-sm'}
        transition-all duration-200 ease-out
        border-b border-gray-200/50
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/" 
            className="flex items-center flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center"
            >
              <img
                src={logo}
                alt="GrameenLink Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                GrameenLink
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/"
              className="hidden md:flex items-center text-sm py-2 px-3 text-gray-700 hover:text-green-600 transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50"
            >
              <Home size={16} className="mr-1" />
              Home
            </Link>

            {navItems.map((item) => (
              <div key={`nav-item-${item.id}`} className="relative group">
                {item.subItems ? (
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(item.id)}
                      className={`
                        flex items-center px-3 py-2 rounded-md transition-all
                        ${activeDropdown === item.id ? 'bg-gradient-to-r from-green-50 to-blue-50 shadow-xs' : 'hover:bg-gray-50/50'}
                        text-gray-700 text-sm font-medium
                        border border-transparent hover:border-gray-200
                      `}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      <span>{item.name}</span>
                      <ChevronDown size={16} className={`ml-1 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                          className={`
                            absolute left-0 z-50 mt-1
                            bg-white rounded-md shadow-md overflow-hidden
                            border border-gray-200/80 backdrop-blur-sm
                          `}
                        >
                          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-green-50/80 to-blue-50/80">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Manage your {item.name.toLowerCase()} resources
                            </p>
                          </div>
                          {renderDropdownContent(item.subItems)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center px-3 py-2 rounded-md transition-all text-sm text-gray-700 hover:text-green-600 hover:bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-transparent hover:border-gray-200"
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* User Menu */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-white font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                      className="absolute right-0 z-50 mt-1 w-56 bg-white rounded-md shadow-md overflow-hidden border border-gray-200/80 backdrop-blur-sm"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/profile/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        {user.user_type === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 rounded-md transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-transparent hover:border-gray-200"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 rounded-md transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-transparent hover:border-gray-200"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {!user && (
              <div className="flex items-center mr-2">
                <Link
                  to="/login"
                  className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:text-green-600 rounded-md transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-transparent hover:border-gray-200"
                >
                  <LogIn className="mr-1 h-3 w-3" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:text-green-600 rounded-md transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50 border border-transparent hover:border-gray-200"
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Register
                </Link>
              </div>
            )}
            
            {user && (
              <div className="mr-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium text-sm">
                  {getUserInitials()}
                </div>
              </div>
            )}
            
            <motion.button
              onClick={toggleMenu}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100/50"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-sm shadow-md rounded-b-md overflow-hidden border-t border-gray-200/50"
              ref={menuRef}
            >
              <div className="space-y-2 px-4 py-4">
                <Link
                  to="/"
                  className="flex items-center text-sm py-3 px-3 font-medium rounded-md text-gray-700 hover:text-green-600 transition-colors hover:bg-gradient-to-r from-green-50/50 to-blue-50/50"
                >
                  <Home size={16} className="mr-2" />
                  Home
                </Link>

                {navItems.map((item) => (
                  <div 
                    key={`nav-item-${item.id}`}
                    className="border-b border-gray-100/50 last:border-0 pb-2"
                  >
                    {item.subItems ? (
                      <div className="px-1">
                        <button 
                          onClick={() => toggleDropdown(item.id)}
                          className={`
                            flex items-center justify-between w-full py-3 px-3
                            text-gray-700 font-medium rounded-md text-sm
                            ${activeDropdown === item.id ? 'bg-gradient-to-r from-green-50/80 to-blue-50/80' : ''}
                          `}
                        >
                          <div className="flex items-center">
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.name}
                          </div>
                          <ChevronDown size={16} className={`transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 pt-2 overflow-hidden"
                            >
                              {renderDropdownContent(item.subItems, true)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className="flex items-center px-3 py-3 rounded-md transition-all text-sm text-gray-700 hover:text-green-600 hover:bg-gradient-to-r from-green-50/50 to-blue-50/50"
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {user && (
                <div className="px-4 py-3 border-t border-gray-200/50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  {user.user_type === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-200/50 bg-gradient-to-r from-green-50/30 to-blue-50/30">
                <div className="text-xs text-gray-500 text-center">
                  {user ? `Logged in as ${user?.name || 'User'} (${user.user_type})` : 'GrameenLink - Rural Distribution Platform'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;