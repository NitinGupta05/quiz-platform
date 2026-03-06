import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";

function UserAwareLayout({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-screen" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (user?.role === "user") {
    return <MainLayout>{children}</MainLayout>;
  }

  return children;
}

export default UserAwareLayout;
