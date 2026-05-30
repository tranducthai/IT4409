import { apiRequest } from './client';

function toArray(value) {
  if (Array.isArray(value?.data)) return value.data.filter(Boolean);
  if (Array.isArray(value?.items)) return value.items.filter(Boolean);

  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeQuestion(question) {
  return {
    id: question.id,
    text: question.question_text ?? question.text ?? 'Câu hỏi chưa có nội dung',
    question_text: question.question_text,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_answer: question.correct_answer,
    options: [
      { key: 'A', text: question.option_a },
      { key: 'B', text: question.option_b },
      { key: 'C', text: question.option_c },
      { key: 'D', text: question.option_d },
    ].filter((option) => option.text),
  };
}

export async function getQuizDetailFromApi(quizId) {
  const quiz = await apiRequest(`/quiz/${quizId}`);

  return {
    id: quiz.id,
    courseId: quiz.class_id ?? null,
    title: quiz.title ?? 'Quiz chưa có tiêu đề',
    description: quiz.description ?? '',
    timeLimit: quiz.time_limit ?? 0,
    totalQuestions: quiz.total_questions ?? toArray(quiz.questions).length,
    questions: toArray(quiz.questions).map(normalizeQuestion),
  };
}

export function startQuizAttempt(quizId) {
  return apiRequest(`/quiz/${quizId}/start`, { method: 'POST' });
}

export function submitQuizAttempt(quizId, payload) {
  return apiRequest(`/quiz/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listMyQuizAttempts(quizId) {
  return apiRequest(`/quiz/${quizId}/attempts/me`, { method: 'GET' });
}
