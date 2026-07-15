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
      className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="border-border bg-card/95 flex flex-col rounded-xl border p-2">
        <div className="self-end">
          <Button onClick={() => setOpen(false)} size="xs" variant="tertiary">
            <XIcon />
          </Button>
        </div>
        <div className={`p-10 pt-4 ${className}`}>{children}</div>
      </div>
    </div>
  </dialog>
);
