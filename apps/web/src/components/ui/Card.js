import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Card({ className, ...props }) {
    return (_jsx("div", { className: cn('surface-panel rounded-3xl text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass', className), ...props }));
}
