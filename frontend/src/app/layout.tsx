'use client';

import { Inter } from 'next/font/google';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const PUBLIC_ROUTES = ['/', '/eventos', '/agenda', '/historico', '/cidades', '/ranking'];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname.startsWith('/eventos')) return true;
  if (pathname.startsWith('/agenda')) return true;
  if (pathname.startsWith('/historico')) return true;
  if (pathname.startsWith('/cidades')) return true;
  if (pathname.startsWith('/ranking')) return true;
  if (pathname.startsWith('/login')) return true;
  return false;
}

function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span
            className="cursor-pointer text-base font-bold tracking-tight"
            onClick={() => router.push('/')}
          >
            MVP Esportivo
          </span>
          <nav className="hidden gap-4 sm:flex">
            <span
              className={`cursor-pointer text-sm ${pathname === '/' || pathname.startsWith('/eventos') ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => router.push('/eventos')}
            >
              Eventos
            </span>
            <span
              className={`cursor-pointer text-sm ${pathname.startsWith('/agenda') ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => router.push('/agenda')}
            >
              Agenda
            </span>
            <span
              className={`cursor-pointer text-sm ${pathname.startsWith('/historico') ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => router.push('/historico')}
            >
              Histórico
            </span>
            <span
              className={`cursor-pointer text-sm ${pathname.startsWith('/cidades') ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => router.push('/cidades')}
            >
              Cidades
            </span>
            <span
              className={`cursor-pointer text-sm ${pathname.startsWith('/ranking') ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => router.push('/ranking')}
            >
              Ranking
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <span
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              onClick={() => router.push('/events')}
            >
              Admin
            </span>
          ) : (
            <span
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              onClick={() => router.push('/login')}
            >
              Entrar
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4">
          <p>MVP Esportivo &mdash; Plataforma de gest&atilde;o de eventos esportivos</p>
          <p className="mt-1">Espa&ccedil;o reservado para patrocinadores</p>
        </div>
      </footer>
    </div>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/40 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">MVP</h2>
      </div>
      <nav className="flex-1 space-y-2">
        <a
          href="/events"
          onClick={(e) => { e.preventDefault(); router.push('/events'); }}
          className="block rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Eventos
        </a>
        <a
          href="/cities"
          onClick={(e) => { e.preventDefault(); router.push('/cities'); }}
          className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Cidades
        </a>
        <a
          href="/city-users"
          onClick={(e) => { e.preventDefault(); router.push('/city-users'); }}
          className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Cidades (Usuários)
        </a>
        <a
          href="/sponsors"
          onClick={(e) => { e.preventDefault(); router.push('/sponsors'); }}
          className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Patrocinadores
        </a>
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); router.push('/'); }}
          className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Site P&uacute;blico
        </a>
      </nav>
      {user && (
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">{user.nome}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
          >
            Sair
          </button>
        </div>
      )}
    </aside>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
    if (user && pathname === '/login') {
      if (user.role === 'CIDADE') router.push('/portal-cidade');
      else router.push('/events');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user && pathname !== '/login') return null;

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (user?.role === 'CIDADE') {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <span className="text-base font-bold tracking-tight cursor-pointer" onClick={() => router.push('/portal-cidade')}>
              Portal da Cidade
            </span>
            <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground" onClick={() => { localStorage.removeItem('@mvp:token'); localStorage.removeItem('@mvp:user'); router.push('/login'); }}>
              Sair
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {isPublic ? (
            <PublicLayout>{children}</PublicLayout>
          ) : (
            <AuthGuard>{children}</AuthGuard>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
