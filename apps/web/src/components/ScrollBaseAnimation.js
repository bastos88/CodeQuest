'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, wrap, } from 'framer-motion';
import React from 'react';
export default function ScrollBaseAnimation({ children, baseVelocity = 2, scrollDependent = true, className = '', }) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
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
    const loopItems = React.useMemo(() => [...marqueeItems, ...marqueeItems], [marqueeItems]);
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
        let moveBy = baseVelocity * (delta / 5000);
        if (scrollDependent) {
            moveBy += moveBy * Math.abs(velocityFactor.get());
        }
        baseX.set(baseX.get() - moveBy);
    });
    const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);
    return (_jsx("div", { className: `relative overflow-hidden ${className}`, children: _jsx(motion.div, { className: "flex w-max items-center gap-8 whitespace-nowrap will-change-transform", style: { x }, children: [0, 1].map((groupIndex) => (_jsx("div", { className: "flex shrink-0 items-center gap-8 pr-8", "aria-hidden": groupIndex === 1, children: loopItems.map((item, itemIndex) => (_jsx("span", { className: "\n                  inline-flex items-center gap-3 whitespace-nowrap\n                  font-mono text-[clamp(0.9rem,1.5vw,1.1rem)]\n                  uppercase tracking-[0.08em] text-[#d9ddff]\n                  before:text-purple-400 before:content-['\u2022']\n                  before:[text-shadow:0_0_16px_rgba(217,70,239,0.45)]\n                ", children: item }, `${groupIndex}-${itemIndex}`))) }, groupIndex))) }) }));
}
