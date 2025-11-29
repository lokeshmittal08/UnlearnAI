# Bank UI - Modern Banking Dashboard

A modern, responsive banking dashboard built with React, Vite, TypeScript, and Chakra UI. This application provides a comprehensive customer management system with search, filtering, and detailed customer views.

## 🚀 Features

- **Customer Management**: View, search, and filter customers
- **Modern UI**: Clean, professional interface using Chakra UI
- **TypeScript**: Full type safety and better developer experience
- **State Management**: Efficient state management with Zustand
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modular Architecture**: Clean separation of concerns
- **Mock Data**: Realistic mock data for development

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Chakra UI
- **State Management**: Zustand
- **Routing**: React Router
- **Styling**: Chakra UI's built-in styling system
- **Development**: ESLint + Prettier

## 📁 Project Structure

```
bank-ui/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Layout, Header, etc.)
│   │   ├── customer/       # Customer-specific components
│   │   └── dashboard/      # Dashboard components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and data fetching
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── data/               # Mock data generators
│   ├── pages/              # Page components
│   └── styles/             # Theme and global styles
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bank-ui
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Components

- **MainLayout**: Overall app structure with sidebar and header
- **Header**: Navigation and user information
- **Sidebar**: Navigation menu
- **CustomerCard**: Customer information display
- **Dashboard**: Main customer listing page
- **CustomerDetail**: Detailed customer view

### State Management

- **CustomerStore**: Manages customer data, filters, and UI state
- **Services**: Handle data fetching and business logic
- **Hooks**: Custom hooks for component logic

### Data Models

The application uses TypeScript interfaces for type safety:

- **Customer**: Customer information with accounts
- **Account**: Bank account details
- **Transaction**: Transaction records
- **Filters**: Search and filter parameters

## 🎨 Design System

### Color Scheme

- **Primary**: Blue palette for trust and professionalism
- **Success**: Green for positive actions
- **Warning**: Orange for alerts
- **Danger**: Red for critical actions
- **Neutral**: Grays for text and backgrounds

### Components

- Uses Chakra UI components with custom styling
- Responsive design with mobile-first approach
- Consistent spacing and typography
- Hover states and micro-interactions

## 📱 Responsive Design

- **Desktop**: Full dashboard with sidebar navigation
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Stacked layout with bottom navigation

## 🔧 Development

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Modular component architecture

### Best Practices

- Custom hooks for reusable logic
- Separation of concerns
- Consistent naming conventions
- Proper error handling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build will be output to the `dist` directory.

### Deployment Options

- **Vercel**: Easy deployment with automatic builds
- **Netlify**: Static site hosting
- **AWS**: Cloud infrastructure
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- Real-time data updates with WebSockets
- Advanced analytics and reporting
- Customer management CRUD operations
- Transaction management
- Multi-language support
- Dark mode implementation
- Advanced search with filters
- Data export functionality
- Integration with banking APIs

## 📞 Support

For questions or support, please open an issue in the repository.
