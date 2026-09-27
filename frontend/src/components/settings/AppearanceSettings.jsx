import {
  Check,
  Moon,
  Palette,
  Sun,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

const AppearanceSettings = () => {
  const {
    theme,
    setTheme,
  } = useTheme();

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <Palette size={20} />
        </span>

        <div>
          <h2>Appearance</h2>

          <p>
            Choose how Researcify
            looks across your
            workspace.
          </p>
        </div>
      </div>

      <div className="theme-options">
        <button
          type="button"
          className={
            theme === "dark"
              ? "active"
              : ""
          }
          onClick={() =>
            setTheme("dark")
          }
        >
          <div className="theme-preview theme-preview--dark">
            <span />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="theme-option__label">
            <span>
              <Moon size={17} />
              Dark
            </span>

            {theme === "dark" && (
              <Check size={17} />
            )}
          </div>
        </button>

        <button
          type="button"
          className={
            theme === "light"
              ? "active"
              : ""
          }
          onClick={() =>
            setTheme("light")
          }
        >
          <div className="theme-preview theme-preview--light">
            <span />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="theme-option__label">
            <span>
              <Sun size={17} />
              Light
            </span>

            {theme === "light" && (
              <Check size={17} />
            )}
          </div>
        </button>
      </div>

      <div className="settings-subsection">
        <h3>Interface</h3>

        <SettingToggle
          title="Compact sidebar"
          description="Use a narrower sidebar when possible."
        />

        <SettingToggle
          title="Reduce animations"
          description="Minimize non-essential interface animations."
        />
      </div>
    </section>
  );
};

const SettingToggle = ({
  title,
  description,
}) => {
  return (
    <label className="setting-toggle">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <input type="checkbox" />

      <span className="toggle-control" />
    </label>
  );
};

export default AppearanceSettings;