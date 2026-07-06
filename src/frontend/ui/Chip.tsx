import type { PropsWithChildren } from 'react';

type ChipProps = PropsWithChildren<{
  variant?: 'primary' | 'secondary';
}>;

const styles = {
  primary: 'border-primary/30 bg-primary/10 text-primary',
  secondary: 'border-secondary/30 bg-secondary/10 text-secondary',
} as const;

export const Chip = ({ children, variant = 'primary' }: ChipProps) => (
  <span
    className={`${styles[variant]} rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase`}
  >
    {children}
  </span>
);
