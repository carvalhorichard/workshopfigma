/**
 * Estado do app.
 *
 * A sessão vem do Supabase Auth e os dados das RPCs (src/lib/api.ts).
 * Não existe mais dado em memória: recarregar a página mantém o login e
 * relê tudo do banco.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type {
  Conversa,
  Grupo,
  Notificacao,
  Perfil,
  Post,
  GrupoStories,
  User,
} from '../data/types';

export type ViewName =
  | 'login' | 'cadastro' | 'home' | 'buscar' | 'criar' | 'criar-story'
  | 'grupos' | 'grupo' | 'mensagens' | 'chat' | 'notificacoes' | 'perfil'
  | 'editar-perfil' | 'config' | 'post';

export type SheetName =
  | 'comentarios' | 'compartilhar' | 'menu-post' | 'reacoes' | 'sair' | 'story'
  | 'seguidores' | 'imagem';

export type Route = { view: ViewName; params?: Record<string, string> };
export type Sheet = { name: SheetName; params?: Record<string, string> };
export type Toast = { id: number; texto: string };
export type EstadoFeed = 'carregando' | 'ok' | 'vazio' | 'erro';

type Estado = {
  sessao: Session | null;
  iniciando: boolean;
  perfil: Perfil | null;

  pilha: Route[];
  sheet: Sheet | null;
  toasts: Toast[];

  feed: Post[];
  estadoFeed: EstadoFeed;
  erroFeed: string;
  stories: GrupoStories[];
  grupos: Grupo[];
  conversas: Conversa[];
  notificacoes: Notificacao[];
  sugestoes: User[];

  busca: string;
  filtroGrupos: string;
  abaPerfil: string;
  abaGrupo: string;
  accent: string;
};

const ACCENT_PADRAO = '#6155F5';

type Ctx = {
  s: Estado;
  rota: Route;
  go: (view: ViewName, params?: Record<string, string>) => void;
  back: () => void;
  abrir: (name: SheetName, params?: Record<string, string>) => void;
  fechar: () => void;
  toast: (texto: string) => void;
  set: <K extends keyof Estado>(k: K, v: Estado[K]) => void;
  /** substitui um post na lista após uma ação (curtir, salvar, reagir) */
  aplicarPost: (id: string, patch: Partial<Post>) => void;
  recarregar: (o?: { feed?: boolean; stories?: boolean; grupos?: boolean;
                     conversas?: boolean; notificacoes?: boolean; perfil?: boolean }) => Promise<void>;
  sair: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

let seq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Estado>({
    sessao: null,
    iniciando: true,
    perfil: null,
    pilha: [{ view: 'login' }],
    sheet: null,
    toasts: [],
    feed: [],
    estadoFeed: 'carregando',
    erroFeed: '',
    stories: [],
    grupos: [],
    conversas: [],
    notificacoes: [],
    sugestoes: [],
    busca: '',
    filtroGrupos: 'Todos',
    abaPerfil: 'Publicações',
    abaGrupo: 'Publicações',
    accent: ACCENT_PADRAO,
  });

  const patch = useCallback(
    (p: Partial<Estado> | ((e: Estado) => Partial<Estado>)) =>
      setS((e) => ({ ...e, ...(typeof p === 'function' ? p(e) : p) })),
    [],
  );

  const set = useCallback(
    <K extends keyof Estado>(k: K, v: Estado[K]) => patch({ [k]: v } as Partial<Estado>),
    [patch],
  );

  const toast = useCallback(
    (texto: string) =>
      patch((e) => ({ toasts: [...e.toasts, { id: seq++, texto }] })),
    [patch],
  );

  const go = useCallback(
    (view: ViewName, params?: Record<string, string>) =>
      patch((e) => ({ pilha: [...e.pilha, { view, params }], sheet: null })),
    [patch],
  );

  const back = useCallback(
    () =>
      patch((e) => ({
        pilha: e.pilha.length > 1 ? e.pilha.slice(0, -1) : e.pilha,
        sheet: null,
      })),
    [patch],
  );

  const abrir = useCallback(
    (name: SheetName, params?: Record<string, string>) => patch({ sheet: { name, params } }),
    [patch],
  );
  const fechar = useCallback(() => patch({ sheet: null }), [patch]);

  const aplicarPost = useCallback(
    (id: string, p: Partial<Post>) =>
      patch((e) => ({ feed: e.feed.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
    [patch],
  );

  /* ── carregamento ──────────────────────────────────────────── */

  const recarregar = useCallback(
    async (o?: { feed?: boolean; stories?: boolean; grupos?: boolean;
                  conversas?: boolean; notificacoes?: boolean; perfil?: boolean }) => {
      const tudo = !o;
      const tarefas: Promise<void>[] = [];

      if (tudo || o?.perfil)
        tarefas.push(api.eu().then((p) => patch({ perfil: p })).catch(() => {}));

      if (tudo || o?.feed)
        tarefas.push(
          (async () => {
            patch({ estadoFeed: 'carregando', erroFeed: '' });
            try {
              // Só o que a pessoa segue, o que ela mesma publicou e os grupos
              // de que participa. Sem vitrine pública: quem não segue ninguém
              // vê o estado vazio com sugestões, não o conteúdo dos outros.
              const posts = await api.feed();
              patch({ feed: posts, estadoFeed: posts.length ? 'ok' : 'vazio' });
            } catch (err) {
              patch({
                estadoFeed: 'erro',
                erroFeed: err instanceof Error ? err.message : 'Erro desconhecido',
              });
            }
          })(),
        );

      if (tudo || o?.stories)
        tarefas.push(api.stories().then((v) => patch({ stories: v })).catch(() => {}));
      if (tudo || o?.grupos)
        tarefas.push(api.grupos('Todos').then((v) => patch({ grupos: v })).catch(() => {}));
      if (tudo || o?.conversas)
        tarefas.push(api.conversas().then((v) => patch({ conversas: v })).catch(() => {}));
      if (tudo || o?.notificacoes)
        tarefas.push(api.notificacoes().then((v) => patch({ notificacoes: v })).catch(() => {}));
      if (tudo)
        tarefas.push(api.sugestoes().then((v) => patch({ sugestoes: v })).catch(() => {}));

      await Promise.all(tarefas);
    },
    [patch],
  );

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  /* ── sessão ────────────────────────────────────────────────── */

  const carregou = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      patch({ sessao: data.session, iniciando: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      patch({ sessao, iniciando: false });
      if (evento === 'SIGNED_OUT') {
        carregou.current = null;
        patch({
          perfil: null, feed: [], stories: [], grupos: [], conversas: [],
          notificacoes: [], sugestoes: [], pilha: [{ view: 'login' }], sheet: null,
        });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [patch]);

  // Ao autenticar, carrega tudo uma vez e leva para a Home.
  useEffect(() => {
    const uid = s.sessao?.user.id;
    if (!uid || carregou.current === uid) return;
    carregou.current = uid;
    patch({ pilha: [{ view: 'home' }] });
    void recarregar();
  }, [s.sessao, patch, recarregar]);

  /* ── efeitos de interface ──────────────────────────────────── */

  // cor de destaque escolhida em Configurações
  useEffect(() => {
    const cor = s.perfil ? s.accent : ACCENT_PADRAO;
    const r = document.documentElement;
    r.style.setProperty('--accent', cor);
    const m = /^#(\w{2})(\w{2})(\w{2})$/.exec(cor);
    if (m)
      r.style.setProperty(
        '--accent-soft',
        `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, 0.16)`,
      );
  }, [s.accent, s.perfil]);

  useEffect(() => {
    document.body.dataset.locked = s.sheet ? 'true' : 'false';
  }, [s.sheet]);

  useEffect(() => {
    if (!s.sheet) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [s.sheet, fechar]);

  const vistos = useRef(new Set<number>());
  useEffect(() => {
    s.toasts.forEach((t) => {
      if (vistos.current.has(t.id)) return;
      vistos.current.add(t.id);
      setTimeout(
        () => patch((e) => ({ toasts: e.toasts.filter((x) => x.id !== t.id) })),
        2600,
      );
    });
  }, [s.toasts, patch]);

  const rota = s.pilha[s.pilha.length - 1];

  const valor = useMemo(
    () => ({ s, rota, go, back, abrir, fechar, toast, set, aplicarPost, recarregar, sair }),
    [s, rota, go, back, abrir, fechar, toast, set, aplicarPost, recarregar, sair],
  );

  return <AppCtx.Provider value={valor}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp fora do AppProvider');
  return c;
}

/** Envolve uma ação async mostrando o erro como toast em vez de quebrar a tela. */
export function useAcao() {
  const { toast } = useApp();
  return useCallback(
    async (fn: () => Promise<unknown>, msgOk?: string) => {
      try {
        await fn();
        if (msgOk) toast(msgOk);
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Algo deu errado');
      }
    },
    [toast],
  );
}
