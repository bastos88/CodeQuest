import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
};

export function ScrollReveal({
  children,
  className = '',
  itemSelector = '[data-scroll-reveal-item]',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || shouldReduceMotion) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const context = gsap.context(() => {
      const markedItems = gsap.utils.toArray<HTMLElement>(
        itemSelector,
        container,
      );
      const targets =
        markedItems.length > 0
          ? markedItems
          : Array.from(container.children).filter(
              (child): child is HTMLElement => child instanceof HTMLElement,
            );

      if (targets.length === 0) return;

      gsap.set(targets, {
        opacity: 0,
        y: 20,
      });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        stagger: Math.min(0.08, 0.4 / targets.length),
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          end: 'top 35%',
          once: true,
        },
      });
    }, container);

    return () => context.revert();
  }, [itemSelector, shouldReduceMotion]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
