import { create } from "zustand";

export interface CheckoutSessionResponse {
  url: string;
  session_id: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  subscription_id?: string;
  payment_status?: string;
}

interface SubscriptionPaymentState {
  loading: boolean;
  error: string | null;
  checkoutSession: CheckoutSessionResponse | null;
  paymentVerification: PaymentVerificationResponse | null;
  lastVerifiedSessionId: string | null;

  createCheckoutSession: (
    accessToken: string,
    planId: number,
    paymentFrequency: "monthly" | "yearly"
  ) => Promise<CheckoutSessionResponse>;

  verifyPaymentCompletion: (
    sessionId: string
  ) => Promise<PaymentVerificationResponse>;

  redirectToCheckout: (checkoutUrl: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useSubscriptionPaymentStore = create<SubscriptionPaymentState>(
  (set, get) => ({
    loading: false,
    error: null,
    checkoutSession: null,
    paymentVerification: null,
    lastVerifiedSessionId: null,

    createCheckoutSession: async (accessToken, planId, paymentFrequency) => {
      set({ loading: true, error: null });

      try {
        const successUrl = `${window.location.origin}/subscriptions/payment/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${window.location.origin}/subscriptions/payment/cancel`;

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/subscription/stripe/checkout/recurring-subscription/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              plan_id: planId,
              payment_frequency: paymentFrequency,
              success_url: successUrl,
              cancel_url: cancelUrl,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to create checkout session"
          );
        }

        const data: CheckoutSessionResponse = await response.json();

        console.log("Stripe Checkout Session Response:", data);

        set({
          checkoutSession: data,
          loading: false,
          error: null,
        });

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create checkout session";
        set({
          error: errorMessage,
          loading: false,
          checkoutSession: null,
        });
        throw error;
      }
    },

    verifyPaymentCompletion: async (sessionId) => {
      const { lastVerifiedSessionId, paymentVerification } = get();
      if (lastVerifiedSessionId === sessionId && paymentVerification) {
        console.log("✅ Already verified this session, skipping...");
        return paymentVerification;
      }

      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/subscription/stripe/checkout/completed/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to verify payment");
        }

        const data: PaymentVerificationResponse = await response.json();

        set({
          paymentVerification: data,
          lastVerifiedSessionId: sessionId,
          loading: false,
          error: null,
        });

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to verify payment";
        set({
          error: errorMessage,
          loading: false,
          paymentVerification: null,
        });
        throw error;
      }
    },

    redirectToCheckout: (checkoutUrl) => {
      window.location.href = checkoutUrl;
    },

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        loading: false,
        error: null,
        checkoutSession: null,
        paymentVerification: null,
        lastVerifiedSessionId: null,
      }),
  })
);
