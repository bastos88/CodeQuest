import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function ProgressBar({ value, className }) {
    return (_jsx("div", { className: cn('h-2.5 overflow-hidden rounded-full border border-white/6 bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]', className), children: _jsx("div", { className: "h-full rounded-full bg-[linear-gradient(90deg,#6c63ff_0%,#a855f7_55%,#d946ef_100%)] shadow-[0_0_18px_rgba(168,85,247,0.28)] transition-all duration-300 ease-premium", style: { width: `${Math.max(0, Math.min(100, value))}%` } }) }));
}
