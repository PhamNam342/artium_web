import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import ArtworksPage from '../pages/ArtworksPage';
import ArtworkDetailPage from '../pages/ArtworkDetailPage';
import InventoryPage from '../pages/InventoryPage';
import UploadArtworkPage from '../pages/UploadArtworkPage';
import CompleteProfileModal from '../features/auth/components/CompleteProfileModal';

import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import CheckoutPage from '../pages/CheckoutPage';

function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from || '/';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

function ArtistRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== 'ARTIST') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/artworks" element={<ArtworksPage />} />
          <Route path="/artworks/:id" element={<ArtworkDetailPage />} />
          <Route element={<ArtistRoute />}>
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
        </Route>

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        <Route element={<ArtistRoute />}>
          <Route path="/inventory/upload" element={<UploadArtworkPage />} />
          <Route path="/inventory/upload/:id" element={<UploadArtworkPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/checkout/:artworkId" element={<CheckoutPage />} />
            {/* Protected routes go here */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CompleteProfileModal />
    </>
  );
}
