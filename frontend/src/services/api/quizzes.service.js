import { apiRequest } from './client';

export function createQuiz(payload) {
  return apiRequest('/quizzes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
