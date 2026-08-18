import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string,
  disabled?: boolean;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="
          w-full rounded-xl border border-gray-200
          bg-white px-4 py-3 pr-12
          text-sm text-gray-900
          outline-none transition-all
          placeholder:text-gray-400
          hover:border-gray-300
          focus:border-blue-500
          focus:ring-4 focus:ring-blue-500/10
          disabled:cursor-not-allowed
          disabled:bg-gray-50
        "
      />

      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        disabled={disabled}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="
          absolute right-3 top-1/2
          -translate-y-1/2
          rounded-lg p-1.5
          text-gray-400
          transition-colors
          hover:bg-gray-100
          hover:text-gray-600
          disabled:cursor-not-allowed
        "
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" strokeWidth={1.8} />
        ) : (
          <Eye className="h-5 w-5" strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}