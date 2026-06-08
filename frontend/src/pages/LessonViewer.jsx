import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardList,
  File,
  FileText,
} from 'lucide-react';
import { markLessonCompleted } from '../services/api/lessons.service';
import { toAbsoluteFileUrl } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';
import {
  getCourseDetailData,
  getCourseDetailFromApi,
  USE_MOCK_DATA,
} from '../services/dataSource';

// ── Helpers ────────────────────────────────────────────────────────────────────
function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url ?? '');
}

function getYouTubeEmbedUrl(url) {
  const match = (url ?? '').match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
}

// ── Content renderer ───────────────────────────────────────────────────────────
function LessonContent({ lesson, courseId }) {
  if (!lesson) return null;

  // Prefer the first normalized content item; fall back to lesson's own fields
  const primary = lesson.contents?.[0] ?? null;
  const type = primary?.displayType ?? primary?.type ?? lesson.type ?? 'text';
  const rawFileUrl = primary?.fileUrl ?? (lesson.fileUrl ? toAbsoluteFileUrl(lesson.fileUrl) : null);
  const fileUrl = rawFileUrl;

  if (type === 'video') {
    if (!fileUrl) {
      return <EmptyContent message="Chưa có file video." />;
    }
    if (isYouTubeUrl(fileUrl)) {
      const embedUrl = getYouTubeEmbedUrl(fileUrl);
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={lesson.title}
          />
        </div>
      );
    }
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video src={fileUrl} controls className="h-full w-full" title={lesson.title} />
      </div>
    );
  }

  if (type === 'pdf' || (type === 'file' && fileUrl?.toLowerCase().endsWith('.pdf'))) {
    if (!fileUrl) return <EmptyContent message="Chưa có file PDF." />;
    return (
      <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <iframe src={fileUrl} className="h-full w-full" title={lesson.title} />
      </div>
    );
  }

  if (type === 'file' && fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
        <File className="mb-4 h-12 w-12 text-slate-400" />
        <p className="mb-4 text-sm text-slate-500">Tệp đính kèm</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Tải xuống / Mở tệp
        </a>
      </div>
    );
  }

  if (type === 'text') {
    const isDocx = fileUrl && /\.(docx?|odt)$/i.test(fileUrl);
    if (isDocx) {
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return (
        <div className="h-[75vh] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <iframe src={viewerUrl} className="h-full w-full" title={lesson.title} />
        </div>
      );
    }
    const textContent = primary?.content ?? lesson.content;
    if (!textContent) return <EmptyContent message="Chưa có nội dung." />;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {textContent}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'quiz') {
    const quizId = primary?.quizId ?? lesson.quizId;
    const quizUrl = primary?.quizUrl ?? (quizId ? `/courses/${courseId}/quizzes/${quizId}` : null);
    if (!quizId) return <EmptyContent message="Quiz chưa được liên kết." />;
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-indigo-200 bg-indigo-50 py-20 dark:border-indigo-400/30 dark:bg-indigo-400/10">
        <ClipboardList className="mb-4 h-14 w-14 text-indigo-400" />
        <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
          {lesson.title}
        </h2>
        {lesson.description && (
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>
        )}
        <Link
          to={quizUrl}
          className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Bắt đầu làm bài →
        </Link>
      </div>
    );
  }

  return <EmptyContent message="Loại nội dung không được hỗ trợ." />;
}

function EmptyContent({ message }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700">
      {message}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

    if (USE_MOCK_DATA) {
      const data = getCourseDetailData(courseId, currentUser?.id);
      setCourseData(data);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getCourseDetailFromApi(courseId, {
          includeProgress: currentUser?.role === 'STUDENT',
        });
        if (isMounted) {
          setCourseData(data);
        }
      } catch (err) {
        if (isMounted) setError(err?.message || 'Không tải được khóa học.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => { isMounted = false; };
  }, [courseId, currentUser?.id, currentUser?.role, reloadToken]);

  const sections = useMemo(() => courseData?.sections ?? [], [courseData?.sections]);
  const flatLessons = useMemo(() => sections.flatMap((s) => s.lessons), [sections]);

  const activeLesson = useMemo(
    () => flatLessons.find((l) => String(l.id) === String(lessonId)) ?? flatLessons[0] ?? null,
    [flatLessons, lessonId],
  );

  const activeLessonIndex = useMemo(
    () => flatLessons.findIndex((l) => String(l.id) === String(activeLesson?.id)),
    [flatLessons, activeLesson],
  );

  const prevLesson = activeLessonIndex > 0 ? flatLessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex < flatLessons.length - 1 ? flatLessons[activeLessonIndex + 1] : null;

  const goToLesson = (lesson) =>
    navigate(`/courses/${courseId}/lessons/${lesson.id}`);

  const handleMarkDone = async () => {
    if (!activeLesson || currentUser?.role !== 'STUDENT') return;
    setMarkingDone(true);
    try {
      await markLessonCompleted(activeLesson.id);
      setReloadToken((t) => t + 1);
      if (nextLesson) goToLesson(nextLesson);
    } finally {
      setMarkingDone(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-rose-500">{error}</p>
        <Link
          to={`/courses/${courseId}`}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Quay lại khóa học
        </Link>
      </div>
    );
  }

  const completedCount = flatLessons.filter((l) => l.status === 'done').length;
  const progressPct =
    flatLessons.length > 0
      ? Math.round((completedCount / flatLessons.length) * 100)
      : 0;

  const activeSection = sections.find((s) =>
    s.lessons.some((l) => l.id === activeLesson?.id),
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* ── Top breadcrumb bar ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm">
          <Link
            to={`/courses/${courseId}`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← {courseData?.course?.title ?? 'Khóa học'}
          </Link>
          {activeSection && (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-500 dark:text-slate-400">{activeSection.title}</span>
            </>
          )}
          {activeLesson && (
            <>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{activeLesson.title}</span>
            </>
          )}
          {/* Progress */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-400">{completedCount}/{flatLessons.length} bài đã học</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable content area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <LessonContent lesson={activeLesson} courseId={courseId} />

          {activeLesson && (
            <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {activeLesson.title}
                  </h1>
                  {activeLesson.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {activeLesson.description}
                    </p>
                  )}
                </div>
                {activeLesson.status === 'done' && (
                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã học
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="h-8" />
        </div>
      </div>

      {/* ── Bottom navigation bar ───────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          {prevLesson ? (
            <button
              type="button"
              onClick={() => goToLesson(prevLesson)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
            >
              ← Bài trước
            </button>
          ) : (
            <div />
          )}

          {currentUser?.role === 'STUDENT' && activeLesson?.status !== 'done' && (
            <button
              type="button"
              disabled={markingDone}
              onClick={handleMarkDone}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
            >
              {markingDone ? 'Đang lưu...' : '✓ Đánh dấu đã học'}
            </button>
          )}

          {nextLesson ? (
            <button
              type="button"
              onClick={() => goToLesson(nextLesson)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Bài tiếp theo →
            </button>
          ) : (
            <Link
              to={`/courses/${courseId}`}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Hoàn thành ✓
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
