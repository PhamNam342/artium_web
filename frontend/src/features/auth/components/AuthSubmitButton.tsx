import { ArrowRight, Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}

export default function AuthSubmitButton({
  children,
  loading = false,
  loadingText = 'Đang xử lý...',
  disabled = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="
        flex w-full items-center justify-center gap-2
        rounded-xl
        bg-blue-600
        px-4 py-3
        text-sm font-semibold text-white
        shadow-sm
        transition-all
        hover:bg-blue-700
        focus:outline-none
        focus:ring-4 focus:ring-blue-500/20
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
