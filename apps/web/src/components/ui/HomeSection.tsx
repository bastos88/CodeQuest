import type { ReactNode } from 'react';
import { SectionDivider } from './SectionDivider';

type DividerVariant = 'default' | 'glow' | 'fade' | 'strong';

interface HomeSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  divider?: boolean;
  dividerVariant?: DividerVariant;
}

export function HomeSection({
  children,
  id,
  className = '',
  divider = true,
  dividerVariant = 'glow',
}: HomeSectionProps) {
  return (
    <section
      id={id}
      className={[
        'relative overflow-hidden',
        'bg-[radial-gradient(circle_at_50%_0%,rgba(108,99,255,0.06),transparent_28rem)]',
        className,
      ].join(' ')}
    >
      {divider ? <SectionDivider variant={dividerVariant} /> : null}
      {children}
    </section>
  );
}
