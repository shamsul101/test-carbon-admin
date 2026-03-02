import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, DollarSign, Loader2, Plus } from "lucide-react";
import { useBillingStore } from "@/store/billingStore";
import { useAuthStore } from "@/store/auth";
import PaymentDetailsDialog from "@/components/PaymentDetailsDialogue";
import { useInvoiceStore } from "@/store/invoiceStore";
import InvoiceDetailsDialog from "@/components/InvoiceDetailsDialogue";
import { Invoice } from "@/types/billing";
import AddPaymentDialog from "@/components/AddPaymentDialogue";
import AddInvoicePaymentDialog from "@/components/AddInvoicePaymentDialogue";
import UpdateInvoiceDialog from "@/components/UpdateInvoiceDialogue";
import CustomerPayments from "@/components/CustomerPayments";
import InvoicesComponent from "@/components/Invoices";

export default function Billing() {
  const {
    payments,
    subscriptionPayments,
    offsetPayments,
    loading: paymentsLoading,
    error: paymentsError,
    selectedPayment,
    fetchPayments,
    fetchOffsetPayments,
    fetchSubscriptionPayments,
    fetchPaymentDetailsById,
    clearSelectedPayment,
    updatePaymentStatus,
    addPayment,
  } = useBillingStore();

  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    selectedInvoice,
    fetchInvoices,
    fetchInvoiceById,
    clearSelectedInvoice,
    updateInvoicePayment,
    updateInvoiceInfo,
    createInvoice,
  } = useInvoiceStore();

  const { accessToken } = useAuthStore();
  const role = useAuthStore((state) => state.user?.role);

  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isAddInvoicePaymentDialogOpen, setIsAddInvoicePaymentDialogOpen] =
    useState(false);
  const [isUpdateInvoiceDialogOpen, setIsUpdateInvoiceDialogOpen] =
    useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] =
    useState(false);

  // Current states
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // data on component mount
  useEffect(() => {
    if (accessToken && role) {
      fetchPayments(accessToken, role);
      fetchInvoices(accessToken, role);
      fetchOffsetPayments(accessToken, role);
      fetchSubscriptionPayments(accessToken, role);
    }
  }, [
    accessToken,
    role,
    fetchPayments,
    fetchInvoices,
    fetchOffsetPayments,
    fetchSubscriptionPayments,
  ]);

  // console.log("Offset Payments :: ", offsetPayments);

  const pendingPayments = payments.filter(
    (p) => p.payment_status === "pending"
  ).length;

  const totalRevenue = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  // Payment handlers
  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      if (role === "super_admin" && accessToken) {
        await updatePaymentStatus(paymentId, newStatus, accessToken);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleViewPaymentDetails = async (id: number) => {
    if (accessToken && role) {
      await fetchPaymentDetailsById(id, accessToken, role);
      setIsPaymentDialogOpen(true);
    }
  };

  // console.log("selectedPayment :: ", selectedPayment);

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    clearSelectedPayment();
  };

  const handleAddPayment = async (payment: {
    user: string;
    amount: string;
    transaction_id: string;
  }) => {
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      await addPayment(
        payment.user,
        payment.amount,
        payment.transaction_id,
        accessToken,
        role
      );
      setIsAddPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invoice handlers
  const handleViewInvoiceDetails = async (invoiceId: number) => {
    if (accessToken) {
      await fetchInvoiceById(invoiceId, accessToken);
      setIsInvoiceDialogOpen(true);
    }
  };

  const handleCloseInvoiceDialog = () => {
    setIsInvoiceDialogOpen(false);
    clearSelectedInvoice();
  };

const handleAddInvoicePayment = async (payment: {
  amount: string;
  transaction_id: string;
  notes: string;
  payment_file: File | null;
}) => {
  if (!accessToken || role !== "super_admin" || !currentInvoiceId) return;

  setIsSubmitting(true);
  try {
    console.log("Adding invoice payment:", payment);

    await updateInvoicePayment(
      currentInvoiceId,
      payment.amount,
      payment.transaction_id,
      payment.notes,
      payment.payment_file,
      accessToken
    );

    setIsAddInvoicePaymentDialogOpen(false);
    setCurrentInvoiceId(null);
  } catch (error) {
    console.error("Error adding invoice payment:", error);
  } finally {
    setIsSubmitting(false);
  }
};



  const handleOpenAddInvoicePayment = (invoice: Invoice) => {
    setCurrentInvoiceId(invoice.id);
    setIsAddInvoicePaymentDialogOpen(true);
  };

  const handleUpdateInvoice = async (invoiceData: {
    total_amount: string;
    due_date: string;
    description: string;
    message: string;
    status: string;
  }) => {
    if (!accessToken || role !== "super_admin" || !currentInvoiceId) return;

    setIsSubmitting(true);
    try {
      await updateInvoiceInfo(currentInvoiceId, invoiceData, accessToken);
      setIsUpdateInvoiceDialogOpen(false);
      setCurrentInvoiceId(null);
      setCurrentInvoice(null);
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpdateInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setCurrentInvoiceId(invoice.id);
    setIsUpdateInvoiceDialogOpen(true);
  };

  if (
    (paymentsLoading || invoicesLoading) &&
    (payments.length === 0 || invoices.length === 0)
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (paymentsError || invoicesError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {paymentsError || invoicesError}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {role === "business" ? "My Billing" : "Billing & Invoices"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {role === "business"
              ? "My payment history and invoices"
              : "Manage customer billing information and review invoices"}
          </p>
        </div>
        <div className="flex gap-2">
          {role === "super_admin" && (
            <>
              <Button
                onClick={() => setIsAddPaymentDialogOpen(true)}
                className="bg-carbon-gradient hover:bg-carbon-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
              {/* <Button
                onClick={() => setIsCreateInvoiceDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button> */}
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {role === "super_admin" ? (
              <CardTitle className="text-sm font-medium">
                Total Payments
              </CardTitle>
            ) : (
              <CardTitle className="text-sm font-medium">My Payments</CardTitle>
            )}
            <Receipt className="h-4 w-4 text-carbon-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-carbon-700">
              {payments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === "super_admin" ? "Paid Revenue" : "Total Paid"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {role === "super_admin"
                ? "Total completed payments"
                : "My payments"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {invoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "due").length} due,{" "}
              {invoices.filter((i) => i.status === "overdue").length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Payments Component */}
      <CustomerPayments
        payments={payments}
        subscriptionPayments={subscriptionPayments}
        offsetPayments={offsetPayments}
        role={role}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewPaymentDetails}
      />

      {/* Invoices Component */}
      <InvoicesComponent
        invoices={invoices}
        role={role}
        onViewDetails={handleViewInvoiceDetails}
        onOpenUpdateInvoice={handleOpenUpdateInvoice}
        onOpenAddInvoicePayment={handleOpenAddInvoicePayment}
      />

      {/* Dialog Components */}
      <PaymentDetailsDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        selectedPayment={selectedPayment}
        loading={paymentsLoading}
        role={role}
      />

      <InvoiceDetailsDialog
        isOpen={isInvoiceDialogOpen}
        onClose={handleCloseInvoiceDialog}
        selectedInvoice={selectedInvoice}
        loading={invoicesLoading}
        role={role}
      />

      <AddPaymentDialog
        isOpen={isAddPaymentDialogOpen}
        onClose={() => setIsAddPaymentDialogOpen(false)}
        onAddPayment={handleAddPayment}
        isSubmitting={isSubmitting}
      />

      <AddInvoicePaymentDialog
        isOpen={isAddInvoicePaymentDialogOpen}
        onClose={() => {
          setIsAddInvoicePaymentDialogOpen(false);
          setCurrentInvoiceId(null);
        }}
        onAddPayment={handleAddInvoicePayment}
        isSubmitting={isSubmitting}
        invoiceNumber={
          invoices.find((inv) => inv.id === currentInvoiceId)?.invoice_number
        }
      />

      <UpdateInvoiceDialog
        isOpen={isUpdateInvoiceDialogOpen}
        onClose={() => {
          setIsUpdateInvoiceDialogOpen(false);
          setCurrentInvoiceId(null);
          setCurrentInvoice(null);
        }}
        onUpdateInvoice={handleUpdateInvoice}
        isSubmitting={isSubmitting}
        invoice={currentInvoice}
      />
    </div>
  );
}
