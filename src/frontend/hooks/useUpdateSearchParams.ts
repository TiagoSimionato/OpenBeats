import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useUpdateSearchParams = () => {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const updateSearchParams = (queryKey: string, value: string, shouldPush: boolean = true) => {
    const searchParams = new URLSearchParams(params);
    if (value) {
      searchParams.set(queryKey, value);
    }
    if (!value) {
      searchParams.delete(queryKey);
    }
    if (shouldPush) {
      router.push(`${pathname}?${searchParams.toString()}`);
    }
  };

  return { updateSearchParams };
};
