import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "host" | "guest";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (requiredRole === "host") {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
