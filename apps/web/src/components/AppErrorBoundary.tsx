import { AlertTriangle, RotateCcw } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function AppErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'Tente recarregar a pagina.'
    : 'Tente recarregar a pagina.';

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-xl flex-col items-start gap-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">Algo deu errado.</h1>
          <p className="text-base leading-7 text-muted">{message}</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Recarregar pagina
        </button>
      </section>
    </main>
  );
}
