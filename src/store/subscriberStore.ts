/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

export interface Subscription {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  plan: number;
  plan_details: {
    id: number;
    name: string;
    description: string;
    monthly_price: string;
    yearly_price: string;
    duration_in_days: number | null;
    features: string[];
    max_users: number;
    is_active: boolean;
    max_guides: number;
    max_tokens: number;
    total_requests_limit: number;
    created_at: string;
    is_custom_configured: boolean;
    custom_config_id: number | null;
  };
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'trialing' | 'past_due' | 'unpaid';
  payment_frequency: 'monthly' | 'yearly';
  created_at: string;
  last_renewed_at: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

interface SubscriberState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  fetchSubscriptions: (accessToken: string) => Promise<void>;
  updateSubscriptionFrequency: (
    accessToken: string,
    userId: number,
    planId: number,
    frequency: 'monthly' | 'yearly'
  ) => Promise<void>;
  cancelSubscription: (accessToken: string, userId: number, planId: number) => Promise<void>;
  subscriptionDetails: Subscription | null;
  fetchSubscriptionDetails: (
    accessToken: string,
    userId: number
  ) => Promise<void>;
}

export const useSubscriberStore = create<SubscriberState>((set) => ({
  subscriptions: [],
  loading: false,
  error: null,
    subscriptionDetails: null,


  fetchSubscriptions: async (accessToken) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscription/admin/subscriptions/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscriptions');
      }

      const data = await response.json();
      set({ subscriptions: data.subscriptions, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch subscriptions',
        loading: false,
      });
    }
  },
  fetchSubscriptionDetails: async (accessToken, userId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscription/admin/users/${userId}/subscription/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription details');
      }

      const data = await response.json();
      set({ subscriptionDetails: data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch subscription details',
        loading: false,
      });
      throw error;
    }
  },

  updateSubscriptionFrequency: async (accessToken, userId, planId, frequency) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscription/admin/users/${userId}/subscription/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
            plan_id: planId,
            payment_frequency: frequency,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription frequency');
      }

      const updatedSubscription = await response.json();
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.user === userId && sub.plan === planId 
            ? { ...sub, payment_frequency: frequency } 
            : sub
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update subscription frequency',
        loading: false,
      });
      throw error;
    }
  },

  cancelSubscription: async (accessToken, userId, planId) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscription/admin/users/${userId}/unsubscribe/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      set((state) => ({
        subscriptions: state.subscriptions.filter(
          (sub) => !(sub.user === userId && sub.plan === planId)
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel subscription',
        loading: false,
      });
      throw error;
    }
  },
}));