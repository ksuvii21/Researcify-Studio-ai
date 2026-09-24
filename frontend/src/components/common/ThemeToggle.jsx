import {
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">

      <button
        type="button"
        onClick={() => setTheme("light")}
        className={
          theme === "light" ? "active" : ""
        }
        title="Light theme"
      >
        <Sun size={17} />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={
          theme === "dark" ? "active" : ""
        }
        title="Dark theme"
      >
        <Moon size={17} />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={
          theme === "system" ? "active" : ""
        }
        title="System theme"
      >
        <Monitor size={17} />
      </button>

    </div>
  );
};

export default ThemeToggle;