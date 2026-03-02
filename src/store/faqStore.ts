import { create } from "zustand";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateFaq {
  question: string;
  answer: string;
}

export interface UpdateFaq extends Partial<CreateFaq> {
  id: number;
  is_active?: boolean;
}

interface FaqStore {
  faqs: Faq[];
  loading: boolean;
  error: string | null;
  fetchFaqs: () => Promise<void>;
  createFaq: (faq: CreateFaq, accessToken?: string | null) => Promise<void>;
  updateFaq: (faq: UpdateFaq, accessToken?: string | null) => Promise<void>;
  deleteFaq: (id: number, accessToken?: string | null) => Promise<void>;
}

export const useFaqStore = create<FaqStore>((set, get) => ({
  faqs: [],
  loading: false,
  error: null,

  fetchFaqs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/faqs/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch FAQs");
      }
      const faqs: Faq[] = await response.json();
      set({ faqs, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
    }
  },

  createFaq: async (faq: CreateFaq, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/faqs/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(faq),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create FAQ");
      }

      const newFaq: Faq = await response.json();
      set((state) => ({
        faqs: [newFaq, ...state.faqs],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  updateFaq: async (faq: UpdateFaq, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/faqs/${faq.id}/`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(faq),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update FAQ");
      }

      const updatedFaq: Faq = await response.json();
      set((state) => ({
        faqs: state.faqs.map((f) => (f.id === faq.id ? updatedFaq : f)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },

  deleteFaq: async (id: number, accessToken?: string | null) => {
    set({ loading: true, error: null });
    try {
      const headers: HeadersInit = {};

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/faqs/${id}/`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to delete FAQ");
      }

      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        loading: false,
      });
      throw error;
    }
  },
}));
