'use client';

import type { FormEvent } from 'react';
import { Spinner } from 'frontend/ui/Spinner';
import { useState } from 'react';
import { useMBQueryRelease } from 'services/mbApi';
import { ReleaseCard } from './components/ReleaseCard';

export const ReleasesSearch = () => {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const { data, error, isFetching, isLoading } = useMBQueryRelease({
    options: {
      enabled: query.trim().length > 0,
    },
    query,
  });

  const releases = data?.releases ?? [];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
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

      {isLoading || isFetching
        ? (
            <div className="flex justify-center items-center gap-3">
              <Spinner color="text-primary" size="lg" />
            </div>
          )
        : null}

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
                  <ReleaseCard key={release.id} release={release} />
                ))}
              </ul>
            </div>
          )
        : null}
    </main>
  );
};
