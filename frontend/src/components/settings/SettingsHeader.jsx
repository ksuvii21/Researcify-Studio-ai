import {
  Settings,
} from "lucide-react";

const SettingsHeader = () => {
  return (
    <header className="settings-header">
      <span className="settings-eyebrow">
        <Settings size={16} />
        Workspace Preferences
      </span>

      <h1>Settings</h1>

      <p>
        Manage your account, research
        preferences, AI experience,
        notifications and workspace
        appearance.
      </p>
    </header>
  );
};

export default SettingsHeader;