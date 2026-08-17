import type { ComponentProps } from 'react';

type DividerProps = ComponentProps<'span'> & {
  color?: string;
};

export const Divider = ({ className, color = 'border-primary', ...props }: DividerProps) => (
  <span className={`border-t ${color} ${className}`} {...props} />
);
