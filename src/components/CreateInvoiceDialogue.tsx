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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (invoiceData: {
    user: number;
    subscription: number;
    total_amount: string;
    due_date: string;
    description: string;
    message: string;
    status: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateInvoiceDialog({
  isOpen,
  onClose,
  onCreateInvoice,
  isSubmitting,
}: CreateInvoiceDialogProps) {
  const [invoiceData, setInvoiceData] = useState({
    user: "",
    subscription: "",
    total_amount: "",
    due_date: "",
    description: "",
    message: "",
    status: "sent",
  });

  const handleSubmit = async () => {
    const dueDateISO = new Date(invoiceData.due_date).toISOString();

    const createData = {
      user: parseInt(invoiceData.user),
      subscription: parseInt(invoiceData.subscription),
      total_amount: invoiceData.total_amount,
      due_date: dueDateISO,
      description: invoiceData.description,
      message: invoiceData.message,
      status: invoiceData.status,
    };

    await onCreateInvoice(createData);
    setInvoiceData({
      user: "",
      subscription: "",
      total_amount: "",
      due_date: "",
      description: "",
      message: "",
      status: "sent",
    });
  };

  const handleClose = () => {
    setInvoiceData({
      user: "",
      subscription: "",
      total_amount: "",
      due_date: "",
      description: "",
      message: "",
      status: "sent",
    });
    onClose();
  };

  // default due date to 15 days from now
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-4 bg-background border">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a customer subscription
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              type="number"
              value={invoiceData.user}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  user: e.target.value,
                })
              }
              placeholder="Enter user ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subscription-id">Subscription ID</Label>
            <Input
              id="subscription-id"
              type="number"
              value={invoiceData.subscription}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  subscription: e.target.value,
                })
              }
              placeholder="Enter subscription ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input
              id="total-amount"
              type="number"
              step="0.01"
              value={invoiceData.total_amount}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  total_amount: e.target.value,
                })
              }
              placeholder="Enter total amount (e.g., 500.00)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={invoiceData.due_date || getDefaultDueDate()}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  due_date: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={invoiceData.description}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  description: e.target.value,
                })
              }
              placeholder="Monthly subscription fee for Free Plan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={invoiceData.message}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  message: e.target.value,
                })
              }
              placeholder="Please pay by the due date to avoid service interruption"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={invoiceData.status}
              onValueChange={(value) =>
                setInvoiceData({
                  ...invoiceData,
                  status: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="unsent">Unsent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !invoiceData.user ||
              !invoiceData.subscription ||
              !invoiceData.total_amount ||
              !invoiceData.description
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
