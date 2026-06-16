import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ScrollBaseAnimation from './ScrollBaseAnimation';
import { SectionDivider } from './ui/SectionDivider';
const technologies = 'HTML • CSS • JavaScript • TypeScript • React • Node.js • PostgreSQL • Firebase • TailwindCSS • Git • APIs REST • Vite';
export default function TechMarqueeSection() {
    return (_jsxs("section", { className: "\n        relative overflow-hidden bg-[#14151C]/50\n        [background:radial-gradient(circle_at_16%_50%,rgba(108,99,255,0.12),transparent_18rem),rgba(20,21,28,0.5)]\n      ", "aria-label": "Tecnologias praticadas na plataforma", children: [_jsx(SectionDivider, { variant: "glow" }), _jsx("div", { className: "mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:px-8", children: _jsx("div", { className: "\n            relative overflow-hidden px-0 py-2\n            [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]\n          ", children: _jsx(ScrollBaseAnimation, { baseVelocity: 2, scrollDependent: true, children: technologies }) }) }), _jsx(SectionDivider, { variant: "default" })] }));
}
