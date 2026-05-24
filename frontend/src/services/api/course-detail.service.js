import { apiRequest } from './client';

const defaultCourseImage = 'https://via.placeholder.com/400x225';

function toArray(value) {
  if (Array.isArray(value?.data)) return value.data.filter(Boolean);
  if (Array.isArray(value?.items)) return value.items.filter(Boolean);

  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeContentType(type) {
  return String(type ?? '').trim().toLowerCase();
}

function getDisplayType(content) {
  const source = content ?? {};
  const type = normalizeContentType(source.type);
  const url = String(source.file_url ?? source.url ?? '').toLowerCase();
  const title = String(source.title ?? '').toLowerCase();

  if (type === 'file' && (url.endsWith('.pdf') || title.includes('pdf'))) {
    return 'pdf';
  }

  return type || 'file';
}

function getFailureMessage(label, error) {
  return error?.message ? `${label}: ${error.message}` : label;
}

async function loadOptionalArray(path, label) {
  try {
    return {
      items: toArray(await apiRequest(path)),
      warning: '',
    };
  } catch (error) {
    return {
      items: [],
      warning: getFailureMessage(label, error),
    };
  }
}

function normalizeLessonContent(content, quizzes = [], classId) {
  const source = content ?? {};
  const displayType = getDisplayType(source);
  const rawQuizRef = source.quiz_id ?? source.content ?? source.file_url;
  const matchedQuiz =
    displayType === 'quiz'
      ? quizzes.find(
          (quiz) =>
            quiz.id === rawQuizRef ||
            String(rawQuizRef ?? '').includes(quiz.id) ||
            String(quiz.title ?? '').toLowerCase() ===
              String(source.title ?? '').toLowerCase(),
        )
      : null;

  return {
    id: source.id,
    lessonId: source.lesson_id,
    type: normalizeContentType(source.type),
    displayType,
    title: source.title ?? 'Tài nguyên chưa có tiêu đề',
    content: source.content,
    fileUrl: source.file_url,
    openUrl: source.open_url,
    duration: source.duration,
    orderIndex: source.order_index ?? 0,
    quizId: matchedQuiz?.id ?? null,
    quizUrl: matchedQuiz ? `/courses/${classId}/quizzes/${matchedQuiz.id}` : null,
  };
}

function buildResourceGroups(sections, quizzes, classId) {
  const lessonResources = toArray(sections).flatMap((section) =>
    toArray(section.lessons).flatMap((lesson) =>
      toArray(lesson.contents).map((content) => ({
        ...content,
        sectionTitle: section.title,
        lessonTitle: lesson.title,
      })),
    ),
  );

  const quizResources = toArray(quizzes).map((quiz) => ({
    id: quiz.id,
    title: quiz.title ?? 'Quiz chưa có tiêu đề',
    description: quiz.description,
    displayType: 'quiz',
    quizId: quiz.id,
    quizUrl: `/courses/${classId}/quizzes/${quiz.id}`,
    meta: `${quiz.total_questions ?? 0} câu hỏi · ${quiz.time_limit ?? 0} phút`,
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
      description: 'Danh sách quiz lấy theo class từ API',
      items: quizResources,
    },
  ];
}

function normalizeCourse(course) {
  if (!course || typeof course !== 'object') return null;

  return {
    id: course.id,
    title: course.name ?? course.title ?? 'Khóa học chưa có tiêu đề',
    code: course.join_code ?? course.code ?? String(course.id ?? '').slice(-6),
    category: course.type ?? 'Khóa học',
    image: course.avatar_url ?? course.image ?? defaultCourseImage,
    description: course.description ?? '',
    startDate: course.created_at?.slice?.(0, 10) ?? '',
  };
}

function getAssignmentStatus(assignment) {
  if (!assignment.due_date) return 'no-due';

  const dueDate = new Date(assignment.due_date);
  if (Number.isNaN(dueDate.getTime())) return 'no-due';

  return dueDate < new Date() ? 'overdue' : 'open';
}

function normalizeAssignment(assignment) {
  if (!assignment || typeof assignment !== 'object') return null;

  return {
    id: assignment.id,
    classId: assignment.class_id,
    title: assignment.title ?? 'BTVN chưa có tiêu đề',
    description: assignment.description ?? '',
    dueDate: assignment.due_date ?? null,
    createdAt: assignment.created_at ?? null,
    status: getAssignmentStatus(assignment),
    attachments: toArray(assignment.attachments).map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.file_url,
      originalName: attachment.original_name ?? attachment.file_name ?? 'File đính kèm',
      mimeType: attachment.mime_type,
      size: attachment.size,
    })),
  };
}

export async function getCourseDetailFromApi(courseId) {
  const course = await apiRequest(`/classes/${courseId}`);
  const normalizedCourse = normalizeCourse(course);

  if (!normalizedCourse) {
    throw new Error('Không tìm thấy thông tin khóa học.');
  }

  const [sectionsResult, contentsResult, quizzesResult, assignmentsResult] =
    await Promise.all([
      loadOptionalArray(`/sections/class/${courseId}`, 'Không tải được danh sách phần'),
      loadOptionalArray('/lesson-contents', 'Không tải được tài nguyên bài học'),
      loadOptionalArray(`/quizzes/class/${courseId}`, 'Không tải được danh sách quiz'),
      loadOptionalArray(`/assignments/class/${courseId}`, 'Không tải được danh sách BTVN'),
    ]);

  const rawSections = sectionsResult.items;
  const lessonResults = await Promise.all(
    rawSections.map(async (section) => {
      try {
        return {
          lessons: toArray(await apiRequest(`/lessons/section/${section.id}`)),
          warning: '',
        };
      } catch (error) {
        return {
          lessons: [],
          warning: getFailureMessage(
            `Không tải được bài học của phần ${section.title ?? section.id}`,
            error,
          ),
        };
      }
    }),
  );

  const quizzes = quizzesResult.items;
  const warnings = [
    sectionsResult.warning,
    contentsResult.warning,
    quizzesResult.warning,
    assignmentsResult.warning,
    ...lessonResults.map((result) => result.warning),
  ].filter(Boolean);

  const lessonsBySection = lessonResults.map((result) => result.lessons);
  const lessonIds = new Set(lessonsBySection.flat().map((lesson) => lesson.id));
  const contentsByLessonId = contentsResult.items
    .filter((content) => lessonIds.has(content.lesson_id))
    .reduce((acc, content) => {
      const list = acc.get(content.lesson_id) ?? [];
      list.push(normalizeLessonContent(content, quizzes, courseId));
      acc.set(content.lesson_id, list);
      return acc;
    }, new Map());

  const sections = rawSections.map((section, index) => {
    const lessons = (lessonsBySection[index] ?? []).map((lesson) => {
      const contents = (contentsByLessonId.get(lesson.id) ?? []).sort(
        (left, right) => left.orderIndex - right.orderIndex,
      );

      return {
        id: lesson.id,
        title: lesson.title ?? 'Bài học chưa có tiêu đề',
        description: lesson.description ?? '',
        duration: lesson.duration ? `${lesson.duration} phút` : 'Chưa cập nhật',
        contentCount: contents.length,
        contentTypes: contents.map((item) => item.displayType),
        contents,
        status: 'todo',
      };
    });

    return {
      id: section.id,
      title: section.title ?? 'Phần chưa có tiêu đề',
      orderIndex: section.order_index ?? index + 1,
      lessonCount: lessons.length,
      lessons,
    };
  });

  const flatLessons = sections.flatMap((section) => section.lessons);

  return {
    course: normalizedCourse,
    sections,
    lessons: flatLessons,
    discussions: [],
    resources: buildResourceGroups(sections, quizzes, courseId),
    quizzes,
    assignments: assignmentsResult.items.map(normalizeAssignment).filter(Boolean),
    warnings,
    progress: {
      progressPercent: 0,
      completed: 0,
      inProgress: 0,
      todo: flatLessons.length,
    },
  };
}
