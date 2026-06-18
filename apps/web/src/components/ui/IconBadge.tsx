import type { LucideIcon } from 'lucide-react';

type IconBadgeVariant =
  | 'indigo'
  | 'violet'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'slate';
type IconBadgeSize = 'sm' | 'md' | 'lg';

type IconBadgeProps = {
  icon: LucideIcon;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
  className?: string;
};

const variants: Record<IconBadgeVariant, string> = {
  indigo: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-300',
  violet: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
  cyan: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-300',
  emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  red: 'border-red-400/20 bg-red-500/10 text-red-300',
  slate: 'border-white/10 bg-white/[0.04] text-slate-400',
};

const sizes: Record<IconBadgeSize, string> = {
  sm: 'h-8 w-8 rounded-xl [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-10 w-10 rounded-2xl [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 w-12 rounded-2xl [&_svg]:h-6 [&_svg]:w-6',
};

export function IconBadge({
  icon: Icon,
  variant = 'indigo',
  size = 'md',
  className = '',
}: IconBadgeProps) {
  return (
    <div
      className={`grid shrink-0 place-items-center border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <Icon aria-hidden="true" />
    </div>
  );
}
