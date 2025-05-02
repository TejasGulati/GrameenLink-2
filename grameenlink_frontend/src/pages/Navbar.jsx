import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { DashboardContext } from '../context/DashboardContext';
import { 
  Bell, Menu, X, ChevronDown, Home, Package, ShoppingBag, 
  User, LogOut, Leaf, HardDrive, LayoutDashboard, Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useContext(AuthContext);
  const { fetchNotifications, markAllNotificationsRead } = useContext(DashboardContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Navigation items configuration
  const navItems = [
    { 
      path: '/dashboard/main',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
      roles: ['user', 'node', 'retailer', 'distributor']
    },
    {
      path: '/admin/dashboard',
      label: 'Admin Dashboard',
      icon: <Shield className="w-4 h-4 mr-2" />,
      roles: ['admin']
    },
    {
      path: '/nodes',
      label: 'Nodes',
      icon: <HardDrive className="w-4 h-4 mr-2" />,
      roles: ['admin', 'node']
    },
    {
      path: '/marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="w-4 h-4 mr-2" />,
      roles: ['retailer', 'distributor', 'admin', 'node']
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setMobileMenuOpen(false);
  };

  // Scroll and resize handlers
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications management - FIXED ERROR HERE
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await fetchNotifications({ limit: 5 });
        // Check if data is an array before setting it
        const notificationsArray = Array.isArray(data) ? data : [];
        setNotifications(notificationsArray);
        // Only count unread if we have an array
        setUnreadCount(notificationsArray.filter(n => !n.is_read).length);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    loadNotifications();
  }, [isAuthenticated, location.pathname, fetchNotifications]);

  const handleMarkNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      navigate('/notifications');
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  // Helper functions
  const isActive = (path) => location.pathname.startsWith(path);
  const userHasAccess = (roles) => isAuthenticated && roles.includes(user?.user_type);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled || mobileMenuOpen ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/" className="text-xl font-bold flex items-center">
              <motion.span 
                className="text-gray-900 font-bold flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Leaf className="w-6 h-6 text-green-600 mr-2" />
                <span>GrameenLink</span>
              </motion.span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {isAuthenticated && navItems.map((item) => (
                userHasAccess(item.roles) && (
                  <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center ${
                        isActive(item.path) ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                )
              ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/demo" className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Demo
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Register
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkNotificationsRead}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>
                </div>
                
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <motion.button 
                    className="flex items-center space-x-2 px-2 py-1 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white flex items-center justify-center font-medium">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-gray-700 max-w-32 truncate">{user?.name || user?.email}</span>
                    <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }}>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        className="absolute right-0 mt-1 w-56 bg-white shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          My Profile
                        </Link>
                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                            <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkNotificationsRead}
                className="p-2 mr-1 rounded-full hover:bg-gray-100 relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            )}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
              whileHover={{ scale: 1.1 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              ref={mobileMenuRef}
              className="md:hidden pt-2 pb-4 space-y-1 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {isAuthenticated ? (
                <>
                  {navItems.map((item) => (
                    userHasAccess(item.roles) && (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        className="flex items-center px-4 py-3 mx-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    )
                  ))}

                  <div className="border-t mt-2 pt-3">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-3 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-6 h-6 mr-3 rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white flex items-center justify-center">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </div>
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin/dashboard" 
                        className="flex items-center px-4 py-3 mx-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center px-4 py-3 mx-2"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/demo" className="block px-4 py-3 mx-2">Demo</Link>
                  <Link to="/login" className="block px-4 py-3 mx-2">Login</Link>
                  <Link to="/register" className="block px-4 py-3 mx-2">Register</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;