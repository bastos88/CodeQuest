import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, ImageOff, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getProfile,
  profileQueryKeys,
  updatePassword,
  updateProfile,
} from '../../lib/profile';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

export function ProfileSettingsCard() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const profileQuery = useQuery({
    queryKey: profileQueryKeys.me,
    queryFn: getProfile,
    retry: false,
  });
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profileQuery.data) return;
    setName(profileQuery.data.name);
    setAvatarUrl(profileQuery.data.avatarUrl ?? '');
  }, [profileQuery.data]);

  useEffect(() => setAvatarPreviewFailed(false), [avatarUrl]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(profileQueryKeys.me, (current: unknown) => ({
        ...(typeof current === 'object' && current ? current : {}),
        ...updatedProfile,
      }));
      await Promise.all([
        refreshUser(),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.me }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            typeof queryKey[0] === 'string' && queryKey[0].includes('ranking'),
        }),
      ]);
      setProfileSuccess('Perfil atualizado com sucesso.');
    },
    onError: (error) => setProfileError(getApiError(error)),
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: ({ message }) => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(message);
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
    },
    onError: (error) => setPasswordError(getApiError(error)),
  });

  function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    const normalizedName = name.trim();
    const normalizedAvatarUrl = avatarUrl.trim();

    if (normalizedName.length < 2 || normalizedName.length > 30) {
      setProfileError('O nome deve ter entre 2 e 30 caracteres.');
      return;
    }
    if (normalizedAvatarUrl && !HTTP_URL_PATTERN.test(normalizedAvatarUrl)) {
      setProfileError('Informe uma URL de avatar válida usando http ou https.');
      return;
    }

    profileMutation.mutate({
      name: normalizedName,
      avatarUrl: normalizedAvatarUrl || null,
    });
  }

  function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da senha não confere.');
      return;
    }
    if (currentPassword && currentPassword === newPassword) {
      setPasswordError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    passwordMutation.mutate({
      ...(currentPassword ? { currentPassword } : {}),
      newPassword,
      confirmPassword,
    });
  }

  const initials = getInitials(name || profileQuery.data?.name || 'CQ');
  const visibleAvatar = avatarUrl.trim() && !avatarPreviewFailed;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
            <UserRound size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">
              Perfil
            </h3>
            <p className="mt-1 text-sm text-textSecondary">
              Atualize como você aparece no CodeQuest.
            </p>
          </div>
        </div>

        {profileQuery.isLoading ? (
          <StatusMessage>Carregando perfil...</StatusMessage>
        ) : null}
        {profileQuery.isError ? (
          <StatusMessage tone="error">
            Não foi possível carregar seu perfil.
          </StatusMessage>
        ) : null}

        {profileQuery.data ? (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,#6c63ff,#a855f7)] text-2xl font-black text-white shadow-[0_16px_36px_rgba(108,99,255,0.24)]">
                {visibleAvatar ? (
                  <img
                    src={avatarUrl.trim()}
                    alt="Prévia do avatar"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarPreviewFailed(true)}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <FieldLabel htmlFor="profile-avatar">
                  URL da foto de perfil
                </FieldLabel>
                <Input
                  id="profile-avatar"
                  type="url"
                  value={avatarUrl}
                  placeholder="https://exemplo.com/avatar.jpg"
                  onChange={(event) => setAvatarUrl(event.target.value)}
                />
                {avatarUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 px-3 text-danger"
                    onClick={() => setAvatarUrl('')}
                  >
                    <ImageOff size={16} /> Remover foto
                  </Button>
                ) : null}
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="profile-name">
                Nickname / nome de exibição
              </FieldLabel>
              <Input
                id="profile-name"
                value={name}
                minLength={2}
                maxLength={30}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
              <Input
                id="profile-email"
                value={profileQuery.data.email}
                disabled
                className="opacity-60"
              />
              <p className="mt-2 text-xs text-textMuted">
                O e-mail não pode ser alterado pelo Dashboard.
              </p>
            </div>

            {profileError ? (
              <StatusMessage tone="error">{profileError}</StatusMessage>
            ) : null}
            {profileSuccess ? (
              <StatusMessage tone="success">{profileSuccess}</StatusMessage>
            ) : null}
            <Button
              type="submit"
              loading={profileMutation.isPending}
              loadingText="Salvando..."
            >
              Salvar perfil
            </Button>
          </form>
        ) : null}
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">
              Segurança
            </h3>
            <p className="mt-1 text-sm text-textSecondary">
              Altere ou crie uma senha local sem desconectar seus logins
              sociais.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <FieldLabel htmlFor="current-password">Senha atual</FieldLabel>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <p className="mt-2 text-xs text-textMuted">
              Opcional apenas se sua conta ainda não possui senha local.
            </p>
          </div>
          <div>
            <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="confirm-password">
              Confirmar nova senha
            </FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {passwordError ? (
            <StatusMessage tone="error">{passwordError}</StatusMessage>
          ) : null}
          {passwordSuccess ? (
            <StatusMessage tone="success">{passwordSuccess}</StatusMessage>
          ) : null}
          <Button
            type="submit"
            loading={passwordMutation.isPending}
            loadingText="Alterando..."
          >
            Alterar senha
          </Button>
        </form>
      </Card>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-textPrimary"
    >
      {children}
    </label>
  );
}

function StatusMessage({
  children,
  tone = 'neutral',
}: {
  children: string;
  tone?: 'neutral' | 'error' | 'success';
}) {
  const styles = {
    neutral: 'border-white/8 bg-white/[0.03] text-textSecondary',
    error: 'border-danger/25 bg-danger/10 text-red-200',
    success: 'border-success/25 bg-success/10 text-emerald-200',
  };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-center gap-2 rounded-[1rem] border px-4 py-3 text-sm ${styles[tone]}`}
    >
      {tone === 'success' ? (
        <CheckCircle2 size={17} className="shrink-0 text-success" />
      ) : null}
      {children}
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CQ'
  );
}

function getApiError(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      'Não foi possível concluir a atualização.'
    );
  }
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a atualização.';
}
