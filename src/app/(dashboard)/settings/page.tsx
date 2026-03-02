import { useAuthStore } from "@/store/auth";
import SuperAdminSettings from "@/pages/SuperAdminSettings";
import BusinessUserSettings from "@/pages/BusinessUserSettings";
import UserSettings from "@/pages/UserSettings";

export default function SettingsPage() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === "super_admin") {
    return <SuperAdminSettings />;
  } else if (role === "business") {
    return <BusinessUserSettings />;
  } else if (role === "individual") {
    return <UserSettings />;
  } else {
    return <div>Unauthorized</div>;
  }
}
