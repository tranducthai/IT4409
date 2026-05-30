import { apiRequest } from './client';

function withAuth(accessToken) {
  return accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : {};
}

export function getStudentClasses(accessToken) {
  return apiRequest('/class-members/me/student-classes', {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function getTeacherClasses(accessToken) {
  return apiRequest('/class-members/me/teacher-classes', {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function getAllClasses(accessToken) {
  return apiRequest('/classes', {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function getPendingClassRequests(classId, accessToken) {
  return apiRequest(`/class-members/classes/${classId}/pending`, {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function createClass(payload, accessToken) {
  return apiRequest('/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...withAuth(accessToken),
  });
}

export function updateClass(classId, payload, accessToken) {
  return apiRequest(`/classes/${classId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...withAuth(accessToken),
  });
}

export function deleteClass(classId, accessToken) {
  return apiRequest(`/classes/${classId}`, {
    method: 'DELETE',
    ...withAuth(accessToken),
  });
}

export function getTeacherClassProgress(classId, accessToken) {
  return apiRequest(`/classes/${classId}/teacher-progress`, {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function addStudentToClass(payload, accessToken) {
  return apiRequest('/class-members', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...withAuth(accessToken),
  });
}

export function approveJoinRequest(requestId, accessToken) {
  return apiRequest(`/class-members/${requestId}/approve`, {
    method: 'PATCH',
    ...withAuth(accessToken),
  });
}
