import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/login';
import Register from './pages/register';
import {
  DashboardRoute,
  RequireAuth,
  RequireGuest,
  RequireRole,
} from './components/RouteGuards';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-blue-50">
        <Header />

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
              path="/dashboard/student"
              element={
                <RequireAuth>
                  <RequireRole allowedRoles={['STUDENT', 'ADMIN']}>
                    <Dashboard />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/teacher"
              element={
                <RequireAuth>
                  <RequireRole allowedRoles={['TEACHER']} fallbackPath="/dashboard/student">
                    <Dashboard />
                  </RequireRole>
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
  );
}

export default App;