import type { ReleaseStatus } from 'common/types/requests/releases';
import { Chip } from 'frontend/ui/Chip';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const StatusFilter = () => {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const isCompleteActive = params.get('status') === 'complete';
  const isPartialActive = params.get('status') === 'partial';

  const handleChange = (status: ReleaseStatus) => {
    const searchParams = new URLSearchParams(params);

    if (searchParams.get('status') === status)
      searchParams.delete('status');
    else searchParams.set('status', status);

    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="font-bold">Release Status</span>
      <div className="flex gap-2">
        <Chip
          onClick={() => handleChange('complete')}
          variant={isCompleteActive ? 'primary' : 'unstyled'}
        >
          Complete
        </Chip>
        <Chip
          onClick={() => handleChange('partial')}
          variant={isPartialActive ? 'secondary' : 'unstyled'}
        >
          Partial
        </Chip>
      </div>
    </div>
  );
};
