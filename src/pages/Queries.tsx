import { useState, useEffect } from "react";
import { useQueriesStore } from "@/store/queriesStore";
import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  User,
  Loader2,
  HelpCircle,
  Calendar,
  Eye,
  Tag,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "api", label: "API" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

export default function Queries() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { queries, loading, error, fetchQueries, updateQueryStatus } =
    useQueriesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchQueries(accessToken);
    }
  }, [accessToken, fetchQueries]);

  const filteredQueries = queries
    .filter((query) => {
      const matchesStatus =
        statusFilter === "all" || query.status === statusFilter;
      const matchesType =
        typeFilter === "all" || query.issue_type === typeFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        query.user_name.toLowerCase().includes(searchLower) ||
        query.user_email.toLowerCase().includes(searchLower) ||
        query.subject.toLowerCase().includes(searchLower) ||
        query.message.toLowerCase().includes(searchLower) ||
        query.issue_type_display.toLowerCase().includes(searchLower);

      return matchesStatus && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return {
          variant: "default" as const,
          text: "In Progress",
          className: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          variant: "outline" as const,
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800",
        };
    }
  };

  const getTypeBadge = (issueType: string, displayName: string) => {
    const colorMap: Record<string, string> = {
      api: "bg-green-100 text-green-800",
      technical: "bg-purple-100 text-purple-800",
      billing: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };

    return {
      className: colorMap[issueType] || colorMap.other,
      text: displayName,
    };
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  const handleStatusUpdate = async (
    queryId: number,
    currentStatus: "pending" | "in_progress"
  ) => {
    const newStatus = currentStatus === "pending" ? "in_progress" : "pending";
    try {
      setUpdatingId(queryId);
      await updateQueryStatus(accessToken, queryId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAttachmentView = (attachment: string) => {
    if (!attachment) return;

    if (attachment.startsWith("http")) {
      window.open(attachment, "_blank");
      return;
    }

    if (attachment.startsWith("/media/")) {
      window.open(`${import.meta.env.VITE_API_URL}${attachment}`, "_blank");
      return;
    }

    window.open(attachment, "_blank");
  };

  const getTypeStatistics = () => {
    const typeCounts: Record<string, number> = {
      api: 0,
      technical: 0,
      billing: 0,
      other: 0,
    };

    queries.forEach((query) => {
      typeCounts[query.issue_type] = (typeCounts[query.issue_type] || 0) + 1;
    });

    return typeCounts;
  };

  const typeStats = getTypeStatistics();

  if (loading && queries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading queries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading queries: {error}</p>
          <Button onClick={() => fetchQueries(accessToken)} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Queries</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all user inquiries and support requests
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <HelpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {queries.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {queries.filter((q) => q.status === "pending").length} pending,{" "}
              {queries.filter((q) => q.status === "in_progress").length} in
              progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {Array.from(new Set(queries.map((q) => q.user_email))).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredQueries.length} shown
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issue Types</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                API: {typeStats.api} | Tech: {typeStats.technical}
              </div>
              <div className="text-xs text-muted-foreground">
                Billing: {typeStats.billing} | Other: {typeStats.other}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Query</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-semibold text-orange-700">
              {queries.length > 0 ? formatDate(queries[0].created_at) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {queries.length > 0
                ? `from ${queries[0].user_name}`
                : "No queries"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queries Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Query History</CardTitle>
          <CardDescription>
            All user inquiries and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              className="w-[150px]"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === "latest" ? "Latest" : "Oldest"}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]">User</TableHead>
                  <TableHead className="w-[180px]">Email</TableHead>
                  <TableHead className="w-[150px]">Subject</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[200px]">Message</TableHead>
                  <TableHead className="w-[100px]">Attachment</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.map((query) => {
                  const statusBadge = getStatusBadge(query.status);
                  const typeBadge = getTypeBadge(
                    query.issue_type,
                    query.issue_type_display
                  );
                  return (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{query.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{query.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        <span title={query.subject}>{query.subject}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={typeBadge.className}
                        >
                          {typeBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        <span title={query.message}>{query.message}</span>
                      </TableCell>
                      <TableCell>
                        {query.attachment ? (
                          <div className="flex justify-center items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleAttachmentView(query.attachment)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadge.variant}
                          className={statusBadge.className}
                        >
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`status-${query.id}`}
                            checked={query.status === "in_progress"}
                            onCheckedChange={() =>
                              handleStatusUpdate(query.id, query.status)
                            }
                            disabled={updatingId === query.id}
                          />
                          <Label
                            htmlFor={`status-${query.id}`}
                            className="text-xs"
                          >
                            {updatingId === query.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : query.status === "in_progress" ? (
                              "Active"
                            ) : (
                              "Pending"
                            )}
                          </Label>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredQueries.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No queries found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
