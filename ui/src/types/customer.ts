export interface Customer {
  customer_id: number;
  customer_name: string;
  age: number;
  income: number;
  tenure_months: number;
  travel_ratio: number;
  online_ratio: number;
  num_cards: number;
  late_12m: number;
  mobile_logins: number;
  segment_label: number;
  nbo_label: number;
  score_label: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Account {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  category: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'suspended';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';
export type TransactionType = 'credit' | 'debit';

export interface CustomerFilters {
  status: CustomerStatus | 'all';
  accountType: AccountType | 'all';
  riskLevel: RiskLevel | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalBalance: number;
  newRegistrations: number;
  averageBalance: number;
}
