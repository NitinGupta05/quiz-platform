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
  background: "#0f1720",
  "background-elevated": "#16212d",
  surface: "#182431",
  "surface-muted": "#223143",
  primary: "#4fd1c5",
  "primary-dark": "#2dd4bf",
  "primary-soft": "rgba(79, 209, 197, 0.12)",
  secondary: "#f59e0b",
  text: "#f4f7fb",
  "text-secondary": "#a9b8c8",
  border: "#2b3d51",
  success: "#48bb78",
  warning: "#f6ad55",
  danger: "#fc8181",
  "surface-hover": "#223244",
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

