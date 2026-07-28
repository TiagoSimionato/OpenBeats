import type { ComponentPropsWithRef } from 'react';

export const Input = ({ className, ...rest }: ComponentPropsWithRef<'input'>) => (
  <input className={`rounded-md border-2 border-zinc-200 px-3 py-2 ${className}`} {...rest} />
);
