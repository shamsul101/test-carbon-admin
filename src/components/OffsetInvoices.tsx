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
import { OffsetInvoice } from "@/types/billing";

interface OffsetInvoicesComponentProps {
  invoices: OffsetInvoice[];
  role: string;
  onViewDetails: (invoiceId: number) => void;
  onOpenUpdateInvoice: (invoice: OffsetInvoice) => void;
  onOpenAddInvoicePayment: (invoice: OffsetInvoice) => void;
}

export default function OffsetInvoicesComponent({
  invoices,
  role,
  onViewDetails,
  onOpenUpdateInvoice,
  onOpenAddInvoicePayment,
}: OffsetInvoicesComponentProps) {
  // Pagination
  const {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    handleItemsPerPageChange,
  } = usePagination<OffsetInvoice>(5);

  const {
    paginatedItems: paginatedInvoices,
    totalItems: totalInvoicesCount,
    totalPages: totalInvoicesPages,
    startIndex,
    endIndex,
  } = paginate(invoices);

  // Helper function to get status badge configuration
  const getStatusBadgeConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return {
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "sent":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500 hover:bg-blue-600",
          icon: <FileText className="w-4 h-4 mr-1" />,
        };
      case "due":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600",
          icon: null,
        };
      case "overdue":
        return {
          variant: "destructive" as const,
          className: "bg-red-500 hover:bg-red-600",
          icon: <XCircle className="w-4 h-4 mr-1" />,
        };
      case "draft":
        return {
          variant: "outline" as const,
          className: "bg-gray-500 hover:bg-gray-600",
          icon: null,
        };
      case "partial":
        return {
          variant: "outline" as const,
          className: "bg-purple-500 hover:bg-purple-600",
          icon: null,
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          className: "bg-gray-700 hover:bg-gray-800",
          icon: null,
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-500 hover:bg-gray-600",
          icon: null,
        };
    }
  };

  // Format status text for display
  const formatStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            {role !== "business" && <TableHead>Customer</TableHead>}
            <TableHead>Project</TableHead>
            <TableHead>Carbon Tons</TableHead>
            <TableHead>Confirmation #</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInvoices.map((invoice) => {
            const statusConfig = getStatusBadgeConfig(invoice.status);
            const statusText = formatStatusText(invoice.status);

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
                <TableCell>{invoice.project_name}</TableCell>
                <TableCell>{invoice.carbon_tons} tCO₂</TableCell>
                <TableCell>{invoice.purchase_confirmation}</TableCell>
                <TableCell>
                  ${invoice.total_amount} {invoice.currency}
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusConfig.variant}
                    className={statusConfig.className}
                  >
                    {statusConfig.icon}
                    {statusText}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={role === "business" ? 9 : 10}
                className="text-center text-muted-foreground"
              >
                No offset invoices found.
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
