import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { ApproveReviewInput, RejectReviewInput } from '@codequest/shared';
import { api } from '../lib/api';
import { adminQueryKeys } from '../lib/admin';

type UpdateQuestionInput = {
  questionId: string;
  payload: {
    categoryId?: string;
    prompt?: string;
    explanation?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  };
};

async function invalidateAdminData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminDashboard }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminQuestions }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingReviews }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.quizQuestions }),
    queryClient.invalidateQueries({
      queryKey: adminQueryKeys.quizSetupCategories,
    }),
  ]);
}

export function useApproveQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: ApproveReviewInput;
    }) => (await api.post(`/reviews/${questionId}/approve`, payload)).data,
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useRejectQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: RejectReviewInput;
    }) => (await api.post(`/reviews/${questionId}/reject`, payload)).data,
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useArchiveQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) =>
      (await api.post(`/questions/${questionId}/archive`)).data,
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useRestoreQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) =>
      (await api.post(`/questions/${questionId}/restore`)).data,
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      await api.delete(`/questions/${questionId}`);
    },
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, payload }: UpdateQuestionInput) =>
      (await api.patch(`/questions/${questionId}`, payload)).data,
    onSuccess: async () => {
      await invalidateAdminData(queryClient);
    },
  });
}
