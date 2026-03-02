"use client";

import { useEffect, useState } from "react";
import { usePublicSubscriptionStore } from "@/store/publicSubscriptions";
import { useMySubscriptionStore } from "@/store/mySubscription";
import { useAuthStore } from "@/store/auth";
import { useSubscriptionPaymentStore } from "@/store/subscriptionPayment";
import { useUserProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  Crown,
  Zap,
  Star,
  FileQuestion,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// icons
const planIcons = [
  <Star key="basic" className="w-8 h-8 text-blue-500" />,
  <Crown key="popular" className="w-8 h-8 text-amber-500" />,
  <Zap key="premium" className="w-8 h-8 text-purple-500" />,
  <FileQuestion key="premium" className="w-8 h-8 text-purple-500" />,
];

function ProfileCompletePopup() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Complete Your Profile
          </h3>
          <p className="text-slate-600">
            Please complete your profile information in the settings to access
            this section.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/settings")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { activePlans, loading, error, fetchPublicPlans } =
    usePublicSubscriptionStore();

  const { subscription, fetchMySubscription, unsubscribeFromPlan } =
    useMySubscriptionStore();

    console.log("My subscription :: ", subscription)

  const {
    createCheckoutSession,
    redirectToCheckout,
    loading: paymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = useSubscriptionPaymentStore();

  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    profile_update,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [updatingPlanId, setUpdatingPlanId] = useState<number | null>(null);
  const [hasNoSubscription, setHasNoSubscription] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!profile_update && !profileLoading) {
      return;
    }

    fetchPublicPlans();
    if (accessToken) {
      fetchMySubscription(accessToken).catch((error) => {
        if (
          error?.message === "No subscription found" ||
          (typeof error === "string" && error.includes("No subscription found"))
        ) {
          setHasNoSubscription(true);
        }
      });
    }
  }, [
    fetchPublicPlans,
    fetchMySubscription,
    accessToken,
    profile_update,
    profileLoading,
  ]);

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      clearPaymentError();
    }
  }, [paymentError, clearPaymentError]);

  const currentPlanId = subscription?.plan_details.id ?? null;
  const currentPlanPrice = subscription
    ? billing === "yearly"
      ? subscription.plan_details.yearly_price
      : subscription.plan_details.monthly_price
    : 0;

  const sortedPlans = [...activePlans].sort(
    (a, b) => a.monthly_price - b.monthly_price
  );

const handleStripeCheckout = async (planId: number) => {
  if (!accessToken) {
    toast.error("You must be logged in to subscribe.");
    return;
  }
  if (role === "super_admin") {
    toast.error("Super Admin can't subscribe to own plans!");
    return;
  }

  // postpaid check
  if (subscription?.payment_type === "postpaid") {
    toast.info("Your plan is postpaid. Please contact the admin to complete payment.");
    return;
  }

  try {
    setProcessingPayment(true);
    clearPaymentError();

    // Create Stripe checkout session
    const checkoutData = await createCheckoutSession(accessToken, planId, billing);

    // Redirect to Stripe checkout
    if (checkoutData.url) {
      redirectToCheckout(checkoutData.url);
      toast.success("Redirecting to secure payment...");
    }
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to initiate payment. Please try again."
    );
  } finally {
    setProcessingPayment(false);
    setUpdatingPlanId(null);
  }
};


  const handleUnsubscribe = async () => {
    if (!accessToken) {
      toast.error("You must be logged in to unsubscribe.");
      return;
    }
    if (!subscription) {
      toast.error("No active subscription found.");
      return;
    }

    try {
      setUpdatingPlanId(currentPlanId);
      await unsubscribeFromPlan(accessToken);
      toast.success("Successfully unsubscribed");
      setHasNoSubscription(true);
    } catch (error) {
      console.error("Unsubscribe failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to unsubscribe"
      );
    } finally {
      setUpdatingPlanId(null);
    }
  };

  if (!profile_update && user.role == "business") {
    return <ProfileCompletePopup />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto py-16">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-600 font-semibold text-lg mb-2">
                Profile Error
              </div>
              <div className="text-red-500">{profileError}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto py-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto" />
              <p className="text-muted-foreground font-medium">
                Loading pricing plans...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto py-16">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-600 font-semibold text-lg mb-2">
                Unable to Load Plans
              </div>
              <div className="text-red-500">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Scale your business with confidence. Choose the plan that fits your
            needs and upgrade anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12 md:mb-20">
          <div className="relative bg-white p-1.5 rounded-xl shadow-lg border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-pressed={billing === "monthly"}
                className={cn(
                  "relative px-6 py-2.5 md:px-8 md:py-3 rounded-xl transition-all duration-300 font-semibold text-sm tracking-wide",
                  billing === "monthly"
                    ? "bg-slate-900 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={billing === "yearly"}
                className={cn(
                  "relative px-6 py-2.5 md:px-8 md:py-3 rounded-xl transition-all duration-300 font-semibold text-sm tracking-wide",
                  billing === "yearly"
                    ? "bg-slate-900 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                onClick={() => setBilling("yearly")}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  -10%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {sortedPlans.map((plan, idx) => {
            const isPopular = idx === 1 && sortedPlans.length > 1;
            const price =
              billing === "yearly"
                ? (plan.yearly_price * 0.9).toFixed(2)
                : plan.monthly_price.toFixed(2);

            const planPriceNumeric =
              billing === "yearly" ? plan.yearly_price : plan.monthly_price;

            const isCurrentPlan = plan.id === currentPlanId;
            const isUpdating = updatingPlanId === plan.id;

            let actionButton = null;

            if (hasNoSubscription || !subscription) {
              actionButton = (
                <Button
                  className={cn(
                    "w-full h-11 font-semibold text-sm md:text-base rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                    isPopular
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : "bg-slate-900 hover:bg-slate-800"
                  )}
                  onClick={() => handleStripeCheckout(plan.id)}
                  disabled={isUpdating || processingPayment}
                >
                  {isUpdating || processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              );
            } else if (isCurrentPlan) {
              actionButton = (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold text-sm md:text-base rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={handleUnsubscribe}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Unsubscribe"
                    )}
                  </Button>
                </div>
              );
            } else {
              if (planPriceNumeric > currentPlanPrice) {
                actionButton = (
                  <Button
                    className="w-full h-11 font-semibold text-sm md:text-base rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={isUpdating || processingPayment}
                  >
                    {isUpdating || processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Upgrade
                      </>
                    )}
                  </Button>
                );
              } else if (planPriceNumeric < currentPlanPrice) {
                actionButton = (
                  <Button
                    className="w-full h-11 font-semibold text-sm md:text-base rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={isUpdating || processingPayment}
                  >
                    {isUpdating || processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Downgrade"
                    )}
                  </Button>
                );
              } else {
                actionButton = (
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold text-sm md:text-base rounded-xl border-2 hover:bg-slate-50 transition-all duration-300"
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={isUpdating || processingPayment}
                  >
                    {isUpdating || processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Switch Plan"
                    )}
                  </Button>
                );
              }
            }

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group flex flex-col",
                  isPopular
                    ? "border-blue-200 shadow-blue-100/50 md:scale-105 z-10"
                    : "border-slate-200 hover:border-slate-300",
                  isCurrentPlan &&
                    "border-green-400 shadow-green-100/50 ring-4 ring-green-100"
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-4 py-1 md:px-6 md:py-2 rounded-full shadow-lg text-xs tracking-wide">
                      POPULAR
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-2 py-1 rounded-full shadow-lg text-xs">
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      ACTIVE
                    </Badge>
                  </div>
                )}

                <div className="p-5 md:p-6 pt-8 md:pt-10 flex-1 flex flex-col">
                  {/* Plan Icon & Name */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {planIcons[idx % planIcons.length]}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1 md:mb-2">
                      {plan.name}
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className="flex items-end justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                      <span className="text-3xl md:text-5xl font-bold text-slate-900">
                        ${price}
                      </span>
                      <span className="text-sm md:text-lg text-slate-500 mb-1 md:mb-2">
                        /{billing === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billing === "yearly" && (
                      <p className="text-xs md:text-sm text-green-600 font-medium">
                        Save ${(plan.yearly_price * 0.1).toFixed(2)} annually
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mb-5 md:mb-6">{actionButton}</div>

                  {/* Features */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-3 md:mb-4 text-center text-sm md:text-base">
                      Everything included:
                    </h3>
                    <ul className="space-y-2 md:space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 md:gap-3 text-slate-700 group/item text-xs md:text-sm"
                        >
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-12 md:mt-20 text-center">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 text-slate-600 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="font-medium">30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="font-medium">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="font-medium">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
