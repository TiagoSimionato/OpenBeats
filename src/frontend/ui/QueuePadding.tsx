'use client';

import type { ComponentProps } from 'react';
import { useQueueContext } from 'frontend/contexts/QueueContext';

const getPaddingSize = (length: number) => {
  switch (length) {
    case 0:
      return '';
    case 1:
      return 'pb-40';
    case 2:
      return 'pb-80';
    default:
      return 'pb-90';
  }
};

export const QueuePadding = ({ children, className, ...props }: ComponentProps<'div'>) => {
  const { queue } = useQueueContext();

  return (
    <div aria-hidden className={`${getPaddingSize(queue.length)} ${className}`} {...props}>
      {children}
    </div>
  );
};
