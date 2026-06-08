import { useCallback, useEffect, useRef, useState } from 'react';
import { createNotificationsSocket } from '../services/api/notifications-socket.service';
import {
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/api/notifications.service';
import { getAccessToken } from '../services/api/client';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const fetchAll = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const [items, count] = await Promise.all([getMyNotifications(), getUnreadCount()]);
      setNotifications(items);
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const fetchTimer = window.setTimeout(() => {
      void fetchAll();
    }, 0);

    const socket = createNotificationsSocket();
    if (!socket) {
      return () => {
        window.clearTimeout(fetchTimer);
      };
    }
    socketRef.current = socket;

    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    socket.connect();

    return () => {
      window.clearTimeout(fetchTimer);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchAll]);

  const markAsRead = useCallback(async (id) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchAll };
}
