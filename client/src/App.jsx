import { Suspense, lazy, useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import AuthLayout from "./layout/AuthLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import UserAwareLayout from "./components/UserAwareLayout";

const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const QuizIntro = lazy(() => import("./pages/QuizIntro"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Result = lazy(() => import("./pages/Result"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageQuizzes = lazy(() => import("./pages/ManageQuizzes"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const Analytics = lazy(() => import("./pages/Analytics"));

import "./index.css";

function AuthHandler() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (location.pathname === "/login" || location.pathname === "/register")) {
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin === "true") {
        sessionStorage.removeItem("redirectAfterLogin");
        const path = sessionStorage.getItem("quizAttemptPath");
        sessionStorage.removeItem("quizAttemptPath");
        navigate(path || "/dashboard", { replace: true });
      } else if (user.role === "admin") {
        sessionStorage.removeItem("redirectAfterLogin");
        sessionStorage.removeItem("quizAttemptPath");
        navigate("/admin/dashboard", { replace: true });
      } else {
        sessionStorage.removeItem("redirectAfterLogin");
        sessionStorage.removeItem("quizAttemptPath");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return null;
}

function RouteLoader() {
  return <div className="loading">Loading page...</div>;
}

function AppRoutes() {
  return (
    <>
      <AuthHandler />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quizzes" element={<UserAwareLayout><Quizzes /></UserAwareLayout>} />
          <Route path="/leaderboard" element={<UserAwareLayout><Leaderboard /></UserAwareLayout>} />
          <Route path="/leaderboard/:id" element={<UserAwareLayout><Leaderboard /></UserAwareLayout>} />
          <Route path="/about" element={<UserAwareLayout><About /></UserAwareLayout>} />
          <Route path="/quiz/:id" element={<QuizIntro />} />

          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/quiz/:id/start" element={<Quiz />} />
            <Route path="/result/:attemptId" element={<Result />} />
          </Route>

          <Route element={<UserRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/quizzes" element={<ManageQuizzes />} />
              <Route path="/admin/quizzes/create" element={<ManageQuizzes />} />
              <Route path="/admin/quizzes/edit/:id" element={<ManageQuizzes />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/about" element={<About />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
