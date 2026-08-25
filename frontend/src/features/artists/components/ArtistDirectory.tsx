import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import {
  getPublicArtists,
  type PublicUserProfile,
} from '../../../services/userService';
import {
  followUser,
  getFollowStatus,
  unfollowUser,
} from '../../../services/followService';
import { useI18n } from '../../../i18n/I18nContext';
import type { ArtistFiltersValue } from '../types';

function ArtistAvatar({ artist }: { artist: PublicUserProfile }) {
  const initial = artist.full_name?.charAt(0).toUpperCase() || 'A';

  if (!artist.avatar_url) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-500">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={artist.avatar_url}
      alt={artist.full_name || 'Artist'}
      className="h-32 w-32 rounded-full object-cover"
      loading="lazy"
    />
  );
}

interface ArtistCardProps {
  artist: PublicUserProfile;
  isFollowing: boolean;
  isUpdating: boolean;
  onFollow: (artist: PublicUserProfile) => void;
  followLabel: string;
  followingLabel: string;
}

function ArtistCard({
  artist,
  isFollowing,
  isUpdating,
  onFollow,
  followLabel,
  followingLabel,
}: ArtistCardProps) {
  const profile = artist.seller_profile;

  return (
    <article className="flex min-h-[395px] flex-col rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={`/artists/${artist.id}`}
        className="mx-auto rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
        aria-label={artist.full_name || 'Artist'}
      >
        <ArtistAvatar artist={artist} />
      </Link>

      <Link
        to={`/artists/${artist.id}`}
        className="mt-5 inline-flex items-center justify-center gap-1.5 text-xl font-semibold text-slate-950 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <span className="truncate">{artist.full_name || 'Unnamed artist'}</span>
        {profile?.is_verified && (
          <BadgeCheck
            className="h-5 w-5 shrink-0 text-blue-600"
            aria-label="Verified artist"
          />
        )}
      </Link>

      <p className="mt-3 h-[3.75rem] overflow-hidden text-sm leading-6 text-slate-600">
        {profile?.bio || artist.location || 'Artist on Artium'}
      </p>

      <button
        type="button"
        onClick={() => onFollow(artist)}
        disabled={isUpdating}
        className={`mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
            : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-slate-100'
        }`}
      >
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        {isFollowing ? followingLabel : followLabel}
      </button>
    </article>
  );
}

interface ArtistDirectoryProps {
  filters?: ArtistFiltersValue;
}

const DEFAULT_FILTERS: ArtistFiltersValue = {
  search: '',
  verifiedOnly: false,
  followingOnly: false,
};

export default function ArtistDirectory({
  filters = DEFAULT_FILTERS,
}: ArtistDirectoryProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [followingById, setFollowingById] = useState<Record<string, boolean>>(
    {},
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void getPublicArtists()
      .then((data) => {
        if (isCurrent) setArtists(data);
      })
      .catch(() => {
        if (isCurrent) setError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!user || artists.length === 0) {
      return;
    }

    let isCurrent = true;
    void Promise.all(
      artists
        .filter((artist) => artist.id !== user.id)
        .map(async (artist) => [artist.id, await getFollowStatus(artist.id)] as const),
    ).then((statuses) => {
      if (isCurrent) setFollowingById(Object.fromEntries(statuses));
    });

    return () => {
      isCurrent = false;
    };
  }, [artists, user]);

  const currentFollowingById = user ? followingById : {};

  const handleFollow = async (artist: PublicUserProfile) => {
    if (!user) {
      navigate('/login', { state: { from: '/artists' } });
      return;
    }
    if (artist.id === user.id) return;

    const wasFollowing = Boolean(currentFollowingById[artist.id]);
    setUpdatingId(artist.id);
    try {
      if (wasFollowing) {
        await unfollowUser(artist.id);
      } else {
        await followUser(artist.id);
      }
      setFollowingById((current) => ({
        ...current,
        [artist.id]: !wasFollowing,
      }));
    } catch {
      toast.error(t('artists.followError'));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredArtists = artists.filter((artist) => {
    const normalizedSearch = filters.search
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase();
    const searchableText = [
      artist.full_name,
      artist.location,
      artist.seller_profile?.bio,
    ]
      .filter(Boolean)
      .join(' ')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase();

    if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
      return false;
    }
    if (filters.verifiedOnly && !artist.seller_profile?.is_verified) {
      return false;
    }
    if (filters.followingOnly && !currentFollowingById[artist.id]) {
      return false;
    }
    return true;
  });
  const verifiedArtists = filteredArtists
    .filter((artist) => artist.seller_profile?.is_verified)
    .slice(0, 6);
  const browseArtists = [...filteredArtists].sort((a, b) =>
    (a.full_name || '').localeCompare(b.full_name || ''),
  );
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filteredBrowseArtists = selectedLetter
    ? browseArtists.filter((artist) =>
        (artist.full_name || '')
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toUpperCase()
          .startsWith(selectedLetter),
      )
    : browseArtists;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-6 lg:px-8">
        <div className="h-9 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[395px] animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 py-10 text-sm text-red-700 sm:px-6 lg:px-8">
        {t('artists.loadError')}
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white py-10">
      <section className="mx-auto max-w-[1600px] px-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {t('artists.featuredTitle')}
          </h1>
          <a
            href="#browse-artists"
            className="rounded p-1 text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={t('artists.browseTitle')}
          >
            <ArrowRight className="h-7 w-7" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-7 grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] sm:auto-cols-[minmax(280px,1fr)]">
          {verifiedArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              isFollowing={Boolean(currentFollowingById[artist.id])}
              isUpdating={updatingId === artist.id}
              onFollow={handleFollow}
              followLabel={t('artists.follow')}
              followingLabel={t('artists.following')}
            />
          ))}
        </div>
      </section>

      <section
        id="browse-artists"
        className="mx-auto mt-14 max-w-[1600px] scroll-mt-24 px-5 sm:px-6 lg:px-8"
      >
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {t('artists.browseTitle')}
        </h2>
        <div
          className="mt-7 flex gap-1 overflow-x-auto pb-2 [scrollbar-width:thin]"
          aria-label={t('artists.alphabetLabel')}
        >
          {alphabet.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() =>
                setSelectedLetter((current) =>
                  current === letter ? null : letter,
                )
              }
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                selectedLetter === letter
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-pressed={selectedLetter === letter}
            >
              {letter}
            </button>
          ))}
        </div>
        {filteredBrowseArtists.length === 0 ? (
          <p className="mt-7 text-sm text-slate-500">
            {selectedLetter
              ? t('artists.emptyLetter', { letter: selectedLetter })
              : t('artists.emptyFilters')}
          </p>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBrowseArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              isFollowing={Boolean(currentFollowingById[artist.id])}
              isUpdating={updatingId === artist.id}
              onFollow={handleFollow}
              followLabel={t('artists.follow')}
              followingLabel={t('artists.following')}
            />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
