import type { ButtonHTMLAttributes } from 'react';
import type { Size } from './sizes';
import { Spinner } from './Spinner';

type ButtonVariants = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  size?: Size;
  variant?: ButtonVariants;
};

const variantClasses: Record<ButtonVariants, string> = {
  primary: 'bg-primary',
  secondary: 'bg-white text-zinc-800 font-medium',
  tertiary: '',
};

const sizeClasses = {
  lg: 'px-7 py-2',
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5',
  xl: '',
  xs: 'text-sm gap-1',
};

export const Button = ({
  children,
  className,
  disabled,
  isLoading,
  size = 'md',
  type,
  variant = 'primary',
  ...rest
}: ButtonProps) => (
  <button
    {...rest}
    className={`${sizeClasses[size]} flex cursor-pointer items-center justify-center rounded font-bold disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    disabled={isLoading || disabled}
    type={type ?? 'button'}
  >
    {isLoading ? <Spinner className={`${variantClasses[variant]}`} size="lg" /> : children}
  </button>
);
