import {
  mockClasses,
  mockClassMembers,
  mockLessonContents,
  mockLessons,
  mockSections,
} from '../classes/mockClasses';

const defaultCourseImage = 'https://via.placeholder.com/400x225';

export const mockCourseCards = mockClasses.map((item) => ({
  id: item.id,
  title: item.name,
  code: item.join_code,
  category: 'SoICT',
  image: item.avatar_url ?? defaultCourseImage,
  startDate: item.created_at.slice(0, 10),
}));

function resolveCourse(courseRef) {
  const raw = String(courseRef ?? '').trim();
  if (!raw) return null;

  const direct = mockCourseCards.find((item) => String(item.id) === raw);
  if (direct) return direct;

  const byCode = mockCourseCards.find((item) => String(item.code) === raw);
  if (byCode) return byCode;

  if (/^\d+$/.test(raw)) {
    const index = Number(raw) - 1;
    if (index >= 0 && index < mockCourseCards.length) {
      return mockCourseCards[index];
    }
  }

  return null;
}

function resolveCourseId(courseRef) {
  const course = resolveCourse(courseRef);
  return course?.id ?? String(courseRef);
}

export function getMockStudentCourseCards(userId) {
  const activeClassIds = mockClassMembers
    .filter(
      (member) =>
        member.user_id === userId &&
        member.role === 'Student' &&
        member.status === 'Active',
    )
    .map((member) => member.class_id);

  return mockCourseCards.filter((course) => activeClassIds.includes(course.id));
}

export function getMockTeacherCourseCards(teacherId) {
  return mockCourseCards.filter((course) => {
    const cls = mockClasses.find((item) => item.id === course.id);
    return cls?.teacher_id === teacherId;
  });
}

export function getMockTeacherPendingRequests(teacherId) {
  const teacherClassIds = mockClasses
    .filter((item) => item.teacher_id === teacherId)
    .map((item) => item.id);

  return mockClassMembers.filter(
    (member) =>
      teacherClassIds.includes(member.class_id) &&
      member.role === 'Student' &&
      member.status === 'Pending',
  );
}

export function getMockCourseById(courseId) {
  return resolveCourse(courseId);
}

export function getMockCourseLessons(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  const sectionIds = mockSections
    .filter((section) => section.class_id === resolvedCourseId)
    .map((section) => section.id);

  return mockLessons
    .filter((lesson) => sectionIds.includes(lesson.section_id))
    .map((lesson) => {
      const lessonContent = mockLessonContents.filter(
        (content) => content.lesson_id === lesson.id,
      );

      const hasVideo = lessonContent.some((item) => item.type === 'Video');
      return {
        id: lesson.id,
        title: lesson.title,
        duration: hasVideo ? '45 phut' : '30 phut',
        status: lesson.id === 1 ? 'done' : 'in-progress',
      };
    });
}

export function getMockCourseDiscussions(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return [
    `Q&A tuan dau cho lop ${resolvedCourseId.slice(-4)}`,
    'Thao luan nhom ve bai tap lon',
    'Giai dap van de trien khai assignment',
  ];
}

export function getMockCourseWiki(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return [
    `Tong hop thuat ngu cua khoa hoc ${resolvedCourseId.slice(-4)}`,
    'So do tong quan noi dung hoc phan',
    'Checklist on tap truoc quiz',
  ];
}

export function getMockCourseSlides(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return [
    `Slide opening - ${resolvedCourseId.slice(-4)}`,
    'Slide week 2 - Core concepts',
    'Slide week 3 - Practice session',
  ];
}

export function getMockCourseProgress(courseId, userId) {
  const resolvedCourseId = resolveCourseId(courseId);
  const joined = mockClassMembers.find(
    (member) =>
      member.class_id === resolvedCourseId &&
      member.user_id === userId &&
      member.status === 'Active',
  );

  if (!joined) {
    return {
      progressPercent: 0,
      completed: 0,
      inProgress: 0,
      todo: getMockCourseLessons(resolvedCourseId).length,
    };
  }

  const lessons = getMockCourseLessons(resolvedCourseId);
  const completed = lessons.filter((item) => item.status === 'done').length;
  const inProgress = lessons.filter(
    (item) => item.status === 'in-progress',
  ).length;
  const todo = lessons.filter((item) => item.status === 'todo').length;
  const progressPercent = Math.round((completed / Math.max(lessons.length, 1)) * 100);

  return {
    progressPercent,
    completed,
    inProgress,
    todo,
  };
}
