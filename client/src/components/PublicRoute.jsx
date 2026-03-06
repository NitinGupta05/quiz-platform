import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // If still loading, show a loading indicator
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

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children || <Outlet />;
}

export default PublicRoute;

