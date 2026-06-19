'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { organizationsApi, type OrganizationData } from '@/services/organizations';
import { useAuth } from '@/contexts/auth-context';
import SponsorsBar from '@/components/sponsors-bar';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);

  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug) return;
    organizationsApi.getBySlug(slug)
      .then(setOrg)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    if (org?.seoTitle) document.title = org.seoTitle;
    else if (org?.nome) document.title = `${org.nome} - MVP Esportivo`;
  }, [org]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!org) return null;

  const navLinks = [
    { href: `/org/${slug}/eventos`, label: 'Eventos', active: pathname.startsWith(`/org/${slug}/eventos`) },
    { href: `/org/${slug}/agenda`, label: 'Agenda', active: pathname.startsWith(`/org/${slug}/agenda`) },
    { href: `/org/${slug}/historico`, label: 'Histórico', active: pathname.startsWith(`/org/${slug}/historico`) },
    { href: `/org/${slug}/cidades`, label: 'Cidades', active: pathname.startsWith(`/org/${slug}/cidades`) },
    { href: `/org/${slug}/ranking`, label: 'Ranking', active: pathname.startsWith(`/org/${slug}/ranking`) },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {org.logoUrl && <img src={org.logoUrl} alt={org.nome} className="h-8 w-auto" />}
            <span className="cursor-pointer text-base font-bold tracking-tight" onClick={() => router.push(`/org/${slug}`)}>
              {org.nome}
            </span>
          </div>
          <nav className="hidden gap-4 sm:flex">
            {navLinks.map((link) => (
              <span
                key={link.href}
                className={`cursor-pointer text-sm ${link.active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => router.push(link.href)}
              >
                {link.label}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push('/events')}>
                Admin
              </span>
            ) : (
              <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground" onClick={() => router.push('/login')}>
                Entrar
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4">
          <p>{org.nome} &mdash; Plataforma de gest&atilde;o de eventos esportivos</p>
          <SponsorsBar className="mt-4" title="Patrocinadores" />
        </div>
      </footer>
    </div>
  );
}
