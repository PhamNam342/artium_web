import type { AxiosError } from 'axios';

interface ApiError {
  message?: string | string[];
}

const ERROR_MAP: Record<string, string> = {
  'Invalid credentials': 'Email hoặc mật khẩu không đúng',
  'Invalid Google token': 'Đăng nhập Google thất bại',
  'Email already exists': 'Email này đã được sử dụng',
  'Invalid or expired OTP': 'Mã OTP không hợp lệ hoặc đã hết hạn',
};

export function getAuthErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;

  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (message && ERROR_MAP[message]) {
    return ERROR_MAP[message];
  }

  if (typeof message === 'string') {
    return message;
  }

  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
