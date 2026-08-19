import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GoogleLogin,
  type CredentialResponse,
} from '@react-oauth/google';
import { useAuth } from '../features/auth/AuthContext';
import {
  useI18n,
  LanguageSwitcher,
} from '../i18n/I18nContext';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ApiError } from '../features/auth/types';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  const { login, loginWithGoogle } = useAuth();
  const { t, getApiError } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // =====================================================
  // Email / Password Login
  // =====================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error(t('common.requiredFields'));
      return;
    }

    try {
      setIsLoading(true);

      await login(email.trim(), password);

      toast.success(t('auth.loginSuccess'));

      // AuthContext đã cập nhật user.
      // App sẽ tự kiểm tra user.role để hiển thị
      // CompleteProfileModal nếu cần.
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;

      toast.error(
        getApiError(
          axiosErr.response?.data?.message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // Google Login
  // =====================================================

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    if (!credentialResponse.credential) {
      toast.error(
        t('apiErrors.invalidGoogleToken'),
      );
      return;
    }

    try {
      setIsLoading(true);

      await loginWithGoogle(
        credentialResponse.credential,
      );

      toast.success(t('auth.loginSuccess'));

      // Nếu user mới chưa có role,
      // CompleteProfileModal sẽ được App hiển thị.
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;

      toast.error(
        getApiError(
          axiosErr.response?.data?.message,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error(
      t('apiErrors.invalidGoogleToken'),
    );
  };

  const handleGoogleMissingClientId = () => {
    toast.error(
      'Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong file .env của frontend',
    );
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Language Switcher */}
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-block mb-6"
        >
          <span className="text-2xl font-bold tracking-tight text-black">
            ARTIUM
          </span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {t('auth.welcomeBack')}
        </h1>

        <p className="mt-2 text-gray-500 text-sm">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {/* Google Login */}
      <div className="w-full flex justify-center mb-4">
        {googleClientId ? (
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="circle"
              text="continue_with"
              width="100%"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleMissingClientId}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-3
              px-4
              py-3
              border
              border-gray-200
              rounded-xl
              bg-white
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-50
              hover:border-gray-300
              transition-all
              duration-200
              cursor-pointer
            "
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>

            <span>
              {t('auth.continueWithGoogle')}
            </span>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>

        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-gray-400 uppercase tracking-wider">
            {t('common.or')}
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {t('auth.emailLabel')}
          </label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder={t(
              'auth.emailPlaceholder',
            )}
            disabled={isLoading}
            className="
              w-full
              px-4
              py-3
              border
              border-gray-200
              rounded-xl
              text-sm
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
              focus:border-blue-500
              transition-all
              disabled:bg-gray-50
              disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700"
            >
              {t('auth.passwordLabel')}
            </label>

            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              disabled={isLoading}
              className="
                w-full
                px-4
                py-3
                border
                border-gray-200
                rounded-xl
                text-sm
                placeholder:text-gray-400
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/20
                focus:border-blue-500
                transition-all
                pr-12
                disabled:bg-gray-50
                disabled:cursor-not-allowed
              "
            />

            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                p-1
                text-gray-400
                hover:text-gray-600
                transition-colors
                disabled:cursor-not-allowed
                disabled:opacity-50
          "
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
          >
          {showPassword ? (
          <EyeOff size={20} />
            ) : (
          <Eye size={20} />
            )}
          </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full
            py-3
            px-4
            bg-blue-600
            text-white
            text-sm
            font-semibold
            rounded-xl
            hover:bg-blue-700
            focus:ring-2
            focus:ring-blue-500/20
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition-all
            cursor-pointer
          "
        >
          {isLoading
            ? t('common.loading')
            : t('auth.loginButton')}
        </button>
      </form>

      {/* Register */}
      <p className="mt-8 text-center text-sm text-gray-500">
        {t('auth.noAccount')}{' '}

        <Link
          to="/register"
          className="text-blue-600 font-semibold hover:text-blue-700"
        >
          {t('auth.registerFree')}
        </Link>
      </p>
    </div>
  );
}
