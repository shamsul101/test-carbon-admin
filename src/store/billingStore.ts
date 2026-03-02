/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscriptionDetails {
  id: number;
  plan_name: string;
  payment_frequency: string;
  status: string;
}

interface CarbonOffsetDetails {
  confirmation_number: string;
  certificate_number: string;
  project_name: string;
  carbon_emission_metric_tons: number;
  certification_name: string;
  payment_status: string;
}

interface Payment {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  subscription: number;
  subscription_details: SubscriptionDetails;
  carbon_offset_details?: CarbonOffsetDetails;
  amount: string;
  payment_date: string;
  payment_status: string;
  payment_method: string | null;
  payment_method_details: any | null;

  transaction_id: string;
}

interface PaymentDetailsResponse {
  user_email: string;
  user_name: string;
  payments: Payment[];
  total_count: number;
  filter_applied: {
    status: string;
  };
}

interface BillingState {
  payments: Payment[];
  subscriptionPayments: Payment[];
  offsetPayments: Payment[];
  loading: boolean;
  error: string | null;
  selectedPayment: PaymentDetailsResponse | null;
  fetchPayments: (accessToken: string, role: string) => Promise<void>;
  fetchPaymentDetailsById: (
    id: number,
    accessToken: string,
    role: string
  ) => Promise<void>;

  fetchSubscriptionPayments: (
    accessToken: string,
    role: string
  ) => Promise<void>;
  fetchOffsetPayments: (accessToken: string, role: string) => Promise<void>;

  fetchPaymentHistoryById: (
    id: number,
    accessToken: string,
    role: string
  ) => Promise<void>;
  addPayment: (
    userId: string,
    amount: string,
    transactionId: string,
    accessToken: string,
    role: string
  ) => Promise<void>;
  updatePaymentStatus: (
    paymentId: number,
    status: string,
    accessToken: string
  ) => Promise<void>;
  clearSelectedPayment: () => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      payments: [],
      subscriptionPayments: [],
      offsetPayments: [],
      loading: false,
      error: null,
      selectedPayment: null,

      fetchPayments: async (accessToken: string, role: string) => {
        set({ loading: true, error: null });
        try {
          let url;
          if (role === "business" || role === "individual") {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/my-payments/`;
          } else {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/payments/`;
          }

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch payments");
          }

          const data = await response.json();
          set({ payments: data.payments || [] });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch payments",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchPaymentDetailsById: async (
        id: number,
        accessToken: string,
        role: string
      ) => {
        set({ loading: true, error: null });
        try {
          let url;
          if (role === "business" || role === "individual") {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/my-payments/${id}/`;
          } else {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/payments/${id}/`;
          }

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch payments");
          }

          const data = await response.json();
          set({ selectedPayment: data.payment });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch payments",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchSubscriptionPayments: async (accessToken: string, role: string) => {
        set({ loading: true, error: null });
        try {
          let url;
          if (role === "business" || role === "individual") {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/my-payments/?payment_type=subscription`;
          } else {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/payments/?payment_type=subscription`;
          }

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch payments");
          }

          const data = await response.json();
          set({ subscriptionPayments: data.payments || [] });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch payments",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchOffsetPayments: async (accessToken: string, role: string) => {
        set({ loading: true, error: null });
        try {
          let url;
          if (role === "business" || role === "individual") {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/my-payments/?payment_type=carbon_offset`;
          } else {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/payments/?payment_type=carbon_offset`;
          }

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch payments");
          }

          const data = await response.json();
          set({ offsetPayments: data.payments || [] });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch payments",
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchPaymentHistoryById: async (
        id: number,
        accessToken: string,
        role: string
      ) => {
        set({ loading: true, error: null });
        try {
          let url;
          if (role === "business") {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/my-payments/`;
          } else {
            url = `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/users/${id}/payments/`;
          }

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch payment details");
          }

          const data = await response.json();
          set({ selectedPayment: data });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch payment details",
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      addPayment: async (
        userId: string | number,
        amount: string | number,
        transactionId: string,
        accessToken: string,
        role: string
      ) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/subscription/admin/payments/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                user: Number(userId),
                amount: Number(amount),
                transaction_id: transactionId,
              }),
            }
          );

          if (!response.ok) {
            let errorMessage = "Failed to add payment";
            try {
              const errorData = await response.json();
              if (errorData?.message) errorMessage = errorData.message;
            } catch {
              // ignoring errors
            }
            throw new Error(errorMessage);
          }

          // invoices after adding payment
          await useBillingStore.getState().fetchPayments(accessToken, role);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to add payment",
            loading: false,
          });
          throw error;
        }
      },

      updatePaymentStatus: async (paymentId, status, accessToken) => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/api/subscription/admin/payments/${paymentId}/status/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ payment_status: status }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update payment status");
          }

          set((state) => ({
            payments: state.payments.map((payment) =>
              payment.id === paymentId
                ? { ...payment, payment_status: status }
                : payment
            ),
            subscriptionPayments: state.subscriptionPayments.map((payment) =>
              payment.id === paymentId
                ? { ...payment, payment_status: status }
                : payment
            ),
            offsetPayments: state.offsetPayments.map((payment) =>
              payment.id === paymentId
                ? { ...payment, payment_status: status }
                : payment
            ),
          }));

          // payments after update
          const { fetchPayments } = useBillingStore.getState();
          await fetchPayments(accessToken, "super_admin");
        } catch (error) {
          console.error("Error updating payment status:", error);
          throw error;
        }
      },

      clearSelectedPayment: () => {
        set({ selectedPayment: null });
      },
    }),
    {
      name: "billing-storage",
    }
  )
);
