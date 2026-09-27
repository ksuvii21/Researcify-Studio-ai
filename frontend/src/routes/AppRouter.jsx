import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/LandingPage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import DashboardPage from "../pages/DashboardPage";
import DiscoverPage from "../pages/DiscoverPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";

import NotFoundPage from "../pages/NotFoundPage";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const AppRouter = () => {
  return (
    <Routes>
      {/* ============================= */}
      {/* LANDING */}
      {/* ============================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* ============================= */}
      {/* AUTH */}
      {/* ============================= */}

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

      {/* ============================= */}
      {/* PROTECTED APPLICATION */}
      {/* ============================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/discover"
            element={<DiscoverPage />}
          />
           
          <Route
            path="/projects"
            element={<ProjectsPage />}
          />
          <Route
            path="/projects/:id"
            element={<ProjectDetailPage />}
          />

          {/* Phase 7C */}
          {/*
          <Route
            path="/library"
            element={<LibraryPage />}
          />
          */}

          {/* Phase 7D */}
          {/*
          <Route
            path="/notes"
            element={<NotesPage />}
          />
          */}

          {/* Phase 7E */}
          {/*
          <Route
            path="/ai-assistant"
            element={<AIAssistantPage />}
          />
          */}

          {/* Phase 7F */}
          {/*
          <Route
            path="/uploads"
            element={<UploadedDocumentsPage />}
          />
          */}

          {/* Phase 7G */}
          {/*
          <Route
            path="/collections"
            element={<CollectionsPage />}
          />
          */}

          {/* Phase 7H */}
          {/*
          <Route
            path="/activity"
            element={<ActivityPage />}
          />
          */}

          {/* Phase 7I */}
          {/*
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
          */}
        </Route>
      </Route>

      {/* ============================= */}
      {/* FALLBACK */}
      {/* ============================= */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
};

export default AppRouter;