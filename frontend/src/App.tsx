import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { TransactionPage } from '@/pages/TransactionPage';
import { AIAnalyticsPage } from '@/pages/AIAnalyticsPage';
import { BudgetSettingsPage } from '@/pages/BudgetSettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SupportPage } from '@/pages/SupportPage';
import { useAuthStore } from '@/store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionPage/>} />
                <Route path="/budgets" element={<BudgetSettingsPage/>} />
                <Route path="/analytics" element={<AIAnalyticsPage/>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/support" element={<SupportPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;