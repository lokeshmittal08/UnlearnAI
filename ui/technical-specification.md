# Bank UI Technical Specification

## Dependencies & Package.json

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@chakra-ui/react": "^2.8.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0",
    "@tanstack/react-table": "^8.9.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.45.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "prettier": "^3.0.0"
  }
}
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/services/*": ["src/services/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## Vite Configuration

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

## ESLint Configuration

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
```

## Prettier Configuration

### .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Chakra UI Theme Configuration

### src/styles/theme.ts

```typescript
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f3ff",
      100: "#b3d9ff",
      200: "#80bfff",
      300: "#4da5ff",
      400: "#1a8cff",
      500: "#0073e6",
      600: "#005cb3",
      700: "#004680",
      800: "#00304d",
      900: "#001933",
    },
    success: {
      50: "#f0fdf4",
      500: "#22c55e",
      600: "#16a34a",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      600: "#d97706",
    },
    danger: {
      50: "#fef2f2",
      500: "#ef4444",
      600: "#dc2626",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, Consolas, monospace",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
    },
    Table: {
      variants: {
        striped: {
          th: {
            bg: "gray.50",
            borderColor: "gray.200",
          },
          td: {
            borderColor: "gray.200",
          },
          tr: {
            "&:nth-of-type(odd)": {
              bg: "gray.50",
            },
          },
        },
      },
    },
  },
});

export default theme;
```

## Zustand Store Structure

### src/stores/customerStore.ts

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Customer, CustomerFilters } from "@/types/customer";

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  filters: CustomerFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setFilters: (filters: Partial<CustomerFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set, get) => ({
      customers: [],
      selectedCustomer: null,
      filters: {
        status: "all",
        accountType: "all",
        riskLevel: "all",
      },
      searchQuery: "",
      isLoading: false,
      error: null,

      setCustomers: (customers) => set({ customers }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearFilters: () =>
        set({
          filters: {
            status: "all",
            accountType: "all",
            riskLevel: "all",
          },
          searchQuery: "",
        }),
    }),
    { name: "customer-store" }
  )
);
```

## Component Patterns

### 1. Component Structure Template

```typescript
// src/components/example/ExampleComponent.tsx
import { FC, useCallback, useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";

interface ExampleComponentProps {
  title: string;
  data: any[];
  onAction?: (item: any) => void;
}

export const ExampleComponent: FC<ExampleComponentProps> = ({
  title,
  data,
  onAction,
}) => {
  const handleAction = useCallback(
    (item: any) => {
      onAction?.(item);
    },
    [onAction]
  );

  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      processed: true,
    }));
  }, [data]);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold">
        {title}
      </Text>
      {/* Component content */}
    </Box>
  );
};
```

### 2. Custom Hook Pattern

```typescript
// src/hooks/useCustomers.ts
import { useEffect } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import { customerService } from "@/services/customerService";

export const useCustomers = () => {
  const {
    customers,
    filters,
    searchQuery,
    isLoading,
    error,
    setCustomers,
    setLoading,
    setError,
  } = useCustomerStore();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await customerService.getCustomers({
          filters,
          search: searchQuery,
        });
        setCustomers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch customers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filters, searchQuery, setCustomers, setLoading, setError]);

  return { customers, isLoading, error };
};
```

## Mock Data Structure

### src/data/mockData.ts

```typescript
import { Customer, Account, Transaction } from "@/types/customer";

export const mockCustomers: Customer[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    accounts: [
      {
        id: "acc-1",
        accountNumber: "1234567890",
        accountType: "checking",
        balance: 15420.5,
        currency: "USD",
        createdAt: "2020-01-15T10:30:00Z",
      },
    ],
    registrationDate: "2020-01-15T10:30:00Z",
    status: "active",
    riskLevel: "low",
  },
  // ... more customers
];
```

## Performance Optimizations

### 1. Component Memoization

```typescript
import { memo, useMemo } from 'react'

export const CustomerCard = memo(({ customer }: { customer: Customer }) => {
  const formattedBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(customer.accounts[0]?.balance || 0)
  }, [customer.accounts])

  return (
    // Card content
  )
})
```

### 2. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList as List } from "react-window";

const VirtualizedCustomerList = ({ customers }: { customers: Customer[] }) => {
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => (
    <div style={style}>
      <CustomerCard customer={customers[index]} />
    </div>
  );

  return (
    <List height={600} itemCount={customers.length} itemSize={120} width="100%">
      {Row}
    </List>
  );
};
```

## Testing Strategy

### 1. Unit Testing with Vitest

```typescript
// src/components/__tests__/CustomerCard.test.tsx
import { render, screen } from "@testing-library/react";
import { CustomerCard } from "../CustomerCard";
import { mockCustomer } from "@/data/mockData";

describe("CustomerCard", () => {
  it("renders customer information correctly", () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(
      screen.getByText(`${mockCustomer.firstName} ${mockCustomer.lastName}`)
    ).toBeInTheDocument();
    expect(screen.getByText(mockCustomer.email)).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

```typescript
// src/pages/__tests__/Dashboard.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { Dashboard } from "../Dashboard";
import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer(
  rest.get("/api/customers", (req, res, ctx) => {
    return res(ctx.json(mockCustomers));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Dashboard", () => {
  it("displays customer list", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});
```
