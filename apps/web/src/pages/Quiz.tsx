import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, Sparkles, Trophy } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../lib/api';
import { difficultyCopy } from '../lib/quiz';
import { clearQuizSession, readQuizSession } from '../lib/quizSession';

type PendingAnswer = {
  questionId: string;
  alternativeId: string;
  timeSpentSeconds: number;
};

type QuizSubmitResponse = {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  xpEarned: number;
  level: number;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
};

export function Quiz() {
  const navigate = useNavigate();
  const session = useMemo(() => readQuizSession(), []);
  const startedAtRef = useRef(Date.now());
  const questionCardRef = useRef<HTMLDivElement | null>(null);
  const hasQuestionChangedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<PendingAnswer[]>([]);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/quiz', {
        replace: true,
        state: { notice: 'Configure seu desafio antes de começar.' },
      });
    }
  }, [navigate, session]);

  useEffect(() => {
    if (session && session.questions.length === 0) {
      clearQuizSession();
      navigate('/quiz', {
        replace: true,
        state: { notice: 'Configure seu desafio antes de começar.' },
      });
    }
  }, [navigate, session]);

  useEffect(() => {
    if (!hasQuestionChangedRef.current) {
      hasQuestionChangedRef.current = true;
      return;
    }

    questionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [index]);

  const submitMutation = useMutation({
    mutationFn: async (pendingAnswers: PendingAnswer[]) => {
      if (!session) throw new Error('Sessão não encontrada.');
      return (
        await api.post<QuizSubmitResponse>('/quizzes/submit', {
          quizSessionId: session.quizSessionId,
          answers: pendingAnswers,
        })
      ).data;
    },
    onSuccess: (data) => {
      clearQuizSession();
      setResult(data);
    },
  });

  if (!session) return null;

  const question = session.questions[index];
  const currentDifficulty = difficultyCopy[session.setup.difficulty];
  const isLastQuestion = index === session.questions.length - 1;
  const progress = session.questions.length > 0 ? (index / session.questions.length) * 100 : 0;

  if (!question && !result) return null;

  if (result) {
    return (
      <Card className="mx-auto max-w-4xl overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(43,224,140,0.16),transparent_20rem)]" />
        <div className="relative text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] bg-success/12 text-success">
            <CheckCircle2 size={34} />
          </div>
          <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary">Desafio concluído</h2>
          <p className="mt-3 text-base text-textSecondary">
            Resultado consolidado no backend, sem revelar respostas corretas durante a sessão.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResultMetric label="Precisão" value={`${result.accuracy}%`} icon={Trophy} />
            <ResultMetric label="Acertos" value={`${result.correctCount}/${result.totalQuestions}`} icon={Sparkles} />
            <ResultMetric label="XP ganho" value={`+${result.xpEarned}`} icon={CheckCircle2} />
            <ResultMetric label="Novo nível" value={`Lv ${result.level}`} icon={Clock3} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                navigate('/quiz');
              }}
            >
              Configurar novo desafio
            </Button>
            <Button
              onClick={() => {
                navigate('/dashboard');
              }}
            >
              Voltar ao dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.16),transparent_18rem)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="section-kicker">quiz.session</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-textPrimary">
                Pergunta {index + 1} de {session.questions.length}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-textSecondary">
                Desafio em andamento com correção apenas na submissão final.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <SessionBadge label="Dificuldade" value={currentDifficulty.label} />
              <SessionBadge
                label="Categorias"
                value={`${session.setup.categoryIds.length} selecionada${session.setup.categoryIds.length > 1 ? 's' : ''}`}
              />
              <SessionBadge label="Progresso" value={`${answers.length}/${session.questions.length}`} />
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar value={progress} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <Card ref={questionCardRef} className="scroll-mt-24 p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">{question?.category}</p>
                <h3 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-textPrimary">{question?.prompt}</h3>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-right">
                <div className="font-mono text-sm text-textSecondary">{index + 1}/{session.questions.length}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-textMuted">questão</div>
              </div>
            </div>

            <div className="grid gap-3">
              {question?.alternatives.map((alternative) => {
                const selected = selectedAlternativeId === alternative.id;

                return (
                  <button
                    key={alternative.id}
                    type="button"
                    onClick={() => setSelectedAlternativeId(alternative.id)}
                    className={`flex min-h-16 items-center justify-between gap-4 rounded-[1.25rem] border px-5 py-4 text-left transition duration-150 ease-premium ${
                      selected
                        ? 'border-primary/35 bg-primary/10 text-textPrimary shadow-[0_0_0_1px_rgba(108,99,255,0.14)]'
                        : 'border-white/8 bg-white/[0.025] text-textSecondary hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.04] hover:text-textPrimary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Circle className={`h-5 w-5 shrink-0 ${selected ? 'text-primary' : 'text-textMuted'}`} />
                      <span className="text-base font-semibold">{alternative.text}</span>
                    </div>
                    {selected ? <CheckCircle2 size={18} className="text-primary" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-textSecondary">
              Sua resposta fica registrada, mas a validação acontece somente após a submissão final.
            </div>

            {submitMutation.isError ? (
              <div className="mt-4 flex items-start gap-3 rounded-[1rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
                <span>{getSubmitErrorMessage(submitMutation.error)}</span>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  clearQuizSession();
                  navigate('/quiz');
                }}
              >
                <ArrowLeft size={16} />
                Reconfigurar
              </Button>
              <Button
                className="sm:min-w-56"
                loading={submitMutation.isPending}
                disabled={!selectedAlternativeId}
                onClick={() => {
                  if (!question || !selectedAlternativeId) return;

                  const nextAnswers = [
                    ...answers,
                    {
                      questionId: question.id,
                      alternativeId: selectedAlternativeId,
                      timeSpentSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
                    },
                  ];

                  if (isLastQuestion) {
                    submitMutation.mutate(nextAnswers);
                    setAnswers(nextAnswers);
                    return;
                  }

                  setAnswers(nextAnswers);
                  setSelectedAlternativeId(null);
                  setIndex((current) => current + 1);
                  startedAtRef.current = Date.now();
                }}
              >
                {isLastQuestion ? 'Finalizar desafio' : 'Próxima pergunta'}
                {!submitMutation.isPending ? <ArrowRight size={16} /> : null}
              </Button>
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="p-6">
            <p className="section-kicker">Sessão</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary">Leitura rápida</h3>
            <div className="mt-5 space-y-3">
              <SidebarRow label="Questões totais" value={`${session.questions.length}`} />
              <SidebarRow label="Respondidas" value={`${answers.length}`} />
              <SidebarRow label="Restantes" value={`${session.questions.length - answers.length}`} />
              <SidebarRow label="Categoria atual" value={question?.category ?? '-'} />
            </div>
          </Card>

          <Card className="p-6">
            <p className="section-kicker">Anti-cheat</p>
            <h3 className="mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary">Correção protegida</h3>
            <p className="mt-3 text-sm leading-6 text-textSecondary">
              Nenhuma resposta correta é enviada antes da submissão. O frontend só registra escolhas e tempos de resposta.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SessionBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-textMuted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-textPrimary">{value}</p>
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-textSecondary">{label}</span>
      <span className="font-mono text-sm font-semibold text-textPrimary">{value}</span>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 text-left">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success">
        <Icon size={18} />
      </div>
      <p className="font-mono text-3xl font-extrabold text-textPrimary">{value}</p>
      <p className="mt-2 text-sm text-textSecondary">{label}</p>
    </div>
  );
}

function getSubmitErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message;
    if (message) return message;
  }

  if (error instanceof Error) return error.message;
  return 'Não foi possível finalizar o desafio. Tente novamente.';
}
