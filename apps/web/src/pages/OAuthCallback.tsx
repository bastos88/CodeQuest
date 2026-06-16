import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';

export function OAuthCallback() {
  const navigate = useNavigate();
  const { persistOAuthSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const oauthError = params.get('error');

    if (oauthError) {
      setError('Nao foi possivel concluir o login social. Verifique a configuracao OAuth.');
      return;
    }

    if (!accessToken || !refreshToken) {
      setError('Resposta OAuth invalida.');
      return;
    }

    persistOAuthSession(accessToken, refreshToken)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Nao foi possivel iniciar a sessao OAuth.'));
  }, [navigate, persistOAuthSession]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-textPrimary">
      <Card className="w-full max-w-md p-7 text-center">
        <h1 className="text-2xl font-bold text-white">Login social</h1>
        <p className="mt-3 text-sm text-textSecondary">
          {error ?? 'Concluindo autenticacao...'}
        </p>
        {error ? (
          <Link to="/login" className="mt-6 inline-flex text-sm font-semibold text-primary hover:text-primaryHover">
            Voltar para login
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
