import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative rounded-full border border-transparent p-2 text-[#70594b] transition-colors hover:border-[#d9c1a4] hover:bg-[#f2e2cc] hover:text-[#6b4226] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c5a3c]/50"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8c5a3c] text-[10px] font-bold text-white shadow-sm shadow-[#6b4226]/25">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#d9c1a4] bg-[#fffaf2] shadow-lg shadow-[#6b4226]/10 md:w-96">
          <div className="flex items-center justify-between border-b border-[#d9c1a4] bg-[#f8f1e7] p-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center text-xs font-medium text-[#8c5a3c] hover:text-[#6b4226] hover:underline"
              >
                <CheckCheck className="h-3 w-3 mr-1" /> Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#70594b]">
                No notifications to display.
              </div>
            ) : (
              <div className="divide-y divide-[#eadcca]">
                {notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`flex items-start gap-3 p-4 transition-colors ${notif.isRead ? 'bg-[#fffaf2] opacity-70' : 'bg-[#f2e2cc]/70 hover:bg-[#eadcca]'}`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${!notif.isRead ? 'font-medium text-[#3c281e]' : 'text-[#70594b]'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-[#987c69]">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => markAsRead(notif._id, e)}
                        className="rounded p-1 text-[#70594b] transition-colors hover:bg-[#fffaf2] hover:text-[#8c5a3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c5a3c]/50"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
