import type { Metadata } from 'next';
import RankingContent from './content';

export const metadata: Metadata = {
  title: 'Ranking Histórico das Cidades',
  description: 'Veja quais cidades possuem mais títulos e melhores campanhas ao longo dos anos.',
};

export default function RankingPage() {
  return <RankingContent />;
}
