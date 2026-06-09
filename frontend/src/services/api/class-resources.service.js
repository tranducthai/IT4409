import { apiRequest, apiUpload } from './client';

// ── Files ─────────────────────────────────────────────────────────────────────

export function uploadClassResource(classId, file, folderId = null, orderIndex = 1) {
  const formData = new FormData();
  formData.append('file', file);
  if (folderId) formData.append('folder_id', folderId);
  formData.append('order_index', String(Math.max(1, Number(orderIndex) || 1)));
  return apiUpload(`/class-resources/class/${classId}/upload`, formData);
}

export function getClassResources(classId) {
  return apiRequest(`/class-resources/class/${classId}`, { method: 'GET' });
}

export function deleteClassResource(resourceId) {
  return apiRequest(`/class-resources/${resourceId}`, { method: 'DELETE' });
}

// ── Folders ───────────────────────────────────────────────────────────────────

export function getClassFolders(classId) {
  return apiRequest(`/class-resources/class/${classId}/folders`, { method: 'GET' });
}

export function createClassFolder(classId, name) {
  return apiRequest(`/class-resources/class/${classId}/folders`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteClassFolder(folderId) {
  return apiRequest(`/class-resources/folders/${folderId}`, { method: 'DELETE' });
}
