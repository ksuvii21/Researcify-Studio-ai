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
import LibraryPage from "../pages/LibraryPage";
import NotesPage from "../pages/NotesPage";
import NoteEditorPage from "../pages/NoteEditorPage";
import AIAssistantPage from "../pages/AIAssistantPage";
import UploadsPage from "../pages/UploadsPage";
import CollectionsPage from "../pages/CollectionsPage";
import CollectionDetailPage from "../pages/CollectionDetailPage";

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
          <Route
            path="/library"
            element={<LibraryPage />}
          />

          <Route
            path="/notes"
            element={<NotesPage />}
          />
          <Route
            path="/notes/:id"
            element={<NoteEditorPage />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistantPage />}
          />

          <Route
            path="/uploads"
            element={<UploadsPage />}
          />

          <Route
            path="/collections"
            element={<CollectionsPage />}
          />
          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailPage />}
          />
          
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