/**
 * Tipos do domínio e constantes de interface.
 *
 * Não há mais dado mockado aqui: tudo vem do Supabase (ver src/lib/api.ts).
 * O que sobrou são os tipos que as telas consomem e listas fixas de UI.
 */

export type User = {
  id: string;
  nome: string;
  handle: string;
  avatar: string | null;
  bio?: string | null;
  local?: string | null;
  contexto?: string;
  online?: boolean;
};

export type Perfil = User & {
  capa: string | null;
  interesses: string[];
  admin: boolean;
  publicacoes: number;
  seguidores: number;
  seguindo: number;
  euMesmo: boolean;
  seguindoEsta: boolean;
};

export type Reacao = { emoji: string; count: number };

export type Post = {
  id: string;
  autor: User;
  meta: string;
  texto: string;
  tags: string[];
  media: string | null;
  mediaAlt: string;
  local?: string | null;
  quando: string;
  grupo?: { id: string; nome: string } | null;
  curtidas: number;
  curtido: boolean;
  salvo: boolean;
  comentarios: number;
  reacoes: Reacao[];
  minhaReacao?: string | null;
};

export type Comentario = {
  id: string;
  autor: User;
  tempo: string;
  texto: string;
  curtidas: number;
  curtido: boolean;
  autora: boolean;
  resposta: boolean;
};

export type Grupo = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  cover: string | null;
  privacidade: 'PUBLIC' | 'PRIVATE';
  membros: number;
  subgrupos: number;
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | null;
  avatares: string[];
  interesses: string[];
};

export type Story = {
  id: string;
  autor: User;
  img: string | null;
  legenda: string;
  tempo: string;
  visto: boolean;
};

/** Stories de uma pessoa, agrupados — um card só no trilho, como nas outras redes. */
export type GrupoStories = {
  autor: User;
  stories: Story[];
  /** true quando todos já foram vistos: o anel fica cinza */
  todosVistos: boolean;
  /** capa do card: o primeiro ainda não visto, ou o primeiro de todos */
  capa: string | null;
  /** índice por onde o visualizador começa */
  inicio: number;
};

export type Mensagem = {
  id: string;
  minha: boolean;
  texto: string;
  hora: string;
};

export type Conversa = {
  id: string;
  com: User | null;
  preview: string;
  hora: string;
  naoLidas: number;
};

export type Notificacao = {
  id: string;
  tipo: 'FOLLOW' | 'LIKE' | 'COMMENT' | 'MENTION' | 'GROUP_INVITE' | 'GROUP_REQUEST'
      | 'GROUP_ACCEPTED' | 'MESSAGE' | 'STORY_REPLY' | 'POST_SHARE';
  quem: string;
  avatar: string | null;
  texto: string;
  tempo: string;
  thumb?: string | null;
  postId?: string | null;
  lida: boolean;
  grupo: 'Hoje' | 'Esta semana' | 'Antes';
};

/* ── constantes de interface ─────────────────────────────────── */

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

export const FILTROS_GRUPOS = [
  'Todos',
  'Participando',
  'Sugeridos',
  'Violão',
  'Produção',
  'Vinil',
  'Worship',
];

export const SUGESTOES_BUSCA = [
  'percussão',
  'violão',
  'teclado',
  'produção musical',
  'vinil',
  'worship',
];

export const INTERESSES_SUGERIDOS = [
  'Violão',
  'Vinil',
  'Produção',
  'MPB',
  'Worship',
  'Baixo',
  'Teclado',
  'Percussão',
  'Fingerstyle',
  'Ensino',
];
