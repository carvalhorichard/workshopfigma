/**
 * Dados mock tipados. Todo o texto vem dos exports do Claude Design — nada de
 * lorem ipsum. Substituir por chamadas de API não muda a forma dos tipos.
 */
import { img } from './images';

export type User = {
  id: string;
  nome: string;
  handle: string;
  avatar: string;
  bio?: string;
  local?: string;
  contexto?: string;
  online?: boolean;
};

export type Post = {
  id: string;
  autorId: string;
  meta: string;
  texto: string;
  mencao?: string;
  cauda?: string;
  tags: string[];
  media: string;
  mediaAlt: string;
  local?: string;
  quando?: string;
  curtidas: number;
  curtido: boolean;
  salvo: boolean;
  reacoes: { emoji: string; label: string; count: number }[];
  minhaReacao?: string;
  comentarios: Comentario[];
};

export type Comentario = {
  id: string;
  autorId: string;
  tempo: string;
  texto: string;
  curtidas: number;
  curtido: boolean;
  autora?: boolean;
  respostaDe?: string;
};

export type Grupo = {
  id: string;
  nome: string;
  cover: string;
  grupos: string;
  membros: string;
  privacidade: 'Público' | 'Privado';
  categoria: string;
  avatares: string[];
  status: 'participando' | 'fora' | 'solicitado';
  sobre: string;
};

export type Story = {
  id: string;
  autorId: string;
  img: string;
  label: string;
  novo: boolean;
  legenda: string;
  tempo: string;
  visto: boolean;
};

export type Conversa = {
  id: string;
  comId: string;
  preview: string;
  hora: string;
  naoLidas: number;
  mensagens: Mensagem[];
};

export type Mensagem = {
  id: string;
  minha: boolean;
  texto: string;
  hora: string;
};

export type Notificacao = {
  id: string;
  grupo: 'Hoje' | 'Esta semana';
  tipo: 'curtida' | 'comentario' | 'seguir' | 'grupo';
  quem: string;
  avatar: string;
  texto: string;
  tempo: string;
  thumb?: string;
  cta?: string;
  ctaPrimario?: boolean;
  lida: boolean;
};

/* ── pessoas ─────────────────────────────────────────────────────────── */

export const EU: User = {
  id: 'eu',
  nome: 'Richard Kulkamp',
  handle: '@richard.k',
  avatar: img('d4df557aba6a1084219f527a6dc8b3dd', 300),
  bio: 'Violão na varanda, vinil na sala. Colecionando disco e gente que gosta de tocar junto.',
  local: 'São Paulo, SP',
};

export const USERS: User[] = [
  EU,
  {
    id: 'elina',
    nome: 'Elina Castro',
    handle: '@elina321',
    avatar: img('b9d0e0c6462917737af4f43af3d11f54', 300),
    contexto: 'Vinis & Discos',
    bio: 'Garimpo de sebo, agulha nova e paciência. Toco pouco, escuto muito.',
    local: 'São Paulo, SP',
    online: true,
  },
  {
    id: 'joao',
    nome: 'João Prado',
    handle: '@joao_violao',
    avatar: img('562fa5e0b44c2bfb4966d048a0e0a5cc', 300),
    contexto: 'Violão e Voz',
    bio: 'Professor de violão. Levada simples, música honesta. Criador do Violão e Voz.',
    local: 'Curitiba, PR',
  },
  {
    id: 'estudio',
    nome: 'Estúdio Nove',
    handle: '@estudio_nove',
    avatar: img('67c575cd532301cb170ebf415148a249', 300),
    contexto: 'Produção Musical',
    bio: 'Estúdio de gravação e mixagem. Aberto de terça a sábado.',
    local: 'São Paulo, SP',
    online: true,
  },
  {
    id: 'marina',
    nome: 'Marina Alves',
    handle: '@marina.violao',
    avatar: img('d70eb4949c16dfb88fa72b50e071ea33', 300),
    contexto: '3 amigos em comum',
    bio: 'Violão, voz e um caderno de cifras que nunca fecha.',
    local: 'Florianópolis, SC',
  },
  {
    id: 'rafa',
    nome: 'Rafa Bass',
    handle: '@baixo_groove',
    avatar: img('45bbabe584bfbec2ef0d732c9551a6da', 300),
    contexto: 'Baixo & Groove',
    bio: 'Groove primeiro, nota depois.',
    local: 'Salvador, BA',
  },
  {
    id: 'dani',
    nome: 'Dani Prod',
    handle: '@dani.prod',
    avatar: img('155252e34381c0fec8937ba1dec254c2', 300),
    contexto: 'Produção Musical',
    bio: 'Produção e beats. Mando take cru sem vergonha.',
    local: 'Recife, PE',
  },
  {
    id: 'teal',
    nome: 'Teal Strings',
    handle: '@teal_strings',
    avatar: img('81f87a851d7bc9e765031d78a4ed61f7', 300),
    contexto: 'Violão e Voz',
    bio: 'Guitarra azul-esverdeada e nada mais.',
    local: 'Porto Alegre, RS',
  },
  {
    id: 'marcos',
    nome: 'Marcos V',
    handle: '@marcos_v',
    avatar: img('c3f310aced94019c5ebbb4f27e509d6a', 300),
    contexto: 'Worship & Música',
    bio: 'Domingo de manhã é ensaio.',
    local: 'Goiânia, GO',
  },
  {
    id: 'partitura',
    nome: 'Partitura CC',
    handle: '@partitura.cc',
    avatar: img('cb700d4c42e95328636df33733524ca7', 300),
    contexto: 'Ensino',
    bio: 'Partituras livres para quem está começando.',
    local: 'Belo Horizonte, MG',
  },
  {
    id: 'lucas',
    nome: 'Lucas Reis',
    handle: '@lucas_reis',
    avatar: img('d4df557aba6a1084219f527a6dc8b3dd', 300),
    contexto: 'Violão e Voz',
    bio: 'Toca no quarto, sonha com o palco.',
    local: 'São Paulo, SP',
  },
  {
    id: 'vinilclube',
    nome: 'Vinil Clube',
    handle: '@vinil_clube',
    avatar: img('155252e34381c0fec8937ba1dec254c2', 300),
    contexto: 'Vinis & Discos',
    bio: 'Clube de troca de discos. Encontro todo primeiro sábado.',
    local: 'São Paulo, SP',
  },
];

export const userById = (id: string): User =>
  USERS.find((u) => u.id === id) ?? EU;

/* ── stories ─────────────────────────────────────────────────────────── */

export const STORIES: Story[] = [
  {
    id: 'st1',
    autorId: 'lucas',
    img: img('daa3492d772f18df8d7599a12f3f9e6f'),
    label: 'lucas_reis',
    novo: true,
    legenda: 'Ensaiando a levada nova antes do trampo 🎸',
    tempo: '3 h',
    visto: false,
  },
  {
    id: 'st2',
    autorId: 'elina',
    img: img('c47b0314b0cdc353da6e9f70b197ecef'),
    label: 'elina321',
    novo: true,
    legenda: 'Achei esse gramofone num sebo hoje. Ainda toca. 🎺',
    tempo: '2 h',
    visto: false,
  },
  {
    id: 'st3',
    autorId: 'estudio',
    img: img('ca781dd1e6445e3b373de9a2db61e75c'),
    label: 'estudio_nove',
    novo: true,
    legenda: 'Sessão virando a noite. Sai sexta.',
    tempo: '5 h',
    visto: false,
  },
  {
    id: 'st4',
    autorId: 'vinilclube',
    img: img('d340387bc462a18fd4d3603e74d519d3'),
    label: 'vinil_clube',
    novo: true,
    legenda: 'Encontro de troca no sábado, traz seus discos.',
    tempo: '7 h',
    visto: false,
  },
  {
    id: 'st5',
    autorId: 'marcos',
    img: img('8c05828cc80395269ce165e1604d7d12'),
    label: 'marcos_v',
    novo: false,
    legenda: 'Parede nova do estúdio ficou assim.',
    tempo: '9 h',
    visto: true,
  },
  {
    id: 'st6',
    autorId: 'dani',
    img: img('895249eb24946ccc16df6b0e65584e98'),
    label: 'dani.prod',
    novo: false,
    legenda: 'Luz roxa, beat pronto.',
    tempo: '12 h',
    visto: true,
  },
  {
    id: 'st7',
    autorId: 'joao',
    img: img('d1498bd93cbbf34e4b76f4d75558d29a'),
    label: 'joao_violao',
    novo: false,
    legenda: 'Dedilhado do domingo.',
    tempo: '14 h',
    visto: true,
  },
  {
    id: 'st8',
    autorId: 'partitura',
    img: img('64967519fa908662372a9f97fab22320'),
    label: 'partitura.cc',
    novo: false,
    legenda: 'Partitura nova no acervo, link na bio.',
    tempo: '16 h',
    visto: true,
  },
  {
    id: 'st9',
    autorId: 'teal',
    img: img('d659d089e44384c1286f544fda088827'),
    label: 'teal_strings',
    novo: false,
    legenda: 'Ela chegou 💚',
    tempo: '18 h',
    visto: true,
  },
  {
    id: 'st10',
    autorId: 'rafa',
    img: img('d61651c279f88cfd0222407c4e7a9485'),
    label: 'baixo_groove',
    novo: false,
    legenda: 'Groove de segunda existe sim.',
    tempo: '20 h',
    visto: true,
  },
];

/* ── posts ───────────────────────────────────────────────────────────── */

export const POSTS: Post[] = [
  {
    id: 'p1',
    autorId: 'elina',
    meta: '5 min · Vinis & Discos',
    texto:
      'Minha coleção cresceu esse mês. Alguma recomendação pro próximo?',
    mencao: '@vinilclube',
    cauda: '💛',
    tags: ['#disco', '#vinil', '#comunidade'],
    media: img('aa13cde3e83f53040acbe5eea59bf935', 1200),
    mediaAlt: 'Parede de loja com dezenas de discos de vinil',
    local: 'São Paulo, SP',
    quando: 'Hoje, 14:32',
    curtidas: 248,
    curtido: false,
    salvo: false,
    reacoes: [
      { emoji: '❤️', label: 'Amei', count: 12 },
      { emoji: '🙌', label: 'Demais', count: 8 },
    ],
    comentarios: [
      {
        id: 'c1',
        autorId: 'joao',
        tempo: '4 min',
        texto:
          'Se achar um Clube da Esquina original, não pensa duas vezes.',
        curtidas: 12,
        curtido: true,
      },
      {
        id: 'c2',
        autorId: 'elina',
        tempo: '3 min',
        texto: 'Tava justamente atrás desse! Obrigada 🙏',
        curtidas: 3,
        curtido: false,
        autora: true,
        respostaDe: 'c1',
      },
      {
        id: 'c3',
        autorId: 'estudio',
        tempo: '3 min',
        texto: 'Que prateleira linda. Onde fica esse sebo?',
        curtidas: 4,
        curtido: false,
      },
      {
        id: 'c4',
        autorId: 'marina',
        tempo: '1 min',
        texto: 'Tenho um sobrando aqui, te mando foto depois 😄',
        curtidas: 2,
        curtido: false,
      },
      {
        id: 'c5',
        autorId: 'rafa',
        tempo: 'agora',
        texto: 'Pega qualquer coisa do selo Odeon que não tem erro.',
        curtidas: 0,
        curtido: false,
      },
    ],
  },
  {
    id: 'p2',
    autorId: 'estudio',
    meta: '22 min · Produção Musical',
    texto:
      'Terminando a mix do single que sai sexta. Ouçam no fone antes de julgar',
    mencao: '@dani.prod',
    cauda: '🎧',
    tags: ['#mixagem', '#estudio'],
    media: img('ca781dd1e6445e3b373de9a2db61e75c', 1200),
    mediaAlt: 'Notebook com uma sessão de áudio aberta sobre a mesa do estúdio',
    local: 'São Paulo, SP',
    quando: 'Hoje, 14:10',
    curtidas: 96,
    curtido: false,
    salvo: false,
    reacoes: [{ emoji: '🔥', label: 'Fogo', count: 31 }],
    comentarios: [
      {
        id: 'c6',
        autorId: 'dani',
        tempo: '18 min',
        texto: 'Manda o take cru que eu comparo aqui.',
        curtidas: 5,
        curtido: false,
      },
      {
        id: 'c7',
        autorId: 'rafa',
        tempo: '9 min',
        texto: 'O baixo tá na frente demais, mas gostei.',
        curtidas: 2,
        curtido: false,
      },
    ],
  },
  {
    id: 'p3',
    autorId: 'joao',
    meta: '12 min · Violão e Voz',
    texto:
      'Alguém tem uma levada boa pra essa progressão? Travei no refrão 🙃',
    tags: ['#levada', '#duvida'],
    media: img('d1498bd93cbbf34e4b76f4d75558d29a', 1200),
    mediaAlt: 'Mão dedilhando um violão',
    local: 'Curitiba, PR',
    quando: 'Hoje, 13:40',
    curtidas: 54,
    curtido: false,
    salvo: false,
    reacoes: [{ emoji: '🎸', label: 'Instrumento', count: 9 }],
    comentarios: [
      {
        id: 'c8',
        autorId: 'marina',
        tempo: '6 min',
        texto: 'Tenta em 6/8, resolve na hora.',
        curtidas: 7,
        curtido: false,
      },
    ],
  },
];

/* ── grupos ──────────────────────────────────────────────────────────── */

const av = (ids: string[]) => ids.map((i) => img(i, 120));

export const GRUPOS: Grupo[] = [
  {
    id: 'g1',
    nome: 'Violão e Voz',
    cover: img('8c05828cc80395269ce165e1604d7d12', 900),
    grupos: '43 grupos',
    membros: '975 membros',
    privacidade: 'Público',
    categoria: 'Violão',
    avatares: av([
      '562fa5e0b44c2bfb4966d048a0e0a5cc',
      'd4df557aba6a1084219f527a6dc8b3dd',
      '81f87a851d7bc9e765031d78a4ed61f7',
      'd70eb4949c16dfb88fa72b50e071ea33',
    ]),
    status: 'participando',
    sobre:
      'Gente que toca e canta junto. Levadas, dedilhados, cifras e os vídeos do ensaio de domingo.',
  },
  {
    id: 'g2',
    nome: 'Produção Musical',
    cover: img('ca781dd1e6445e3b373de9a2db61e75c', 900),
    grupos: '23 grupos',
    membros: '750 membros',
    privacidade: 'Público',
    categoria: 'Produção',
    avatares: av([
      '67c575cd532301cb170ebf415148a249',
      'd70eb4949c16dfb88fa72b50e071ea33',
      'b9d0e0c6462917737af4f43af3d11f54',
    ]),
    status: 'fora',
    sobre:
      'Mixagem, masterização e take cru sem vergonha. Feedback honesto é a regra da casa.',
  },
  {
    id: 'g3',
    nome: 'Vinis & Discos',
    cover: img('d340387bc462a18fd4d3603e74d519d3', 900),
    grupos: '15 grupos',
    membros: '396 membros',
    privacidade: 'Público',
    categoria: 'Vinil',
    avatares: av([
      'b9d0e0c6462917737af4f43af3d11f54',
      '45bbabe584bfbec2ef0d732c9551a6da',
      'd4df557aba6a1084219f527a6dc8b3dd',
    ]),
    status: 'participando',
    sobre: 'Garimpo, troca e conversa sobre disco. Encontro todo primeiro sábado.',
  },
  {
    id: 'g4',
    nome: 'Worship & Música',
    cover: img('1c45bb5535bd1f83c2b2eaa4093bdd81', 900),
    grupos: '34 grupos',
    membros: '4,1 mil membros',
    privacidade: 'Público',
    categoria: 'Worship',
    avatares: av([
      'b9d0e0c6462917737af4f43af3d11f54',
      'c3f310aced94019c5ebbb4f27e509d6a',
      '67c575cd532301cb170ebf415148a249',
    ]),
    status: 'participando',
    sobre: 'Repertório, escalas de ensaio e o domingo de manhã.',
  },
  {
    id: 'g5',
    nome: 'Baixo & Groove',
    cover: img('d61651c279f88cfd0222407c4e7a9485', 900),
    grupos: '22 grupos',
    membros: '3,4 mil membros',
    privacidade: 'Público',
    categoria: 'Baixo',
    avatares: av([
      '45bbabe584bfbec2ef0d732c9551a6da',
      '81f87a851d7bc9e765031d78a4ed61f7',
      'd70eb4949c16dfb88fa72b50e071ea33',
    ]),
    status: 'fora',
    sobre: 'Linhas, levadas e a eterna briga do baixo na mix.',
  },
  {
    id: 'g6',
    nome: 'Estúdio Fechado',
    cover: img('895249eb24946ccc16df6b0e65584e98', 900),
    grupos: '8 grupos',
    membros: '164 membros',
    privacidade: 'Privado',
    categoria: 'Produção',
    avatares: av([
      '67c575cd532301cb170ebf415148a249',
      '81f87a851d7bc9e765031d78a4ed61f7',
      '562fa5e0b44c2bfb4966d048a0e0a5cc',
    ]),
    status: 'fora',
    sobre: 'Grupo fechado para quem grava profissionalmente. Entrada por convite.',
  },
  {
    id: 'g7',
    nome: 'Jovens ONE',
    cover: img('c6f7cbbff1591fb18ac4092537c41a6f', 900),
    grupos: '48 grupos',
    membros: '6,2 mil membros',
    privacidade: 'Público',
    categoria: 'Worship',
    avatares: av([
      'd4df557aba6a1084219f527a6dc8b3dd',
      '562fa5e0b44c2bfb4966d048a0e0a5cc',
      '81f87a851d7bc9e765031d78a4ed61f7',
    ]),
    status: 'fora',
    sobre: 'A galera nova tocando junto pela primeira vez.',
  },
  {
    id: 'g8',
    nome: 'Violão Iniciantes',
    cover: img('64967519fa908662372a9f97fab22320', 900),
    grupos: '11 grupos',
    membros: '2,1 mil membros',
    privacidade: 'Público',
    categoria: 'Violão',
    avatares: av([
      'cb700d4c42e95328636df33733524ca7',
      'd70eb4949c16dfb88fa72b50e071ea33',
      'c3f310aced94019c5ebbb4f27e509d6a',
    ]),
    status: 'fora',
    sobre: 'Primeiro acorde, primeira troca, primeira música inteira.',
  },
  {
    id: 'g9',
    nome: 'Violão Clássico',
    cover: img('daa3492d772f18df8d7599a12f3f9e6f', 900),
    grupos: '6 grupos',
    membros: '412 membros',
    privacidade: 'Privado',
    categoria: 'Violão',
    avatares: av([
      '81f87a851d7bc9e765031d78a4ed61f7',
      '562fa5e0b44c2bfb4966d048a0e0a5cc',
      'b9d0e0c6462917737af4f43af3d11f54',
    ]),
    status: 'fora',
    sobre: 'Repertório erudito, unha e estudo diário.',
  },
  {
    id: 'g10',
    nome: 'Dedilhado & Fingerstyle',
    cover: img('d1498bd93cbbf34e4b76f4d75558d29a', 900),
    grupos: '9 grupos',
    membros: '1,3 mil membros',
    privacidade: 'Público',
    categoria: 'Violão',
    avatares: av([
      '562fa5e0b44c2bfb4966d048a0e0a5cc',
      'd4df557aba6a1084219f527a6dc8b3dd',
      '45bbabe584bfbec2ef0d732c9551a6da',
    ]),
    status: 'fora',
    sobre: 'Arranjo solo, polegar independente e muita paciência.',
  },
];

export const FILTROS_GRUPOS = [
  'Todos',
  'Participando',
  'Sugeridos',
  'Violão',
  'Produção',
  'Vinil',
  'Worship',
];

/* ── mensagens ───────────────────────────────────────────────────────── */

export const CONVERSAS: Conversa[] = [
  {
    id: 'cv1',
    comId: 'elina',
    preview: 'Achei o disco que você procurava!',
    hora: '5 min',
    naoLidas: 2,
    mensagens: [
      { id: 'm1', minha: false, texto: 'Passei no sebo da Augusta hoje', hora: '14:02' },
      {
        id: 'm2',
        minha: false,
        texto:
          'Achei o disco que você procurava! Tava na última prateleira, quase escondido',
        hora: '14:02',
      },
      { id: 'm3', minha: true, texto: 'Não acredito 😍 quanto tá?', hora: '14:05' },
      { id: 'm4', minha: false, texto: '90. E o vinil tá impecável, nem risco', hora: '14:06' },
      { id: 'm5', minha: true, texto: 'Pega pra mim! Te pago sábado no ensaio', hora: '14:07' },
      { id: 'm6', minha: false, texto: 'Fechado. Levo no ensaio então', hora: '14:08' },
    ],
  },
  {
    id: 'cv2',
    comId: 'estudio',
    preview: 'Mando a mix hoje à noite',
    hora: '22 min',
    naoLidas: 1,
    mensagens: [
      { id: 'm7', minha: true, texto: 'E aí, saiu a mix?', hora: '13:30' },
      { id: 'm8', minha: false, texto: 'Mando a mix hoje à noite', hora: '13:44' },
    ],
  },
  {
    id: 'cv3',
    comId: 'joao',
    preview: 'Você: fechou, sábado então',
    hora: '2 h',
    naoLidas: 0,
    mensagens: [
      { id: 'm9', minha: false, texto: 'Ensaio sábado às 15h serve?', hora: '11:10' },
      { id: 'm10', minha: true, texto: 'fechou, sábado então', hora: '11:12' },
    ],
  },
  {
    id: 'cv4',
    comId: 'marina',
    preview: 'Obrigada pela indicação 🙏',
    hora: 'Ontem',
    naoLidas: 0,
    mensagens: [
      { id: 'm11', minha: true, texto: 'Ouve o disco novo do Estúdio Nove', hora: '19:02' },
      { id: 'm12', minha: false, texto: 'Obrigada pela indicação 🙏', hora: '19:40' },
    ],
  },
  {
    id: 'cv5',
    comId: 'dani',
    preview: 'Você: manda o take cru',
    hora: 'Ter',
    naoLidas: 0,
    mensagens: [
      { id: 'm13', minha: true, texto: 'manda o take cru', hora: '09:20' },
    ],
  },
  {
    id: 'cv6',
    comId: 'rafa',
    preview: 'Bora ensaiar essa semana?',
    hora: 'Seg',
    naoLidas: 0,
    mensagens: [
      { id: 'm14', minha: false, texto: 'Bora ensaiar essa semana?', hora: '18:00' },
    ],
  },
];

/* ── notificações ────────────────────────────────────────────────────── */

export const NOTIFICACOES: Notificacao[] = [
  {
    id: 'n1',
    grupo: 'Hoje',
    tipo: 'curtida',
    quem: '@joao_violao',
    avatar: img('562fa5e0b44c2bfb4966d048a0e0a5cc', 200),
    texto: 'curtiu sua publicação.',
    tempo: '12 min',
    thumb: img('aa13cde3e83f53040acbe5eea59bf935', 200),
    lida: false,
  },
  {
    id: 'n2',
    grupo: 'Hoje',
    tipo: 'comentario',
    quem: '@estudio_nove',
    avatar: img('67c575cd532301cb170ebf415148a249', 200),
    texto: 'comentou: “Que prateleira linda. Onde fica esse sebo?”',
    tempo: '28 min',
    thumb: img('aa13cde3e83f53040acbe5eea59bf935', 200),
    lida: false,
  },
  {
    id: 'n3',
    grupo: 'Hoje',
    tipo: 'seguir',
    quem: '@marina.violao',
    avatar: img('d70eb4949c16dfb88fa72b50e071ea33', 200),
    texto: 'começou a seguir você.',
    tempo: '1 h',
    cta: 'Seguir de volta',
    ctaPrimario: true,
    lida: false,
  },
  {
    id: 'n4',
    grupo: 'Esta semana',
    tipo: 'grupo',
    quem: 'Vinis & Discos',
    avatar: img('d340387bc462a18fd4d3603e74d519d3', 200),
    texto: 'convidou você para o grupo.',
    tempo: 'Ontem',
    cta: 'Ver convite',
    lida: true,
  },
  {
    id: 'n5',
    grupo: 'Esta semana',
    tipo: 'comentario',
    quem: '@elina321',
    avatar: img('b9d0e0c6462917737af4f43af3d11f54', 200),
    texto: 'mencionou você em um comentário.',
    tempo: 'Ter',
    thumb: img('8c05828cc80395269ce165e1604d7d12', 200),
    lida: true,
  },
  {
    id: 'n6',
    grupo: 'Esta semana',
    tipo: 'curtida',
    quem: '@baixo_groove',
    avatar: img('45bbabe584bfbec2ef0d732c9551a6da', 200),
    texto: 'e mais 12 pessoas curtiram sua publicação.',
    tempo: 'Seg',
    thumb: img('ca781dd1e6445e3b373de9a2db61e75c', 200),
    lida: true,
  },
];

/* ── perfil ──────────────────────────────────────────────────────────── */

export const MEUS_POSTS = [
  { img: img('aa13cde3e83f53040acbe5eea59bf935', 600), alt: 'Parede de discos de vinil' },
  { img: img('8c05828cc80395269ce165e1604d7d12', 600), alt: 'Parede de violões' },
  { img: img('ca781dd1e6445e3b373de9a2db61e75c', 600), alt: 'Mesa de áudio no estúdio' },
  { img: img('d340387bc462a18fd4d3603e74d519d3', 600), alt: 'Toca-discos com planta ao lado' },
  { img: img('d1498bd93cbbf34e4b76f4d75558d29a', 600), alt: 'Mão dedilhando um violão' },
  { img: img('64967519fa908662372a9f97fab22320', 600), alt: 'Partitura sobre a estante' },
  { img: img('d61651c279f88cfd0222407c4e7a9485', 600), alt: 'Baixo vermelho apoiado na parede' },
  { img: img('895249eb24946ccc16df6b0e65584e98', 600), alt: 'Estúdio em luz roxa' },
  { img: img('d659d089e44384c1286f544fda088827', 600), alt: 'Guitarra azul-esverdeada' },
];

export const INTERESSES = ['Violão', 'Vinil', 'Produção', 'MPB', 'Worship'];

export const EMOJIS_REACAO = [
  { emoji: '❤️', label: 'Amei' },
  { emoji: '👏', label: 'Palmas' },
  { emoji: '💪', label: 'Força' },
  { emoji: '🔥', label: 'Demais' },
  { emoji: '🎸', label: 'Instrumento' },
  { emoji: '😊', label: 'Gostei' },
  { emoji: '😍', label: 'Apaixonei' },
  { emoji: '🙌', label: 'Isso' },
  { emoji: '✨', label: 'Lindo' },
  { emoji: '💯', label: 'Top' },
];

export const BUSCAS_RECENTES = [
  'violão',
  'produção musical',
  'vinil',
  'worship',
  'teclado',
];

export const SUGESTOES_BUSCA = [
  'percussão',
  'violão',
  'teclado',
  'produção musical',
  'vinil',
  'worship',
];
