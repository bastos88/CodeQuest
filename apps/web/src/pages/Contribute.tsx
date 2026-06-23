import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, Send, X } from 'lucide-react';
import type { QuestionInput } from '@codequest/shared';
import { Button } from '../components/ui/Button';
import { NeonButton } from '../components/ui/NeonButton';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type ContributeFormState = {
  categoryId: string;
  difficulty: QuestionInput['difficulty'];
  prompt: string;
  explanation: string;
  alternatives: string[];
  correctIndex: number;
};

const initialFormState: ContributeFormState = {
  categoryId: '',
  difficulty: 'MEDIUM',
  prompt: '',
  explanation: '',
  alternatives: ['', '', '', ''],
  correctIndex: 0,
};

export function Contribute() {
  const [form, setForm] = useState<ContributeFormState>(initialFormState);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['question-contribute-categories'],
    queryFn: async () => (await api.get<CategoryOption[]>('/categories')).data,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: QuestionInput) =>
      (await api.post('/questions', payload)).data,
    onSuccess: () => {
      setSubmittedTitle(form.prompt);
      setForm(initialFormState);
      setSuccessModalOpen(true);
    },
  });

  const submitError = submitMutation.isError
    ? getErrorMessage(submitMutation.error)
    : null;

  function updateAlternative(index: number, value: string) {
    setForm((current) => ({
      ...current,
      alternatives: current.alternatives.map((alternative, alternativeIndex) =>
        alternativeIndex === index ? value : alternative,
      ),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    submitMutation.mutate({
      categoryId: form.categoryId,
      difficulty: form.difficulty,
      prompt: form.prompt.trim(),
      explanation: form.explanation.trim() || undefined,
      alternatives: form.alternatives.map((text, index) => ({
        text: text.trim(),
        isCorrect: index === form.correctIndex,
      })),
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-7">
        <p className="section-kicker">question.pipeline</p>
        <h2 className="mt-3 section-title">Enviar pergunta</h2>
        <p className="mt-3 max-w-2xl text-base text-textSecondary">
          A pergunta entra como{' '}
          <span className="font-mono text-primary">PENDING_REVIEW</span> e só
          aparece no quiz após aprovação com checklist editorial.
        </p>

        {submitError ? (
          <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">
                Categoria
              </span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                required
                className="field hover:border-white/12 focus:border-primary"
              >
                <option value="">Selecione uma categoria</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">
                Dificuldade
              </span>
              <select
                value={form.difficulty}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: event.target
                      .value as QuestionInput['difficulty'],
                  }))
                }
                className="field hover:border-white/12 focus:border-primary"
              >
                <option value="EASY">Fácil</option>
                <option value="MEDIUM">Médio</option>
                <option value="HARD">Difícil</option>
              </select>
            </label>
          </div>

          <textarea
            className="field-area"
            placeholder="Enunciado"
            value={form.prompt}
            onChange={(event) =>
              setForm((current) => ({ ...current, prompt: event.target.value }))
            }
            required
            minLength={12}
          />

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">
              Alternativas
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.alternatives.map((alternative, index) => (
                <label
                  key={index}
                  className="grid gap-2 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">
                      Alternativa {index + 1}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-textSecondary">
                      <input
                        type="radio"
                        name="correctAlternative"
                        checked={form.correctIndex === index}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            correctIndex: index,
                          }))
                        }
                        className="h-4 w-4"
                      />
                      correta
                    </span>
                  </div>
                  <Input
                    placeholder={`Alternativa ${index + 1}`}
                    value={alternative}
                    onChange={(event) =>
                      updateAlternative(index, event.target.value)
                    }
                    required
                  />
                </label>
              ))}
            </div>
          </div>

          <textarea
            className="field-area"
            placeholder="Explicação da resposta correta"
            value={form.explanation}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                explanation: event.target.value,
              }))
            }
          />

          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Código opcional</Badge>
            <Badge>Explicação</Badge>
            <Badge tone="warning">Review manual</Badge>
          </div>
          <NeonButton
            type="submit"
            className="mt-2 w-[70%] max-w-full self-start"
            variant="app"
            isLoading={submitMutation.isPending}
            leftIcon={<Send size={17} />}
          >
            Enviar para revisão
          </NeonButton>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">
              Minhas perguntas
            </h3>
            <p className="mt-2 text-sm text-textSecondary">
              Acompanhe o status editorial e a aprovação final.
            </p>
          </div>
          <Badge tone="info">Queue</Badge>
        </div>
        <div className="space-y-3">
          <QuestionStatus
            title="Quando usar useMemo?"
            status="PENDING_REVIEW"
            tone="warning"
          />
          <QuestionStatus
            title="Transações SQL"
            status="APPROVED"
            tone="success"
          />
          {submittedTitle ? (
            <QuestionStatus
              title={submittedTitle}
              status="PENDING_REVIEW"
              tone="warning"
            />
          ) : null}
        </div>
      </Card>

      {successModalOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(4,5,10,0.72)] px-4 backdrop-blur-sm">
          <Card
            className="w-full max-w-lg p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-success-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-success/12 text-success">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3
                    id="question-success-title"
                    className="text-2xl font-bold tracking-[-0.03em] text-textPrimary"
                  >
                    Pergunta enviada
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-textSecondary">
                    Pergunta enviada com sucesso. Ela será analisada pela equipe
                    de revisão antes de entrar no banco oficial de perguntas.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-2xl px-0"
                onClick={() => setSuccessModalOpen(false)}
                aria-label="Fechar modal"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setSuccessModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function QuestionStatus({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: 'success' | 'warning';
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-textPrimary">{title}</p>
      <p
        className={`mt-2 font-mono text-[11px] uppercase tracking-[0.18em] ${tone === 'success' ? 'text-success' : 'text-warning'}`}
      >
        {status}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Erro de conexão com a API.';
  }

  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
