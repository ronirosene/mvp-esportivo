export class UpdateOrganizationDto {
  nome?: string;
  slug?: string;
  logoUrl?: string;
  descricao?: string;
  ativo?: boolean;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  seoTitle?: string;
  seoDescription?: string;
  seoFavicon?: string;
}
