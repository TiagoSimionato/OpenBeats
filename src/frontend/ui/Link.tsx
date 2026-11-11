import type { ComponentProps } from 'react';
import type { Size } from './sizes';
import NextLink from 'next/link';

type LinkVariants = 'button' | 'text';

const variantClasses: Record<LinkVariants, string> = {
  button: 'bg-primary font-bold rounded items-center justify-center',
  text: 'text-primary font-semibold',
};

const sizeClasses = {
  lg: 'px-7 py-2',
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5',
  xl: '',
  xs: '',
};

type LinkProps = ComponentProps<typeof NextLink> & {
  size?: Size;
  variant?: LinkVariants;
};

export const Link = ({ className, size, variant = 'text', ...props }: LinkProps) => {
  const isButton = variant === 'button';
  const defaultSize: Size = isButton ? 'md' : 'xs';

  return (
    <NextLink
      className={`${variantClasses[variant]} ${sizeClasses[size ?? defaultSize]} ${className}`}
      {...props}
    >
    </NextLink>
  );
};
