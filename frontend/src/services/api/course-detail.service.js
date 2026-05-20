import { apiRequest } from './client';

const defaultCourseImage = 'https://via.placeholder.com/400x225';

function normalizeContentType(type) {
  return String(type ?? '').trim().toLowerCase();
}

function getDisplayType(content) {
  const type = normalizeContentType(content.type);
  const url = String(content.file_url ?? content.url ?? '').toLowerCase();
  const title = String(content.title ?? '').toLowerCase();

  if (type === 'file' && (url.endsWith('.pdf') || title.includes('pdf'))) {
    return 'pdf';
  }

  return type || 'file';
}

function normalizeLessonContent(content, quizzes = [], classId) {
  const displayType = getDisplayType(content);
  const rawQuizRef = content.quiz_id ?? content.content ?? content.file_url;
  const matchedQuiz =
    displayType === 'quiz'
      ? quizzes.find(
          (quiz) =>
            quiz.id === rawQuizRef ||
            String(rawQuizRef ?? '').includes(quiz.id) ||
            quiz.title?.toLowerCase() === content.title?.toLowerCase(),
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
    openUrl: content.open_url,
    duration: content.duration,
    orderIndex: content.order_index ?? 0,
    quizId: matchedQuiz?.id ?? null,
    quizUrl: matchedQuiz ? `/courses/${classId}/quizzes/${matchedQuiz.id}` : null,
  };
}

function buildResourceGroups(sections, quizzes, classId) {
  const lessonResources = sections.flatMap((section) =>
    section.lessons.flatMap((lesson) =>
      lesson.contents.map((content) => ({
        ...content,
        sectionTitle: section.title,
        lessonTitle: lesson.title,
      })),
    ),
  );

  const quizResources = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    displayType: 'quiz',
    quizId: quiz.id,
    quizUrl: `/courses/${classId}/quizzes/${quiz.id}`,
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
      description: 'Danh sách quiz lấy theo class từ API',
      items: quizResources,
    },
  ];
}

function normalizeCourse(course) {
  return {
    id: course.id,
    title: course.name ?? course.title,
    code: course.join_code ?? course.code ?? course.id?.slice(-6),
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

export async function getCourseDetailFromApi(courseId) {
  const [course, rawSections, allContents, quizzes, assignments] = await Promise.all([
    apiRequest(`/classes/${courseId}`),
    apiRequest(`/sections/class/${courseId}`),
    apiRequest('/lesson-contents'),
    apiRequest(`/quizzes/class/${courseId}`).catch(() => []),
    apiRequest(`/assignments/class/${courseId}`).catch(() => []),
  ]);

  const lessonsBySection = await Promise.all(
    (rawSections ?? []).map((section) => apiRequest(`/lessons/section/${section.id}`)),
  );

  const lessonIds = new Set(lessonsBySection.flat().map((lesson) => lesson.id));
  const contentsByLessonId = (allContents ?? [])
    .filter((content) => lessonIds.has(content.lesson_id))
    .reduce((acc, content) => {
      const list = acc.get(content.lesson_id) ?? [];
      list.push(normalizeLessonContent(content, quizzes ?? [], courseId));
      acc.set(content.lesson_id, list);
      return acc;
    }, new Map());

  const sections = (rawSections ?? []).map((section, index) => {
    const lessons = (lessonsBySection[index] ?? []).map((lesson) => {
      const contents = (contentsByLessonId.get(lesson.id) ?? []).sort(
        (left, right) => left.orderIndex - right.orderIndex,
      );

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration ? `${lesson.duration} phút` : 'Chưa cập nhật',
        contentCount: contents.length,
        contentTypes: contents.map((item) => item.displayType),
        contents,
        status: 'todo',
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

  const flatLessons = sections.flatMap((section) => section.lessons);

  return {
    course: normalizeCourse(course),
    sections,
    lessons: flatLessons,
    discussions: [],
    resources: buildResourceGroups(sections, quizzes ?? [], courseId),
    quizzes: quizzes ?? [],
    assignments: (assignments ?? []).map(normalizeAssignment),
    progress: {
      progressPercent: 0,
      completed: 0,
      inProgress: 0,
      todo: flatLessons.length,
    },
  };
}
