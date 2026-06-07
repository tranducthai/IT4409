import { apiRequest } from './client';

export function createQuestion(payload) {
  return apiRequest('/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createQuestionsBulk(quizId, questions) {
  return apiRequest('/questions/bulk', {
    method: 'POST',
    body: JSON.stringify({ quiz_id: quizId, questions }),
  });
}

export function getQuestionsByQuiz(quizId) {
  return apiRequest(`/questions/quiz/${quizId}`, { method: 'GET' });
}

export function updateQuestion(questionId, payload) {
  return apiRequest(`/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteQuestion(questionId) {
  return apiRequest(`/questions/${questionId}`, { method: 'DELETE' });
}
