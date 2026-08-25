import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import type { Artwork } from '../../artworks/types';

import ArtworkCommentPopup from './ArtworkCommentPopup';

interface ArtworkCommentButtonProps {
  artwork: Artwork;
  commentCount?: number;
  onCommentCountChange?: (
    count: number,
  ) => void;
}

export default function ArtworkCommentButton({
  artwork,
  commentCount = 0,
  onCommentCountChange,
}: ArtworkCommentButtonProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        aria-label="Comments"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <MessageCircle className="h-6 w-6" />

        <span className="min-w-[1.25rem] text-center">
          {commentCount}
        </span>
      </button>

      {isOpen && (
        <ArtworkCommentPopup
          artwork={artwork}
          onClose={handleClose}
          onCommentCountChange={
            onCommentCountChange
          }
        />
      )}
    </>
  );
}
