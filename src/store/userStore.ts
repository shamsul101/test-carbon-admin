/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Profile {
  emission_lab_key: string;
  api_requests_made: number | string;
  total_requests_limit: number | string;
  created_at: string;
  updated_at: string;
}

interface BusinessProfile {
  company_name: string;
  company_registration_number: string;
  industry: string;
  company_size: string;
  website: string;
  company_address: string;
  phone_number: string;
  contact_person: string;
  annual_revenue: string;
  created_at: string;
  updated_at: string;
}

interface User {
    id: number;
  [x: string]: any;
  email: string;
  name: string;
  role: "business" | "super_admin" | "individual";
  organization: string | null;
  profile_image: string | null;
  bio: string | null;
  is_active: boolean;
  profile: Profile;
  business_profile: BusinessProfile | null;
  profile_update: boolean;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUserProfile: (accessToken: string) => Promise<void>;
  updateUserProfile: (
    accessToken: string,
    data: Partial<User>
  ) => Promise<void>;
  updateBusinessProfile: (
    accessToken: string,
    data: Partial<BusinessProfile>
  ) => Promise<void>;
  regenerateApiKey: (accessToken: string) => Promise<string | undefined>;
  uploadProfileImage: (
    accessToken: string,
    formData: FormData
  ) => Promise<{ message: string; profile_image: string }>;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    user: null,
    loading: false,
    error: null,

    fetchUserProfile: async (accessToken) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }
        const data = await res.json();
        set({ user: data, loading: false });
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : error?.message || "Failed to fetch profile",
          loading: false,
        });
      }
    },

    updateUserProfile: async (accessToken, data) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update profile");
        }
        const responseData = await res.json();
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...responseData };
          }
        });
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : error?.message || "Failed to update profile",
          loading: false,
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    updateBusinessProfile: async (accessToken, data) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              business_profile: data,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to update business profile"
          );
        }

        const responseData = await res.json();
        set((state) => ({
          user: {
            ...state.user,
            business_profile: {
              ...state.user?.business_profile,
              ...responseData.business_profile,
            },
          },
        }));
        return responseData;
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : error?.message || "Failed to update business profile",
          loading: false,
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    regenerateApiKey: async (accessToken) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/generate-key/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: null, // No body needed for empty post
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to regenerate API key");
        }
        const data = await res.json();
        set((state) => {
          if (state.user) {
            state.user.profile.emission_lab_key = data.emission_lab_key;
          }
        });
        return data.emission_lab_key;
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : error?.message || "Failed to regenerate API key",
          loading: false,
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    uploadProfileImage: async (accessToken, formData) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/profile/image/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to upload profile image");
        }

        const data = await response.json();

        // Update the user state with the new profile image
        set((state) => {
          if (state.user) {
            state.user.profile_image = data.profile_image;
          }
        });

        return data;
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : error?.message || "Failed to upload profile image",
          loading: false,
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
  }))
);
