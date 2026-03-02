// components/SubscriptionInvoices.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, CreditCard, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";
import { SubscriptionInvoice } from "@/types/billing";

interface SubscriptionInvoicesComponentProps {
  invoices: SubscriptionInvoice[];
  role: string;
  onViewDetails: (invoiceId: number) => void;
  onOpenUpdateInvoice: (invoice: SubscriptionInvoice) => void;
  onOpenAddInvoicePayment: (invoice: SubscriptionInvoice) => void;
}

export default function SubscriptionInvoicesComponent({
  invoices,
  role,
  onViewDetails,
  onOpenUpdateInvoice,
  onOpenAddInvoicePayment,
}: SubscriptionInvoicesComponentProps) {
  // Pagination
  const {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    handleItemsPerPageChange,
  } = usePagination<SubscriptionInvoice>(5);

  const {
    paginatedItems: paginatedInvoices,
    totalItems: totalInvoicesCount,
    totalPages: totalInvoicesPages,
    startIndex,
    endIndex,
  } = paginate(invoices);

  // Helper function to calculate payment status
  const getPaymentStatus = (invoice: SubscriptionInvoice) => {
    const paidAmount = parseFloat(invoice.paid_amount || "0");
    const totalAmount = parseFloat(invoice.total_amount);
    const isFullyPaid = paidAmount >= totalAmount;
    const paymentPercentage =
      totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return {
      isFullyPaid,
      paymentPercentage,
      paidAmount,
    };
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            {role !== "business" && <TableHead>Customer</TableHead>}
            <TableHead>Subscription Plan</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Invoice Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInvoices.map((invoice) => {
            const paymentStatus = getPaymentStatus(invoice);

            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono">
                  {invoice.invoice_number}
                </TableCell>
                {role !== "business" && (
                  <TableCell>
                    <div>{invoice.user_email}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.user_name}
                    </div>
                  </TableCell>
                )}
                <TableCell>{invoice.subscription_plan || "N/A"}</TableCell>
                <TableCell>
                  ${invoice.total_amount} {invoice.currency}
                </TableCell>
                <TableCell>
                  {paymentStatus.isFullyPaid ? (
                    <Badge className="bg-green-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Paid
                      </span>
                    </Badge>
                  ) : paymentStatus.paidAmount > 0 ? (
                    <Badge className="bg-yellow-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Partial
                      </span>
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500">
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Unpaid
                      </span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid"
                        ? "default"
                        : invoice.status === "due" || invoice.status === "sent"
                        ? "secondary"
                        : invoice.status === "overdue"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      invoice.status === "paid"
                        ? "bg-green-500 hover:bg-green-600"
                        : invoice.status === "sent"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : invoice.status === "overdue"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : invoice.status === "due"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-500 hover:bg-gray-600 text-white"
                    }
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(invoice.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {role === "super_admin" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenUpdateInvoice(invoice)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!paymentStatus.isFullyPaid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenAddInvoicePayment(invoice)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={role === "business" ? 7 : 8}
                className="text-center text-muted-foreground"
              >
                No subscription invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {invoices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalInvoicesPages}
          onPageChange={goToPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalInvoicesCount}
          startIndex={startIndex}
          endIndex={endIndex}
          showItemsPerPage={true}
        />
      )}
    </div>
  );
}
