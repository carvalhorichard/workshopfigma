/**
 * Fotos das telas de entrada (Unsplash).
 *
 * As URLs guardam o parâmetro `ixid` que a Unsplash usa para atribuir a
 * visualização ao fotógrafo — não remova. O crédito visível também é exigido
 * pelas diretrizes da API: https://help.unsplash.com/en/articles/2511245
 */

export type Foto = {
  /** URL base, já com ixid. Os parâmetros de tamanho entram em `fotoUrl`. */
  base: string;
  alt: string;
  autor: string;
  autorUrl: string;
};

export const FOTO_LOGIN: Foto = {
  base:
    'https://images.unsplash.com/photo-1518893883800-45cd0954574b' +
    '?ixid=M3wxMDE3MjIwfDB8MXxzZWFyY2h8OXx8Y2xvc2V1cCUyMGdyYW1vcGhvbmV8ZW58MHx8fHwxNzg5OTMwNjc3fDI' +
    '&ixlib=rb-4.1.0',
  alt: 'Gramofone antigo em close, numa loja de antiguidades',
  autor: 'Sudhith Xavier',
  autorUrl: 'https://unsplash.com/@sudhithxavier',
};

export const FOTO_CADASTRO: Foto = {
  base:
    'https://images.unsplash.com/photo-1612358715408-3ecb2df90cc1' +
    '?ixid=M3wxMDE3MjIwfDB8MXxzZWFyY2h8M3x8YWNvdXN0aWMlMjBndWl0YXIlMjBtb29keSUyMGxpZ2h0fGVufDB8MXx8YmxhY2t8MTc4OTkzMDM4OXwy' +
    '&ixlib=rb-4.1.0',
  alt: 'Piano de parede junto à janela, em luz baixa',
  autor: 'Sven Brandsma',
  autorUrl: 'https://unsplash.com/@seffen99',
};

/** Monta a URL no tamanho pedido, deixando a Unsplash servir WebP/AVIF. */
export function fotoUrl(f: Foto, largura: number): string {
  return `${f.base}&auto=format&fit=crop&q=75&w=${largura}`;
}
