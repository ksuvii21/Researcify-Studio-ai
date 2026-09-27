import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Library,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Upload,
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
  const renderNavItem = ({
    label,
    icon: Icon,
    path,
    end,
  }) => (
    <NavLink
      key={label}
      to={path}
      end={end}
      onClick={onMobileClose}
      className={({ isActive }) =>
        [
          "dashboard-sidebar__link",
          isActive ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
      aria-label={collapsed ? label : undefined}
    >
      <Icon size={19} strokeWidth={1.8} />

      <span>{label}</span>

      <span
        className="dashboard-sidebar__tooltip"
        aria-hidden="true"
      >
        {label}
      </span>
    </NavLink>
  );

  return (
    <>
      {/* ===============================
          MOBILE OVERLAY
      =============================== */}

      {mobileOpen && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={onMobileClose}
          aria-label="Close navigation"
        />
      )}

      {/* ===============================
          SIDEBAR
      =============================== */}

      <aside
        className={[
          "dashboard-sidebar",
          collapsed ? "collapsed" : "",
          mobileOpen ? "mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ===============================
            BRAND / HEADER
        =============================== */}

        <div className="dashboard-sidebar__header">
          <Logo showTagline={!collapsed} />

          {/* Desktop collapse / expand */}
          <button
            type="button"
            className="dashboard-sidebar__collapse"
            onClick={onToggle}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <ChevronRight
                size={16}
                strokeWidth={2}
              />
            ) : (
              <ChevronLeft
                size={16}
                strokeWidth={2}
              />
            )}
          </button>

          {/* Mobile close */}
          <button
            type="button"
            className="dashboard-sidebar__mobile-close"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ===============================
            SIDEBAR CONTENT
        =============================== */}

        <div className="dashboard-sidebar__content">
          {/* Primary navigation */}

          <nav
            className="dashboard-sidebar__nav"
            aria-label="Workspace navigation"
          >
            <span className="dashboard-sidebar__section-title">
              Workspace
            </span>

            {primaryNavigation.map(renderNavItem)}
          </nav>

          {/* Bottom navigation */}

          <nav
            className="
              dashboard-sidebar__nav
              dashboard-sidebar__nav--bottom
            "
            aria-label="Account navigation"
          >
            {secondaryNavigation.map(renderNavItem)}
          </nav>
        </div>

        {/* ===============================
            USER PROFILE
        =============================== */}

        <button
          type="button"
          className="dashboard-sidebar__user"
          aria-label="Open profile"
        >
          <div className="dashboard-sidebar__avatar">
            KG
          </div>

          <div className="dashboard-sidebar__user-info">
            <strong>Researcher</strong>
            <span>My Workspace</span>
          </div>
        </button>
      </aside>
    </>
  );
};

export default DashboardSidebar;