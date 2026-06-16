import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Github, Linkedin, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
const iconStyles = {
    whatsapp: 'border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.08)] text-[#86EFAC] hover:border-[rgba(34,197,94,0.42)] hover:bg-[rgba(34,197,94,0.16)]',
    linkedin: 'border-[rgba(59,130,246,0.24)] bg-[rgba(59,130,246,0.08)] text-[#93C5FD] hover:border-[rgba(59,130,246,0.44)] hover:bg-[rgba(59,130,246,0.16)]',
    github: 'border-[rgba(148,163,184,0.22)] bg-[rgba(148,163,184,0.08)] text-[#CBD5E1] hover:border-[rgba(148,163,184,0.42)] hover:bg-[rgba(148,163,184,0.14)]',
    google: 'border-[rgba(91,107,255,0.22)] bg-[rgba(91,107,255,0.08)] text-[#EEF2FF] hover:border-[rgba(91,107,255,0.42)] hover:bg-[rgba(91,107,255,0.15)]',
};
const authStyles = {
    whatsapp: iconStyles.whatsapp,
    linkedin: iconStyles.linkedin,
    github: 'border-[rgba(148,163,184,0.22)] bg-[rgba(148,163,184,0.08)] text-[#E5E7EB] hover:border-[rgba(148,163,184,0.42)] hover:bg-[rgba(148,163,184,0.14)] hover:shadow-[0_14px_36px_rgba(15,23,42,0.35)]',
    google: 'border-[rgba(91,107,255,0.22)] bg-[rgba(91,107,255,0.08)] text-[#EEF2FF] hover:border-[rgba(91,107,255,0.42)] hover:bg-[rgba(91,107,255,0.15)] hover:shadow-[0_14px_36px_rgba(91,107,255,0.18)]',
};
function SocialAction({ type, label, icon, href, onClick, variant, ...props }) {
    const iconNode = (_jsx("span", { "aria-hidden": "true", className: cn('grid shrink-0 place-items-center', variant === 'auth' ? 'h-5 w-5 [&_svg]:h-5 [&_svg]:w-5' : 'h-6 w-6 [&_svg]:h-5 [&_svg]:w-5'), children: icon }));
    const className = cn('inline-flex items-center justify-center border font-semibold transition-[background,border-color,color,transform,box-shadow,filter] duration-200 ease-in-out', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background', 'disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0', variant === 'auth'
        ? cn('min-h-11 w-full gap-2.5 rounded-[14px] px-4 text-sm', authStyles[type], 'hover:-translate-y-px')
        : cn('h-12 w-12 rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]', iconStyles[type], 'hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(91,107,255,0.18)] hover:brightness-110'));
    if (href) {
        const anchorProps = {
            href,
            'aria-label': variant === 'auth' ? undefined : label,
            target: '_blank',
            rel: 'noreferrer noopener',
            className,
        };
        return (_jsxs("a", { ...anchorProps, children: [iconNode, variant === 'auth' ? _jsx("span", { children: label }) : null] }));
    }
    return (_jsxs("button", { type: "button", "aria-label": variant === 'auth' ? undefined : label, onClick: onClick, className: className, disabled: !onClick, ...props, children: [iconNode, variant === 'auth' ? _jsx("span", { children: label }) : null] }));
}
export default function SocialButtons({ buttons, className = '', variant = 'icon' }) {
    const items = buttons ?? [
        {
            type: 'whatsapp',
            label: 'Abrir WhatsApp',
            href: 'https://wa.me/351920055981',
            icon: _jsx(MessageCircle, { strokeWidth: 2.2 }),
        },
        {
            type: 'linkedin',
            label: 'Abrir LinkedIn',
            href: 'https://www.linkedin.com/in/leoonardobastos/',
            icon: _jsx(Linkedin, { strokeWidth: 2.2 }),
        },
        {
            type: 'github',
            label: 'Abrir GitHub',
            href: 'https://github.com/bastos88',
            icon: _jsx(Github, { strokeWidth: 2.2 }),
        },
    ];
    return (_jsx("div", { className: cn(variant === 'auth' ? 'grid gap-3' : 'flex flex-row flex-wrap gap-2', className), children: items.map((item) => (_jsx(SocialAction, { ...item, variant: variant }, item.type))) }));
}
export function GithubIcon() {
    return _jsx(Github, { "aria-hidden": "true", strokeWidth: 2.2 });
}
export function GoogleIcon() {
    return (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { fill: "currentColor", d: "M21.35 11.1H12v2.95h5.35c-.23 1.5-1.62 4.4-5.35 4.4a6.22 6.22 0 0 1-6.27-6.45A6.22 6.22 0 0 1 12 5.55c1.83 0 3.05.78 3.75 1.45l2.55-2.46A9.96 9.96 0 0 0 12 2.1 9.88 9.88 0 0 0 2 12a9.88 9.88 0 0 0 10 9.9c5.77 0 9.6-4.05 9.6-9.75 0-.65-.07-1.15-.25-1.05Z" }) }));
}
