import AdminDashboard from "@/pages/AdminDashboard";
import BusinessDashboard from "@/pages/BusinessDashboard";
import UserDashboard from "@/pages/UserDashboard";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);
  if (role === "super_admin") {
    return <AdminDashboard />;
  } else if (role === "business") {
    return <BusinessDashboard />;
  } else if (role === "individual") {
    return <UserDashboard />;
  } else {
    return <div>Unauthorized</div>;
  }
}
