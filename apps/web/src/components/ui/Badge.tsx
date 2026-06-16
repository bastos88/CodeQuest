import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
};

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  const tones = {
    default: 'border-white/10 bg-white/[0.05] text-textSecondary',
    info: 'border-info/25 bg-info/10 text-info',
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    danger: 'border-danger/25 bg-danger/10 text-danger',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
