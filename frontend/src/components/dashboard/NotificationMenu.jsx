import {
  Bell,
  CheckCheck,
  FileCheck2,
  FolderKanban,
  Sparkles,
} from "lucide-react";

const notifications = [
  {
    icon: Sparkles,
    title: "AI analysis completed",
    text: "Your paper summary is ready to review.",
    time: "2 min ago",
    unread: true,
  },
  {
    icon: FileCheck2,
    title: "Related paper discovered",
    text: "A relevant paper matches AI in Education.",
    time: "18 min ago",
    unread: true,
  },
  {
    icon: FolderKanban,
    title: "Project updated",
    text: "2 papers were added to Sustainable IoT Systems.",
    time: "1 hr ago",
    unread: false,
  },
];

const NotificationMenu = ({
  open,
  onToggle,
  onClose,
}) => {
  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  return (
    <div className="dashboard-dropdown-wrapper">
      <button
        type="button"
        className="dashboard-topbar-icon"
        onClick={onToggle}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="dashboard-notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="dashboard-dropdown-backdrop"
            onClick={onClose}
            aria-label="Close notifications"
          />

          <div className="dashboard-dropdown dashboard-notifications">
            <div className="dashboard-notifications__header">
              <div>
                <strong>Notifications</strong>
                <span>{unreadCount} unread</span>
              </div>

              <button type="button">
                <CheckCheck size={14} />
                Mark all read
              </button>
            </div>

            <div className="dashboard-notifications__list">
              {notifications.map(
                ({
                  icon: Icon,
                  title,
                  text,
                  time,
                  unread,
                }) => (
                  <button
                    type="button"
                    className={`dashboard-notification ${
                      unread ? "unread" : ""
                    }`}
                    key={title}
                  >
                    <div className="dashboard-notification__icon">
                      <Icon size={16} />
                    </div>

                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                      <span>{time}</span>
                    </div>

                    {unread && <i />}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="dashboard-notifications__footer"
            >
              View all notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationMenu;