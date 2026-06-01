import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addStudentByStudentCode,
    approveJoinRequest,
    createClass,
    deleteClass,
    getPendingClassRequests,
    getStudentClasses,
    getTeacherClasses,
    rejectJoinRequest,
    requestJoinByCode,
    updateClass,
} from '../services/api/classes.service';
import { getAccessToken } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';
import {
    getStudentDashboardData,
    getTeacherDashboardData,
    USE_MOCK_DATA,
} from '../services/dataSource';
import AdminDashboard from './dashboard/AdminDashboard';
 import StudentDashboard from './dashboard/StudentDashboard';
 import TeacherDashboard from './dashboard/TeacherDashboard';
 
 function normalizeClassType(value) {
   return value === 'CLOSED' ? 'CLOSED' : 'OPEN';
 }
 
 function toNullableTrimmed(value) {
   if (typeof value !== 'string') return null;
   const trimmed = value.trim();
   return trimmed || null;
 }
 
 function normalizeClassPayload(payload = {}) {
   return {
     name: String(payload.name ?? '').trim(),
     description: toNullableTrimmed(payload.description),
     avatar_url: toNullableTrimmed(payload.avatar_url),
     type: normalizeClassType(payload.type),
     join_code: String(payload.join_code ?? '').trim().toUpperCase(),
     is_active: payload.is_active !== false,
     teacher_id: payload.teacher_id,
   };
 }
 
 function normalizeClassUpdatePayload(payload = {}) {
   const normalized = {};
 
   if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
     normalized.name = String(payload.name ?? '').trim();
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
     normalized.description = toNullableTrimmed(payload.description);
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'avatar_url')) {
     normalized.avatar_url = toNullableTrimmed(payload.avatar_url);
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'type')) {
     normalized.type = normalizeClassType(payload.type);
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'join_code')) {
     normalized.join_code = String(payload.join_code ?? '').trim().toUpperCase();
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'is_active')) {
     normalized.is_active = Boolean(payload.is_active);
   }
   if (Object.prototype.hasOwnProperty.call(payload, 'teacher_id')) {
     normalized.teacher_id = payload.teacher_id;
   }
 
   return normalized;
 }
 
 export default function Dashboard() {
  const currentUser = getCurrentUser();
  const role = currentUser?.role ?? 'STUDENT';
  const userId = currentUser?.id;
  const [studentCourses, setStudentCourses] = useState([]);
  const [studentError, setStudentError] = useState('');
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherPending, setTeacherPending] = useState([]);
  const [teacherError, setTeacherError] = useState('');
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(false);

  const studentData = useMemo(() => getStudentDashboardData(userId), [userId]);
  const teacherData = useMemo(() => getTeacherDashboardData(userId), [userId]);

  useEffect(() => {
    if (USE_MOCK_DATA || role !== 'STUDENT') {
      setStudentCourses(studentData.courses ?? []);
      return;
    }

    let isMounted = true;
    const loadStudentClasses = async () => {
      setIsLoadingStudent(true);
      setStudentError('');
      try {
        const accessToken = getAccessToken();
        const classes = await getStudentClasses(accessToken);
        const normalized = (classes ?? []).map((cls) => ({
          id: cls.id,
          title: cls.name,
          code: cls.join_code,
          category: cls.type ?? 'Khóa học',
          image: cls.avatar_url || '/favicon.svg',
        }));

        if (isMounted) {
          setStudentCourses(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setStudentError(err?.message || 'Không tải được danh sách lớp.');
          setStudentCourses([]);
        }
      } finally {
        if (isMounted) setIsLoadingStudent(false);
      }
    };

    void loadStudentClasses();

    return () => {
      isMounted = false;
    };
  }, [role, studentData.courses]);

  const reloadTeacherClasses = useCallback(async () => {
    setIsLoadingTeacher(true);
    setTeacherError('');

    try {
      const accessToken = getAccessToken();
      const classes = await getTeacherClasses(accessToken);
      const normalizedCourses = (classes ?? []).map((cls) => ({
        id: cls.id,
        title: cls.name,
        code: cls.join_code,
        type: cls.type,
        image: cls.avatar_url || '/favicon.svg',
      }));

      const pendingLists = await Promise.all(
        (classes ?? []).map((cls) =>
          getPendingClassRequests(cls.id, accessToken)
            .then((reqs) => (reqs ?? []).map((r) => ({ ...r, class_name: cls.name, class_id: cls.id })))
            .catch(() => []),
        ),
      );
      const normalizedPending = pendingLists.flat();

      setTeacherCourses(normalizedCourses);
      setTeacherPending(normalizedPending);
    } catch (err) {
      setTeacherError(err?.message || 'Không tải được danh sách lớp.');
      setTeacherCourses([]);
      setTeacherPending([]);
    } finally {
      setIsLoadingTeacher(false);
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK_DATA || role !== 'TEACHER') {
      setTeacherCourses(teacherData.courses ?? []);
      setTeacherPending(teacherData.pendingRequests ?? []);
      return;
    }

    void reloadTeacherClasses();
  }, [role, teacherData.courses, teacherData.pendingRequests, reloadTeacherClasses]);

   const handleCreateClass = async (payload) => {
     const accessToken = getAccessToken();
     const normalizedPayload = normalizeClassPayload({
       ...payload,
       teacher_id: userId,
     });
     await createClass(normalizedPayload, accessToken);
     await reloadTeacherClasses();
   };

   const handleUpdateClass = async (classId, payload) => {
     const accessToken = getAccessToken();
     const normalizedPayload = normalizeClassUpdatePayload(payload);
     await updateClass(classId, normalizedPayload, accessToken);
     await reloadTeacherClasses();
   };

  const handleDeleteClass = async (classId) => {
    const accessToken = getAccessToken();
    await deleteClass(classId, accessToken);
    await reloadTeacherClasses();
  };

  const handleApproveRequest = async (requestId) => {
    const accessToken = getAccessToken();
    await approveJoinRequest(requestId, accessToken);
    await reloadTeacherClasses();
  };

  const handleRejectRequest = async (requestId) => {
    const accessToken = getAccessToken();
    await rejectJoinRequest(requestId, accessToken);
    await reloadTeacherClasses();
  };

  const handleAddStudentByCode = async ({ class_id, student_code }) => {
    const accessToken = getAccessToken();
    await addStudentByStudentCode(class_id, student_code, accessToken);
    await reloadTeacherClasses();
  };

  const handleJoinByCode = async (joinCode) => {
    const accessToken = getAccessToken();
    await requestJoinByCode(joinCode, accessToken);
    // reload student classes
    const classes = await getStudentClasses(accessToken);
    const normalized = (classes ?? []).map((cls) => ({
      id: cls.id,
      title: cls.name,
      code: cls.join_code,
      category: cls.type ?? 'Khóa học',
      image: cls.avatar_url || '/favicon.svg',
    }));
    setStudentCourses(normalized);
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm text-indigo-800">
        Vai trò hiện tại: <span className="font-bold">{role}</span>.
      </div>

      {role === 'ADMIN' ? (
        <AdminDashboard user={currentUser} />
      ) : role === 'TEACHER' ? (
        <TeacherDashboard
          courses={teacherCourses}
          pendingRequests={teacherPending}
          onCreateClass={handleCreateClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          onAddStudentByCode={handleAddStudentByCode}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          isLoading={isLoadingTeacher}
          error={teacherError}
        />
      ) : (
        <StudentDashboard
          courses={studentCourses}
          isLoading={isLoadingStudent}
          error={studentError}
          onJoinByCode={handleJoinByCode}
        />
      )}
    </main>
  );
}
