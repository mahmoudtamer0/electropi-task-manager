import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext/ToastContext";
import { NotificationsProvider } from "./context/NotificationsProvider";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AppLayout from "./layouts/AppLayout/AppLayout";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProjectsListPage from "./pages/ProjectsListPage/ProjectsListPage";
import ProjectBoardPage from "./pages/ProjectBoardPage/ProjectBoardPage";
import MyTasksPage from "./pages/MyTasksPage/MyTasksPage";
import "./styles/variables.css";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/projects" element={<ProjectsListPage />} />
                  <Route path="/projects/:id" element={<ProjectBoardPage />} />
                  <Route path="/my-tasks" element={<MyTasksPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}