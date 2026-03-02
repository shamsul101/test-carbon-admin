/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface Project {
  id: number;
  image_url: string;
  is_active: boolean;
  is_default: boolean;
  name: string;
  description: string;
  project_type: string | null;
  location: string | null;
  standard: string | null;
  identification_number: string;
  vintage: string | null;
  info_link: string | null;
  // gold_standard_confirmation: string | null;
  price_per_ton: string;
  allocated_amount: number;
  available_amount: number;
  currency: string;
  image: string;
  project_id_display: string;
  registry?: string | null;
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
  showActiveOnly: boolean;
  fetchMyOffsets: (accessToken: string) => Promise<void>;
  fetchMyOffsetsWithFilters: (
    accessToken: string,
    filters?: {
      offset_type?: string;
      payment_type?: string;
    }
  ) => Promise<void>;
  fetchProjects: (activeOnly?: boolean) => Promise<void>;
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
  setShowActiveOnly: (value: boolean) => void;
  offsetHistory: any[];
  historyLoading: boolean;
  historyError: string | null;
  fetchOffsetHistory: (accessToken: string) => Promise<void>;
  fetchOffsetHistoryWithFilters: (
    accessToken: string,
    filters?: {
      user_email?: string;
      offset_type?: string;
      payment_type?: string;
    }
  ) => Promise<void>;
  fetchOffsetHistoryByEmail: (
    email: string,
    accessToken: string
  ) => Promise<void>;
  certificates: any[];
  certificatesLoading: boolean;
  certificatesError: string | null;
  fetchCertificates: (accessToken: string) => Promise<void>;
  fetchCertificatesWithFilters: (
    accessToken: string,
    filters?: {
      offset_type?: string;
      payment_type?: string;
    }
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
  showActiveOnly: false,
  offsetHistory: [],
  historyLoading: false,
  historyError: null,
  certificates: [],
  certificatesLoading: false,
  certificatesError: null,

  setShowActiveOnly: (value: boolean) => {
    set({ showActiveOnly: value });
    get().fetchProjects(value);
  },

  fetchMyOffsets: async (accessToken: string) => {
    await get().fetchMyOffsetsWithFilters(accessToken);
  },

  fetchMyOffsetsWithFilters: async (
    accessToken: string,
    filters?: {
      offset_type?: string;
      payment_type?: string;
    }
  ) => {
    set({ loading: true, error: null });
    try {
      const searchParams = new URLSearchParams();

      if (filters?.offset_type?.trim()) {
        searchParams.set("offset_type", filters.offset_type.trim());
      }

      if (filters?.payment_type?.trim()) {
        searchParams.set("payment_type", filters.payment_type.trim());
      }

      const query = searchParams.toString();
      const url = `${import.meta.env.VITE_API_URL}/api/offset/user/me/offsets${
        query ? `?${query}` : ""
      }`;

      const response = await fetch(
        url,
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

  fetchProjects: async (activeOnly?: boolean) => {
    set({ loading: true, error: null });
    try {
      // Use the activeOnly parameter if provided, otherwise use the store state
      const shouldFilterActive = activeOnly ?? get().showActiveOnly;
      
      // Build URL with active filter if needed
      const projectsUrl = shouldFilterActive
        ? `${import.meta.env.VITE_API_URL}/api/offset/projects/?is_active=true`
        : `${import.meta.env.VITE_API_URL}/api/offset/projects/`;

      const projectsRes = await fetch(projectsUrl);
      if (!projectsRes.ok) throw new Error("Failed to fetch projects");

      const projectsData = await projectsRes.json();

      // Fetch all default projects
      const defaultRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/projects/?is_active=true&is_default=true`
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
    console.log("Form data while creating :: ", formData);
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

      console.log("Response after creating :: ", response.json());

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

    // console.log("Form data while updating :: ", formData);

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

      console.log("Response after updating :: ", response.json());

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
    await get().fetchOffsetHistoryWithFilters(accessToken);
  },

  fetchOffsetHistoryWithFilters: async (
    accessToken: string,
    filters?: {
      user_email?: string;
      offset_type?: string;
      payment_type?: string;
    }
  ) => {
    set({ historyLoading: true, historyError: null });
    try {
      const searchParams = new URLSearchParams();

      if (filters?.user_email?.trim()) {
        searchParams.set("user_email", filters.user_email.trim());
      }

      if (filters?.offset_type?.trim()) {
        searchParams.set("offset_type", filters.offset_type.trim());
      }

      if (filters?.payment_type?.trim()) {
        searchParams.set("payment_type", filters.payment_type.trim());
      }

      const query = searchParams.toString();
      const url = `${import.meta.env.VITE_API_URL}/api/offset/history${
        query ? `?${query}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

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

  fetchCertificates: async (accessToken: string) => {
    await get().fetchCertificatesWithFilters(accessToken);
  },

  fetchCertificatesWithFilters: async (
    accessToken: string,
    filters?: {
      offset_type?: string;
      payment_type?: string;
    }
  ) => {
    set({ certificatesLoading: true, certificatesError: null });
    try {
      const searchParams = new URLSearchParams();

      if (filters?.offset_type?.trim()) {
        searchParams.set("offset_type", filters.offset_type.trim());
      }

      if (filters?.payment_type?.trim()) {
        searchParams.set("payment_type", filters.payment_type.trim());
      }

      const query = searchParams.toString();
      const certificatesUrl = `${import.meta.env.VITE_API_URL}/api/offset/certificates/${
        query ? `?${query}` : ""
      }`;

      const response = await fetch(
        certificatesUrl,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch certificates");
      }

      const result = await response.json();
      set({ certificates: result.data, certificatesLoading: false });
    } catch (err: any) {
      set({ certificatesError: err.message, certificatesLoading: false });
      console.error("Error fetching certificates:", err);
    }
  },

  fetchOffsetHistoryByEmail: async (email: string, accessToken: string) => {
    await get().fetchOffsetHistoryWithFilters(accessToken, {
      user_email: email,
    });
  },
}));