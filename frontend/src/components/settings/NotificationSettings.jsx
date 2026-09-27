import {
  Bell,
} from "lucide-react";

import {
  useState,
} from "react";

const NotificationSettings = () => {
  const [
    preferences,
    setPreferences,
  ] = useState({
    documentProcessing: true,
    projectUpdates: true,
    aiCompletion: true,
    recommendations: true,
    email: false,
  });

  const toggle = (key) => {
    setPreferences(
      (current) => ({
        ...current,
        [key]: !current[key],
      })
    );
  };

  const rows = [
    {
      key: "documentProcessing",
      title:
        "Document processing",
      description:
        "Notify me when uploaded documents finish processing.",
    },
    {
      key: "projectUpdates",
      title: "Project activity",
      description:
        "Receive updates about research project activity.",
    },
    {
      key: "aiCompletion",
      title:
        "AI research completion",
      description:
        "Notify me when longer AI research tasks are complete.",
    },
    {
      key: "recommendations",
      title:
        "Research recommendations",
      description:
        "Receive relevant paper and research recommendations.",
    },
    {
      key: "email",
      title:
        "Email notifications",
      description:
        "Send important research notifications by email.",
    },
  ];

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <Bell size={20} />
        </span>

        <div>
          <h2>Notifications</h2>

          <p>
            Choose which research
            updates you want to
            receive.
          </p>
        </div>
      </div>

      <div className="settings-toggle-list">
        {rows.map((item) => (
          <label
            key={item.key}
            className="setting-toggle"
          >
            <div>
              <strong>
                {item.title}
              </strong>

              <p>
                {item.description}
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                preferences[
                  item.key
                ]
              }
              onChange={() =>
                toggle(item.key)
              }
            />

            <span className="toggle-control" />
          </label>
        ))}
      </div>
    </section>
  );
};

export default NotificationSettings;