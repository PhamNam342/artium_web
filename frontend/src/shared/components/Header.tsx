import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useI18n, LanguageSwitcher } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown';

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch {
      toast.error(t('auth.logoutError'));
    }
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="text-xl font-bold tracking-tight text-black">
            ARTIUM
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {user?.role !== 'ADMIN' && (
              <>
                <Link to="/" className="text-xs text-gray-600 hover:text-black transition-colors">
                  {t('nav.home')}
                </Link>
                <Link to="/artworks" className="text-xs text-gray-600 hover:text-black transition-colors">
                  {t('nav.artworks')}
                </Link>
                {user?.role === 'ARTIST' && (
                  <Link to="/inventory" className="text-xs text-gray-600 hover:text-black transition-colors">
                    {t('nav.inventory')}
                  </Link>
                )}
                <Link to="/pricing" className="text-xs text-gray-600 hover:text-black transition-colors">
                  {t('nav.pricing')}
                </Link>
                {user && (
                  <Link to="/orders" className="text-xs text-gray-600 hover:text-black transition-colors">
                    {t('nav.orders')}
                  </Link>
                )}
              </>
            )}
            
            {user?.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {t('admin.dashboard.title') || 'Dashboard'}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user && <NotificationDropdown />}

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user.email[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
                      </div>
                      {user?.role !== 'ADMIN' && (
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t('nav.profile')}
                        </Link>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t('admin.dashboard.title') || 'Dashboard'}
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                {t('nav.login')}
              </Link>
            )}

            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-black cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
