import { apiRequest } from './client';

export function createQuiz(payload) {
  return apiRequest('/quizzes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateQuiz(quizId, payload) {
  return apiRequest(`/quizzes/${quizId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteQuiz(quizId) {
  return apiRequest(`/quizzes/${quizId}`, { method: 'DELETE' });
}
