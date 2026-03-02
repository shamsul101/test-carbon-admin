import React from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw, Home, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentCancel() {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-orange-200 bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your subscription payment was cancelled. No charges were made.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <XCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Your payment was cancelled and no charges were applied to your
                account. Your subscription remains unchanged.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You can try again anytime</li>
                <li>• No charges were made to your account</li>
                <li>• Your current subscription remains active (if any)</li>
                <li>• Contact support if you need assistance</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What Happened?</h3>
              <p className="text-sm text-gray-600">
                The payment process was cancelled before completion. This could
                happen if:
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1 ml-4">
                <li>• You clicked the back button during payment</li>
                <li>• You closed the payment window</li>
                <li>• There was a network interruption</li>
                <li>• You chose to cancel the payment</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/subscriptions/my-subscription" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Plans
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
