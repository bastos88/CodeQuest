'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  wrap,
} from 'framer-motion';
import React from 'react';

interface ScrollBaseAnimationProps {
  children: React.ReactNode;
  baseVelocity?: number;
  scrollDependent?: boolean;
  className?: string;
}

export default function ScrollBaseAnimation({
  children,
  baseVelocity = 2,
  scrollDependent = true,
  className = '',
}: ScrollBaseAnimationProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = React.useState(false);

  const scrollVelocity = useMotionValue(0);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useMotionValue(0);

  const marqueeItems = React.useMemo(() => {
    const flattened = React.Children.toArray(children)
      .flatMap((child) => {
        if (typeof child === 'string') {
          return child
            .split(/\s*[•·|]\s*/g)
            .map((item) => item.trim())
            .filter(Boolean);
        }

        return [child];
      })
      .filter(Boolean);

    return flattened.length > 0 ? flattened : [children];
  }, [children]);

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const updateMobileState = () => setIsMobile(query.matches);

    updateMobileState();
    query.addEventListener('change', updateMobileState);

    return () => query.removeEventListener('change', updateMobileState);
  }, []);

  React.useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      scrollVelocity.set(Math.abs(latest));
    });

    return unsubscribe;
  }, [scrollY, scrollVelocity]);

  React.useEffect(() => {
    const unsubscribe = smoothVelocity.on('change', (latest) => {
      velocityFactor.set(latest / 5000);
    });

    return unsubscribe;
  }, [smoothVelocity, velocityFactor]);

  useAnimationFrame((_, delta) => {
    if (isMobile || shouldReduceMotion) return;

    let moveBy = baseVelocity * (delta / 5000);

    if (scrollDependent) {
      moveBy += moveBy * Math.abs(velocityFactor.get());
    }

    baseX.set(baseX.get() - moveBy);
  });

  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);

  if (isMobile || shouldReduceMotion) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {marqueeItems.map((item, itemIndex) => (
            <span
              key={itemIndex}
              className="
                inline-flex items-center gap-2 whitespace-nowrap
                font-mono text-sm uppercase tracking-[0.08em] text-[#d9ddff]
                before:text-purple-400 before:content-['•']
              "
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform"
        style={{ x }}
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0 items-center gap-8 pr-8"
            aria-hidden={groupIndex === 1}
          >
            {marqueeItems.map((item, itemIndex) => (
              <span
                key={`${groupIndex}-${itemIndex}`}
                className="
                  inline-flex items-center gap-3 whitespace-nowrap
                  font-mono text-[clamp(0.9rem,1.5vw,1.1rem)]
                  uppercase tracking-[0.08em] text-[#d9ddff]
                  before:text-purple-400 before:content-['•']
                  before:[text-shadow:0_0_16px_rgba(217,70,239,0.45)]
                "
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
