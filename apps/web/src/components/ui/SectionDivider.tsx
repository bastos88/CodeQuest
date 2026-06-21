interface SectionDividerProps {
  variant?: 'default' | 'glow' | 'fade' | 'strong';
  className?: string;
}

export function SectionDivider({
  variant = 'default',
  className = '',
}: SectionDividerProps) {
  const variants = {
    default:
      'h-px bg-gradient-to-r from-transparent via-white/10 to-transparent',
    glow: 'h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent shadow-[0_0_24px_rgba(108,99,255,0.18)]',
    fade: 'h-24 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent',
    strong:
      'h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent shadow-[0_0_32px_rgba(139,92,246,0.2)]',
  };

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none relative w-full',
        variants[variant],
        className,
      ].join(' ')}
    />
  );
}
