import { useDebounce } from 'frontend/hooks/useDebounce';
import { Input } from 'frontend/ui/Input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const QueryLibrary = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    const searchParams = new URLSearchParams(params);
    if (debouncedQuery) {
      searchParams.set('query', debouncedQuery);
    }
    if (!debouncedQuery) {
      searchParams.delete('query');
    }
    router.push(`${pathname}?${searchParams.toString()}`);
    // eslint-disable-next-line react/exhaustive-deps
  }, [debouncedQuery]);

  const handleChange: React.ComponentProps<'input'>['onChange'] = (event) => {
    setQuery(event.target.value);
  };

  return (
    <Input
      className="md:w-4/7 xl:w-2/5"
      onChange={handleChange}
      placeholder="Search for releases, tracks or artists"
      value={query}
    />
  );
};
