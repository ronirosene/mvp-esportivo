import type { Metadata } from 'next';
import HistoricoContent from './content';

export const metadata: Metadata = {
  title: 'Histórico de Campeões',
  description: 'Consulte campeões, vice-campeões e terceiros colocados de todas as edições.',
};

export default function HistoricoPage() {
  return <HistoricoContent />;
}
