import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Customers } from '@/pages/Customers/Customers';
import { CustomerDetail } from '@/pages/CustomerDetail/CustomerDetail';
import { Settings } from '@/pages/Settings/Settings';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
