import { useCallback, useEffect, useState } from "react";
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
  X,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export interface FilterParams {
  search: string;
  role: string;
  is_active: string;
  payment_type: string;
  payment_status: string;
}

interface UserFiltersProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  availablePlans: string[];
}

export const UserFilters = ({
  filters,
  onFiltersChange,
  availablePlans,
}: UserFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  const updateFilter = useCallback(
    (key: keyof FilterParams, value: string) => {
      onFiltersChange({
        ...filters,
        [key]: value === "all" ? "" : value,
      });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    setLocalSearch("");
    onFiltersChange({
      search: "",
      role: "",
      is_active: "",
      payment_type: "",
      payment_status: "",
    });
  }, [onFiltersChange]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "").length;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users, companies, or emails..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-4 h-11 bg-background border-2 focus:border-carbon-500 transition-colors"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Role Filter */}
        <Select
          value={filters.role || "all"}
          onValueChange={(value) => updateFilter("role", value)}
        >
          <SelectTrigger className="h-10 bg-background border-2 hover:border-carbon-300 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-carbon-600" />
              <SelectValue placeholder="Role" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.is_active || "all"}
          onValueChange={(value) => updateFilter("is_active", value)}
        >
          <SelectTrigger className="h-10 bg-background border-2 hover:border-carbon-300 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Type Filter */}
        <Select
          value={filters.payment_type || "all"}
          onValueChange={(value) => updateFilter("payment_type", value)}
        >
          <SelectTrigger className="h-10 bg-background border-2 hover:border-carbon-300 transition-colors">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <SelectValue placeholder="Payment Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="prepaid">Prepaid</SelectItem>
            <SelectItem value="postpaid">Postpaid</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={filters.payment_status || "all"}
          onValueChange={(value) => updateFilter("payment_status", value)}
        >
          <SelectTrigger className="h-10 bg-background border-2 hover:border-carbon-300 transition-colors">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <SelectValue placeholder="Payment Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          className="h-10 px-4 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Clear {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {filters.role && (
            <Badge variant="secondary" className="gap-1">
              Role: {filters.role}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => updateFilter("role", "all")}
              />
            </Badge>
          )}

          {filters.is_active && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.is_active === "true" ? "Active" : "Inactive"}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => updateFilter("is_active", "all")}
              />
            </Badge>
          )}

          {filters.payment_type && (
            <Badge variant="secondary" className="gap-1">
              Payment: {filters.payment_type}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => updateFilter("payment_type", "all")}
              />
            </Badge>
          )}

          {filters.payment_status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.payment_status}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => updateFilter("payment_status", "all")}
              />
            </Badge>
          )}

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={() => {
                  setLocalSearch("");
                  updateFilter("search", "all");
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
