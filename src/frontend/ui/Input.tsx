import type { InputHTMLAttributes } from 'react';

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="border-zinc-200 border-2 rounded-md py-2 px-3"
    {...props}
  />
);
