import { useState } from 'react';
import {
  Pencil,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import type { ArtworkComment } from '../types';

import { useI18n } from '../../../i18n/I18nContext';

interface ArtworkCommentItemProps {
  comment: ArtworkComment;
  currentUserId?: string;

  onEdit: (
    commentId: string,
    content: string,
  ) => Promise<void>;

  onDelete: (
    commentId: string,
  ) => void;
}

export default function ArtworkCommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
}: ArtworkCommentItemProps) {
  const { t } = useI18n();

  const [isEditing, setIsEditing] =
    useState(false);

  const [editingContent, setEditingContent] =
    useState(comment.content);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const isOwner =
    !!currentUserId &&
    currentUserId === comment.userId;

  const displayName =
    comment.user?.full_name?.trim() ||
    t('comment.popup.item.unknownUser');

  const avatar =
    comment.user?.avatar_url ||
    '/default-avatar.png';

  // ============================================
  // EDIT
  // ============================================

  const handleStartEdit = () => {
    setEditingContent(comment.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingContent(comment.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const content =
      editingContent.trim();

    if (!content) {
      toast.error(
        t(
          'comment.popup.item.emptyContent',
        ),
      );

      return;
    }

    try {
      setIsUpdating(true);

      await onEdit(
        comment.id,
        content,
      );

      setIsEditing(false);

      toast.success(
        t(
          'comment.popup.item.updateSuccess',
        ),
      );
    } catch (error) {
      console.error(
        'UPDATE COMMENT ERROR:',
        error,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Avatar */}

      <img
        src={avatar}
        alt={displayName}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        onError={(event) => {
          event.currentTarget.src =
            '/default-avatar.png';
        }}
      />

      {/* Content */}

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-slate-100 px-4 py-3">
          {/* User */}

          <p className="text-sm font-semibold text-slate-900">
            {displayName}
          </p>

          {/* Normal mode */}

          {!isEditing && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
              {comment.content}
            </p>
          )}

          {/* Edit mode */}

          {isEditing && (
            <div className="mt-2">
              <textarea
                value={editingContent}
                onChange={(event) =>
                  setEditingContent(
                    event.target.value,
                  )
                }
                rows={3}
                autoFocus
                disabled={isUpdating}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleSaveEdit()
                  }
                  disabled={
                    isUpdating ||
                    !editingContent.trim()
                  }
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating
                    ? t(
                        'comment.popup.item.saving',
                      )
                    : t(
                        'comment.popup.item.save',
                      )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {t(
                    'comment.popup.item.cancel',
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date + actions */}

        <div className="mt-1 flex items-center gap-3 px-2 text-xs text-slate-500">
          <span>
            {new Date(
              comment.createdAt,
            ).toLocaleString()}
          </span>

          {!isEditing && isOwner && (
            <>
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1 font-medium transition hover:text-blue-600"
              >
                <Pencil className="h-3 w-3" />

                {t(
                  'comment.popup.item.edit',
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(comment.id)
                }
                className="inline-flex items-center gap-1 font-medium transition hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />

                {t(
                  'comment.popup.item.delete',
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
