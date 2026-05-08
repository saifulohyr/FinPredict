import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { TransactionPage } from '@/pages/TransactionPage';
import { AIAnalyticsPage } from '@/pages/AIAnalyticsPage';
import { BudgetSettingsPage } from '@/pages/BudgetSettingsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // PERBAIKAN: Cek apakah nilainya adalah 'true'
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionPage/>} />
                <Route path="/budgets" element={<BudgetSettingsPage/>} />
                <Route path="/analytics" element={<AIAnalyticsPage/>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;