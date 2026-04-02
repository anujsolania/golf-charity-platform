import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import CharitiesPage from './pages/public/CharitiesPage';
import CharityProfilePage from './pages/public/CharityProfilePage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import PricingPage from './pages/public/PricingPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ScoresPage from './pages/dashboard/ScoresPage';
import DrawsPage from './pages/dashboard/DrawsPage';
import CharityPage from './pages/dashboard/CharityPage';
import WinnersPage from './pages/dashboard/WinnersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import SubscribePage from './pages/dashboard/SubscribePage';

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDrawsPage from './pages/admin/AdminDrawsPage';
import AdminCharitiesPage from './pages/admin/AdminCharitiesPage';
import AdminWinnersPage from './pages/admin/AdminWinnersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Route guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)' }} /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  return user && isAdmin ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
      <Route path="/charities" element={<><Navbar /><CharitiesPage /><Footer /></>} />
      <Route path="/charities/:slug" element={<><Navbar /><CharityProfilePage /><Footer /></>} />
      <Route path="/how-it-works" element={<><Navbar /><HowItWorksPage /><Footer /></>} />
      <Route path="/pricing" element={<><Navbar /><PricingPage /><Footer /></>} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="scores" element={<ScoresPage />} />
        <Route path="draws" element={<DrawsPage />} />
        <Route path="charity" element={<CharityPage />} />
        <Route path="winners" element={<WinnersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscribe" element={<SubscribePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="draws" element={<AdminDrawsPage />} />
        <Route path="charities" element={<AdminCharitiesPage />} />
        <Route path="winners" element={<AdminWinnersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0c1528', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }, success: { iconTheme: { primary: '#00d4a0', secondary: '#050a1a' } } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
