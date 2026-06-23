import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthCard } from './AuthPages';
import { NeonButton } from '../components/ui/NeonButton';
import { Input } from '../components/ui/Input';
import { forgotPassword } from '../lib/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: forgotPassword });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setLocalError('Informe um e-mail válido.');
      return;
    }
    mutation.mutate(normalizedEmail);
  }

  return (
    <AuthCard
      eyebrow="Password Recovery"
      title="Esqueceu sua senha?"
      subtitle="Informe seu e-mail. Se houver uma conta vinculada, enviaremos um link seguro para redefinir sua senha."
      footer={<BackToLogin />}
    >
      {mutation.isSuccess ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/10 px-4 py-4 text-sm leading-6 text-emerald-200"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
          {mutation.data.message}
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label htmlFor="forgot-email" className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-textPrimary">
              <Mail size={16} className="text-indigo-300" /> E-mail
            </span>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="voce@exemplo.com"
              aria-invalid={localError ? 'true' : 'false'}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {localError ? <ErrorMessage>{localError}</ErrorMessage> : null}
          {mutation.isError ? (
            <ErrorMessage>
              Não foi possível enviar as instruções agora. Tente novamente.
            </ErrorMessage>
          ) : null}
          <NeonButton
            className="w-full"
            type="submit"
            variant="app"
            isLoading={mutation.isPending}
          >
            Enviar link de recuperação
          </NeonButton>
        </form>
      )}
    </AuthCard>
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
