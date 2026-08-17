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
            ellipsisOnHover ? 'invisible group-focus-within:visible group-hover/track:visible' : ''
          }
        />
      </div>
    )}
    dropDownContent={(
      <div className="flex flex-col [&>button]:justify-start [&>button]:p-4 [&>button]:text-nowrap [&>button]:hover:bg-gray-400/40">
        {children}
      </div>
    )}
  />
);
