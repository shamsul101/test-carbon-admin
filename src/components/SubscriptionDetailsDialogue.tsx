import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Package,
  DollarSign,
  Zap,
  CreditCard,
} from "lucide-react";

interface SubscriptionDetails {
  id: number;
  user: number;
  user_email?: string;
  user_name?: string;
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
  };
  start_date: string;
  end_date: string;
  status: string;
  payment_frequency: string;
  created_at: string;
  last_renewed_at: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

interface SubscriptionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionDetails | null;
  loading: boolean;
  role?: string;
}

export function SubscriptionDetailsDialog({
  isOpen,
  onClose,
  subscription,
  loading,
  role,
}: SubscriptionDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelled
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-4 w-4 mr-1" />
            Trialing
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            Past Due
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
          <DialogDescription>
            Detailed information about this subscription
          </DialogDescription>
        </DialogHeader>

        {subscription ? (
          <div className="flex-1 overflow-y-auto">
            {/* Customer Information */}
            {role !== "business" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Customer Name
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.user_name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4" />
                    Customer Email
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.user_email || "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Plan Information */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border-b-2">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plan Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Plan Name
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.plan_details.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Plan Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        subscription.plan_details.is_active
                          ? "default"
                          : "secondary"
                      }
                      className={
                        subscription.plan_details.is_active
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {subscription.plan_details.is_active
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Monthly Price
                  </Label>
                  <p className="text-sm mt-1 font-bold text-green-600">
                    $
                    {parseFloat(
                      subscription.plan_details.monthly_price
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Yearly Price
                  </Label>
                  <p className="text-sm mt-1 font-bold text-green-600">
                    $
                    {parseFloat(subscription.plan_details.yearly_price).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <Label className="text-sm font-medium text-gray-700">
                  Features
                </Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {subscription.plan_details.features.join(", ")}
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border-b-2">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Zap className="h-4 w-4" />
                    Status
                  </Label>
                  <div className="mt-1">
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4" />
                    Payment Frequency
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.payment_frequency.charAt(0).toUpperCase() +
                      subscription.payment_frequency.slice(1)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {new Date(subscription.start_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {subscription.status === "active"
                      ? "Renewal Date"
                      : "End Date"}
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {new Date(subscription.end_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {subscription.stripe_subscription_id && (
                <div className="mt-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Stripe Subscription ID
                  </Label>
                  <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                    {subscription.stripe_subscription_id}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">
                Additional Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Auto Renewal
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.cancel_at_period_end ? "Disabled" : "Enabled"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Last Renewed
                  </Label>
                  <p className="text-sm mt-1 font-medium">
                    {subscription.last_renewed_at
                      ? new Date(
                          subscription.last_renewed_at
                        ).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No subscription details available</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button variant="destructive" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
