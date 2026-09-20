/**
 * Camada de dados: tudo que o app lê ou escreve passa por aqui.
 * Cada função chama uma RPC do Postgres e converte o JSON para os tipos
 * de src/data/types.ts, para as telas não lidarem com snake_case.
 */
import { rpc, supabase } from './supabase';
import type {
  Comentario,
  Conversa,
  Grupo,
  Mensagem,
  Notificacao,
  Perfil,
  Post,
  Story,
  User,
} from '../data/types';

/* ── utilidades ──────────────────────────────────────────────── */

/** "há 5 min", "2 h", "Ontem" — o formato que as telas já mostravam. */
export function tempoRelativo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'Ontem';
  if (s < 604800) return `${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

type Json = Record<string, any>;

function paraUser(j: Json | null): User {
  if (!j) return { id: '', nome: 'Conta removida', handle: '@?', avatar: null };
  return {
    id: j.id,
    nome: j.name,
    handle: `@${j.handle}`,
    avatar: j.avatar_url ?? null,
  };
}

function paraPost(j: Json): Post {
  const grupo = j.group ? { id: j.group.id, nome: j.group.name } : null;
  return {
    id: j.id,
    autor: paraUser(j.author),
    meta: `${tempoRelativo(j.created_at)}${grupo ? ` · ${grupo.nome}` : ''}`,
    texto: j.body ?? '',
    tags: (j.tags ?? []).map((t: string) => `#${t}`),
    media: j.media?.[0]?.url ?? null,
    mediaAlt: j.media?.[0]?.alt_text ?? '',
    local: j.location_name,
    quando: new Date(j.created_at).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }),
    grupo,
    curtidas: Number(j.like_count ?? 0),
    curtido: !!j.viewer?.liked,
    salvo: !!j.viewer?.bookmarked,
    comentarios: Number(j.comment_count ?? 0),
    reacoes: (j.reactions ?? []).map((r: Json) => ({ emoji: r.emoji, count: Number(r.count) })),
    minhaReacao: j.viewer?.reaction ?? null,
  };
}

/* ── autenticação ────────────────────────────────────────────── */

export const auth = {
  async entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(traduzErroAuth(error.message));
  },

  async cadastrar(email: string, senha: string, nome: string, handle: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { name: nome, handle: handle.replace('@', '').toLowerCase() } },
    });
    if (error) throw new Error(traduzErroAuth(error.message));
    // Se a confirmação por e-mail estiver ligada, não vem sessão.
    return { precisaConfirmar: !data.session };
  },

  async sair() {
    await supabase.auth.signOut();
  },

  async recuperar(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(traduzErroAuth(error.message));
  },
};

function traduzErroAuth(m: string): string {
  const s = m.toLowerCase();
  if (s.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (s.includes('already registered')) return 'Já existe uma conta com esse e-mail.';
  if (s.includes('password should be')) return 'A senha precisa de pelo menos 6 caracteres.';
  if (s.includes('unable to validate email')) return 'E-mail inválido.';
  if (s.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (s.includes('duplicate key') && s.includes('handle')) return 'Esse @ já está em uso.';
  return m;
}

/* ── upload ──────────────────────────────────────────────────── */

/** Envia para o bucket `media`, na pasta do próprio usuário. */
export async function enviarArquivo(file: File): Promise<string> {
  const { data: sessao } = await supabase.auth.getUser();
  const uid = sessao.user?.id;
  if (!uid) throw new Error('Faça login para enviar imagens.');

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const caminho = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(caminho, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(`Falha no upload: ${error.message}`);

  return supabase.storage.from('media').getPublicUrl(caminho).data.publicUrl;
}

/* ── leitura ─────────────────────────────────────────────────── */

export const api = {
  async eu(): Promise<Perfil | null> {
    const j = await rpc<Json | null>('get_me');
    if (!j) return null;
    return {
      ...paraUser(j),
      bio: j.bio,
      local: j.location,
      capa: j.cover_url ?? null,
      interesses: j.interests ?? [],
      admin: !!j.is_admin,
      publicacoes: Number(j.counts?.posts ?? 0),
      seguidores: Number(j.counts?.followers ?? 0),
      seguindo: Number(j.counts?.following ?? 0),
      euMesmo: true,
      seguindoEsta: false,
    };
  },

  async feed(): Promise<Post[]> {
    return (await rpc<Json[]>('get_feed', { p_limit: 30 })).map(paraPost);
  },

  async explorar(): Promise<Post[]> {
    return (await rpc<Json[]>('get_explore', { p_limit: 30 })).map(paraPost);
  },

  async post(id: string): Promise<Post | null> {
    const j = await rpc<Json | null>('get_post', { p_id: id });
    return j ? paraPost(j) : null;
  },

  async postsDoUsuario(handle: string): Promise<Post[]> {
    return (await rpc<Json[]>('get_user_posts', {
      p_handle: handle.replace('@', ''),
    })).map(paraPost);
  },

  async salvos(): Promise<Post[]> {
    return (await rpc<Json[]>('get_bookmarks')).map(paraPost);
  },

  async stories(): Promise<Story[]> {
    return (await rpc<Json[]>('get_stories')).map((j) => ({
      id: j.id,
      autor: paraUser(j.author),
      img: j.media_url ?? null,
      legenda: j.caption ?? '',
      tempo: tempoRelativo(j.created_at),
      visto: !!j.seen,
    }));
  },

  async perfil(handle: string): Promise<Perfil | null> {
    const j = await rpc<Json | null>('get_profile', { p_handle: handle.replace('@', '') });
    if (!j) return null;
    return {
      ...paraUser(j),
      bio: j.bio,
      local: j.location,
      capa: j.cover_url ?? null,
      interesses: j.interests ?? [],
      admin: false,
      publicacoes: Number(j.counts?.posts ?? 0),
      seguidores: Number(j.counts?.followers ?? 0),
      seguindo: Number(j.counts?.following ?? 0),
      euMesmo: !!j.is_me,
      seguindoEsta: !!j.following,
    };
  },

  async grupos(filtro = 'Todos'): Promise<Grupo[]> {
    return (await rpc<Json[]>('get_groups', { p_filter: filtro })).map(paraGrupo);
  },

  async grupo(id: string) {
    const j = await rpc<Json | null>('get_group', { p_id: id });
    if (!j) return null;
    return {
      ...paraGrupo(j),
      membrosLista: (j.members ?? []).map((m: Json) => ({
        ...paraUser(m),
        contexto: m.role === 'OWNER' ? 'Criador' : m.role === 'ADMIN' ? 'Admin' : '',
      })),
      posts: (j.posts ?? []).map(paraPost),
    };
  },

  async comentarios(postId: string): Promise<Comentario[]> {
    return (await rpc<Json[]>('get_comments', { p_post_id: postId })).map((j) => ({
      id: j.id,
      autor: paraUser(j.author),
      tempo: tempoRelativo(j.created_at),
      texto: j.body,
      curtidas: Number(j.like_count ?? 0),
      curtido: !!j.liked,
      autora: !!j.is_author_of_post,
      resposta: !!j.parent_id,
    }));
  },

  async conversas(): Promise<Conversa[]> {
    return (await rpc<Json[]>('get_conversations')).map((j) => ({
      id: j.id,
      com: j.other ? paraUser(j.other) : null,
      preview: j.last_message
        ? `${j.last_message.mine ? 'Você: ' : ''}${j.last_message.body}`
        : 'Conversa nova',
      hora: tempoRelativo(j.last_message?.sent_at ?? j.updated_at),
      naoLidas: Number(j.unread ?? 0),
    }));
  },

  async mensagens(conversaId: string): Promise<Mensagem[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, body, sent_at, sender_id')
      .eq('conversation_id', conversaId)
      .is('deleted_at', null)
      .order('sent_at', { ascending: true });
    if (error) throw new Error(error.message);

    const { data: s } = await supabase.auth.getUser();
    return (data ?? []).map((m) => ({
      id: m.id,
      minha: m.sender_id === s.user?.id,
      texto: m.body,
      hora: hora(m.sent_at),
    }));
  },

  async notificacoes(): Promise<Notificacao[]> {
    const textos: Record<string, string> = {
      FOLLOW: 'começou a seguir você.',
      LIKE: 'curtiu sua publicação.',
      COMMENT: 'comentou na sua publicação.',
      MENTION: 'mencionou você.',
      MESSAGE: 'mandou uma mensagem.',
      STORY_REPLY: 'respondeu seu story.',
      GROUP_INVITE: 'convidou você para um grupo.',
      GROUP_REQUEST: 'pediu para entrar no grupo.',
      GROUP_ACCEPTED: 'aceitou você no grupo.',
      POST_SHARE: 'compartilhou sua publicação.',
    };

    return (await rpc<Json[]>('get_notifications')).map((j) => {
      const idade = Date.now() - new Date(j.created_at).getTime();
      return {
        id: j.id,
        tipo: j.type,
        quem: j.actor ? `@${j.actor.handle}` : 'Musique',
        avatar: j.actor?.avatar_url ?? null,
        texto:
          j.type === 'COMMENT' && j.comment_body
            ? `comentou: “${j.comment_body}”`
            : (textos[j.type] ?? 'interagiu com você.'),
        tempo: tempoRelativo(j.created_at),
        thumb: j.thumb ?? null,
        postId: j.post_id ?? null,
        lida: !!j.is_read,
        grupo:
          idade < 86400_000 ? 'Hoje' : idade < 604800_000 ? 'Esta semana' : 'Antes',
      };
    });
  },

  async buscar(q: string) {
    const j = await rpc<Json>('search_all', { p_query: q });
    return {
      pessoas: (j.people ?? []).map((p: Json) => ({
        ...paraUser(p),
        bio: p.bio,
        contexto: p.following ? 'Você segue' : '',
      })),
      grupos: (j.groups ?? []).map((g: Json) => paraGrupo(g)),
      posts: (j.posts ?? []).map(paraPost),
    };
  },

  /** Lista de seguidores ou de quem a pessoa segue. */
  async listaSeguidores(
    handle: string,
    tipo: 'followers' | 'following',
  ): Promise<(User & { segue: boolean; euMesmo: boolean })[]> {
    const j = await rpc<Json[]>('get_follow_list', {
      p_handle: handle.replace('@', ''),
      p_tipo: tipo,
    });
    return j.map((p) => ({
      ...paraUser(p),
      bio: p.bio,
      segue: !!p.following,
      euMesmo: !!p.is_me,
    }));
  },

  async sugestoes(): Promise<User[]> {
    return (await rpc<Json[]>('get_suggestions')).map((p) => ({
      ...paraUser(p),
      bio: p.bio,
    }));
  },

  /* ── escrita ─────────────────────────────────────────────── */

  curtir: (postId: string) => rpc<Json>('toggle_like', { p_post_id: postId }),
  salvar: (postId: string) => rpc<Json>('toggle_bookmark', { p_post_id: postId }),
  reagir: (postId: string, emoji: string | null) =>
    rpc<Json>('set_reaction', { p_post_id: postId, p_emoji: emoji }),
  seguir: (userId: string) => rpc<Json>('toggle_follow', { p_user_id: userId }),
  participarGrupo: (grupoId: string) =>
    rpc<Json>('toggle_group_membership', { p_group_id: grupoId }),
  curtirComentario: (id: string) => rpc<Json>('toggle_comment_like', { p_comment_id: id }),
  marcarStoryVisto: (id: string) => rpc<void>('mark_story_seen', { p_story_id: id }),
  lerNotificacoes: () => rpc<number>('mark_notifications_read'),
  lerConversa: (id: string) => rpc<void>('mark_conversation_read', { p_conversation_id: id }),
  corDestaque: (cor: string) => rpc<void>('set_accent_color', { p_color: cor }),

  async publicar(opts: {
    texto: string;
    mediaUrl?: string | null;
    alt?: string | null;
    tags?: string[];
    grupoId?: string | null;
    local?: string | null;
  }): Promise<Post> {
    const j = await rpc<Json>('create_post', {
      p_body: opts.texto,
      p_media_url: opts.mediaUrl ?? null,
      p_alt_text: opts.alt ?? null,
      p_tags: opts.tags ?? [],
      p_group_id: opts.grupoId ?? null,
      p_audience: opts.grupoId ? 'GROUP' : 'PUBLIC',
      p_location: opts.local ?? null,
    });
    return paraPost(j);
  },

  publicarStory: (mediaUrl: string, legenda: string) =>
    rpc<Json>('create_story', { p_media_url: mediaUrl, p_caption: legenda }),

  async comentar(postId: string, texto: string): Promise<Comentario[]> {
    await rpc<Json[]>('add_comment', { p_post_id: postId, p_body: texto });
    return this.comentarios(postId);
  },

  abrirConversa: (outroId: string) =>
    rpc<string>('get_or_create_dm', { p_other_user: outroId }),

  enviarMensagem: (conversaId: string, texto: string) =>
    rpc<Json>('send_message', { p_conversation_id: conversaId, p_body: texto }),

  criarGrupo: (nome: string, descricao: string, privado: boolean, cover?: string | null) =>
    rpc<Json>('create_group', {
      p_name: nome,
      p_description: descricao,
      p_privacy: privado ? 'PRIVATE' : 'PUBLIC',
      p_cover_url: cover ?? null,
    }),

  salvarPerfil: (d: {
    nome?: string; handle?: string; bio?: string; local?: string;
    avatar?: string | null; capa?: string | null; interesses?: string[];
  }) =>
    rpc<Json>('update_profile', {
      p_name: d.nome ?? null,
      p_handle: d.handle ?? null,
      p_bio: d.bio ?? null,
      p_location: d.local ?? null,
      p_avatar_url: d.avatar ?? null,
      p_cover_url: d.capa ?? null,
      p_interests: d.interesses ?? null,
    }),
};

function paraGrupo(j: Json): Grupo {
  return {
    id: j.id,
    nome: j.name,
    slug: j.slug,
    descricao: j.description ?? '',
    cover: j.cover_url ?? null,
    privacidade: j.privacy,
    membros: Number(j.member_count ?? 0),
    subgrupos: Number(j.subgroup_count ?? 0),
    status: j.my_status ?? null,
    avatares: (j.avatars ?? []).filter(Boolean),
    interesses: j.interests ?? [],
  };
}
