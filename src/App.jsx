// App.jsx — root router with protected routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Farmer pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MandiPrices from './pages/farmer/MandiPrices';
import PriceTrend from './pages/farmer/PriceTrend';
import CreateLot from './pages/farmer/CreateLot';
import MyLots from './pages/farmer/MyLots';
import FarmerOffers from './pages/farmer/FarmerOffers';
import FarmerProfile from './pages/farmer/FarmerProfile';
import StoragePage from './pages/farmer/StoragePage';
import NetRealisation from './pages/farmer/NetRealisation';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Marketplace from './pages/buyer/Marketplace';
import LotDetail from './pages/buyer/LotDetail';
import BuyerOffers from './pages/buyer/BuyerOffers';
import Orders from './pages/buyer/Orders';
import BuyerProfile from './pages/buyer/BuyerProfile';

// Shared pages
import BuyerDetail from './pages/shared/BuyerDetail';
import Notifications from './pages/shared/Notifications';
import Help from './pages/shared/Help';
import NotFound from './pages/shared/NotFound';

// ─────────────────────────────────────────
// Route guards
// ─────────────────────────────────────────

/** Redirect to login if not authenticated */
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Redirect to correct dashboard if wrong role tries to access */
function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  const userRole = (user.role || '').toLowerCase();
  if (userRole !== role.toLowerCase()) {
    return <Navigate to={userRole === 'farmer' ? '/farmer' : '/buyer'} replace />;
  }
  return children;
}

/** Redirect authenticated users away from auth pages */
function RedirectIfAuth({ children }) {
  const { user } = useAuth();
  if (user) {
    const userRole = (user.role || '').toLowerCase();
    return <Navigate to={userRole === 'farmer' ? '/farmer' : '/buyer'} replace />;
  }
  return children;
}

// ─────────────────────────────────────────
// Route tree
// ─────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth();
  if (user) {
    const userRole = (user.role || '').toLowerCase();
    return <Navigate to={userRole === 'farmer' ? '/farmer' : '/buyer'} replace />;
  }
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login"    element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
      <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

      {/* ── Farmer routes ── */}
      <Route path="/farmer"              element={<RequireRole role="farmer"><FarmerDashboard /></RequireRole>} />
      <Route path="/farmer/mandi"        element={<RequireRole role="farmer"><MandiPrices /></RequireRole>} />
      <Route path="/farmer/trend/:crop"  element={<RequireRole role="farmer"><PriceTrend /></RequireRole>} />
      <Route path="/farmer/create-lot"   element={<RequireRole role="farmer"><CreateLot /></RequireRole>} />
      <Route path="/farmer/my-lots"      element={<RequireRole role="farmer"><MyLots /></RequireRole>} />
      <Route path="/farmer/offers"       element={<RequireRole role="farmer"><FarmerOffers /></RequireRole>} />
      <Route path="/farmer/profile"      element={<RequireRole role="farmer"><FarmerProfile /></RequireRole>} />
      <Route path="/farmer/storage"      element={<RequireRole role="farmer"><StoragePage /></RequireRole>} />
      <Route path="/farmer/net-realisation/:lotId" element={<RequireRole role="farmer"><NetRealisation /></RequireRole>} />

      {/* ── Buyer routes ── */}
      <Route path="/buyer"               element={<RequireRole role="buyer"><BuyerDashboard /></RequireRole>} />
      <Route path="/buyer/marketplace"   element={<RequireRole role="buyer"><Marketplace /></RequireRole>} />
      <Route path="/buyer/lot/:id"       element={<RequireRole role="buyer"><LotDetail /></RequireRole>} />
      <Route path="/buyer/offers"        element={<RequireRole role="buyer"><BuyerOffers /></RequireRole>} />
      <Route path="/buyer/orders"        element={<RequireRole role="buyer"><Orders /></RequireRole>} />
      <Route path="/buyer/profile"       element={<RequireRole role="buyer"><BuyerProfile /></RequireRole>} />

      {/* ── Shared routes (both roles) ── */}
      <Route path="/buyer-profile/:id" element={<RequireAuth><BuyerDetail /></RequireAuth>} />
      <Route path="/notifications"     element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/help"              element={<RequireAuth><Help /></RequireAuth>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
