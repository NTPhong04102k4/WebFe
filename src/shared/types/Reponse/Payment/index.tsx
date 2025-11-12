/**
 * SePay Order Detail Response
 */
export interface SePayOrderDetailResponse {
  id: string;
  customer_id: string | null;
  order_id: string;
  order_invoice_number: string;
  order_status: string;
  order_amount: string;
  order_currency: string;
  order_description: string;
  authentication_status: string | null;
  created_at: string; // YYYY-MM-DD HH:mm:ss
  updated_at: string; // YYYY-MM-DD HH:mm:ss
  transactions: SePayTransaction[];
}

/**
 * SePay Transaction
 */
export interface SePayTransaction {
  id: string;
  transaction_id: string;
  order_id: string;
  transaction_type: string;
  transaction_status: string;
  amount: string;
  currency: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}
