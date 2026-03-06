import { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Layouts
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import AuthLayout from "./layout/AuthLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import UserAwareLayout from "./components/UserAwareLayout";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Quizzes from "./pages/Quizzes";
import QuizIntro from "./pages/QuizIntro";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ManageQuizzes from "./pages/ManageQuizzes";
import ManageUsers from "./pages/ManageUsers";
import Analytics from "./pages/Analytics";

import "./index.css";

// Handle post-login redirects
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

function AppRoutes() {
  return (
    <>
      <AuthHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/quizzes" element={<UserAwareLayout><Quizzes /></UserAwareLayout>} />
        <Route path="/leaderboard" element={<UserAwareLayout><Leaderboard /></UserAwareLayout>} />
        <Route path="/leaderboard/:id" element={<UserAwareLayout><Leaderboard /></UserAwareLayout>} />
        <Route path="/about" element={<UserAwareLayout><About /></UserAwareLayout>} />
        <Route path="/quiz/:id" element={<QuizIntro />} />

        {/* Guest-only auth routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        {/* Any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/quiz/:id/start" element={<Quiz />} />
          <Route path="/result/:attemptId" element={<Result />} />
        </Route>

        {/* User routes */}
        <Route element={<UserRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin routes */}
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

        {/* Backward-compatible aliases */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;

