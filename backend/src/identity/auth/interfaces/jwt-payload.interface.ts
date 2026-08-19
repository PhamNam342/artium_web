export interface JwtPayload {
  sub: string;
  email: string;
  full_name: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}
