export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  accounts: Account[];
  registrationDate: string;
  status: CustomerStatus;
  riskLevel: RiskLevel;
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
