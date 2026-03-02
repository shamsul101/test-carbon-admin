import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: {
    user: string;
    amount: string;
    transaction_id: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddPaymentDialog({
  isOpen,
  onClose,
  onAddPayment,
  isSubmitting,
}: AddPaymentDialogProps) {
  const [newPayment, setNewPayment] = useState({
    user: "",
    amount: "",
    transaction_id: "",
  });

  const handleSubmit = async () => {
    await onAddPayment(newPayment);
    setNewPayment({
      user: "",
      amount: "",
      transaction_id: "",
    });
  };

  const handleClose = () => {
    setNewPayment({
      user: "",
      amount: "",
      transaction_id: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border">
        <DialogHeader className="text-center">
          <DialogTitle>Add New Payment</DialogTitle>
          <DialogDescription>
            Create a new payment record for a customer
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4 max-h-96 overflow-y-auto px-4">
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              type="number"
              value={newPayment.user}
              onChange={(e) =>
                setNewPayment({ ...newPayment, user: e.target.value })
              }
              placeholder="Enter user ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={newPayment.amount}
              onChange={(e) =>
                setNewPayment({ ...newPayment, amount: e.target.value })
              }
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-id">Transaction ID</Label>
            <Input
              id="transaction-id"
              value={newPayment.transaction_id}
              onChange={(e) =>
                setNewPayment({
                  ...newPayment,
                  transaction_id: e.target.value,
                })
              }
              placeholder="Enter transaction ID"
            />
          </div>
        </div>
        <div className="flex justify-center px-4 pb-4">
          <Button
            onClick={handleSubmit}
            className="bg-carbon-gradient w-full"
            disabled={
              isSubmitting ||
              !newPayment.user ||
              !newPayment.amount ||
              !newPayment.transaction_id
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Add Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
