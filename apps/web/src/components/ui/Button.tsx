import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info' | 'app';
  loading?: boolean;
  loadingText?: string;
};

export const appButtonVariantClasses = [
  'border border-[#2A2D38] bg-[#14151C] text-zinc-100',
  'transition-colors transition-transform duration-200',
  'hover:border-[#5B6BFF]/60',
  'hover:bg-[#1E2029]',
  'hover:text-white',
  'hover:-translate-y-0.5',
  'active:translate-y-0',
  'active:scale-[0.98]',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-[#5B6BFF]',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-[#0A0B0F]',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ');

const secondaryWrapperClasses = [
  'group relative isolate overflow-visible rounded-xl border border-transparent',
  'bg-[#2A2D38]',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  'p-px transition-[padding,transform,background-color] duration-300 ease-out',
  'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-xl',
  'before:bg-[linear-gradient(90deg,#5B6BFF_0%,#22D3EE_48%,#D946EF_100%)]',
  'before:opacity-0 before:blur-xl before:transition-opacity before:duration-300',
  'enabled:hover:p-[3px] enabled:hover:bg-[linear-gradient(90deg,#5B6BFF_0%,#22D3EE_48%,#D946EF_100%)]',
  'enabled:hover:-translate-y-0.5 enabled:hover:before:opacity-45',
  'enabled:active:translate-y-0 enabled:active:scale-[0.98] enabled:active:before:opacity-20',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B6BFF]',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0F]',
  'disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:before:opacity-0',
].join(' ');

const secondaryInnerClasses = [
  'relative z-10 inline-flex h-full w-full items-center justify-center gap-2 rounded-[9px]',
  'bg-[#14151C] px-5 text-zinc-100',
  'transition-colors duration-200',
  'group-hover:bg-[#1E2029] group-hover:text-white',
  'group-disabled:bg-[#14151C] group-disabled:text-zinc-100',
].join(' ');

export function Button({
  className,
  variant = 'primary',
  loading = false,
  loadingText = 'Carregando...',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'border border-primary/40 bg-[linear-gradient(135deg,#6c63ff_0%,#a855f7_52%,#d946ef_100%)] text-white shadow-[0_14px_34px_rgba(93,76,255,0.28)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(93,76,255,0.36)]',
    ghost:
      'border border-transparent bg-transparent text-textSecondary hover:-translate-y-0.5 hover:border-white/8 hover:bg-white/[0.05] hover:text-textPrimary',
    danger:
      'border border-danger/40 bg-[linear-gradient(180deg,rgba(239,68,68,0.22),rgba(239,68,68,0.14))] text-white hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(239,68,68,0.3),rgba(239,68,68,0.18))]',
    info: 'border border-info/30 bg-[linear-gradient(180deg,rgba(59,130,246,0.18),rgba(59,130,246,0.12))] text-white hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(59,130,246,0.28),rgba(59,130,246,0.16))]',
    app: appButtonVariantClasses,
  };

  if (variant === 'secondary') {
    return (
      <button
        className={cn(
          'inline-flex h-11 items-center justify-center text-sm font-semibold tracking-[-0.01em] disabled:cursor-not-allowed',
          className,
          secondaryWrapperClasses,
          loading ? 'pointer-events-none' : '',
        )}
        disabled={disabled || loading}
        {...props}
      >
        <span className={secondaryInnerClasses}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>{loadingText}</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold tracking-[-0.01em] transition duration-150 ease-premium disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50',
        variants[variant],
        loading ? 'pointer-events-none' : '',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
