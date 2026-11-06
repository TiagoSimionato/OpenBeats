import type { ComponentProps, DragEvent } from 'react';
import { useState } from 'react';

export type DragoDropProps = ComponentProps<'div'> & {
  dragOverTitle?: string;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
};

export const DragoDrop = ({ className, dragOverTitle, handleDrop, ...props }: DragoDropProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  return (
    <div
      className={[
        className,
        isDraggingOver ? 'relative bg-white/10 ring-2 ring-blue-400' : '',
      ].join(' ')}
      onDragLeave={() => {
        setIsDraggingOver(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setCursor({
          x: event.clientX,
          y: event.clientY,
        });
        setIsDraggingOver(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        handleDrop(event);
        setIsDraggingOver(false);
      }}
      {...props}
    >
      {props.children}

      {isDraggingOver && dragOverTitle && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-gray-600 px-3 py-1 text-sm font-medium text-blue-100 shadow-lg"
          style={{
            left: cursor.x + 60,
            top: cursor.y,
          }}
        >
          {dragOverTitle}
        </div>
      )}
    </div>
  );
};
