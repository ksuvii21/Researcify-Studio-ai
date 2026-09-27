import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";

import "../components/dashboard/dashboard-shell.css";

const SIDEBAR_STORAGE_KEY =
  "researcify-sidebar-collapsed";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    return (
      localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
    );
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(collapsed)
    );
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCreateAction = (action) => {
    /*
      Phase 5 will connect these actions to:
      - project modal
      - note modal
      - upload modal
      - collection modal
      - import modal
      - AI conversation

      Keeping this handler here means the Topbar does not
      need to know how those modals work.
    */

    console.log("[Create Action]", action);
  };

  return (
    <div
      className={`dashboard-shell ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="dashboard-shell__main">
        <DashboardTopbar
          onMobileMenuOpen={() => setMobileOpen(true)}
          onCreateAction={handleCreateAction}
        />

        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;