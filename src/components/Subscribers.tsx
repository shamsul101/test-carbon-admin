/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SubscriptionDetailsDialog } from "@/components/SubscriptionDetailsDialogue";
import { useSubscriberStore } from "@/store/subscriberStore";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";

interface Subscription {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  plan: number;
  plan_details: {
    name: string;
    description: string;
    monthly_price: string;
    yearly_price: string;
  };
  status: string;
  payment_frequency: "monthly" | "yearly";
  start_date: string;
  end_date: string;
  created_at: string;
}

interface SubscribersProps {
  subscriptions: Subscription[];
  loading: boolean;
  accessToken: string | null;
  subscriptionDetails: any;
  onUpdateFrequency: (
    accessToken: string,
    userId: number,
    planId: number,
    frequency: "monthly" | "yearly"
  ) => Promise<void>;
  onCancelSubscription: (
    accessToken: string,
    userId: number,
    planId: number
  ) => Promise<void>;
  onFetchSubscriptionDetails: (
    accessToken: string,
    userId: number
  ) => Promise<void>;
}

export function Subscribers({
  loading,
  accessToken,
  onUpdateFrequency,
  onCancelSubscription,
  onFetchSubscriptionDetails,
}: SubscribersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const {
    subscriptions,
    loading: subscribersLoading,
    error: subscribersError,
    subscriptionDetails,
  } = useSubscriberStore();

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const matchesSearch =
        sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan_details.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const key = sortConfig.key as keyof Subscription;
      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  // Set up pagination
  const {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    handleItemsPerPageChange,
  } = usePagination<Subscription>(10);

  // Get paginated subscriptions
  const {
    paginatedItems: paginatedSubscriptions,
    totalItems: totalSubscriptionsCount,
    totalPages: totalSubscriptionsPages,
    startIndex: subscriptionsStartIndex,
    endIndex: subscriptionsEndIndex,
  } = paginate(filteredSubscriptions);

  const activeSubscribersCount = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleFrequencyChange = async (
    userId: number,
    planId: number,
    newFrequency: "monthly" | "yearly"
  ) => {
    if (!accessToken) return;

    try {
      await onUpdateFrequency(accessToken, userId, planId, newFrequency);
      toast.success("Payment frequency updated");
    } catch (error) {
      toast.error("Failed to update payment frequency");
    }
  };

  const handleCancelSubscription = async (userId: number, planId: number) => {
    if (!accessToken) return;

    try {
      await onCancelSubscription(accessToken, userId, planId);
      toast.success("Subscription cancelled");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const handleViewDetails = async (userId: number) => {
    if (!accessToken) return;

    setSelectedUserId(userId);
    try {
      await onFetchSubscriptionDetails(accessToken, userId);
      setDetailsDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load subscription details");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>
          Manage and view all subscription activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort("user_name")}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig?.key === "user_name" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubscriptions.length > 0 ? (
                paginatedSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="font-medium">
                        {subscription.user_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.user_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {subscription.plan_details.name}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {subscription.plan_details.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      $
                      {subscription.payment_frequency === "monthly"
                        ? subscription.plan_details.monthly_price
                        : subscription.plan_details.yearly_price}
                      /{subscription.payment_frequency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscription.status === "active"
                            ? "default"
                            : subscription.status === "trialing"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          subscription.status === "active"
                            ? "bg-green-500"
                            : subscription.status === "trialing"
                            ? "bg-blue-500"
                            : subscription.status === "past_due"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {subscription.status === "active"
                        ? new Date(subscription.end_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={subscription.payment_frequency}
                        onValueChange={(value: "monthly" | "yearly") =>
                          handleFrequencyChange(
                            subscription.user,
                            subscription.plan,
                            value
                          )
                        }
                        disabled={subscription.status !== "active"}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(subscription.user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {subscription.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCancelSubscription(
                                subscription.user,
                                subscription.plan
                              )
                            }
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {loading ? (
                      <div className="flex justify-center">
                        <Loader2 className="animate-spin h-6 w-6" />
                      </div>
                    ) : (
                      "No subscribers found"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredSubscriptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalSubscriptionsPages}
            onPageChange={goToPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalSubscriptionsCount}
            startIndex={subscriptionsStartIndex}
            endIndex={subscriptionsEndIndex}
            showItemsPerPage={true}
          />
        )}
      </CardContent>

      <SubscriptionDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        subscription={subscriptionDetails}
        loading={loading}
      />
    </Card>
  );
}
