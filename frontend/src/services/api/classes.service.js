import { apiRequest } from './client';

function withAuth(accessToken) {
  void accessToken;
  return {};
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
    body: payload,
    ...withAuth(accessToken),
  });
}

export function updateClass(classId, payload, accessToken) {
  return apiRequest(`/classes/${classId}`, {
    method: 'PATCH',
    body: payload,
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

export function getMyClassProgress(classId, accessToken) {
  return apiRequest(`/classes/${classId}/progress/me`, {
    method: 'GET',
    ...withAuth(accessToken),
  });
}

export function addStudentToClass(payload, accessToken) {
  return apiRequest('/class-members', {
    method: 'POST',
    body: payload,
    ...withAuth(accessToken),
  });
}

export function approveJoinRequest(requestId, accessToken) {
  return apiRequest(`/class-members/${requestId}/approve`, {
    method: 'PATCH',
    ...withAuth(accessToken),
  });
}

export function rejectJoinRequest(requestId, accessToken) {
  return apiRequest(`/class-members/${requestId}/reject`, {
    method: 'PATCH',
    ...withAuth(accessToken),
  });
}

// Student: join class by join_code
export function requestJoinByCode(joinCode, accessToken) {
  return apiRequest('/class-members/me/request-join', {
    method: 'POST',
    body: { join_code: joinCode },
    ...withAuth(accessToken),
  });
}

// Teacher: add student by MSSV (student_code)
export function addStudentByStudentCode(classId, studentCode, accessToken) {
  return apiRequest(`/class-members/classes/${classId}/add-by-code`, {
    method: 'POST',
    body: { student_code: studentCode },
    ...withAuth(accessToken),
  });
}

// Teacher: bulk add students by MSSV list (CSV import)
export function bulkAddStudentsByCodes(classId, studentCodes, accessToken) {
  return apiRequest(`/class-members/classes/${classId}/bulk-add`, {
    method: 'POST',
    body: { student_codes: studentCodes },
    ...withAuth(accessToken),
  });
}
