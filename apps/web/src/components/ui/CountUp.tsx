import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type CountUpDirection = 'up' | 'down';

type CountUpProps = {
  to: number;
  from?: number;
  direction?: CountUpDirection;
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

function getDecimalPlaces(value: number) {
  const decimals = String(value).split('.')[1];

  return decimals && Number(decimals) !== 0 ? decimals.length : 0;
}

export function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 1.2,
  className = '',
  startWhen = true,
  separator = '',
  prefix = '',
  suffix = '',
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const initialValue = direction === 'down' ? to : from;
  const targetValue = direction === 'down' ? from : to;
  const motionValue = useMotionValue(initialValue);
  const isInView = useInView(ref, {
    once: true,
    margin: '0px 0px -10% 0px',
  });

  const decimalPlaces = useMemo(
    () => Math.max(getDecimalPlaces(from), getDecimalPlaces(to)),
    [from, to],
  );

  const formatValue = useCallback(
    (value: number) => {
      const formattedValue = new Intl.NumberFormat('en-US', {
        useGrouping: Boolean(separator),
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value);
      const numberWithSeparator = separator
        ? formattedValue.replace(/,/g, separator)
        : formattedValue;

      return `${prefix}${numberWithSeparator}${suffix}`;
    },
    [decimalPlaces, prefix, separator, suffix],
  );

  const renderValue = useCallback(
    (value: number) => {
      if (ref.current) ref.current.textContent = formatValue(value);
    },
    [formatValue],
  );

  useEffect(() => {
    motionValue.set(initialValue);
    renderValue(initialValue);
  }, [initialValue, motionValue, renderValue]);

  useEffect(
    () => motionValue.on('change', renderValue),
    [motionValue, renderValue],
  );

  useEffect(() => {
    if (!isInView || !startWhen) return;

    if (shouldReduceMotion) {
      motionValue.set(targetValue);
      renderValue(targetValue);
      onStart?.();
      onEnd?.();
      return;
    }

    motionValue.set(initialValue);
    renderValue(initialValue);

    let stopAnimation: (() => void) | undefined;
    const timerId = window.setTimeout(
      () => {
        onStart?.();
        const controls = animate(initialValue, targetValue, {
          duration: Math.max(duration, 0.1),
          ease: [0.22, 1, 0.36, 1] as const,
          onUpdate: (latestValue) => motionValue.set(latestValue),
          ...(onEnd ? { onComplete: onEnd } : {}),
        });

        stopAnimation = () => controls.stop();
      },
      Math.max(delay, 0) * 1000,
    );

    return () => {
      window.clearTimeout(timerId);
      stopAnimation?.();
    };
  }, [
    delay,
    duration,
    initialValue,
    isInView,
    motionValue,
    onEnd,
    onStart,
    renderValue,
    shouldReduceMotion,
    startWhen,
    targetValue,
  ]);

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className}`} />
  );
}
