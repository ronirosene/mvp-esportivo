import type { Metadata } from 'next';
import CityDetailContent from './content';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { cityHistoryApi } = await import('@/services/city-history');
    const city = await cityHistoryApi.get(params.id);
    return {
      title: `${city.nome} - Histórico Esportivo`,
      description: `Veja títulos, participações e histórico esportivo da cidade ${city.nome}.`,
    };
  } catch {
    return { title: 'Cidade - Histórico Esportivo' };
  }
}

export default function CityDetailPage() {
  return <CityDetailContent />;
}
