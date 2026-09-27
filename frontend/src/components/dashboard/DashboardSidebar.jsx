import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Library,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Upload,
  Folder,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import Logo from "../common/Logo";

const primaryNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    end: true,
  },
  {
    label: "Discover Papers",
    icon: Search,
    path: "/discover",
  },
  {
    label: "Research Projects",
    icon: FolderKanban,
    path: "/projects",
  },
  {
    label: "Library",
    icon: Library,
    path: "/library",
  },
  {
    label: "Notes",
    icon: NotebookPen,
    path: "/notes",
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    path: "/ai-assistant",
  },
  {
    label: "Uploaded Documents",
    icon: Upload,
    path: "/uploads",
  },
  {
    label: "Collections",
    icon: Folder,
    path: "/collections",
  },
  {
    label: "Activity",
    icon: Activity,
    path: "/activity",
  },
];

const secondaryNavigation = [
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
  {
    label: "Help & Support",
    icon: HelpCircle,
    path: "/help",
  },
];

const DashboardSidebar = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const renderNavItem = ({ label, icon: Icon, path, end }) => (
    <NavLink
      key={label}
      to={path}
      end={end}
      title={collapsed ? label : undefined}
      onClick={onMobileClose}
      className={({ isActive }) =>
        `dashboard-sidebar__link ${isActive ? "active" : ""}`
      }
    >
      <Icon size={18} />

      <span>{label}</span>

      {collapsed && (
        <div className="dashboard-sidebar__tooltip">
          {label}
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={onMobileClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          "dashboard-sidebar",
          collapsed ? "collapsed" : "",
          mobileOpen ? "mobile-open" : "",
        ].join(" ")}
      >
        <div className="dashboard-sidebar__header">
          <Logo
            showTagline={!collapsed}
            compact={collapsed}
          />

          <button
            type="button"
            className="dashboard-sidebar__mobile-close"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="dashboard-sidebar__content">
          <nav className="dashboard-sidebar__nav">
            <span className="dashboard-sidebar__section-title">
              {!collapsed ? "Workspace" : "•••"}
            </span>

            {primaryNavigation.map(renderNavItem)}
          </nav>

          <nav className="dashboard-sidebar__nav dashboard-sidebar__nav--bottom">
            {secondaryNavigation.map(renderNavItem)}
          </nav>
        </div>

        <div className="dashboard-sidebar__user">
          <div className="dashboard-sidebar__avatar">
            KG
          </div>

          {!collapsed && (
            <div className="dashboard-sidebar__user-info">
              <strong>Researcher</strong>
              <span>My Workspace</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="dashboard-sidebar__collapse"
          onClick={onToggle}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </aside>
    </>
  );
};

export default DashboardSidebar;