import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import { NotificationProvider } from './features/notifications/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <NotificationProvider>
            <AppRoutes />

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontSize: '14px',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#2563EB',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </NotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
