import { Button } from 'frontend/ui/Button';
import { XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { MultiAddAction } from './MultiAddAction';
import { MultiDeleteAction } from './MultiDeleteAction';
import { useSelectedTracksStore } from './useSelectedTracksStore';

export const MultiActions = () => {
  const { resetSelection, tracks } = useSelectedTracksStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tracks.length > 0 && ref.current) {
      ref.current.style.gridTemplateRows = '1fr';
      ref.current.style.height = 'auto';
    }
    if (tracks.length === 0 && ref.current) {
      ref.current.style.gridTemplateRows = '0fr';
      ref.current.style.height = '0px';
    }
  }, [tracks]);

  // eslint-disable-next-line react/exhaustive-deps
  useEffect(() => () => resetSelection(), []);

  return (
    <div
      className="bg-primary grid h-0 grid-rows-[0fr] overflow-hidden rounded-t-md transition-all"
      ref={ref}
    >
      <div className="flex items-center gap-3 overflow-hidden px-2 py-4 pr-3 md:pr-6">
        <Button onClick={() => resetSelection()} size="xs" variant="tertiary">
          <XIcon size={28} />
        </Button>
        <span className="mr-auto font-semibold">
          {tracks.length}
          {' '}
          items selected
        </span>
        <MultiAddAction />
        <MultiDeleteAction />
      </div>
    </div>
  );
};
