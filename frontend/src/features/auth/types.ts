export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterInitiateRequest {
  email: string;
  password: string;
}

export interface RegisterCompleteRequest {
  email: string;
  otp: string;
  name?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface MessageResponse {
  message: string;
}

export type UserRole = 'ADMIN' | 'ARTIST' | 'COLECTOR';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
  iat: number;
  exp: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
}