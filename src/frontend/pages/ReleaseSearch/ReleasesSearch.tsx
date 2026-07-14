'use client';

import { useMBQueryRelease } from 'frontend/services/mbApi/queries/recordings';
import { Button } from 'frontend/ui/Button';
import { Spinner } from 'frontend/ui/Spinner';
import { useState } from 'react';
import { ReleaseSearchCard } from './components/ReleaseSearchCard';

export const ReleaseSearchPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const { data, error, isFetching, isLoading } = useMBQueryRelease({
    options: {
      enabled: query.trim().length > 0,
    },
    query,
  });

  const releases = data?.releases ?? [];

  const onSubmit: React.ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();
    setQuery(inputValue.trim());
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 py-6">
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2"
          onChange={event => setInputValue(event.target.value)}
          placeholder="Search for album, release or singles"
          value={inputValue}
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading || isFetching
        ? (
            <div className="flex items-center justify-center gap-3">
              <Spinner color="text-primary" size="lg" />
            </div>
          )
        : null}

      {error ? <p className="text-red-600">Failed to load releases.</p> : null}

      {!isLoading && !error
        ? (
            <div className="space-y-3">
              <p className="text-lighter text-sm">
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
                  <ReleaseSearchCard key={release.id} release={release} />
                ))}
              </ul>
            </div>
          )
        : null}
    </main>
  );
};
