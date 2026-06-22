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
        opacity: 0.02,
        y: 30,
        scale: 0.98,
        filter: 'blur(6px)',
      });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 1.2,
        },
      });

      ScrollTrigger.refresh();
    }, container);

    return () => context.revert();
  }, [itemSelector, shouldReduceMotion]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
