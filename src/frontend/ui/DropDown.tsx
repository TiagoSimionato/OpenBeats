import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';

type DropDownProps = Omit<ComponentProps<'div'>, 'children'> & {
  display: ReactNode;
  dropDownContent: ReactNode;
};

export const DropDown = ({ className, display, dropDownContent, ...rest }: DropDownProps) => {
  const id = useId();

  return (
    <div aria-haspopup className={`group relative ${className}`} {...rest}>
      <button aria-controls={id} className="block" type="button">
        {display}
      </button>
      <div
        className="dropdown border-primary/90 bg-background absolute right-0 z-10 hidden border group-focus-within:block"
        id={id}
      >
        {dropDownContent}
      </div>
    </div>
  );
};
