import { apiRequest } from './client';

export async function uploadChatImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiRequest('/messages/upload-image', { method: 'POST', body: formData });
}

export function getMessagesByDiscussion(discussionId) {
  return apiRequest(`/messages/discussion/${discussionId}`, { method: 'GET' });
}

export function createMessage(payload) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMessage(messageId, payload) {
  return apiRequest(`/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, { method: 'DELETE' });
}
