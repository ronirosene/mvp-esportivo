'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-2xl font-bold tracking-tight">Sem Conexão</h1>
      <p className="max-w-md text-muted-foreground">
        Você está offline. Verifique sua conexão com a internet e tente novamente.
      </p>
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        onClick={() => window.location.reload()}
      >
        Tentar Novamente
      </button>
    </div>
  );
}
