import { apiRequest } from './client';

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
