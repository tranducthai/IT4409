import { apiRequest, apiUpload } from './client';

export function submitAssignment(assignmentId, payload) {
  const formData = new FormData();
  if (payload?.content) formData.append('content', payload.content);
  (payload?.files ?? []).forEach((file) => {
    formData.append('files', file);
  });
  return apiUpload(`/submissions/assignment/${assignmentId}`, formData);
}

export function getSubmissionById(submissionId) {
  return apiRequest(`/submissions/${submissionId}`, { method: 'GET' });
}

export function getMySubmissionsByAssignment(assignmentId) {
  return apiRequest(`/submissions/assignment/${assignmentId}/me`, { method: 'GET' });
}

export function getSubmissionsByAssignment(assignmentId) {
  return apiRequest(`/submissions/assignment/${assignmentId}`, { method: 'GET' });
}

export function gradeSubmission(submissionId, payload) {
  return apiRequest(`/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
