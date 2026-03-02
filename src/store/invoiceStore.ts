/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Invoice, SubscriptionInvoice, OffsetInvoice, InvoicePayment } from "@/types/billing";

interface InvoiceFilters {
  status?: string;
  year?: number;
  month?: number;
  order_by?: string;
  user_id?: number;
}

interface InvoiceStore {
  subscriptionInvoices: SubscriptionInvoice[];
  offsetInvoices: OffsetInvoice[];
  selectedInvoice: SubscriptionInvoice | OffsetInvoice | null;
  loading: boolean;
  error: string | null;
  
  // Subscription Invoice Functions (existing)
  fetchInvoices: (accessToken: string, role: string) => Promise<void>;
  fetchInvoicesFiltered: (accessToken: string, role: string, filters: InvoiceFilters) => Promise<void>;
  fetchInvoiceById: (invoiceId: number, accessToken: string) => Promise<void>;
  fetchUserInvoices: (userId: number, accessToken: string, filters?: InvoiceFilters) => Promise<void>;
  
  // Offset Invoice Functions (new)
  fetchOffsetInvoices: (accessToken: string, role: string) => Promise<void>;
  fetchOffsetInvoicesFiltered: (accessToken: string, role: string, filters: InvoiceFilters) => Promise<void>;
  fetchOffsetInvoiceById: (invoiceId: number, accessToken: string, role: string) => Promise<void>;
  fetchUserOffsetInvoices: (userId: number, accessToken: string, filters?: InvoiceFilters) => Promise<void>;
  createOffsetInvoice: (
    invoiceData: {
      carbon_offset_purchase_id: string;
      user: number;
      total_amount: string;
      currency: string;
      due_date: string;
      description: string;
      notes?: string;
    },
    accessToken: string
  ) => Promise<void>;
  
  // Shared Functions
  clearSelectedInvoice: () => void;
  updateInvoicePayment: (
    invoiceId: number,
    amount: string,
    transactionId: string,
    notes: string,
    paymentFile: File | null,
    accessToken: string
  ) => Promise<void>;
  updateInvoiceInfo: (
    invoiceId: number,
    invoiceData: {
      total_amount: string;
      due_date: string;
      description: string;
      message: string;
      status: string;
    },
    accessToken: string
  ) => Promise<void>;
  createSubscriptionInvoice: (
    invoiceData: {
      user: number;
      subscription: number;
      total_amount: string;
      due_date: string;
      description: string;
      message: string;
      status: string;
    },
    accessToken: string
  ) => Promise<void>;
}

// Helper function to build query string from filters
const buildQueryString = (filters: InvoiceFilters): string => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.year) params.append("year", filters.year.toString());
  if (filters.month) params.append("month", filters.month.toString());
  if (filters.order_by) params.append("order_by", filters.order_by);
  if (filters.user_id) params.append("user_id", filters.user_id.toString());
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  subscriptionInvoices: [],
  offsetInvoices: [],
  selectedInvoice: null,
  loading: false,
  error: null,

  fetchInvoices: async (accessToken, role) => {
    try {
      set({ loading: true, error: null });
      const endpoint =
        role === "business" || role === "individual"
          ? `${import.meta.env.VITE_API_URL}/api/subscription/my-invoices/`
          : `${import.meta.env.VITE_API_URL}/api/subscription/admin/invoices/`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ subscriptionInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch invoices",
        loading: false,
      });
    }
  },

  fetchInvoicesFiltered: async (accessToken, role, filters) => {
    try {
      set({ loading: true, error: null });
      const queryString = buildQueryString(filters);
      const endpoint =
        role === "business" || role === "individual"
          ? `${import.meta.env.VITE_API_URL}/api/subscription/my-invoices/${queryString}`
          : `${import.meta.env.VITE_API_URL}/api/subscription/admin/invoices/${queryString}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch filtered invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ subscriptionInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch filtered invoices",
        loading: false,
      });
    }
  },

  fetchInvoiceById: async (invoiceId, accessToken) => {
    try {
      set({ loading: true, error: null });
      const endpoint = `${
        import.meta.env.VITE_API_URL
      }/api/subscription/invoices/${invoiceId}/`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch invoice details";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ selectedInvoice: data.invoice, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch invoice details",
        loading: false,
      });
    }
  },

  fetchUserInvoices: async (userId, accessToken, filters = {}) => {
    try {
      set({ loading: true, error: null });
      const queryString = buildQueryString(filters);
      const endpoint = `${
        import.meta.env.VITE_API_URL
      }/api/subscription/admin/user/${userId}/invoices/${queryString}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch user invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ subscriptionInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch user invoices",
        loading: false,
      });
    }
  },

  createSubscriptionInvoice: async (invoiceData, accessToken) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/subscription/admin/invoices/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create invoice";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignoring parse errors
        }
        throw new Error(errorMessage);
      }

      await useInvoiceStore
        .getState()
        .fetchInvoices(accessToken, "super_admin");
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to create invoice",
        loading: false,
      });
      throw error;
    }
  },

  updateInvoiceInfo: async (invoiceId, invoiceData, accessToken) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/subscription/admin/invoices/${invoiceId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update invoice";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignoring parse errors
        }
        throw new Error(errorMessage);
      }

      await useInvoiceStore
        .getState()
        .fetchInvoices(accessToken, "super_admin");
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update invoice",
        loading: false,
      });
      throw error;
    }
  },

  updateInvoicePayment: async (
    invoiceId,
    amount,
    transactionId,
    notes,
    paymentFile,
    accessToken
  ) => {
    try {
      set({ loading: true, error: null });

      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("transaction_id", transactionId);
      formData.append("notes", notes || "");
      if (paymentFile) {
        formData.append("payment_file", paymentFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/subscription/admin/invoice-payment/${invoiceId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to add invoice payment";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
          else if (errorData?.detail) errorMessage = errorData.detail;
        } catch {
          // ignore parse errors
        }
        throw new Error(errorMessage);
      }

      await useInvoiceStore.getState().fetchInvoices(accessToken, "super_admin");
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to add invoice payment",
        loading: false,
      });
      throw error;
    }
  },



  fetchOffsetInvoices: async (accessToken, role) => {
    try {
      set({ loading: true, error: null });
      const endpoint =
        role === "business" || role === "individual"
          ? `${import.meta.env.VITE_API_URL}/api/offset/my-invoices/`
          : `${import.meta.env.VITE_API_URL}/api/offset/admin/invoices/`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch offset invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ offsetInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch offset invoices",
        loading: false,
      });
    }
  },

  fetchOffsetInvoicesFiltered: async (accessToken, role, filters) => {
    try {
      set({ loading: true, error: null });
      const queryString = buildQueryString(filters);
      const endpoint =
        role === "business" || role === "individual"
          ? `${import.meta.env.VITE_API_URL}/api/offset/my-invoices/${queryString}`
          : `${import.meta.env.VITE_API_URL}/api/offset/admin/invoices/${queryString}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch filtered offset invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ offsetInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch filtered offset invoices",
        loading: false,
      });
    }
  },

  fetchOffsetInvoiceById: async (invoiceId, accessToken, role) => {
    try {
      set({ loading: true, error: null });
      const endpoint =
        role === "business" || role === "individual"
          ? `${import.meta.env.VITE_API_URL}/api/offset/invoices/${invoiceId}/`
          : `${import.meta.env.VITE_API_URL}/api/offset/admin/invoices/${invoiceId}/`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch offset invoice details";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ selectedInvoice: data.invoice, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch offset invoice details",
        loading: false,
      });
    }
  },

  fetchUserOffsetInvoices: async (userId, accessToken, filters = {}) => {
    try {
      set({ loading: true, error: null });
      const queryString = buildQueryString(filters);
      const endpoint = `${
        import.meta.env.VITE_API_URL
      }/api/offset/admin/user/${userId}/invoices/${queryString}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch user offset invoices";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      set({ offsetInvoices: data.invoices, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch user offset invoices",
        loading: false,
      });
    }
  },

  createOffsetInvoice: async (invoiceData, accessToken) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/offset/admin/invoices/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create offset invoice";
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          // ignoring parse errors
        }
        throw new Error(errorMessage);
      }

      await useInvoiceStore
        .getState()
        .fetchOffsetInvoices(accessToken, "super_admin");
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to create offset invoice",
        loading: false,
      });
      throw error;
    }
  },

  clearSelectedInvoice: () => set({ selectedInvoice: null }),
}));