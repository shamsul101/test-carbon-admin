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
import { Label } from "@/components/ui/label";
import {
  Search,
  Mail,
  AlertCircle,
  Coins,
  Leaf,
  DollarSign,
  Loader2,
  FileText,
} from "lucide-react";
import { useOffsetStore } from "@/store/offsetStore";
import { useAuthStore } from "@/store/auth";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";

interface OffsetHistoryItem {
  confirmation_number: string;
  certificate_number: string;
  project_name: string;
  carbon_emission_metric_tons: number;
  price_per_metric_ton_usd: number;
  total_cost_usd: number;
  carbon_expiration_date: string;
  gold_standard_confirmation: string;
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
    fetchOffsetHistory,
    fetchOffsetHistoryByEmail,
  } = useOffsetStore();

  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

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

  // all history on mount
  useEffect(() => {
    if (accessToken) {
      fetchOffsetHistory(accessToken);
    }
  }, [accessToken, fetchOffsetHistory]);

  const handleSearch = () => {
    if (!email.trim()) return;
    setSearchEmail(email.trim());
    fetchOffsetHistoryByEmail(email.trim(), accessToken);
  };

  const handleClearSearch = () => {
    setEmail("");
    setSearchEmail("");
    if (accessToken) {
      fetchOffsetHistory(accessToken);
    }
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading offset history...</span>
      </div>
    );
  }

  if (historyError && offsetHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading offset history: {historyError}</p>
          <Button
            onClick={() => fetchOffsetHistory(accessToken)}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in mx-auto px-6">
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
            <Leaf className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Total Offset In Tonnes</CardTitle>
            <Coins className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {totalTonnes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">CO₂ tonnes offset</p>
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

      {/* Search Section */}
      <Card>
        <CardHeader className="">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Search Offset History</CardTitle>
              <CardDescription>
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
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={historyLoading || !email.trim()}
                  className="bg-carbon-gradient hover:bg-carbon-600"
                >
                  {historyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
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

      {/* Results */}
      {paginatedItems.length > 0 ? (
        <div className="space-y-4">
          {paginatedItems.map((offset, index) => (
            <motion.div
              key={offset.confirmation_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-all border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-5 gap-6 text-sm">
                    {/* Project */}
                    <div>
                      <p className="text-xs text-muted-foreground">Project</p>
                      <p className="font-semibold text-foreground">
                        {offset.project_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Conf #: {offset.confirmation_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cert #: {offset.certificate_number}
                      </p>
                    </div>

                    {/* Tonnes */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Tonnes CO₂
                      </p>
                      <p className="font-semibold text-blue-600">
                        {offset.carbon_emission_metric_tons.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${offset.price_per_metric_ton_usd.toFixed(2)}/ton
                      </p>
                    </div>

                    {/* Cost */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Cost
                      </p>
                      <p className="font-semibold text-amber-600">
                        {formatCurrency(offset.total_cost_usd)}
                      </p>
                    </div>

                    {/* Certification */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Certified To
                      </p>
                      <p className="font-semibold text-purple-600">
                        {offset.certification_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {offset.gold_standard_confirmation}
                      </p>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-xs text-muted-foreground">Issued</p>
                      <p className="font-semibold">
                        {formatDate(offset.date_of_issue)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Expires
                      </p>
                      <p className="font-semibold">
                        {formatDate(offset.carbon_expiration_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Pagination */}
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
      ) : (
        !historyLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No offset certificates found
            </h3>
            <p>
              {searchEmail
                ? `No carbon offset certificates found for ${searchEmail}`
                : "No carbon offset certificates found. Start by searching for an email address."}
            </p>
          </motion.div>
        )
      )}
    </div>
  );
}