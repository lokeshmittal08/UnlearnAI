import type {
  Customer,
  Account,
  Transaction,
  CustomerStatus,
  RiskLevel,
  AccountType,
  TransactionType,
} from '@/types';

const firstNames = [
  'John',
  'Jane',
  'Michael',
  'Sarah',
  'David',
  'Emily',
  'Robert',
  'Lisa',
  'James',
  'Mary',
  'William',
  'Patricia',
  'Richard',
  'Jennifer',
  'Joseph',
  'Linda',
  'Thomas',
  'Barbara',
  'Charles',
  'Susan',
  'Christopher',
  'Jessica',
  'Daniel',
  'Karen',
  'Matthew',
  'Nancy',
  'Anthony',
  'Betty',
  'Mark',
  'Helen',
  'Donald',
  'Sandra',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
];

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
];

const states = [
  'NY',
  'CA',
  'IL',
  'TX',
  'AZ',
  'PA',
  'FL',
  'OH',
  'NC',
  'GA',
  'MI',
  'NJ',
];

const transactionCategories = [
  'Transfer',
  'Payment',
  'Deposit',
  'Withdrawal',
  'Purchase',
  'Fee',
  'Interest',
  'Refund',
];

const transactionDescriptions = [
  'Online Purchase',
  'ATM Withdrawal',
  'Direct Deposit',
  'Bill Payment',
  'Transfer to Savings',
  'Restaurant',
  'Gas Station',
  'Grocery Store',
  'Online Shopping',
  'Subscription',
  'Rent Payment',
  'Utility Bill',
  'Insurance Payment',
  'Investment Return',
  'Cash Back',
];

export const generateMockCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];

    return {
      id: `customer-${index + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      dateOfBirth: generateRandomDate(1950, 2000),
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Maple Ln'][Math.floor(Math.random() * 5)]}`,
        city,
        state,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'USA',
      },
      accounts: generateMockAccounts(
        1 + Math.floor(Math.random() * 3),
        `customer-${index + 1}`
      ),
      registrationDate: generateRandomDate(2020, 2023),
      status: ['active', 'inactive', 'suspended'][
        Math.floor(Math.random() * 3)
      ] as CustomerStatus,
      riskLevel: ['low', 'medium', 'high'][
        Math.floor(Math.random() * 3)
      ] as RiskLevel,
    };
  });
};

const generateMockAccounts = (count: number, customerId: string): Account[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `account-${customerId}-${index + 1}`,
    customerId,
    accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    accountType: ['checking', 'savings', 'investment', 'credit'][
      Math.floor(Math.random() * 4)
    ] as AccountType,
    balance: Math.floor(Math.random() * 100000) + 1000,
    currency: 'USD',
    createdAt: generateRandomDate(2020, 2023),
  }));
};

export const generateMockTransactions = (
  count: number,
  accountId?: string
): Transaction[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `transaction-${index + 1}`,
    accountId: accountId || `account-${Math.floor(Math.random() * 3) + 1}`,
    amount: Math.floor(Math.random() * 1000) + 10,
    type: Math.random() > 0.5 ? 'credit' : ('debit' as TransactionType),
    description:
      transactionDescriptions[
        Math.floor(Math.random() * transactionDescriptions.length)
      ],
    date: generateRandomDate(2023, 2024),
    category:
      transactionCategories[
        Math.floor(Math.random() * transactionCategories.length)
      ],
  }));
};

const generateRandomDate = (startYear: number, endYear: number): string => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split('T')[0];
};

// Generate a sample set of customers for development
export const mockCustomers = generateMockCustomers(50);

// Generate sample transactions
export const mockTransactions = generateMockTransactions(100);
