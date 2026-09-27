import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

import LandingPage from "../pages/LandingPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import DashboardPage from "../pages/DashboardPage";
import NotFoundPage from "../pages/NotFoundPage";


const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />


      {/* ========================
          PUBLIC AUTH ROUTES
      ======================== */}

      <Route element={<PublicRoute />}>

        <Route element={<AuthLayout />}>

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
        </Route>

      </Route>


      {/* ========================
          PROTECTED APP ROUTES
      ======================== */}

      <Route element={<ProtectedRoute />}>

        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

        </Route>

      </Route>


      {/* ========================
          NOT FOUND
      ======================== */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
};


export default AppRouter;