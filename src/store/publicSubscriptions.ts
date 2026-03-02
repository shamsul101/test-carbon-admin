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
  fetchPublicPlans: () => Promise<void>;
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

export const usePublicSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      activePlans: [],
      inactivePlans: [],
      loading: false,
      error: null,

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
    }),
    {
      name: "subscription-storage",
    }
  )
);
