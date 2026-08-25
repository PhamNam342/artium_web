import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import * as authService from './authService';
import type { User, JwtPayload } from './types';
import { getUserProfile } from '../../services/userService';

type UserRole = 'ARTIST' | 'COLLECTOR';

function decodeJwt(token: string): JwtPayload {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (char) =>
            '%' +
            ('00' + char.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(''),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    throw new Error('Invalid JWT token');
  }
}

function extractUser(token: string): User {
  const payload = decodeJwt(token);

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<User>;

  register: (
    email: string,
    password: string,
  ) => Promise<void>;

  verifyOtp: (
    email: string,
    otp: string,
    name?: string,
  ) => Promise<void>;

  loginWithGoogle: (
    idToken: string,
  ) => Promise<User>;

  completeProfile: (
    role: UserRole,
    full_name: string,
    location: string,
    bio?: string,
  ) => Promise<void>;

  updateUser: (updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>) => void;
  logout: () => Promise<void>;
}

function getInitialAuth(): { token: string | null; user: User | null } {
  const storedToken = localStorage.getItem('access_token');
  if (!storedToken) return { token: null, user: null };

  try {
    const payload = decodeJwt(storedToken);
    if (payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('access_token');
      return { token: null, user: null };
    }
    return { token: storedToken, user: extractUser(storedToken) };
  } catch {
    localStorage.removeItem('access_token');
    return { token: null, user: null };
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [initialAuthState] = useState(getInitialAuth);
  const [user, setUser] = useState<User | null>(initialAuthState.user);
  const [token, setToken] = useState<string | null>(initialAuthState.token);
  const [isLoading] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!token || !userId) return;

    let isCurrent = true;

    void getUserProfile()
      .then((profile) => {
        if (!isCurrent) return;

        setUser((currentUser) =>
          currentUser?.id === profile.id
            ? {
                ...currentUser,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              }
            : currentUser,
        );
      })
      .catch(() => {
        // Keep the authenticated session usable if the profile request fails.
      });

    return () => {
      isCurrent = false;
    };
  }, [token, userId]);

  // =====================================================
  // Save session
  // =====================================================

  const saveSession = useCallback(
    (accessToken: string) => {
      localStorage.setItem('access_token', accessToken);
      setToken(accessToken);
      setUser(extractUser(accessToken));
    },
    [],
  );

  // =====================================================
  // Clear session
  // =====================================================

  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');

    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>) => {
      setUser((currentUser) =>
        currentUser ? { ...currentUser, ...updates } : currentUser,
      );
    },
    [],
  );

  // =====================================================
  // Login Email / Password
  // =====================================================

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<User> => {
      const response =
        await authService.login({
          email,
          password,
        });

      const extractedUser = extractUser(response.access_token);
      saveSession(response.access_token);
      return extractedUser;
    },
    [saveSession],
  );

  // =====================================================
  // Register - gửi OTP
  // =====================================================

  const register = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      await authService.registerInitiate({
        email,
        password,
      });
    },
    [],
  );

  // =====================================================
  // Register - verify OTP
  // =====================================================

  const verifyOtp = useCallback(
    async (
      email: string,
      otp: string,
      name?: string,
    ) => {
      const response =
        await authService.registerComplete({
          email,
          otp,
          name,
        });

      saveSession(response.access_token);
    },
    [saveSession],
  );

  // =====================================================
  // Google Login
  // =====================================================

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<User> => {
      const response =
        await authService.loginWithGoogle({
          idToken,
        });

      const extractedUser = extractUser(response.access_token);
      saveSession(response.access_token);
      return extractedUser;
    },
    [saveSession],
  );

  // =====================================================
  // Complete Profile
  // =====================================================

  const completeProfile = useCallback(
    async (
      role: UserRole,
      full_name: string,
      location: string,
      bio?: string,
    ) => {
      const response =
        await authService.completeProfile({
          role,
          full_name,
          location,
          bio,
        });

      saveSession(response.access_token);
    },
    [saveSession],
  );

  // =====================================================
  // Logout
  // =====================================================

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Dù API logout lỗi vẫn xoá session phía client
      clearSession();
    }
  }, [clearSession]);

  // =====================================================
  // Provider
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,

        login,
        register,
        verifyOtp,
        loginWithGoogle,
        completeProfile,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
}
