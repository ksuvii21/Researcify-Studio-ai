import {
  useState,
} from "react";

import SettingsHeader from "../components/settings/SettingsHeader";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import ProfileSettings from "../components/settings/ProfileSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ResearchSettings from "../components/settings/ResearchSettings";
import AISettings from "../components/settings/AISettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import IntegrationsSettings from "../components/settings/IntegrationsSettings";

import "../components/settings/settings.css";

const SettingsPage = () => {
  const [active, setActive] =
    useState("profile");

  const renderSection = () => {
    switch (active) {
      case "appearance":
        return (
          <AppearanceSettings />
        );

      case "notifications":
        return (
          <NotificationSettings />
        );

      case "research":
        return (
          <ResearchSettings />
        );

      case "ai":
        return <AISettings />;

      case "privacy":
        return (
          <PrivacySettings />
        );

      case "integrations":
        return (
          <IntegrationsSettings />
        );

      default:
        return (
          <ProfileSettings />
        );
    }
  };

  return (
    <div className="settings-page">
      <SettingsHeader />

      <div className="settings-layout">
        <SettingsSidebar
          active={active}
          setActive={setActive}
        />

        <main className="settings-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;