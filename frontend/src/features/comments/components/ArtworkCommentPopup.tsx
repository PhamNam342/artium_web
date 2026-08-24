import { useEffect, useState } from 'react';
import {
  Loader2,
  MessageCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import type { Artwork } from '../../artworks/types';
import type { ArtworkComment } from '../types';

import { artworkCommentService } from '../../../services/commentService';

import ArtworkCommentItem from './ArtworkCommentItem';
import ArtworkCommentInput from './ArtworkCommentInput';
import ArtworkLikeButton from '../../Likes/components/ArtworkLikeButton';

import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';

interface ArtworkCommentPopupProps {
  artwork: Artwork;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

export default function ArtworkCommentPopup({
  artwork,
  onClose,
  onCommentCountChange,
}: ArtworkCommentPopupProps) {
  const { user } = useAuth();
  const { t } = useI18n();

  const [comments, setComments] = useState<ArtworkComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deletingCommentId, setDeletingCommentId] =
    useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // LOAD COMMENTS
  // ============================================

  useEffect(() => {
    let active = true;

    const loadComments = async () => {
      try {
        setIsLoading(true);

        const data =
          await artworkCommentService.getComments(
            artwork.id,
          );

        if (!active) return;

        setComments(data);

        onCommentCountChange?.(data.length);
      } catch (error) {
        console.error(
          'LOAD COMMENTS ERROR:',
          error,
        );

        if (active) {
          toast.error(
            t('comment.popup.loadError'),
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      active = false;
    };
  }, [
    artwork.id,
    onCommentCountChange,
    t,
  ]);

  // ============================================
  // CREATE COMMENT
  // ============================================

  const handleCreateComment = async (
    content: string,
  ) => {
    try {
      const newComment =
        await artworkCommentService.createComment(
          artwork.id,
          {
            content,
          },
        );

      setComments((current) => {
        const nextComments = [
          newComment,
          ...current,
        ];

        onCommentCountChange?.(
          nextComments.length,
        );

        return nextComments;
      });
    } catch (error) {
      console.error(
        'CREATE COMMENT ERROR:',
        error,
      );

      toast.error(
        t('comment.popup.createError'),
      );

      throw error;
    }
  };

  // ============================================
  // UPDATE COMMENT
  // ============================================

  const handleEditComment = async (
    commentId: string,
    content: string,
  ) => {
    try {
      const updatedComment =
        await artworkCommentService.updateComment(
          artwork.id,
          commentId,
          {
            content,
          },
        );

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? updatedComment
            : comment,
        ),
      );
    } catch (error) {
      console.error(
        'UPDATE COMMENT ERROR:',
        error,
      );

      toast.error(
        t('comment.popup.updateError'),
      );

      throw error;
    }
  };

  // ============================================
  // REQUEST DELETE
  // ============================================

  const handleRequestDelete = (
    commentId: string,
  ) => {
    setDeletingCommentId(commentId);
  };

  // ============================================
  // CANCEL DELETE
  // ============================================

  const handleCancelDelete = () => {
    if (isDeleting) return;

    setDeletingCommentId(null);
  };

  // ============================================
  // CONFIRM DELETE
  // ============================================

  const handleConfirmDelete = async () => {
    if (!deletingCommentId) return;

    try {
      setIsDeleting(true);

      await artworkCommentService.deleteComment(
        artwork.id,
        deletingCommentId,
      );

      setComments((current) => {
        const nextComments =
          current.filter(
            (comment) =>
              comment.id !== deletingCommentId,
          );

        onCommentCountChange?.(
          nextComments.length,
        );

        return nextComments;
      });

      setDeletingCommentId(null);

      toast.success(
        t('comment.popup.deleteSuccess'),
      );
    } catch (error) {
      console.error(
        'DELETE COMMENT ERROR:',
        error,
      );

      toast.error(
        t('comment.popup.deleteError'),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* COMMENT POPUP */}

      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {t('comment.popup.title')}
              </h2>

              <p className="text-sm text-slate-500">
                {artwork.title}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={t(
                'comment.popup.close',
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ARTWORK */}

          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="mx-auto aspect-video max-h-72 overflow-hidden rounded-xl bg-white">
              {artwork.images?.[0]?.secureUrl ||
              artwork.images?.[0]?.url ? (
                <img
                  src={
                    artwork.images[0].secureUrl ||
                    artwork.images[0].url
                  }
                  alt={artwork.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  {t('comment.popup.noImage')}
                </div>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-4 flex items-center gap-3">
              <ArtworkLikeButton
                artworkId={artwork.id}
              />

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MessageCircle className="h-5 w-5" />

                <span>
                  {t(
                    'comment.popup.commentsCount',
                    {
                      count: comments.length,
                    },
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* COMMENTS LIST */}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : comments.length === 0 ? (
              <div className="py-10 text-center">
                <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  {t(
                    'comment.popup.noComments',
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {t(
                    'comment.popup.beFirst',
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <ArtworkCommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    onEdit={handleEditComment}
                    onDelete={
                      handleRequestDelete
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* INPUT */}

          {user ? (
            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <ArtworkCommentInput
                onSubmit={
                  handleCreateComment
                }
              />
            </div>
          ) : (
            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <p className="text-center text-sm text-slate-500">
                {t(
                  'comment.popup.loginRequired',
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION */}

      {deletingCommentId && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {t(
                'comment.popup.deleteTitle',
              )}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t(
                'comment.popup.deleteMessage',
              )}
              <br />
              {t(
                'comment.popup.deleteWarning',
              )}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(
                  'comment.popup.cancel',
                )}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isDeleting
                  ? t(
                      'comment.popup.deleting',
                    )
                  : t(
                      'comment.popup.delete',
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}