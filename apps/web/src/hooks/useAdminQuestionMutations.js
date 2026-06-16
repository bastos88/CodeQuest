import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { adminQueryKeys } from '../lib/admin';
async function invalidateAdminData(queryClient) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminDashboard }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminQuestions }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminStats }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingReviews }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.quizQuestions }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.quizSetupCategories }),
    ]);
}
export function useApproveQuestionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ questionId, payload }) => (await api.post(`/reviews/${questionId}/approve`, payload)).data,
        onSuccess: async () => {
            await invalidateAdminData(queryClient);
        },
    });
}
export function useRejectQuestionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ questionId, payload }) => (await api.post(`/reviews/${questionId}/reject`, payload)).data,
        onSuccess: async () => {
            await invalidateAdminData(queryClient);
        },
    });
}
export function useArchiveQuestionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (questionId) => (await api.post(`/questions/${questionId}/archive`)).data,
        onSuccess: async () => {
            await invalidateAdminData(queryClient);
        },
    });
}
export function useRestoreQuestionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (questionId) => (await api.post(`/questions/${questionId}/restore`)).data,
        onSuccess: async () => {
            await invalidateAdminData(queryClient);
        },
    });
}
export function useDeleteQuestionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (questionId) => {
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
        mutationFn: async ({ questionId, payload }) => (await api.patch(`/questions/${questionId}`, payload)).data,
        onSuccess: async () => {
            await invalidateAdminData(queryClient);
        },
    });
}
