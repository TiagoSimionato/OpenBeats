import type { InputHTMLAttributes } from 'react';

export const Input = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`rounded-md border-2 border-zinc-200 px-3 py-2 ${className}`} {...rest} />
);
