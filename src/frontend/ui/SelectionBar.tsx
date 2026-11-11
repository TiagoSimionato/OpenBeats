import type { ReactNode } from 'react';
import { Button } from 'frontend/ui/Button';
import { XIcon } from 'lucide-react';
import { useEffect } from 'react';

type SelectionBarProps = {
  actions?: ReactNode;
  children?: ReactNode;
  onClear?: () => void;
  open: boolean;
  title: ReactNode;
};

export const SelectionBar = ({ actions, children, onClear, open, title }: SelectionBarProps) => {
  // eslint-disable-next-line react/exhaustive-deps
  useEffect(() => () => onClear?.(), []);

  return (
    <div
      className={[
        'bg-primary grid overflow-hidden rounded-t-md transition-all',
        open ? 'h-auto grid-rows-[1fr]' : 'h-0 grid-rows-[0fr]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 overflow-hidden px-2 py-4 pr-3 md:pr-6">
        {onClear && (
          <Button onClick={onClear} size="xs" variant="tertiary">
            <XIcon size={28} />
          </Button>
        )}

        <span className="mr-auto font-semibold">{title}</span>

        {children ?? actions}
      </div>
    </div>
  );
};
