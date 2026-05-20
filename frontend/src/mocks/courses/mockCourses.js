import {
  mockClasses,
  mockClassMembers,
  mockLessonContents,
  mockLessons,
  mockQuizzes,
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

function normalizeContentType(type) {
  return String(type ?? '').trim().toLowerCase();
}

function getDisplayType(content) {
  const type = normalizeContentType(content.type);
  const url = String(content.file_url ?? '').toLowerCase();
  const title = String(content.title ?? '').toLowerCase();

  if (type === 'file' && (url.endsWith('.pdf') || title.includes('pdf'))) {
    return 'pdf';
  }

  return type || 'file';
}

function normalizeLessonContent(content, courseId) {
  const displayType = getDisplayType(content);
  const matchedQuiz =
    displayType === 'quiz'
      ? mockQuizzes.find(
          (quiz) =>
            quiz.id === content.content ||
            quiz.id === content.file_url ||
            quiz.title.toLowerCase() === content.title.toLowerCase(),
        )
      : null;

  return {
    id: content.id,
    lessonId: content.lesson_id,
    type: normalizeContentType(content.type),
    displayType,
    title: content.title,
    content: content.content,
    fileUrl: content.file_url,
    openUrl: `/api/lesson-contents/${content.id}/open`,
    duration: content.duration,
    orderIndex: content.order_index,
    quizId: matchedQuiz?.id ?? null,
    quizUrl: matchedQuiz ? `/courses/${courseId}/quizzes/${matchedQuiz.id}` : null,
  };
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

      const hasVideo = lessonContent.some(
        (item) => normalizeContentType(item.type) === 'video',
      );
      return {
        id: lesson.id,
        title: lesson.title,
        duration: hasVideo ? '45 phut' : '30 phut',
        status: lesson.id === 1 ? 'done' : 'in-progress',
      };
    });
}

export function getMockCourseSections(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);

  return mockSections
    .filter((section) => section.class_id === resolvedCourseId)
    .sort((left, right) => left.order_index - right.order_index)
    .map((section) => {
      const lessons = mockLessons
        .filter((lesson) => lesson.section_id === section.id)
        .sort((left, right) => left.order_index - right.order_index)
        .map((lesson) => {
          const lessonContent = mockLessonContents.filter(
            (content) => content.lesson_id === lesson.id,
          );

          const contents = lessonContent
            .map((content) => normalizeLessonContent(content, resolvedCourseId))
            .sort((left, right) => left.orderIndex - right.orderIndex);
          const hasVideo = contents.some((item) => item.type === 'video');

          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            duration: hasVideo ? '45 phut' : '30 phut',
            contentCount: contents.length,
            contentTypes: contents.map((item) => item.displayType),
            contents,
            status: lesson.id === 1 ? 'done' : 'in-progress',
          };
        });

      return {
        id: section.id,
        title: section.title,
        orderIndex: section.order_index,
        lessonCount: lessons.length,
        lessons,
      };
    });
}

export function getMockCourseResources(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  const lessonResources = getMockCourseSections(resolvedCourseId).flatMap(
    (section) =>
      section.lessons.flatMap((lesson) =>
        lesson.contents.map((content) => ({
          ...content,
          sectionTitle: section.title,
          lessonTitle: lesson.title,
        })),
      ),
  );
  const quizItems = getMockCourseQuizzes(resolvedCourseId).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    displayType: 'quiz',
    quizId: quiz.id,
    quizUrl: `/courses/${resolvedCourseId}/quizzes/${quiz.id}`,
    meta: `${quiz.total_questions} cau hoi · ${quiz.time_limit} phut`,
  }));

  return [
    {
      id: 'lesson-resources',
      title: 'Tai nguyen theo bai hoc',
      description: 'Text, PDF, file, video va quiz gan voi tung bai hoc',
      items: lessonResources,
    },
    {
      id: 'class-quizzes',
      title: 'Quiz cua lop',
      description: 'Danh sach quiz cua khoa hoc',
      items: quizItems,
    },
  ];
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

export function getMockCourseQuizzes(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return mockQuizzes.filter((quiz) => quiz.class_id === resolvedCourseId);
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
