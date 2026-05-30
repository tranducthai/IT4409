import { apiRequest } from './client';

export function getSectionsByClass(classId) {
  return apiRequest(`/sections/class/${classId}`, { method: 'GET' });
}

export function createSection(payload) {
  return apiRequest('/sections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSection(sectionId, payload) {
  return apiRequest(`/sections/${sectionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteSection(sectionId) {
  return apiRequest(`/sections/${sectionId}`, { method: 'DELETE' });
}
