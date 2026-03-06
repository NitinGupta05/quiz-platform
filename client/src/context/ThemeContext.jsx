import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  background: "#FFFBDE",
  surface: "#FFFFFF",
  primary: "#129990",
  "primary-dark": "#096B68",
  secondary: "#90D1CA",
  text: "#1a1a1a",
  "text-secondary": "#666666",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#f44336",
  "surface-hover": "#F5F5F5",
  shadow: "rgba(0, 0, 0, 0.1)",
  "shadow-lg": "rgba(0, 0, 0, 0.15)",
  "shadow-sm": "rgba(0, 0, 0, 0.05)",
  radius: "8px",
  "radius-lg": "12px",
  "radius-md": "8px",
  "radius-sm": "4px",
  "radius-full": "9999px",
  transition: "all 0.2s ease",
};

const darkTheme = {
  background: "#280905",
  surface: "#3D1310",
  primary: "#C3110C",
  "primary-dark": "#E6501B",
  secondary: "#740A03",
  text: "#FFFFFF",
  "text-secondary": "#B0B0B0",
  border: "#4A2020",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#f44336",
  "surface-hover": "#4A1815",
  shadow: "rgba(0, 0, 0, 0.3)",
  "shadow-lg": "rgba(0, 0, 0, 0.4)",
  "shadow-sm": "rgba(0, 0, 0, 0.2)",
  radius: "8px",
  "radius-lg": "12px",
  "radius-md": "8px",
  "radius-sm": "4px",
  "radius-full": "9999px",
  transition: "all 0.2s ease",
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    const theme = isDark ? darkTheme : lightTheme;
    
    // Apply CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

