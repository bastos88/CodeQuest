import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function createAvatar(name, accent) {
    const initials = name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#11131a" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" rx="36" fill="url(#bg)" />
      <text
        x="50%"
        y="53%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#f8fafc"
        font-family="Inter, Arial, sans-serif"
        font-size="24"
        font-weight="700"
      >
        ${initials}
      </text>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const defaultTestimonials = [
    {
        id: '1',
        description: 'A plataforma me ajudou a revisar JavaScript com mais consistência e perceber onde eu realmente errava.',
        name: 'Ana Martins',
        company: 'Front-End Student',
        image: createAvatar('Ana Martins', '#6d5efc'),
    },
    {
        id: '2',
        description: 'Gostei porque as respostas mudam de ordem. Isso força a estudar o conceito, não decorar alternativa.',
        name: 'Rafael Costa',
        company: 'React Developer',
        image: createAvatar('Rafael Costa', '#4f8cff'),
    },
    {
        id: '3',
        description: 'O sistema de categorias facilita muito. Consigo focar só em TypeScript quando estou fraco no tema.',
        name: 'Beatriz Lima',
        company: 'Full Stack Student',
        image: createAvatar('Beatriz Lima', '#7c3aed'),
    },
    {
        id: '4',
        description: 'A ideia de não mostrar a resposta correta quando erro me obriga a voltar no conteúdo e estudar de verdade.',
        name: 'Lucas Ferreira',
        company: 'Back-End Student',
        image: createAvatar('Lucas Ferreira', '#0f766e'),
    },
    {
        id: '5',
        description: 'O ranking e a arena deixam o treino mais vivo. Parece estudo, mas com sensação real de desafio.',
        name: 'Mariana Alves',
        company: 'Computer Science Student',
        image: createAvatar('Mariana Alves', '#9333ea'),
    },
    {
        id: '6',
        description: 'Uso para aquecer antes de entrevistas técnicas. Ajuda principalmente no tempo de resposta.',
        name: 'Pedro Nunes',
        company: 'Junior Developer',
        image: createAvatar('Pedro Nunes', '#2563eb'),
    },
    {
        id: '7',
        description: 'A interface escura e os cards tornam o estudo mais agradável. Dá vontade de continuar praticando.',
        name: 'Camila Rocha',
        company: 'UI Developer',
        image: createAvatar('Camila Rocha', '#c026d3'),
    },
    {
        id: '8',
        description: 'O histórico de desempenho mostra claramente quais temas preciso reforçar antes de avançar.',
        name: 'Gustavo Almeida',
        company: 'Software Student',
        image: createAvatar('Gustavo Almeida', '#0891b2'),
    },
    {
        id: '9',
        description: 'É direto ao ponto. Escolho tema, dificuldade, quantidade de perguntas e começo a praticar.',
        name: 'Larissa Souza',
        company: 'Web Developer',
        image: createAvatar('Larissa Souza', '#6366f1'),
    },
];
const testimonialColumns = [
    {
        start: 0,
        end: 3,
        className: 'testimonial-scroll-1',
    },
    {
        start: 3,
        end: 6,
        className: 'testimonial-scroll-2 max-[700px]:hidden',
    },
    {
        start: 6,
        end: 9,
        className: 'testimonial-scroll-3 max-[1080px]:hidden',
    },
];
export default function TestimonialsSection({ testimonials = defaultTestimonials, }) {
    return (_jsx("section", { className: "relative py-16 md:py-24", "aria-labelledby": "testimonials-title", children: _jsxs("div", { className: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mx-auto mb-12 max-w-3xl text-center", children: [_jsx("span", { className: "font-mono text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300", children: "Depoimentos" }), _jsx("h2", { id: "testimonials-title", className: "mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl", children: "\u00DAltimos depoimentos" }), _jsx("p", { className: "mt-4 text-base leading-7 text-slate-400 md:text-lg", children: "Relatos de devs usando a plataforma para praticar, revisar e ganhar tempo de resposta." })] }), _jsxs("div", { className: "\n            testimonial-marquee\n            relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl\n            bg-black/20\n            [background:radial-gradient(circle_at_50%_0%,rgba(108,99,255,0.12),transparent_22rem),rgba(0,0,0,0.16)]\n          ", "aria-label": "Depoimentos da comunidade", children: [_jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute left-0 right-0 top-0 z-10 h-32 bg-gradient-to-b from-[#0A0B0F] to-transparent" }), _jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-[#0A0B0F] to-transparent" }), _jsx("div", { className: "grid h-[600px] grid-cols-3 gap-4 overflow-hidden px-1 max-[1080px]:grid-cols-2 max-[700px]:h-[560px] max-[700px]:grid-cols-1", children: testimonialColumns.map((column) => {
                                const items = testimonials.slice(column.start, column.end);
                                const duplicatedItems = [...items, ...items];
                                return (_jsx("div", { className: `grid content-start gap-4 will-change-transform ${column.className}`, children: duplicatedItems.map((testimonial, index) => (_jsxs("article", { className: "\n                        mb-4 grid min-w-0 gap-5 rounded-2xl border border-slate-400/20\n                        bg-[linear-gradient(180deg,#020204_0%,rgba(25,17,48,0.86)_100%)]\n                        p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]\n                        transition duration-300 ease-out\n                        hover:-translate-y-0.5 hover:border-purple-400/40\n                        hover:shadow-[0_24px_64px_rgba(0,0,0,0.28),0_0_42px_rgba(108,99,255,0.12)]\n                        max-[700px]:p-5\n                      ", children: [_jsx("div", { className: "text-white/70", "aria-hidden": "true", children: _jsx("svg", { width: "21", height: "15", viewBox: "0 0 21 15", fill: "none", children: _jsx("path", { d: "M7 13.056c.464 0 .91-.131 1.237-.364.329-.234.513-.55.513-.88v-3.73c0-.33-.184-.647-.513-.88C7.91 6.97 7.464 6.838 7 6.838c-.232 0-.455-.066-.619-.182-.164-.117-.256-.275-.256-.44v-.622c0-.33.184-.646.513-.879.328-.233.773-.364 1.237-.364.232 0 .455-.066.619-.182.164-.117.256-.275.256-.44V2.485c0-.165-.092-.323-.256-.44a1.1 1.1 0 0 0-.619-.181c-1.392 0-2.728.393-3.712 1.092-.985.7-1.538 1.649-1.538 2.638v6.218c0 .33.184.646.513.88.328.233.773.364 1.237.364zm9.83 0c.465 0 .91-.131 1.238-.364.328-.234.513-.55.513-.88v-3.73c0-.33-.184-.647-.513-.88-.328-.233-.773-.364-1.237-.364-.232 0-.455-.066-.619-.182-.164-.117-.256-.275-.256-.44v-.622c0-.33.184-.646.512-.879.329-.233.774-.364 1.238-.364.232 0 .454-.066.619-.182.164-.117.256-.275.256-.44V2.485c0-.165-.092-.323-.256-.44a1.1 1.1 0 0 0-.62-.181c-1.391 0-2.727.393-3.711 1.092-.985.7-1.538 1.649-1.538 2.638v6.218c0 .33.184.646.512.88.329.233.774.364 1.238.364z", stroke: "currentColor", strokeOpacity: ".72", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsx("p", { className: "m-0 text-sm leading-7 text-slate-400", children: testimonial.description }), _jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("img", { src: testimonial.image, alt: testimonial.name, className: "h-9 w-9 shrink-0 rounded-full border border-slate-400/25 bg-slate-900 object-cover" }), _jsxs("div", { className: "min-w-0", children: [_jsx("strong", { className: "block text-sm font-semibold text-slate-100", children: testimonial.name }), _jsx("span", { className: "block truncate text-sm text-slate-500", children: testimonial.company })] })] })] }, `${testimonial.id}-${index}`))) }, `${column.start}-${column.end}`));
                            }) })] })] }) }));
}
