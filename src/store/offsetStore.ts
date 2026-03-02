/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface Project {
  id: number;
  image_url: string;
  is_active: boolean;
  is_default: boolean;
  name: string;
  description: string;
  gold_standard_confirmation: string;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
  image: string;
}

interface OffsetStoreState {
  myOffsets: any[];
  projects: Project[];
  defaultProjects: Project[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalProjects: number;
  fetchMyOffsets: (accessToken: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  createProject: (
    projectData: FormData,
    accessToken: string
  ) => Promise<boolean>;
  updateProject: (
    id: number,
    projectData: FormData,
    accessToken: string
  ) => Promise<boolean>;
  deleteProject: (id: number, accessToken: string) => Promise<boolean>;
  loadMoreProjects: () => void;
  showLessProjects: () => void;
  offsetHistory: any[];
  historyLoading: boolean;
  historyError: string | null;
  fetchOffsetHistory: (accessToken: string) => Promise<void>;
  fetchOffsetHistoryByEmail: (
    email: string,
    accessToken: string
  ) => Promise<void>;
}

export const useOffsetStore = create<OffsetStoreState>((set, get) => ({
  myOffsets: [],
  projects: [],
  defaultProjects: [],
  loading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 6,
  totalProjects: 0,
  offsetHistory: [],
  historyLoading: false,
  historyError: null,

  fetchMyOffsets: async (accessToken: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/user/me/offsets/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch offset projects");
      }

      const data = await response.json();
      set({ myOffsets: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Error fetching offset projects:", err);
    }
  },

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      // fetch active projects
      const projectsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/projects/`
      );
      if (!projectsRes.ok) throw new Error("Failed to fetch projects");

      const projectsData = await projectsRes.json();

      // fetch default projects
      const defaultRes = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/offset/projects/?is_active=true&is_default=true`
      );
      if (!defaultRes.ok) throw new Error("Failed to fetch default projects");

      const defaultData = await defaultRes.json();

      const projects = projectsData.data || [];
      set({
        projects,
        defaultProjects: defaultData.data || [],
        totalProjects: projects.length,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Error fetching offset projects:", err);
    }
  },

  createProject: async (formData: FormData, accessToken: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/projects/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      // Refresh projects list
      await get().fetchProjects();
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Error creating project:", err);
      return false;
    }
  },

  updateProject: async (
    id: number,
    formData: FormData,
    accessToken: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/projects/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      // Refresh projects list
      await get().fetchProjects();
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Error updating project:", err);
      return false;
    }
  },

  deleteProject: async (id: number, accessToken: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/projects/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Refresh projects list
      await get().fetchProjects();
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Error deleting project:", err);
      return false;
    }
  },

  loadMoreProjects: () => {
    const { currentPage, itemsPerPage } = get();
    set({ currentPage: currentPage + 1 });
  },

  showLessProjects: () => {
    set({ currentPage: 1 });
  },

  fetchOffsetHistory: async (accessToken: string) => {
    set({ historyLoading: true, historyError: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch offset history");
      }

      const result = await response.json();

      // data array from the response
      set({ offsetHistory: result.data, historyLoading: false });
    } catch (err: any) {
      set({ historyError: err.message, historyLoading: false });
      console.error("Error fetching offset history:", err);
    }
  },

  fetchOffsetHistoryByEmail: async (email: string, accessToken: string) => {
    set({ historyLoading: true, historyError: null });
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/offset/history?user_email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch offset history");
      }

      const result = await response.json();

      // Extract the data array from the response
      set({ offsetHistory: result.data, historyLoading: false });
    } catch (err: any) {
      set({ historyError: err.message, historyLoading: false });
      console.error("Error fetching offset history:", err);
    }
  },
}));
