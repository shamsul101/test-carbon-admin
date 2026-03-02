import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useSubscriptionStore } from "@/store/subscriptions";
import { useSubscriberStore } from "@/store/subscriberStore";
import { toast } from "sonner";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { Subscribers } from "@/components/Subscribers";
export default function Subscriptions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const {
    activePlans,
    inactivePlans,
    loading,
    error,
    fetchPlans,
    fetchPublicPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
  } = useSubscriptionStore();

  const {
    subscriptions,
    loading: subscribersLoading,
    error: subscribersError,
    fetchSubscriptions,
    updateSubscriptionFrequency,
    cancelSubscription,
    subscriptionDetails,
    fetchSubscriptionDetails,
  } = useSubscriberStore();

  useEffect(() => {
    if (role === "business" || role === "individual") {
      fetchPublicPlans();
    } else if (accessToken) {
      fetchPlans(accessToken);
    }
    if (accessToken) {
      fetchSubscriptions(accessToken);
    }
  }, [role, accessToken, fetchPlans, fetchPublicPlans, fetchSubscriptions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (subscribersError) {
      toast.error(subscribersError);
    }
  }, [subscribersError]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Subscription Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage subscription plans and monitor customer subscriptions
          </p>
        </div>
      </div>

      {role === "super_admin" && (
        <SubscriptionPlans
          activePlans={activePlans}
          inactivePlans={inactivePlans}
          loading={loading}
          accessToken={accessToken}
          onCreatePlan={createPlan}
          onUpdatePlan={updatePlan}
          onDeletePlan={deletePlan}
          onTogglePlanStatus={togglePlanStatus}
        />
      )}

      {role === "super_admin" && (
        <Subscribers
          loading={subscribersLoading}
          accessToken={accessToken}
          onUpdateFrequency={updateSubscriptionFrequency}
          onCancelSubscription={cancelSubscription}
          onFetchSubscriptionDetails={fetchSubscriptionDetails}
          subscriptions={[]}
          subscriptionDetails={undefined}
        />
      )}
    </div>
  );
}
