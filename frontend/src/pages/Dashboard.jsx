import { getMockCurrentUser } from '../mocks/auth/mockSession';
import {
  getStudentDashboardData,
  getTeacherDashboardData,
} from '../services/dataSource';
import StudentDashboard from './dashboard/StudentDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';

export default function Dashboard() {
  const mockCurrentUser = getMockCurrentUser();
  const role = mockCurrentUser.role;
  const studentData = getStudentDashboardData(mockCurrentUser.id);
  const teacherData = getTeacherDashboardData(mockCurrentUser.id);

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 md:px-8">
      <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm text-indigo-800">
        Dang o mock session role: <span className="font-bold">{role}</span>.
        Doi role tai file <span className="font-mono">src/mocks/auth/mockSession.js</span> de test UI theo vai tro.
      </div>

      {role === 'TEACHER' ? (
        <TeacherDashboard
          courses={teacherData.courses}
          pendingRequests={teacherData.pendingRequests}
        />
      ) : (
        <StudentDashboard courses={studentData.courses} />
      )}
    </main>
  );
}