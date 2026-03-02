/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  email: string;
  name: string;
  role: string;
  id: number;
  profile_image: string | null;
  [key: string]: unknown;
}

interface RegisterData {
  email: string;
  name: string;
  role: "individual" | "business" | string;
  password: string;
}

interface AuthState {
  [x: string]: any;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  profile_update: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  changePassword: (
    userId: number,
    newPassword: string,
    accessToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      profile_update: false,
      isLoading: false,

      // New method to verify if the stored token is still valid
      verifyToken: async (): Promise<boolean> => {
        const { accessToken } = get();
        if (!accessToken) return false;

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/profile/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          return response.ok;
        } catch (error) {
          console.error("Token verification failed:", error);
          return false;
        }
      },

      // New initialization method
      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          const { user, accessToken, refreshToken } = get();
          
          // If we have stored auth data, verify it
          if (user && accessToken) {
            const isTokenValid = await get().verifyToken();
            
            if (isTokenValid) {
              // Token is valid, user is authenticated
              set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Token is invalid, clear auth data
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            // No stored auth data
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          // Clear auth data on error
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const resp = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/login/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!resp.ok) throw new Error("Invalid credentials");

          const data = await resp.json();

          set({
            user: {
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              profile_update: data.user.profile_update,
              id:
                data.user.id ?? data.user.user_id ?? data.user.profile?.id ?? 0,
              profile_image: data.user.profile_image,
              ...data.user,
            },
            accessToken: data.token.access,
            refreshToken: data.token.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            user: null,
            profile_update: false,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw err;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const resp = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/register/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
            }
          );

          if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            throw new Error(errorData.message || "Registration failed");
          }

          const data = await resp.json();
          console.log("Registration Response Data:", data);
          
          set({ isLoading: false });
          return;
        } catch (err) {
          set({ isLoading: false });
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Registration failed. Please try again.";

          throw new Error(errorMessage);
        }
      },

      changePassword: async (userId: number, newPassword: string, accessToken: string) => {
        try {
          console.log("Attempting to change password for user:", userId);
          console.log("API URL:", `${import.meta.env.VITE_API_URL}/api/users/reset-password/${userId}/`);
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/users/reset-password/${userId}/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                new_password: newPassword,
              }),
            }
          );

          console.log("Response status:", response.status);
          console.log("Response ok:", response.ok);

          if (!response.ok) {
            let errorMessage = "Failed to change password";
            try {
              const errorData = await response.json();
              console.log("Error response data:", errorData);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
              console.log("Could not parse error response");
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          try {
            const data = await response.json();
            console.log("Success response data:", data);
          } catch (parseError) {
            console.log("No response data");
          }

        } catch (error) {
          console.error("Error changing password:", error);
          throw error;
        }
      },

      logout: async () => {
        const accessToken = get().accessToken;
        try {
          if (accessToken) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });
          }
        } catch (err) {
          console.error("Logout API call failed:", err);
          // Don't throw error, still proceed with local logout
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);