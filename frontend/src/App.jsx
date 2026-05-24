import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import DevModeBanner from './components/DevModeBanner';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import QuizDetail from './pages/QuizDetail';
import Login from './pages/login';
import Register from './pages/register';
import {
  DashboardRoute,
  RequireAuth,
  RequireGuest,
  RequireRole,
} from './components/RouteGuards';
import { ThemeProvider } from './context/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
          <Header />
          <DevModeBanner />

          <main className="flex-grow">
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
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardRoute />
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
                path="/courses/:courseId"
                element={
                  <RequireAuth>
                    <CourseDetail />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
