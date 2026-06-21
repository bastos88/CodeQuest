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
        'inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      ].join(' ')}
    >
      <img
        src="/images/logo-codequest-compact.jpg"
        alt="CodeQuest"
        className={[
          compact ? 'h-9 w-36' : 'h-12 w-48',
          'rounded-md object-contain shadow-[0_0_24px_rgba(91,107,255,0.22)]',
          imageClassName,
        ].join(' ')}
      />
    </Link>
  );
}
