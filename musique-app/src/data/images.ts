/**
 * Resolução de imagens.
 *
 * Os exports do Claude Design referenciam as mídias por `/_blob/<id>`. Só 9
 * desses blobs vieram no pacote (`assets/`, copiados para `public/assets/`);
 * o resto chegou quebrado. Cada id que falta é mapeado aqui para uma foto real
 * da Unsplash com o mesmo assunto do `alt` original.
 *
 * Quando as mídias vierem do banco, basta trocar o corpo de `img()` pela URL
 * real — os componentes não mudam.
 */

const LOCAL = new Set([
  '562fa5e0b44c2bfb4966d048a0e0a5cc',
  '8c05828cc80395269ce165e1604d7d12',
  'aa13cde3e83f53040acbe5eea59bf935',
  'aa4851cf0928a68badd254199ce10193',
  'b9d0e0c6462917737af4f43af3d11f54',
  'c47b0314b0cdc353da6e9f70b197ecef',
  'ca781dd1e6445e3b373de9a2db61e75c',
  'd1498bd93cbbf34e4b76f4d75558d29a',
  'd4df557aba6a1084219f527a6dc8b3dd',
]);

const unsplash = (photo: string, w = 800) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&q=70`;

/** ids de blob que não vieram no export → foto equivalente na Unsplash */
const REMOTE: Record<string, string> = {
  // avatares (rostos)
  d70eb4949c16dfb88fa72b50e071ea33: 'photo-1534954553104-88cb75be7648', // Marina Alves
  '155252e34381c0fec8937ba1dec254c2': 'photo-1504275490777-45f30792f13f', // Dani Prod
  c3f310aced94019c5ebbb4f27e509d6a: 'photo-1591295967474-278e1aa10ecd', // Marcos V
  '67c575cd532301cb170ebf415148a249': 'photo-1506863530036-1efeddceb993', // Estúdio Nove
  cb700d4c42e95328636df33733524ca7: 'photo-1568044852337-9bcc3378fc3c', // partitura.cc
  '81f87a851d7bc9e765031d78a4ed61f7': 'photo-1596215143922-eedeaba0d91c', // Teal Strings
  '45bbabe584bfbec2ef0d732c9551a6da': 'photo-1500648767791-00dcc994a43e', // Rafa Bass

  // fotos (stories, capas de grupo, mídia de post)
  daa3492d772f18df8d7599a12f3f9e6f: 'photo-1510915361894-db8b60106cb1', // violão em luz baixa
  d340387bc462a18fd4d3603e74d519d3: 'photo-1483412033650-1015ddeb83d1', // toca-discos
  '895249eb24946ccc16df6b0e65584e98': 'photo-1598488035139-bdbb2231ce04', // estúdio em luz roxa
  '64967519fa908662372a9f97fab22320': 'photo-1520167112707-56e25f2d7d6e', // partitura
  d659d089e44384c1286f544fda088827: 'photo-1541689592655-f5f52825a3b8', // guitarra azul-esverdeada
  d61651c279f88cfd0222407c4e7a9485: 'photo-1525201548942-d8732f6617a0', // baixo apoiado na parede
  '1c45bb5535bd1f83c2b2eaa4093bdd81': 'photo-1511379938547-c1f69419868d', // worship / palco
  c6f7cbbff1591fb18ac4092537c41a6f: 'photo-1567771736315-133752f63a69', // jovens tocando
  aa13cde3e83f53040acbe5eea59bf935_alt: 'photo-1616714109948-c74fe5029a4d',
};

/** Fotos extras usadas por conteúdo criado dentro do app (novos posts/stories). */
export const EXTRA_PHOTOS = [
  'photo-1580656449278-e8381933522c',
  'photo-1526394931762-90052e97b376',
  'photo-1632582204758-5ac65783517a',
  'photo-1535406208535-1429839cfd13',
  'photo-1693169973609-342539dea9dc',
  'photo-1610557607773-51db1458e1c9',
].map((p) => unsplash(p));

/** Resolve um id de blob do export para uma URL carregável. */
export function img(id: string, w = 800): string {
  if (LOCAL.has(id)) return `/assets/${id}.jpg`;
  const photo = REMOTE[id];
  if (photo) return unsplash(photo, w);
  return FALLBACK;
}

/**
 * Último recurso: um SVG embutido na cor da superfície. Usado no `onError` de
 * toda imagem, então nenhuma mídia quebrada aparece como ícone rasgado.
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
