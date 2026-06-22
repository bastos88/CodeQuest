import { Link } from 'react-router-dom';

type BrandLogoProps = {
  to?: string;
  compact?: boolean;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({
  to = '/',
  compact = false,
  className = '',
  imageClassName = '',
}: BrandLogoProps) {
  return (
    <Link
      to={to}
      aria-label="Ir para a pagina inicial do CodeQuest"
      className={[
        'relative inline-flex shrink-0 items-center overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'size-[67px]' : 'size-[77px]',
        className,
      ].join(' ')}
    >
      <img
        src="/images/codequest-hero.png"
        alt="CodeQuest"
        className={[
          'absolute left-1/2 top-1/2 w-[155%] max-w-none -translate-x-1/2 -translate-y-[43%] object-cover mix-blend-screen',
          imageClassName,
        ].join(' ')}
      />
    </Link>
  );
}
