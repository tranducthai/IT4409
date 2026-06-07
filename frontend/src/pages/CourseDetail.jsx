import {
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    ClipboardList,
    ExternalLink,
    File,
    FileText,
    ImageIcon,
    Paperclip,
    Plus,
    Send,
    Video,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { createChatSocket, sendChatMessage } from '../services/api/chat-socket.service';
import {
    createDiscussion,
    deleteDiscussion,
    getDiscussionsByClass,
} from '../services/api/discussions.service';
import { uploadLessonContentFile } from '../services/api/lesson-contents.service';
import { createQuestionsBulk } from '../services/api/questions.service';
import { createQuiz } from '../services/api/quizzes.service';
import {
    createLesson,
    deleteLesson,
  markLessonCompleted,
    updateLesson,
} from '../services/api/lessons.service';
import {
    createMessage,
    deleteMessage,
    getMessagesByDiscussion,
    updateMessage,
    uploadChatImage,
} from '../services/api/messages.service';
import {
    createSection,
    deleteSection,
    updateSection,
} from '../services/api/sections.service';
import { toAbsoluteFileUrl } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';
import {
    getMySubmissionsByAssignment,
    getSubmissionsByAssignment,
    gradeSubmission,
    submitAssignment,
} from '../services/api/submissions.service';
import {
    getCourseDetailData,
    getCourseDetailFromApi,
    USE_MOCK_DATA,
} from '../services/dataSource';

const tabOptions = [
  { key: 'lessons', label: 'Bài học' },
  { key: 'assignments', label: 'BTVN' },
  { key: 'resources', label: 'Tài nguyên' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'discussions', label: 'Thảo luận' },
];

const resourceTypeMeta = {
  text: {
    label: 'Text',
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
  { value: 'text', label: 'Text' },
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

function compareOrderIndex(left, right) {
  const leftOrder = Number(left?.order_index ?? left?.orderIndex ?? 0);
  const rightOrder = Number(right?.order_index ?? right?.orderIndex ?? 0);
  if (leftOrder !== rightOrder) return leftOrder - rightOrder;

  const leftCreated = new Date(left?.created_at ?? left?.createdAt ?? 0).getTime();
  const rightCreated = new Date(right?.created_at ?? right?.createdAt ?? 0).getTime();
  return (Number.isNaN(leftCreated) ? 0 : leftCreated) - (Number.isNaN(rightCreated) ? 0 : rightCreated);
}

function parseQuizCsvText(text) {
  const rows = text.split(/\r?\n/).map((line) => {
    const cells = [];
    let val = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (!inQ && c === ',') { cells.push(val.trim()); val = ''; continue; }
      val += c;
    }
    cells.push(val.trim());
    return cells;
  }).filter((r) => r.some((c) => c !== ''));

  if (!rows.length) throw new Error('File CSV trống.');

  let data = rows;
  const firstRowCorrect = String(rows[0]?.[5] ?? '').trim().toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(firstRowCorrect)) data = rows.slice(1);

  return data.map((row, i) => {
    if (row.length < 6) throw new Error(`Dòng ${i + 1} không đủ 6 cột.`);
    const [questionText, optionA, optionB, optionC, optionD, rawCorrect] = row;
    const correctAnswer = String(rawCorrect ?? '').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) throw new Error(`Dòng ${i + 1} đáp án không hợp lệ.`);
    if (!questionText || !optionA || !optionB || !optionC || !optionD) throw new Error(`Dòng ${i + 1} có cột trống.`);
    return { question_text: questionText, option_a: optionA, option_b: optionB, option_c: optionC, option_d: optionD, correct_answer: correctAnswer };
  });
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
  const hasInlineText = type === 'text';
  const actionUrl =
    hasInlineText
      ? null
      : type === 'quiz'
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
        ) : hasInlineText ? null : (
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
  const courseDataRef = useRef(courseData);
  const [isLoading, setIsLoading] = useState(!USE_MOCK_DATA);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [reloadToken, setReloadToken] = useState(0);
  const [sectionForm, setSectionForm] = useState({ title: '', orderIndex: 1 });
  const [sectionFormError, setSectionFormError] = useState('');
  const [, setSectionFormSuccess] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionForm, setEditingSectionForm] = useState({
    title: '',
    orderIndex: 1,
  });
  const [editingSectionError, setEditingSectionError] = useState('');
  const [lessonForms, setLessonForms] = useState({});
  const [lessonFormErrors, setLessonFormErrors] = useState({});
  const [lessonUploadState, setLessonUploadState] = useState({});
  const [quizImportForms, setQuizImportForms] = useState({});
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [showCreateSection, setShowCreateSection] = useState(false);
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
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [expandedContents, setExpandedContents] = useState([]);
  const [discussionError, setDiscussionError] = useState('');
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [, setDiscussionMessagesError] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageForm, setMessageForm] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageImageUrl, setMessageImageUrl] = useState('');
  const [messageImagePreview, setMessageImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  const chatSocketRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [, setEditingMessageError] = useState('');
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

  const [classResources, setClassResources] = useState([]);
  const [classFolders, setClassFolders] = useState([]);
  const classResourcesRef = useRef([]);
  const classFoldersRef = useRef([]);
  const [classResourcesLoading, setClassResourcesLoading] = useState(false);
  const [classResourcesError, setClassResourcesError] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [resourceUploadFile, setResourceUploadFile] = useState(null);
  const [resourceOrderIndex, setResourceOrderIndex] = useState(1);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourceUploadError, setResourceUploadError] = useState('');
  const [resourceUploadSuccess, setResourceUploadSuccess] = useState('');
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);
  const [folderCreateError, setFolderCreateError] = useState('');
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [lessonProgressLoadingId, setLessonProgressLoadingId] = useState(null);
  const [lessonProgressError, setLessonProgressError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    courseDataRef.current = courseData;
  }, [courseData]);

  useEffect(() => {
    classResourcesRef.current = classResources;
  }, [classResources]);

  useEffect(() => {
    classFoldersRef.current = classFolders;
  }, [classFolders]);

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
      const currentCourseId = courseDataRef.current?.course?.id;
      const shouldBlock = !courseDataRef.current || currentCourseId !== courseId;
      if (shouldBlock) setIsLoading(true);
      else setIsLoading(false);
      setError('');
      try {
        const data = await getCourseDetailFromApi(courseId, {
          includeProgress: currentUser?.role === 'STUDENT',
        });
        if (isMounted) setCourseData(data);
      } catch (err) {
        if (isMounted) {
          if (shouldBlock) setCourseData(null);
          setError(err?.message || 'Không tải được chi tiết khóa học.');
        }
      } finally {
        if (isMounted && shouldBlock) setIsLoading(false);
      }
    };

    void loadCourseDetail();

    return () => {
      isMounted = false;
    };
  }, [courseId, currentUser?.id, currentUser?.role, reloadToken]);

  const { course } = courseData ?? {};
  const sectionItems = courseData?.sections ?? [];
  const lessonItems = courseData?.lessons ?? [];
  const resourceItems = courseData?.resources ?? [];
  const assignmentItems = useMemo(
    () => courseData?.assignments ?? [],
    [courseData],
  );
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
  const canTrackLessonProgress = currentUser?.role === 'STUDENT';

  const appendDiscussionMessage = useCallback((message) => {
    if (!message?.id) return;
    setDiscussionMessages((prev) =>
      prev.find((item) => item.id === message.id)
        ? prev
        : [...prev, message],
    );
  }, []);

  useEffect(() => {
    setSectionForm((prev) => ({
      ...prev,
      orderIndex: Math.max(1, sectionItems.length + 1),
    }));
  }, [sectionItems.length]);

  useEffect(() => {
    if (sectionItems.length > 0 && expandedSections.size === 0) {
      setExpandedSections(new Set(sectionItems.map((s) => s.id)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (USE_MOCK_DATA || activeTab !== 'discussions' || !selectedDiscussionId) {
      setSocketConnected(false);
      return undefined;
    }

    const socket = createChatSocket();
    if (!socket) {
      setSocketConnected(false);
      return undefined;
    }

    chatSocketRef.current = socket;

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit('joinDiscussion', selectedDiscussionId);
    };
    const handleDisconnect = () => setSocketConnected(false);
    const handleConnectError = () => setSocketConnected(false);
    const handleNewMessage = (message) => {
      if (message?.discussion_id !== selectedDiscussionId) return;
      appendDiscussionMessage(message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('newMessage', handleNewMessage);
    socket.connect();

    return () => {
      socket.emit('leaveDiscussion', selectedDiscussionId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newMessage', handleNewMessage);
      socket.disconnect();
      if (chatSocketRef.current === socket) chatSocketRef.current = null;
      setSocketConnected(false);
    };
  }, [activeTab, appendDiscussionMessage, selectedDiscussionId]);

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
      const shouldBlock =
        classResourcesRef.current.length === 0 &&
        classFoldersRef.current.length === 0;
      if (shouldBlock) setClassResourcesLoading(true);
      else setClassResourcesLoading(false);
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
        if (isMounted && shouldBlock) setClassResourcesLoading(false);
      }
    };
    void load();
    return () => { isMounted = false; };
  }, [activeTab, courseId, reloadToken]);

  useEffect(() => {
    const currentFiles = classResources.filter(
      (resource) => resource.folder_id === currentFolderId,
    );
    const maxOrder = currentFiles.reduce(
      (max, resource) => Math.max(max, Number(resource.order_index) || 0),
      0,
    );
    setResourceOrderIndex(maxOrder + 1);
  }, [classResources, currentFolderId]);

  const handleResourceUpload = async (event) => {
    event.preventDefault();
    if (!resourceUploadFile) return;
    const orderIndex = Math.max(1, Number(resourceOrderIndex) || 1);
    setResourceUploading(true);
    setResourceUploadError('');
    setResourceUploadSuccess('');
    try {
      await uploadClassResource(courseId, resourceUploadFile, currentFolderId, orderIndex);
      const [files, folders] = await Promise.all([
        getClassResources(courseId),
        getClassFolders(courseId),
      ]);
      setClassResources(files ?? []);
      setClassFolders(folders ?? []);
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

  const handleToggleComments = (discussionId) => {
    if (selectedDiscussionId === discussionId) {
      setSelectedDiscussionId(null);
      setDiscussionMessages([]);
    } else {
      setSelectedDiscussionId(discussionId);
      void loadMessages(discussionId);
    }
  };

  const toggleExpandContent = (id) => {
    setExpandedContents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };


  const handleMarkLessonCompleted = async (lessonId) => {
    if (!canTrackLessonProgress) return;

    setLessonProgressError('');
    setLessonProgressLoadingId(lessonId);
    try {
      await markLessonCompleted(lessonId);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setLessonProgressError(err?.message || 'Không cập nhật được tiến độ bài học.');
    } finally {
      setLessonProgressLoadingId(null);
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

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
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
      setShowDiscussionForm(false);
      await loadDiscussions();
      if (created?.id) setSelectedDiscussionId(created.id);
    } catch (err) {
      setDiscussionError(err?.message || 'Không tạo được thảo luận.');
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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const preview = URL.createObjectURL(file);
    setMessageImagePreview(preview);
    setIsUploadingImage(true);
    setMessageError('');
    try {
      const result = await uploadChatImage(file);
      setMessageImageUrl(result.url);
    } catch (err) {
      setMessageImagePreview('');
      setMessageError(err?.message || 'Không tải được ảnh.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setMessageImageUrl('');
    if (messageImagePreview) URL.revokeObjectURL(messageImagePreview);
    setMessageImagePreview('');
  };

  const handleCreateMessage = async (event) => {
    event.preventDefault();
    setMessageError('');

    if (USE_MOCK_DATA) {
      setMessageError('Chế độ mock chưa hỗ trợ gửi tin nhắn.');
      return;
    }

    const content = messageForm.trim();
    if (!content && !messageImageUrl) return;

    setMessageForm('');
    const sentImageUrl = messageImageUrl;
    setMessageImageUrl('');
    if (messageImagePreview) URL.revokeObjectURL(messageImagePreview);
    setMessageImagePreview('');

    try {
      const socket = chatSocketRef.current;
      if (socket?.connected) {
        const response = await sendChatMessage(socket, {
          discussionId: selectedDiscussionId,
          content: content || ' ',
          imageUrl: sentImageUrl || undefined,
        });
        if (response?.message?.id) {
          appendDiscussionMessage(response.message);
        }
      } else {
        const created = await createMessage({
          discussion_id: selectedDiscussionId,
          content: content || ' ',
          image_url: sentImageUrl || undefined,
        });
        if (created?.id) {
          appendDiscussionMessage(created);
        } else {
          await loadMessages(selectedDiscussionId);
        }
      }
    } catch (err) {
      setMessageForm(content);
      setMessageImageUrl(sentImageUrl);
      setMessageError(err?.message || 'Không gửi được tin nhắn.');
    }
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

  const setSubmissionLoadState = useCallback((assignmentId, patch) => {
    setSubmissionLoading((prev) => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] ?? { isLoading: false, error: '' }),
        ...patch,
      },
    }));
  }, []);

  const loadSubmissionHistory = useCallback(async (assignmentId) => {
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
  }, [canManageAssignments, setSubmissionLoadState]);

  useEffect(() => {
    if (activeTab !== 'assignments' || USE_MOCK_DATA || !assignmentIds) return;
    assignmentIds.split(',').filter(Boolean).forEach((id) => {
      if (!submissionHistory[id]) {
        void loadSubmissionHistory(id);
      }
    });
  }, [activeTab, assignmentIds, loadSubmissionHistory, submissionHistory]);

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

  const defaultQuizImportForm = { title: '', timeLimit: 10, openTime: '', closeTime: '', csvQuestions: [], isCreating: false, error: '' };

  const updateQuizImportForm = (sectionId, patch) => {
    setQuizImportForms((prev) => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? { ...defaultQuizImportForm }), ...patch },
    }));
  };

  const handleQuizCsvSelect = async (sectionId, file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const questions = parseQuizCsvText(text);
      updateQuizImportForm(sectionId, { csvQuestions: questions, error: '' });
    } catch (err) {
      updateQuizImportForm(sectionId, { csvQuestions: [], error: err?.message || 'Lỗi đọc file CSV.' });
    }
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

    if (form.type === 'quiz') {
      const qf = quizImportForms[section.id] ?? defaultQuizImportForm;
      if (!qf.title.trim()) {
        setLessonFormErrors((prev) => ({ ...prev, [section.id]: 'Vui lòng nhập tiêu đề quiz.' }));
        return;
      }
      if (!qf.csvQuestions?.length) {
        setLessonFormErrors((prev) => ({ ...prev, [section.id]: 'Vui lòng import ít nhất 1 câu hỏi từ CSV.' }));
        return;
      }
      updateQuizImportForm(section.id, { isCreating: true, error: '' });
      try {
        const quiz = await createQuiz({
          title: qf.title.trim(),
          time_limit: Math.max(1, Number(qf.timeLimit) || 10),
          total_questions: qf.csvQuestions.length,
          class_id: courseId,
          is_random: false,
          open_time: qf.openTime ? new Date(qf.openTime).toISOString() : undefined,
          close_time: qf.closeTime ? new Date(qf.closeTime).toISOString() : undefined,
        });
        await createQuestionsBulk(quiz.id, qf.csvQuestions);
        await createLesson({
          section_id: section.id,
          title,
          description: form.description.trim(),
          type: 'quiz',
          order_index: Math.max(1, Number(form.orderIndex) || 1),
          duration: form.duration ? Math.max(1, Number(form.duration) || 1) : undefined,
          quiz_id: quiz.id,
        });
        setQuizImportForms((prev) => ({ ...prev, [section.id]: { ...defaultQuizImportForm } }));
        setLessonForms((prev) => ({ ...prev, [section.id]: { ...defaultLessonForm, orderIndex: fallbackOrder + 1 } }));
        setReloadToken((value) => value + 1);
      } catch (err) {
        setLessonFormErrors((prev) => ({ ...prev, [section.id]: err?.message || 'Không tạo được quiz.' }));
        updateQuizImportForm(section.id, { isCreating: false });
      }
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

    // quiz_id is optional when editing — it may already be set from initial creation

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

  if (error && !course) {
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

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 transition-colors dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="action-btn rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Tải lại
            </button>
          </div>
        </div>
      )}

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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Nội dung khóa học</h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {sectionItems.length} chương · {lessonItems.length} bài học
              </p>
            </div>
            {canManageLessons && (
              <button
                type="button"
                onClick={() => setShowCreateSection((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm chương
              </button>
            )}
          </div>

          {/* Create section form */}
          {canManageLessons && showCreateSection && (
            <div className="border-t border-slate-100 bg-slate-50 px-5 pb-5 pt-4 dark:border-slate-800 dark:bg-slate-950">
              <form onSubmit={async (e) => { await handleCreateSection(e); setShowCreateSection(false); }}>
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Tạo chương mới</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Tiêu đề chương"
                    value={sectionForm.title}
                    onChange={(e) => handleSectionFormChange('title', e.target.value)}
                    required
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    min="1"
                    placeholder="Thứ tự hiển thị"
                    type="number"
                    value={sectionForm.orderIndex}
                    onChange={(e) => handleSectionFormChange('orderIndex', e.target.value)}
                    required
                  />
                </div>
                {sectionFormError && <p className="mt-2 text-xs text-rose-600">{sectionFormError}</p>}
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Tạo chương</button>
                  <button type="button" onClick={() => setShowCreateSection(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Hủy</button>
                </div>
              </form>
            </div>
          )}

          {lessonProgressError && (
            <div className="border-t border-slate-100 px-5 py-2 text-sm text-rose-600 dark:border-slate-800 dark:text-rose-300">
              {lessonProgressError}
            </div>
          )}

          {sectionItems.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sectionItems.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                const allDone = section.lessons?.length > 0 && section.lessons.every((l) => l.status === 'done');
                return (
                  <div key={section.id}>
                    {/* Section row */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex flex-1 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{section.title}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                          {section.lessonCount} bài
                        </span>
                        <span className="ml-auto flex items-center">
                          {allDone
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            : isExpanded
                              ? <ChevronDown className="h-5 w-5 text-slate-400" />
                              : <ChevronRight className="h-5 w-5 text-slate-400" />
                          }
                        </span>
                      </button>
                      {canManageLessons && (
                        <div className="flex items-center gap-1 pr-4">
                          <button
                            type="button"
                            onClick={() => handleStartEditSection(section)}
                            className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(section.id)}
                            className="rounded px-2 py-1 text-xs text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit section form */}
                    {canManageLessons && editingSectionId === section.id && (
                      <div className="border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <form onSubmit={handleUpdateSection}>
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              placeholder="Tiêu đề chương"
                              value={editingSectionForm.title}
                              onChange={(e) => setEditingSectionForm((prev) => ({ ...prev, title: e.target.value }))}
                              required
                            />
                            <input
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              min="1"
                              placeholder="Thứ tự"
                              type="number"
                              value={editingSectionForm.orderIndex}
                              onChange={(e) => setEditingSectionForm((prev) => ({ ...prev, orderIndex: e.target.value }))}
                              required
                            />
                          </div>
                          {editingSectionError && <p className="mt-2 text-xs text-rose-600">{editingSectionError}</p>}
                          <div className="mt-3 flex gap-2">
                            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">Lưu</button>
                            <button type="button" onClick={() => setEditingSectionId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Hủy</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Lessons list */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
                        {(section.lessons ?? []).map((lesson) => {
                          const isSelected = selectedLessonId === lesson.id;
                          const primaryType = lesson.contentTypes?.[0] ?? lesson.type ?? 'text';
                          const typeMeta = resourceTypeMeta[primaryType] ?? { label: 'Bài học', icon: FileText, badgeClass: 'bg-slate-100 text-slate-600' };
                          const TypeIcon = typeMeta.icon;
                          return (
                            <div key={lesson.id}>
                              {/* Lesson row */}
                              <button
                                type="button"
                                onClick={() => setSelectedLessonId(isSelected ? null : lesson.id)}
                                className={['flex w-full items-center gap-3 px-6 py-3.5 text-left transition-colors', isSelected ? 'bg-indigo-50 dark:bg-indigo-400/10' : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'].join(' ')}
                              >
                                <TypeIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                <span className={['flex-1 text-sm', isSelected ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'].join(' ')}>
                                  {lesson.title}
                                </span>
                                <span className="text-xs text-slate-400">{lesson.duration}</span>
                                {lesson.status === 'done'
                                  ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                                  : isSelected
                                    ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                                    : <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                                }
                              </button>

                              {/* Lesson detail panel */}
                              {isSelected && (
                                <div className="border-t border-indigo-100 bg-white px-6 py-4 dark:border-indigo-400/20 dark:bg-slate-900">
                                  {lesson.description && (
                                    <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>
                                  )}
                                  {lesson.contentTypes?.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                      {lesson.contentTypes.map((type) => {
                                        const m = resourceTypeMeta[type] ?? { label: type, badgeClass: 'bg-slate-100 text-slate-600' };
                                        return (
                                          <span key={type} className={['rounded-full px-2.5 py-1 text-xs font-medium', m.badgeClass].join(' ')}>
                                            {m.label}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    <Link
                                      to={'/courses/' + courseId + '/lessons/' + lesson.id}
                                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                    >
                                      Xem nội dung →
                                    </Link>
                                    {canTrackLessonProgress && lesson.status !== 'done' && (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkLessonCompleted(lesson.id)}
                                        disabled={lessonProgressLoadingId === lesson.id}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
                                      >
                                        {lessonProgressLoadingId === lesson.id ? 'Đang lưu...' : '✓ Đánh dấu đã học'}
                                      </button>
                                    )}
                                    {canManageLessons && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditLesson(lesson)}
                                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLesson(lesson.id)}
                                          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:border-rose-300 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                                        >
                                          Xóa
                                        </button>
                                      </>
                                    )}
                                  </div>

                                  {/* Edit lesson form */}
                                  {canManageLessons && editingLessonId === lesson.id && (
                                    <form
                                      className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
                                      onSubmit={handleUpdateLesson}
                                    >
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Tiêu đề bài học" value={editingLessonForm.title} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, title: e.target.value }))} required />
                                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" min="1" placeholder="Thứ tự hiển thị" type="number" value={editingLessonForm.orderIndex} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, orderIndex: e.target.value }))} required />
                                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" min="1" placeholder="Thời lượng (phút)" type="number" value={editingLessonForm.duration} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, duration: e.target.value }))} />
                                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" value={editingLessonForm.type} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, type: e.target.value }))}>
                                          {lessonTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        <textarea className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:col-span-2" placeholder="Mô tả bài học" value={editingLessonForm.description} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, description: e.target.value }))} />
                                      </div>
                                      {editingLessonForm.type === 'file' && (
                                        <div className="mt-3 space-y-2">
                                          <input type="file" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(e) => handleUploadEditingLessonFile(e.target.files?.[0])} />
                                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Hoặc nhập link file" value={editingLessonForm.fileUrl} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, fileUrl: e.target.value }))} />
                                          {editingLessonUpload.isUploading && <p className="text-xs text-slate-500">Đang tải file...</p>}
                                          {editingLessonUpload.error && <p className="text-xs text-rose-600">{editingLessonUpload.error}</p>}
                                        </div>
                                      )}
                                      {editingLessonForm.type === 'video' && (
                                        <input className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Link video" value={editingLessonForm.fileUrl} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, fileUrl: e.target.value }))} />
                                      )}
                                      {editingLessonForm.type === 'text' && (
                                        <div className="mt-3 space-y-2">
                                          <input type="file" accept=".doc,.docx" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(e) => handleUploadEditingLessonFile(e.target.files?.[0])} />
                                          {editingLessonUpload.isUploading && <p className="text-xs text-slate-500">Đang tải file...</p>}
                                          {editingLessonUpload.error && <p className="text-xs text-rose-600">{editingLessonUpload.error}</p>}
                                          {editingLessonForm.fileUrl && <p className="text-xs text-emerald-600">File hiện tại: {editingLessonForm.fileUrl.split('/').pop()}</p>}
                                          <p className="text-xs text-slate-400">Chỉ chấp nhận file .doc / .docx</p>
                                        </div>
                                      )}
                                      {editingLessonForm.type === 'quiz' && (
                                        <div className="mt-3 space-y-1">
                                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Quiz ID (UUID)" value={editingLessonForm.quizId} onChange={(e) => setEditingLessonForm((prev) => ({ ...prev, quizId: e.target.value }))} />
                                          <p className="text-xs text-slate-400">Nhập ID của quiz đã tạo hoặc để trống</p>
                                        </div>
                                      )}
                                      {editingLessonError && <p className="mt-2 text-xs text-rose-600">{editingLessonError}</p>}
                                      <div className="mt-3 flex gap-2">
                                        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">Lưu thay đổi</button>
                                        <button type="button" onClick={() => setEditingLessonId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Hủy</button>
                                      </div>
                                    </form>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Create lesson form for teachers */}
                        {canManageLessons && (
                          <div className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                            <form onSubmit={(e) => handleCreateLesson(e, section)} className="px-6 py-4">
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                + Thêm bài học
                              </h4>
                              <div className="grid gap-3 md:grid-cols-2">
                                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Tiêu đề bài học" value={lessonForms[section.id]?.title ?? ''} onChange={(e) => updateLessonForm(section.id, { title: e.target.value })} required />
                                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" min="1" placeholder="Thứ tự" type="number" value={lessonForms[section.id]?.orderIndex ?? (section.lessons?.length ?? 0) + 1} onChange={(e) => updateLessonForm(section.id, { orderIndex: e.target.value })} required />
                                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" min="1" placeholder="Thời lượng (phút)" type="number" value={lessonForms[section.id]?.duration ?? ''} onChange={(e) => updateLessonForm(section.id, { duration: e.target.value })} />
                                <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" value={lessonForms[section.id]?.type ?? 'text'} onChange={(e) => updateLessonForm(section.id, { type: e.target.value })}>
                                  {lessonTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <textarea className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:col-span-2" placeholder="Mô tả bài học" value={lessonForms[section.id]?.description ?? ''} onChange={(e) => updateLessonForm(section.id, { description: e.target.value })} />
                              </div>
                              {lessonForms[section.id]?.type === 'file' && (
                                <div className="mt-3 space-y-2">
                                  <input type="file" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(e) => handleUploadLessonFile(section.id, e.target.files?.[0])} />
                                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Hoặc nhập link file" value={lessonForms[section.id]?.fileUrl ?? ''} onChange={(e) => updateLessonForm(section.id, { fileUrl: e.target.value })} />
                                  {lessonUploadState[section.id]?.isUploading && <p className="text-xs text-slate-500">Đang tải file...</p>}
                                  {lessonUploadState[section.id]?.error && <p className="text-xs text-rose-600">{lessonUploadState[section.id]?.error}</p>}
                                </div>
                              )}
                              {lessonForms[section.id]?.type === 'video' && (
                                <input className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Link video" value={lessonForms[section.id]?.fileUrl ?? ''} onChange={(e) => updateLessonForm(section.id, { fileUrl: e.target.value })} />
                              )}
                              {lessonForms[section.id]?.type === 'text' && (
                                <div className="mt-3 space-y-2">
                                  <input type="file" accept=".doc,.docx" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(e) => handleUploadLessonFile(section.id, e.target.files?.[0])} />
                                  {lessonUploadState[section.id]?.isUploading && <p className="text-xs text-slate-500">Đang tải file...</p>}
                                  {lessonUploadState[section.id]?.error && <p className="text-xs text-rose-600">{lessonUploadState[section.id]?.error}</p>}
                                  {lessonForms[section.id]?.fileUrl && <p className="text-xs text-emerald-600">Đã tải: {lessonForms[section.id]?.fileUrl.split('/').pop()}</p>}
                                  <p className="text-xs text-slate-400">Chỉ chấp nhận file .doc / .docx</p>
                                </div>
                              )}
                              {lessonForms[section.id]?.type === 'quiz' && (
                                <div className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-400/20 dark:bg-indigo-400/10">
                                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Tạo quiz mới từ CSV</p>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Tiêu đề quiz" value={quizImportForms[section.id]?.title ?? ''} onChange={(e) => updateQuizImportForm(section.id, { title: e.target.value })} />
                                    <input type="number" min="1" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Thời lượng (phút)" value={quizImportForms[section.id]?.timeLimit ?? 10} onChange={(e) => updateQuizImportForm(section.id, { timeLimit: e.target.value })} />
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Mở từ (tùy chọn)</label>
                                      <input type="datetime-local" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" value={quizImportForms[section.id]?.openTime ?? ''} onChange={(e) => updateQuizImportForm(section.id, { openTime: e.target.value })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Đóng lúc (tùy chọn)</label>
                                      <input type="datetime-local" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" value={quizImportForms[section.id]?.closeTime ?? ''} onChange={(e) => updateQuizImportForm(section.id, { closeTime: e.target.value })} />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-slate-500 mb-1">File CSV câu hỏi (6 cột: câu hỏi, A, B, C, D, đáp án đúng)</label>
                                    <input type="file" accept=".csv" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(e) => handleQuizCsvSelect(section.id, e.target.files?.[0])} />
                                  </div>
                                  {quizImportForms[section.id]?.csvQuestions?.length > 0 && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Đã phân tích: {quizImportForms[section.id].csvQuestions.length} câu hỏi</p>
                                  )}
                                  {quizImportForms[section.id]?.error && (
                                    <p className="text-xs text-rose-600">{quizImportForms[section.id].error}</p>
                                  )}
                                  {quizImportForms[section.id]?.isCreating && (
                                    <p className="text-xs text-slate-500">Đang tạo quiz...</p>
                                  )}
                                </div>
                              )}
                              {lessonFormErrors[section.id] && <p className="mt-2 text-xs text-rose-600">{lessonFormErrors[section.id]}</p>}
                              <button type="submit" className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Thêm bài học</button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Khóa học này chưa có chương hoặc bài học nào.
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
                              {assignment.attachments.length} tệp Ä‘ính kèm
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
              <input
                type="number"
                min="1"
                className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={resourceOrderIndex}
                onChange={(e) => setResourceOrderIndex(e.target.value)}
                placeholder="Thứ tự"
                aria-label="Thứ tự tài nguyên"
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
            const visibleFiles = classResources
              .filter((r) => r.folder_id === currentFolderId)
              .sort(compareOrderIndex);
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
                          Thứ tự {resource.order_index ?? 1} ·{' '}
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
                      Số sinh viên Ä‘ã nộp theo từng bài
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
                                {assignment.submitted_count}/{totalStudents} Ä‘ã nộp
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
        <section className="space-y-4">
          {/* ── Create post area ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!showDiscussionForm ? (
              <button
                type="button"
                onClick={() => {
                  setShowDiscussionForm(true);
                  setDiscussionError('');
                  setDiscussionForm({ title: '', content: '' });
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                  {(currentUser?.full_name ?? '?')[0].toUpperCase()}
                </div>
                <span>Đăng bài cho lớp...</span>
              </button>
            ) : (
              <form onSubmit={handleCreateDiscussion} className="space-y-3">
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold placeholder:font-normal dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Tiêu đề bài đăng..."
                  value={discussionForm.title}
                  onChange={(e) => handleDiscussionFormChange('title', e.target.value)}
                  required
                />
                <textarea
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="Nội dung chi tiết (tùy chọn)..."
                  rows={4}
                  value={discussionForm.content}
                  onChange={(e) => handleDiscussionFormChange('content', e.target.value)}
                />
                {discussionError && (
                  <p className="text-sm text-rose-600 dark:text-rose-300">{discussionError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiscussionForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Đăng
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Post feed ─────────────────────────────────────────────────── */}
          {discussionItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-4xl">📢</p>
              <p className="mt-3 text-base font-semibold text-slate-600 dark:text-slate-300">Chưa có bài đăng nào</p>
              <p className="mt-1 text-sm">Hãy là người đầu tiên đăng bài cho lớp!</p>
            </div>
          )}

          {!USE_MOCK_DATA && discussionItems.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${socketConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
                {socketConnected ? 'Trực tuyến' : 'Đang kết nối...'}
              </span>
            </div>
          )}

          {discussionItems.map((post) => {
            const canDeletePost = post.createdBy === currentUser?.id || currentUser?.role === 'TEACHER';
            const isCommentsOpen = selectedDiscussionId === post.id;
            const isContentExpanded = expandedContents.includes(post.id);
            const hasLongContent = (post.content ?? '').length > 300;
            const avatarColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500', 'bg-sky-500'];
            const avatarColor = avatarColors[(post.author?.full_name ?? '').charCodeAt(0) % avatarColors.length];

            return (
              <article key={post.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Left accent bar */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 rounded-l-2xl bg-indigo-500" />

                  <div className="min-w-0 flex-1 p-5">
                    {/* Post header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor}`}>
                          {(post.author?.full_name ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {post.author?.full_name ?? 'Thành viên'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatChatTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {canDeletePost && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDiscussion(post.id)}
                          className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {/* Post title */}
                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                      {post.title}
                    </h3>

                    {/* Post content */}
                    {post.content && (
                      <div className="mt-2">
                        <p className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${!isContentExpanded && hasLongContent ? 'line-clamp-4' : ''}`}>
                          {post.content}
                        </p>
                        {hasLongContent && (
                          <button
                            type="button"
                            onClick={() => toggleExpandContent(post.id)}
                            className="mt-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action bar */}
                    <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                          isCommentsOpen
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Bình luận
                        {isCommentsOpen && discussionMessages.length > 0 && (
                          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs dark:bg-indigo-400/20">
                            {discussionMessages.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Comments section */}
                    {isCommentsOpen && (
                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {isLoadingMessages && (
                          <p className="text-center text-sm text-slate-400">Đang tải bình luận...</p>
                        )}
                        {discussionMessages.length === 0 && !isLoadingMessages && (
                          <p className="text-center text-sm text-slate-400">Chưa có bình luận. Hãy là người đầu tiên!</p>
                        )}

                        {discussionMessages.map((msg) => {
                          const isOwn = msg.user_id === currentUser?.id;
                          const canEdit = isOwn;
                          const canDeleteMsg = isOwn || currentUser?.role === 'TEACHER';
                          const msgColor = avatarColors[(msg.author?.full_name ?? '').charCodeAt(0) % avatarColors.length];
                          return (
                            <div key={msg.id} className="group flex gap-3">
                              <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${msgColor}`}>
                                {(msg.author?.full_name ?? '?')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="rounded-2xl rounded-tl-sm bg-slate-50 px-3 py-2 dark:bg-slate-800">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                      {msg.author?.full_name ?? 'Thành viên'}
                                    </span>
                                    <span className="text-xs text-slate-400">{formatChatTime(msg.created_at)}</span>
                                  </div>
                                  {editingMessageId === msg.id ? (
                                    <form className="mt-1 flex gap-2" onSubmit={handleUpdateMessage}>
                                      <input
                                        autoFocus
                                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
                                        value={editingMessageContent}
                                        onChange={(e) => setEditingMessageContent(e.target.value)}
                                      />
                                      <button type="submit" className="rounded bg-indigo-600 px-2 py-1 text-xs text-white">Lưu</button>
                                      <button type="button" onClick={() => setEditingMessageId(null)} className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-300">Hủy</button>
                                    </form>
                                  ) : (
                                    <div className="mt-0.5">
                                      {msg.content?.trim() && (
                                        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                                          {msg.content}
                                        </p>
                                      )}
                                      {msg.image_url && (
                                        <a href={msg.image_url} target="_blank" rel="noreferrer" className="mt-1.5 block">
                                          <img
                                            src={msg.image_url}
                                            alt="ảnh đính kèm"
                                            className="max-h-60 rounded-xl border border-slate-200 object-contain dark:border-slate-700"
                                          />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {!editingMessageId && (canEdit || canDeleteMsg) && (
                                  <div className="ml-1 mt-0.5 hidden gap-2 group-hover:flex">
                                    {canEdit && (
                                      <button type="button" onClick={() => handleStartEditMessage(msg)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        Sửa
                                      </button>
                                    )}
                                    {canDeleteMsg && (
                                      <button type="button" onClick={() => handleDeleteMessage(msg.id)} className="text-xs text-rose-400 hover:text-rose-600">
                                        Xóa
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Comment input */}
                        <div className="flex gap-3 pt-1">
                          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                            {(currentUser?.full_name ?? '?')[0].toUpperCase()}
                          </div>
                          <form className="flex flex-1 flex-col gap-2" onSubmit={handleCreateMessage}>
                            {/* Image preview */}
                            {messageImagePreview && (
                              <div className="relative inline-block self-start">
                                <img
                                  src={messageImagePreview}
                                  alt="preview"
                                  className="h-24 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                                />
                                {isUploadingImage && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                    <span className="text-xs text-white">Đang tải...</span>
                                  </div>
                                )}
                                {!isUploadingImage && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="Viết bình luận..."
                                value={messageForm}
                                onChange={(e) => setMessageForm(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCreateMessage(e);
                                  }
                                }}
                              />
                              {/* Image upload button */}
                              <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                              />
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-40 dark:border-slate-700 dark:hover:border-indigo-500"
                              >
                                <ImageIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="submit"
                                disabled={(!messageForm.trim() && !messageImageUrl) || isUploadingImage}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </form>
                        </div>
                        {messageError && (
                          <p className="text-xs text-rose-600 dark:text-rose-300">{messageError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

        </section>
      )}
    </main>
  );
}
