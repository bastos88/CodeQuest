import { memo, useEffect, useMemo, useState, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

type StarsBackgroundProps = {
  className?: string;
  starCount?: number;
};

type Star = {
  id: number;
  left: string;
  top: string;
  size: string;
  opacity: number;
  delay: string;
  duration: string;
};

type StarStyle = CSSProperties & {
  '--halo-star-opacity': number;
  '--halo-star-duration': string;
};

export const StarsBackground = memo(function StarsBackground({
  className,
  starCount = 55,
}: StarsBackgroundProps) {
  const [prefersLightMotion, setPrefersLightMotion] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const updateMotionPreference = () => {
      setPrefersLightMotion(mobileQuery.matches || reducedMotionQuery.matches);
    };

    updateMotionPreference();
    mobileQuery.addEventListener('change', updateMotionPreference);
    reducedMotionQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mobileQuery.removeEventListener('change', updateMotionPreference);
      reducedMotionQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  const effectiveStarCount = prefersLightMotion
    ? Math.min(starCount, 32)
    : Math.min(starCount, 60);

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: Math.max(0, effectiveStarCount) }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 2 + 1}px`,
        opacity: Math.random() * 0.5 + 0.35,
        delay: `${Math.random() * 4}s`,
        duration: `${Math.random() * 3 + 2.5}s`,
      })),
    [effectiveStarCount],
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        'bg-[radial-gradient(ellipse_at_bottom,_#1E2029_0%,_#0A0B0F_65%,_#06070A_100%)]',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(91,107,255,0.16),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(34,211,238,0.08),transparent_28%)]" />

      {stars.map((star) => (
        <span
          key={star.id}
          className={cn(
            'absolute rounded-full bg-white',
            prefersLightMotion ? '' : 'halo-star',
          )}
          style={
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              '--halo-star-opacity': star.opacity,
              '--halo-star-duration': star.duration,
            } as StarStyle
          }
        />
      ))}
    </div>
  );
});
