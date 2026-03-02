/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthly_price: any;
  yearly_price: any;
  duration_in_days: number | null;
  features: string[];
  total_requests_limit: number;
  max_users: number;
  max_guides: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
}

interface SubscriptionState {
  activePlans: SubscriptionPlan[];
  inactivePlans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: (accessToken: string) => Promise<void>;
  fetchPublicPlans: () => Promise<void>;

  createPlan: (
    accessToken: string,
    planData: Omit<SubscriptionPlan, "id" | "created_at" | "is_active">
  ) => Promise<void>;
  updatePlan: (
    accessToken: string,
    id: number,
    planData: Partial<SubscriptionPlan>
  ) => Promise<void>;
  deletePlan: (accessToken: string, id: number) => Promise<void>;
  togglePlanStatus: (
    accessToken: string,
    id: number,
    isActive: boolean
  ) => Promise<void>;
}

function normalizePlan(plan: any): SubscriptionPlan {
  return {
    ...plan,
    monthly_price: Number(plan.monthly_price),
    yearly_price: Number(plan.yearly_price),
    duration_in_days:
      plan.duration_in_days !== undefined ? plan.duration_in_days : null,
    features: Array.isArray(plan.features) ? plan.features : [],
    max_users: Number(plan.max_users),
    max_guides: Number(plan.max_guides),
    max_tokens: Number(plan.max_tokens),
    total_requests_limit: Number(plan.total_requests_limit),
    is_active: !!plan.is_active,
  };
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      activePlans: [],
      inactivePlans: [],
      loading: false,
      error: null,

      fetchPlans: async (accessToken) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/all`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch plans");

          const data = await response.json();
          // console.log("Plans i got :: ", data)

          const activePlans: SubscriptionPlan[] = Array.isArray(
            data.active_plans
          )
            ? data.active_plans.map(normalizePlan)
            : [];
          const inactivePlans: SubscriptionPlan[] = Array.isArray(
            data.inactive_plans
          )
            ? data.inactive_plans.map(normalizePlan)
            : [];

          set({
            activePlans,
            inactivePlans,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch plans",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchPublicPlans: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch public plans");

          const data = await response.json();
          console.log("Public plans data:", data);
          const plans: SubscriptionPlan[] = Array.isArray(data)
            ? data.map(normalizePlan)
            : [];

          set({ activePlans: plans, inactivePlans: [] });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch public plans",
          });
        } finally {
          set({ loading: false });
        }
      },

      createPlan: async (accessToken, planData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                ...planData,
                monthly_price: Number(planData.monthly_price),
                yearly_price: Number(planData.yearly_price),
                is_active: true,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create plan");
          }

          // Refresh plans after creation
          await useSubscriptionStore.getState().fetchPlans(accessToken);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create plan",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updatePlan: async (accessToken, id, planData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                ...planData,
                monthly_price:
                  planData.monthly_price !== undefined
                    ? Number(planData.monthly_price)
                    : undefined,
                yearly_price:
                  planData.yearly_price !== undefined
                    ? Number(planData.yearly_price)
                    : undefined,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update plan");
          }

          // refreshing plans
          await useSubscriptionStore.getState().fetchPlans(accessToken);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update plan",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deletePlan: async (accessToken, id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete plan");
          }
          // refreshing list after deletion
          await useSubscriptionStore.getState().fetchPlans(accessToken);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete plan",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      togglePlanStatus: async (accessToken, id, isActive) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/plans/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ is_active: isActive }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to toggle plan status"
            );
          }

          // Refresh plans after status change
          await useSubscriptionStore.getState().fetchPlans(accessToken);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to toggle plan status",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "subscription-storage",
    }
  )
);
