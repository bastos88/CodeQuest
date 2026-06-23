import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers3,
  Orbit,
  Sparkles,
  Target,
  TimerReset,
} from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import type { QuizSetupDifficulty } from '@codequest/shared';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { NeonButton } from '../components/ui/NeonButton';
import { api } from '../lib/api';
import {
  buildCategoryDescription,
  difficultyCopy,
  estimatePotentialXP,
  estimateQuizMinutes,
  questionCountOptions,
  type QuizCategoryOption,
  type QuizSessionPayload,
  type QuizSessionQuestion,
  type QuizSetupState,
} from '../lib/quiz';
import { writeQuizSession } from '../lib/quizSession';

type QuestionListResponse = Array<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
}>;

type StartQuizResponse = {
  quizSessionId: string;
  questions: QuizSessionQuestion[];
};

const categoryPriority = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'React Hooks',
  'Context API',
  'Node.js',
  'SQL',
  'APIs REST',
  'Git/GitHub',
  'Accessibility',
  'Performance',
  'DevOps',
  'C#',
  'Python',
];

const difficultyOptions = (
  Object.entries(difficultyCopy) as Array<
    [QuizSetupDifficulty, (typeof difficultyCopy)[QuizSetupDifficulty]]
  >
).map(([value, copy]) => ({ value, ...copy }));

const initialState: QuizSetupState = {
  categoryIds: [],
  difficulty: null,
  questionCount: null,
};

export function QuizSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [setup, setSetup] = useState<QuizSetupState>(initialState);
  const [setupValidation, setSetupValidation] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['quiz-setup-categories'],
    queryFn: async () =>
      (await api.get<QuestionListResponse>('/categories')).data,
    select: (response) =>
      response
        .map(
          (category): QuizCategoryOption => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description:
              category.description ?? buildCategoryDescription(category.name),
          }),
        )
        .sort((left, right) => {
          const leftIndex = categoryPriority.indexOf(left.name);
          const rightIndex = categoryPriority.indexOf(right.name);

          if (leftIndex === -1 && rightIndex === -1)
            return left.name.localeCompare(right.name);
          if (leftIndex === -1) return 1;
          if (rightIndex === -1) return -1;
          return leftIndex - rightIndex;
        }),
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: async (state: QuizSetupState) => {
      if (
        !state.difficulty ||
        !state.questionCount ||
        state.categoryIds.length === 0
      ) {
        throw new Error(
          'Selecione categorias, dificuldade e quantidade antes de iniciar.',
        );
      }

      const { data } = await api.post<StartQuizResponse>('/quizzes/start', {
        categoryIds: state.categoryIds,
        difficulty: state.difficulty,
        questionCount: state.questionCount,
      });

      return data;
    },
    onSuccess: (data) => {
      if (!setup.difficulty || !setup.questionCount) return;

      const sessionPayload: QuizSessionPayload = {
        quizSessionId: data.quizSessionId,
        setup: {
          categoryIds: setup.categoryIds,
          difficulty: setup.difficulty,
          questionCount: setup.questionCount,
        },
        questions: data.questions,
        createdAt: new Date().toISOString(),
      };

      writeQuizSession(sessionPayload);
      navigate('/quiz/session');
    },
  });

  const categories = categoriesQuery.data ?? [];
  const selectedCategories = useMemo(
    () =>
      categories.filter((category) => setup.categoryIds.includes(category.id)),
    [categories, setup.categoryIds],
  );

  const summary = {
    categories:
      selectedCategories.length > 0
        ? selectedCategories.map((category) => category.name).join(' + ')
        : 'Selecione uma ou mais categorias',
    difficulty: setup.difficulty
      ? difficultyCopy[setup.difficulty].label
      : 'Selecione a dificuldade',
    questionCount: setup.questionCount
      ? `${setup.questionCount} perguntas`
      : 'Escolha a quantidade',
    estimate: estimateQuizMinutes(setup.questionCount),
    xp: estimatePotentialXP(setup.difficulty, setup.questionCount),
  };

  const canStart =
    setup.categoryIds.length > 0 &&
    setup.difficulty !== null &&
    setup.questionCount !== null;
  const notice =
    typeof location.state === 'object' &&
    location.state &&
    'notice' in location.state
      ? String(location.state.notice)
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
      <section className="space-y-6">
        <Card className="overflow-hidden p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.2),transparent_18rem)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="info">quiz.setup</Badge>
              <Badge tone="success">Pré-configuração</Badge>
            </div>
            <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary">
              Prepare seu desafio
            </h2>
            <p className="mt-3 max-w-3xl text-base text-textSecondary">
              Escolha categorias, dificuldade e quantidade de perguntas antes de
              iniciar sua simulação.
            </p>
            {notice ? (
              <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-textSecondary">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-warning"
                />
                <span>{notice}</span>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeading
            eyebrow="Seção 1"
            title="Categorias"
            description="Combine trilhas para montar um desafio mais amplo ou mantenha foco em um único tema."
          />

          {categoriesQuery.isLoading ? (
            <div className="h-12 animate-pulse rounded-2xl border border-white/6 bg-white/[0.03]" />
          ) : categoriesQuery.isError ? (
            <InlineState
              title="Não foi possível carregar as categorias."
              description="Recarregue a página ou verifique a conexão com a API antes de iniciar o desafio."
              tone="danger"
            />
          ) : categories.length === 0 ? (
            <InlineState
              title="Nenhuma categoria disponível."
              description="Cadastre perguntas aprovadas primeiro para liberar combinações válidas no setup."
              tone="warning"
            />
          ) : (
            <div className="grid gap-3">
              <label
                htmlFor="quiz-category"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted"
              >
                Categoria
              </label>
              <select
                id="quiz-category"
                value={setup.categoryIds[0] ?? ''}
                aria-invalid={
                  setupValidation !== null && setup.categoryIds.length === 0
                }
                onChange={(event) => {
                  setSetupValidation(null);
                  setSetup((current) => ({
                    ...current,
                    categoryIds: event.target.value ? [event.target.value] : [],
                  }));
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#14151C] px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger/5"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {setupValidation && setup.categoryIds.length === 0 ? (
                <p className="text-sm text-danger">{setupValidation}</p>
              ) : null}
              {selectedCategories[0] ? (
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-semibold text-textPrimary">
                    {selectedCategories[0].name}
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">
                    {selectedCategories[0].description}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeading
            eyebrow="Seção 2"
            title="Dificuldade"
            description="Ajuste o nível do desafio conforme o objetivo de estudo ou ritmo de revisão."
          />

          <div className="grid gap-3 lg:grid-cols-3">
            {difficultyOptions.map((option) => (
              <SelectableCard
                key={option.value}
                selected={setup.difficulty === option.value}
                onClick={() =>
                  setSetup((current) => ({
                    ...current,
                    difficulty: option.value,
                  }))
                }
                title={option.label}
                description={option.description}
                meta={option.badge}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeading
            eyebrow="Seção 3"
            title="Quantidade de perguntas"
            description="Escolha a duração da simulação sem cair em um formulário genérico."
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {questionCountOptions.map((option) => (
              <SelectableCard
                key={option.value}
                selected={setup.questionCount === option.value}
                onClick={() =>
                  setSetup((current) => ({
                    ...current,
                    questionCount: option.value,
                  }))
                }
                title={option.label}
                description={`Tempo estimado ${option.estimate}`}
                meta="Ritmo sugerido"
              />
            ))}
          </div>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card className="sticky top-28 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Resumo</p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary">
                Configuração atual
              </h3>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Layers3 size={20} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <SummaryRow
              icon={Orbit}
              label="Categoria(s)"
              value={summary.categories}
            />
            <SummaryRow
              icon={Sparkles}
              label="Dificuldade"
              value={summary.difficulty}
            />
            <SummaryRow
              icon={Target}
              label="Quantidade"
              value={summary.questionCount}
            />
            <SummaryRow
              icon={TimerReset}
              label="Tempo estimado"
              value={summary.estimate}
            />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-success/20 bg-success/10 p-4">
            <p className="text-sm font-semibold text-textPrimary">
              XP potencial
            </p>
            <p className="mt-2 font-mono text-3xl font-extrabold text-success">
              +{summary.xp}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              Projeção baseada em acerto máximo para a configuração selecionada.
            </p>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-textPrimary">
              Antes de iniciar
            </p>
            <ul className="mt-3 space-y-2 text-sm text-textSecondary">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-success"
                />
                A seleção é validada antes de criar a sessão.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-success"
                />
                As respostas corretas continuam protegidas no backend.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-success"
                />
                Se faltarem perguntas, você recebe orientação para ajustar os
                filtros.
              </li>
            </ul>
          </div>

          {startMutation.isError ? (
            <div className="mt-6 rounded-[1.25rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary">
              {getStartErrorMessage(startMutation.error)}
            </div>
          ) : null}

          <NeonButton
            className="mt-6 w-full"
            size="lg"
            disabled={categories.length === 0}
            isLoading={startMutation.isPending}
            rightIcon={<ArrowRight size={18} />}
            onClick={() => {
              if (!canStart) {
                setSetupValidation(
                  'Selecione uma categoria, dificuldade e quantidade antes de iniciar.',
                );
                return;
              }
              setSetupValidation(null);
              startMutation.mutate(setup);
            }}
          >
            Iniciar Desafio
          </NeonButton>
        </Card>
      </aside>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="section-kicker">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary">
        {title}
      </h3>
      <p className="mt-2 text-sm text-textSecondary">{description}</p>
    </div>
  );
}

function SelectableCard({
  title,
  description,
  meta,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  meta: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[1.5rem] border p-4 text-left transition duration-150 ease-premium ${
        selected
          ? 'border-primary/30 bg-[linear-gradient(180deg,rgba(108,99,255,0.18),rgba(168,85,247,0.08))] shadow-[0_0_0_1px_rgba(108,99,255,0.18),0_20px_40px_rgba(10,11,15,0.22)]'
          : 'border-white/8 bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-textPrimary">{title}</p>
          <p className="mt-2 text-sm leading-6 text-textSecondary">
            {description}
          </p>
        </div>
        <span
          className={`mt-1 h-3.5 w-3.5 rounded-full border ${
            selected
              ? 'border-primary bg-primary shadow-[0_0_18px_rgba(108,99,255,0.55)]'
              : 'border-white/18 bg-transparent'
          }`}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted">
          {meta}
        </span>
        {selected ? <Badge tone="info">Selected</Badge> : null}
      </div>
    </button>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Orbit;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.05] text-textSecondary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-textPrimary">{value}</p>
      </div>
    </div>
  );
}

function InlineState({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: 'warning' | 'danger';
}) {
  const toneClasses =
    tone === 'danger'
      ? 'border-danger/25 bg-danger/10 text-danger'
      : 'border-warning/25 bg-warning/10 text-warning';

  return (
    <div className={`rounded-[1.5rem] border px-5 py-4 ${toneClasses}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-textSecondary">{description}</p>
    </div>
  );
}

function getStartErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message;
    if (message) return message;
  }

  if (error instanceof Error) return error.message;
  return 'Não foi possível iniciar a sessão. Tente novamente.';
}
