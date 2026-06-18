import type { Metadata } from 'next';
import CidadesContent from './content';

export const metadata: Metadata = {
  title: 'Cidades Participantes',
  description: 'Lista de cidades participantes com títulos e histórico esportivo.',
};

export default function CidadesPage() {
  return <CidadesContent />;
}
