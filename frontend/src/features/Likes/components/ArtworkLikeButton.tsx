import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { artworkLikeService } from '../../../services/likeService';

interface ArtworkLikeButtonProps {
  artworkId: string;
}

export default function ArtworkLikeButton({
  artworkId,
}: ArtworkLikeButtonProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadLikeData = async () => {
      try {
        const countPromise =
          artworkLikeService.getLikeCount(artworkId);

        const statusPromise = user
          ? artworkLikeService.getLikeStatus(artworkId)
          : Promise.resolve(false);

        const [count, liked] = await Promise.all([
          countPromise,
          statusPromise,
        ]);

        if (!active) return;

        setLikeCount(count);
        setIsLiked(liked);
      } catch {
        if (!active) return;

        setLikeCount(0);
        setIsLiked(false);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadLikeData();

    return () => {
      active = false;
    };
  }, [artworkId, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isLiked) {
        await artworkLikeService.unlike(artworkId);

        setIsLiked(false);
        setLikeCount((current) => Math.max(0, current - 1));
      } else {
        await artworkLikeService.like(artworkId);

        setIsLiked(true);
        setLikeCount((current) => current + 1);
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setIsLiked(true);
      } else if (error?.response?.status === 404) {
        setIsLiked(false);
      } else {
        toast.error(t('artworks.likeError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isLoading || isSubmitting}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 transition ${
        isLiked
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      aria-label={isLiked ? 'Unlike artwork' : 'Like artwork'}
    >
      <Heart
        className="h-5 w-5"
        fill={isLiked ? 'currentColor' : 'none'}
      />

      <span className="min-w-[1.5rem] text-sm font-medium">
        {isLoading ? '...' : likeCount}
      </span>
    </button>
  );
}
