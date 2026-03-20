import { createContext, useEffect, useState } from "react";
import {
  adminLogin as adminLoginRequest,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";

export const AuthContext = createContext();

function persistSession(data, setUser) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setUser(data.user);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginRequest({ email, password });
      persistSession(data, setUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const data = await adminLoginRequest({ email, password });
      persistSession(data, setUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerRequest({ name, email, password });
      persistSession(data, setUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
