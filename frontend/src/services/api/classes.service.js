import { apiRequest } from './client';

export function getStudentClasses(accessToken) {
  return apiRequest('/class-members/me/student-classes', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getTeacherClasses(accessToken) {
  return apiRequest('/class-members/me/teacher-classes', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getPendingClassRequests(classId, accessToken) {
  return apiRequest(`/class-members/classes/${classId}/pending`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
