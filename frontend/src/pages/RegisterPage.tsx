import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n, LanguageSwitcher } from '../i18n/I18nContext';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ApiError } from '../features/auth/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, verifyOtp, loginWithGoogle } = useAuth();
  const { t, getApiError } = useI18n();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [savedPassword, setSavedPassword] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse ) => {
    if (!credentialResponse.credential) {
      toast.error(t('apiErrors.invalidGoogleToken'));
      return;
    }

    try {
      setIsLoading(true);
      await loginWithGoogle(credentialResponse.credential);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(getApiError(axiosErr.response?.data?.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMissingClientId = () => {
    toast.error('Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong file .env của frontend');
  };

  const handleStep1 = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error(t('common.requiredFields'));
      return;
    }
    if (password.length < 6 || password.length > 32) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      setSavedPassword(password);
      setStep(2);
      setResendCooldown(60);
      toast.success(t('auth.registerInitiated'));
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(getApiError(axiosErr.response?.data?.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error(t('auth.otpIncomplete'));
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otpString);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(getApiError(axiosErr.response?.data?.message));
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await register(email, savedPassword);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      toast.success(t('auth.resendSuccess'));
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      toast.error(getApiError(axiosErr.response?.data?.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6">
          <span className="text-2xl font-bold tracking-tight text-black">
            ARTIUM
          </span>
        </Link>

        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('auth.createAccount')}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              {t('auth.registerSubtitle')}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('auth.verifyEmail')}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">
              {t('auth.otpSentTo')}{' '}
              <span className="font-medium text-gray-700">{email}</span>
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-1 rounded-full bg-blue-600" />
        <div
          className={`flex-1 h-1 rounded-full transition-colors ${
            step === 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        />
      </div>

      {step === 1 && (
        <>
          {/* Google Login Component */}
          <div className="w-full flex justify-center mb-4">
            {googleClientId ? (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error(t('apiErrors.invalidGoogleToken'))}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="circle"
                  text="signup_with"
                  width="100%"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleMissingClientId}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>{t('auth.continueWithGoogle')}</span>
              </button>
            )}
          </div>

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

          <form onSubmit={handleStep1} className="space-y-5">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.emailLabel')}
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.confirmPasswordLabel')}
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? t('common.loading') : t('auth.nextButton')}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-8">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold border rounded-xl focus:outline-none focus:border-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? t('common.loading') : t('auth.confirmButton')}
          </button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-sm text-blue-600 font-semibold cursor-pointer disabled:text-gray-400"
            >
              {resendCooldown > 0
                ? t('auth.resendCooldown', { seconds: resendCooldown })
                : t('auth.resendOtp')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
