import { useCallback, useEffect, useState } from 'react';
import { useApp, useAcao } from '../app/store';
import { api, auth } from '../lib/api';
import { Shell, TopBar } from '../components/layout/Shell';
import { ComentarioItem } from '../components/domain';
import {
  Avatar,
  Button,
  Icon,
  Img,
  Skeleton,
  Tag,
  Vazio,
  type IconName,
} from '../components/ui';
import type { Comentario, Post } from '../data/types';

/* ── notificações ────────────────────────────────────────────────────── */

const ICONE: Record<string, { i: IconName; bg: string }> = {
  LIKE: { i: 'heart', bg: '#EF5B67' },
  COMMENT: { i: 'chat', bg: 'var(--accent)' },
  MENTION: { i: 'chat', bg: 'var(--accent)' },
  FOLLOW: { i: 'userplus', bg: '#4CCB88' },
  MESSAGE: { i: 'chat', bg: 'var(--accent)' },
  STORY_REPLY: { i: 'chat', bg: 'var(--accent)' },
  GROUP_INVITE: { i: 'nodes', bg: '#4A494E' },
  GROUP_REQUEST: { i: 'nodes', bg: '#4A494E' },
  GROUP_ACCEPTED: { i: 'nodes', bg: '#4A494E' },
  POST_SHARE: { i: 'share', bg: '#4A494E' },
};

export function Notificacoes() {
  const { s, go, toast, recarregar } = useApp();
  const acao = useAcao();
  const grupos: ('Hoje' | 'Esta semana' | 'Antes')[] = ['Hoje', 'Esta semana', 'Antes'];

  return (
    <Shell>
      <TopBar
        titulo="Notificações"
        acao={
          s.notificacoes.some((n) => !n.lida) ? (
            <Button
              tamanho="sm"
              variante="fantasma"
              onClick={() =>
                acao(async () => {
                  await api.lerNotificacoes();
                  await recarregar({ notificacoes: true });
                  toast('Tudo marcado como lido');
                })
              }
            >
              Marcar como lidas
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-5 py-4">
        {s.notificacoes.length === 0 && (
          <Vazio
            icone="bell"
            titulo="Nada por aqui"
            texto="Quando alguém curtir, comentar ou seguir você, aparece nesta tela."
          />
        )}

        {grupos.map((g) => {
          const itens = s.notificacoes.filter((n) => n.grupo === g);
          if (!itens.length) return null;
          return (
            <section key={g} className="flex flex-col gap-2">
              <h2 className="m-0 px-4 text-sm font-semibold text-t3">{g}</h2>
              <ul className="m-0 flex list-none flex-col gap-1 px-2 p-0">
                {itens.map((n) => {
                  const ic = ICONE[n.tipo] ?? { i: 'bell' as IconName, bg: '#4A494E' };
                  return (
                    <li key={n.id}>
                      <div
                        className={`flex items-center gap-3 rounded-2xl p-2 pr-3 ${
                          n.lida ? 'bg-transparent' : 'bg-surface'
                        }`}
                      >
                        <span className="relative shrink-0">
                          <Avatar src={n.avatar} nome={n.quem} size={44} />
                          <span
                            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas text-white"
                            style={{ background: ic.bg }}
                          >
                            <Icon name={ic.i} size={11} stroke={2.2} />
                          </span>
                        </span>

                        <button
                          onClick={() =>
                            n.postId
                              ? go('post', { postId: n.postId })
                              : go('perfil', { handle: n.quem })
                          }
                          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
                        >
                          <p className="m-0 text-sm leading-relaxed text-t2">
                            <span className="font-semibold text-t1">{n.quem}</span> {n.texto}
                          </p>
                          <span className="text-xs text-t4">{n.tempo}</span>
                        </button>

                        {n.thumb && (
                          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-elevated">
                            <Img src={n.thumb} alt="" />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── publicação aberta ───────────────────────────────────────────────── */

export function PostDetalhe() {
  const { s, rota, go, abrir, toast, aplicarPost } = useApp();
  const acao = useAcao();
  const id = rota.params?.postId ?? '';

  const [post, setPost] = useState<Post | null>(
    s.feed.find((p) => p.id === id) ?? null,
  );
  const [coments, setComents] = useState<Comentario[] | null>(null);
  const [texto, setTexto] = useState('');

  const carregar = useCallback(async () => {
    if (!id) return;
    const [p, c] = await Promise.all([api.post(id), api.comentarios(id)]);
    setPost(p);
    setComents(c);
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (!post)
    return (
      <Shell semNav>
        <TopBar titulo="Publicação" />
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="aspect-4/3 w-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      </Shell>
    );

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar titulo="Publicação" />

        <div className="scroll-y min-h-0 flex-1 dk:mx-auto dk:w-full dk:max-w-5xl">
          <div className="flex flex-col dk:flex-row dk:gap-6 dk:p-6">
            {post.media && (
              <div className="dk:flex-1">
                <div className="aspect-4/3 w-full overflow-hidden bg-elevated dk:rounded-2xl">
                  <Img src={post.media} alt={post.mediaAlt} loading="eager" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 p-4 dk:w-96 dk:shrink-0 dk:p-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => go('perfil', { handle: post.autor.handle })}
                  className="cursor-pointer border-0 bg-transparent p-0"
                  aria-label={`Perfil de ${post.autor.nome}`}
                >
                  <Avatar src={post.autor.avatar} nome={post.autor.nome} size={44} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="one-line text-sm font-semibold text-t1">
                    {post.autor.handle}
                  </span>
                  <span className="one-line text-xs text-t4">{post.meta}</span>
                </div>
                <button
                  onClick={() => abrir('menu-post', { postId: post.id })}
                  aria-label="Mais opções"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t3"
                >
                  <Icon name="more" size={20} />
                </button>
              </div>

              {post.texto && (
                <p className="m-0 text-sm leading-relaxed break-words text-t2">{post.texto}</p>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}

              <span className="flex items-center gap-1.5 text-xs text-t4">
                <Icon name="pin" size={14} />
                {post.quando}
                {post.local ? ` · ${post.local}` : ''}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {post.reacoes.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => abrir('reacoes', { postId: post.id })}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-elevated px-2.5 text-xs text-t2"
                  >
                    <span aria-hidden>{r.emoji}</span>
                    {r.count}
                  </button>
                ))}
                <button
                  onClick={() => abrir('reacoes', { postId: post.id })}
                  aria-label="Reagir"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong bg-transparent text-t3"
                >
                  <Icon name="plus" size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1 border-y border-elevated py-1">
                <button
                  onClick={() =>
                    acao(async () => {
                      const r = await api.curtir(post.id);
                      setPost({ ...post, curtido: r.liked, curtidas: Number(r.like_count) });
                      aplicarPost(post.id, { curtido: r.liked, curtidas: Number(r.like_count) });
                    })
                  }
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium"
                  style={{ color: post.curtido ? 'var(--accent)' : 'var(--color-t2)' }}
                >
                  <Icon name="like" size={18} /> {post.curtidas || 'Curtir'}
                </button>
                <button
                  onClick={() => abrir('comentarios', { postId: post.id })}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium text-t2"
                >
                  <Icon name="chat" size={18} /> Comentar
                </button>
                <button
                  onClick={() => abrir('compartilhar', { postId: post.id })}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium text-t2"
                >
                  <Icon name="share" size={18} /> Enviar
                </button>
              </div>

              <h2 className="m-0 text-sm font-semibold text-t1">
                {coments?.length ?? 0} comentários
              </h2>

              {coments === null ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {coments.map((c) => (
                    <ComentarioItem key={c.id} c={c} onMudou={carregar} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = texto.trim();
            if (!t) return;
            setTexto('');
            void acao(async () => {
              setComents(await api.comentar(post.id, t));
              toast('Comentário publicado');
            });
          }}
          className="safe-b flex shrink-0 items-center gap-2 border-t border-elevated bg-canvas px-4 py-3"
        >
          <Avatar src={s.perfil?.avatar} nome={s.perfil?.nome ?? '?'} size={36} />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva um comentário"
            aria-label="Escreva um comentário"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
          />
          <button
            type="submit"
            disabled={!texto.trim()}
            aria-label="Enviar comentário"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            <Icon name="send" size={18} />
          </button>
        </form>
      </div>
    </Shell>
  );
}

/* ── configurações ───────────────────────────────────────────────────── */

const ACCENTS = ['#6155F5', '#756BFF', '#558DF5'];

export function Configuracoes() {
  const { s, set, go, abrir, toast } = useApp();
  const acao = useAcao();

  return (
    <Shell>
      <TopBar titulo="Configurações" />

      <div className="flex flex-col gap-5 py-4 dk:mx-auto dk:w-full dk:max-w-2xl">
        <button
          onClick={() => go('perfil')}
          className="mx-4 flex cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface p-3 text-left"
        >
          <Avatar src={s.perfil?.avatar} nome={s.perfil?.nome ?? '?'} size={52} />
          <span className="min-w-0 flex-1">
            <span className="one-line block text-base font-semibold text-t1">
              {s.perfil?.nome}
            </span>
            <span className="one-line block text-xs text-t4">{s.perfil?.handle}</span>
          </span>
          <Icon name="next" size={18} className="text-t4" />
        </button>

        <section className="flex flex-col gap-2">
          <h2 className="m-0 px-4 text-sm font-semibold text-t3">Conta</h2>
          <ul className="m-0 flex list-none flex-col gap-0.5 px-2 p-0">
            <li>
              <button
                onClick={() => go('editar-perfil')}
                className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 hover:bg-surface"
              >
                <span className="min-w-0 flex-1">Editar perfil</span>
                <Icon name="next" size={18} className="shrink-0 text-t4" />
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  acao(async () => {
                    const email = s.sessao?.user.email;
                    if (!email) throw new Error('Sessão sem e-mail.');
                    await auth.recuperar(email);
                  }, 'Link para trocar a senha enviado ao seu e-mail')
                }
                className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 hover:bg-surface"
              >
                <span className="min-w-0 flex-1">Alterar senha</span>
                <span className="one-line max-w-[45%] text-right text-sm text-t4">
                  {s.sessao?.user.email}
                </span>
              </button>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="m-0 px-4 text-sm font-semibold text-t3">Aparência</h2>
          <div className="mx-2 flex min-h-13 items-center gap-3 rounded-xl px-3">
            <span className="min-w-0 flex-1 text-sm text-t2">Cor de destaque</span>
            <span className="flex gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  aria-label={`Usar ${c}`}
                  onClick={() => {
                    set('accent', c);
                    void api.corDestaque(c).catch(() => {});
                  }}
                  className="h-7 w-7 cursor-pointer rounded-full border-2"
                  style={{ background: c, borderColor: s.accent === c ? '#fff' : 'transparent' }}
                />
              ))}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="m-0 px-4 text-sm font-semibold text-t3">Suporte</h2>
          <ul className="m-0 flex list-none flex-col gap-0.5 px-2 p-0">
            {['Ajuda', 'Termos de uso', 'Política de privacidade'].map((l) => (
              <li key={l}>
                <button
                  onClick={() => toast(`${l}: em breve`)}
                  className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 hover:bg-surface"
                >
                  <span className="min-w-0 flex-1">{l}</span>
                  <Icon name="next" size={18} className="shrink-0 text-t4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="px-4">
          <Button variante="perigo" bloco onClick={() => abrir('sair')}>
            <Icon name="logout" size={18} /> Sair da conta
          </Button>
        </div>

        <p className="m-0 pb-4 text-center text-xs text-t5">
          Musique 1.0.0 · feito para ouvir junto
        </p>
      </div>
    </Shell>
  );
}
