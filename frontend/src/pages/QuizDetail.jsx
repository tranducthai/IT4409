import { ArrowLeft, ClipboardList, Clock, HelpCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    createQuestion,
    deleteQuestion,
    getQuestionsByQuiz,
    updateQuestion,
} from '../services/api/questions.service';
import { deleteQuiz, updateQuiz } from '../services/api/quizzes.service';
import { getCurrentUser } from '../services/api/session';
import {
    getQuizDetailData,
    getQuizDetailFromApi,
    getAttemptResult,
    listMyQuizAttempts,
    startQuizAttempt,
    submitQuizAttempt,
    USE_MOCK_DATA,
} from '../services/dataSource';

function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function QuizDetail() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isTeacher = currentUser?.role === 'TEACHER';
  const [quizData, setQuizData] = useState(() =>
    USE_MOCK_DATA ? getQuizDetailData(courseId, quizId) : null,
  );
  const [isLoading, setIsLoading] = useState(!USE_MOCK_DATA);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 10,
    totalQuestions: 0,
    isRandom: false,
  });
  const [quizFormError, setQuizFormError] = useState('');
  const [quizFormSuccess, setQuizFormSuccess] = useState('');
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionForm, setEditingQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });
  const [editingQuestionError, setEditingQuestionError] = useState('');
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [actionError, setActionError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [teacherQuestions, setTeacherQuestions] = useState([]);

  const loadAttemptResult = async (attemptId, options = {}) => {
    const { silent = false } = options;
    if (!attemptId) return null;
    if (!silent) setActionError('');

    try {
      const result = await getAttemptResult(attemptId);
      setAttemptResult(result);
      setSubmitResult(result);
      setSelectedAttemptId(attemptId);
      setAnswers({});
      return result;
    } catch (err) {
      if (!silent) {
        setActionError(err?.message || 'Không tải được kết quả quiz.');
      }
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (USE_MOCK_DATA) {
      setQuizData(getQuizDetailData(courseId, quizId));
      setIsLoading(false);
      setError('');
      return () => {
        isMounted = false;
      };
    }

    const loadQuizDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getQuizDetailFromApi(quizId);
        if (isMounted) {
          setQuizData(data);
          setQuizForm({
            title: data.title ?? '',
            description: data.description ?? '',
            timeLimit: data.timeLimit ?? 0,
            totalQuestions: data.totalQuestions ?? data.questions?.length ?? 0,
            isRandom: Boolean(data.isRandom),
          });
        }
      } catch (err) {
        if (isMounted) {
          setQuizData(null);
          setError(err?.message || 'Không tải được quiz.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadQuizDetail();

    return () => {
      isMounted = false;
    };
  }, [courseId, quizId, reloadToken]);

  useEffect(() => {
    if (USE_MOCK_DATA || isTeacher || !quizId) {
      setAttempts([]);
      setAttemptInfo(null);
      setAttemptResult(null);
      setSelectedAttemptId(null);
      return;
    }
    let isMounted = true;
    const loadAttempts = async () => {
      try {
        const items = await listMyQuizAttempts(quizId);
        if (!isMounted) return;

        const attemptItems = items ?? [];
        setAttempts(attemptItems);

        const now = Date.now();
        const activeAttempt = attemptItems.find((item) => {
          if (item.isSubmitted) return false;
          if (!item.expiresAt) return true;
          return Date.parse(item.expiresAt) > now;
        });

        if (activeAttempt) {
          setAttemptInfo(activeAttempt);
          setAttemptResult(null);
          setSubmitResult(null);
          setSelectedAttemptId(activeAttempt.attemptId);
          return;
        }

        setAttemptInfo(null);
        const latestSubmitted = attemptItems.find((item) => item.isSubmitted);
        if (latestSubmitted) {
          void loadAttemptResult(latestSubmitted.attemptId, { silent: true });
        } else {
          setAttemptResult(null);
          setSubmitResult(null);
          setSelectedAttemptId(null);
        }
      } catch {
        if (isMounted) {
          setAttempts([]);
          setAttemptInfo(null);
        }
      }
    };
    void loadAttempts();
    return () => {
      isMounted = false;
    };
  }, [quizId, isTeacher, reloadToken]);

  useEffect(() => {
    if (USE_MOCK_DATA || isTeacher || !attemptInfo?.expiresAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [attemptInfo?.expiresAt, isTeacher]);

  useEffect(() => {
    if (!isTeacher || USE_MOCK_DATA || !quizId) {
      setTeacherQuestions([]);
      return;
    }
    let isMounted = true;
    const loadTeacherQuestions = async () => {
      try {
        const items = await getQuestionsByQuiz(quizId);
        if (isMounted) setTeacherQuestions(items ?? []);
      } catch {
        if (isMounted) setTeacherQuestions([]);
      }
    };
    void loadTeacherQuestions();
    return () => {
      isMounted = false;
    };
  }, [quizId, isTeacher, reloadToken]);

  const questionItems = useMemo(
    () => (isTeacher ? teacherQuestions : quizData?.questions ?? []),
    [isTeacher, teacherQuestions, quizData],
  );
  const normalizedQuestions = useMemo(
    () =>
      (questionItems ?? []).map((question) => ({
        id: question.id,
        text: question.text ?? question.question_text,
        option_a: question.option_a ?? question.optionA,
        option_b: question.option_b ?? question.optionB,
        option_c: question.option_c ?? question.optionC,
        option_d: question.option_d ?? question.optionD,
        correct_answer: question.correct_answer ?? question.correctAnswer,
        options: question.options ?? [
          { key: 'A', text: question.option_a },
          { key: 'B', text: question.option_b },
          { key: 'C', text: question.option_c },
          { key: 'D', text: question.option_d },
        ].filter((option) => option.text),
      })),
    [questionItems],
  );
  const questionById = useMemo(
    () => new Map(normalizedQuestions.map((question) => [question.id, question])),
    [normalizedQuestions],
  );
  const selectedAnswers = useMemo(() => answers, [answers]);
  const activeAttemptRemainingSeconds = attemptInfo?.expiresAt
    ? Math.max(0, Math.ceil((Date.parse(attemptInfo.expiresAt) - clockNow) / 1000))
    : 0;
  const isAttemptExpired = Boolean(attemptInfo?.expiresAt && activeAttemptRemainingSeconds <= 0);
  const hasActiveAttempt = Boolean(attemptInfo && !isAttemptExpired);
  const answeredCount = normalizedQuestions.filter((question) => selectedAnswers[question.id]).length;
  const allQuestionsAnswered =
    normalizedQuestions.length > 0 && answeredCount === normalizedQuestions.length;
  const canAnswerQuiz = hasActiveAttempt && !attemptResult && !submitResult;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Đang tải quiz...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center text-rose-700 transition-colors dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <h1 className="text-2xl font-bold">Không tải được quiz</h1>
          <p className="mt-2 text-sm">{error}</p>
          <Link
            to={`/courses/${courseId}`}
            className="action-btn mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại khóa học
          </Link>
        </div>
      </main>
    );
  }

  if (!quizData) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy quiz
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Quiz bạn truy cập không tồn tại trong khóa học hiện tại.
          </p>
          <Link
            to={`/courses/${courseId}`}
            className="action-btn mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại khóa học
          </Link>
        </div>
      </main>
    );
  }

  const handleStartAttempt = async () => {
    if (USE_MOCK_DATA) {
      setActionError('Chế độ mock chưa hỗ trợ làm quiz.');
      return;
    }
    setActionError('');
    setIsStarting(true);
    try {
      const attempt = await startQuizAttempt(quizId);
      setAttemptInfo(attempt);
      setAttemptResult(null);
      setSubmitResult(null);
      setSelectedAttemptId(attempt.attemptId);
      setAnswers({});
      setClockNow(Date.now());
    } catch (err) {
      setActionError(err?.message || 'Không bắt đầu được quiz.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectAnswer = (questionId, value) => {
    if (!canAnswerQuiz) {
      setActionError('Bạn cần bắt đầu lượt làm bài còn thời gian trước khi chọn đáp án.');
      return;
    }
    setActionError('');
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!attemptInfo?.attemptId) {
      setActionError('Bạn cần bắt đầu quiz trước khi nộp.');
      return;
    }
    if (normalizedQuestions.length === 0) {
      setActionError('Quiz này chưa có câu hỏi để nộp.');
      return;
    }
    if (!allQuestionsAnswered) {
      setActionError('Bạn cần trả lời tất cả câu hỏi trước khi nộp.');
      return;
    }

    const expiresAt = attemptInfo.expiresAt ? Date.parse(attemptInfo.expiresAt) : null;
    if (expiresAt && Date.now() > expiresAt) {
      setActionError('Lượt làm bài này đã hết thời gian.');
      return;
    }

    setActionError('');
    setIsSubmitting(true);
    try {
      const payload = {
        attempt_id: attemptInfo.attemptId,
        answers: normalizedQuestions
          .filter((q) => selectedAnswers[q.id])
          .map((q) => ({
            question_id: q.id,
            selected_answer: selectedAnswers[q.id],
          })),
      };
      const result = await submitQuizAttempt(quizId, payload);
      await loadAttemptResult(result.attemptId, { silent: true });
      setSubmitResult(result);
      setAttemptInfo(null);
      setAnswers({});
      setReloadToken((value) => value + 1);
    } catch (err) {
      setActionError(err?.message || 'Không nộp được quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuiz = async (event) => {
    event.preventDefault();
    setQuizFormError('');
    setQuizFormSuccess('');
    if (USE_MOCK_DATA) {
      setQuizFormError('Chế độ mock chưa hỗ trợ cập nhật quiz.');
      return;
    }
    try {
      await updateQuiz(quizId, {
        title: quizForm.title.trim(),
        description: quizForm.description.trim() || undefined,
        time_limit: Math.max(1, Number(quizForm.timeLimit) || 1),
        total_questions: Math.max(0, Number(quizForm.totalQuestions) || 0),
        is_random: Boolean(quizForm.isRandom),
      });
      setQuizFormSuccess('Đã cập nhật quiz.');
      setReloadToken((value) => value + 1);
    } catch (err) {
      setQuizFormError(err?.message || 'Không cập nhật được quiz.');
    }
  };

  const handleDeleteQuiz = async () => {
    if (USE_MOCK_DATA) {
      setQuizFormError('Chế độ mock chưa hỗ trợ xóa quiz.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa quiz này?')) return;
    try {
      await deleteQuiz(quizId);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setQuizFormError(err?.message || 'Không xóa được quiz.');
    }
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    setQuestionError('');
    setQuestionSuccess('');
    if (USE_MOCK_DATA) {
      setQuestionError('Chế độ mock chưa hỗ trợ tạo câu hỏi.');
      return;
    }
    try {
      await createQuestion({
        quiz_id: quizId,
        question_text: questionForm.questionText.trim(),
        option_a: questionForm.optionA.trim(),
        option_b: questionForm.optionB.trim(),
        option_c: questionForm.optionC.trim(),
        option_d: questionForm.optionD.trim(),
        correct_answer: questionForm.correctAnswer,
      });
      setQuestionForm({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      });
      setQuestionSuccess('Đã thêm câu hỏi.');
      setReloadToken((value) => value + 1);
    } catch (err) {
      setQuestionError(err?.message || 'Không tạo được câu hỏi.');
    }
  };

  const handleStartEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditingQuestionForm({
      questionText: question.text ?? '',
      optionA: question.option_a ?? question.optionA ?? '',
      optionB: question.option_b ?? question.optionB ?? '',
      optionC: question.option_c ?? question.optionC ?? '',
      optionD: question.option_d ?? question.optionD ?? '',
      correctAnswer: question.correct_answer ?? question.correctAnswer ?? 'A',
    });
    setEditingQuestionError('');
  };

  const handleUpdateQuestion = async (event) => {
    event.preventDefault();
    setEditingQuestionError('');
    if (USE_MOCK_DATA) {
      setEditingQuestionError('Chế độ mock chưa hỗ trợ chỉnh sửa câu hỏi.');
      return;
    }
    try {
      await updateQuestion(editingQuestionId, {
        question_text: editingQuestionForm.questionText.trim(),
        option_a: editingQuestionForm.optionA.trim(),
        option_b: editingQuestionForm.optionB.trim(),
        option_c: editingQuestionForm.optionC.trim(),
        option_d: editingQuestionForm.optionD.trim(),
        correct_answer: editingQuestionForm.correctAnswer,
      });
      setEditingQuestionId(null);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingQuestionError(err?.message || 'Không cập nhật được câu hỏi.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (USE_MOCK_DATA) {
      setEditingQuestionError('Chế độ mock chưa hỗ trợ xóa câu hỏi.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await deleteQuestion(questionId);
      setReloadToken((value) => value + 1);
    } catch (err) {
      setEditingQuestionError(err?.message || 'Không xóa được câu hỏi.');
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 transition-colors md:px-8">
      <Link
        to={`/courses/${courseId}`}
        className="action-btn mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại khóa học
      </Link>

      <section className="rounded-2xl border border-indigo-100 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
              <ClipboardList className="h-4 w-4" />
              Quiz của lớp
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">
              {quizData.title}
            </h1>
            {quizData.description && (
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {quizData.description}
              </p>
            )}
          </div>

          <div className="grid min-w-44 gap-2 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <p className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                Thời lượng
              </p>
              <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                {quizData.timeLimit || 0} phút
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <p className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <HelpCircle className="h-4 w-4" />
                Số câu hỏi
              </p>
              <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                {quizData.totalQuestions || questionItems.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isTeacher && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quản lý quiz</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin quiz</p>
            </div>
            <button
              type="button"
              onClick={handleDeleteQuiz}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
            >
              Xóa quiz
            </button>
          </div>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleUpdateQuiz}>
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Tiêu đề quiz"
              value={quizForm.title}
              onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              min="1"
              type="number"
              placeholder="Thời lượng (phút)"
              value={quizForm.timeLimit}
              onChange={(event) => setQuizForm((prev) => ({ ...prev, timeLimit: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              min="0"
              type="number"
              placeholder="Số câu hỏi"
              value={quizForm.totalQuestions}
              onChange={(event) => setQuizForm((prev) => ({ ...prev, totalQuestions: event.target.value }))}
              required
            />
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                checked={quizForm.isRandom}
                onChange={(event) => setQuizForm((prev) => ({ ...prev, isRandom: event.target.checked }))}
              />
              Trộn câu hỏi
            </label>
            <textarea
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
              placeholder="Mô tả"
              value={quizForm.description}
              onChange={(event) => setQuizForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            {quizFormError && (
              <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                {quizFormError}
              </div>
            )}
            {quizFormSuccess && (
              <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                {quizFormSuccess}
              </div>
            )}
            <button type="submit" className="md:col-span-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Lưu thay đổi
            </button>
          </form>
        </section>
      )}

      {!isTeacher && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Làm quiz</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chọn đáp án và nộp bài</p>
            </div>
            <button
              type="button"
              onClick={handleStartAttempt}
              disabled={isStarting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isStarting ? 'Đang bắt đầu...' : attemptInfo && !isAttemptExpired ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
            </button>
          </div>
          {attemptInfo && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Bắt đầu lúc: {new Date(attemptInfo.startTime).toLocaleString('vi-VN')}</span>
              <span>Hết hạn: {new Date(attemptInfo.expiresAt).toLocaleString('vi-VN')}</span>
              <span className={isAttemptExpired ? 'font-semibold text-rose-600 dark:text-rose-300' : 'font-semibold text-emerald-600 dark:text-emerald-300'}>
                {isAttemptExpired ? 'Đã hết hạn' : `Còn lại ${formatCountdown(activeAttemptRemainingSeconds)}`}
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Đã trả lời {answeredCount}/{normalizedQuestions.length}
              </span>
            </div>
          )}
          {actionError && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-200">{actionError}</p>
          )}
          {submitResult && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              Bạn trả lời đúng {submitResult.correct}/{submitResult.totalQuestions}. Điểm: {submitResult.score}.
            </div>
          )}
          {attemptResult && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                    Kết quả lượt làm bài
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                    {attemptResult.isSubmitted ? 'Đã nộp bài' : 'Đang xem kết quả'}
                  </h3>
                </div>
                <div className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-right dark:border-indigo-400/30 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Điểm</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {Math.round(Number(attemptResult.score ?? 0))}%
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  Đúng: {attemptResult.correct}/{attemptResult.totalQuestions}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  Bắt đầu: {attemptResult.startTime ? new Date(attemptResult.startTime).toLocaleString('vi-VN') : 'N/A'}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  Nộp: {attemptResult.endTime ? new Date(attemptResult.endTime).toLocaleString('vi-VN') : 'Chưa nộp'}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(attemptResult.answers ?? []).length > 0 ? (
                  attemptResult.answers.map((answer) => {
                    const question = questionById.get(answer.questionId);
                    return (
                      <div
                        key={answer.questionId}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          answer.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                            : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200'
                        }`}
                      >
                        <div className="font-semibold">
                          {question?.text ?? `Câu hỏi ${answer.questionId}`}
                        </div>
                        <div className="mt-1 text-xs">
                          Đáp án đã chọn: {answer.selectedAnswer} · {answer.isCorrect ? 'Chính xác' : 'Chưa đúng'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    Chưa có dữ liệu trả lời cho lượt làm bài này.
                  </div>
                )}
              </div>
            </div>
          )}
          {attempts.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lịch sử làm bài</h3>
              <div className="mt-3 space-y-2">
                {attempts.map((attempt) => {
                  const expired = !attempt.isSubmitted && attempt.expiresAt
                    ? Date.parse(attempt.expiresAt) <= clockNow
                    : false;
                  const isActive = attempt.attemptId === attemptInfo?.attemptId;
                  const isSelected = attempt.attemptId === selectedAttemptId;
                  const status = attempt.isSubmitted
                    ? 'Đã nộp'
                    : expired
                      ? 'Hết hạn'
                      : isActive
                        ? 'Đang làm'
                        : 'Đang mở';

                  return (
                    <button
                      key={attempt.attemptId}
                      type="button"
                      onClick={() => {
                        if (attempt.isSubmitted) {
                          void loadAttemptResult(attempt.attemptId);
                          return;
                        }
                        if (expired) {
                          setActionError('Lượt làm bài này đã hết hạn.');
                          return;
                        }
                        setAttemptInfo(attempt);
                        setAttemptResult(null);
                        setSubmitResult(null);
                        setSelectedAttemptId(attempt.attemptId);
                        setAnswers({});
                        setClockNow(Date.now());
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-400/10 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          {new Date(attempt.startTime).toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {attempt.isSubmitted
                          ? `Điểm: ${Math.round(Number(attempt.score ?? 0))}%`
                          : expired
                            ? 'Đã quá thời gian làm bài'
                            : `Hết hạn lúc ${new Date(attempt.expiresAt).toLocaleString('vi-VN')}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || !hasActiveAttempt || !allQuestionsAnswered}
            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Danh sách câu hỏi
        </h2>
        {isTeacher && (
          <form className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950" onSubmit={handleCreateQuestion}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Thêm câu hỏi</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:col-span-2"
                placeholder="Nội dung câu hỏi"
                value={questionForm.questionText}
                onChange={(event) => handleQuestionFormChange('questionText', event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Đáp án A"
                value={questionForm.optionA}
                onChange={(event) => handleQuestionFormChange('optionA', event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Đáp án B"
                value={questionForm.optionB}
                onChange={(event) => handleQuestionFormChange('optionB', event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Đáp án C"
                value={questionForm.optionC}
                onChange={(event) => handleQuestionFormChange('optionC', event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Đáp án D"
                value={questionForm.optionD}
                onChange={(event) => handleQuestionFormChange('optionD', event.target.value)}
                required
              />
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={questionForm.correctAnswer}
                onChange={(event) => handleQuestionFormChange('correctAnswer', event.target.value)}
              >
                {['A', 'B', 'C', 'D'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {questionError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                {questionError}
              </div>
            )}
            {questionSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                {questionSuccess}
              </div>
            )}
            <button type="submit" className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
              Thêm câu hỏi
            </button>
          </form>
        )}
        {normalizedQuestions.length > 0 ? (
          <div className="mt-4 space-y-4">
            {normalizedQuestions.map((question, index) => (
              <article
                key={question.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Câu {index + 1}. {question.text}
                </h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {question.options.map((option) => (
                    <div
                      key={`${question.id}-${option.key}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <span className="font-semibold">{option.key}.</span> {option.text}
                    </div>
                  ))}
                </div>
                {!isTeacher && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <label
                        key={`${question.id}-${option}`}
                        className={`inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 ${
                          canAnswerQuiz ? '' : 'opacity-60'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={selectedAnswers[question.id] === option}
                          onChange={() => handleSelectAnswer(question.id, option)}
                          disabled={!canAnswerQuiz || isSubmitting}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {isTeacher && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEditQuestion(question)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-200"
                    >
                      Xóa
                    </button>
                  </div>
                )}

                {isTeacher && editingQuestionId === question.id && (
                  <form className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onSubmit={handleUpdateQuestion}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 md:col-span-2"
                        placeholder="Nội dung câu hỏi"
                        value={editingQuestionForm.questionText}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, questionText: event.target.value }))}
                        required
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        placeholder="Đáp án A"
                        value={editingQuestionForm.optionA}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, optionA: event.target.value }))}
                        required
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        placeholder="Đáp án B"
                        value={editingQuestionForm.optionB}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, optionB: event.target.value }))}
                        required
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        placeholder="Đáp án C"
                        value={editingQuestionForm.optionC}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, optionC: event.target.value }))}
                        required
                      />
                      <input
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        placeholder="Đáp án D"
                        value={editingQuestionForm.optionD}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, optionD: event.target.value }))}
                        required
                      />
                      <select
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        value={editingQuestionForm.correctAnswer}
                        onChange={(event) => setEditingQuestionForm((prev) => ({ ...prev, correctAnswer: event.target.value }))}
                      >
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    {editingQuestionError && (
                      <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                        {editingQuestionError}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">Lưu</button>
                      <button type="button" onClick={() => setEditingQuestionId(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">Hủy</button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            Quiz này chưa có câu hỏi nào.
          </div>
        )}
      </section>
    </main>
  );
}
