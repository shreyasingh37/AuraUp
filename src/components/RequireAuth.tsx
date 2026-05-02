import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../services/auth/useAuth";
import LoadingScreen from "./ui/LoadingScreen";
import SupabaseConfigNotice from "./SupabaseConfigNotice";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, configError } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (configError) return <SupabaseConfigNotice />;
  if (!session) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
