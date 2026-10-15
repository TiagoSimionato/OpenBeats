'use client';

import { useUpdateSearchParams } from 'frontend/hooks/useUpdateSearchParams';
import { useMBQueryRelease } from 'frontend/services/mbApi/queries/recordings';
import { Button } from 'frontend/ui/Button';
import { SearchParamsInput } from 'frontend/ui/SearchParamsInput';
import { Spinner } from 'frontend/ui/Spinner';
import { SearchIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { ReleaseSearchCard } from './components/ReleaseSearchCard';

export const ReleaseSearchPage = () => {
  const params = useSearchParams();
  const queryKey = 'search';
  const query = params.get(queryKey) ?? '';
  const { updateSearchParams } = useUpdateSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, error, isFetched, isFetching, isLoading } = useMBQueryRelease({
    options: {
      enabled: query.trim().length > 0,
    },
    query,
  });

  const releases = data?.releases ?? [];

  const onSubmit: React.ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();
    updateSearchParams(queryKey, inputRef.current?.value ?? '');
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <form className="flex gap-2" onSubmit={onSubmit}>
        <SearchParamsInput
          className="w-full"
          isAutomatic={false}
          placeholder="Search for album, EP or singles"
          queryKey={queryKey}
          ref={inputRef}
        />
        <Button size="sm" type="submit">
          <SearchIcon />
        </Button>
      </form>

      {isLoading || isFetching
        ? (
            <div className="flex items-center justify-center gap-3">
              <Spinner color="text-primary" size="lg" />
            </div>
          )
        : null}

      {error ? <p className="text-red-600">Failed to load releases.</p> : null}

      {!isLoading && !error && isFetched
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
