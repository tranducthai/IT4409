import {
    CalendarClock,
    ClipboardList,
    ExternalLink,
    File,
    FileText,
    Paperclip,
    Video,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Link, useParams } from 'react-router-dom';
import {
    createAssignment,
    deleteAssignment,
    updateAssignment,
} from '../services/api/assignments.service';
import { getTeacherClassProgress } from '../services/api/classes.service';
import {
    createClassFolder,
    deleteClassFolder,
    deleteClassResource,
    getClassFolders,
    getClassResources,
    uploadClassResource,
} from '../services/api/class-resources.service';
import {
    createDiscussion,
    deleteDiscussion,
    getDiscussionsByClass,
    updateDiscussion,
} from '../services/api/discussions.service';
import { uploadLessonContentFile } from '../services/api/lesson-contents.service';
import {
    createLesson,
    deleteLesson,
    updateLesson,
} from '../services/api/lessons.service';
import {
    createMessage,
    deleteMessage,
    getMessagesByDiscussion,
    updateMessage,
} from '../services/api/messages.service';
import {
    createSection,
    deleteSection,
    updateSection,
} from '../services/api/sections.service';
import { API_BASE_URL, getAccessToken, toAbsoluteFileUrl } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';
import {
    getMySubmissionsByAssignment,
    getSubmissionsByAssignment,
    gradeSubmission,
    submitAssignment,
} from '../services/api/submissions.service';
import {
    createMockQuiz,
    createQuiz,
    getCourseDetailData,
    getCourseDetailFromApi,
    USE_MOCK_DATA,
} from '../services/dataSource';

const statusStyles = {
  done: 'bg-emerald-100 text-emerald-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  todo: 'bg-slate-100 text-slate-600',
};

const statusLabels = {
  done: 'Đã học',
  'in-progress': 'Đang học',
  todo: 'Chưa học',
};

const tabOptions = [
  { key: 'lessons', label: 'Bài học' },
  { key: 'assignments', label: 'BTVN' },
  { key: 'resources', label: 'Tài nguyên' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'discussions', label: 'Thảo luận' },
];

const resourceTypeMeta = {
  text: {
    label: 'Văn bản',
    icon: FileText,
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200',
  },
  pdf: {
    label: 'PDF',
    icon: File,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200',
  },
  file: {
    label: 'Tệp',
    icon: File,
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  video: {
    label: 'Video',
    icon: Video,
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200',
  },
  quiz: {
    label: 'Quiz',
    icon: ClipboardList,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200',
  },
};

const lessonTypeOptions = [
  { value: 'text', label: 'Văn bản' },
  { value: 'video', label: 'Video' },
  { value: 'file', label: 'Tệp' },
  { value: 'quiz', label: 'Quiz' },
];

const assignmentStatusMeta = {
  open: {
    label: 'Đang mở',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200',
  },
  overdue: {
    label: 'Quá hạn',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200',
  },
  'no-due': {
    label: 'Chưa đặt hạn',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
};

const initialQuizForm = {
  title: '',
  description: '',
  timeLimit: 15,
  totalQuestions: 10,
  isRandom: false,
};

function formatDueDate(value) {
  if (!value) return 'Chưa đặt hạn nộp';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa đặt hạn nộp';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function toLocalDatetimeInput(utcString) {
  if (!utcString) return '';
  const d = new Date(utcString);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function formatChatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
        ' ' +
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function createQuizResource(quiz, courseId) {
  return {
    id: quiz.id,
    title: quiz.title ?? 'Quiz chưa có tiêu đề',
    description: quiz.description ?? '',
    displayType: 'quiz',
    quizId: quiz.id,
    quizUrl: `/courses/${courseId}/quizzes/${quiz.id}`,
    meta: `${quiz.total_questions ?? quiz.totalQuestions ?? 0} câu hỏi · ${quiz.time_limit ?? quiz.timeLimit ?? 0} phút`,
  };
}

function appendQuizToCourseData(data, quiz, courseId) {
  if (!data) return data;

  const normalizedQuiz = {
    ...quiz,
    class_id: quiz.class_id ?? courseId,
    total_questions: quiz.total_questions ?? quiz.totalQuestions ?? 0,
    time_limit: quiz.time_limit ?? quiz.timeLimit ?? 0,
  };
  const quizResource = createQuizResource(normalizedQuiz, courseId);
  const resources = (data.resources ?? []).map((group) =>
    group.id === 'class-quizzes'
      ? {
          ...group,
          items: [quizResource, ...(group.items ?? [])],
        }
      : group,
  );
  const hasQuizGroup = resources.some((group) => group.id === 'class-quizzes');

  return {
    ...data,
    quizzes: [normalizedQuiz, ...(data.quizzes ?? [])],
    resources: hasQuizGroup
      ? resources
      : [
          ...(data.resources ?? []),
          {
            id: 'class-quizzes',
            title: 'Quiz của lớp',
            description: 'Danh sách quiz lấy theo class từ API',
            items: [quizResource],
          },
        ],
  };
}

function ResourceCard({ resource, compact = false }) {
  if (typeof resource === 'string') {
    return (
      <div className="rounded-lg border border-white bg-white px-3 py-2 text-sm shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        {resource}
      </div>
    );
  }

  const type = resource.displayType ?? resource.type ?? 'file';
  const meta = resourceTypeMeta[type] ?? resourceTypeMeta.file;
  const Icon = meta.icon;
  const actionUrl =
    type === 'quiz'
      ? resource.quizUrl
      : resource.fileUrl ?? resource.openUrl ?? resource.url;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.badgeClass}`}>
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
            {resource.meta && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {resource.meta}
              </span>
            )}
          </div>
          <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
            {resource.title}
          </p>
          {resource.lessonTitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {resource.sectionTitle} · {resource.lessonTitle}
            </p>
          )}
          {resource.content && type === 'text' && (
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {resource.content}
            </p>
          )}
          {resource.description && compact && (
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {resource.description}
            </p>
          )}
        </div>

        {actionUrl ? (
          type === 'quiz' ? (
            <Link
              to={actionUrl}
              className="action-btn inline-flex h-8 flex-shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Mở
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <a
              href={actionUrl}
              target="_blank"
              rel="noreferrer"
              className="action-btn inline-flex h-8 flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-200"
            >
              Mở
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )
        ) : (
          <span className="flex-shrink-0 rounded-lg border border-dashed border-slate-200 px-2.5 py-2 text-xs text-slate-400 dark:border-slate-700">
            Chưa có liên kết
          </span>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const statusMeta =
    assignmentStatusMeta[assignment.status] ?? assignmentStatusMeta['no-due'];
  const attachments = assignment.attachments ?? [];

  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {assignment.title}
          </p>
          {assignment.description && (
            <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
              {assignment.description}
            </p>
          )}
        </div>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          Hạn nộp: {formatDueDate(assignment.dueDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Paperclip className="h-3.5 w-3.5" />
          {attachments.length} tệp
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="action-btn inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {attachment.originalName}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const currentUser = getCurrentUser();
  const [courseData, setCourseData] = useState(() =>
    USE_MOCK_DATA ? getCourseDetailData(courseId, currentUser?.id) : null,
  );
  const [isLoading, setIsLoading] = useState(!USE_MOCK_DATA);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [reloadToken, setReloadToken] = useState(0);
  const [quizForm, setQuizForm] = useState(initialQuizForm);
  const [quizFormError, setQuizFormError] = useState('');
  const [quizFormSuccess, setQuizFormSuccess] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', orderIndex: 1 });
  const [sectionFormError, setSectionFormError] = useState('');
  const [sectionFormSuccess, setSectionFormSuccess] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionForm, setEditingSectionForm] = useState({
    title: '',
    orderIndex: 1,
  });
  const [editingSectionError, setEditingSectionError] = useState('');
  const [lessonForms, setLessonForms] = useState({});
  const [lessonFormErrors, setLessonFormErrors] = useState({});
  const [lessonUploadState, setLessonUploadState] = useState({});
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonForm, setEditingLessonForm] = useState({
    title: '',
    description: '',
    type: 'text',
    orderIndex: 1,
    duration: '',
    fileUrl: '',
    content: '',
    quizId: '',
  });
  const [editingLessonError, setEditingLessonError] = useState('');
  const [editingLessonUpload, setEditingLessonUpload] = useState({
    isUploading: false,
    error: '',
  });
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
  });
  const [discussionError, setDiscussionError] = useState('');
  const [discussionSuccess, setDiscussionSuccess] = useState('');
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [discussionMessagesError, setDiscussionMessagesError] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageForm, setMessageForm] = useState('');
  const [messageError, setMessageError] = useState('');
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [editingDiscussionForm, setEditingDiscussionForm] = useState({
    title: '',
    content: '',
  });
  const [editingDiscussionError, setEditingDiscussionError] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [editingMessageError, setEditingMessageError] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    files: [],
  });
  const [assignmentFormError, setAssignmentFormError] = useState('');
  const [assignmentFormSuccess, setAssignmentFormSuccess] = useState('');
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editingAssignmentForm, setEditingAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [editingAssignmentError, setEditingAssignmentError] = useState('');
  const [submissionForms, setSubmissionForms] = useState({});
  const [submissionErrors, setSubmissionErrors] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState({});
  const [submissionHistory, setSubmissionHistory] = useState({});
  const [submissionLoading, setSubmissionLoading] = useState({});
  const [gradingForms, setGradingForms] = useState({});
  const [gradingErrors, setGradingErrors] = useState({});
  const [gradingSuccess, setGradingSuccess] = useState({});
  const [teacherProgress, setTeacherProgress] = useState(null);
  const [teacherProgressLoading, setTeacherProgressLoading] = useState(false);
  const [teacherProgressError, setTeacherProgressError] = useState('');
  const chatSocketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [classResources, setClassResources] = useState([]);
  const [classFolders, setClassFolders] = useState([]);
  const [classResourcesLoading, setClassResourcesLoading] = useState(false);
  const [classResourcesError, setClassResourcesError] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [resourceUploadFile, setResourceUploadFile] = useState(null);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourceUploadError, setResourceUploadError] = useState('');
  const [resourceUploadSuccess, setResourceUploadSuccess] = useState('');
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);
  const [folderCreateError, setFolderCreateError] = useState('');
  const [showFolderForm, setShowFolderForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (USE_MOCK_DATA) {
      setCourseData(getCourseDetailData(courseId, currentUser?.id));
      setIsLoading(false);
      setError('');
      return () => {
        isMounted = false;
      };
    }

    const loadCourseDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getCourseDetailFromApi(courseId);
        if (isMounted) setCourseData(data);
      } catch (err) {
        if (isMounted) {
          setCourseData(null);
          setError(err?.message || 'Không tải được chi tiết khóa học.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadCourseDetail();

    return () => {
      isMounted = false;
    };
  }, [courseId, currentUser?.id, reloadToken]);

  const { course } = courseData ?? {};
  const sectionItems = courseData?.sections ?? [];
  const lessonItems = courseData?.lessons ?? [];
  const resourceItems = courseData?.resources ?? [];
  const assignmentItems = courseData?.assignments ?? [];
  const discussionItems = useMemo(
    () => courseData?.discussions ?? [],
    [courseData],
  );
  const warningItems = courseData?.warnings ?? [];
  const progress = courseData?.progress ?? {
    progressPercent: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
  };
  const canManageLessons = currentUser?.role === 'TEACHER';
  const canManageAssignments = currentUser?.role === 'TEACHER';
  const assignmentIds = useMemo(
    () => assignmentItems.map((a) => a.id).join(','),
    [assignmentItems],
  );
  const handleRetry = () => setReloadToken((value) => value + 1);
  const canManageQuizzes = currentUser?.role === 'TEACHER';

  useEffect(() => {
    setSectionForm((prev) => ({
      ...prev,
      orderIndex: Math.max(1, sectionItems.length + 1),
    }));
  }, [sectionItems.length]);

  useEffect(() => {
    if (!discussionItems.length) {
      setSelectedDiscussionId(null);
      return;
    }
    if (!selectedDiscussionId) {
      setSelectedDiscussionId(discussionItems[0].id);
    }
  }, [discussionItems, selectedDiscussionId]);

  useEffect(() => {
    if (selectedDiscussionId) {
      void loadMessages(selectedDiscussionId);
    }
  }, [selectedDiscussionId]);

  useEffect(() => {
    if (!canManageAssignments || activeTab !== 'progress' || USE_MOCK_DATA) {
      return;
    }
    let isMounted = true;
    const loadTeacherProgress = async () => {
      setTeacherProgressLoading(true);
      setTeacherProgressError('');
      try {
        const data = await getTeacherClassProgress(courseId);
        if (isMounted) setTeacherProgress(data);
      } catch (err) {
        if (isMounted) {
          setTeacherProgress(null);
          setTeacherProgressError(err?.message || 'Không tải được tiến độ lớp.');
        }
      } finally {
        if (isMounted) setTeacherProgressLoading(false);
      }
    };

    void loadTeacherProgress();

    return () => {
      isMounted = false;
    };
  }, [activeTab, canManageAssignments, courseId, reloadToken]);

  useEffect(() => {
    if (activeTab !== 'resources' || USE_MOCK_DATA) return;
    let isMounted = true;
    const load = async () => {
      setClassResourcesLoading(true);
      setClassResourcesError('');
      try {
        const [files, folders] = await Promise.all([
          getClassResources(courseId),
          getClassFolders(courseId),
        ]);
        if (isMounted) {
          setClassResources(files ?? []);
          setClassFolders(folders ?? []);
        }
      } catch (err) {
        if (isMounted) setClassResourcesError(err?.message || 'Không tải được tài nguyên.');
      } finally {
        if (isMounted) setClassResourcesLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, [activeTab, courseId, reloadToken]);

  const handleResourceUpload = async (event) => {
    event.preventDefault();
    if (!resourceUploadFile) return;
    setResourceUploading(true);
    setResourceUploadError('');
    setResourceUploadSuccess('');
    try {
      const created = await uploadClassResource(courseId, resourceUploadFile, currentFolderId);
      setClassResources((prev) => [created, ...prev]);
      setResourceUploadFile(null);
      setResourceUploadSuccess('Tải lên thành công.');
      event.target.reset();
    } catch (err) {
      setResourceUploadError(err?.message || 'Tải lên thất bại.');
    } finally {
      setResourceUploading(false);
    }
  };

  const handleDeleteClassResource = async (resourceId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài nguyên này?')) return;
    try {
      await deleteClassResource(resourceId);
      setClassResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      setClassResourcesError(err?.message || 'Không xóa được tài nguyên.');
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    const name = folderNameInput.trim();
    if (!name) return;
    setFolderCreating(true);
    setFolderCreateError('');
    try {
      const folder = await createClassFolder(courseId, name);
      setClassFolders((prev) => [...prev, folder]);
      setFolderNameInput('');
      setShowFolderForm(false);
    } catch (err) {
      setFolderCreateError(err?.message || 'Không tạo được thư mục.');
    } finally {
      setFolderCreating(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Xóa thư mục này? Thư mục phải trống mới xóa được.')) return;
    try {
      await deleteClassFolder(folderId);
      setClassFolders((prev) => prev.filter((f) => f.id !== folderId));
      if (currentFolderId === folderId) setCurrentFolderId(null);
    } catch (err) {
      setClassResourcesError(err?.message || 'Không xóa được thư mục.');
    }
  };

  useEffect(() => {
    if (activeTab !== 'assignments' || USE_MOCK_DATA || !assignmentIds) return;
    assignmentIds.split(',').filter(Boolean).forEach((id) => {
      if (!submissionHistory[id]) {
        void loadSubmissionHistory(id);
      }
    });
  }, [activeTab, assignmentIds]);

  // ── WebSocket chat ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'discussions' || USE_MOCK_DATA) return;

    const backendOrigin = new URL(API_BASE_URL).origin;
    const socket = io(`${backendOrigin}/chat`, {
      auth: { token: getAccessToken() ?? '' },
      transports: ['websocket', 'polling'],
    });
    chatSocketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', () => setSocketConnected(false));

    socket.on('newMessage', (msg) => {
      setDiscussionMessages((prev) =>
        prev.find((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    });

    return () => {
      socket.disconnect();
      chatSocketRef.current = null;
      setSocketConnected(false);
    };
  }, [activeTab]);

  // Join/leave discussion room
  useEffect(() => {
    const socket = chatSocketRef.current;
    if (!socket || !socketConnected || !selectedDiscussionId) return;
    socket.emit('joinDiscussion', selectedDiscussionId);
    return () => {
      if (socket.connected) socket.emit('leaveDiscussion', selectedDiscussionId);
    };
  }, [socketConnected, selectedDiscussionId]);
  // ────────────────────────────────────────────────────────────────────────────

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussionMessages]);

  const handleQuizFormChange = (field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setQuizFormError('');
    setQuizFormSuccess('');

    const title = quizForm.title.trim();
    if (!title) {
      setQuizFormError('Vui lòng nhập tiêu đề quiz.');
      return;
    }

    const timeLimit = Math.max(1, Number(quizForm.timeLimit) || 1);
    const totalQuestions = Math.max(0, Number(quizForm.totalQuestions) || 0);
    const payload = {
      title,
      description: quizForm.description.trim() || undefined,
      time_limit: timeLimit,
      total_questions: totalQuestions,
      class_id: courseId,
      is_random: Boolean(quizForm.isRandom),
    };

    setIsCreatingQuiz(true);
    try {
      if (USE_MOCK_DATA) {
        const mockQuiz = {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `mock-quiz-${Date.now()}`,
          ...payload,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
        };
        createMockQuiz(mockQuiz);
        setCourseData((prev) => appendQuizToCourseData(prev, mockQuiz, courseId));
      } else {
        await createQuiz(payload);
        setReloadToken((value) => value + 1);
      }

      setQuizForm(initialQuizForm);
      setQuizFormSuccess('Đã tạo quiz mới.');
    } catch (err) {
      setQuizFormError(err?.message || 'Không tạo được quiz.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const defaultLessonForm = {
    title: '',
    description: '',
    type: 'text',
    orderIndex: 1,
    duration: '',
    fileUrl: '',
    content: '',
    quizId: '',
  };

  const handleSectionFormChange = (field, value) => {
    setSectionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSection = async (event) => {
    event.preventDefault();
    setSectionFormError('');
    setSectionFormSuccess('');

    if (USE_MOCK_DATA) {
      setSectionFormError('Chế độ mock chưa hỗ trợ tạo phần mới.');
      return;
    }

    const title = sectionForm.title.trim();
    const orderIndex = Math.max(1, Number(sectionForm.orderIndex) || 1);
    if (!title) {
      setSectionFormError('Vui lòng nhập tiêu đề phần.');
      return;
    }

    try {
      await createSection({
        class_id: courseId,
        title,
        order_index: orderIndex,
      });
      setSectionForm({ title: '', orderIndex: orderIndex + 1 });
      setSectionFormSuccess('Đã tạo phần mới.');
      setReloadToken((value) => value + 1);
    } catch (err) {
      setSectionFormError(err?.message || 'Không tạo được phần mới.');
    }
  };

  const handleDiscussionFormChange = (field, value) => {
    setDiscussionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const normalizeDiscussionItem = (item) => ({
    id: item.id,
    classId: item.class_id ?? item.classId,
    title: item.title ?? 'Thảo luận chưa có tiêu đề',
    content: item.content ?? '',
    createdBy: item.created_by ?? item.createdBy,
    createdAt: item.created_at ?? item.createdAt,
    author: item.author ?? null,
  });

  const loadDiscussions = async () => {
    if (USE_MOCK_DATA) return;
    try {
      const items = await getDiscussionsByClass(courseId);
      setCourseData((prev) =>
        prev
          ? {
              ...prev,
              discussions: (items ?? []).map(normalizeDiscussionItem),
            }
          : prev,
      );
    } catch (err) {
      setDiscussionError(err?.message || 'Không tải được danh sách thảo luận.');
    }
  };

  const handleCreateDiscussion = async (event) => {
    event.preventDefault();
    setDiscussionError('');
    setDiscussionSuccess('');

    if (USE_MOCK_DATA) {
      setDiscussionError('Chế độ mock chưa hỗ trợ tạo thảo luận.');
      return;
    }

    const title = discussionForm.title.trim();
    if (!title) {
      setDiscussionError('Vui lòng nhập tiêu đề thảo luận.');
      return;
    }

    try {
      const created = await createDiscussion({
        class_id: courseId,
        title,
        content: discussionForm.content.trim() || undefined,
      });
      setDiscussionForm({ title: '', content: '' });
      setDiscussionSuccess('Đã tạo thảo luận mới.');
      await loadDiscussions();
      if (created?.id) setSelectedDiscussionId(created.id);
    } catch (err) {
      setDiscussionError(err?.message || 'Không tạo được thảo luận.');
    }
  };

  const handleStartEditDiscussion = (discussion) => {
    setEditingDiscussionId(discussion.id);
    setEditingDiscussionForm({
      title: discussion.title ?? '',
      content: discussion.content ?? '',
    });
    setEditingDiscussionError('');
  };

  const handleUpdateDiscussion = async (event) => {
    event.preventDefault();
    setEditingDiscussionError('');

    if (USE_MOCK_DATA) {
      setEditingDiscussionError('Chế độ mock chưa hỗ trợ chỉnh sửa thảo luận.');
      return;
    }

    const title = editingDiscussionForm.title.trim();
    if (!title) {
      setEditingDiscussionError('Vui lòng nhập tiêu đề thảo luận.');
      return;
    }

    try {
      await updateDiscussion(editingDiscussionId, {
        title,
        content: editingDiscussionForm.content.trim() || undefined,
      });
      setEditingDiscussionId(null);
      await loadDiscussions();
    } catch (err) {
      setEditingDiscussionError(err?.message || 'Không cập nhật được thảo luận.');
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (USE_MOCK_DATA) {
      setDiscussionError('Chế độ mock chưa hỗ trợ xóa thảo luận.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa thảo luận này?')) return;

    try {
      await deleteDiscussion(discussionId);
      await loadDiscussions();
      if (selectedDiscussionId === discussionId) {
        setSelectedDiscussionId(null);
        setDiscussionMessages([]);
      }
    } catch (err) {
      setDiscussionError(err?.message || 'Không xóa được thảo luận.');
    }
  };

  const loadMessages = async (discussionId) => {
    if (!discussionId || USE_MOCK_DATA) return;
    setIsLoadingMessages(true);
    setDiscussionMessagesError('');
    try {
      const items = await getMessagesByDiscussion(discussionId);
      setDiscussionMessages(items ?? []);
    } catch (err) {
      setDiscussionMessagesError(err?.message || 'Không tải được tin nhắn.');
      setDiscussionMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateMessage = (event) => {
    event.preventDefault();
    setMessageError('');

    if (USE_MOCK_DATA) {
      setMessageError('Chế độ mock chưa hỗ trợ gửi tin nhắn.');
      return;
    }

    const content = messageForm.trim();
    if (!content) return;

    const socket = chatSocketRef.current;
    if (!socket || !socket.connected) {
      setMessageError('Chưa kết nối chat. Vui lòng thử lại.');
      return;
    }

    setMessageForm('');
    socket.emit(
      'sendMessage',
      { discussionId: selectedDiscussionId, content },
      (ack) => {
        if (ack?.error) setMessageError(ack.error);
      },
    );
  };

  const toIsoDate = (value) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
  };

  const handleAssignmentFormChange = (field, value) => {
    setAssignmentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateAssignment = async (event) => {
    event.preventDefault();
    setAssignmentFormError('');
    setAssignmentFormSuccess('');

    if (USE_MOCK_DATA) {
      setAssignmentFormError('Chế độ mock chưa hỗ trợ tạo BTVN.');
      return;
    }

    const title = assignmentForm.title.trim();
    if (!title) {
      setAssignmentFormError('Vui lòng nhập tiêu đề BTVN.');
      return;
    }

    try {
      await createAssignment(
        {
          class_id: courseId,
          title,
          description: assignmentForm.description.trim() || undefined,
          due_date: toIsoDate(assignmentForm.dueDate),
        },
        assignmentForm.files ?? [],
      );
      setAssignmentForm({ title: '', description: '', dueDate: '', files: [] });
      setAssignmentFormSuccess('Đã tạo BTVN mới.');
      setReloadToken((value) => value + 1);
    } catch (err) {
      setAssignmentFormError(err?.message || 'Không tạo được BTVN.');
    }
  };

  const handleStartEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditingAssignmentForm({
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      dueDate: toLocalDatetimeInput(assignment.dueDate),
    });
    setEditingAssignmentError('');
  };

  const handleUpdateAssignment = async (event) => {
    event.preventDefault();
    setEditingAssignmentError('');

    if (USE_MOCK_DATA) {
      setEditingAssignmentError('Chế độ mock chưa hỗ trợ chỉnh sửa BTVN.');
      return;
    }

    const title = editingAssignmentForm.title.trim();
    if (!title) {
      setEditingAssignmentError('Vui lòng nhập tiêu đề BTVN.');
      return;
    }

    try {
      await updateAssignment(editingAssignmentId, {
        title,
        description: editingAssignmentForm.description.trim() || undefined,
        due_date: toIsoDate(editingAssignmentForm.dueDate),
      });
      setEditingAssignmentId(null);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingAssignmentError(err?.message || 'Không cập nhật được BTVN.');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (USE_MOCK_DATA) {
      setAssignmentFormError('Chế độ mock chưa hỗ trợ xóa BTVN.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa BTVN này?')) return;

    try {
      await deleteAssignment(assignmentId);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setAssignmentFormError(err?.message || 'Không xóa được BTVN.');
    }
  };

  const updateSubmissionForm = (assignmentId, patch) => {
    setSubmissionForms((prev) => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] ?? { content: '', files: [], isOpen: false }),
        ...patch,
      },
    }));
  };

  const setSubmissionLoadState = (assignmentId, patch) => {
    setSubmissionLoading((prev) => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] ?? { isLoading: false, error: '' }),
        ...patch,
      },
    }));
  };

  const loadSubmissionHistory = async (assignmentId) => {
    if (USE_MOCK_DATA) return;
    setSubmissionLoadState(assignmentId, { isLoading: true, error: '' });
    try {
      const items = canManageAssignments
        ? await getSubmissionsByAssignment(assignmentId)
        : await getMySubmissionsByAssignment(assignmentId);
      setSubmissionHistory((prev) => ({
        ...prev,
        [assignmentId]: items ?? [],
      }));
    } catch (err) {
      setSubmissionHistory((prev) => ({
        ...prev,
        [assignmentId]: [],
      }));
      setSubmissionLoadState(assignmentId, {
        error: err?.message || 'Không tải được lịch sử nộp bài.',
      });
    } finally {
      setSubmissionLoadState(assignmentId, { isLoading: false });
    }
  };

  const handleToggleSubmission = (assignmentId) => {
    updateSubmissionForm(assignmentId, {
      isOpen: !(submissionForms[assignmentId]?.isOpen ?? false),
    });
    void loadSubmissionHistory(assignmentId);
  };

  const handleSubmitAssignment = async (event, assignmentId) => {
    event.preventDefault();
    setSubmissionErrors((prev) => ({ ...prev, [assignmentId]: '' }));
    setSubmissionSuccess((prev) => ({ ...prev, [assignmentId]: '' }));

    if (USE_MOCK_DATA) {
      setSubmissionErrors((prev) => ({
        ...prev,
        [assignmentId]: 'Chế độ mock chưa hỗ trợ nộp bài.',
      }));
      return;
    }

    try {
      const payload = submissionForms[assignmentId] ?? { content: '', files: [] };
      await submitAssignment(assignmentId, {
        content: payload.content?.trim() || undefined,
        files: payload.files ?? [],
      });
      updateSubmissionForm(assignmentId, { content: '', files: [], isOpen: false });
      setSubmissionSuccess((prev) => ({
        ...prev,
        [assignmentId]: 'Đã nộp bài thành công.',
      }));
      await loadSubmissionHistory(assignmentId);
    } catch (err) {
      setSubmissionErrors((prev) => ({
        ...prev,
        [assignmentId]: err?.message || 'Không nộp được bài.',
      }));
    }
  };

  const updateGradingForm = (submissionId, patch) => {
    setGradingForms((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] ?? { score: '', feedback: '' }),
        ...patch,
      },
    }));
  };

  const handleGradeSubmission = async (event, assignmentId, submissionId) => {
    event.preventDefault();
    setGradingErrors((prev) => ({ ...prev, [submissionId]: '' }));
    setGradingSuccess((prev) => ({ ...prev, [submissionId]: '' }));

    if (USE_MOCK_DATA) {
      setGradingErrors((prev) => ({
        ...prev,
        [submissionId]: 'Chế độ mock chưa hỗ trợ chấm điểm.',
      }));
      return;
    }

    try {
      const form = gradingForms[submissionId] ?? { score: '', feedback: '' };
      await gradeSubmission(submissionId, {
        score: form.score === '' ? undefined : Number(form.score),
        feedback: form.feedback?.trim() || undefined,
      });
      setGradingSuccess((prev) => ({
        ...prev,
        [submissionId]: 'Đã lưu điểm/nhận xét.',
      }));
      await loadSubmissionHistory(assignmentId);
    } catch (err) {
      setGradingErrors((prev) => ({
        ...prev,
        [submissionId]: err?.message || 'Không lưu được điểm.',
      }));
    }
  };

  const handleStartEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingMessageContent(message.content ?? '');
    setEditingMessageError('');
  };

  const handleUpdateMessage = async (event) => {
    event.preventDefault();
    setEditingMessageError('');

    if (USE_MOCK_DATA) {
      setEditingMessageError('Chế độ mock chưa hỗ trợ chỉnh sửa tin nhắn.');
      return;
    }

    const content = editingMessageContent.trim();
    if (!content) {
      setEditingMessageError('Vui lòng nhập nội dung tin nhắn.');
      return;
    }

    try {
      await updateMessage(editingMessageId, { content });
      setEditingMessageId(null);
      setEditingMessageContent('');
      await loadMessages(selectedDiscussionId);
    } catch (err) {
      setEditingMessageError(err?.message || 'Không cập nhật được tin nhắn.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (USE_MOCK_DATA) {
      setEditingMessageError('Chế độ mock chưa hỗ trợ xóa tin nhắn.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;

    try {
      await deleteMessage(messageId);
      await loadMessages(selectedDiscussionId);
    } catch (err) {
      setEditingMessageError(err?.message || 'Không xóa được tin nhắn.');
    }
  };

  const handleStartEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingSectionForm({
      title: section.title ?? '',
      orderIndex: section.orderIndex ?? 1,
    });
    setEditingSectionError('');
  };

  const handleUpdateSection = async (event) => {
    event.preventDefault();
    setEditingSectionError('');

    if (USE_MOCK_DATA) {
      setEditingSectionError('Chế độ mock chưa hỗ trợ chỉnh sửa phần.');
      return;
    }

    const title = editingSectionForm.title.trim();
    const orderIndex = Math.max(1, Number(editingSectionForm.orderIndex) || 1);
    if (!title) {
      setEditingSectionError('Vui lòng nhập tiêu đề phần.');
      return;
    }

    try {
      await updateSection(editingSectionId, {
        title,
        order_index: orderIndex,
      });
      setEditingSectionId(null);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingSectionError(err?.message || 'Không cập nhật được phần.');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (USE_MOCK_DATA) {
      setSectionFormError('Chế độ mock chưa hỗ trợ xóa phần.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa phần này?')) return;

    try {
      await deleteSection(sectionId);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setSectionFormError(err?.message || 'Không xóa được phần.');
    }
  };

  const updateLessonForm = (sectionId, patch) => {
    setLessonForms((prev) => {
      const current = prev[sectionId] ?? { ...defaultLessonForm };
      return {
        ...prev,
        [sectionId]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const updateLessonUploadState = (sectionId, patch) => {
    setLessonUploadState((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] ?? { isUploading: false, error: '' }),
        ...patch,
      },
    }));
  };

  const handleUploadLessonFile = async (sectionId, file) => {
    if (!file) return;
    updateLessonUploadState(sectionId, { isUploading: true, error: '' });
    try {
      const uploaded = await uploadLessonContentFile(file);
      updateLessonForm(sectionId, { fileUrl: uploaded?.file_url ?? '' });
    } catch (err) {
      updateLessonUploadState(sectionId, {
        error: err?.message || 'Không tải được file nội dung.',
      });
    } finally {
      updateLessonUploadState(sectionId, { isUploading: false });
    }
  };

  const handleCreateLesson = async (event, section) => {
    event.preventDefault();

    const fallbackOrder = (section.lessons?.length ?? 0) + 1;
    const form = lessonForms[section.id] ?? {
      ...defaultLessonForm,
      orderIndex: fallbackOrder,
    };

    setLessonFormErrors((prev) => ({ ...prev, [section.id]: '' }));

    if (USE_MOCK_DATA) {
      setLessonFormErrors((prev) => ({
        ...prev,
        [section.id]: 'Chế độ mock chưa hỗ trợ tạo bài học.',
      }));
      return;
    }

    const title = form.title.trim();
    if (!title) {
      setLessonFormErrors((prev) => ({
        ...prev,
        [section.id]: 'Vui lòng nhập tiêu đề bài học.',
      }));
      return;
    }

    if (form.type === 'quiz' && !form.quizId.trim()) {
      setLessonFormErrors((prev) => ({
        ...prev,
        [section.id]: 'Vui lòng nhập quiz id cho bài học quiz.',
      }));
      return;
    }

    try {
      await createLesson({
        section_id: section.id,
        title,
        description: form.description.trim(),
        type: form.type,
        order_index: Math.max(1, Number(form.orderIndex) || 1),
        duration: form.duration ? Math.max(1, Number(form.duration) || 1) : undefined,
        file_url: form.fileUrl.trim() || undefined,
        content: form.content.trim() || undefined,
        quiz_id: form.quizId.trim() || undefined,
      });
      setLessonForms((prev) => ({
        ...prev,
        [section.id]: {
          ...defaultLessonForm,
          orderIndex: fallbackOrder + 1,
        },
      }));
      setReloadToken((value) => value + 1);
    } catch (err) {
      setLessonFormErrors((prev) => ({
        ...prev,
        [section.id]: err?.message || 'Không tạo được bài học.',
      }));
    }
  };

  const handleStartEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonForm({
      title: lesson.title ?? '',
      description: lesson.description ?? '',
      type: lesson.type ?? 'text',
      orderIndex: lesson.orderIndex ?? 1,
      duration: lesson.durationValue ?? '',
      fileUrl: lesson.fileUrl ?? '',
      content: lesson.content ?? '',
      quizId: lesson.quizId ?? '',
    });
    setEditingLessonError('');
    setEditingLessonUpload({ isUploading: false, error: '' });
  };

  const handleUploadEditingLessonFile = async (file) => {
    if (!file) return;
    setEditingLessonUpload({ isUploading: true, error: '' });
    try {
      const uploaded = await uploadLessonContentFile(file);
      setEditingLessonForm((prev) => ({
        ...prev,
        fileUrl: uploaded?.file_url ?? '',
      }));
    } catch (err) {
      setEditingLessonUpload({
        isUploading: false,
        error: err?.message || 'Không tải được file nội dung.',
      });
      return;
    }
    setEditingLessonUpload({ isUploading: false, error: '' });
  };

  const handleUpdateLesson = async (event) => {
    event.preventDefault();
    setEditingLessonError('');

    if (USE_MOCK_DATA) {
      setEditingLessonError('Chế độ mock chưa hỗ trợ chỉnh sửa bài học.');
      return;
    }

    const title = editingLessonForm.title.trim();
    if (!title) {
      setEditingLessonError('Vui lòng nhập tiêu đề bài học.');
      return;
    }

    if (editingLessonForm.type === 'quiz' && !editingLessonForm.quizId.trim()) {
      setEditingLessonError('Vui lòng nhập quiz id cho bài học quiz.');
      return;
    }

    try {
      await updateLesson(editingLessonId, {
        title,
        description: editingLessonForm.description.trim(),
        type: editingLessonForm.type,
        order_index: Math.max(1, Number(editingLessonForm.orderIndex) || 1),
        duration: editingLessonForm.duration
          ? Math.max(1, Number(editingLessonForm.duration) || 1)
          : undefined,
        file_url: editingLessonForm.fileUrl.trim() || undefined,
        content: editingLessonForm.content.trim() || undefined,
        quiz_id: editingLessonForm.quizId.trim() || undefined,
      });
      setEditingLessonId(null);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingLessonError(err?.message || 'Không cập nhật được bài học.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (USE_MOCK_DATA) {
      setEditingLessonError('Chế độ mock chưa hỗ trợ xóa bài học.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xóa bài học này?')) return;

    try {
      await deleteLesson(lessonId);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingLessonError(err?.message || 'Không xóa được bài học.');
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Đang tải chi tiết khóa học...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <h1 className="text-2xl font-bold">Không tải được khóa học</h1>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="action-btn rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Tải lại
            </button>
            <Link to="/dashboard" className="action-btn inline-block rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-400/30 dark:bg-slate-950 dark:text-rose-200 dark:hover:bg-rose-500/10">
              Quay lại bảng điều khiển
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy khóa học</h1>
          <p className="mt-2 text-sm text-slate-500">Khóa học bạn truy cập không tồn tại trong danh sách mock hiện tại.</p>
          <Link to="/dashboard" className="action-btn mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Quay lại bảng điều khiển
          </Link>
        </div>
      </main>
    );
  }

  const totalSections = sectionItems.length;
  const totalLessons = lessonItems.length;
  const totalResources = resourceItems.reduce(
    (sum, group) => sum + (group.items?.length ?? 0),
    0,
  );
  const totalAssignments = assignmentItems.length;
  const progressPercent = Math.min(
    100,
    Math.max(0, Number(progress.progressPercent) || 0),
  );
  const teacherAssignments = teacherProgress?.assignments ?? [];
  const teacherQuizzes = teacherProgress?.quizzes ?? [];
  const totalStudents = teacherProgress?.total_students ?? 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 transition-colors md:px-8">
      <div className="mb-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr] md:p-6">
          <img
            src={course.image}
            alt={course.title}
            className="h-36 w-full rounded-xl bg-slate-100 object-contain p-3 dark:bg-slate-800 md:h-44"
          />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
              {course.category} · {course.code}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {course.description || 'Tổng quan nội dung, tài nguyên và tiến độ của khóa học.'}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Tiến độ học tập</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Phần</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalSections}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Bài học</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalLessons}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tài nguyên</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalResources}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">BTVN</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{totalAssignments}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {tabOptions.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`action-btn rounded-lg border px-3 py-2 text-sm font-semibold ${
                    activeTab === tab.key
                      ? 'border-indigo-200 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {warningItems.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 transition-colors dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="font-semibold">Một số dữ liệu của khóa học chưa tải được.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warningItems.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleRetry}
            className="action-btn mt-3 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Tải lại dữ liệu
          </button>
        </div>
      )}

      {activeTab === 'lessons' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bài học</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Danh sách bài học được nhóm theo phần</p>
          {canManageLessons && (
            <form
              className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-left transition-colors dark:border-indigo-400/30 dark:bg-indigo-400/10"
              onSubmit={handleCreateSection}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Tạo phần mới
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Thêm chương/tuần cho khóa học hiện tại.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-slate-950 dark:text-indigo-200">
                  Giảng viên
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Tiêu đề phần"
                  value={sectionForm.title}
                  onChange={(event) => handleSectionFormChange('title', event.target.value)}
                  required
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  min="1"
                  placeholder="Thứ tự hiển thị"
                  type="number"
                  value={sectionForm.orderIndex}
                  onChange={(event) => handleSectionFormChange('orderIndex', event.target.value)}
                  required
                />
              </div>

              {sectionFormError && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                  {sectionFormError}
                </div>
              )}
              {sectionFormSuccess && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                  {sectionFormSuccess}
                </div>
              )}

              <button
                type="submit"
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Tạo phần
              </button>
            </form>
          )}
          {sectionItems.length > 0 ? (
            <div className="mt-4 space-y-4">
              {sectionItems.map((section) => (
                <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{section.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.lessonCount} bài học</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                        Tuần {section.orderIndex}
                      </span>
                      {canManageLessons && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditSection(section)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(section.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {canManageLessons && editingSectionId === section.id && (
                    <form
                      className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900"
                      onSubmit={handleUpdateSection}
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          placeholder="Tiêu đề phần"
                          value={editingSectionForm.title}
                          onChange={(event) =>
                            setEditingSectionForm((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          required
                        />
                        <input
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          min="1"
                          placeholder="Thứ tự hiển thị"
                          type="number"
                          value={editingSectionForm.orderIndex}
                          onChange={(event) =>
                            setEditingSectionForm((prev) => ({
                              ...prev,
                              orderIndex: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      {editingSectionError && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                          {editingSectionError}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSectionId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}

                  {section.lessons?.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="rounded-xl border border-white bg-white p-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lesson.title}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{lesson.description}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Thời lượng: {lesson.duration} · {lesson.contentCount} tài nguyên con
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lesson.status]}`}>
                                {statusLabels[lesson.status]}
                              </span>
                              {canManageLessons && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditLesson(lesson)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-300 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(lesson.contentTypes ?? []).map((type) => (
                              <span
                                key={`${lesson.id}-${type}`}
                                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          {lesson.contents?.length > 0 && (
                            <div className="mt-3 grid gap-2 lg:grid-cols-2">
                              {lesson.contents.map((content) => (
                                <ResourceCard
                                  key={`${lesson.id}-${content.id}`}
                                  resource={content}
                                />
                              ))}
                            </div>
                          )}

                          {canManageLessons && editingLessonId === lesson.id && (
                            <form
                              className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-950"
                              onSubmit={handleUpdateLesson}
                            >
                              <div className="grid gap-3 md:grid-cols-2">
                                <input
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  placeholder="Tiêu đề bài học"
                                  value={editingLessonForm.title}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      title: event.target.value,
                                    }))
                                  }
                                  required
                                />
                                <input
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  min="1"
                                  placeholder="Thứ tự hiển thị"
                                  type="number"
                                  value={editingLessonForm.orderIndex}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      orderIndex: event.target.value,
                                    }))
                                  }
                                  required
                                />
                                <input
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  min="1"
                                  placeholder="Thời lượng (phút)"
                                  type="number"
                                  value={editingLessonForm.duration}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      duration: event.target.value,
                                    }))
                                  }
                                />
                                <select
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  value={editingLessonForm.type}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      type: event.target.value,
                                    }))
                                  }
                                >
                                  {lessonTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <textarea
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                                  placeholder="Mô tả bài học"
                                  value={editingLessonForm.description}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      description: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              {editingLessonForm.type === 'file' && (
                                <div className="mt-3 space-y-2">
                                  <input
                                    type="file"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    onChange={(event) =>
                                      handleUploadEditingLessonFile(event.target.files?.[0])
                                    }
                                  />
                                  <input
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    placeholder="Hoặc nhập link file"
                                    value={editingLessonForm.fileUrl}
                                    onChange={(event) =>
                                      setEditingLessonForm((prev) => ({
                                        ...prev,
                                        fileUrl: event.target.value,
                                      }))
                                    }
                                  />
                                  {editingLessonUpload.isUploading && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Đang tải file...
                                    </p>
                                  )}
                                  {editingLessonUpload.error && (
                                    <p className="text-xs text-rose-600 dark:text-rose-200">
                                      {editingLessonUpload.error}
                                    </p>
                                  )}
                                </div>
                              )}

                              {editingLessonForm.type === 'video' && (
                                <input
                                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  placeholder="Link video"
                                  value={editingLessonForm.fileUrl}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      fileUrl: event.target.value,
                                    }))
                                  }
                                />
                              )}

                              {editingLessonForm.type === 'text' && (
                                <textarea
                                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  placeholder="Nội dung văn bản"
                                  value={editingLessonForm.content}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      content: event.target.value,
                                    }))
                                  }
                                />
                              )}

                              {editingLessonForm.type === 'quiz' && (
                                <input
                                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                  placeholder="Quiz id"
                                  value={editingLessonForm.quizId}
                                  onChange={(event) =>
                                    setEditingLessonForm((prev) => ({
                                      ...prev,
                                      quizId: event.target.value,
                                    }))
                                  }
                                />
                              )}

                              {editingLessonError && (
                                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                                  {editingLessonError}
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="submit"
                                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                                >
                                  Lưu thay đổi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLessonId(null)}
                                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                >
                                  Hủy
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      Phần này chưa có bài học nào.
                    </div>
                  )}

                  {canManageLessons && (
                    <form
                      className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900"
                      onSubmit={(event) => handleCreateLesson(event, section)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Thêm bài học mới
                        </h4>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                          Giảng viên
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <input
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          placeholder="Tiêu đề bài học"
                          value={(lessonForms[section.id]?.title ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { title: event.target.value })}
                          required
                        />
                        <input
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          min="1"
                          placeholder="Thứ tự hiển thị"
                          type="number"
                          value={(lessonForms[section.id]?.orderIndex ?? (section.lessons?.length ?? 0) + 1)}
                          onChange={(event) => updateLessonForm(section.id, { orderIndex: event.target.value })}
                          required
                        />
                        <input
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          min="1"
                          placeholder="Thời lượng (phút)"
                          type="number"
                          value={(lessonForms[section.id]?.duration ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { duration: event.target.value })}
                        />
                        <select
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          value={(lessonForms[section.id]?.type ?? 'text')}
                          onChange={(event) => updateLessonForm(section.id, { type: event.target.value })}
                        >
                          {lessonTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                          placeholder="Mô tả bài học"
                          value={(lessonForms[section.id]?.description ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { description: event.target.value })}
                        />
                      </div>

                      {lessonForms[section.id]?.type === 'file' && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="file"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            onChange={(event) =>
                              handleUploadLessonFile(section.id, event.target.files?.[0])
                            }
                          />
                          <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="Hoặc nhập link file"
                            value={(lessonForms[section.id]?.fileUrl ?? '')}
                            onChange={(event) => updateLessonForm(section.id, { fileUrl: event.target.value })}
                          />
                          {lessonUploadState[section.id]?.isUploading && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Đang tải file...
                            </p>
                          )}
                          {lessonUploadState[section.id]?.error && (
                            <p className="text-xs text-rose-600 dark:text-rose-200">
                              {lessonUploadState[section.id]?.error}
                            </p>
                          )}
                        </div>
                      )}

                      {lessonForms[section.id]?.type === 'video' && (
                        <input
                          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          placeholder="Link video"
                          value={(lessonForms[section.id]?.fileUrl ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { fileUrl: event.target.value })}
                        />
                      )}

                      {lessonForms[section.id]?.type === 'text' && (
                        <textarea
                          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          placeholder="Nội dung văn bản"
                          value={(lessonForms[section.id]?.content ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { content: event.target.value })}
                        />
                      )}

                      {lessonForms[section.id]?.type === 'quiz' && (
                        <input
                          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          placeholder="Quiz id"
                          value={(lessonForms[section.id]?.quizId ?? '')}
                          onChange={(event) => updateLessonForm(section.id, { quizId: event.target.value })}
                        />
                      )}

                      {lessonFormErrors[section.id] && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                          {lessonFormErrors[section.id]}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Thêm bài học
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              Khóa học này chưa có phần hoặc bài học nào.
            </div>
          )}
        </section>
      )}

      {activeTab === 'assignments' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                BTVN
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Bài tập về nhà của lớp hiện tại
              </p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
              {totalAssignments} bài
            </span>
          </div>

          {canManageAssignments && (
            <form
              className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-left transition-colors dark:border-indigo-400/30 dark:bg-indigo-400/10"
              onSubmit={handleCreateAssignment}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Giao BTVN mới</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Tiêu đề BTVN"
                  value={assignmentForm.title}
                  onChange={(event) => handleAssignmentFormChange('title', event.target.value)}
                  required
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(event) => handleAssignmentFormChange('dueDate', event.target.value)}
                />
                <textarea
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                  placeholder="Mô tả BTVN"
                  value={assignmentForm.description}
                  onChange={(event) => handleAssignmentFormChange('description', event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                  type="file"
                  multiple
                  onChange={(event) =>
                    handleAssignmentFormChange(
                      'files',
                      Array.from(event.target.files ?? []),
                    )
                  }
                />
              </div>
              {assignmentFormError && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                  {assignmentFormError}
                </div>
              )}
              {assignmentFormSuccess && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                  {assignmentFormSuccess}
                </div>
              )}
              <button type="submit" className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Giao bài
              </button>
            </form>
          )}

          {assignmentItems.length > 0 ? (
            <div className="mt-4 space-y-4">
              {assignmentItems.map((assignment) => {
                const mySubmissions = submissionHistory[assignment.id];
                const hasSubmitted = mySubmissions?.length > 0;
                const latestSubmission = mySubmissions?.[0];
                const isSubmissionsVisible = submissionForms[assignment.id]?.showSubmissions ?? false;

                return (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    {/* Header: card + status + teacher actions */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {assignment.title}
                          </p>
                          {/* Submission status badge (student) */}
                          {!canManageAssignments && mySubmissions !== undefined && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${hasSubmitted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {hasSubmitted ? 'Đã nộp' : 'Chưa nộp'}
                            </span>
                          )}
                          {/* Submission count badge (teacher) */}
                          {canManageAssignments && mySubmissions !== undefined && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                              {mySubmissions.length} bài nộp
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                            {assignment.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Hạn nộp: {formatDueDate(assignment.dueDate)}
                          </span>
                          {assignment.attachments?.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="h-3.5 w-3.5" />
                              {assignment.attachments.length} tệp đính kèm
                            </span>
                          )}
                        </div>
                        {/* Attachment download links */}
                        {assignment.attachments?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {assignment.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              >
                                {att.originalName}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Assignment status badge */}
                      {(() => {
                        const meta = assignmentStatusMeta[assignment.status] ?? assignmentStatusMeta['no-due'];
                        return (
                          <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                            {meta.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Teacher: edit / delete */}
                    {canManageAssignments && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditAssignment(assignment)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateSubmissionForm(assignment.id, { showSubmissions: !isSubmissionsVisible });
                            if (!mySubmissions) void loadSubmissionHistory(assignment.id);
                          }}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-200"
                        >
                          {isSubmissionsVisible ? 'Ẩn bài nộp' : 'Xem bài nộp'}
                        </button>
                      </div>
                    )}

                    {/* Teacher: edit form */}
                    {canManageAssignments && editingAssignmentId === assignment.id && (
                      <form
                        className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                        onSubmit={handleUpdateAssignment}
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="Tiêu đề"
                            value={editingAssignmentForm.title}
                            onChange={(event) =>
                              setEditingAssignmentForm((prev) => ({ ...prev, title: event.target.value }))
                            }
                            required
                          />
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            type="datetime-local"
                            value={editingAssignmentForm.dueDate}
                            onChange={(event) =>
                              setEditingAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))
                            }
                          />
                          <textarea
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                            placeholder="Mô tả"
                            value={editingAssignmentForm.description}
                            onChange={(event) =>
                              setEditingAssignmentForm((prev) => ({ ...prev, description: event.target.value }))
                            }
                          />
                        </div>
                        {editingAssignmentError && (
                          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                            {editingAssignmentError}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAssignmentId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Teacher: submissions list */}
                    {canManageAssignments && isSubmissionsVisible && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        {submissionLoading[assignment.id]?.isLoading && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải danh sách nộp bài...</p>
                        )}
                        {submissionLoading[assignment.id]?.error && (
                          <p className="text-xs text-rose-600 dark:text-rose-200">
                            {submissionLoading[assignment.id]?.error}
                          </p>
                        )}
                        {mySubmissions?.length === 0 && !submissionLoading[assignment.id]?.isLoading && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Chưa có sinh viên nộp bài.</p>
                        )}
                        {mySubmissions?.length > 0 && (
                          <ul className="space-y-3">
                            {mySubmissions.map((submission) => (
                              <li key={submission.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                                <p className="font-semibold">{submission.student?.full_name ?? submission.student_id}</p>
                                <p className="mt-0.5 text-slate-500">
                                  Nộp lúc: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('vi-VN') : ''}
                                </p>
                                {submission.content && (
                                  <p className="mt-1 text-slate-600 dark:text-slate-300">Ghi chú: {submission.content}</p>
                                )}
                                {submission.score != null && (
                                  <p className="mt-0.5">Điểm: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{submission.score}</span></p>
                                )}
                                {submission.feedback && (
                                  <p className="mt-0.5 text-slate-500">Nhận xét: {submission.feedback}</p>
                                )}
                                {submission.files?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {submission.files.map((file) => (
                                      <a
                                        key={file.id}
                                        href={toAbsoluteFileUrl(file.file_url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {file.original_name}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                <form
                                  className="mt-2 rounded-lg border border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
                                  onSubmit={(event) => handleGradeSubmission(event, assignment.id, submission.id)}
                                >
                                  <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">Chấm điểm</p>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    <input
                                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                      placeholder="Điểm (0–10)"
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.1"
                                      value={gradingForms[submission.id]?.score ?? submission.score ?? ''}
                                      onChange={(event) => updateGradingForm(submission.id, { score: event.target.value })}
                                    />
                                    <input
                                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                      placeholder="Nhận xét"
                                      value={gradingForms[submission.id]?.feedback ?? submission.feedback ?? ''}
                                      onChange={(event) => updateGradingForm(submission.id, { feedback: event.target.value })}
                                    />
                                  </div>
                                  {gradingErrors[submission.id] && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-200">
                                      {gradingErrors[submission.id]}
                                    </p>
                                  )}
                                  {gradingSuccess[submission.id] && (
                                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-200">
                                      {gradingSuccess[submission.id]}
                                    </p>
                                  )}
                                  <button type="submit" className="mt-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                    Lưu điểm
                                  </button>
                                </form>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Student: submit section */}
                    {!canManageAssignments && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSubmission(assignment.id)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            {submissionForms[assignment.id]?.isOpen ? 'Đóng' : 'Nộp bài'}
                          </button>
                          {submissionSuccess[assignment.id] && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-300">
                              {submissionSuccess[assignment.id]}
                            </span>
                          )}
                        </div>

                        {/* Student submission history */}
                        {submissionLoading[assignment.id]?.isLoading && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Đang tải...</p>
                        )}
                        {submissionLoading[assignment.id]?.error && (
                          <p className="mt-2 text-xs text-rose-600 dark:text-rose-200">
                            {submissionLoading[assignment.id]?.error}
                          </p>
                        )}
                        {mySubmissions !== undefined && mySubmissions.length === 0 && !submissionLoading[assignment.id]?.isLoading && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Bạn chưa nộp bài này.</p>
                        )}
                        {hasSubmitted && (
                          <div className="mt-2 space-y-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              Đã nộp {mySubmissions.length} lần
                            </p>
                            {mySubmissions.map((sub, idx) => (
                              <div key={sub.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950">
                                <p className="text-slate-500">
                                  {idx === 0 ? 'Lần gần nhất' : `Lần ${mySubmissions.length - idx}`}:{' '}
                                  {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('vi-VN') : 'N/A'}
                                </p>
                                {sub.content && (
                                  <p className="mt-1 text-slate-600 dark:text-slate-300">Ghi chú: {sub.content}</p>
                                )}
                                {sub.files?.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {sub.files.map((file) => (
                                      <a
                                        key={file.id}
                                        href={toAbsoluteFileUrl(file.file_url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {file.original_name}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {sub.score != null && (
                                  <p className="mt-1">
                                    Điểm: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{sub.score}</span>
                                  </p>
                                )}
                                {sub.feedback && (
                                  <p className="mt-0.5 text-slate-500">Nhận xét: {sub.feedback}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Submit form */}
                        {submissionForms[assignment.id]?.isOpen && (
                          <form className="mt-3 space-y-2" onSubmit={(event) => handleSubmitAssignment(event, assignment.id)}>
                            <textarea
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              placeholder="Ghi chú nộp bài (tùy chọn)"
                              value={submissionForms[assignment.id]?.content ?? ''}
                              onChange={(event) => updateSubmissionForm(assignment.id, { content: event.target.value })}
                              rows={2}
                            />
                            <div>
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                onChange={(event) =>
                                  updateSubmissionForm(assignment.id, { files: Array.from(event.target.files ?? []) })
                                }
                              />
                              <p className="mt-1 text-xs text-slate-400">Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)</p>
                            </div>
                            {submissionErrors[assignment.id] && (
                              <p className="text-sm text-rose-600 dark:text-rose-200">
                                {submissionErrors[assignment.id]}
                              </p>
                            )}
                            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                              Nộp bài
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              Chưa có BTVN nào cho lớp này.
            </div>
          )}
        </section>
      )}

      {activeTab === 'resources' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          {/* Header + breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setCurrentFolderId(null)}
                className={`font-semibold ${currentFolderId ? 'text-indigo-600 hover:underline dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}
              >
                Tài nguyên
              </button>
              {currentFolderId && (
                <>
                  <span className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {classFolders.find((f) => f.id === currentFolderId)?.name ?? 'Thư mục'}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!currentFolderId && (
                <button
                  type="button"
                  onClick={() => { setShowFolderForm((v) => !v); setFolderCreateError(''); }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  + Tạo thư mục
                </button>
              )}
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                {currentFolderId
                  ? `${classResources.filter((r) => r.folder_id === currentFolderId).length} file`
                  : `${classFolders.length} thư mục · ${classResources.filter((r) => !r.folder_id).length} file`}
              </span>
            </div>
          </div>

          {/* Create folder form */}
          {!currentFolderId && showFolderForm && (
            <form className="mt-3 flex items-center gap-2" onSubmit={handleCreateFolder}>
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Tên thư mục"
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                disabled={folderCreating}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {folderCreating ? '...' : 'Tạo'}
              </button>
              <button
                type="button"
                onClick={() => { setShowFolderForm(false); setFolderNameInput(''); }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              {folderCreateError && (
                <p className="text-xs text-rose-600 dark:text-rose-300">{folderCreateError}</p>
              )}
            </form>
          )}

          {/* Upload form */}
          <form
            className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-400/30 dark:bg-indigo-400/10"
            onSubmit={handleResourceUpload}
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Tải lên{currentFolderId ? ` vào "${classFolders.find((f) => f.id === currentFolderId)?.name}"` : ''}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                onChange={(e) => setResourceUploadFile(e.target.files?.[0] ?? null)}
                required
              />
              <button
                type="submit"
                disabled={resourceUploading || !resourceUploadFile}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resourceUploading ? 'Đang tải...' : 'Tải lên'}
              </button>
            </div>
            {resourceUploadError && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{resourceUploadError}</p>
            )}
            {resourceUploadSuccess && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">{resourceUploadSuccess}</p>
            )}
          </form>

          {/* Error / loading */}
          {classResourcesLoading && (
            <p className="mt-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
          )}
          {classResourcesError && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
              {classResourcesError}
            </p>
          )}

          {/* Folder list (root view only) */}
          {!currentFolderId && !classResourcesLoading && classFolders.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {classFolders.map((folder) => {
                const fileCount = classResources.filter((r) => r.folder_id === folder.id).length;
                const canDeleteFolder =
                  folder.created_by === currentUser?.id || currentUser?.role === 'TEACHER';
                return (
                  <div
                    key={folder.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-400/10"
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-left"
                      onClick={() => setCurrentFolderId(folder.id)}
                    >
                      <span className="text-2xl">📁</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                          {folder.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {fileCount} file · {folder.creator?.full_name ?? ''}
                        </p>
                      </div>
                    </button>
                    {canDeleteFolder && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="flex-shrink-0 rounded-md px-1.5 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* File list */}
          {!classResourcesLoading && (() => {
            const visibleFiles = classResources.filter(
              (r) => r.folder_id === currentFolderId,
            );
            if (visibleFiles.length === 0 && (!currentFolderId ? classFolders.length === 0 : true)) {
              return (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  {currentFolderId ? 'Thư mục này chưa có file nào.' : 'Chưa có tài nguyên nào. Hãy tải lên tài liệu đầu tiên!'}
                </div>
              );
            }
            if (visibleFiles.length === 0) return null;
            return (
              <ul className="mt-4 space-y-2">
                {visibleFiles.map((resource) => {
                  const canDelete =
                    resource.uploaded_by === currentUser?.id || currentUser?.role === 'TEACHER';
                  const sizeKb = Math.round(resource.size / 1024);
                  const sizeLabel = sizeKb >= 1024
                    ? `${(sizeKb / 1024).toFixed(1)} MB`
                    : `${sizeKb} KB`;
                  return (
                    <li
                      key={resource.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <File className="h-7 w-7 flex-shrink-0 text-indigo-400 dark:text-indigo-300" />
                      <div className="min-w-0 flex-1">
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                        >
                          {resource.original_name}
                        </a>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {resource.uploader?.full_name ?? 'Thành viên'} · {sizeLabel} ·{' '}
                          {resource.created_at ? new Date(resource.created_at).toLocaleDateString('vi-VN') : ''}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Mở <ExternalLink className="h-3 w-3" />
                        </a>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClassResource(resource.id)}
                            className="inline-flex h-7 items-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-600 hover:border-rose-300 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </section>
      )}

      {activeTab === 'progress' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Theo dõi tiến độ</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tổng quan quá trình học tập</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center transition-colors dark:border-emerald-400/30 dark:bg-emerald-400/10">
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-200">{progress.completed}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-200">Đã hoàn thành</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center transition-colors dark:border-amber-400/30 dark:bg-amber-400/10">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-200">{progress.inProgress}</p>
              <p className="text-xs text-amber-700 dark:text-amber-200">Đang học</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition-colors dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{progress.todo}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Chưa học</p>
            </div>
          </div>
          {canManageAssignments && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-400/30 dark:bg-indigo-400/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">
                      Tiến độ lớp học (giảng viên)
                    </p>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-200/80">
                      Tổng số sinh viên đang học: {totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              {teacherProgressLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải thống kê lớp...</p>
              )}
              {teacherProgressError && (
                <p className="text-sm text-rose-600 dark:text-rose-200">{teacherProgressError}</p>
              )}

              {!teacherProgressLoading && !teacherProgressError && (
                <>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Bài tập về nhà</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Số sinh viên đã nộp theo từng bài
                    </p>
                    {teacherAssignments.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {teacherAssignments.map((assignment) => (
                          <li key={assignment.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  Hạn nộp: {formatDueDate(assignment.due_date)}
                                </p>
                              </div>
                              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                                {assignment.submitted_count}/{totalStudents} đã nộp
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có bài tập nào.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Điểm quiz</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Điểm cao nhất của sinh viên theo từng quiz
                    </p>
                    {teacherQuizzes.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        {teacherQuizzes.map((quiz) => (
                          <div key={quiz.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {quiz.total_questions ?? 0} câu hỏi · {quiz.time_limit ?? 0} phút
                                </p>
                              </div>
                              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                                {quiz.scores?.length ?? 0} lượt có điểm
                              </span>
                            </div>
                            {quiz.scores?.length ? (
                              <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {quiz.scores.map((score) => (
                                  <li key={`${quiz.id}-${score.student_id}`} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800">
                                    <span className="font-medium text-slate-700 dark:text-slate-100">
                                      {score.student?.full_name ?? score.student_id}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-300">
                                      {score.score ?? 'N/A'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có điểm cho quiz này.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có quiz nào.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === 'discussions' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Thảo luận</h2>
            <div className="flex items-center gap-2">
              {!USE_MOCK_DATA && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${socketConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
                  {socketConnected ? 'Trực tuyến' : 'Đang kết nối...'}
                </span>
              )}
            </div>
          </div>

          {/* Topic bar: scrollable pills + inline create */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <form
              className="flex flex-shrink-0 items-center gap-1"
              onSubmit={handleCreateDiscussion}
            >
              <input
                className="h-8 w-40 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="+ Chủ đề mới..."
                value={discussionForm.title}
                onChange={(event) => handleDiscussionFormChange('title', event.target.value)}
              />
              {discussionForm.title.trim() && (
                <button
                  type="submit"
                  className="h-8 rounded-full bg-indigo-600 px-3 text-xs font-semibold text-white"
                >
                  Tạo
                </button>
              )}
            </form>

            {discussionItems.map((discussion) => {
              const isActive = selectedDiscussionId === discussion.id;
              const canDelete =
                discussion.createdBy === currentUser?.id || currentUser?.role === 'TEACHER';
              return (
                <div
                  key={discussion.id}
                  className={`group flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <button type="button" onClick={() => setSelectedDiscussionId(discussion.id)}>
                    {discussion.title}
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDiscussion(discussion.id)}
                      className={`ml-1 rounded-full p-0.5 ${isActive ? 'hover:bg-indigo-700' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {discussionError && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{discussionError}</p>
          )}

          {/* Chat area */}
          {selectedDiscussionId ? (
            <div className="mt-4 flex flex-col gap-3">
              {/* Messages */}
              <div className="flex h-96 flex-col overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                {isLoadingMessages && (
                  <p className="text-center text-xs text-slate-400">Đang tải...</p>
                )}
                {!isLoadingMessages && discussionMessages.length === 0 && (
                  <p className="m-auto text-sm text-slate-400">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
                )}
                {discussionMessages.map((message) => {
                  const isOwn = message.user_id === currentUser?.id;
                  const canEdit = isOwn;
                  const canDelete = isOwn || currentUser?.role === 'TEACHER';
                  const initials = (message.author?.full_name ?? '?')[0].toUpperCase();
                  return (
                    <div key={message.id} className="group mb-3 flex gap-2.5">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {message.author?.full_name ?? 'Thành viên'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatChatTime(message.created_at)}
                          </span>
                          <div className="ml-auto hidden items-center gap-1 group-hover:flex">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleStartEditMessage(message)}
                                className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                              >
                                Sửa
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message.id)}
                                className="rounded px-1.5 py-0.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-400/10"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                        {editingMessageId === message.id ? (
                          <form className="mt-1 flex gap-2" onSubmit={handleUpdateMessage}>
                            <input
                              className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              value={editingMessageContent}
                              onChange={(e) => setEditingMessageContent(e.target.value)}
                              autoFocus
                            />
                            <button type="submit" className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                            >
                              Hủy
                            </button>
                          </form>
                        ) : (
                          <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                            {message.content}
                          </p>
                        )}
                        {editingMessageError && editingMessageId === message.id && (
                          <p className="mt-1 text-xs text-rose-500">{editingMessageError}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form
                className="flex items-end gap-2"
                onSubmit={handleCreateMessage}
              >
                <textarea
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
                  value={messageForm}
                  rows={2}
                  onChange={(e) => setMessageForm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!messageForm.trim()}
                  className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  Gửi
                </button>
              </form>
              {messageError && (
                <p className="text-xs text-rose-600 dark:text-rose-300">{messageError}</p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
              {discussionItems.length === 0
                ? 'Chưa có chủ đề nào. Tạo chủ đề đầu tiên ở trên!'
                : 'Chọn một chủ đề để bắt đầu trò chuyện'}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
