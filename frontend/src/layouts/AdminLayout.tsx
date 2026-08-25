import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { LayoutDashboard, Users, UserCheck, LogOut, Paintbrush, Image } from 'lucide-react';
import { LanguageSwitcher, useI18n } from '../i18n/I18nContext';

export default function AdminLayout() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: t('admin.dashboard.title') || 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.users.title') || 'User Management', href: '/admin/users', icon: Users },
    { name: t('admin.verifyRequests.title') || 'Verify Requests', href: '/admin/verify-requests', icon: UserCheck },
    { name: t('admin.artworks.title') || 'Artwork Management', href: '/admin/artworks', icon: Image },
  ];


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Paintbrush className="w-6 h-6" />
            Artium
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 relative">
          {user && (
            <>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gray-900 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute bottom-full left-4 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout') || 'Sign out'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex md:hidden">
            {/* Mobile menu button could go here */}
            <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Paintbrush className="w-5 h-5" /> Artium
            </Link>
          </div>
          <div className="hidden md:block" /> {/* Spacer */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
