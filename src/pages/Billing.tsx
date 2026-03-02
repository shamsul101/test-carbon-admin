// Billing.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, DollarSign, Loader2, Plus, FilePlus, Globe } from "lucide-react";
import { useBillingStore } from "@/store/billingStore";
import { useAuthStore } from "@/store/auth";
import PaymentDetailsDialog from "@/components/PaymentDetailsDialogue";
import { useInvoiceStore } from "@/store/invoiceStore";
import InvoiceDetailsDialog from "@/components/InvoiceDetailsDialogue";
import { SubscriptionInvoice, OffsetInvoice } from "@/types/billing";
import AddPaymentDialog from "@/components/AddPaymentDialogue";
import AddInvoicePaymentDialog from "@/components/AddInvoicePaymentDialogue";
import UpdateInvoiceDialog from "@/components/UpdateInvoiceDialogue";
import CustomerPayments from "@/components/CustomerPayments";
import SubscriptionInvoicesComponent from "@/components/SubscriptionInvoices";
import OffsetInvoicesComponent from "@/components/OffsetInvoices";
import CreateSubscriptionInvoiceDialog from "@/components/CreateSubscriptionInvoiceDialog";
import CreateOffsetInvoiceDialog from "@/components/CreateOffsetInvoiceDialog";
import { useOffsetStore } from "@/store/offsetStore";

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
  } = useBillingStore();

  const {
    subscriptionInvoices,
    offsetInvoices,
    loading: invoicesLoading,
    error: invoicesError,
    selectedInvoice,
    fetchInvoices,
    fetchOffsetInvoices,
    fetchInvoiceById,
    fetchOffsetInvoiceById,
    clearSelectedInvoice,
    updateInvoicePayment,
    updateInvoiceInfo,
    createSubscriptionInvoice,
    createOffsetInvoice,
  } = useInvoiceStore();

  const { offsetHistory, fetchOffsetHistory, fetchProjects, projects } =
    useOffsetStore();

  const { accessToken } = useAuthStore();
  const role = useAuthStore((state) => state.user?.role);

  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isAddInvoicePaymentDialogOpen, setIsAddInvoicePaymentDialogOpen] =
    useState(false);
  const [isUpdateInvoiceDialogOpen, setIsUpdateInvoiceDialogOpen] =
    useState(false);
  const [
    isCreateSubscriptionInvoiceDialogOpen,
    setIsCreateSubscriptionInvoiceDialogOpen,
  ] = useState(false);
  const [isCreateOffsetInvoiceDialogOpen, setIsCreateOffsetInvoiceDialogOpen] =
    useState(false);

  // Current states
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<
    SubscriptionInvoice | OffsetInvoice | null
  >(null);
  const [currentInvoiceType, setCurrentInvoiceType] = useState<
    "subscription" | "offset" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice type tab state
  const [invoiceType, setInvoiceType] = useState<"subscription" | "offset">(
    "offset"
  );

  // Fetch data on component mount
  useEffect(() => {
    if (accessToken && role) {
      fetchPayments(accessToken, role);
      fetchInvoices(accessToken, role);
      fetchOffsetInvoices(accessToken, role);
      fetchOffsetPayments(accessToken, role);
      fetchSubscriptionPayments(accessToken, role);
      fetchOffsetHistory(accessToken)
    }
  }, [accessToken, role, fetchPayments, fetchInvoices, fetchOffsetInvoices, fetchOffsetPayments, fetchSubscriptionPayments, fetchOffsetHistory]);

  // console.log("Payments :: ", payments)
  const pendingPayments = payments.filter(
    (p) => p.is_pending === true
  ).length;

  const totalRevenue = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  // Calculate invoice statistics
  const totalInvoices = subscriptionInvoices.length + offsetInvoices.length;
  const subscriptionInvoicesDue = subscriptionInvoices.filter(
    (i) => i.status === "due"
  ).length;
  const offsetInvoicesDue = offsetInvoices.filter(
    (i) => i.status === "due"
  ).length;
  const subscriptionInvoicesOverdue = subscriptionInvoices.filter(
    (i) => i.status === "overdue"
  ).length;
  const offsetInvoicesOverdue = offsetInvoices.filter(
    (i) => i.status === "overdue"
  ).length;

  const totalOffsetPayment = offsetHistory.reduce(
    (sum, offset) => sum + offset.total_cost_usd,
    0
  );

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

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    clearSelectedPayment();
  };

  // Invoice handlers
  const handleViewInvoiceDetails = async (
    invoiceId: number,
    invoiceType: "subscription" | "offset"
  ) => {
    if (accessToken) {
      if (invoiceType === "subscription") {
        await fetchInvoiceById(invoiceId, accessToken);
      } else {
        await fetchOffsetInvoiceById(invoiceId, accessToken, role);
      }
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
    if (
      !accessToken ||
      role !== "super_admin" ||
      !currentInvoiceId ||
      !currentInvoiceType
    )
      return;

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
      setCurrentInvoiceType(null);
    } catch (error) {
      console.error("Error adding invoice payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddInvoicePayment = (
    invoice: SubscriptionInvoice | OffsetInvoice,
    type: "subscription" | "offset"
  ) => {
    setCurrentInvoiceId(invoice.id);
    setCurrentInvoiceType(type);
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
      setCurrentInvoiceType(null);
    } catch (error) {
      console.error("Error updating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpdateInvoice = (
    invoice: SubscriptionInvoice | OffsetInvoice,
    type: "subscription" | "offset"
  ) => {
    setCurrentInvoice(invoice);
    setCurrentInvoiceId(invoice.id);
    setCurrentInvoiceType(type);
    setIsUpdateInvoiceDialogOpen(true);
  };

  // Create invoice handlers
  const handleCreateSubscriptionInvoice = async (invoiceData: {
    user: number;
    subscription: number;
    total_amount: string;
    due_date: string;
    description: string;
    message: string;
    status: string;
  }) => {
    if (!accessToken || role !== "super_admin") return;

    setIsSubmitting(true);
    try {
      await createSubscriptionInvoice(invoiceData, accessToken);
      setIsCreateSubscriptionInvoiceDialogOpen(false);
    } catch (error) {
      console.error("Error creating subscription invoice:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOffsetInvoice = async (invoiceData: {
    carbon_offset_purchase_id: string;
    user: number;
    total_amount: string;
    currency: string;
    due_date: string;
    description: string;
    notes?: string;
  }) => {
    if (!accessToken || role !== "super_admin") return;

    setIsSubmitting(true);
    try {
      await createOffsetInvoice(invoiceData, accessToken);
      setIsCreateOffsetInvoiceDialogOpen(false);
    } catch (error) {
      console.error("Error creating offset invoice:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    (paymentsLoading || invoicesLoading) &&
    (payments.length === 0 ||
      (subscriptionInvoices.length === 0 && offsetInvoices.length === 0))
  ) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Billings...</span>
      </div>
    );
  }

  if (paymentsError || invoicesError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] text-red-500">
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
        {/* <div className="flex gap-2">
          {role === "super_admin" && (
            <>
              {invoiceType === 'subscription' ? (
                <Button
                  onClick={() => setIsCreateSubscriptionInvoiceDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create Subscription Invoice
                </Button>
              ) : (
                <Button
                  onClick={() => setIsCreateOffsetInvoiceDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create Offset Invoice
                </Button>
              )}
            </>
          )}
        </div> */}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {role === "super_admin" ? (
              <CardTitle className="text-sm font-medium">
                Total Subscription Payments
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
              {role === "super_admin" ? "Paid Revenue from Subscription" : "Total Paid for Subscriptions"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
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
            <CardTitle className="text-sm font-medium">
              Total Carbon Offsets
            </CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {totalOffsetPayment.toFixed(2)}$
            </div>
            <p className="text-xs text-muted-foreground">
              {offsetHistory.length} transactions
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
              {totalInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionInvoicesDue + offsetInvoicesDue} due,{" "}
              {subscriptionInvoicesOverdue + offsetInvoicesOverdue} overdue
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ({subscriptionInvoices.length} subscription,{" "}
              {offsetInvoices.length} offset)
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

      {/* Invoices Section with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Invoices</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {role === "business" || role === "individual"
                  ? "My invoice history"
                  : "View and manage customer invoices"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Tabs
                value={invoiceType}
                onValueChange={(value) =>
                  setInvoiceType(value as "subscription" | "offset")
                }
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger
                    value="offset"
                    className="flex items-center gap-2"
                  >
                    Offset
                  </TabsTrigger>
                  <TabsTrigger
                    value="subscription"
                    className="flex items-center gap-2"
                  >
                    Subscription
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* {role === "super_admin" && (
                <Button
                  onClick={() => {
                    if (invoiceType === 'subscription') {
                      setIsCreateSubscriptionInvoiceDialogOpen(true);
                    } else {
                      setIsCreateOffsetInvoiceDialogOpen(true);
                    }
                  }}
                  className={`${
                    invoiceType === 'subscription' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  size="sm"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create {invoiceType === 'subscription' ? 'Subscription' : 'Offset'} Invoice
                </Button>
              )} */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoiceType === "subscription" ? (
            <SubscriptionInvoicesComponent
              invoices={subscriptionInvoices}
              role={role}
              onViewDetails={(invoiceId) =>
                handleViewInvoiceDetails(invoiceId, "subscription")
              }
              onOpenUpdateInvoice={(invoice) =>
                handleOpenUpdateInvoice(invoice, "subscription")
              }
              onOpenAddInvoicePayment={(invoice) =>
                handleOpenAddInvoicePayment(invoice, "subscription")
              }
            />
          ) : (
            <OffsetInvoicesComponent
              invoices={offsetInvoices}
              role={role}
              onViewDetails={(invoiceId) =>
                handleViewInvoiceDetails(invoiceId, "offset")
              }
              onOpenUpdateInvoice={(invoice) =>
                handleOpenUpdateInvoice(invoice, "offset")
              }
              onOpenAddInvoicePayment={(invoice) =>
                handleOpenAddInvoicePayment(invoice, "offset")
              }
            />
          )}
        </CardContent>
      </Card>

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

      <AddInvoicePaymentDialog
        isOpen={isAddInvoicePaymentDialogOpen}
        onClose={() => {
          setIsAddInvoicePaymentDialogOpen(false);
          setCurrentInvoiceId(null);
          setCurrentInvoiceType(null);
        }}
        onAddPayment={handleAddInvoicePayment}
        isSubmitting={isSubmitting}
        invoiceNumber={
          invoiceType === "subscription"
            ? subscriptionInvoices.find((inv) => inv.id === currentInvoiceId)
              ?.invoice_number
            : offsetInvoices.find((inv) => inv.id === currentInvoiceId)
              ?.invoice_number
        }
      />

      <UpdateInvoiceDialog
        isOpen={isUpdateInvoiceDialogOpen}
        onClose={() => {
          setIsUpdateInvoiceDialogOpen(false);
          setCurrentInvoiceId(null);
          setCurrentInvoice(null);
          setCurrentInvoiceType(null);
        }}
        onUpdateInvoice={handleUpdateInvoice}
        isSubmitting={isSubmitting}
        invoice={currentInvoice}
      />

      {/* Create Invoice Dialogs */}
      <CreateSubscriptionInvoiceDialog
        isOpen={isCreateSubscriptionInvoiceDialogOpen}
        onClose={() => setIsCreateSubscriptionInvoiceDialogOpen(false)}
        onCreateInvoice={handleCreateSubscriptionInvoice}
        isSubmitting={isSubmitting}
      />

      <CreateOffsetInvoiceDialog
        isOpen={isCreateOffsetInvoiceDialogOpen}
        onClose={() => setIsCreateOffsetInvoiceDialogOpen(false)}
        onCreateInvoice={handleCreateOffsetInvoice}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
