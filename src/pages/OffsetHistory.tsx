import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  AlertCircle,
  Coins,
  Leaf,
  DollarSign,
  Loader2,
  FileText,
  Eye,
} from "lucide-react";
import { useOffsetStore } from "@/store/offsetStore";
import { useAuthStore } from "@/store/auth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OffsetHistoryItem {
  confirmation_number: string;
  certificate_number: string;
  project_name: string;
  carbon_emission_metric_tons: number;
  price_per_metric_ton_usd: number;
  total_cost_usd: number;
  carbon_expiration_date: string;
  date_of_issue: string;
  certification_name: string;
  user_email: string;
}

export default function OffsetHistory() {
  const { accessToken } = useAuthStore();
  const {
    offsetHistory,
    historyLoading,
    historyError,
    fetchOffsetHistoryWithFilters,
  } = useOffsetStore();

  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [offsetType, setOffsetType] = useState<"individual" | "calculation">(
    "calculation"
  );

  // pagination
  const {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    handleItemsPerPageChange,
  } = usePagination<OffsetHistoryItem>(5);

  const { paginatedItems, totalItems, totalPages, startIndex, endIndex } =
    paginate(offsetHistory);

  // filtered history on mount / tab / search
  useEffect(() => {
    if (accessToken) {
      fetchOffsetHistoryWithFilters(accessToken, {
        user_email: searchEmail || undefined,
        offset_type: offsetType,
        payment_type: "one_time",
      });
    }
  }, [accessToken, fetchOffsetHistoryWithFilters, offsetType, searchEmail]);

  const handleSearch = () => {
    if (!email.trim()) return;
    setSearchEmail(email.trim());
  };

  const handleClearSearch = () => {
    setEmail("");
    setSearchEmail("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handlePreviewCertificate = (certificateNumber: string) => {
    window.open(
      `${import.meta.env.VITE_CERT_URL}/certificate/${certificateNumber}`,
      "_blank"
    );
  };

  // Statistics
  const totalOffsets = offsetHistory.length;
  const totalTonnes = offsetHistory.reduce(
    (sum, offset) => sum + offset.carbon_emission_metric_tons,
    0
  );
  const totalInvestment = offsetHistory.reduce(
    (sum, offset) => sum + offset.total_cost_usd,
    0
  );
  const uniqueProjects = new Set(
    offsetHistory.map((offset) => offset.project_name)
  ).size;

  if (historyLoading && offsetHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading offset history...
        </span>
      </div>
    );
  }

  if (historyError && offsetHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading offset history: {historyError}</p>
          <Button
            onClick={() =>
              fetchOffsetHistoryWithFilters(accessToken, {
                user_email: searchEmail || undefined,
                offset_type: offsetType,
                payment_type: "one_time",
              })
            }
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Carbon Offset History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your carbon offset certificates
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Offsets</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {totalOffsets}
            </div>
            <p className="text-xs text-muted-foreground">
              Carbon offset certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Offset In MT
            </CardTitle>
            <Coins className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {totalTonnes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              CO₂ metric tons offset
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investment
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {formatCurrency(totalInvestment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {uniqueProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique projects supported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Card - Kept in original position */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Search Offset History</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {searchEmail
                  ? `Showing results for: ${searchEmail}`
                  : "Search for carbon offset history by email address"}
              </CardDescription>
            </div>

            {/* Right side */}
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
              <div className="flex-1 sm:w-64">
                <Input
                  id="email-search"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={historyLoading || !email.trim()}
                  className="flex items-center gap-2"
                >
                  {historyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {historyLoading ? "Searching..." : "Search"}
                </Button>
                {searchEmail && (
                  <Button onClick={handleClearSearch} variant="outline">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Carbon Offset History
              </h2>
              <p className="text-muted-foreground mt-1">
                {searchEmail
                  ? `Showing offset history for: ${searchEmail}`
                  : "View all offset history"}
              </p>
            </div>

            <Tabs
              value={offsetType}
              onValueChange={(value) =>
                setOffsetType(value as "individual" | "calculation")
              }
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger
                  value="calculation"
                  className="flex items-center gap-2"
                >
                  Offset History
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="flex items-center gap-2"
                >
                  Individual Contribution
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate #</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Carbon Offset (MT)</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Loading offset history...
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((offset) => (
                <TableRow key={offset.confirmation_number}>
                  <TableCell className="font-mono font-semibold">
                    {offset.certificate_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{offset.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {offset.certification_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-secondary">
                    {offset.carbon_emission_metric_tons.toFixed(2)} tons
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(offset.total_cost_usd)}
                  </TableCell>
                  <TableCell>
                    {formatDate(offset.date_of_issue)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handlePreviewCertificate(offset.certificate_number)
                      }
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!historyLoading && offsetHistory.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  {searchEmail
                    ? "No offset history found for this email."
                    : "No offset history found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination for Offset History */}
        {offsetHistory.length > 0 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              showItemsPerPage={true}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {historyError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-300 rounded-lg p-6 flex items-start gap-4 text-red-700"
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-lg">Error</h4>
            <p className="mt-1 text-sm">{historyError}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}