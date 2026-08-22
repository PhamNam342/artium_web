import api from '../../services/api';
import type {
  LoginRequest,
  RegisterInitiateRequest,
  RegisterCompleteRequest,
  GoogleLoginRequest,
  AuthResponse,
  MessageResponse,
} from './types';
export interface CompleteProfileRequest {
  role: 'ARTIST' | 'COLLECTOR';
  full_name: string;
  location: string;
  bio?: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function registerInitiate(
  data: RegisterInitiateRequest,
): Promise<MessageResponse> {
  const res = await api.post<MessageResponse>('/auth/register/initiate', data);
  return res.data;
}

export async function registerComplete(
  data: RegisterCompleteRequest,
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register/complete', data);
  return res.data;
}

export async function loginWithGoogle(
  data: GoogleLoginRequest,
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/google', data);
  return res.data;
}

export async function logout(): Promise<MessageResponse> {
  const res = await api.post<MessageResponse>('/auth/logout');
  return res.data;
}

export async function completeProfile(
  data: CompleteProfileRequest,
): Promise<AuthResponse> {
  const response = await api.patch<AuthResponse>(
    '/auth/profile/complete',
    data,
  );

  return response.data;
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const res = await api.post<MessageResponse>('/auth/forgot-password', { email });
  return res.data;
}

export async function verifyForgotPassword(
  email: string,
  otp: string,
): Promise<{ reset_token: string }> {
  const res = await api.post<{ reset_token: string }>('/auth/forgot-password/verify', {
    email,
    otp,
  });
  return res.data;
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<MessageResponse> {
  const res = await api.post<MessageResponse>('/auth/forgot-password/reset', {
    resetToken,
    newPassword,
  });
  return res.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<MessageResponse> {
  const res = await api.patch<MessageResponse>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return res.data;
}