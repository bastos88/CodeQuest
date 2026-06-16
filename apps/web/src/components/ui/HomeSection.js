import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SectionDivider } from './SectionDivider';
export function HomeSection({ children, id, className = '', divider = true, dividerVariant = 'glow', }) {
    return (_jsxs("section", { id: id, className: [
            'relative overflow-hidden',
            'bg-[radial-gradient(circle_at_50%_0%,rgba(108,99,255,0.06),transparent_28rem)]',
            className,
        ].join(' '), children: [divider ? _jsx(SectionDivider, { variant: dividerVariant }) : null, children] }));
}
