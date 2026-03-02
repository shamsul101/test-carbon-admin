export interface SubscriptionInvoice {
  id: number;
  invoice_number: string;
  user: number;
  user_email: string;
  user_name: string;
  subscription: number;
  subscription_plan?: string;
  total_amount: string;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  description: string;
  notes: string | null;
  invoice_type: "subscription";
  paid_amount?: string;
  payment_percentage?: number;
  is_fully_paid?: boolean;
}

export interface OffsetInvoice {
  id: number;
  invoice_number: string;
  user: number;
  user_email: string;
  user_name: string;
  carbon_offset_purchase_id: string;
  purchase_confirmation: string;
  project_name: string;
  carbon_tons: string;
  total_amount: string;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  description: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  invoice_type: "offset";
}

export type Invoice = SubscriptionInvoice | OffsetInvoice;

export interface InvoicePayment {
  id: number;
  invoice: number;
  amount: string;
  transaction_id: string;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  payment_file?: string;
  created_at: string;
}
