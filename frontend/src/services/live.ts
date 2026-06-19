export interface LiveMatch {
  id: string;
  event: string;
  sport: string;
  homeCity: string;
  awayCity: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  updatedAt: string;
}

export async function getLiveMatches(): Promise<LiveMatch[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mvp-backend-little-woodland-6494.fly.dev';
  const res = await fetch(`${baseUrl}/api/v1/public/live`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}
