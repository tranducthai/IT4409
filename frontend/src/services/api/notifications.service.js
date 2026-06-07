import { apiRequest } from './client';

export async function getMyNotifications() {
  return apiRequest('/notifications/me');
}

export async function getUnreadCount() {
  const data = await apiRequest('/notifications/me/unread-count');
  return data.count;
}

export async function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', { method: 'PATCH' });
}
