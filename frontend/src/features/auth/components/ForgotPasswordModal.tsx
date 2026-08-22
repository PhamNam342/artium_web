import { useState, type FormEvent } from 'react';
import { X, Mail, Key, Shield, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword, verifyForgotPassword, resetPassword } from '../authService';
import { useI18n } from '../../../i18n/I18nContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'EMAIL' | 'OTP' | 'RESET' | 'SUCCESS';

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state về ban đầu khi đóng
    setStep('EMAIL');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setShowPassword(false);
    onClose();
  };

  // ─── Bước 1: Gửi yêu cầu OTP ───────────────────────────────────────────────
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('common.requiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      toast.success('Mã OTP đã được gửi đến email của bạn.');
      setStep('OTP');
    } catch {
      toast.error('Gửi OTP thất bại. Vui lòng kiểm tra lại email.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Bước 2: Xác thực OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      toast.error('Vui lòng nhập đủ mã OTP gồm 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyForgotPassword(email.trim(), otp.trim());
      setResetToken(data.reset_token);
      toast.success('Xác thực OTP thành công!');
      setStep('RESET');
    } catch {
      toast.error('Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Bước 3: Đặt lại mật khẩu mới ──────────────────────────────────────────
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error(t('common.requiredFields'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      toast.success('Đặt lại mật khẩu thành công!');
      setStep('SUCCESS');
    } catch {
      toast.error('Không thể đặt lại mật khẩu. Vui lòng thử lại từ đầu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Nút Close */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* STEP 1: NHẬP EMAIL */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Quên mật khẩu?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Nhập email đăng ký của bạn để nhận mã xác thực OTP.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi mã xác thực'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: NHẬP OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Nhập mã xác thực</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chúng tôi đã gửi mã OTP gồm 6 chữ số đến <span className="font-semibold text-gray-700">{email}</span>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác thực (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="xxxxxx"
                  className="w-full text-center tracking-widest text-lg font-bold py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác nhận'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="w-full text-center text-xs text-blue-600 hover:underline"
              >
                Nhập lại email khác
              </button>
            </form>
          )}

          {/* STEP 3: ĐẶT MẬT KHẨU MỚI */}
          {step === 'RESET' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Key className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tạo mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang thiết lập...
                  </>
                ) : (
                  'Thiết lập mật khẩu'
                )}
              </button>
            </form>
          )}

          {/* STEP 4: THÀNH CÔNG */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Thiết lập mật khẩu thành công!</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn đã có thể đăng nhập bằng mật khẩu mới.
              </p>
              <button
                onClick={handleClose}
                type="button"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
