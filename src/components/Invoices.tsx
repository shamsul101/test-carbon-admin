import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Invoice } from "@/types/billing";

interface InvoicesComponentProps {
  invoices: Invoice[];
  role: string;
  onViewDetails: (invoiceId: number) => void;
  onOpenUpdateInvoice: (invoice: Invoice) => void;
  onOpenAddInvoicePayment: (invoice: Invoice) => void;
}

export default function InvoicesComponent({
  invoices,
  role,
  onViewDetails,
  onOpenUpdateInvoice,
  onOpenAddInvoicePayment,
}: InvoicesComponentProps) {
  // Pagination for invoices
  const {
    currentPage: invoicesCurrentPage,
    itemsPerPage: invoicesItemsPerPage,
    paginate: paginateInvoices,
    goToPage: goToInvoicesPage,
    handleItemsPerPageChange: handleInvoicesItemsPerPageChange,
  } = usePagination<Invoice>(5);

  // Paginated invoices
  const {
    paginatedItems: paginatedInvoices,
    totalItems: totalInvoicesCount,
    totalPages: totalInvoicesPages,
    startIndex: invoicesStartIndex,
    endIndex: invoicesEndIndex,
  } = paginateInvoices(invoices);

  // console.log("PAginated Invoices :: ", paginatedInvoices)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>
          {role === "business"
            ? "View your invoices"
            : "View and manage invoices for all customers"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  <div>{invoice.user_email}</div>
                  <div className="text-sm text-muted-foreground">
                    User ID: {invoice.user}
                  </div>
                </TableCell>
                <TableCell>{invoice.subscription_plan}</TableCell>
                <TableCell>${invoice.total_amount}</TableCell>
                <TableCell>
                  ${invoice.paid_amount} (
                  {invoice.payment_percentage.toFixed(0)}%)
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.is_fully_paid
                        ? "default"
                        : invoice.status === "partial"
                        ? "secondary"
                        : "destructive"
                    }
                    className={
                      invoice.is_fully_paid
                        ? "bg-green-500"
                        : invoice.status === "partial"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {invoice.is_fully_paid ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Paid
                      </span>
                    ) : invoice.status === "partial" ? (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Partial
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Unpaid
                      </span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(invoice.id)}
                  >
                    <FileText className="h-4 w-4" />
                    Details
                  </Button>
                  {role === "super_admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenUpdateInvoice(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                      Update
                    </Button>
                  )}
                  {!invoice.is_fully_paid && role === "super_admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenAddInvoicePayment(invoice)}
                    >
                      <CreditCard className="h-4 w-4" />
                      Add Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Invoices Pagination */}
        {invoices.length > 0 && (
          <Pagination
            currentPage={invoicesCurrentPage}
            totalPages={totalInvoicesPages}
            onPageChange={goToInvoicesPage}
            onItemsPerPageChange={handleInvoicesItemsPerPageChange}
            itemsPerPage={invoicesItemsPerPage}
            totalItems={totalInvoicesCount}
            startIndex={invoicesStartIndex}
            endIndex={invoicesEndIndex}
            showItemsPerPage={true}
          />
        )}
      </CardContent>
    </Card>
  );
}
