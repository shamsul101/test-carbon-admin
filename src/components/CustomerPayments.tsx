/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface SubscriptionDetails {
  plan_name?: string;
  payment_frequency?: string;
  status?: string;
}

interface CarbonOffsetDetails {
  confirmation_number: string;
  certificate_number: string;
  project_name: string;
  carbon_emission_metric_tons: number;
  certification_name: string;
  payment_status: string;
}

interface Payment {
  id: number;
  user: any;
  user_name?: string;
  user_email?: string;
  amount: string;
  payment_date?: string;
  payment_status: string;
  transaction_id?: string;
  payment_method?: string;
  subscription_details?: SubscriptionDetails;
  carbon_offset_details?: CarbonOffsetDetails;
  payment_type?: string;
}

interface CustomerPaymentsProps {
  payments: Payment[];
  subscriptionPayments: Payment[];
  offsetPayments: Payment[];
  role: string;
  onStatusChange: (paymentId: number, newStatus: string) => void;
  onViewDetails: (paymentId: number) => void;
}

export default function CustomerPayments({
  payments,
  subscriptionPayments,
  offsetPayments,
  role,
  onStatusChange,
  onViewDetails,
}: CustomerPaymentsProps) {
  const [paymentType, setPaymentType] = useState<string>("subscription");

  // console.log("Payments :: ", payments)
  console.log("subscriptionPayments :: ", subscriptionPayments);
  // console.log("offsetPayments :: ", offsetPayments)

  const displayedPayments =
    paymentType === "subscription"
      ? subscriptionPayments.length > 0
        ? subscriptionPayments
        : payments.filter((p) => p.payment_type === "subscription")
      : offsetPayments.length > 0
      ? offsetPayments
      : payments.filter((p) => p.payment_type === "offset");

  // Pagination
  const {
    currentPage: paymentsCurrentPage,
    itemsPerPage: paymentsItemsPerPage,
    paginate: paginatePayments,
    goToPage: goToPaymentsPage,
    handleItemsPerPageChange: handlePaymentsItemsPerPageChange,
  } = usePagination<Payment>(5);

  const {
    paginatedItems: paginatedPayments,
    totalItems: totalPaymentsCount,
    totalPages: totalPaymentsPages,
    startIndex: paymentsStartIndex,
    endIndex: paymentsEndIndex,
  } = paginatePayments(displayedPayments);

  // console.log("paginatedPayments::  ", paginatedPayments);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>
            {role === "business" ? "My Payments" : "Customer Payments"}
          </CardTitle>
          <CardDescription>
            {role === "business"
              ? "My payment history"
              : "View and manage customer payment records"}
          </CardDescription>
        </div>

        {/* Payment Type Toggle */}
        <Tabs
          value={paymentType}
          onValueChange={setPaymentType}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="offset">Offset</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {role === "super_admin" && <TableHead>Customer</TableHead>}

              {/* Conditional columns */}
              {paymentType === "subscription" ? (
                <>
                  <TableHead>Plan</TableHead>
                  <TableHead>Frequency</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Project</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Carbon Tons</TableHead>
                </>
              )}

              <TableHead>Amount</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPayments.map((payment) => (
              <TableRow key={payment.id}>
                {role === "super_admin" && (
                  <TableCell className="font-medium">
                    <div>
                      {paymentType === "subscription"
                        ? payment.user_name || "N/A"
                        : payment.user.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {paymentType === "subscription"
                        ? payment.user_email || "N/A"
                        : payment.user?.email || "N/A"}
                    </div>
                  </TableCell>
                )}

                {/* Conditional cells */}
                {paymentType === "subscription" ? (
                  <>
                    <TableCell>
                      {payment.subscription_details?.plan_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {payment.subscription_details?.payment_frequency || "N/A"}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      {payment.carbon_offset_details?.project_name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {payment.carbon_offset_details?.certificate_number ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      {payment.carbon_offset_details
                        ?.carbon_emission_metric_tons || "N/A"}
                    </TableCell>
                  </>
                )}

                <TableCell>${payment.amount || "0.00"}</TableCell>
                <TableCell>
                  {payment.payment_date
                    ? new Date(payment.payment_date).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {role === "super_admin" ? (
                    paymentType === "subscription" ? (
                      <Select
                        value={payment.payment_status}
                        onValueChange={(value) =>
                          onStatusChange(payment.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      // For carbon offsets → read-only badge
                      <Badge
                        variant={
                          payment.payment_status === "completed"
                            ? "default"
                            : payment.payment_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          payment.payment_status === "completed"
                            ? "bg-green-500"
                            : payment.payment_status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {payment.payment_status
                          ? payment.payment_status.charAt(0).toUpperCase() +
                            payment.payment_status.slice(1)
                          : "N/A"}
                      </Badge>
                    )
                  ) : (
                    <Badge
                      variant={
                        payment.payment_status === "completed"
                          ? "default"
                          : payment.payment_status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        payment.payment_status === "completed"
                          ? "bg-green-500"
                          : payment.payment_status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    >
                      {payment.payment_status
                        ? payment.payment_status.charAt(0).toUpperCase() +
                          payment.payment_status.slice(1)
                        : "N/A"}
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(payment.id)}
                  >
                    <FileText className="h-4 w-4" />
                    Payment Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {displayedPayments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={
                    role === "business"
                      ? paymentType === "subscription"
                        ? 6
                        : 7
                      : paymentType === "subscription"
                      ? 7
                      : 8
                  }
                  className="text-center text-muted-foreground"
                >
                  No {paymentType} payment records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Payments Pagination */}
        {displayedPayments.length > 0 && (
          <Pagination
            currentPage={paymentsCurrentPage}
            totalPages={totalPaymentsPages}
            onPageChange={goToPaymentsPage}
            onItemsPerPageChange={handlePaymentsItemsPerPageChange}
            itemsPerPage={paymentsItemsPerPage}
            totalItems={totalPaymentsCount}
            startIndex={paymentsStartIndex}
            endIndex={paymentsEndIndex}
            showItemsPerPage={true}
          />
        )}
      </CardContent>
    </Card>
  );
}
