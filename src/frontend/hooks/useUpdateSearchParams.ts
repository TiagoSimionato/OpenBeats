import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Item = {
  queryKey: string;
  value: string;
};

export const useUpdateSearchParams = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const updateSearchParams = (items: Item[], shouldPush: boolean = true) => {
    const searchParams = new URLSearchParams(params);
    for (const { queryKey, value } of items) {
      if (value) {
        searchParams.set(queryKey, value);
      }
      if (!value) {
        searchParams.delete(queryKey);
      }
    }
    if (shouldPush) {
      router.push(`${pathname}?${searchParams.toString()}`);
    }
  };

  return { updateSearchParams };
};
