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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 text-slate-700 transition hover:bg-slate-50"
        aria-label="Comments"
      >
        <MessageCircle className="h-5 w-5" />

        <span className="text-sm font-medium">
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
