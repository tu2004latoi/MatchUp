import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock, Users, MessageSquare, Calendar } from 'lucide-react';
import { authApis, endPoints } from '../../config/Apis';
import { MyUserContext } from '../../config/MyContexts';

interface NotificationMessage {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useContext(MyUserContext);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authApis().get(endPoints.notifications.getMyNotifications, {
        params: {
          userId: user?.id,
        },
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await authApis().patch(endPoints.notifications.markAsRead(id.toString()));
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      await authApis().delete(endPoints.notifications.deleteNotification(id.toString()));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await authApis().delete('/notifications/clear-all');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('friend') || titleLower.includes('kết bạn')) {
      return <Users className="w-5 h-5" />;
    }
    if (titleLower.includes('room') || titleLower.includes('phòng') || titleLower.includes('mời')) {
      return <Calendar className="w-5 h-5" />;
    }
    if (titleLower.includes('message') || titleLower.includes('tin nhắn')) {
      return <MessageSquare className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('friend') || titleLower.includes('kết bạn')) {
      return 'bg-blue-50 text-blue-600 border-blue-100';
    }
    if (titleLower.includes('room') || titleLower.includes('phòng') || titleLower.includes('mời')) {
      return 'bg-green-50 text-green-600 border-green-100';
    }
    if (titleLower.includes('message') || titleLower.includes('tin nhắn')) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    }
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Vừa xong';
    if (diffInMins < 60) return `${diffInMins} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-4 top-16 w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <h3 className="font-bold text-slate-800">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-80">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Không có thông báo nào</p>
                    <p className="text-slate-400 text-sm mt-1">Thông báo mới sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={`${notification.id}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.title)}`}>
                            {getNotificationIcon(notification.title)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold text-slate-800 text-sm truncate ${!notification.isRead ? 'text-blue-600' : ''}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(notification.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">
                              {notification.content}
                            </p>
                          </div>

                          {/* Status */}
                          <div className="flex items-center">
                            {notification.isRead ? (
                              <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
