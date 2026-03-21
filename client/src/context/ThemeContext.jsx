import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  background: "#f4efe6",
  "background-elevated": "#fbf8f2",
  surface: "#FFFFFF",
  "surface-muted": "#f7f2ea",
  primary: "#0f766e",
  "primary-dark": "#115e59",
  "primary-soft": "#d9f1ee",
  secondary: "#d97706",
  text: "#172026",
  "text-secondary": "#51606d",
  border: "#d7dfdf",
  success: "#2f855a",
  warning: "#b7791f",
  danger: "#c53030",
  "surface-hover": "#eef3f1",
  "chrome-bg": "rgba(255, 255, 255, 0.82)",
  "chrome-admin-bg": "rgba(255, 248, 240, 0.88)",
  "panel-bg": "rgba(255, 255, 255, 0.84)",
  "panel-soft": "rgba(255, 255, 255, 0.72)",
  shadow: "rgba(15, 23, 42, 0.12)",
  "shadow-lg": "rgba(15, 23, 42, 0.18)",
  "shadow-sm": "rgba(15, 23, 42, 0.08)",
  radius: "10px",
  "radius-lg": "20px",
  "radius-md": "12px",
  "radius-sm": "4px",
  "radius-full": "9999px",
  transition: "all 0.2s ease",
};

const darkTheme = {
  background: "#0b1320",
  "background-elevated": "#111c2b",
  surface: "#152233",
  "surface-muted": "#1b2a3d",
  primary: "#4fd1c5",
  "primary-dark": "#2dd4bf",
  "primary-soft": "rgba(79, 209, 197, 0.12)",
  secondary: "#f59e0b",
  text: "#f4f7fb",
  "text-secondary": "#a9b8c8",
  border: "#2a3a4e",
  success: "#48bb78",
  warning: "#f6ad55",
  danger: "#fc8181",
  "surface-hover": "#203145",
  "chrome-bg": "rgba(17, 28, 43, 0.9)",
  "chrome-admin-bg": "rgba(24, 34, 49, 0.92)",
  "panel-bg": "rgba(21, 34, 51, 0.94)",
  "panel-soft": "rgba(17, 28, 43, 0.86)",
  shadow: "rgba(0, 0, 0, 0.35)",
  "shadow-lg": "rgba(0, 0, 0, 0.5)",
  "shadow-sm": "rgba(0, 0, 0, 0.25)",
  radius: "10px",
  "radius-lg": "20px",
  "radius-md": "12px",
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
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    const theme = isDark ? darkTheme : lightTheme;

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
