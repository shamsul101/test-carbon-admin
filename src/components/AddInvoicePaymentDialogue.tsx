"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";

interface AddInvoicePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: {
    amount: string;
    transaction_id: string;
    notes: string;
    payment_file: File | null;
  }) => Promise<void>;
  isSubmitting: boolean;
  invoiceNumber?: string;
}

export default function AddInvoicePaymentDialog({
  isOpen,
  onClose,
  onAddPayment,
  isSubmitting,
  invoiceNumber,
}: AddInvoicePaymentDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newInvoicePayment, setNewInvoicePayment] = useState({
    amount: "",
    transaction_id: "",
    notes: "",
    payment_file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewInvoicePayment((prev) => ({
      ...prev,
      payment_file: file,
    }));
  };

  const removeFile = () => {
    setNewInvoicePayment((prev) => ({ ...prev, payment_file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    await onAddPayment(newInvoicePayment);
    setNewInvoicePayment({
      amount: "",
      transaction_id: "",
      notes: "",
      payment_file: null,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setNewInvoicePayment({
        amount: "",
        transaction_id: "",
        notes: "",
        payment_file: null,
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Invoice Payment</DialogTitle>
          {invoiceNumber && (
            <DialogDescription>
              Add a payment to invoice #{invoiceNumber}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={newInvoicePayment.amount}
              onChange={(e) =>
                setNewInvoicePayment((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction ID *</Label>
            <Input
              id="transaction_id"
              value={newInvoicePayment.transaction_id}
              onChange={(e) =>
                setNewInvoicePayment((prev) => ({
                  ...prev,
                  transaction_id: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newInvoicePayment.notes}
              onChange={(e) =>
                setNewInvoicePayment((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="payment_file">Payment Receipt</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="payment_file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              {newInvoicePayment.payment_file && (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[200px]">
                      {newInvoicePayment.payment_file.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !newInvoicePayment.amount ||
              !newInvoicePayment.transaction_id
            }
          >
            {isSubmitting ? "Submitting..." : "Add Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
