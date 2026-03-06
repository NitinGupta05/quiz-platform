import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show nothing while loading
  if (loading) {
    return (
      <div className="loading-screen" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    // For quiz flows, redirect to login and preserve intended destination
    if (location.pathname.includes("/start")) {
      return <Navigate to="/login" replace state={{ from: location.pathname, quizAttempt: true }} />;
    }

    if (location.pathname.startsWith("/result/")) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    // For other routes, redirect to home
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;

