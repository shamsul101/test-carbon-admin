/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface Query {
  [x: string]: any;
  id: number;
  user_email: string;
  user_name: string;
  subject: string;
  issue_type: "api" | "technical" | "billing" | "other";
  issue_type_display: string;
  message: string;
  attachment: string | null;
  status: "pending" | "in_progress";
  created_at: string;
  updated_at: string;
}

interface QueriesStore {
  queries: Query[];
  loading: boolean;
  error: string | null;
  fetchQueries: (accessToken: string) => Promise<void>;
  updateQueryStatus: (
    accessToken: string,
    queryId: number,
    newStatus: "pending" | "in_progress"
  ) => Promise<void>;
}

export const useQueriesStore = create<QueriesStore>((set) => ({
  queries: [],
  loading: false,
  error: null,
  fetchQueries: async (accessToken) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/issues/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set({ queries: data, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch queries",
        loading: false,
      });
    }
  },
  updateQueryStatus: async (accessToken, queryId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/issues/${queryId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      set((state) => ({
        queries: state.queries.map((query) =>
          query.id === queryId ? { ...query, status: newStatus } : query
        ),
      }));
    } catch (error) {
      console.error("Failed to update query status:", error);
      throw error;
    }
  },
}));