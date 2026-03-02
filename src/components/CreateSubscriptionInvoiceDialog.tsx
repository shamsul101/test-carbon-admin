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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CreateSubscriptionInvoiceDialogProps {
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

export default function CreateSubscriptionInvoiceDialog({
  isOpen,
  onClose,
  onCreateInvoice,
  isSubmitting,
}: CreateSubscriptionInvoiceDialogProps) {
  const [formData, setFormData] = useState({
    user: "",
    subscription: "",
    total_amount: "",
    due_date: new Date(),
    description: "",
    message: "",
    status: "due",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateInvoice({
        user: parseInt(formData.user),
        subscription: parseInt(formData.subscription),
        total_amount: formData.total_amount,
        due_date: format(formData.due_date, "yyyy-MM-dd"),
        description: formData.description,
        message: formData.message,
        status: formData.status,
      });
      // Reset form
      setFormData({
        user: "",
        subscription: "",
        total_amount: "",
        due_date: new Date(),
        description: "",
        message: "",
        status: "due",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Subscription Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a subscription payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="subscription">Subscription ID</Label>
              <Input
                id="subscription"
                name="subscription"
                type="number"
                value={formData.subscription}
                onChange={handleChange}
                placeholder="456"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount">Total Amount ($)</Label>
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Invoice description..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message/Notes</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Additional notes or message..."
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
