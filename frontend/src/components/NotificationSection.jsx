// src/components/NotificationSection.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Loader2,
  Check,
  AlertCircle,
  Mail,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";

const NotificationSection = ({ isAuthenticated, currentUser }) => {
  // Initialize notifications as an empty array
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:3000/api/notifications/${currentUser._id}`
      );
      // console.log(response.data);

      // Ensure we always set an array, even if response.data is null/undefined
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
      // Reset to empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch only the unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/notifications/${currentUser._id}/unread-count`
      );
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Update the markAsRead function to decrement the count
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1); // Decrement unread count
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/api/notifications/mark-all-read`,
        {
          userId: currentUser._id,
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0); // Reset unread count to zero
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Add this useEffect to fetch unread count on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "post_approved":
        return <Check size={16} className="text-green-500" />;
      case "post_disapproved":
        return <AlertCircle size={16} className="text-red-500" />;
      case "new_message":
        return <Mail size={16} className="text-blue-500" />;
      case "community_update":
        return <ThumbsUp size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-yellow-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        className="relative p-2 text-[#818384] rounded-full cursor-progress"
        disabled
        aria-label="Notifications">
        <Bell size={20} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#818384] hover:text-white rounded-full hover:bg-[#1a1a1a] transition-all">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1a1a1a] rounded-lg shadow-lg z-50 border border-[#333333]">
          <div className="p-3 border-b border-[#333333] flex justify-between items-center">
            <h3 className="font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-purple-500 hover:text-purple-400">
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#818384]" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 flex gap-3 ${
                    notification.read ? "" : "bg-[#2a2a2a]"
                  }`}>
                  <div className="pt-1">
                    {getNotificationIcon(notification.type)}
                  </div> 
                  <div className="flex-1">
                    <p className="text-white text-sm">{notification.message}</p>

                    {/* Add title display */}
                    {notification.postTitle && (
                      <p className="text-gray-300 text-sm font-medium mt-1">
                        {notification.postTitle}
                      </p>
                    )}

                    {/* Add image display */}
                    {notification.imageUrl && (
                      <img
                        src={`https://xeadzuobunjecdivltiu.supabase.co/storage/v1/object/public/posts/uploads/${notification.imageUrl}`}
                        alt="Post content"
                        className="mt-2 h-12 w-auto rounded"
                      />
                    )}

                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs text-gray-500 hover:text-white"
                      title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export default NotificationSection;
