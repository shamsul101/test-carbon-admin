import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user } = useAuth();
  const path = window.location.pathname;

  if (!user && path !== "/login" && path !== "/register") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
