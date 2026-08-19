import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import vi from './locales/vi.json';
import en from './locales/en.json';

export type Language = 'vi' | 'en';

const translations: Record<Language, Record<string, unknown>> = { vi, en };

const BACKEND_ERROR_KEY_MAP: Record<string, string> = {
  'Email already exists': 'apiErrors.emailExists',
  'Invalid credentials': 'apiErrors.invalidCredentials',
  'Invalid or expired OTP': 'apiErrors.invalidOtp',
  'Registration session expired': 'apiErrors.sessionExpired',
  'Invalid Google token': 'apiErrors.invalidGoogleToken',
  'Token has been revoked': 'apiErrors.unauthorized',
  'Authorization token is required': 'apiErrors.unauthorized',
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getApiError: (backendMsg?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    return saved === 'en' || saved === 'vi' ? saved : 'vi';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      let current: unknown = translations[language];

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return keyPath;
        }
      }

      if (typeof current !== 'string') return keyPath;

      let result = current;
      if (params) {
        Object.entries(params).forEach(([pKey, pValue]) => {
          result = result.replace(
            new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'),
            String(pValue),
          );
        });
      }
      return result;
    },
    [language],
  );

  const getApiError = useCallback(
    (backendMsg?: string): string => {
      if (!backendMsg) return t('common.unexpectedError');
      const i18nKey = BACKEND_ERROR_KEY_MAP[backendMsg];
      if (i18nKey) return t(i18nKey);
      return backendMsg;
    },
    [t],
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getApiError }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full text-xs font-semibold text-gray-600">
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          language === 'vi'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'hover:text-black'
        }`}
      >
        🇻🇳 VI
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'hover:text-black'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
