import { apiRequest } from './client';
import { setCurrentUser } from './session';

export async function getAllUsers() {
  return apiRequest('/users', {
    method: 'GET',
  });
}

export async function updateCurrentUserProfile(userId, payload) {
  const data = await apiRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      full_name: payload.full_name,
      avatar_url: payload.avatar_url || null,
    }),
  });

  if (data) setCurrentUser(data);
  return data;
}

export async function uploadUserAvatar(userId, file) {
  const form = new FormData();
  form.append('file', file);
  const data = await apiRequest(`/users/${userId}/avatar`, { method: 'POST', body: form });
  if (data) setCurrentUser(data);
  return data;
}
