import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../services/auth/useAuth";
import LoadingScreen from "./ui/LoadingScreen";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

