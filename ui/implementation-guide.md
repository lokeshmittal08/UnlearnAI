# Bank UI Implementation Guide

## Phase 1: Project Setup & Foundation

### Step 1: Initialize Vite Project

```bash
# Create new Vite project with TypeScript template
npm create vite@latest bank-ui -- --template react-ts
cd bank-ui

# Install dependencies
npm install

# Install additional dependencies
npm install react-router-dom @chakra-ui/react @emotion/react @emotion/styled framer-motion zustand @tanstack/react-table recharts date-fns react-hook-form @hookform/resolvers zod

# Install dev dependencies
npm install -D @types/node eslint-plugin-react-hooks prettier
```

### Step 2: Configure Vite and TypeScript

- Set up `vite.config.ts` with path aliases
- Configure `tsconfig.json` with strict settings and path mapping
- Set up ESLint and Prettier configurations

### Step 3: Set Up Chakra UI

- Create theme configuration in `src/styles/theme.ts`
- Wrap App with ChakraProvider
- Configure color scheme for banking application

### Step 4: Set Up Zustand

- Create store structure for customer management
- Set up devtools for debugging
- Create initial state structure

## Phase 2: Project Structure & Types

### Step 5: Create Folder Structure

```
src/
├── components/
│   ├── common/
│   ├── customer/
│   └── dashboard/
├── hooks/
├── services/
├── stores/
├── types/
├── utils/
├── data/
├── pages/
└── styles/
```

### Step 6: Define TypeScript Interfaces

Create comprehensive type definitions in `src/types/`:

```typescript
// src/types/customer.ts
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

export type CustomerStatus = "active" | "inactive" | "suspended";
export type RiskLevel = "low" | "medium" | "high";
export type AccountType = "checking" | "savings" | "investment" | "credit";
export type TransactionType = "credit" | "debit";

export interface CustomerFilters {
  status: CustomerStatus | "all";
  accountType: AccountType | "all";
  riskLevel: RiskLevel | "all";
  dateRange?: {
    start: string;
    end: string;
  };
}
```

## Phase 3: Mock Data & Services

### Step 7: Create Mock Data Generator

```typescript
// src/data/mockDataGenerator.ts
import { Customer, Account, Transaction } from "@/types/customer";

const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emily",
  "Robert",
  "Lisa",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
];
const cities = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
];
const states = ["NY", "CA", "IL", "TX", "AZ", "PA"];

export const generateMockCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `customer-${index + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `customer${index + 1}@example.com`,
    phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${
      Math.floor(Math.random() * 9000) + 1000
    }`,
    dateOfBirth: generateRandomDate(1950, 2000),
    address: {
      street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: "USA",
    },
    accounts: generateMockAccounts(1 + Math.floor(Math.random() * 3)),
    registrationDate: generateRandomDate(2020, 2023),
    status: ["active", "inactive", "suspended"][
      Math.floor(Math.random() * 3)
    ] as CustomerStatus,
    riskLevel: ["low", "medium", "high"][
      Math.floor(Math.random() * 3)
    ] as RiskLevel,
  }));
};

const generateMockAccounts = (count: number): Account[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `account-${index + 1}`,
    customerId: "",
    accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    accountType: ["checking", "savings", "investment", "credit"][
      Math.floor(Math.random() * 4)
    ] as AccountType,
    balance: Math.floor(Math.random() * 100000) + 1000,
    currency: "USD",
    createdAt: generateRandomDate(2020, 2023),
  }));
};

const generateRandomDate = (startYear: number, endYear: number): string => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("T")[0];
};
```

### Step 8: Create Data Service Layer

```typescript
// src/services/customerService.ts
import { Customer, CustomerFilters } from "@/types/customer";
import { generateMockCustomers } from "@/data/mockDataGenerator";

class CustomerService {
  private customers: Customer[] = generateMockCustomers(50);

  async getCustomers(
    filters?: CustomerFilters,
    search?: string
  ): Promise<Customer[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredCustomers = [...this.customers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters) {
      if (filters.status !== "all") {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.status === filters.status
        );
      }
      if (filters.accountType !== "all") {
        filteredCustomers = filteredCustomers.filter((c) =>
          c.accounts.some((acc) => acc.accountType === filters.accountType)
        );
      }
      if (filters.riskLevel !== "all") {
        filteredCustomers = filteredCustomers.filter(
          (c) => c.riskLevel === filters.riskLevel
        );
      }
    }

    return filteredCustomers;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.customers.find((customer) => customer.id === id) || null;
  }

  async getCustomerTransactions(customerId: string): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Generate mock transactions for the customer
    return generateMockTransactions(20);
  }
}

export const customerService = new CustomerService();

// Helper function to generate mock transactions
function generateMockTransactions(count: number): Transaction[] {
  const categories = [
    "Transfer",
    "Payment",
    "Deposit",
    "Withdrawal",
    "Purchase",
    "Fee",
  ];
  const descriptions = [
    "Online Purchase",
    "ATM Withdrawal",
    "Direct Deposit",
    "Bill Payment",
    "Transfer to Savings",
    "Restaurant",
    "Gas Station",
    "Grocery Store",
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `transaction-${index + 1}`,
    accountId: `account-${Math.floor(Math.random() * 3) + 1}`,
    amount: Math.floor(Math.random() * 1000) + 10,
    type: Math.random() > 0.5 ? "credit" : "debit",
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    date: generateRandomDate(2023, 2024),
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
}
```

## Phase 4: Core Components

### Step 9: Create Layout Components

```typescript
// src/components/common/Layout/MainLayout.tsx
import { FC, ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1">
        <Header />
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
};
```

### Step 10: Create Customer Components

```typescript
// src/components/customer/CustomerCard/CustomerCard.tsx
import { FC } from "react";
import {
  Card,
  CardBody,
  HStack,
  Text,
  Avatar,
  Badge,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Customer } from "@/types/customer";
import { formatCurrency } from "@/utils/formatters";

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export const CustomerCard: FC<CustomerCardProps> = ({ customer, onClick }) => {
  const totalBalance = customer.accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );
  const statusColor =
    customer.status === "active"
      ? "green"
      : customer.status === "inactive"
      ? "yellow"
      : "red";
  const riskColor =
    customer.riskLevel === "low"
      ? "green"
      : customer.riskLevel === "medium"
      ? "yellow"
      : "red";

  return (
    <Card
      cursor="pointer"
      onClick={onClick}
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody>
        <HStack spacing={4}>
          <Avatar
            name={`${customer.firstName} ${customer.lastName}`}
            size="lg"
          />
          <VStack align="start" flex="1" spacing={2}>
            <Text fontWeight="bold" fontSize="lg">
              {customer.firstName} {customer.lastName}
            </Text>
            <Text color="gray.600" fontSize="sm">
              {customer.email}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={statusColor}>{customer.status}</Badge>
              <Badge colorScheme={riskColor}>{customer.riskLevel} risk</Badge>
            </HStack>
          </VStack>
          <VStack align="end" spacing={1}>
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              {formatCurrency(totalBalance)}
            </Text>
            <Text color="gray.500" fontSize="sm">
              {customer.accounts.length} accounts
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};
```

### Step 11: Create Customer List Component

```typescript
// src/components/customer/CustomerList/CustomerList.tsx
import { FC, useState, useMemo } from "react";
import {
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Box,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { CustomerCard } from "../CustomerCard/CustomerCard";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerFilters } from "@/types/customer";

export const CustomerList: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CustomerFilters>({
    status: "all",
    accountType: "all",
    riskLevel: "all",
  });

  const { customers, isLoading, error } = useCustomers();

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(query) ||
          customer.lastName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    if (filters.accountType !== "all") {
      filtered = filtered.filter((c) =>
        c.accounts.some((acc) => acc.accountType === filters.accountType)
      );
    }
    if (filters.riskLevel !== "all") {
      filtered = filtered.filter((c) => c.riskLevel === filters.riskLevel);
    }

    return filtered;
  }, [customers, searchQuery, filters]);

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.600">Error loading customers: {error}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Search and Filters */}
      <HStack spacing={4} pb={4} borderBottom="1px" borderColor="gray.200">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxW="300px"
          leftElement={<SearchIcon color="gray.400" />}
        />
        <Select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value as any })
          }
          maxW="150px"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select
          value={filters.accountType}
          onChange={(e) =>
            setFilters({ ...filters, accountType: e.target.value as any })
          }
          maxW="150px"
        >
          <option value="all">All Accounts</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="investment">Investment</option>
          <option value="credit">Credit</option>
        </Select>
        <Select
          value={filters.riskLevel}
          onChange={(e) =>
            setFilters({ ...filters, riskLevel: e.target.value as any })
          }
          maxW="150px"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setFilters({
              status: "all",
              accountType: "all",
              riskLevel: "all",
            });
          }}
        >
          Clear Filters
        </Button>
      </HStack>

      {/* Customer List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Spinner size="xl" color="brand.500" />
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredCustomers.length === 0 ? (
            <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
              <Text color="gray.500">
                No customers found matching your criteria.
              </Text>
            </Box>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => {
                  // Navigate to customer detail
                  console.log("Navigate to customer:", customer.id);
                }}
              />
            ))
          )}
        </VStack>
      )}
    </VStack>
  );
};
```

## Phase 5: Dashboard & Analytics

### Step 12: Create Dashboard Metrics

```typescript
// src/components/dashboard/MetricsCard/MetricsCard.tsx
import { FC } from "react";
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  HStack,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: typeof FiUsers;
  color?: string;
}

export const MetricsCard: FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = "blue",
}) => {
  return (
    <Card>
      <CardBody>
        <HStack justify="space-between">
          <Stat>
            <StatLabel color="gray.600">{title}</StatLabel>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            {change !== undefined && (
              <StatHelpText>
                <StatArrow type={changeType} />
                {change}%
              </StatHelpText>
            )}
          </Stat>
          <Icon as={icon} boxSize={8} color={`${color}.500`} />
        </HStack>
      </CardBody>
    </Card>
  );
};
```

## Phase 6: Routing & Navigation

### Step 13: Set Up React Router

```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MainLayout } from "@/components/common/Layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { CustomerDetail } from "@/pages/CustomerDetail/CustomerDetail";
import theme from "@/styles/theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customer/:id" element={<CustomerDetail />} />
          </Routes>
        </MainLayout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
```

## Phase 7: Testing & Optimization

### Step 14: Add Unit Tests

- Test components with React Testing Library
- Test custom hooks
- Test utility functions

### Step 15: Performance Optimization

- Implement React.memo for expensive components
- Use useMemo and useCallback appropriately
- Consider virtual scrolling for large lists
- Implement code splitting with React.lazy

## Phase 8: Final Polish

### Step 16: Add Loading States & Error Handling

- Create loading components
- Implement error boundaries
- Add toast notifications for user feedback

### Step 17: Responsive Design

- Implement responsive breakpoints
- Test on mobile devices
- Optimize touch interactions

### Step 18: Documentation

- Create comprehensive README
- Document component props
- Add setup instructions
