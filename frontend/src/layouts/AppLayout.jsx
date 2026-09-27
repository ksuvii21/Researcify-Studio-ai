import {
  useEffect,
  useState,
} from "react";

import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";

import CreateActionHost from "../components/dashboard/interactions/CreateActionHost";
import ToastContainer from "../components/common/ToastContainer";

import {
  CreateActionProvider,
} from "../context/CreateActionContext";

import {
  ToastProvider,
} from "../context/ToastContext";

import "../components/dashboard/dashboard-shell.css";
import "../components/dashboard/interactions/interactions.css";


const SIDEBAR_STORAGE_KEY =
  "researcify-sidebar-collapsed";


const DashboardApplication = () => {
  const [collapsed, setCollapsed] =
    useState(() => {
      try {
        return (
          localStorage.getItem(
            SIDEBAR_STORAGE_KEY
          ) === "true"
        );
      } catch {
        return false;
      }
    });

  const [mobileOpen, setMobileOpen] =
    useState(false);


  /* =====================================
     SAVE SIDEBAR STATE
  ===================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(collapsed)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [collapsed]);


  /* =====================================
     CLOSE MOBILE SIDEBAR ON RESIZE
  ===================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);


  /* =====================================
     SIDEBAR HANDLERS
  ===================================== */

  const handleSidebarToggle = () => {
    setCollapsed(
      (current) => !current
    );
  };

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };


  /* =====================================
     DASHBOARD
  ===================================== */

  return (
    <div
      className={`dashboard-shell ${
        collapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <DashboardSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={
          handleSidebarToggle
        }
        onMobileClose={
          handleMobileClose
        }
      />

      <div className="dashboard-shell__main">
        <DashboardTopbar
          onMobileMenu={
            handleMobileOpen
          }
        />

        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>

      <CreateActionHost />

      <ToastContainer />
    </div>
  );
};


/* =====================================
   PROVIDERS
===================================== */

const AppLayout = () => {
  return (
    <ToastProvider>
      <CreateActionProvider>
        <DashboardApplication />
      </CreateActionProvider>
    </ToastProvider>
  );
};

export default AppLayout;