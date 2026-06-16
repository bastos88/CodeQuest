import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export const Card = forwardRef(function Card({ className, ...props }, ref) {
    return (_jsx("div", { ref: ref, className: cn('surface-panel rounded-3xl text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass', className), ...props }));
});
