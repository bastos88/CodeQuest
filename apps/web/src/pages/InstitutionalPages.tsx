import {
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Code2,
  GitPullRequest,
  Rocket,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Card } from '../components/ui/Card';

type InstitutionalPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
};

const pages = {
  terms: {
    eyebrow: 'Termos',
    title: 'Termos de Uso',
    description: 'Regras basicas para uso responsavel da plataforma CodeQuest.',
    sections: [
      {
        title: 'Uso da plataforma',
        body: 'Ao utilizar o CodeQuest, voce concorda em usar os recursos de estudo, ranking, arena e contribuicao de forma legitima, sem automatizar abusos ou prejudicar outros usuarios.',
      },
      {
        title: 'Conteudo enviado',
        body: 'Perguntas e sugestoes enviadas podem passar por revisao antes de publicacao. Conteudo ofensivo, ilegal ou copiado indevidamente pode ser removido.',
      },
      {
        title: 'Alteracoes',
        body: 'Estes termos podem ser atualizados para refletir mudancas no produto, requisitos legais ou melhorias de seguranca.',
      },
    ],
  },
  privacy: {
    eyebrow: 'Privacidade',
    title: 'Politica de Privacidade',
    description: 'Como tratamos dados de conta, progresso e contato.',
    sections: [
      {
        title: 'Dados coletados',
        body: 'Podemos guardar nome, e-mail, progresso em quizzes, ranking, contribuicoes e mensagens enviadas pelo formulario de contato.',
      },
      {
        title: 'Finalidade',
        body: 'Os dados sao usados para autenticar usuarios, medir desempenho, operar a arena, moderar contribuicoes e responder contatos.',
      },
      {
        title: 'Contato',
        body: 'Para pedidos relacionados a privacidade, use o formulario de contato da pagina inicial ou os canais sociais oficiais.',
      },
    ],
  },
  cookies: {
    eyebrow: 'Cookies',
    title: 'Politica de Cookies',
    description:
      'Uso de armazenamento local e tecnologias semelhantes no CodeQuest.',
    sections: [
      {
        title: 'Sessao',
        body: 'A aplicacao usa armazenamento local para manter tokens de acesso e dados basicos da sessao autenticada.',
      },
      {
        title: 'Preferencias',
        body: 'Cookies ou armazenamento local podem ser usados para manter preferencias tecnicas e melhorar a experiencia de navegacao.',
      },
      {
        title: 'Controle',
        body: 'Voce pode limpar cookies e dados locais pelo navegador. Isso pode encerrar sua sessao atual.',
      },
    ],
  },
};

const platformFeatures = [
  {
    title: 'Quizzes por categoria',
    body: 'Treine fundamentos, front-end, back-end, banco de dados e logica em trilhas organizadas.',
    icon: BookOpenCheck,
  },
  {
    title: 'Niveis de dificuldade',
    body: 'Ajuste o desafio ao seu momento de estudo, de revisao rapida a simulados mais exigentes.',
    icon: Brain,
  },
  {
    title: 'Ranking e XP',
    body: 'Acompanhe progresso com pontuacao, consistencia e evolucao visivel ao longo do tempo.',
    icon: Trophy,
  },
  {
    title: 'Arena de desafios',
    body: 'Pratique sob pressao em disputas rapidas e compare seu desempenho com outros devs.',
    icon: Swords,
  },
  {
    title: 'Contribuicao de perguntas',
    body: 'Envie novas questoes para ampliar a base colaborativa da plataforma.',
    icon: GitPullRequest,
  },
  {
    title: 'Revisao e curadoria',
    body: 'Perguntas passam por revisao para manter clareza, qualidade e utilidade tecnica.',
    icon: CheckCircle2,
  },
];

const audiences = [
  'Estudantes iniciantes',
  'Pessoas em transicao de carreira',
  'Alunos de cursos tecnicos',
  'Desenvolvedores revisando fundamentos',
  'Quem quer praticar logica, front-end, back-end e banco de dados',
];

const steps = [
  'Escolha uma categoria',
  'Defina dificuldade e quantidade de perguntas',
  'Responda ao quiz',
  'Veja seu desempenho',
  'Evolua com XP, ranking e pratica continua',
];

function InstitutionalHeader() {
  return (
    <header className="border-b border-white/6 bg-[#0A0B0F]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <BrandLogo compact imageClassName="h-9 w-36" />
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-textSecondary transition hover:bg-primary/10 hover:text-white sm:inline-flex"
          >
            Home
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-[linear-gradient(135deg,#5B6BFF,#7C3AED)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(91,107,255,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(91,107,255,0.32)]"
          >
            Comecar agora
          </Link>
        </div>
      </div>
    </header>
  );
}

function InstitutionalPage({
  title,
  eyebrow,
  description,
  sections,
}: InstitutionalPageProps) {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <InstitutionalHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-textMuted">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-textSecondary">
            {description}
          </p>
        </div>
        <div className="mt-10 grid gap-4">
          {sections.map((section) => (
            <Card
              key={section.title}
              className="border-border bg-[#14151C] p-6"
            >
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-textSecondary">
                {section.body}
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-textPrimary">
      <InstitutionalHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(91,107,255,0.22),transparent_28rem),radial-gradient(circle_at_84%_18%,rgba(124,58,237,0.16),transparent_24rem)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:py-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                Sobre o CodeQuest
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                Aprenda programacao praticando, errando e evoluindo.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-textSecondary">
                O CodeQuest e uma plataforma de quizzes e desafios criada para
                ajudar estudantes de programacao a consolidarem conhecimento por
                meio de pratica, feedback e progressao.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/quiz"
                  className="inline-flex h-11 items-center rounded-full bg-[linear-gradient(135deg,#5B6BFF,#7C3AED)] px-5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(91,107,255,0.24)] transition hover:-translate-y-px hover:shadow-[0_18px_44px_rgba(91,107,255,0.32)]"
                >
                  Comecar Quiz
                </Link>
                <Link
                  to="/contribuir"
                  className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/10"
                >
                  Contribuir com pergunta
                </Link>
              </div>
            </div>
            <Card className="border-primary/20 bg-[#14151C]/80 p-6 shadow-[0_24px_80px_rgba(91,107,255,0.14)]">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <Code2 size={26} />
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-white">
                Estudo guiado por pratica
              </h2>
              <p className="mt-4 text-sm leading-7 text-textSecondary">
                Cada recurso foi pensado para reduzir atrito: escolha um tema,
                responda, receba historico e volte com clareza sobre o que
                revisar.
              </p>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-textMuted">
                Por que existe
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white">
                Transformar estudo em pratica guiada.
              </h2>
            </div>
            <Card className="border-border bg-[#14151C] p-6">
              <p className="text-sm leading-8 text-textSecondary">
                Aprender programacao exige mais do que assistir aulas ou ler
                documentacao. E preciso testar conhecimento, reconhecer padroes,
                errar com consciencia e voltar mais forte. O CodeQuest nasce com
                essa proposta: transformar estudo em pratica guiada.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-y border-white/6 bg-[#0D0E14]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-textMuted">
              Plataforma
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white">
              O que voce encontra na plataforma
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border bg-[#14151C] p-5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-textSecondary">
                    {feature.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-textMuted">
              Para quem e
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white">
              Feito para quem quer evoluir com repeticao inteligente.
            </h2>
            <div className="mt-8 grid gap-3">
              {audiences.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-[#14151C] px-4 py-3 text-sm text-textSecondary"
                >
                  <Users size={17} className="mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-textMuted">
              Como funciona
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white">
              Um ciclo simples para manter ritmo.
            </h2>
            <div className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-[#14151C] px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-textPrimary">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(135deg,rgba(91,107,255,0.18),rgba(20,21,28,0.92))] p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-primary">
                  <Rocket size={22} />
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-white">
                  Pronto para testar seus conhecimentos?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-textSecondary">
                  Entre em uma sessao, contribua com perguntas ou acompanhe seu
                  progresso no ranking.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/quiz"
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#10121A] transition hover:-translate-y-px hover:bg-[#EEF2FF]"
                >
                  Comecar Quiz
                </Link>
                <Link
                  to="/contribuir"
                  className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.05] px-5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.09]"
                >
                  Contribuir com pergunta
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export function TermsPage() {
  return <InstitutionalPage {...pages.terms} />;
}

export function PrivacyPage() {
  return <InstitutionalPage {...pages.privacy} />;
}

export function CookiesPage() {
  return <InstitutionalPage {...pages.cookies} />;
}
