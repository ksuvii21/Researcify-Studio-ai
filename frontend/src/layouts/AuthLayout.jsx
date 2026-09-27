import { Outlet } from "react-router-dom";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import ThemeToggle from "../components/common/ThemeToggle";

import "../components/auth/auth.css";

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <AuthBrandPanel />

      <main className="auth-layout__main">
        <div className="auth-layout__theme">
          <ThemeToggle />
        </div>

        <div className="auth-layout__form">
          <Outlet />
        </div>

        <div className="auth-layout__copyright">
          © {new Date().getFullYear()} Researcify Studio
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;