import { useEffect, useState } from 'react';
import { ArrowLeft, ClipboardList, Clock, HelpCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  getQuizDetailData,
  getQuizDetailFromApi,
  USE_MOCK_DATA,
} from '../services/dataSource';

export default function QuizDetail() {
  const { courseId, quizId } = useParams();
  const [quizData, setQuizData] = useState(() =>
    USE_MOCK_DATA ? getQuizDetailData(courseId, quizId) : null,
  );
  const [isLoading, setIsLoading] = useState(!USE_MOCK_DATA);
  const [error, setError] = useState('');

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
        if (isMounted) setQuizData(data);
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
  }, [courseId, quizId]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Đang tải quiz...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center text-rose-700 transition-colors dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <h1 className="text-2xl font-bold">Không tải được quiz</h1>
          <p className="mt-2 text-sm">{error}</p>
          <Link
            to={`/courses/${courseId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
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
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy quiz
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Quiz bạn truy cập không tồn tại trong khóa học hiện tại.
          </p>
          <Link
            to={`/courses/${courseId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại khóa học
          </Link>
        </div>
      </main>
    );
  }

  const questionItems = quizData.questions ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-10 transition-colors md:px-8">
      <Link
        to={`/courses/${courseId}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Danh sách câu hỏi
        </h2>
        {questionItems.length > 0 ? (
          <div className="mt-4 space-y-4">
            {questionItems.map((question, index) => (
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
