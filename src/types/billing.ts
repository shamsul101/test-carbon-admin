export interface InvoicePayment {
  id: number;
  amount: string;
  payment_date: string;
  transaction_id: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  user: number;
  user_email: string;
  subscription: number;
  subscription_plan: string;
  invoice_number: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: string;
  issue_date: string;
  due_date: string;
  description: string;
  message: string;
  created_at: string;
  updated_at: string;
  payments: InvoicePayment[];
  is_fully_paid: boolean;
  payment_percentage: number;
}
