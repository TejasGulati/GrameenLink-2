import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { X, CheckCircle, AlertCircle, ShoppingCart, Package, CreditCard, Settings } from 'lucide-react';

const Notifications = () => {
  const { 
    fetchNotifications, 
    markAllNotificationsRead, 
    getUnreadNotificationCount,
    fetchNotificationDetail,
    deleteNotification
  } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch notifications and unread count in parallel
      const [notificationsRes, unreadRes] = await Promise.all([
        fetchNotifications(),
        getUnreadNotificationCount()
      ]);
      
      setNotifications(notificationsRes.data || []);
      setUnreadCount(unreadRes.count || 0);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all as read');
      console.error('Mark all read error:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await fetchNotificationDetail(id); // This marks as read in backend
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
      setNotifications(notifications.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Delete notification error:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5" />;
      case 'inventory':
        return <Package className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'system':
        return <Settings className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'order':
        return 'text-blue-600 bg-blue-50';
      case 'inventory':
        return 'text-orange-600 bg-orange-50';
      case 'payment':
        return 'text-green-600 bg-green-50';
      case 'system':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <div className="flex items-center">
          <X className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {notifications && notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications available
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications && notifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.notification_type)}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`text-lg font-medium ${!notification.is_read ? 'text-blue-800' : 'text-gray-800'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {notification.related_object_type && (
                      <button 
                        onClick={() => setSelectedNotification(notification)}
                        className="text-emerald-600 hover:text-emerald-800 text-sm mt-2"
                      >
                        View details
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkRead(notification.id)}
                        className="text-gray-500 hover:text-emerald-600 text-sm p-1"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="text-gray-500 hover:text-red-600 text-sm p-1"
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-full ${getNotificationColor(selectedNotification.notification_type)}`}>
                  {getNotificationIcon(selectedNotification.notification_type)}
                </div>
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedNotification.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {formatTime(selectedNotification.created_at)}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  {selectedNotification.message}
                </p>
              </div>
              
              {selectedNotification.related_object_type && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Related {selectedNotification.related_object_type}:</h4>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedNotification.related_object, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;