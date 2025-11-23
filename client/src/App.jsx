
// ========== client/src/App.jsx ==========
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppStateProvider } from './contexts/AppStateContext';
import AnimatedBackground from './components/Layout/AnimatedBackground';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LinkAtmPage from './pages/LinkAtmPage';
import SetMpinPage from './pages/setMpinPage';
import CreateUpiIdPage from './pages/CreateUpiIdPage';
import HistoryPage from './pages/HistoryPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import FaqPage from './pages/FaqPage';
import MobileRechargePage from './pages/MobileRechargePage';
import BillPaymentsPage from './pages/BillPaymentsPage';
import MakePaymentPage from './pages/MakePaymentPage';
import RemindersPage from './pages/ReminderPage';

// Protected Route Component
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppStateProvider>
            {/* Animated Background - Visible on all pages */}
            <AnimatedBackground />
            
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/link-atm"
              element={
                <ProtectedRoute>
                  <LinkAtmPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/set-mpin"
              element={
                <ProtectedRoute>
                  <SetMpinPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-upi"
              element={
                <ProtectedRoute>
                  <CreateUpiIdPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-history"
              element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mobile-recharge"
              element={
                <ProtectedRoute>
                  <MobileRechargePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay-bills"
              element={
                <ProtectedRoute>
                  <BillPaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/make-payment"
              element={
                <ProtectedRoute>
                  <MakePaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <FaqPage />
                </ProtectedRoute>
              }
            />
          <Route path="/reminders" element={<RemindersPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppStateProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
