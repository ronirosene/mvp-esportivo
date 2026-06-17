'use client';

import { Inter } from 'next/font/google';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
          href="/"
          onClick={(e) => { e.preventDefault(); router.push('/'); }}
          className="block rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Dashboard
        </a>
        <a
          href="/events"
          onClick={(e) => { e.preventDefault(); router.push('/events'); }}
          className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
