import type { ComponentProps } from 'react';

type CheckboxProps = ComponentProps<'input'>;

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <input
    className={`h-5.5 w-5.5 cursor-pointer rounded-sm border-2 not-checked:appearance-none ${className}`}
    type="checkbox"
    {...props}
  />
);
