import { apiRequest } from './client';

export function getDiscussionsByClass(classId) {
  return apiRequest(`/discussions/class/${classId}`, { method: 'GET' });
}

export function createDiscussion(payload) {
  return apiRequest('/discussions', {
    method: 'POST',
    body: payload,
  });
}

export function updateDiscussion(discussionId, payload) {
  return apiRequest(`/discussions/${discussionId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteDiscussion(discussionId) {
  return apiRequest(`/discussions/${discussionId}`, { method: 'DELETE' });
}
