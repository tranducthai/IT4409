import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import DevModeBanner from './components/DevModeBanner';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import QuizDetail from './pages/QuizDetail';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import {
  DashboardRoute,
  RequireAuth,
  RequireGuest,
  RequireRole,
} from './components/RouteGuards';
import { ThemeProvider } from './context/ThemeProvider';

function AppContent() {
  const location = useLocation();
  const isLessonViewer = /\/courses\/[^/]+\/lessons\//.test(location.pathname);

  return (
    <div className={`${isLessonViewer ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100`}>
      {!isLessonViewer && <Header />}
      {!isLessonViewer && <DevModeBanner />}

      <main className={isLessonViewer ? 'flex flex-1 min-h-0 overflow-hidden' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <RequireGuest>
                <Login />
              </RequireGuest>
            }
          />
          <Route
            path="/register"
            element={
              <RequireGuest>
                <Register />
              </RequireGuest>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardRoute />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={['ADMIN']}>
                  <Dashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={['STUDENT']} fallbackPath="/dashboard/admin">
                  <Dashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={['TEACHER']} fallbackPath="/dashboard/admin">
                  <Dashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/courses/:courseId/quizzes/:quizId"
            element={
              <RequireAuth>
                <QuizDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={
              <RequireAuth>
                <LessonViewer />
              </RequireAuth>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <RequireAuth>
                <CourseDetail />
              </RequireAuth>
            }
          />
        </Routes>
      </main>

      {!isLessonViewer && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
