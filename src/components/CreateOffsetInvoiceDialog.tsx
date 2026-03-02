import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreateOffsetInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (invoiceData: {
    carbon_offset_purchase_id: string;
    user: number;
    total_amount: string;
    currency: string;
    due_date: string;
    description: string;
    notes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateOffsetInvoiceDialog({
  isOpen,
  onClose,
  onCreateInvoice,
  isSubmitting,
}: CreateOffsetInvoiceDialogProps) {
  const [formData, setFormData] = useState({
    carbon_offset_purchase_id: "",
    user: "",
    total_amount: "",
    currency: "USD",
    due_date: new Date(),
    description: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateInvoice({
        carbon_offset_purchase_id: formData.carbon_offset_purchase_id,
        user: parseInt(formData.user),
        total_amount: formData.total_amount,
        currency: formData.currency,
        due_date: format(formData.due_date, "yyyy-MM-dd"),
        description: formData.description,
        notes: formData.notes || undefined,
      });
      // Reset form
      setFormData({
        carbon_offset_purchase_id: "",
        user: "",
        total_amount: "",
        currency: "USD",
        due_date: new Date(),
        description: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Offset Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a carbon offset purchase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carbon_offset_purchase_id">
              Purchase Confirmation ID
            </Label>
            <Input
              id="carbon_offset_purchase_id"
              name="carbon_offset_purchase_id"
              value={formData.carbon_offset_purchase_id}
              onChange={handleChange}
              placeholder="CN123456789"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">User ID</Label>
              <Input
                id="user"
                name="user"
                type="number"
                value={formData.user}
                onChange={handleChange}
                placeholder="123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="USD"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount">Total Amount</Label>
            <Input
              id="total_amount"
              name="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={handleChange}
              placeholder="99.99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? (
                    format(formData.due_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) =>
                    date && setFormData((prev) => ({ ...prev, due_date: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Carbon offset purchase details..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
