import type { Customer, Transaction } from '@/types';

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'James', 'Mary', 'William', 'Patricia', 'Richard', 'Jennifer', 'Joseph',
  'Linda', 'Thomas', 'Barbara', 'Charles', 'Susan', 'Christopher', 'Jessica',
  'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Helen'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

export const generateMockCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      customer_id: 10000 + index,
      customer_name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 60) + 18, // 18-78 years old
      income: Math.floor(Math.random() * 150000) + 20000, // $20k-$170k
      tenure_months: Math.floor(Math.random() * 120) + 1, // 1-120 months
      travel_ratio: Math.random(),
      online_ratio: Math.random(),
      num_cards: Math.floor(Math.random() * 5) + 1, // 1-5 cards
      late_12m: Math.floor(Math.random() * 12), // 0-11 late payments
      mobile_logins: Math.floor(Math.random() * 50) + 1, // 1-50 logins
      segment_label: Math.floor(Math.random() * 5), // 0-4 segments
      nbo_label: Math.floor(Math.random() * 3), // 0-2 NBO labels
      score_label: Math.random() // 0.0-1.0 score
    };
  });
};

// Generate a sample set of customers for development
export const mockCustomers = generateMockCustomers(50);

export const generateMockTransactions = (count: number): Transaction[] => {
  const transactionTypes: ('credit' | 'debit')[] = ['credit', 'debit'];
  const descriptions = [
    'Online Purchase', 'ATM Withdrawal', 'Bill Payment', 'Transfer', 'Deposit',
    'Grocery Store', 'Restaurant', 'Gas Station', 'Utilities', 'Salary Deposit'
  ];
  const categories = [
    'shopping', 'withdrawal', 'bills', 'transfer', 'deposit',
    'groceries', 'dining', 'transport', 'utilities', 'income'
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `txn_${100000 + index}`,
    accountId: `acc_${1000 + Math.floor(Math.random() * 10)}`,
    amount: Math.floor(Math.random() * 1000) + 10, // $10-$1000
    type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
};
