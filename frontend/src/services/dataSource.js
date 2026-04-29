import {
  getMockCourseById,
  getMockCourseDiscussions,
  getMockCourseLessons,
  getMockCourseProgress,
  getMockCourseSlides,
  getMockCourseWiki,
  getMockStudentCourseCards,
  getMockTeacherCourseCards,
  getMockTeacherPendingRequests,
  mockCourseCards,
} from '../mocks/courses/mockCourses';

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export function getHomeCourses() {
  return mockCourseCards;
}

export function getStudentDashboardData(userId) {
  return {
    courses: getMockStudentCourseCards(userId),
  };
}

export function getTeacherDashboardData(userId) {
  return {
    courses: getMockTeacherCourseCards(userId),
    pendingRequests: getMockTeacherPendingRequests(userId),
  };
}

export function getCourseDetailData(courseId, userId) {
  return {
    course: getMockCourseById(courseId),
    lessons: getMockCourseLessons(courseId),
    discussions: getMockCourseDiscussions(courseId),
    wiki: getMockCourseWiki(courseId),
    slides: getMockCourseSlides(courseId),
    progress: getMockCourseProgress(courseId, userId),
  };
}
