import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    const nextValue = [...value];
    nextValue[index] = digit;

    onChange(nextValue);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === 'Backspace' &&
      !value[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const nextValue = Array(6).fill('');

    pasted.split('').forEach((digit, index) => {
      nextValue[index] = digit;
    });

    onChange(nextValue);

    const focusIndex = Math.min(pasted.length, 6) - 1;

    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-3"
      onPaste={handlePaste}
    >
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) =>
            handleChange(index, event.target.value)
          }
          onKeyDown={(event) =>
            handleKeyDown(index, event)
          }
          aria-label={`Mã OTP số ${index + 1}`}
          className={`
            h-14 w-12 rounded-xl border
            text-center text-xl font-bold
            text-gray-900
            outline-none transition-all

            focus:border-blue-500
            focus:ring-4 focus:ring-blue-500/10

            disabled:cursor-not-allowed
            disabled:bg-gray-50

            ${
              digit
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-gray-200 bg-white'
            }
          `}
        />
      ))}
    </div>
  );
}
