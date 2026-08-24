import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

interface ArtworkCommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function ArtworkCommentInput({
  onSubmit,
  disabled = false,
}: ArtworkCommentInputProps) {
  const { t } = useI18n();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (
      !trimmedContent ||
      disabled ||
      isSubmitting
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit(trimmedContent);

      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder={t(
          'comment.popup.input.placeholder',
        )}
        rows={1}
        disabled={disabled || isSubmitting}
        className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={
          disabled ||
          isSubmitting ||
          !content.trim()
        }
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t(
          'comment.popup.input.send',
        )}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
