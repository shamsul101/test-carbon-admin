"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useMySubscriptionStore } from "@/store/mySubscription";
import { usePublicSubscriptionStore } from "@/store/publicSubscriptions";
import { useSubscriptionPaymentStore } from "@/store/subscriptionPayment";
import { useUserProfile } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  Zap,
  Users,
  FileText,
  Database,
  Crown,
  Calendar,
  CreditCard,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ProfileCompletePopup } from "@/components/ProfileCompletePopup";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import PlanDialog from "@/components/PlanDialogue";

export default function MySubscription() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    subscription,
    loading,
    error,
    fetchMySubscription,
    updateMySubscription,
    createSubscription,
    unsubscribeFromPlan,
  } = useMySubscriptionStore();
  const { activePlans, fetchPublicPlans } = usePublicSubscriptionStore();
  const {
    createCheckoutSession,
    redirectToCheckout,
    loading: paymentLoading,
    error: paymentError,
    clearError: clearPaymentError,
  } = useSubscriptionPaymentStore();
  const {
    user,
    profile_update,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasNoSubscription, setHasNoSubscription] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!profile_update && !profileLoading) {
      return;
    }

    if (accessToken) {
      fetchPublicPlans();
      fetchMySubscription(accessToken)
        .then(() => setHasNoSubscription(false))
        .catch((error) => {
          if (error?.message === "No subscription found") {
            setHasNoSubscription(true);
          }
        });
    }
  }, [
    accessToken,
    fetchMySubscription,
    fetchPublicPlans,
    profileLoading,
    profile_update,
  ]);

  console.log("Subscription fetched :: ", subscription);

  useEffect(() => {
    if (error && error !== "No subscription found") {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      clearPaymentError();
    }
  }, [paymentError, clearPaymentError]);

  // Initial billing frequency
  useEffect(() => {
    if (isDialogOpen && subscription) {
      setBilling(subscription.payment_frequency);
    }
  }, [isDialogOpen, subscription]);

  const handleStripeCheckout = async (planId) => {
    if (!accessToken) {
      toast.error("You must be logged in to subscribe.");
      return;
    }

    try {
      setProcessingPayment(true);
      clearPaymentError();

      // Create or update subscription first
      if (hasNoSubscription) {
        await createSubscription(accessToken, {
          plan_id: planId,
          payment_frequency: billing,
        });
        setHasNoSubscription(false);
      } else if (subscription) {
        await updateMySubscription(accessToken, {
          plan_id: planId,
          payment_frequency: billing,
        });
      }

      // Create checkout session
      const checkoutData = await createCheckoutSession(
        accessToken,
        planId,
        billing as "monthly" | "yearly"
      );

      // Redirect to checkout
      if (checkoutData.url) {
        toast.success("Redirecting to secure payment...");
        setTimeout(() => {
          redirectToCheckout(checkoutData.url);
        }, 1000);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Stripe checkout failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to initiate payment. Please try again."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubscriptionAction = async (planId) => {
    await handleStripeCheckout(planId);
  };

  const openPlanDialog = (plan) => {
    setSelectedPlan(plan);
    if (subscription) {
      setBilling(subscription.payment_frequency);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
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
      setIsUpdating(true);
      await unsubscribeFromPlan(accessToken);
      toast.success("Successfully unsubscribed");
      setIsDialogOpen(false);
      setHasNoSubscription(true);
    } catch (error) {
      console.error("Unsubscribe failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to unsubscribe"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile_update) {
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

  // Default values
  const plan_details = subscription?.plan_details || {
    name: "No Active Plan",
    description: "You don't have an active subscription",
    monthly_price: 0,
    yearly_price: 0,
    max_users: 0,
    max_guides: 0,
    max_tokens: 0,
    total_requests_limit: 0,
    features: ["Subscribe to unlock all features"],
  };

  const currentPrice =
    billing === "monthly"
      ? plan_details.monthly_price
      : plan_details.yearly_price;

  const stats = [
    {
      title: "Team Members",
      value: plan_details.max_users || 0,
      icon: Users,
      description: "Maximum users allowed",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Content Guides",
      value: plan_details.max_guides || 0,
      icon: FileText,
      description: "Guides you can create",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "AI Tokens",
      value: (plan_details.max_tokens || 0).toLocaleString(),
      icon: Database,
      description: "Monthly token allocation",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "API Requests",
      value: (plan_details.total_requests_limit || 0).toLocaleString(),
      icon: Zap,
      description: "Monthly request limit",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="mx-auto space-y-8 px-4 py-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Subscription Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasNoSubscription
                ? "Choose a plan that fits your needs"
                : "Manage your subscription and explore upgrade options"}
            </p>
          </div>
        </div>
      </div>

      {/* Processing Payment Alert */}
      {processingPayment && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Setting up secure payment... You'll be redirected to Stripe checkout
            shortly.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      hasNoSubscription
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2.5 rounded-lg",
                    hasNoSubscription ? "bg-muted" : stat.bgColor
                  )}
                >
                  <stat.icon
                    className={cn(
                      "h-4 w-4",
                      hasNoSubscription ? "text-muted-foreground" : stat.color
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Subscription Card */}
      <Card
        className={cn(
          "border-0 shadow-sm bg-gradient-to-br from-white via-white to-primary/[0.02]",
          !hasNoSubscription && "ring-1 ring-primary/10"
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    hasNoSubscription ? "bg-muted-foreground" : "bg-green-500"
                  )}
                />
                <CardTitle className="text-2xl font-semibold text-foreground">
                  {plan_details.name}
                </CardTitle>
                {!hasNoSubscription && (
                  <Badge
                    variant="secondary"
                    className="capitalize text-xs bg-green-100 text-green-700 border-green-200"
                  >
                    {subscription?.status || "inactive"}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm text-muted-foreground max-w-2xl">
                {plan_details.description}
              </CardDescription>
            </div>
            {!hasNoSubscription && (
              <div className="text-right bg-primary/5 rounded-lg px-4 py-3 border border-primary/10">
                <div className="text-xl font-bold text-primary">
                  ${currentPrice.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  per {billing === "monthly" ? "month" : "year"}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {hasNoSubscription ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="p-4 bg-muted/50 rounded-full">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">No Active Subscription</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Get started with one of our subscription plans to unlock all
                  features and capabilities. Check from the below or navigate to
                  our pricing page.
                </p>
              </div>
              <Link to="/subscriptions/pricing">
                <Button className="mt-2">
                  <DollarSign className="h-4 w-4" />
                  Our Pricing Plans
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Plan Features */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Plan Features
                    </h3>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {plan_details.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-2 py-1.5 hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Billing Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Billing Cycle
                        </span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {subscription?.payment_frequency}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-muted/30 rounded-lg transition-colors">
                      <span className="text-sm text-muted-foreground">
                        Started
                      </span>
                      <span className="text-sm font-medium">
                        {subscription?.start_date
                          ? new Date(
                              subscription.start_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-muted/30 rounded-lg transition-colors">
                      <span className="text-sm text-muted-foreground">
                        Next Billing
                      </span>
                      <span className="text-sm font-medium">
                        {subscription?.end_date
                          ? new Date(subscription.end_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Available Plans</h2>
            <p className="text-sm text-muted-foreground">
              {hasNoSubscription
                ? "Choose the perfect plan for your needs"
                : "Upgrade or change your current plan"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan) => {
            const isCurrentPlan =
              !hasNoSubscription && plan.id === subscription?.plan;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all hover:shadow-md cursor-pointer shadow-sm",
                  isCurrentPlan && "ring-2 ring-primary/20 bg-primary/[0.02]"
                )}
                onClick={() => openPlanDialog(plan)}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-5">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-semibold">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">
                        $
                        {billing === "monthly"
                          ? plan.monthly_price.toFixed(2)
                          : (plan.yearly_price * 0.9).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{billing === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                    {billing === "monthly" && (
                      <p className="text-xs text-green-600">
                        Save 10% with yearly billing
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Users</p>
                      <p className="font-medium">{plan.max_users}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Guides</p>
                      <p className="font-medium">{plan.max_guides}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-medium">
                        {plan.max_tokens.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">
                        {plan.total_requests_limit?.toLocaleString() || "∞"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={isCurrentPlan ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Plan Details"
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plan Details Dialog */}
      <PlanDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        selectedPlan={selectedPlan}
        subscription={subscription}
        billing={billing}
        setBilling={setBilling}
        isUpdating={isUpdating || processingPayment || paymentLoading}
        hasNoSubscription={hasNoSubscription}
        onSubscribe={handleSubscriptionAction}
        onUnsubscribe={handleUnsubscribe}
      />
    </div>
  );
}