import {
  mockClasses,
  mockClassMembers,
  mockLessonContents,
  mockLessons,
  mockQuizzes,
  mockSections,
} from '../classes/mockClasses';

const defaultCourseImage = '/favicon.svg';

const mockAssignments = [
  {
    id: 'a57b6f3d-63d4-49a7-a5c7-2a6f30000001',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    created_by: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    title: 'BTVN 01 - Viết lexer đơn giản',
    description: 'Cài đặt lexer nhận diện identifier, number và keyword cơ bản.',
    due_date: '2026-05-28T16:59:59.000Z',
    created_at: '2026-05-10T08:00:00.000Z',
    attachments: [
      {
        id: 'f9ec9814-0d2d-41b4-b1e2-1d4900000001',
        file_url: 'https://example.com/assignments/lexer-btvn.pdf',
        original_name: 'lexer-btvn.pdf',
        file_name: 'lexer-btvn.pdf',
        mime_type: 'application/pdf',
        size: 256000,
      },
    ],
  },
  {
    id: 'a57b6f3d-63d4-49a7-a5c7-2a6f30000002',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00001',
    created_by: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    title: 'BTVN 02 - Regex và DFA',
    description: 'Vẽ DFA từ các biểu thức chính quy trong đề bài.',
    due_date: '2026-06-04T16:59:59.000Z',
    created_at: '2026-05-14T08:00:00.000Z',
    attachments: [],
  },
  {
    id: 'a57b6f3d-63d4-49a7-a5c7-2a6f30000003',
    class_id: '1f6b8a4d-c1d4-4f79-90a9-24d8b4f00002',
    created_by: '8b2ca5d8-9f69-4c8f-b1ef-183b6a10a222',
    title: 'BTVN 01 - Kiểu dữ liệu và biến',
    description: 'Hoàn thành các bài tập về khai báo biến và ép kiểu trong C.',
    due_date: '2026-05-30T16:59:59.000Z',
    created_at: '2026-05-12T08:00:00.000Z',
    attachments: [],
  },
];

const mockQuizQuestions = [
  {
    id: '0bd63d6f-8284-4f2d-9f4e-6c0600000001',
    quiz_id: '9c4f1d8d-66a4-4bb2-b312-2b9d60000001',
    question_text: 'Token nào thường được scanner nhận diện trước khi parser xử lý?',
    option_a: 'Identifier',
    option_b: 'AST',
    option_c: 'Bytecode',
    option_d: 'Symbol table',
  },
  {
    id: '0bd63d6f-8284-4f2d-9f4e-6c0600000002',
    quiz_id: '9c4f1d8d-66a4-4bb2-b312-2b9d60000001',
    question_text: 'Biểu thức chính quy thường được dùng trong pha nào?',
    option_a: 'Sinh mã máy',
    option_b: 'Phân tích từ vựng',
    option_c: 'Tối ưu mã',
    option_d: 'Liên kết thư viện',
  },
];

const mockCreatedQuizzesStorageKey = 'it4409_mock_created_quizzes';

function getStoredMockQuizzes() {
  try {
    const raw = localStorage.getItem(mockCreatedQuizzesStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredMockQuizzes(items) {
  try {
    localStorage.setItem(mockCreatedQuizzesStorageKey, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private contexts; the live page state still updates.
  }
}

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

function getAssignmentStatus(assignment) {
  if (!assignment.due_date) return 'no-due';

  const dueDate = new Date(assignment.due_date);
  if (Number.isNaN(dueDate.getTime())) return 'no-due';

  return dueDate < new Date() ? 'overdue' : 'open';
}

function normalizeAssignment(assignment) {
  return {
    id: assignment.id,
    classId: assignment.class_id,
    title: assignment.title,
    description: assignment.description ?? '',
    dueDate: assignment.due_date ?? null,
    createdAt: assignment.created_at ?? null,
    status: getAssignmentStatus(assignment),
    attachments: (assignment.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.file_url,
      originalName: attachment.original_name ?? attachment.file_name ?? 'File đính kèm',
      mimeType: attachment.mime_type,
      size: attachment.size,
    })),
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
        duration: hasVideo ? '45 phút' : '30 phút',
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
            duration: hasVideo ? '45 phút' : '30 phút',
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
    meta: `${quiz.total_questions} câu hỏi · ${quiz.time_limit} phút`,
  }));

  return [
    {
      id: 'lesson-resources',
      title: 'Tài nguyên theo bài học',
      description: 'Văn bản, PDF, tệp, video và quiz gắn với từng bài học',
      items: lessonResources,
    },
    {
      id: 'class-quizzes',
      title: 'Quiz của lớp',
      description: 'Danh sách quiz của khóa học',
      items: quizItems,
    },
  ];
}

export function getMockCourseDiscussions(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return [
    `Q&A tuần đầu cho lớp ${resolvedCourseId.slice(-4)}`,
    'Thảo luận nhóm về bài tập lớn',
    'Giải đáp vấn đề triển khai assignment',
  ];
}

export function getMockCourseWiki(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return [
    `Tổng hợp thuật ngữ của khóa học ${resolvedCourseId.slice(-4)}`,
    'Sơ đồ tổng quan nội dung học phần',
    'Checklist ôn tập trước quiz',
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
  return [...getStoredMockQuizzes(), ...mockQuizzes].filter(
    (quiz) => quiz.class_id === resolvedCourseId,
  );
}

export function addMockCourseQuiz(quiz) {
  const stored = getStoredMockQuizzes();
  const next = [
    quiz,
    ...stored.filter((item) => item.id !== quiz.id),
  ];
  setStoredMockQuizzes(next);
  return quiz;
}

export function getMockQuizDetail(courseId, quizId) {
  const quiz = getMockCourseQuizzes(courseId).find((item) => item.id === quizId);
  if (!quiz) return null;

  return {
    id: quiz.id,
    courseId: quiz.class_id,
    title: quiz.title,
    description: quiz.description ?? '',
    timeLimit: quiz.time_limit,
    totalQuestions: quiz.total_questions,
    questions: mockQuizQuestions
      .filter((question) => question.quiz_id === quiz.id)
      .map((question) => ({
        id: question.id,
        text: question.question_text,
        options: [
          { key: 'A', text: question.option_a },
          { key: 'B', text: question.option_b },
          { key: 'C', text: question.option_c },
          { key: 'D', text: question.option_d },
        ],
      })),
  };
}

export function getMockCourseAssignments(courseId) {
  const resolvedCourseId = resolveCourseId(courseId);
  return mockAssignments
    .filter((assignment) => assignment.class_id === resolvedCourseId)
    .map(normalizeAssignment);
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
