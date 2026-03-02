/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { FileText, Loader2 } from "lucide-react";

interface SubscriptionDetails {
  plan_name?: string;
  payment_frequency?: string;
  status?: string;
}

interface Payment {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
  payment_type: string;
  amount: string;
  payment_date?: string;
  payment_status: string;
  transaction_id?: string;
  payment_method?: string;
  subscription_details?: SubscriptionDetails;
  carbon_offset_details?: any;
  description?: string;
  currency?: string;
  stripe_payment_intent_id?: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedPayment: any
  loading: boolean
  role: string
}

export default function PaymentDetailsDialog({
  isOpen,
  onClose,
  selectedPayment,
  loading,
  role,
}: PaymentDetailsDialogProps) {
  console.log("selectedPayment :: ", selectedPayment);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Detailed information about this payment record
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : selectedPayment ? (
          <div className="flex-1 overflow-y-auto">
{/* Customer Information */}
{role === "super_admin" && (
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <Label className="text-sm font-medium text-gray-700">
        Customer Name
      </Label>
      <p className="text-sm mt-1 font-medium">
        {typeof selectedPayment.user === "object"
          ? selectedPayment.user?.name
          : selectedPayment.user_name || "N/A"}
      </p>
    </div>
    <div>
      <Label className="text-sm font-medium text-gray-700">
        Customer Email
      </Label>
      <p className="text-sm mt-1 font-medium">
        {typeof selectedPayment.user === "object"
          ? selectedPayment.user?.email
          : selectedPayment.user_email || "N/A"}
      </p>
    </div>
  </div>
)}


            {/* Payment Information */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">
                  Payment Information
                </h4>

                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg overflow-y-auto border-b-2">
                  {/* Subscription or Carbon Offset Details */}
                  {selectedPayment.payment_type === "subscription" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Subscription Plan
                        </Label>
                        <p className="text-sm mt-1 font-medium">
                          {selectedPayment.subscription_details?.plan_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedPayment.subscription_details?.payment_frequency || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Subscription Status
                        </Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedPayment.subscription_details?.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              selectedPayment.subscription_details?.status === "active"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }
                          >
                            {selectedPayment.subscription_details?.status
                              ? selectedPayment.subscription_details.status
                                  .charAt(0)
                                  .toUpperCase() +
                                selectedPayment.subscription_details.status.slice(1)
                              : "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : selectedPayment.payment_type === "carbon_offset" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Project Name
                        </Label>
                        <p className="text-sm mt-1 font-medium">
                          {selectedPayment.carbon_offset_details?.project_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Certificate Number
                        </Label>
                        <p className="text-sm mt-1 font-medium">
                          {selectedPayment.carbon_offset_details?.certificate_number || "N/A"}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Amount
                      </Label>
                      <p className="text-sm mt-1 font-bold text-green-600">
                        {selectedPayment.currency?.toUpperCase() || "$"}{parseFloat(selectedPayment.amount || "0").toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Payment Status
                      </Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedPayment.payment_status === "completed"
                              ? "default"
                              : selectedPayment.payment_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            selectedPayment.payment_status === "completed"
                              ? "bg-green-500"
                              : selectedPayment.payment_status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {selectedPayment.payment_status
                            ? selectedPayment.payment_status
                                .charAt(0)
                                .toUpperCase() +
                              selectedPayment.payment_status.slice(1)
                            : "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Payment Date
                      </Label>
                      <p className="text-sm mt-1 font-medium">
                        {selectedPayment.payment_date
                          ? new Date(selectedPayment.payment_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Transaction ID
                      </Label>
                      <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedPayment.stripe_payment_intent_id || selectedPayment.transaction_id || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Payment Type
                      </Label>
                      <p className="text-sm mt-1 font-medium capitalize">
                        {selectedPayment.payment_type || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Payment ID
                      </Label>
                      <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedPayment.id}
                      </p>
                    </div>
                  </div>

                  {selectedPayment.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <p className="text-sm mt-1 font-medium">
                        {selectedPayment.description}
                      </p>
                    </div>
                  )}

                  {selectedPayment.receipt_url && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Receipt
                      </Label>
                      <p className="text-sm mt-1">
                        <a
                          href={selectedPayment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Receipt
                        </a>
                      </p>
                    </div>
                  )}

                  {selectedPayment.payment_method && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Payment Method
                        </Label>
                        <p className="text-sm mt-1 font-medium">
                          {selectedPayment.payment_method}
                        </p>
                      </div>
<div>
  <Label className="text-sm font-medium text-gray-700">
    User ID
  </Label>
  <p className="text-sm mt-1 font-medium">
    {typeof selectedPayment.user === "object"
      ? selectedPayment.user?.id
      : selectedPayment.user}
  </p>
</div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No payment details available</p>
          </div>
        )}

        <div className="border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}