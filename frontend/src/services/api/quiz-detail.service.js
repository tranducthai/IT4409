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

function normalizeAttempt(attempt) {
  if (!attempt || typeof attempt !== 'object') return null;

  return {
    attemptId: attempt.attempt_id ?? attempt.id ?? null,
    quizId: attempt.quiz_id ?? null,
    score: attempt.score ?? null,
    startTime: attempt.start_time ?? null,
    endTime: attempt.end_time ?? null,
    isSubmitted: Boolean(attempt.is_submitted ?? attempt.end_time),
    expiresAt: attempt.expires_at ?? null,
    timeLimit: attempt.time_limit ?? null,
    timeLimitUnit: attempt.time_limit_unit ?? null,
  };
}

function normalizeAttemptResult(result) {
  if (!result || typeof result !== 'object') return null;

  return {
    attemptId: result.attempt_id ?? result.id ?? null,
    quizId: result.quiz_id ?? null,
    score: result.score ?? null,
    scoreUnit: result.score_unit ?? 'percent',
    startTime: result.start_time ?? null,
    endTime: result.end_time ?? null,
    isSubmitted: Boolean(result.is_submitted ?? result.end_time),
    expiresAt: result.expires_at ?? null,
    totalQuestions: result.total_questions ?? 0,
    correct: result.correct ?? 0,
    answers: toArray(result.answers).map((answer) => ({
      questionId: answer.question_id,
      selectedAnswer: answer.selected_answer,
      isCorrect: Boolean(answer.is_correct),
    })),
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
    openTime: quiz.open_time ?? null,
    closeTime: quiz.close_time ?? null,
    isRandom: Boolean(quiz.is_random),
  };
}

export function startQuizAttempt(quizId) {
  return apiRequest(`/quiz/${quizId}/start`, { method: 'POST' }).then(normalizeAttempt);
}

export function submitQuizAttempt(quizId, payload) {
  return apiRequest(`/quiz/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(normalizeAttemptResult);
}

export function listMyQuizAttempts(quizId) {
  return apiRequest(`/quiz/${quizId}/attempts/me`, { method: 'GET' }).then((items) =>
    toArray(items).map(normalizeAttempt),
  );
}

export function getAttemptResult(attemptId) {
  return apiRequest(`/quiz/attempts/${attemptId}`, { method: 'GET' }).then(normalizeAttemptResult);
}
