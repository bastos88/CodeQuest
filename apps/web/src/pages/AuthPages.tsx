import { useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ValidationError, useForm as useFormspree } from '@formspree/react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Layers3,
  Lock,
  LogIn,
  Mail,
  MessageSquarePlus,
  Send,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@codequest/shared';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BrandLogo } from '../components/BrandLogo';
import { HomeRankingSection } from '../components/home/HomeRankingSection';
import TechMarqueeSection from '../components/TechMarqueeSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HomeSection } from '../components/ui/HomeSection';
import { IconBadge } from '../components/ui/IconBadge';
import { Input } from '../components/ui/Input';
import { SectionDivider } from '../components/ui/SectionDivider';
import SocialButtons, {
  GithubIcon,
  GoogleIcon,
  type SocialButton,
} from '../components/ui/SocialButtons';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

const steps = [
  {
    index: '01',
    title: 'Escolha uma categoria',
    description:
      'Selecione a trilha que faz sentido para sua entrevista, revisão ou rotina de estudo.',
    icon: Layers3,
    variant: 'indigo',
  },
  {
    index: '02',
    title: 'Defina a dificuldade',
    description:
      'Ajuste o nível para iniciantes, intermediário ou avançado sem sair do fluxo.',
    icon: Sparkles,
    variant: 'violet',
  },
  {
    index: '03',
    title: 'Responda ao quiz',
    description:
      'Resolva perguntas objetivas, código e conceitos com feedback direto.',
    icon: Brain,
    variant: 'cyan',
  },
  {
    index: '04',
    title: 'Analise seu desempenho',
    description:
      'Veja acertos, erros, tempo, categorias fortes e pontos que pedem revisão.',
    icon: BarChart3,
    variant: 'emerald',
  },
] satisfies Array<{
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant: 'indigo' | 'violet' | 'cyan' | 'emerald';
}>;

const features = [
  {
    title: 'Quiz inteligente',
    subtitle: '40 perguntas',
    description:
      'Sessões guiadas por categoria, dificuldade, quantidade de perguntas e foco técnico.',
    accent: true,
    icon: Brain,
    variant: 'indigo',
  },
  {
    title: 'Arena',
    subtitle: 'Em breve',
    description: 'Modo competitivo em desenvolvimento e validação.',
    accent: false,
    icon: Swords,
    variant: 'red',
  },
  {
    title: 'Ranking',
    subtitle: 'Top 10',
    description: 'Evolução visível com Elo, posições e consistência.',
    accent: false,
    icon: Trophy,
    variant: 'amber',
  },
  {
    title: 'Contribuições',
    subtitle: 'Review flow',
    description: 'Crie perguntas e peça à comunidade para refinar melhor.',
    accent: false,
    icon: MessageSquarePlus,
    variant: 'emerald',
  },
] satisfies Array<{
  title: string;
  subtitle: string;
  description: string;
  accent: boolean;
  icon: LucideIcon;
  variant: 'indigo' | 'red' | 'amber' | 'emerald';
}>;

const contributionFlow = [
  {
    status: 'Draft',
    tone: 'text-textSecondary',
    description: 'Crie e refine antes do envio.',
    icon: Code2,
    variant: 'slate',
  },
  {
    status: 'Pending Review',
    tone: 'text-warning',
    description: 'Aguarde curadoria e feedback.',
    icon: AlertCircle,
    variant: 'amber',
  },
  {
    status: 'Approved',
    tone: 'text-success',
    description: 'A pergunta entra no sistema.',
    icon: CheckCircle2,
    variant: 'emerald',
  },
  {
    status: 'Rejected',
    tone: 'text-danger',
    description: 'Revise pontos indicados.',
    icon: XCircle,
    variant: 'red',
  },
] satisfies Array<{
  status: string;
  tone: string;
  description: string;
  icon: LucideIcon;
  variant: 'slate' | 'amber' | 'emerald' | 'red';
}>;

type HomeStats = {
  questions: number;
  categories: number;
  users: number;
  quizzes: number;
  challenges: number;
  contributions: number;
};

const fallbackStats: HomeStats = {
  questions: 0,
  categories: 0,
  users: 0,
  quizzes: 0,
  challenges: 0,
  contributions: 0,
};

const footerSections = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Quiz', to: '/quiz' },
      { label: 'Arena', to: '/arena' },
      { label: 'Ranking', to: '/ranking' },
      { label: 'Contribuir', to: '/contribuir' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', to: '/sobre' },
      { label: 'Termos', to: '/termos' },
      { label: 'Privacidade', to: '/privacidade' },
      { label: 'GitHub', href: 'https://github.com/bastos88' },
    ],
  },
];

const publicNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Quiz', to: '/quiz' },
  { label: 'Arena', to: '/arena' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Contribuir', to: '/contribuir' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Dashboard', to: '/dashboard' },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-full border px-3.5 py-2 transition-[background,border-color,color] duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isActive
      ? 'border-primary/30 bg-primary/15 text-white'
      : 'border-transparent text-textSecondary hover:bg-primary/10 hover:text-white',
  ].join(' ');
}

function formatCount(value: number) {
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000)
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

function getAuthUrl(provider: 'github' | 'google') {
  return `${import.meta.env.VITE_API_URL}/auth/${provider}`;
}

function MarqueeSurface({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/10 bg-[#14151C]/50',
        '[background:radial-gradient(circle_at_16%_50%,rgba(108,99,255,0.12),transparent_18rem),rgba(20,21,28,0.5)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: statsData } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data } = await api.get<HomeStats>('/public/stats');
      return data;
    },
    staleTime: 60_000,
  });

  const stats = statsData ?? fallbackStats;
  const heroMetrics = useMemo(
    () => [
      { value: formatCount(stats.questions), label: 'perguntas' },
      { value: formatCount(stats.challenges), label: 'desafios' },
      { value: formatCount(stats.categories), label: 'categorias' },
      { value: formatCount(stats.users), label: 'usuarios' },
    ],
    [stats],
  );
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,107,255,0.2),transparent_26rem),radial-gradient(circle_at_80%_10%,rgba(125,92,255,0.14),transparent_30rem)]" />

        <header className="relative border-b border-white/6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <BrandLogo compact imageClassName="h-9 w-36" />

            <nav className="hidden items-center gap-1 text-[11px] font-semibold lg:flex">
              {publicNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {loading ? (
                <span className="hidden rounded-full px-3.5 py-2 text-xs font-semibold text-textSecondary sm:inline-flex">
                  Carregando...
                </span>
              ) : isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex rounded-full px-2.5 py-2 text-xs font-semibold text-textPrimary transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 sm:px-3.5"
                  >
                    {user.name}
                  </Link>

                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="group inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-textPrimary transition hover:-translate-y-px hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex rounded-full px-2.5 py-2 text-xs font-semibold text-textPrimary transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 sm:px-3.5"
                  >
                    Entrar
                  </Link>

                  <Link
                    to="/register"
                    className="group inline-flex h-9 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5B6BFF,#7C3AED)] px-4 text-xs font-semibold text-white shadow-[0_14px_36px_rgba(91,107,255,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(91,107,255,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Começar agora
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr]">
            <div>
              <div className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
                Plataforma para entrevistas técnicas
              </div>
              <h1 className="mt-8 max-w-xl text-5xl font-extrabold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.4rem]">
                Aprenda.
                <br />
                Compita.
                <br />
                <span className="text-[#9c8cff]">Evolua.</span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-7 text-textSecondary sm:text-base">
                Pratique com quizzes inteligentes, suba no Ranking e evolua
                através de XP, revisão e comunidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(91,107,255,0.45)] transition hover:bg-primaryHover"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Começar agora
                </Link>
                <a
                  href="#funcionalidades"
                  className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-textPrimary transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Explorar perguntas
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
              <SectionDivider variant="default" className="mt-10" />
              <div className="grid gap-3 pt-6 sm:grid-cols-4">
                {heroMetrics.map((item) => (
                  <MarqueeSurface key={item.label} className="px-4 py-4">
                    <div className="text-lg font-bold text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-textMuted">
                      {item.label}
                    </div>
                  </MarqueeSurface>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -left-4 top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute right-6 top-4 h-32 w-32 rounded-full bg-[#8e6dff]/20 blur-3xl"
              />
              <MarqueeSurface className="relative rounded-[2rem] border-primary/40 p-3 shadow-[0_0_0_1px_rgba(116,94,255,0.08),0_30px_120px_rgba(31,20,84,0.55)]">
                <div
                  aria-hidden="true"
                  className="absolute inset-6 rounded-[1.5rem] border border-primary/25"
                />
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(91,107,255,0.16),transparent_16rem),linear-gradient(180deg,#141625_0%,#0d0f18_100%)]">
                  <img
                    src="/images/quiz-hero-optimized.jpg"
                    alt="Interface gamificada do quiz mostrando progresso, XP, perguntas e ranking"
                    className="block aspect-[4/3] w-full max-w-full rounded-[1.35rem] object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </MarqueeSurface>
            </div>
          </div>
        </section>
      </div>

      <TechMarqueeSection />

      <HomeSection id="dashboard">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Como funciona"
            title="Um fluxo simples para estudar todos os dias"
            description="Da escolha do tema até a análise de desempenho, cada etapa foi desenhada para tirar atrito da prática."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {steps.map((step) => (
              <MarqueeSurface key={step.index} className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a38dff]">
                    {step.index}
                  </div>
                  <IconBadge
                    icon={step.icon}
                    variant={step.variant}
                    size="sm"
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-textSecondary">
                  {step.description}
                </p>
              </MarqueeSurface>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection id="funcionalidades">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Funcionalidades"
            title="Tudo que transforma estudo em progresso"
            description="Escolha um recurso para ver como ele ajuda a praticar, competir ou contribuir."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-[1.08fr_1.25fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <MarqueeSurface
                  key={feature.title}
                  className={[
                    'min-h-[190px] p-5 transition hover:-translate-y-0.5',
                    feature.accent
                      ? 'bg-[linear-gradient(180deg,rgba(80,50,168,0.3),rgba(34,25,59,0.52))] shadow-[inset_0_0_0_1px_rgba(126,99,255,0.18)]'
                      : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#9f8fff]">
                        {feature.title}
                      </div>
                      <div className="mt-1 text-xs font-medium text-textSecondary">
                        {feature.subtitle}
                      </div>
                    </div>
                    <IconBadge
                      icon={feature.icon}
                      variant={feature.variant}
                      size="sm"
                    />
                  </div>
                  <p className="mt-6 max-w-[18rem] text-sm leading-6 text-textSecondary">
                    {feature.description}
                  </p>
                </MarqueeSurface>
              ))}
            </div>

            <MarqueeSurface className="p-7">
              <div className="flex items-center gap-3">
                <IconBadge icon={Brain} variant="indigo" size="sm" />
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9f8fff]">
                  Quiz inteligente
                </div>
              </div>
              <h3 className="mt-4 max-w-lg text-2xl font-bold text-white">
                Monte simulações rápidas ou completas, receba feedback visual e
                transforme respostas em histórico mensurável.
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-textSecondary">
                O mesmo design system conecta páginas, cards, tabelas e feedback
                para manter a experiência previsível e profissional.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Filtros claros', 'Feedback direto', 'Sessões flexíveis'].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-textSecondary"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <MetricPanel
                  label="Perguntas"
                  value={formatCount(stats.questions)}
                  note="aprovadas"
                  icon={Brain}
                />
                <MetricPanel
                  label="Categorias"
                  value={formatCount(stats.categories)}
                  note="ativas"
                  icon={Layers3}
                />
              </div>
            </MarqueeSurface>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="arena" dividerVariant="strong">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Arena e competição"
              title="Treine sob pressão e veja sua evolução pública"
              description="Desafios, rankings por categoria, sequência de vitórias e XP dão ritmo ao aprendizado."
            />
          </div>
          <MarqueeSurface className="rounded-[1.75rem] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreBox label="Você" value="8" />
              <ScoreBox label="Rival" value="6" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-24 items-end gap-3">
                {[72, 54, 86, 63, 76].map((height, index) => (
                  <div
                    key={height}
                    className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#6985ff,#5b6bff)]"
                    style={{ height: `${height}%` }}
                  >
                    <div className="sr-only">Barra {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <MetricPanel
                label="Desafios"
                value={formatCount(stats.challenges)}
                note="ativos"
                icon={Swords}
                compact
              />
              <MetricPanel
                label="Ranking global"
                value={formatCount(stats.users)}
                note="online"
                icon={Trophy}
                compact
              />
              <MetricPanel
                label="Sequência"
                value="—"
                note="planejado"
                icon={Target}
                compact
              />
              <MetricPanel
                label="XP"
                value="—"
                note="planejado"
                icon={Zap}
                compact
              />
            </div>
          </MarqueeSurface>
        </div>
      </HomeSection>

      <HomeSection id="contribuir">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="Base colaborativa"
                title="A comunidade ajuda o banco de perguntas a crescer"
                description="Crie, envie para revisão, receba aprovação e publique perguntas úteis para outros devs."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contributionFlow.map((item) => (
                <MarqueeSurface key={item.status} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`text-[11px] font-bold ${item.tone}`}>
                      {item.status}
                    </div>
                    <IconBadge
                      icon={item.icon}
                      variant={item.variant}
                      size="sm"
                    />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-textSecondary">
                    {item.description}
                  </p>
                </MarqueeSurface>
              ))}
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="ranking">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <HomeRankingSection />
        </div>
      </HomeSection>

      <HomeSection dividerVariant="fade">
        <TestimonialsSection />
      </HomeSection>

      <HomeSection className="bg-[radial-gradient(circle_at_30%_30%,rgba(41,133,91,0.18),transparent_24rem)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 mb-5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
              <Users className="h-3 w-3" />
              Junte-se à comunidade de devs em evolução
            </div>
            <SectionHeading
              eyebrow="Contato"
              title="Quer transformar estudo técnico em progresso real?"
              description="Envie uma mensagem para sugerir trilhas, parcerias, melhorias ou turmas de treino para sua equipe."
            />
          </div>
          <MarqueeSurface className="rounded-[1.75rem] p-6">
            <ContactForm />
            {/*
            <form className="space-y-4">
              <Field id="contact-name" label="Nome">
                <Input id="contact-name" placeholder="Eden Johnson" />
              </Field>
              <Field id="contact-email" label="Email">
                <Input id="contact-email" placeholder="eden@example.com" />
              </Field>
              <Field id="contact-message" label="Mensagem">
                <textarea
                  id="contact-message"
                  className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-primary"
                  placeholder="Escreva sua mensagem..."
                />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-textMuted">
                  Ao enviar, você concorda com nossos <span className="text-textPrimary">Termos</span> e <span className="text-textPrimary">Privacidade</span>.
                </p>
                <button
                  type="button"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover"
                >
                  Enviar
                </button>
              </div>
            </form>
            */}
          </MarqueeSurface>
        </div>
      </HomeSection>

      <HomeSection dividerVariant="strong">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <MarqueeSurface className="rounded-[1.75rem] border-primary/20 px-8 py-10 shadow-[0_24px_80px_rgba(71,48,140,0.34)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b2a3ff]">
                  Comece agora
                </div>
                <h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-[-0.04em] text-white">
                  Pronto para evoluir como desenvolvedor?
                </h2>
                <p className="mt-3 text-sm leading-7 text-textSecondary">
                  Comece agora e transforme estudo em progresso mensurável.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover"
                >
                  Começar agora
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/dashboard"
                  className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Explorar plataforma
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </MarqueeSurface>

          <footer className="mt-16 pt-10">
            <SectionDivider variant="default" className="mb-10" />
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <BrandLogo compact imageClassName="h-9 w-36" />
                <p className="mt-4 max-w-sm text-sm leading-6 text-textSecondary">
                  Treino inteligente para devs praticarem entrevistas, revisarem
                  conceitos e acompanharem evolução real.
                </p>
                <SocialButtons className="mt-6" />
              </div>

              {footerSections.map((section) => (
                <FooterColumn
                  key={section.title}
                  title={section.title}
                  links={section.links}
                />
              ))}
            </div>

            <SectionDivider variant="default" className="mt-10" />
            <div className="flex flex-col gap-4 pt-6 text-xs text-textMuted sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 CodeQuest. Todos os direitos reservados.</span>
              <div className="flex gap-4">
                <Link
                  to="/privacidade"
                  className="transition hover:text-textPrimary"
                >
                  Privacidade
                </Link>
                <Link
                  to="/termos"
                  className="transition hover:text-textPrimary"
                >
                  Termos
                </Link>
                <Link
                  to="/cookies"
                  className="transition hover:text-textPrimary"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </HomeSection>
    </div>
  );
}

export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    typeof location.state === 'object' &&
    location.state &&
    'redirectTo' in location.state
      ? String(location.state.redirectTo)
      : '/dashboard';
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const socialProviders: SocialButton[] = [
    {
      type: 'google',
      label: 'Entrar com Google',
      icon: <GoogleIcon />,
      onClick: loginWithGoogle,
    },
    {
      type: 'github',
      label: 'Entrar com GitHub',
      icon: <GithubIcon />,
      onClick: () => {
        window.location.href = getAuthUrl('github');
      },
    },
  ];

  return (
    <AuthCard
      eyebrow="Halo Dark Auth"
      title="Login"
      subtitle="Acesse sua conta para continuar treinando, revisar questões e acompanhar seu progresso."
      footer={
        <p className="text-sm text-textSecondary">
          Não tem conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-textPrimary hover:text-primary"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await login(values.email, values.password);
            navigate(redirectTo, { replace: true });
          } catch (error) {
            form.setError('root', { message: getErrorMessage(error) });
          }
        })}
      >
        <Field
          id="email"
          label="Email"
          icon={Mail}
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={form.formState.errors.email ? 'true' : 'false'}
            aria-describedby={
              form.formState.errors.email ? 'email-error' : undefined
            }
            {...form.register('email')}
          />
        </Field>
        <Field
          id="password"
          label="Senha"
          icon={Lock}
          error={form.formState.errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={form.formState.errors.password ? 'true' : 'false'}
            aria-describedby={
              form.formState.errors.password ? 'password-error' : undefined
            }
            {...form.register('password')}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-textSecondary hover:text-textPrimary"
          >
            Esqueci minha senha
          </Link>
        </div>
        {form.formState.errors.root?.message ? (
          <InlineError message={form.formState.errors.root.message} />
        ) : null}
        <Button
          className="w-full"
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Entrando..."
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Entrar
        </Button>
        <Divider label="Login com redes sociais" />
        <SocialButtons buttons={socialProviders} variant="auth" />
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });
  const socialProviders: SocialButton[] = [
    {
      type: 'google',
      label: 'Continuar com Google',
      icon: <GoogleIcon />,
      onClick: loginWithGoogle,
    },
    {
      type: 'github',
      label: 'Continuar com GitHub',
      icon: <GithubIcon />,
      onClick: () => {
        window.location.href = getAuthUrl('github');
      },
    },
  ];

  return (
    <AuthCard
      eyebrow="Halo Dark Auth"
      title="Criar conta"
      subtitle="Abra sua conta para acessar quizzes, ranking, arena e fluxo de contribuições."
      footer={
        <p className="text-sm text-textSecondary">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-textPrimary hover:text-primary"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await register(values.name, values.email, values.password);
            navigate('/dashboard');
          } catch (error) {
            const message = getErrorMessage(error);
            if (
              message.toLowerCase().includes('email') ||
              message.toLowerCase().includes('e-mail')
            ) {
              form.setError('email', { message });
            } else {
              form.setError('root', { message });
            }
          }
        })}
      >
        <Field
          id="name"
          label="Nome"
          icon={Users}
          error={form.formState.errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Seu nome"
            aria-invalid={form.formState.errors.name ? 'true' : 'false'}
            {...form.register('name')}
          />
        </Field>
        <Field
          id="register-email"
          label="Email"
          icon={Mail}
          error={form.formState.errors.email?.message}
        >
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={form.formState.errors.email ? 'true' : 'false'}
            {...form.register('email')}
          />
        </Field>
        <Field
          id="register-password"
          label="Senha"
          icon={Lock}
          error={form.formState.errors.password?.message}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={form.formState.errors.password ? 'true' : 'false'}
            {...form.register('password')}
          />
        </Field>
        {form.formState.errors.root?.message ? (
          <InlineError message={form.formState.errors.root.message} />
        ) : null}
        <Button
          className="w-full"
          type="submit"
          loading={form.formState.isSubmitting}
          loadingText="Criando conta..."
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Criar conta
        </Button>
        <Divider label="Cadastro com redes sociais" />
        <SocialButtons buttons={socialProviders} variant="auth" />
      </form>
    </AuthCard>
  );
}

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0A0B0F] px-4 py-8 text-[#F2F4F8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,107,255,0.22),transparent_24rem),radial-gradient(circle_at_bottom,rgba(30,32,41,0.7),transparent_28rem)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]" />

      <Card className="relative w-full max-w-[420px] border-[#2A2D38] bg-[rgba(20,21,28,0.9)] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <BrandLogo imageClassName="h-11 w-44 rounded-md" />
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5C6170]">
              {eyebrow}
            </p>
          </div>
          <BadgeChip>Halo Dark</BadgeChip>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#F2F4F8]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#9AA0AE]">{subtitle}</p>
        </div>

        {children}

        {footer ? (
          <div className="mt-6 border-t border-white/8 pt-5">{footer}</div>
        ) : null}
      </Card>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#7f86a2]">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-7 text-textSecondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function MetricPanel({
  label,
  value,
  note,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: string;
  note: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-textMuted">
          {label}
        </div>
        {Icon ? <IconBadge icon={Icon} variant="indigo" size="sm" /> : null}
      </div>
      <div
        className={
          compact
            ? 'mt-3 text-3xl font-bold text-white'
            : 'mt-4 text-[3rem] font-bold leading-none text-white'
        }
      >
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold text-success">{note}</div>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
      <div className="text-xs text-textSecondary">{label}</div>
      <div className="mt-2 text-5xl font-black leading-none text-white">
        {value}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-textPrimary">
        {Icon ? (
          <Icon className="h-4 w-4 text-indigo-300" aria-hidden="true" />
        ) : null}
        {label}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-xs uppercase tracking-[0.18em] text-textMuted">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}

function InlineError({
  message,
  tone = 'danger',
}: {
  message: string;
  tone?: 'danger' | 'info';
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-danger/25 bg-danger/10 text-danger'
      : 'border-primary/25 bg-primary/10 text-[#B9C3FF]';

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${toneClass}`}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ContactForm() {
  const [state, handleSubmit] = useFormspree('xjgdzpkq');

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success/10 px-4 py-5 text-sm text-success">
        Mensagem enviada. Obrigado pelo contato.
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field id="contact-name" label="Nome" icon={Users}>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Leonardo Bastos"
          required
        />
      </Field>
      <Field id="contact-email" label="Email" icon={Mail}>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
        />
      </Field>
      <Field id="contact-subject" label="Assunto" icon={MessageSquarePlus}>
        <Input
          id="contact-subject"
          name="subject"
          placeholder="Parceria, sugestao ou melhoria"
          required
        />
      </Field>
      <Field id="contact-message" label="Mensagem" icon={Send}>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-primary"
          placeholder="Escreva sua mensagem..."
        />
      </Field>
      <ValidationError
        prefix="Email"
        field="email"
        errors={state.errors}
        className="text-sm text-danger"
      />
      <ValidationError
        prefix="Mensagem"
        field="message"
        errors={state.errors}
        className="text-sm text-danger"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-textMuted">
          Ao enviar, voce concorda com nossos{' '}
          <Link to="/termos" className="text-textPrimary hover:text-primary">
            Termos
          </Link>{' '}
          e{' '}
          <Link
            to="/privacidade"
            className="text-textPrimary hover:text-primary"
          >
            Privacidade
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={state.submitting}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {state.submitting ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}

function BadgeChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA0AE]">
      {children}
    </span>
  );
}

type FooterLink = { label: string; to?: string; href?: string };

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-4 space-y-3 text-sm text-textSecondary">
        {links.map((link) => (
          <div key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="group inline-flex items-center gap-2 transition hover:text-textPrimary"
              >
                <ChevronRight
                  className="h-3.5 w-3.5 text-indigo-300 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 transition hover:text-textPrimary"
              >
                <ChevronRight
                  className="h-3.5 w-3.5 text-indigo-300 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {link.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
