import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import "./ThemeToggle.css";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={
        isDark ? "Switch to light theme" : "Switch to dark theme"
      }
      title={isDark ? "Light theme" : "Dark theme"}
    >
      <span className="theme-toggle-icon">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
};

export default ThemeToggle;