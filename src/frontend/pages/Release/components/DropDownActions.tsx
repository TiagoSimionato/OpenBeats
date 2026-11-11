import type { PropsWithChildren } from 'react';
import { DropDown } from 'frontend/ui/DropDown';
import { RoundUnderlay } from 'frontend/ui/RoundUnderlay';
import { EllipsisVerticalIcon } from 'lucide-react';

type DropDownActionsProps = PropsWithChildren & {
  ellipsisOnHover?: boolean;
};

export const DropDownActions = ({ children, ellipsisOnHover }: DropDownActionsProps) => (
  <DropDown
    display={(
      <div className="relative">
        <RoundUnderlay />
        <EllipsisVerticalIcon
          className={
            ellipsisOnHover
              ? 'group-focus-within:visible group-hover/track:visible pointer-fine:invisible'
              : ''
          }
        />
      </div>
    )}
    dropDownContent={(
      <div className="[&>button]:hover:bg-neutral-darker/40 flex flex-col [&>button]:justify-start [&>button]:p-4 [&>button]:text-nowrap">
        {children}
      </div>
    )}
  />
);
