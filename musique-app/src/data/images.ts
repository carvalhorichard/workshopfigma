/**
 * Imagem de reserva.
 *
 * As mídias agora vêm do Supabase Storage (bucket `media`). Este SVG é o que
 * aparece quando uma URL falha, para nenhuma imagem renderizar quebrada.
 */
export const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#2C2B2F"/><stop offset="1" stop-color="#242326"/>
       </linearGradient></defs>
       <rect width="400" height="400" fill="url(#g)"/>
       <g fill="none" stroke="#4A494E" stroke-width="10" stroke-linecap="round">
         <circle cx="200" cy="230" r="46"/><path d="M246 230V120l70-22v110"/>
         <circle cx="296" cy="208" r="26"/>
       </g>
     </svg>`,
  );

/** Avatar genérico para quem ainda não enviou foto. */
export function avatarPadrao(nome: string): string {
  const letra = (nome.trim()[0] ?? '?').toUpperCase();
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
         <rect width="200" height="200" fill="#2C2B2F"/>
         <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
               font-family="Inter, sans-serif" font-size="88" font-weight="600"
               fill="#858487">${letra}</text>
       </svg>`,
    )
  );
}
