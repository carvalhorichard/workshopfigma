/**
 * Estado único do app: navegação (pilha de views + sheets), dados mock e todas
 * as ações que as telas disparam. Nenhum botão da árvore fica sem handler.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import {
  CONVERSAS,
  EU,
  GRUPOS,
  NOTIFICACOES,
  POSTS,
  STORIES,
  INTERESSES,
  type Conversa,
  type Grupo,
  type Notificacao,
  type Post,
  type Story,
  type User,
} from '../data/db';
import { EXTRA_PHOTOS } from '../data/images';

export type ViewName =
  | 'login'
  | 'cadastro'
  | 'home'
  | 'buscar'
  | 'criar'
  | 'criar-story'
  | 'grupos'
  | 'grupo'
  | 'mensagens'
  | 'chat'
  | 'notificacoes'
  | 'perfil'
  | 'editar-perfil'
  | 'config'
  | 'post';

export type SheetName =
  | 'comentarios'
  | 'compartilhar'
  | 'menu-post'
  | 'reacoes'
  | 'sair'
  | 'story';

export type Route = { view: ViewName; params?: Record<string, string> };
export type Sheet = { name: SheetName; params?: Record<string, string> };
export type Toast = { id: number; texto: string };
export type FeedEstado = 'ok' | 'loading' | 'vazio' | 'erro';

type State = {
  autenticado: boolean;
  pilha: Route[];
  sheet: Sheet | null;
  toasts: Toast[];
  feed: FeedEstado;
  posts: Post[];
  stories: Story[];
  grupos: Grupo[];
  conversas: Conversa[];
  notificacoes: Notificacao[];
  seguindo: Record<string, boolean>;
  perfil: User & { interesses: string[] };
  busca: string;
  filtroGrupos: string;
  accent: string;
  abaPerfil: string;
  abaGrupo: string;
};

const ACCENT_PADRAO = '#6155F5';

const inicial: State = {
  autenticado: false,
  pilha: [{ view: 'login' }],
  sheet: null,
  toasts: [],
  feed: 'ok',
  posts: POSTS,
  stories: STORIES,
  grupos: GRUPOS,
  conversas: CONVERSAS,
  notificacoes: NOTIFICACOES,
  seguindo: { elina: true, estudio: true, joao: false, marina: false, rafa: false },
  perfil: { ...EU, interesses: INTERESSES },
  busca: '',
  filtroGrupos: 'Todos',
  accent: ACCENT_PADRAO,
  abaPerfil: 'Publicações',
  abaGrupo: 'Publicações',
};

type Action =
  | { t: 'go'; route: Route }
  | { t: 'back' }
  | { t: 'reset'; route: Route }
  | { t: 'sheet'; sheet: Sheet | null }
  | { t: 'toast'; texto: string }
  | { t: 'untoast'; id: number }
  | { t: 'feed'; estado: FeedEstado }
  | { t: 'curtir'; postId: string }
  | { t: 'salvar'; postId: string }
  | { t: 'reagir'; postId: string; emoji: string; label: string }
  | { t: 'comentar'; postId: string; texto: string }
  | { t: 'curtir-comentario'; postId: string; comentarioId: string }
  | { t: 'publicar'; texto: string; tags: string[]; grupo?: string }
  | { t: 'publicar-story'; legenda: string }
  | { t: 'seguir'; userId: string }
  | { t: 'grupo-status'; grupoId: string }
  | { t: 'enviar'; conversaId: string; texto: string }
  | { t: 'ler-conversa'; conversaId: string }
  | { t: 'nova-conversa'; userId: string }
  | { t: 'ler-notificacoes' }
  | { t: 'ver-story'; storyId: string }
  | { t: 'busca'; valor: string }
  | { t: 'filtro-grupos'; valor: string }
  | { t: 'accent'; valor: string }
  | { t: 'aba-perfil'; valor: string }
  | { t: 'aba-grupo'; valor: string }
  | { t: 'salvar-perfil'; dados: Partial<State['perfil']> }
  | { t: 'entrar' }
  | { t: 'sair' };

let seq = 1;
const uid = (p: string) => `${p}${Date.now()}${seq++}`;

const agora = () =>
  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'go':
      return { ...s, pilha: [...s.pilha, a.route], sheet: null };
    case 'back':
      return s.pilha.length > 1
        ? { ...s, pilha: s.pilha.slice(0, -1), sheet: null }
        : { ...s, sheet: null };
    case 'reset':
      return { ...s, pilha: [a.route], sheet: null };
    case 'sheet':
      return { ...s, sheet: a.sheet };
    case 'toast':
      return { ...s, toasts: [...s.toasts, { id: seq++, texto: a.texto }] };
    case 'untoast':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case 'feed':
      return { ...s, feed: a.estado };

    case 'curtir':
      return {
        ...s,
        posts: s.posts.map((p) =>
          p.id === a.postId
            ? {
                ...p,
                curtido: !p.curtido,
                curtidas: p.curtidas + (p.curtido ? -1 : 1),
              }
            : p,
        ),
      };

    case 'salvar':
      return {
        ...s,
        posts: s.posts.map((p) =>
          p.id === a.postId ? { ...p, salvo: !p.salvo } : p,
        ),
      };

    case 'reagir':
      return {
        ...s,
        posts: s.posts.map((p) => {
          if (p.id !== a.postId) return p;
          const jaEra = p.minhaReacao === a.emoji;
          let reacoes = p.reacoes.map((r) =>
            r.emoji === p.minhaReacao ? { ...r, count: Math.max(0, r.count - 1) } : r,
          );
          if (!jaEra) {
            const existe = reacoes.find((r) => r.emoji === a.emoji);
            reacoes = existe
              ? reacoes.map((r) =>
                  r.emoji === a.emoji ? { ...r, count: r.count + 1 } : r,
                )
              : [...reacoes, { emoji: a.emoji, label: a.label, count: 1 }];
          }
          return {
            ...p,
            reacoes: reacoes.filter((r) => r.count > 0),
            minhaReacao: jaEra ? undefined : a.emoji,
          };
        }),
      };

    case 'comentar':
      return {
        ...s,
        posts: s.posts.map((p) =>
          p.id === a.postId
            ? {
                ...p,
                comentarios: [
                  ...p.comentarios,
                  {
                    id: uid('c'),
                    autorId: 'eu',
                    tempo: 'agora',
                    texto: a.texto,
                    curtidas: 0,
                    curtido: false,
                  },
                ],
              }
            : p,
        ),
      };

    case 'curtir-comentario':
      return {
        ...s,
        posts: s.posts.map((p) =>
          p.id === a.postId
            ? {
                ...p,
                comentarios: p.comentarios.map((c) =>
                  c.id === a.comentarioId
                    ? {
                        ...c,
                        curtido: !c.curtido,
                        curtidas: c.curtidas + (c.curtido ? -1 : 1),
                      }
                    : c,
                ),
              }
            : p,
        ),
      };

    case 'publicar': {
      const novo: Post = {
        id: uid('p'),
        autorId: 'eu',
        meta: `agora${a.grupo ? ` · ${a.grupo}` : ''}`,
        texto: a.texto,
        tags: a.tags,
        media: EXTRA_PHOTOS[Math.floor(Math.random() * EXTRA_PHOTOS.length)],
        mediaAlt: 'Mídia da sua publicação',
        local: 'São Paulo, SP',
        quando: `Hoje, ${agora()}`,
        curtidas: 0,
        curtido: false,
        salvo: false,
        reacoes: [],
        comentarios: [],
      };
      return { ...s, posts: [novo, ...s.posts], feed: 'ok' };
    }

    case 'publicar-story': {
      const novo: Story = {
        id: uid('st'),
        autorId: 'eu',
        img: EXTRA_PHOTOS[Math.floor(Math.random() * EXTRA_PHOTOS.length)],
        label: 'você',
        novo: true,
        legenda: a.legenda || 'Seu story',
        tempo: 'agora',
        visto: false,
      };
      return { ...s, stories: [novo, ...s.stories] };
    }

    case 'seguir':
      return { ...s, seguindo: { ...s.seguindo, [a.userId]: !s.seguindo[a.userId] } };

    case 'grupo-status':
      return {
        ...s,
        grupos: s.grupos.map((g) => {
          if (g.id !== a.grupoId) return g;
          if (g.privacidade === 'Privado')
            return { ...g, status: g.status === 'fora' ? 'solicitado' : 'fora' };
          return {
            ...g,
            status: g.status === 'participando' ? 'fora' : 'participando',
          };
        }),
      };

    case 'enviar':
      return {
        ...s,
        conversas: s.conversas.map((c) =>
          c.id === a.conversaId
            ? {
                ...c,
                preview: `Você: ${a.texto}`,
                hora: 'agora',
                naoLidas: 0,
                mensagens: [
                  ...c.mensagens,
                  { id: uid('m'), minha: true, texto: a.texto, hora: agora() },
                ],
              }
            : c,
        ),
      };

    case 'ler-conversa':
      return {
        ...s,
        conversas: s.conversas.map((c) =>
          c.id === a.conversaId ? { ...c, naoLidas: 0 } : c,
        ),
      };

    case 'nova-conversa': {
      const existente = s.conversas.find((c) => c.comId === a.userId);
      if (existente) return s;
      const nova: Conversa = {
        id: uid('cv'),
        comId: a.userId,
        preview: 'Conversa nova',
        hora: 'agora',
        naoLidas: 0,
        mensagens: [],
      };
      return { ...s, conversas: [nova, ...s.conversas] };
    }

    case 'ler-notificacoes':
      return { ...s, notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })) };

    case 'ver-story':
      return {
        ...s,
        stories: s.stories.map((st) =>
          st.id === a.storyId ? { ...st, visto: true, novo: false } : st,
        ),
      };

    case 'busca':
      return { ...s, busca: a.valor };
    case 'filtro-grupos':
      return { ...s, filtroGrupos: a.valor };
    case 'accent':
      return { ...s, accent: a.valor };
    case 'aba-perfil':
      return { ...s, abaPerfil: a.valor };
    case 'aba-grupo':
      return { ...s, abaGrupo: a.valor };

    case 'salvar-perfil':
      return { ...s, perfil: { ...s.perfil, ...a.dados } };

    case 'entrar':
      return { ...s, autenticado: true, pilha: [{ view: 'home' }], sheet: null };

    case 'sair':
      return { ...inicial, accent: s.accent };
  }
}

/* ── contexto ────────────────────────────────────────────────────────── */

type Ctx = {
  s: State;
  rota: Route;
  go: (view: ViewName, params?: Record<string, string>) => void;
  back: () => void;
  reset: (view: ViewName) => void;
  abrir: (name: SheetName, params?: Record<string, string>) => void;
  fechar: () => void;
  toast: (texto: string) => void;
  d: React.Dispatch<Action>;
  postAtual: (id?: string) => Post | undefined;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, inicial);
  const rota = s.pilha[s.pilha.length - 1];

  const go = useCallback(
    (view: ViewName, params?: Record<string, string>) =>
      d({ t: 'go', route: { view, params } }),
    [],
  );
  const back = useCallback(() => d({ t: 'back' }), []);
  const reset = useCallback((view: ViewName) => d({ t: 'reset', route: { view } }), []);
  const abrir = useCallback(
    (name: SheetName, params?: Record<string, string>) =>
      d({ t: 'sheet', sheet: { name, params } }),
    [],
  );
  const fechar = useCallback(() => d({ t: 'sheet', sheet: null }), []);
  const toast = useCallback((texto: string) => d({ t: 'toast', texto }), []);

  const postAtual = useCallback(
    (id?: string) => s.posts.find((p) => p.id === (id ?? rota.params?.postId)),
    [s.posts, rota],
  );

  /* accent aplicado como variável CSS, como no editor do design */
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', s.accent);
    const [, rr, gg, bb] = /^#(\w{2})(\w{2})(\w{2})$/.exec(s.accent) ?? [];
    if (rr)
      r.style.setProperty(
        '--accent-soft',
        `rgba(${parseInt(rr, 16)}, ${parseInt(gg, 16)}, ${parseInt(bb, 16)}, 0.16)`,
      );
  }, [s.accent]);

  /* trava o scroll do body enquanto um sheet está aberto */
  useEffect(() => {
    document.body.dataset.locked = s.sheet ? 'true' : 'false';
  }, [s.sheet]);

  /* Escape fecha o sheet do topo */
  useEffect(() => {
    if (!s.sheet) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [s.sheet, fechar]);

  /* toasts somem sozinhos */
  const vistos = useRef(new Set<number>());
  useEffect(() => {
    s.toasts.forEach((t) => {
      if (vistos.current.has(t.id)) return;
      vistos.current.add(t.id);
      setTimeout(() => d({ t: 'untoast', id: t.id }), 2600);
    });
  }, [s.toasts]);

  const valor = useMemo(
    () => ({ s, rota, go, back, reset, abrir, fechar, toast, d, postAtual }),
    [s, rota, go, back, reset, abrir, fechar, toast, postAtual],
  );

  return <AppCtx.Provider value={valor}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp fora do AppProvider');
  return c;
}
