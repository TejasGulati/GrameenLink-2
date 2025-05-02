import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { NodesProvider } from './context/NodesContext';
import { useContext, useEffect } from 'react';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Navbar from './pages/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Nodes2 from './pages/nodes/Nodes2';
import Marketplace2 from './pages/marketplace/Marketplace2';
import Profile from './pages/user/Profile';
import UserNotifications from './pages/user/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, requiredRoles = [], adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (adminOnly && user?.user_type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const RoleBasedRedirect = () => {
  const { user } = useContext(AuthContext);
  
  switch(user?.user_type) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'node':
      return <Navigate to="/nodes" replace />;
    case 'retailer':
    case 'distributor':
      return <Navigate to="/marketplace" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DashboardProvider>
            <MarketplaceProvider>
              <NodesProvider>
                <ScrollToTop />
                <Navbar />
                <div className="w-full mx-auto pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<NotFound message="You don't have permission to access this page" />} />

                    {/* Base dashboard route with role-based redirect */}
                    <Route path="/dashboard" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />

                    {/* Main dashboard routes */}
                    <Route path="/dashboard/main" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>} 
                    />
                    
                    {/* Admin-specific routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>}
                    />

                    {/* Profile management */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>} 
                    />

                    {/* Notifications */}
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <UserNotifications />
                      </ProtectedRoute>}
                    />

                    {/* Node management - New Component Structure */}
                    <Route path="/nodes" element={
                      <ProtectedRoute requiredRoles={['node', 'admin']}>
                        <Nodes2 />
                      </ProtectedRoute>}
                    />

                    {/* Marketplace - New Component Structure */}
                    <Route path="/marketplace" element={
                      <ProtectedRoute requiredRoles={['retailer', 'distributor', 'node', 'admin']}>
                        <Marketplace2 />
                      </ProtectedRoute>}
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </NodesProvider>
            </MarketplaceProvider>
          </DashboardProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;