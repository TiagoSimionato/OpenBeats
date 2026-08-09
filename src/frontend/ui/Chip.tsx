import type { ComponentProps } from 'react';
import type { Size } from './sizes';

type ChipProps = ComponentProps<'span'> & {
  size?: Size;
  variant?: 'primary' | 'secondary' | 'unstyled';
};

const sizeStyles = {
  lg: 'text-[16px]',
  md: 'px-4 py-2 text-xs',
  sm: 'px-2 py-0.5 text-[10px]',
  xl: 'text-xl',
  xs: 'text-[10px]',
} as const;

const variantStyles = {
  primary: 'border-primary/30 bg-primary/10 text-primary',
  secondary: 'border-secondary/30 bg-secondary/10 text-secondary',
  unstyled: '',
} as const;

export const Chip = ({
  children,
  className,
  size = 'md',
  variant = 'primary',
  ...props
}: ChipProps) => (
  <span
    className={`${variantStyles[variant]} ${sizeStyles[size]} ${props.onClick ? 'cursor-pointer' : ''} rounded-full border text-center font-semibold tracking-wide uppercase ${className}`}
    {...props}
  >
    {children}
  </span>
);
