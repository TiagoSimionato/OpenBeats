import type { ComponentPropsWithRef } from 'react';

export type InputProps = ComponentPropsWithRef<'input'>;

const className = 'rounded-md border-2 border-zinc-200 px-3 py-2';

export const inputDefaultStyle = className;

export const Input = ({ className, ...rest }: InputProps) => (
  <input className={`${inputDefaultStyle} ${className}`} {...rest} />
);
