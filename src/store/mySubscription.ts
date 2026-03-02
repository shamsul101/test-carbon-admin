/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface UpdateSubscriptionPayload {
  plan_id: number;
  payment_frequency: string;
}

export interface SubscriptionPlanDetails {
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
  is_custom_configured: boolean;
}

export interface MySubscription {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  plan: number;
  plan_details: SubscriptionPlanDetails;
  start_date: string;
  end_date: string;
  status: string;
  payment_frequency: string;
  payment_type: string;
  created_at: string;
  last_renewed_at: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

interface MySubscriptionState {
  subscription: MySubscription | null;
  loading: boolean;
  error: string | null;
  fetchMySubscription: (accessToken: string) => Promise<void>;
  updateMySubscription: (
    accessToken: string,
    payload: UpdateSubscriptionPayload
  ) => Promise<void>;
  createSubscription: (
    accessToken: string,
    subscriptionData: {
      plan_id: number;
      payment_frequency: any;
    }
  ) => Promise<MySubscription>;
  unsubscribeFromPlan: (accessToken: string) => Promise<void>;
}

export const useMySubscriptionStore = create<MySubscriptionState>(
  (set, get) => ({
    subscription: null,
    loading: false,
    error: null,

    fetchMySubscription: async (accessToken) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/subscription/my-subscription/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch subscription");
        }
        const data = await response.json();
        const normalizedPlanDetails: SubscriptionPlanDetails = {
          ...data.plan_details,
          monthly_price: Number(data.plan_details.monthly_price),
          yearly_price: Number(data.plan_details.yearly_price),
          duration_in_days:
            data.plan_details.duration_in_days !== undefined
              ? data.plan_details.duration_in_days
              : null,
          features: Array.isArray(data.plan_details.features)
            ? data.plan_details.features
            : [],
          max_users: Number(data.plan_details.max_users),
          max_guides: Number(data.plan_details.max_guides),
          max_tokens: Number(data.plan_details.max_tokens),
          total_requests_limit: Number(data.plan_details.total_requests_limit),
          is_active: !!data.plan_details.is_active,
          created_at: data.plan_details.created_at,
          is_custom_configured: data.plan_details.is_custom_configured,
        };

        const normalizedSubscription: MySubscription = {
          ...data,
          plan_details: normalizedPlanDetails,
        };

        set({ subscription: normalizedSubscription });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch subscription",
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    createSubscription: async (accessToken, subscriptionData) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/subscription/my-subscription/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(subscriptionData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create subscription");
        }

        const newSubscription = await response.json();

        // normalizing the subscription data
        const normalizedPlanDetails: SubscriptionPlanDetails = {
          ...newSubscription.plan_details,
          monthly_price: Number(newSubscription.plan_details.monthly_price),
          yearly_price: Number(newSubscription.plan_details.yearly_price),
          duration_in_days:
            newSubscription.plan_details.duration_in_days !== undefined
              ? newSubscription.plan_details.duration_in_days
              : null,
          features: Array.isArray(newSubscription.plan_details.features)
            ? newSubscription.plan_details.features
            : [],
          max_users: Number(newSubscription.plan_details.max_users),
          max_guides: Number(newSubscription.plan_details.max_guides),
          max_tokens: Number(newSubscription.plan_details.max_tokens),
          total_requests_limit: Number(
            newSubscription.plan_details.total_requests_limit
          ),
          is_active: !!newSubscription.plan_details.is_active,
          created_at: newSubscription.plan_details.created_at,
          is_custom_configured:
            newSubscription.plan_details.is_custom_configured,
        };

        const normalizedSubscription: MySubscription = {
          ...newSubscription,
          plan_details: normalizedPlanDetails,
        };

        set({
          subscription: normalizedSubscription,
          loading: false,
          error: null,
        });

        return normalizedSubscription;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create subscription";
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    updateMySubscription: async (
      accessToken,
      { plan_id, payment_frequency }
    ) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/subscription/my-subscription/change-plan/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ plan_id, payment_frequency }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update subscription");
        }

        // Refresh subscription data after update
        await get().fetchMySubscription(accessToken);
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to update subscription",
        });
        throw error;
      } finally {
        set({ loading: false });
      }
    },

    unsubscribeFromPlan: async (accessToken) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/subscription/my-subscription/unsubscribe/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to unsubscribe");
        }

        // Clear the current subscription instead of trying to fetch it
        set({ subscription: null, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to unsubscribe",
          loading: false,
        });
        throw error;
      }
    },
  })
);
