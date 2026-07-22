import type { PropsWithChildren } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from './Button';

type DialogProps = PropsWithChildren<{
  className?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}>;

export const Dialog = ({ children, className, open, setOpen }: DialogProps) => (
  <dialog open={open}>
    <div
      className="fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="border-border bg-card/95 mx-4 flex max-h-11/12 flex-col rounded-xl border p-2">
        <div className="self-end">
          <Button onClick={() => setOpen(false)} size="xs" variant="tertiary">
            <XIcon />
          </Button>
        </div>
        <div className={`flex flex-col overflow-y-auto p-4 pt-1 md:p-10 md:pt-4 ${className}`}>
          {children}
        </div>
      </div>
    </div>
  </dialog>
);
