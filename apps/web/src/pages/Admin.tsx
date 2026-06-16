import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Archive, Check, FileEdit, FileWarning, Gauge, RotateCcw, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react';
import type { ApproveReviewInput } from '@codequest/shared';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import {
  useApproveQuestionMutation,
  useArchiveQuestionMutation,
  useDeleteQuestionMutation,
  useRejectQuestionMutation,
  useRestoreQuestionMutation,
  useUpdateQuestionMutation,
} from '../hooks/useAdminQuestionMutations';
import {
  adminQueryKeys,
  difficultyLabel,
  getStatusTone,
  statusLabel,
  type AdminDashboardMetrics,
  type AdminQuestionRecord,
  type AdminStatsResponse,
  type PendingReviewRecord,
} from '../lib/admin';
import { api } from '../lib/api';

const emptyApproveChecklist = (): ApproveReviewInput['checklist'] => ({
  clearStatement: false,
  onlyOneCorrect: false,
  plausibleAlternatives: false,
  noTechnicalError: false,
  correctCategory: false,
  correctDifficulty: false,
  usefulExplanation: false,
});

const checklistLabels: Array<{ key: keyof ApproveReviewInput['checklist']; label: string }> = [
  { key: 'clearStatement', label: 'Enunciado claro' },
  { key: 'onlyOneCorrect', label: 'Apenas uma correta' },
  { key: 'plausibleAlternatives', label: 'Alternativas plausíveis' },
  { key: 'noTechnicalError', label: 'Sem erro técnico' },
  { key: 'correctCategory', label: 'Categoria correta' },
  { key: 'correctDifficulty', label: 'Dificuldade correta' },
  { key: 'usefulExplanation', label: 'Explicação útil' },
];

type ModerationQuestion = PendingReviewRecord | AdminQuestionRecord;

type ConfirmState = {
  question: ModerationQuestion;
  action: 'archive' | 'delete' | 'restore';
  message: string;
};

type EditState = {
  questionId: string;
  prompt: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  categoryId: string;
};

export function Admin() {
  const { user } = useAuth();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [approveChecklist, setApproveChecklist] = useState<ApproveReviewInput['checklist']>(emptyApproveChecklist);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectState, setRejectState] = useState<{ question: ModerationQuestion; reason: string; notes: string } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const canModerate = user?.role === 'ADMIN' || user?.role === 'REVIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const pendingReviewsQuery = useQuery({
    queryKey: adminQueryKeys.pendingReviews,
    queryFn: async () => (await api.get<PendingReviewRecord[]>('/reviews/pending')).data,
    enabled: canModerate,
  });

  const adminDashboardQuery = useQuery({
    queryKey: adminQueryKeys.adminDashboard,
    queryFn: async () => (await api.get<AdminDashboardMetrics>('/admin/dashboard')).data,
    enabled: isAdmin,
  });

  const adminQuestionsQuery = useQuery({
    queryKey: adminQueryKeys.adminQuestions,
    queryFn: async () => (await api.get<AdminQuestionRecord[]>('/admin/questions')).data,
    enabled: isAdmin,
  });

  const adminStatsQuery = useQuery({
    queryKey: adminQueryKeys.adminStats,
    queryFn: async () => (await api.get<AdminStatsResponse>('/admin/stats')).data,
    enabled: isAdmin,
  });

  const approveMutation = useApproveQuestionMutation();
  const rejectMutation = useRejectQuestionMutation();
  const archiveMutation = useArchiveQuestionMutation();
  const deleteMutation = useDeleteQuestionMutation();
  const restoreMutation = useRestoreQuestionMutation();
  const updateMutation = useUpdateQuestionMutation();

  const pendingReviews = pendingReviewsQuery.data ?? [];
  const adminQuestions = adminQuestionsQuery.data ?? [];
  const selectedQuestion = pendingReviews.find((question) => question.id === selectedQuestionId) ?? pendingReviews[0] ?? null;

  useEffect(() => {
    if (!selectedQuestionId && pendingReviews.length > 0) {
      const firstQuestion = pendingReviews[0];
      if (firstQuestion) setSelectedQuestionId(firstQuestion.id);
      return;
    }

    if (selectedQuestionId && !pendingReviews.some((question) => question.id === selectedQuestionId)) {
      setSelectedQuestionId(pendingReviews[0]?.id ?? null);
    }
  }, [pendingReviews, selectedQuestionId]);

  useEffect(() => {
    setApproveChecklist(emptyApproveChecklist());
    setApproveNotes('');
    setActionError(null);
  }, [selectedQuestion?.id]);

  const categoryOptions = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string }>();
    for (const question of adminQuestions) {
      grouped.set(question.category.id, { id: question.category.id, name: question.category.name });
    }
    return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [adminQuestions]);

  if (!canModerate) {
    return (
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-danger/12 text-danger">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-textPrimary">Acesso restrito</h2>
            <p className="mt-2 text-sm text-textSecondary">
              Esta área exige perfil <span className="text-textPrimary">ADMIN</span> ou <span className="text-textPrimary">REVIEWER</span>.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <section className="grid gap-4 md:grid-cols-4">
          <AdminMetric
            label="Usuários"
            value={String(adminDashboardQuery.data?.users ?? 0)}
            icon={Gauge}
            tone="info"
            loading={adminDashboardQuery.isLoading}
          />
          <AdminMetric
            label="Perguntas"
            value={String(adminDashboardQuery.data?.questions ?? 0)}
            icon={FileWarning}
            tone="primary"
            loading={adminDashboardQuery.isLoading}
          />
          <AdminMetric
            label="Pendentes"
            value={String(adminDashboardQuery.data?.pending ?? pendingReviews.length)}
            icon={Archive}
            tone="warning"
            loading={adminDashboardQuery.isLoading && pendingReviews.length === 0}
          />
          <AdminMetric
            label="Reports"
            value={String(adminDashboardQuery.data?.reports ?? 0)}
            icon={Trash2}
            tone="danger"
            loading={adminDashboardQuery.isLoading}
          />
        </section>
      ) : null}

      {actionError ? (
        <Card className="border-danger/20 p-4">
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      ) : null}

      {actionMessage ? (
        <Card className="border-success/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-success">{actionMessage}</p>
            <Button variant="ghost" className="h-8 w-8 rounded-xl px-0" onClick={() => setActionMessage(null)} aria-label="Fechar mensagem">
              <X size={14} />
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-kicker">review.console</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-textPrimary">Admin review</h2>
              <p className="mt-2 text-sm text-textSecondary">
                Aprovação exige checklist completo. Rejeição exige motivo. Arquivamento remove a pergunta do quiz sem apagar o histórico.
              </p>
            </div>
            <Badge tone="warning">{pendingReviews.length} pendente(s)</Badge>
          </div>

          {pendingReviewsQuery.isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[1.5rem] border border-white/6 bg-white/[0.03]" />
              ))}
            </div>
          ) : pendingReviewsQuery.isError ? (
            <InlineState
              title="Não foi possível carregar a fila de revisão."
              description={getErrorMessage(pendingReviewsQuery.error)}
              tone="danger"
            />
          ) : pendingReviews.length === 0 ? (
            <EmptyReviewState />
          ) : (
            <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="border-r border-white/6">
                {pendingReviews.map((question) => {
                  const active = question.id === selectedQuestion?.id;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setSelectedQuestionId(question.id)}
                      className={`w-full border-b border-white/6 px-5 py-4 text-left transition ${
                        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone="warning">{difficultyLabel[question.difficulty]}</Badge>
                        <span className="text-xs text-textMuted">{question.category.name}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-semibold text-textPrimary">{question.prompt}</p>
                      <p className="mt-2 text-xs text-textSecondary">
                        {question.author?.name ?? 'Autor desconhecido'} · {question.alternatives.length} alternativas
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedQuestion ? (
                <div className="space-y-6 px-6 py-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="warning">Pendente</Badge>
                      <Badge tone="info">{selectedQuestion.category.name}</Badge>
                      <Badge tone="default">{difficultyLabel[selectedQuestion.difficulty]}</Badge>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-textPrimary">{selectedQuestion.prompt}</h3>
                    <p className="mt-3 text-sm text-textSecondary">
                      Autor: {selectedQuestion.author?.name ?? 'Sem autor'} · {selectedQuestion.author?.email ?? 'sem email'}
                    </p>
                    {selectedQuestion.explanation ? (
                      <div className="mt-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Explicação</p>
                        <p className="mt-2 text-sm leading-6 text-textSecondary">{selectedQuestion.explanation}</p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-textPrimary">Alternativas</p>
                    <div className="mt-3 grid gap-3">
                      {selectedQuestion.alternatives.map((alternative, index) => (
                        <div key={alternative.id} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-sm text-textPrimary">
                            <span className="mr-2 font-mono text-textMuted">{String.fromCharCode(65 + index)}.</span>
                            {alternative.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-textPrimary">Checklist obrigatório</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {checklistLabels.map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-textSecondary"
                        >
                          <input
                            type="checkbox"
                            checked={approveChecklist[item.key]}
                            onChange={(event) =>
                              setApproveChecklist((current) => ({
                                ...current,
                                [item.key]: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-border bg-transparent"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                    <label className="mt-4 block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Notas de aprovação</span>
                      <textarea
                        value={approveNotes}
                        onChange={(event) => setApproveNotes(event.target.value)}
                        rows={4}
                        className="field-area"
                        placeholder="Notas internas opcionais para histórico de revisão."
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      loading={approveMutation.isPending && approveMutation.variables?.questionId === selectedQuestion.id}
                      loadingText="Aprovando..."
                      onClick={async () => {
                        try {
                          setActionError(null);
                          setActionMessage(null);
                          await approveMutation.mutateAsync({
                            questionId: selectedQuestion.id,
                            payload: { checklist: approveChecklist, notes: approveNotes.trim() || undefined },
                          });
                          setActionMessage('Pergunta aprovada com sucesso.');
                        } catch (error) {
                          setActionError(getErrorMessage(error));
                        }
                      }}
                    >
                      <Check size={16} />
                      Aprovar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRejectState({ question: selectedQuestion, reason: '', notes: '' })}
                    >
                      <X size={16} />
                      Rejeitar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setConfirmState({
                          question: selectedQuestion,
                          action: 'archive',
                          message: 'Esta pergunta será removida do quiz, mas permanecerá no histórico.',
                        })
                      }
                    >
                      <Archive size={16} />
                      Arquivar
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/12 text-success">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-[-0.03em] text-textPrimary">Regras do fluxo</h3>
                <p className="mt-2 text-sm text-textSecondary">
                  Aprovação ativa a pergunta no quiz. Rejeição exige motivo. Arquivamento retira do quiz sem apagar histórico.
                </p>
              </div>
            </div>
          </Card>

          {isAdmin ? (
            <Card className="p-6">
              <p className="section-kicker">status.summary</p>
              <h3 className="mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary">Distribuição atual</h3>
              <div className="mt-5 grid gap-3">
                {(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'] as const).map((status) => (
                  <div key={status} className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <span className="text-sm text-textSecondary">{statusLabel[status]}</span>
                    <span className="font-mono text-sm font-semibold text-textPrimary">
                      {adminStatsQuery.data?.statusCounts[status] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="section-kicker">role.scope</p>
              <h3 className="mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary">Perfil reviewer</h3>
              <p className="mt-3 text-sm leading-6 text-textSecondary">
                Você pode aprovar, rejeitar e arquivar perguntas. Dashboard completo e exclusão definitiva continuam restritos ao perfil ADMIN.
              </p>
            </Card>
          )}
        </div>
      </div>

      {isAdmin ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/6 px-6 py-5">
            <div>
              <p className="section-kicker">admin.questions</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-textPrimary">Banco de perguntas</h2>
              <p className="mt-2 text-sm text-textSecondary">Ações administrativas atualizam status, contadores e dashboard sem refresh manual.</p>
            </div>
            <Badge tone="info">{adminQuestions.length} total</Badge>
          </div>

          {adminQuestionsQuery.isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-[1rem] border border-white/6 bg-white/[0.03]" />
              ))}
            </div>
          ) : adminQuestionsQuery.isError ? (
            <InlineState
              title="Não foi possível carregar as perguntas administrativas."
              description={getErrorMessage(adminQuestionsQuery.error)}
              tone="danger"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left">
                    {['Pergunta', 'Categoria', 'Dificuldade', 'Status', 'Uso', 'Ações'].map((heading) => (
                      <th
                        key={heading}
                        className="border-b border-white/6 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminQuestions.map((question) => (
                    <tr key={question.id} className="glass-table-row align-top">
                      <td className="px-6 py-4">
                        <p className="max-w-[420px] text-sm font-semibold text-textPrimary">{question.prompt}</p>
                        <p className="mt-2 text-xs text-textSecondary">
                          {question.author?.name ?? 'Sem autor'} · última revisão{' '}
                          {question.reviewedAt ? new Date(question.reviewedAt).toLocaleDateString('pt-BR') : 'pendente'}
                        </p>
                        {question.rejectionReason ? (
                          <p className="mt-2 text-xs text-danger">Motivo: {question.rejectionReason}</p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary">{question.category.name}</td>
                      <td className="px-6 py-4 text-sm text-textSecondary">{difficultyLabel[question.difficulty]}</td>
                      <td className="px-6 py-4">
                        <Badge tone={getStatusTone(question.status)}>{statusLabel[question.status]}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary">{question.usedCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {question.status !== 'APPROVED' && question.status !== 'ARCHIVED' ? (
                            <Button
                              variant="secondary"
                              className="h-9 rounded-xl px-3 text-xs"
                              loading={approveMutation.isPending && approveMutation.variables?.questionId === question.id}
                              loadingText="Aprovando..."
                              onClick={async () => {
                                try {
                                  setActionError(null);
                                  setActionMessage(null);
                                  await approveMutation.mutateAsync({
                                    questionId: question.id,
                                    payload: {
                                      checklist: {
                                        clearStatement: true,
                                        onlyOneCorrect: true,
                                        plausibleAlternatives: true,
                                        noTechnicalError: true,
                                        correctCategory: true,
                                        correctDifficulty: true,
                                        usefulExplanation: true,
                                      },
                                    },
                                  });
                                  setActionMessage('Pergunta aprovada com sucesso.');
                                } catch (error) {
                                  setActionError(getErrorMessage(error));
                                }
                              }}
                            >
                              Aprovar
                            </Button>
                          ) : null}
                          {question.status !== 'REJECTED' && question.status !== 'ARCHIVED' ? (
                            <Button
                              variant="secondary"
                              className="h-9 rounded-xl px-3 text-xs"
                              onClick={() => setRejectState({ question, reason: '', notes: '' })}
                            >
                              Rejeitar
                            </Button>
                          ) : null}
                          {question.status !== 'ARCHIVED' ? (
                            <Button
                              variant="ghost"
                              className="h-9 rounded-xl px-3 text-xs"
                              onClick={() =>
                                setConfirmState({
                                  question,
                                  action: 'archive',
                                  message: 'Esta pergunta será removida do quiz, mas permanecerá no histórico.',
                                })
                              }
                            >
                              Arquivar
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              className="h-9 rounded-xl px-3 text-xs"
                              onClick={() =>
                                setConfirmState({
                                  question,
                                  action: 'restore',
                                  message: 'Esta pergunta voltará para o banco ativo de perguntas aprovadas.',
                                })
                              }
                            >
                              <RotateCcw size={14} />
                              Restaurar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className="h-9 rounded-xl px-3 text-xs"
                            onClick={() =>
                              setEditState({
                                questionId: question.id,
                                prompt: question.prompt,
                                explanation: question.explanation ?? '',
                                difficulty: question.difficulty,
                                categoryId: question.category.id,
                              })
                            }
                          >
                            <FileEdit size={14} />
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            className="h-9 rounded-xl px-3 text-xs"
                            onClick={() =>
                              setConfirmState({
                                question,
                                action: 'delete',
                                message: 'Tem certeza que deseja excluir esta pergunta? Essa ação não pode ser desfeita.',
                              })
                            }
                          >
                            <Trash2 size={14} />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}

      {rejectState ? (
        <ModalShell
          title="Rejeitar pergunta"
          description="Explique o motivo da rejeição. O envio fica bloqueado enquanto o motivo estiver vazio."
          onClose={() => setRejectState(null)}
        >
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Motivo da rejeição</span>
            <textarea
              value={rejectState.reason}
              onChange={(event) => setRejectState((current) => (current ? { ...current, reason: event.target.value } : current))}
              rows={5}
              className="field-area"
              placeholder="Explique o motivo com pelo menos 10 caracteres."
            />
            <p className="mt-2 text-xs text-textMuted">
              Mínimo de 10 caracteres. Atual: {rejectState.reason.trim().length}/10
            </p>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Notas internas</span>
            <textarea
              value={rejectState.notes}
              onChange={(event) => setRejectState((current) => (current ? { ...current, notes: event.target.value } : current))}
              rows={3}
              className="field-area"
              placeholder="Notas opcionais para o histórico da revisão."
            />
          </label>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejectState(null)}>Cancelar</Button>
            <Button
              variant="danger"
              loading={rejectMutation.isPending}
              loadingText="Rejeitando..."
              disabled={rejectState.reason.trim().length < 10}
              onClick={async () => {
                try {
                  setActionError(null);
                  setActionMessage(null);
                  await rejectMutation.mutateAsync({
                    questionId: rejectState.question.id,
                    payload: {
                      rejectionReason: rejectState.reason.trim(),
                      notes: rejectState.notes.trim() || undefined,
                    },
                  });
                  setRejectState(null);
                  setActionMessage('Pergunta rejeitada com sucesso.');
                } catch (error) {
                  setActionError(getErrorMessage(error));
                }
              }}
            >
              Confirmar rejeição
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {confirmState ? (
        <ModalShell
          title={
            confirmState.action === 'delete'
              ? 'Excluir pergunta'
              : confirmState.action === 'restore'
                ? 'Restaurar pergunta'
                : 'Arquivar pergunta'
          }
          description={confirmState.message}
          onClose={() => setConfirmState(null)}
        >
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmState(null)}>Cancelar</Button>
            <Button
              variant={confirmState.action === 'delete' ? 'danger' : 'secondary'}
              loading={
                (confirmState.action === 'delete' && deleteMutation.isPending) ||
                (confirmState.action === 'archive' && archiveMutation.isPending) ||
                (confirmState.action === 'restore' && restoreMutation.isPending)
              }
              loadingText={
                confirmState.action === 'delete'
                  ? 'Excluindo...'
                  : confirmState.action === 'restore'
                    ? 'Restaurando...'
                    : 'Arquivando...'
              }
              onClick={async () => {
                try {
                  setActionError(null);
                  setActionMessage(null);
                  if (confirmState.action === 'delete') {
                    await deleteMutation.mutateAsync(confirmState.question.id);
                    setActionMessage('Pergunta excluída com sucesso.');
                  } else if (confirmState.action === 'restore') {
                    await restoreMutation.mutateAsync(confirmState.question.id);
                    setActionMessage('Pergunta restaurada com sucesso.');
                  } else {
                    await archiveMutation.mutateAsync(confirmState.question.id);
                    setActionMessage('Pergunta arquivada com sucesso.');
                  }
                  setConfirmState(null);
                } catch (error) {
                  const message = getErrorMessage(error);
                  setActionError(message);

                  if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 409 &&
                    confirmState.question.status !== 'ARCHIVED'
                  ) {
                    setConfirmState({
                      question: confirmState.question,
                      action: 'archive',
                      message: 'Esta pergunta já foi usada. Ela não pode ser excluída e deve ser arquivada.',
                    });
                    return;
                  }

                  setConfirmState(null);
                }
              }}
            >
              {confirmState.action === 'delete'
                ? 'Excluir definitivamente'
                : confirmState.action === 'restore'
                  ? 'Restaurar'
                  : 'Arquivar'}
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {editState ? (
        <ModalShell
          title="Editar pergunta"
          description="Ajuste prompt, explicação, dificuldade e categoria. A atualização invalida as listas automaticamente."
          onClose={() => setEditState(null)}
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Prompt</span>
              <textarea
                value={editState.prompt}
                onChange={(event) => setEditState((current) => (current ? { ...current, prompt: event.target.value } : current))}
                rows={5}
                className="field-area"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Explicação</span>
              <textarea
                value={editState.explanation}
                onChange={(event) => setEditState((current) => (current ? { ...current, explanation: event.target.value } : current))}
                rows={4}
                className="field-area"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Dificuldade</span>
                <select
                  value={editState.difficulty}
                  onChange={(event) =>
                    setEditState((current) => (current ? { ...current, difficulty: event.target.value as EditState['difficulty'] } : current))
                  }
                  className="field"
                >
                  <option value="EASY">Fácil</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HARD">Difícil</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">Categoria</span>
                <select
                  value={editState.categoryId}
                  onChange={(event) => setEditState((current) => (current ? { ...current, categoryId: event.target.value } : current))}
                  className="field"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditState(null)}>Cancelar</Button>
            <Button
              loading={updateMutation.isPending}
              loadingText="Salvando..."
              disabled={!editState.prompt.trim()}
              onClick={async () => {
                try {
                  setActionError(null);
                  setActionMessage(null);
                  await updateMutation.mutateAsync({
                    questionId: editState.questionId,
                    payload: {
                      prompt: editState.prompt.trim(),
                      difficulty: editState.difficulty,
                      categoryId: editState.categoryId,
                      ...(editState.explanation.trim() ? { explanation: editState.explanation.trim() } : {}),
                    },
                  });
                  setEditState(null);
                  setActionMessage('Pergunta atualizada com sucesso.');
                } catch (error) {
                  setActionError(getErrorMessage(error));
                }
              }}
            >
              Salvar alterações
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

function AdminMetric({
  label,
  value,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
  tone: 'primary' | 'info' | 'warning' | 'danger';
  loading: boolean;
}) {
  const tones = {
    primary: 'bg-primary/12 text-primary',
    info: 'bg-info/12 text-info',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
  };

  return (
    <Card className="p-5">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-mono text-3xl font-extrabold text-textPrimary">{loading ? '...' : value}</p>
      <p className="mt-2 text-sm text-textSecondary">{label}</p>
    </Card>
  );
}

function InlineState({ title, description, tone }: { title: string; description: string; tone: 'danger' | 'warning' }) {
  const toneClasses = tone === 'danger' ? 'border-danger/25 bg-danger/10' : 'border-warning/25 bg-warning/10';

  return (
    <div className={`rounded-[1.5rem] border px-5 py-4 ${toneClasses}`}>
      <p className="font-semibold text-textPrimary">{title}</p>
      <p className="mt-2 text-sm text-textSecondary">{description}</p>
    </div>
  );
}

function EmptyReviewState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/12 text-success">
        <Check size={24} />
      </div>
      <h3 className="mt-5 text-xl font-bold text-textPrimary">Nenhuma pergunta pendente</h3>
      <p className="mt-2 text-sm text-textSecondary">
        Quando usuários enviarem novas perguntas, elas aparecerão aqui.
      </p>
    </div>
  );
}

function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const titleId = `modal-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-[rgba(4,5,10,0.82)] px-4 backdrop-blur-sm">
      <Card
        className="relative z-[10000] w-full max-w-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id={titleId} className="text-2xl font-bold tracking-[-0.03em] text-textPrimary">
              {title}
            </h3>
            <p className="mt-2 text-sm text-textSecondary">{description}</p>
          </div>

          <Button
            variant="ghost"
            className="h-10 w-10 rounded-2xl px-0"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="mt-6">{children}</div>
      </Card>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Erro de conexão com a API.';
  }

  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
