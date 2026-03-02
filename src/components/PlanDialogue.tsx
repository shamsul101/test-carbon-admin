import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Users,
  FileText,
  Database,
  Zap,
  Crown,
  Calendar,
  X,
  Loader2,
} from "lucide-react";

const PlanDialog = ({
  open,
  onOpenChange,
  selectedPlan,
  subscription,
  billing,
  setBilling,
  isUpdating,
  hasNoSubscription,
  onSubscribe,
  onUnsubscribe,
}) => {
  const [updatingPlanId, setUpdatingPlanId] = useState(null);

  if (!selectedPlan) return null;

  // if user is changing frequency or plan
  const isFrequencyChange =
    subscription &&
    selectedPlan.id === subscription.plan &&
    billing !== subscription.payment_frequency;

  const isPlanChange = subscription && selectedPlan.id !== subscription.plan;

  const shouldEnableButton =
    hasNoSubscription || isFrequencyChange || isPlanChange;

  const handleSubscriptionAction = () => {
    setUpdatingPlanId(selectedPlan.id);
    onSubscribe(selectedPlan.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            {selectedPlan.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {selectedPlan.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Billing Frequency</h4>
                <Select
                  value={billing}
                  onValueChange={(value) =>
                    setBilling(value as "monthly" | "yearly")
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly (Save 10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right space-y-1">
                <div className="text-2xl font-bold">
                  $
                  {billing === "monthly"
                    ? selectedPlan.monthly_price.toFixed(2)
                    : (selectedPlan.yearly_price * 0.9).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {billing === "monthly" ? "month" : "year"}
                </div>
                {billing === "yearly" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-700"
                  >
                    Original Price $
                    {(selectedPlan.yearly_price * 0.1 * 10).toFixed(0)}
                    /year
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Plan Features
            </h4>
            <div className="grid gap-2">
              {selectedPlan.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-2 py-1.5 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Resource Limits
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Users,
                  label: "Max Users",
                  value: selectedPlan.max_users,
                },
                {
                  icon: FileText,
                  label: "Max Guides",
                  value: selectedPlan.max_guides,
                },
                {
                  icon: Database,
                  label: "Max Tokens",
                  value: selectedPlan.max_tokens.toLocaleString(),
                },
                {
                  icon: Zap,
                  label: "API Requests",
                  value:
                    selectedPlan.total_requests_limit?.toLocaleString() ||
                    "Unlimited",
                },
              ].map((item, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <Button
              onClick={handleSubscriptionAction}
              disabled={!shouldEnableButton || isUpdating}
              className="w-full"
              size="lg"
            >
              {isUpdating && updatingPlanId === selectedPlan.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : hasNoSubscription ? (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Subscribe Now
                </>
              ) : isFrequencyChange ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Billing Frequency
                </>
              ) : selectedPlan.id === subscription?.plan ? (
                "Current Plan"
              ) : selectedPlan.monthly_price >
                (subscription?.plan_details.monthly_price || 0) ? (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </>
              ) : (
                "Change Plan"
              )}
            </Button>

            {/* Unsubscribe Button */}
            {selectedPlan.id === subscription?.plan && (
              <Button
                onClick={onUnsubscribe}
                disabled={isUpdating}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Unsubscribe
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDialog;
