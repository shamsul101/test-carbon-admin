import { useState, useCallback } from "react";

export interface FilterParams {
  search: string;
  role: string;
  is_active: string;
  payment_type: string;
  payment_status: string;
}

export const useUserFilters = () => {
  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    role: "",
    is_active: "",
    payment_type: "",
    payment_status: "",
  });

  const updateFilters = useCallback((newFilters: FilterParams) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      role: "",
      is_active: "",
      payment_type: "",
      payment_status: "",
    });
  }, []);

  const buildQueryParams = useCallback((filters: FilterParams) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.append(key, value);
      }
    });

    return params.toString();
  }, []);

  return {
    filters,
    updateFilters,
    clearFilters,
    buildQueryParams,
  };
};
