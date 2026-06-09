import { apiRequest, apiUpload } from './client';

export function createAssignment(payload, files = []) {
  const formData = new FormData();
  formData.append('class_id', payload.class_id);
  formData.append('title', payload.title);
  if (payload.description) formData.append('description', payload.description);
  if (payload.due_date) formData.append('due_date', payload.due_date);

  files.forEach((file) => {
    formData.append('files', file);
  });

  return apiUpload('/assignments', formData);
}

export function updateAssignment(assignmentId, payload) {
  return apiRequest(`/assignments/${assignmentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAssignment(assignmentId) {
  return apiRequest(`/assignments/${assignmentId}`, { method: 'DELETE' });
}
