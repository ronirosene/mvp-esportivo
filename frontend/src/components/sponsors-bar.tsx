import { useEffect, useState } from 'react';
import { sponsorsApi, type SponsorData } from '@/services/sponsors';

interface Props {
  title?: string;
  className?: string;
}

export default function SponsorsBar({ title = 'Patrocinadores Oficiais', className = '' }: Props) {
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);

  useEffect(() => {
    sponsorsApi.listPublic().then((data) => {
      setSponsors(data);
      data.forEach((s) => { sponsorsApi.registerView(s.id).catch(() => {}); });
    }).catch(() => {});
  }, []);

  if (sponsors.length === 0) return null;

  async function handleClick(s: SponsorData) {
    try { await sponsorsApi.registerClick(s.id); } catch {}
    if (s.website) window.open(s.website, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className={className}>
      <h3 className="mb-3 text-center text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((s) => (
          <a
            key={s.id}
            href={s.website || '#'}
            target={s.website ? '_blank' : undefined}
            rel={s.website ? 'nofollow sponsored' : undefined}
            className="group flex flex-col items-center gap-1 opacity-70 transition-opacity hover:opacity-100"
            onClick={(e) => {
              if (s.website) {
                e.preventDefault();
                handleClick(s);
              }
            }}
            title={s.descricao || s.nome}
          >
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.nome} className="h-10 max-w-[120px] object-contain grayscale transition-all group-hover:grayscale-0" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{s.nome}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
