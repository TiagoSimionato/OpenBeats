'use client';

import type { QueryRelease } from 'services/mbApi/types';
import React from 'react';
import { useCover } from 'services/caaApi/queries/covers';
import { useMBQueryRelease } from 'services/mbApi';

const CoverPreview = ({
  releaseId,
  title,
}: Readonly<{
  releaseId: string;
  title?: string;
}>) => {
  const { data } = useCover({
    options: {
      retry: false,
    },
    releaseId,
  });

  const firstImage
    = data?.images?.find(image => image.front) ?? data?.images?.[0];
  const coverUrl
    = firstImage?.thumbnails?.small
      ?? firstImage?.thumbnails?.[250]
      ?? firstImage?.image;

  if (!coverUrl) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-xs text-zinc-500">
        No cover
      </div>
    );
  }

  return (
    <img
      alt={title ? `${title} cover art` : 'release cover art'}
      className="h-16 w-16 shrink-0 rounded object-cover"
      height={64}
      src={coverUrl}
      width={64}
    />
  );
};

const getArtistsLabel = (release: QueryRelease) => {
  const artistCredit = release['artist-credit'] ?? [];

  if (artistCredit.length === 0) {
    return 'Unknown artist';
  }

  return artistCredit
    .map(
      credit =>
        `${credit.name ?? credit.artist?.name ?? 'Unknown'}${credit.joinphrase ?? ''}`,
    )
    .join('');
};

const ReleasesSearch = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [query, setQuery] = React.useState('');

  const { data, error, isFetching, isLoading } = useMBQueryRelease({
    options: {
      enabled: query.trim().length > 0,
    },
    query,
  });

  const releases = data?.releases ?? [];

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(inputValue.trim());
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">MusicBrainz Release Search</h1>

      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2"
          onChange={event => setInputValue(event.target.value)}
          placeholder="Type artist, album, or release (e.g. meteora)"
          value={inputValue}
        />
        <button
          className="rounded bg-black px-4 py-2 font-medium text-white"
          type="submit"
        >
          Search
        </button>
      </form>

      {isLoading || isFetching ? <p>Loading releases...</p> : null}

      {error ? <p className="text-red-600">Failed to load releases.</p> : null}

      {!isLoading && !error
        ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Found
                {' '}
                {data?.count ?? releases.length}
                {' '}
                results for "
                {query}
                ".
              </p>
              <ul className="space-y-2">
                {releases.map(release => (
                  <li
                    className="flex gap-3 rounded border border-zinc-200 p-3"
                    key={release.id}
                  >
                    <CoverPreview releaseId={release.id} title={release.title} />
                    <div>
                      <p className="font-medium">
                        {release.title ?? 'Untitled release'}
                      </p>
                      <p className="text-sm text-zinc-700">
                        {getArtistsLabel(release)}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {release.date ?? 'Unknown date'}
                        {release.country ? ` • ${release.country}` : ''}
                        {release['release-group']?.['primary-type'] ? ` • ${release['release-group']['primary-type']}` : ''}
                        {release.status ? ` • ${release.status}` : ''}
                        {release['track-count']
                          ? ` • ${release['track-count']} tracks`
                          : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        : null}
    </main>
  );
};

const Home = () => <ReleasesSearch />;

export default Home;
