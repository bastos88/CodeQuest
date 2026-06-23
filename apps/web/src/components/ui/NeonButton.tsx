import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { appButtonVariantClasses } from './Button';

export type NeonButtonVariant = 'primary' | 'secondary' | 'ghost' | 'app';
export type NeonButtonSize = 'sm' | 'md' | 'lg';

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
};

const baseClasses = [
  'group relative isolate inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold',
  'transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out active:scale-[0.98]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B6BFF]',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0F]',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
].join(' ');

const variantClasses: Record<NeonButtonVariant, string> = {
  primary: [
    'overflow-visible border border-transparent bg-transparent text-white',
    'shadow-[0_12px_32px_rgba(34,211,238,0.12),0_8px_28px_rgba(91,107,255,0.18)]',
    'before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]',
    'before:bg-[linear-gradient(-45deg,#5B6BFF_0%,#22D3EE_100%)]',
    'before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
    'after:pointer-events-none after:absolute after:inset-[2px] after:z-[1] after:rounded-md after:bg-[#0A0B0F]',
    'hover:shadow-[0_14px_38px_rgba(34,211,238,0.2),0_10px_34px_rgba(91,107,255,0.28)]',
    'motion-safe:hover:before:rotate-180',
  ].join(' '),
  secondary: [
    'border border-[#2A2D38] bg-[#14151C] text-white',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
    'hover:-translate-y-0.5 hover:border-[#3A4050] hover:bg-[#1E2029]',
  ].join(' '),
  ghost: [
    'border border-transparent bg-transparent text-[#7DE7F4]',
    'hover:bg-[rgba(91,107,255,0.1)] hover:text-white',
  ].join(' '),
  app: appButtonVariantClasses,
};

const sizeClasses: Record<NeonButtonSize, string> = {
  sm: 'h-9 min-w-24 rounded-lg px-4 text-xs',
  md: 'h-11 min-w-32 rounded-lg px-5 text-sm',
  lg: 'h-14 min-w-40 rounded-lg px-6 text-base',
};

export function neonButtonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  className?: string | undefined;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function NeonButton({
  children,
  className,
  disabled,
  isLoading = false,
  leftIcon,
  rightIcon,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: NeonButtonProps) {
  return (
    <button
      type={type}
      className={neonButtonClassName({ variant, size, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      <span className="relative z-10 inline-flex min-w-0 items-center justify-center gap-2">
        {isLoading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/25 border-t-white motion-reduce:animate-none"
            />
            <span className="sr-only">Carregando: </span>
          </>
        ) : leftIcon ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        <span className="min-w-0">{children}</span>

        {rightIcon ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </button>
  );
}
