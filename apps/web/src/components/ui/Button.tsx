import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';
  loading?: boolean;
  loadingText?: string;
};

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
    secondary:
      'border border-white/10 bg-[linear-gradient(180deg,rgba(30,32,41,0.95),rgba(20,21,28,0.92))] text-textPrimary shadow-soft hover:-translate-y-0.5 hover:border-borderStrong hover:bg-[linear-gradient(180deg,rgba(36,39,51,0.96),rgba(22,24,32,0.94))]',
    ghost:
      'border border-transparent bg-transparent text-textSecondary hover:-translate-y-0.5 hover:border-white/8 hover:bg-white/[0.05] hover:text-textPrimary',
    danger:
      'border border-danger/40 bg-[linear-gradient(180deg,rgba(239,68,68,0.22),rgba(239,68,68,0.14))] text-white hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(239,68,68,0.3),rgba(239,68,68,0.18))]',
    info:
      'border border-info/30 bg-[linear-gradient(180deg,rgba(59,130,246,0.18),rgba(59,130,246,0.12))] text-white hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(59,130,246,0.28),rgba(59,130,246,0.16))]',
  };

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
