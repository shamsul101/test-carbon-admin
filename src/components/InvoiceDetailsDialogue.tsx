import {
  FileText,
  CheckCircle,
  XCircle,
  Download,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Invoice } from "@/types/billing";

interface InvoiceDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoice: Invoice | null;
  loading: boolean;
  role?: string;
}

export default function InvoiceDetailsDialog({
  isOpen,
  onClose,
  selectedInvoice,
  loading,
  role,
}: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Detailed information about this invoice
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : selectedInvoice ? (
          <div className="flex-1 overflow-y-auto">
            {/* Invoice Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Invoice Number
                </Label>
                <p className="text-sm mt-1 font-mono">
                  {selectedInvoice.invoice_number}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedInvoice.is_fully_paid
                        ? "default"
                        : selectedInvoice.status === "partial"
                        ? "secondary"
                        : "destructive"
                    }
                    className={
                      selectedInvoice.is_fully_paid
                        ? "bg-green-500"
                        : selectedInvoice.status === "partial"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {selectedInvoice.is_fully_paid ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Paid
                      </span>
                    ) : selectedInvoice.status === "partial" ? (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Partial
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Unpaid
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Customer Email
                </Label>
                <p className="text-sm mt-1 font-medium">
                  {selectedInvoice.user_email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Subscription Plan
                </Label>
                <p className="text-sm mt-1 font-medium">
                  {selectedInvoice.subscription_plan}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Issue Date
                </Label>
                <p className="text-sm mt-1 font-medium">
                  {new Date(selectedInvoice.issue_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Due Date
                </Label>
                <p className="text-sm mt-1 font-medium">
                  {new Date(selectedInvoice.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Total Amount
                </Label>
                <p className="text-sm mt-1 font-bold text-green-600">
                  ${selectedInvoice.total_amount}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Paid Amount
                </Label>
                <p className="text-sm mt-1 font-bold text-blue-600">
                  ${selectedInvoice.paid_amount}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Remaining
                </Label>
                <p className="text-sm mt-1 font-bold text-red-600">
                  ${selectedInvoice.remaining_amount}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedInvoice.description && (
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <p className="text-sm mt-1">{selectedInvoice.description}</p>
              </div>
            )}

            {/* Message */}
            {selectedInvoice.message && (
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <p className="text-sm mt-1">{selectedInvoice.message}</p>
              </div>
            )}

            {/* Payments */}
            {/* <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3">Payment History</h4>
              {selectedInvoice.payments && selectedInvoice.payments.length ? (
                <div className="space-y-4">
                  {selectedInvoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Amount
                          </Label>
                          <p className="text-sm mt-1 font-bold">
                            ${payment.amount}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Status
                          </Label>
                          <div className="mt-1">
                            <Badge
                              variant={
                                payment.payment_status === "completed"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                payment.payment_status === "completed"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }
                            >
                              {payment.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Transaction ID
                          </Label>
                          <p className="text-sm mt-1 font-mono">
                            {payment.transaction_id}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Date
                          </Label>
                          <p className="text-sm mt-1">
                            {new Date(payment.payment_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="mt-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Notes
                          </Label>
                          <p className="text-sm mt-1">{payment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No payment history available</p>
                </div>
              )}
            </div> */}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No invoice data available</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
