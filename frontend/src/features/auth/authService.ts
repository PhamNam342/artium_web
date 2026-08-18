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
  role: 'ARTIST' | 'COLECTOR';
  full_name: string;
  location: string;
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