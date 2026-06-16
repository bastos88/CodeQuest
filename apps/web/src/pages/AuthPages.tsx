import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@codequest/shared';
import { useAuth } from '../context/AuthContext';
import TechMarqueeSection from '../components/TechMarqueeSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HomeSection } from '../components/ui/HomeSection';
import { Input } from '../components/ui/Input';
import { SectionDivider } from '../components/ui/SectionDivider';
import SocialButtons, { DiscordIcon, GithubIcon, type SocialButton } from '../components/ui/SocialButtons';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

const steps = [
  {
    index: '01',
    title: 'Escolha uma categoria',
    description: 'Selecione a trilha que faz sentido para sua entrevista, revisão ou rotina de estudo.',
  },
  {
    index: '02',
    title: 'Defina a dificuldade',
    description: 'Ajuste o nível para iniciantes, intermediário ou avançado sem sair do fluxo.',
  },
  {
    index: '03',
    title: 'Responda ao quiz',
    description: 'Resolva perguntas objetivas, código e conceitos com feedback direto.',
  },
  {
    index: '04',
    title: 'Analise seu desempenho',
    description: 'Veja acertos, erros, tempo, categorias fortes e pontos que pedem revisão.',
  },
];

const features = [
  {
    title: 'Quiz inteligente',
    subtitle: '40 perguntas',
    description: 'Sessões guiadas por categoria, dificuldade, quantidade de perguntas e foco técnico.',
    accent: true,
  },
  {
    title: 'Arena',
    subtitle: 'PvP sprint',
    description: 'Desafios competitivos para treinar sob pressão.',
    accent: false,
  },
  {
    title: 'Ranking',
    subtitle: 'Top 100',
    description: 'Evolução visível com Elo, posições e consistência.',
    accent: false,
  },
  {
    title: 'Contribuições',
    subtitle: 'Review flow',
    description: 'Crie perguntas e peça à comunidade para refinar melhor.',
    accent: false,
  },
];

const contributionFlow = [
  { status: 'Draft', tone: 'text-textSecondary', description: 'Crie e refine antes do envio.' },
  { status: 'Pending Review', tone: 'text-warning', description: 'Aguarde curadoria e feedback.' },
  { status: 'Approved', tone: 'text-success', description: 'A pergunta entra no sistema.' },
  { status: 'Rejected', tone: 'text-danger', description: 'Revise pontos indicados.' },
];

const metrics = [
  { label: 'Perguntas', value: '223', note: 'curadas', tone: 'text-success' },
  { label: 'Categorias', value: '34', note: 'ativas', tone: 'text-primary' },
  { label: 'Usuários', value: '5', note: 'ativos', tone: 'text-success' },
  { label: 'Quizzes', value: '82k', note: 'realizados', tone: 'text-success' },
  { label: 'XP distribuído', value: '4.8M', note: 'pontos', tone: 'text-warning' },
  { label: 'Contribuições', value: '2.4k', note: 'aprovadas', tone: 'text-success' },
];

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
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,107,255,0.2),transparent_26rem),radial-gradient(circle_at_80%_10%,rgba(125,92,255,0.14),transparent_30rem)]" />

        <header className="relative border-b border-white/6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-black text-white">P</span>
              <span className="text-sm font-semibold tracking-tight">QuizPro</span>
            </Link>
            <nav className="hidden items-center gap-6 text-[11px] font-medium text-textSecondary lg:flex">
              <a href="#dashboard" className="transition hover:text-textPrimary">Dashboard</a>
              <a href="#quiz" className="transition hover:text-textPrimary">Quiz</a>
              <a href="#arena" className="transition hover:text-textPrimary">Arena</a>
              <a href="#contribuir" className="transition hover:text-textPrimary">Contribuir</a>
              <a href="#metricas" className="transition hover:text-textPrimary">Mais</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden text-xs font-semibold text-textPrimary sm:inline-flex">Entrar</Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white shadow-[0_0_26px_rgba(91,107,255,0.45)] transition hover:bg-primaryHover"
              >
                Começar agora
              </Link>
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
                Pratique com quizzes inteligentes, participe da Arena, suba no Ranking e evolua através de XP, revisão e comunidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(91,107,255,0.45)] transition hover:bg-primaryHover"
                >
                  Começar agora
                </Link>
                <a
                  href="#funcionalidades"
                  className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-textPrimary transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Explorar perguntas
                </a>
              </div>
              <SectionDivider variant="default" className="mt-10" />
              <div className="grid gap-3 pt-6 sm:grid-cols-4">
                {[
                  { value: '12k+', label: 'perguntas' },
                  { value: '48h', label: 'competições' },
                  { value: '180+', label: 'desafios' },
                  { value: '18k+', label: 'usuários' },
                ].map((item) => (
                  <MarqueeSurface key={item.label} className="px-4 py-4">
                    <div className="text-lg font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-textMuted">{item.label}</div>
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
                    src="/images/quiz-hero.png"
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
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a38dff]">{step.index}</div>
                <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-textSecondary">{step.description}</p>
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
                  <div className="text-[11px] font-semibold text-[#9f8fff]">{feature.title}</div>
                  <div className="mt-1 text-xs font-medium text-textSecondary">{feature.subtitle}</div>
                  <p className="mt-6 max-w-[18rem] text-sm leading-6 text-textSecondary">{feature.description}</p>
                </MarqueeSurface>
              ))}
            </div>

            <MarqueeSurface className="p-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9f8fff]">Quiz inteligente</div>
              <h3 className="mt-4 max-w-lg text-2xl font-bold text-white">
                Monte simulações rápidas ou completas, receba feedback visual e transforme respostas em histórico mensurável.
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-textSecondary">
                O mesmo design system conecta páginas, cards, tabelas e feedback para manter a experiência previsível e profissional.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Filtros claros', 'Feedback direto', 'Sessões flexíveis'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-textSecondary">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <MetricPanel label="Perguntas" value="223" note="aprovadas" />
                <MetricPanel label="Categorias" value="34" note="ativas" />
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
                  <div key={height} className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#6985ff,#5b6bff)]" style={{ height: `${height}%` }}>
                    <div className="sr-only">Barra {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <MetricPanel label="Desafios" value="100+" note="ativos" compact />
              <MetricPanel label="Ranking global" value="10k+" note="online" compact />
              <MetricPanel label="Sequência" value="14" note="vitórias" compact />
              <MetricPanel label="XP" value="120" note="por race" compact />
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
                  <div className={`text-[11px] font-bold ${item.tone}`}>{item.status}</div>
                  <p className="mt-5 text-sm leading-6 text-textSecondary">{item.description}</p>
                </MarqueeSurface>
              ))}
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection id="metricas">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Estatísticas" title="Métricas de produto que reforçam progresso" description="" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <MarqueeSurface key={metric.label} className="p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">{metric.label}</div>
                <div className="mt-3 text-4xl font-bold text-white">{metric.value}</div>
                <div className={`mt-1 text-xs font-semibold ${metric.tone}`}>{metric.note}</div>
              </MarqueeSurface>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection dividerVariant="fade">
        <TestimonialsSection />
      </HomeSection>

      <HomeSection className="bg-[radial-gradient(circle_at_30%_30%,rgba(41,133,91,0.18),transparent_24rem)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
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
          </MarqueeSurface>
        </div>
      </HomeSection>

      <HomeSection dividerVariant="strong">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <MarqueeSurface className="rounded-[1.75rem] border-primary/20 px-8 py-10 shadow-[0_24px_80px_rgba(71,48,140,0.34)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b2a3ff]">Comece agora</div>
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
                  className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover"
                >
                  Começar agora
                </Link>
                <a
                  href="#dashboard"
                  className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Explorar plataforma
                </a>
              </div>
            </div>
          </MarqueeSurface>

          <footer className="mt-16 pt-10">
            <SectionDivider variant="default" className="mb-10" />
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-black text-white">P</span>
                  <span className="text-sm font-semibold">QuizPro</span>
                </div>
                <p className="mt-4 max-w-sm text-sm leading-6 text-textSecondary">
                  Treino inteligente para devs praticarem entrevistas, revisarem conceitos e acompanharem evolução real.
                </p>
                <SocialButtons className="mt-6" />
              </div>

              <FooterColumn title="Plataforma" links={['Quiz', 'Arena', 'Ranking', 'Contribuir']} />
              <FooterColumn title="Empresa" links={['Sobre', 'Termos', 'Privacidade', 'Github']} />
            </div>

            <SectionDivider variant="default" className="mt-10" />
            <div className="flex flex-col gap-4 pt-6 text-xs text-textMuted sm:flex-row sm:items-center sm:justify-between">
              <span>© 2026 QuizPro. Todos os direitos reservados.</span>
              <div className="flex gap-4">
                <span>Privacidade</span>
                <span>Termos</span>
                <span>Cookies</span>
              </div>
            </div>
          </footer>
        </div>
      </HomeSection>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const redirectTo =
    typeof location.state === 'object' && location.state && 'redirectTo' in location.state
      ? String(location.state.redirectTo)
      : '/dashboard';
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'student@codequest.dev', password: 'User12345!' },
  });

  const githubAuthUrl = import.meta.env.VITE_AUTH_GITHUB_URL as string | undefined;
  const socialProviders: SocialButton[] = [
    {
      type: 'github',
      label: 'Continuar com GitHub',
      icon: <GithubIcon />,
      ...(githubAuthUrl
        ? { href: githubAuthUrl }
        : { onClick: () => setSocialMessage('Login com GitHub ainda nao esta configurado.') }),
    },
    {
      type: 'discord',
      label: 'Continuar com Discord',
      icon: <DiscordIcon />,
      onClick: () => setSocialMessage('Login com Discord ainda nao esta configurado.'),
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
          <Link to="/register" className="font-semibold text-textPrimary hover:text-primary">
            Criar conta
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            setSocialMessage(null);
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
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            aria-invalid={form.formState.errors.email ? 'true' : 'false'}
            aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
            {...form.register('email')}
          />
        </Field>
        <Field
          id="password"
          label="Senha"
          error={form.formState.errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            aria-invalid={form.formState.errors.password ? 'true' : 'false'}
            aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
            {...form.register('password')}
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-textSecondary hover:text-textPrimary">
            Esqueci minha senha
          </Link>
        </div>
        {form.formState.errors.root?.message ? (
          <InlineError message={form.formState.errors.root.message} />
        ) : null}
        {socialMessage ? <InlineError tone="info" message={socialMessage} /> : null}
        <Button className="w-full" type="submit" loading={form.formState.isSubmitting} loadingText="Entrando...">
          Entrar
        </Button>
        <Divider label="Login com redes sociais" />
        <SocialButtons buttons={socialProviders} className="justify-center" />
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const githubAuthUrl = import.meta.env.VITE_AUTH_GITHUB_URL as string | undefined;
  const socialProviders: SocialButton[] = [
    {
      type: 'github',
      label: 'Criar conta com GitHub',
      icon: <GithubIcon />,
      ...(githubAuthUrl
        ? { href: githubAuthUrl }
        : { onClick: () => setSocialMessage('Cadastro com GitHub ainda nao esta configurado.') }),
    },
    {
      type: 'discord',
      label: 'Criar conta com Discord',
      icon: <DiscordIcon />,
      onClick: () => setSocialMessage('Cadastro com Discord ainda nao esta configurado.'),
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
          <Link to="/login" className="font-semibold text-textPrimary hover:text-primary">
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
            form.setError('root', { message: getErrorMessage(error) });
          }
        })}
      >
        <Field id="name" label="Nome" error={form.formState.errors.name?.message}>
          <Input id="name" placeholder="Seu nome" aria-invalid={form.formState.errors.name ? 'true' : 'false'} {...form.register('name')} />
        </Field>
        <Field id="register-email" label="Email" error={form.formState.errors.email?.message}>
          <Input
            id="register-email"
            type="email"
            placeholder="voce@exemplo.com"
            aria-invalid={form.formState.errors.email ? 'true' : 'false'}
            {...form.register('email')}
          />
        </Field>
        <Field id="register-password" label="Senha" error={form.formState.errors.password?.message}>
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            aria-invalid={form.formState.errors.password ? 'true' : 'false'}
            {...form.register('password')}
          />
        </Field>
        {form.formState.errors.root?.message ? (
          <InlineError message={form.formState.errors.root.message} />
        ) : null}
        {socialMessage ? <InlineError tone="info" message={socialMessage} /> : null}
        <Button className="w-full" type="submit" loading={form.formState.isSubmitting} loadingText="Criando conta...">
          Criar conta
        </Button>
        <Divider label="Cadastro com redes sociais" />
        <SocialButtons buttons={socialProviders} className="justify-center" />
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  return (
    <AuthCard
      eyebrow="Password Recovery"
      title="Recuperação de senha"
      subtitle="O fluxo de reset ainda não foi configurado no backend. Quando o endpoint existir, esta rota pode receber o formulário real."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary">
          <ArrowLeft size={16} />
          Voltar para login
        </Link>
      }
    >
      <InlineError tone="info" message="O endpoint de recuperação ainda não está disponível neste ambiente." />
    </AuthCard>
  );
}

function AuthCard({
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
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#5B6BFF] text-sm font-black text-white shadow-[0_0_24px_rgba(91,107,255,0.42)]">
              CQ
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#F2F4F8]">CodeQuest</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#5C6170]">{eyebrow}</p>
            </div>
          </Link>
          <BadgeChip>Halo Dark</BadgeChip>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#F2F4F8]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#9AA0AE]">{subtitle}</p>
        </div>

        {children}

        {footer ? <div className="mt-6 border-t border-white/8 pt-5">{footer}</div> : null}
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
      <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#7f86a2]">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[2.6rem]">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-7 text-textSecondary">{description}</p> : null}
    </div>
  );
}

function MetricPanel({
  label,
  value,
  note,
  compact = false,
}: {
  label: string;
  value: string;
  note: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-textMuted">{label}</div>
      <div className={compact ? 'mt-3 text-3xl font-bold text-white' : 'mt-4 text-[3rem] font-bold leading-none text-white'}>{value}</div>
      <div className="mt-1 text-xs font-semibold text-success">{note}</div>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
      <div className="text-xs text-textSecondary">{label}</div>
      <div className="mt-2 text-5xl font-black leading-none text-white">{value}</div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <div className="mb-2 text-xs font-semibold text-textPrimary">{label}</div>
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
      <span className="text-xs uppercase tracking-[0.18em] text-textMuted">{label}</span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}

function InlineError({ message, tone = 'danger' }: { message: string; tone?: 'danger' | 'info' }) {
  const toneClass = tone === 'danger' ? 'border-danger/25 bg-danger/10 text-danger' : 'border-primary/25 bg-primary/10 text-[#B9C3FF]';

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function BadgeChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA0AE]">
      {children}
    </span>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-4 space-y-3 text-sm text-textSecondary">
        {links.map((link) => (
          <div key={link}>{link}</div>
        ))}
      </div>
    </div>
  );
}
