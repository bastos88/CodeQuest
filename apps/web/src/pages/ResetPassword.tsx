import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from './AuthPages';
import { NeonButton } from '../components/ui/NeonButton';
import { Input } from '../components/ui/Input';
import { resetPassword } from '../lib/auth';

export function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: resetPassword });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!token) {
      setLocalError('Este link de recuperação é inválido ou expirou.');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('A confirmação da senha não confere.');
      return;
    }
    mutation.mutate({ token, newPassword, confirmPassword });
  }

  const apiError = mutation.isError ? getResetError(mutation.error) : null;

  return (
    <AuthCard
      eyebrow="Password Recovery"
      title="Crie uma nova senha"
      subtitle="Use uma senha com pelo menos 8 caracteres. O link é válido uma única vez."
      footer={!mutation.isSuccess ? <BackToLogin /> : undefined}
    >
      {mutation.isSuccess ? (
        <div className="space-y-5">
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/10 px-4 py-4 text-sm text-emerald-200"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            {mutation.data.message}
          </div>
          <NeonButton
            className="w-full"
            variant="app"
            onClick={() => navigate('/login')}
          >
            Ir para o login
          </NeonButton>
        </div>
      ) : !token ? (
        <div className="space-y-5">
          <ErrorMessage>
            Este link de recuperação é inválido ou expirou.
          </ErrorMessage>
          <BackToLogin />
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <PasswordField
            id="reset-password"
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            id="reset-password-confirm"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {localError ? <ErrorMessage>{localError}</ErrorMessage> : null}
          {apiError ? <ErrorMessage>{apiError}</ErrorMessage> : null}
          <NeonButton
            className="w-full"
            type="submit"
            variant="app"
            isLoading={mutation.isPending}
          >
            Redefinir senha
          </NeonButton>
        </form>
      )}
    </AuthCard>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-textPrimary">
        <LockKeyhole size={16} className="text-indigo-300" /> {label}
      </span>
      <Input
        id={id}
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function BackToLogin() {
  return (
    <Link
      to="/login"
      className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary"
    >
      <ArrowLeft size={16} /> Voltar para login
    </Link>
  );
}

function ErrorMessage({ children }: { children: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-red-200"
    >
      {children}
    </div>
  );
}

function getResetError(error: unknown) {
  if (
    axios.isAxiosError<{ message?: string }>(error) &&
    error.response?.status === 400
  ) {
    return (
      error.response.data.message ??
      'Este link de recuperação é inválido ou expirou.'
    );
  }
  return 'Não foi possível redefinir a senha. Tente novamente.';
}
