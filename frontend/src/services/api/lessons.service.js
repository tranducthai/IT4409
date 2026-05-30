import { apiRequest } from './client';

export function getLessonsBySection(sectionId) {
  return apiRequest(`/lessons/section/${sectionId}`, { method: 'GET' });
}

export function createLesson(payload) {
  return apiRequest('/lessons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateLesson(lessonId, payload) {
  return apiRequest(`/lessons/${lessonId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteLesson(lessonId) {
  return apiRequest(`/lessons/${lessonId}`, { method: 'DELETE' });
}
