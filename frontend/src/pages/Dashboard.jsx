import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addStudentToClass,
    approveJoinRequest,
    createClass,
    deleteClass,
    getPendingClassRequests,
    getStudentClasses,
    getTeacherClasses,
    updateClass,
} from '../services/api/classes.service';
import { getAccessToken } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';
import {
    getStudentDashboardData,
    getTeacherDashboardData,
    USE_MOCK_DATA,
} from '../services/dataSource';
import StudentDashboard from './dashboard/StudentDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';

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
          category: cls.type ?? 'Course',
          image: cls.avatar_url ?? 'https://via.placeholder.com/400x225',
        }));

        if (isMounted) {
          setStudentCourses(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setStudentError(err?.message || 'Khong tai duoc danh sach lop.');
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
        image: cls.avatar_url ?? 'https://via.placeholder.com/400x225',
      }));

      const pendingLists = await Promise.all(
        (classes ?? []).map((cls) => getPendingClassRequests(cls.id, accessToken)),
      );
      const normalizedPending = pendingLists.flat();

      setTeacherCourses(normalizedCourses);
      setTeacherPending(normalizedPending);
    } catch (err) {
      setTeacherError(err?.message || 'Khong tai duoc danh sach lop.');
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
    await createClass(
      {
        ...payload,
        teacher_id: userId,
      },
      accessToken,
    );
    await reloadTeacherClasses();
  };

  const handleUpdateClass = async (classId, payload) => {
    const accessToken = getAccessToken();
    await updateClass(classId, payload, accessToken);
    await reloadTeacherClasses();
  };

  const handleDeleteClass = async (classId) => {
    const accessToken = getAccessToken();
    await deleteClass(classId, accessToken);
    await reloadTeacherClasses();
  };

  const handleAddStudent = async ({ class_id, user_id }) => {
    const accessToken = getAccessToken();
    await addStudentToClass(
      {
        class_id,
        user_id,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      accessToken,
    );
    await reloadTeacherClasses();
  };

  const handleApproveRequest = async (requestId) => {
    const accessToken = getAccessToken();
    await approveJoinRequest(requestId, accessToken);
    await reloadTeacherClasses();
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm text-indigo-800">
        Vai tro hien tai: <span className="font-bold">{role}</span>.
      </div>

      {role === 'TEACHER' ? (
        <TeacherDashboard
          courses={teacherCourses}
          pendingRequests={teacherPending}
          onCreateClass={handleCreateClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          onAddStudent={handleAddStudent}
          onApproveRequest={handleApproveRequest}
          isLoading={isLoadingTeacher}
          error={teacherError}
        />
      ) : (
        <StudentDashboard
          courses={studentCourses}
          isLoading={isLoadingStudent}
          error={studentError}
        />
      )}
    </main>
  );
}