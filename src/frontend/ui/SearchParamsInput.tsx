import type { InputProps } from './Input';
import { useDebounce } from 'frontend/hooks/useDebounce';
import { useUpdateSearchParams } from 'frontend/hooks/useUpdateSearchParams';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from './Input';

type SearchParamsInputProps = InputProps & {
  isAutomatic?: boolean;
  queryKey: string;
};

export const SearchParamsInput = ({
  isAutomatic = true,
  queryKey,
  ...props
}: SearchParamsInputProps) => {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get(queryKey) ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const debouncedQuery = useDebounce(query);
  const { updateSearchParams } = useUpdateSearchParams();

  useEffect(() => {
    if (isAutomatic) {
      updateSearchParams(queryKey, debouncedQuery, isDirty);
    }
    // eslint-disable-next-line react/exhaustive-deps
  }, [debouncedQuery]);

  const handleChange: React.ComponentProps<'input'>['onChange'] = (event) => {
    setQuery(event.target.value);
    if (!isDirty)
      setIsDirty(true);
  };

  return (
    <Input
      onChange={(e) => {
        handleChange(e);
        props.onChange?.(e);
      }}
      value={query}
      {...props}
    />
  );
};
