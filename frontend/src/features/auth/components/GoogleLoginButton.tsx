import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  disabled?: boolean;
}

export default function GoogleLoginButton({
  onSuccess,
  disabled = false,
}: GoogleLoginButtonProps) {
  const handleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) {
      toast.error('Không nhận được Google ID Token');
      return;
    }

    try {
      await onSuccess(credentialResponse.credential);
    } catch {
      // Error đã được xử lý ở LoginPage
    }
  };

  return (
    <div
      className={
        disabled
          ? 'pointer-events-none opacity-50'
          : ''
      }
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          toast.error('Đăng nhập Google thất bại');
        }}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
