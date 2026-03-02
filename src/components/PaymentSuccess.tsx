import React, { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useSubscriptionPaymentStore } from "@/store/subscriptionPayment";
import { useMySubscriptionStore } from "@/store/mySubscription";
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  Home,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    verifyPaymentCompletion,
    paymentVerification,
    loading,
    error,
    clearError,
  } = useSubscriptionPaymentStore();
  const { fetchMySubscription } = useMySubscriptionStore();

  useEffect(() => {
    if (!accessToken) {
      toast.error("Authentication required");
      console.warn("No access token found, redirecting to login");
      navigate("/login");
      return;
    }

    // dont re-verification if already verified
    if (paymentVerification?.success) {
      return;
    }

    if (loading) {
      console.log("⏳ Payment verification already in progress...");
      return;
    }

    const verifyPayment = async () => {
      try {
        clearError();
        console.log("Verifying payment for sessionId:", sessionId);
        const verificationPaymentResponse = await verifyPaymentCompletion(
          sessionId
        );
        console.log("Verification Response:", verificationPaymentResponse);

        await fetchMySubscription(accessToken);

        toast.success(
          verificationPaymentResponse?.message ||
            "Payment verified successfully!"
        );
      } catch (err) {
        console.error("Payment verification failed:", err);
        toast.error("Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [
    sessionId,
    accessToken,
    verifyPaymentCompletion,
    fetchMySubscription,
    navigate,
    loading,
    clearError,
    paymentVerification,
  ]);

  const isVerified = paymentVerification?.success === true;

  if (loading && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card className="text-center shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Processing Transaction
                  </h2>
                  <p className="text-sm text-gray-600">
                    Confirming your subscription details with our payment
                    provider...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !isVerified) {
    console.warn("⚠️ Payment verification error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-red-900">
                Transaction Verification Issue
              </CardTitle>
              <CardDescription className="text-red-700">
                We encountered a problem confirming your payment details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  This doesn't necessarily mean your payment failed. Sometimes
                  verification takes a few extra moments.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Check your email for payment confirmation</li>
                  <li>• Your bank may still be processing the transaction</li>
                  <li>• Contact support if you need immediate assistance</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Verification Again
                </Button>
                <Link to="/subscriptions/my-subscription" className="flex-1">
                  <Button variant="default" className="w-full">
                    Subscription Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-green-200 bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Transaction Complete
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {isVerified
                ? "Your subscription payment has been successfully processed"
                : "Welcome to your upgraded subscription plan"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentVerification && (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {paymentVerification.message} No further action is required
                    and your subscription remains active.
                  </AlertDescription>
                </Alert>

                {paymentVerification.payment_status && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Transaction Status
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      {paymentVerification.payment_status}
                    </Badge>
                  </div>
                )}

                {paymentVerification.subscription_id && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Subscription Reference
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                      {typeof paymentVerification.subscription_id === "string"
                        ? `${paymentVerification.subscription_id.slice(
                            0,
                            20
                          )}...`
                        : String(paymentVerification.subscription_id)}
                    </code>
                  </div>
                )}

                {sessionId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Transaction ID
                    </span>
                    <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                      {sessionId.slice(0, 20)}...
                    </code>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your subscription benefits are now active</li>
                <li>• A receipt will be sent to your email shortly</li>
                <li>• All premium features are immediately available</li>
                <li>• Manage your subscription from your account dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/subscriptions/my-subscription" className="flex-1">
                <Button className="w-full" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
