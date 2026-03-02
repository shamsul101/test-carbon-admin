import { useAuthStore } from "@/store/auth";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export const useUserProfile = () => {
  const { user, fetchUserProfile, loading, error } = useUserStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  
  useEffect(() => {
    if (accessToken && !user) {
      fetchUserProfile(accessToken);
    }
  }, [accessToken, fetchUserProfile, user]);

  return {
    user,
    profile_update: user?.profile_update,
    loading,
    error
  };
};