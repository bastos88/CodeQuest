import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'surface-panel rounded-3xl text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass',
        className,
      )}
      {...props}
    />
  );
}
