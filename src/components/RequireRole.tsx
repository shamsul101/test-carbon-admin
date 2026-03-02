import { useAuthStore } from "@/store/auth";
import { Navigate } from "react-router-dom";

export function RequireRole({ allowedRoles, children }: { allowedRoles: string[], children: JSX.Element }) {
  const user = useAuthStore(s => s.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}