import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ThemeContext = createContext(null);

const THEME_KEY = "researcify_theme";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  const resolvedTheme =
    theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      resolvedTheme
    );

    localStorage.setItem(THEME_KEY, theme);
  }, [theme, resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};