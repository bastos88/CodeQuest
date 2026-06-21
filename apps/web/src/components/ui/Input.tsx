import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={cn(
      'field hover:border-white/12 focus:border-primary aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger/5',
      className,
    )}
  />
));

Input.displayName = 'Input';
