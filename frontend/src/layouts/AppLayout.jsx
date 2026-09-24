import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";

import useAuth from "../hooks/useAuth";
import ThemeToggle from "../components/common/ThemeToggle";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">

      <aside className="sidebar">
        <h2>Researcify</h2>

        <nav>
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
        </nav>
      </aside>

      <div className="app-main">

        <header className="app-header">

          <div>
            <strong>{user?.name}</strong>
            <p>{user?.academicField}</p>
          </div>

          <div className="header-actions">

          <ThemeToggle />

          <button
            className="logout-button"
            onClick={logout}
          >
          <LogOut size={18} />
          Logout
          </button>

        </div>

      </header>

        <main className="app-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AppLayout;