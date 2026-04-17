import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./services/auth/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import AppShell from "./components/AppShell";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/Home";
import UploadPage from "./pages/Upload";
import ProgressPage from "./pages/Progress";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

