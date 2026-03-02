import { useState, useEffect } from "react";
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
import { Invoice } from "@/types/billing";

interface UpdateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateInvoice: (invoiceData: {
    total_amount: string;
    due_date: string;
    description: string;
    message: string;
    status: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  invoice?: Invoice;
}

export default function UpdateInvoiceDialog({
  isOpen,
  onClose,
  onUpdateInvoice,
  isSubmitting,
  invoice,
}: UpdateInvoiceDialogProps) {
  const [invoiceData, setInvoiceData] = useState({
    total_amount: "",
    due_date: "",
    description: "",
    message: "",
    status: "sent",
  });

  useEffect(() => {
    if (isOpen && invoice) {
      // datetime-local
      const dueDate = invoice.due_date
        ? new Date(invoice.due_date)
        : new Date();
      const formattedDate = dueDate.toISOString().slice(0, 16);

      setInvoiceData({
        total_amount: invoice.total_amount || "",
        due_date: formattedDate,
        description: invoice.description || "",
        message: invoice.message || "",
        status: invoice.status || "sent",
      });
    }
  }, [isOpen, invoice]);

  const handleSubmit = async () => {
    // datetime-local
    const dueDateISO = new Date(invoiceData.due_date).toISOString();

    const updatedData = {
      ...invoiceData,
      due_date: dueDateISO,
    };

    await onUpdateInvoice(updatedData);
  };

  const handleClose = () => {
    setInvoiceData({
      total_amount: "",
      due_date: "",
      description: "",
      message: "",
      status: "sent",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border">
        <DialogHeader>
          <DialogTitle>Update Invoice Information</DialogTitle>
          <DialogDescription>
            Update the invoice details for invoice #{invoice?.invoice_number}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-4 max-h-96 overflow-y-auto">
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
              placeholder="Enter total amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={invoiceData.due_date}
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
              placeholder="Enter invoice description"
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
              placeholder="Enter invoice message"
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
              !invoiceData.total_amount ||
              !invoiceData.due_date ||
              !invoiceData.description
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Invoice"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
