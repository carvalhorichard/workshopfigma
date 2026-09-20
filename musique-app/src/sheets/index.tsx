import { useCallback, useEffect, useState } from 'react';
import { useApp, useAcao } from '../app/store';
import { api } from '../lib/api';
import { ComentarioItem } from '../components/domain';
import { Avatar, Button, Icon, Img, Sheet, Skeleton, Vazio } from '../components/ui';
import {
  EMOJIS_REACAO,
  type Comentario,
  type Post,
  type User,
} from '../data/types';

const REACOES_STORY = ['❤️', '👏', '🔥', '😍'];

/** Busca o post do cache do feed ou do banco. */
function usePost(id?: string) {
  const { s } = useApp();
  const [p, setP] = useState<Post | null>(s.feed.find((x) => x.id === id) ?? null);
  useEffect(() => {
    if (!id) return;
    if (p?.id === id) return;
    api.post(id).then(setP).catch(() => setP(null));
  }, [id, p?.id]);
  return [p, setP] as const;
}

/* ── comentários ─────────────────────────────────────────────────────── */

function Comentarios() {
  const { s, fechar, toast, aplicarPost } = useApp();
  const acao = useAcao();
  const postId = s.sheet?.params?.postId;
  const [lista, setLista] = useState<Comentario[] | null>(null);
  const [texto, setTexto] = useState('');

  const carregar = useCallback(() => {
    if (postId) api.comentarios(postId).then(setLista).catch(() => setLista([]));
  }, [postId]);

  useEffect(carregar, [carregar]);

  if (!postId) return null;

  return (
    <Sheet
      titulo={lista ? `${lista.length} comentários` : 'Comentários'}
      onClose={fechar}
      rodape={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = texto.trim();
            if (!t) return;
            setTexto('');
            void acao(async () => {
              const novos = await api.comentar(postId, t);
              setLista(novos);
              aplicarPost(postId, { comentarios: novos.length });
              toast('Comentário publicado');
            });
          }}
          className="flex items-center gap-2"
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
      }
    >
      {lista === null ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Vazio
          icone="chat"
          titulo="Nenhum comentário ainda"
          texto="Seja a primeira pessoa a comentar."
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-4">
          {lista.map((c) => (
            <ComentarioItem key={c.id} c={c} onMudou={carregar} />
          ))}
        </ul>
      )}
    </Sheet>
  );
}

/* ── compartilhar ────────────────────────────────────────────────────── */

function Compartilhar() {
  const { s, fechar, toast, go } = useApp();
  const acao = useAcao();
  const postId = s.sheet?.params?.postId;
  const [enviados, setEnviados] = useState<string[]>([]);

  const link = postId ? `${window.location.origin}/#post-${postId}` : window.location.href;

  return (
    <Sheet titulo="Compartilhar" onClose={fechar} alturaMax="70vh">
      <div className="flex flex-col gap-4 p-4">
        {s.conversas.length > 0 && (
          <>
            <h3 className="m-0 text-sm font-semibold text-t3">Enviar numa conversa</h3>
            <div className="rail -mx-4 px-4">
              <div className="flex w-max gap-4">
                {s.conversas.map((c) => {
                  const on = enviados.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        acao(async () => {
                          await api.enviarMensagem(c.id, link);
                          setEnviados((e) => [...e, c.id]);
                          toast(`Enviado para ${c.com?.nome ?? 'a conversa'}`);
                        })
                      }
                      className="flex w-18 shrink-0 cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0"
                    >
                      <span className="relative">
                        <Avatar
                          src={c.com?.avatar}
                          nome={c.com?.nome ?? '?'}
                          size={56}
                          ring={on ? 'var(--accent)' : undefined}
                        />
                        {on && (
                          <span
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas text-white"
                            style={{ background: 'var(--accent)' }}
                          >
                            <Icon name="check" size={11} stroke={3} />
                          </span>
                        )}
                      </span>
                      <span className="one-line w-full text-center text-xs text-t3">
                        {(c.com?.nome ?? '?').split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          <li>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(link).catch(() => {});
                toast('Link copiado');
                fechar();
              }}
              className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 hover:bg-surface"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated">
                <Icon name="link" size={18} />
              </span>
              Copiar link
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                fechar();
                go('mensagens');
              }}
              className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 hover:bg-surface"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated">
                <Icon name="chat" size={18} />
              </span>
              Abrir mensagens
            </button>
          </li>
        </ul>
      </div>
    </Sheet>
  );
}

/* ── menu da publicação ──────────────────────────────────────────────── */

function MenuPost() {
  const { s, fechar, toast, aplicarPost, recarregar } = useApp();
  const acao = useAcao();
  const postId = s.sheet?.params?.postId;
  const [post] = usePost(postId);

  if (!post) return null;
  const meu = post.autor.id === s.perfil?.id;

  return (
    <Sheet titulo={`Publicação de ${post.autor.handle}`} onClose={fechar} alturaMax="auto">
      <ul className="m-0 flex list-none flex-col gap-0.5 p-4">
        <li>
          <button
            onClick={() =>
              acao(async () => {
                const r = await api.salvar(post.id);
                aplicarPost(post.id, { salvo: r.bookmarked });
                toast(r.bookmarked ? 'Salvo no seu perfil' : 'Removido dos salvos');
                fechar();
              })
            }
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3 text-left hover:bg-surface"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-t2">
              <Icon name="bookmark" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-t1">
                {post.salvo ? 'Remover dos salvos' : 'Salvar publicação'}
              </span>
              <span className="block text-xs leading-relaxed text-t4">
                Vai para a aba Salvos do seu perfil.
              </span>
            </span>
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              navigator.clipboard
                ?.writeText(`${window.location.origin}/#post-${post.id}`)
                .catch(() => {});
              toast('Link copiado');
              fechar();
            }}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3 text-left hover:bg-surface"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-t2">
              <Icon name="link" size={18} />
            </span>
            <span className="text-sm font-medium text-t1">Copiar link</span>
          </button>
        </li>

        {!meu && (
          <li>
            <button
              onClick={() =>
                acao(async () => {
                  const r = await api.seguir(post.autor.id);
                  toast(
                    r.following
                      ? `Seguindo ${post.autor.nome}`
                      : `Deixou de seguir ${post.autor.nome}`,
                  );
                  await recarregar({ feed: true });
                  fechar();
                })
              }
              className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3 text-left hover:bg-surface"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-t2">
                <Icon name="userplus" size={18} />
              </span>
              <span className="text-sm font-medium text-t1">
                Seguir / deixar de seguir {post.autor.handle}
              </span>
            </button>
          </li>
        )}

        {meu && (
          <li>
            <button
              onClick={() =>
                acao(async () => {
                  await api.apagarPost(post.id);
                  await recarregar({ feed: true, perfil: true });
                  toast('Publicação apagada');
                  fechar();
                })
              }
              className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3 text-left hover:bg-surface"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-danger">
                <Icon name="close" size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-danger">Apagar publicação</span>
                <span className="block text-xs leading-relaxed text-t4">
                  Some do feed de todo mundo.
                </span>
              </span>
            </button>
          </li>
        )}
      </ul>
    </Sheet>
  );
}

/* ── reações ─────────────────────────────────────────────────────────── */

function Reacoes() {
  const { s, fechar, aplicarPost } = useApp();
  const acao = useAcao();
  const postId = s.sheet?.params?.postId;
  const [post, setPost] = usePost(postId);

  if (!post) return null;

  return (
    <Sheet titulo="Reagir" onClose={fechar} alturaMax="auto">
      <div className="grid grid-cols-5 gap-2 p-4">
        {EMOJIS_REACAO.map((e) => {
          const on = post.minhaReacao === e.emoji;
          return (
            <button
              key={e.emoji}
              aria-label={e.label}
              aria-pressed={on}
              onClick={() =>
                acao(async () => {
                  const r = await api.reagir(post.id, e.emoji);
                  const reacoes = (r.reactions ?? []).map((x: { emoji: string; count: number }) => ({
                    emoji: x.emoji,
                    count: Number(x.count),
                  }));
                  setPost({ ...post, minhaReacao: r.reaction, reacoes });
                  aplicarPost(post.id, { minhaReacao: r.reaction, reacoes });
                  fechar();
                })
              }
              className="flex h-14 cursor-pointer items-center justify-center rounded-xl border text-2xl transition-transform hover:scale-105"
              style={{
                background: on ? 'var(--accent-soft)' : 'var(--color-elevated)',
                borderColor: on ? 'var(--accent)' : 'var(--color-line-strong)',
              }}
            >
              <span aria-hidden>{e.emoji}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ── sair ────────────────────────────────────────────────────────────── */

function Sair() {
  const { s, fechar, sair } = useApp();
  return (
    <Sheet titulo="Deseja sair?" onClose={fechar} alturaMax="auto">
      <div className="flex flex-col gap-4 p-4">
        <p className="m-0 text-sm leading-relaxed text-t3">
          Você vai sair de{' '}
          <span className="font-semibold text-t1">{s.perfil?.handle}</span>. Seus dados
          continuam salvos na sua conta.
        </p>
        <div className="flex flex-col gap-2">
          <Button variante="perigo" bloco tamanho="lg" onClick={() => void sair()}>
            Sair da conta
          </Button>
          <Button variante="neutro" bloco tamanho="lg" onClick={fechar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ── visualizador de story ───────────────────────────────────────────── */

function StoryViewer() {
  const { s, fechar, go, toast, recarregar } = useApp();

  // posicao: qual pessoa e qual story dentro dela
  const grupoInicial = Math.max(
    0,
    s.stories.findIndex((g) => g.autor.id === s.sheet?.params?.autorId),
  );
  const [gi, setGi] = useState(grupoInicial);
  const [si, setSi] = useState(s.stories[grupoInicial]?.inicio ?? 0);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, setApagando] = useState(false);

  const grupo = s.stories[gi];
  const story = grupo?.stories[si];
  const meu = grupo?.autor.id === s.perfil?.id;

  // avanca dentro da pessoa; no fim dela, passa para a proxima
  const proximo = useCallback(() => {
    if (!grupo) return fechar();
    if (si < grupo.stories.length - 1) setSi(si + 1);
    else if (gi < s.stories.length - 1) {
      setGi(gi + 1);
      setSi(0);
    } else fechar();
  }, [grupo, si, gi, s.stories.length, fechar]);

  const anterior = useCallback(() => {
    if (si > 0) setSi(si - 1);
    else if (gi > 0) {
      const ant = s.stories[gi - 1];
      setGi(gi - 1);
      setSi(Math.max(0, ant.stories.length - 1));
    } else fechar();
  }, [si, gi, s.stories, fechar]);

  useEffect(() => setProgresso(0), [gi, si]);

  useEffect(() => {
    if (pausado || confirmando || !story) return;
    const t = setInterval(() => {
      // só avança o contador aqui; trocar de story dentro do updater do
      // setState significa mexer noutro componente durante a renderização
      setProgresso((p) => (p >= 100 ? 100 : p + 2));
    }, 90);
    return () => clearInterval(t);
  }, [pausado, confirmando, story]);

  // quando a barra enche, passa para o próximo — já fora do render
  useEffect(() => {
    if (progresso >= 100) proximo();
  }, [progresso, proximo]);

  // marca como visto uma vez por story
  const idAtual = story?.id;
  const naoVisto = story && !story.visto;
  useEffect(() => {
    if (idAtual && naoVisto) void api.marcarStoryVisto(idAtual).catch(() => {});
  }, [idAtual, naoVisto]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') proximo();
      if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [proximo, anterior]);

  if (!grupo || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-dvh w-full max-w-[460px] overflow-hidden bg-canvas-deep">
        <Img src={story.img} alt={story.legenda} loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* uma barra por story DESTA pessoa */}
        <div className="safe-t absolute inset-x-0 top-0 flex gap-1 p-3">
          {grupo.stories.map((st, k) => (
            <span key={st.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full bg-white transition-[width] duration-100"
                style={{ width: k < si ? '100%' : k === si ? `${progresso}%` : '0%' }}
              />
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 top-8 flex items-center gap-3 px-4">
          <button
            onClick={() => {
              fechar();
              go('perfil', { handle: grupo.autor.handle });
            }}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
          >
            <Avatar
              src={grupo.autor.avatar}
              nome={grupo.autor.nome}
              size={36}
              ring="rgba(255,255,255,.5)"
            />
            <span className="min-w-0">
              <span className="one-line block text-sm font-semibold text-white">
                {grupo.autor.handle}
              </span>
              <span className="block text-xs text-white/70">
                {story.tempo}
                {grupo.stories.length > 1 && ` · ${si + 1}/${grupo.stories.length}`}
              </span>
            </span>
          </button>
          {meu && (
            <button
              onClick={() => setConfirmando(true)}
              aria-label="Apagar story"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
            >
              <Icon name="trash" size={18} />
            </button>
          )}
          <button
            onClick={() => setPausado((p) => !p)}
            aria-label={pausado ? 'Continuar' : 'Pausar'}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name={pausado ? 'next' : 'eyeoff'} size={18} />
          </button>
          <button
            onClick={fechar}
            aria-label="Fechar story"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {confirmando && (
          <div className="anim-fade absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6">
            <div className="anim-pop w-full max-w-xs rounded-2xl border border-line bg-canvas p-5">
              <h2 className="m-0 text-base font-semibold text-t1">Apagar este story?</h2>
              <p className="m-0 mt-2 text-sm leading-relaxed text-t3">
                Ele sai do ar para todo mundo. Não dá para desfazer.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variante="perigo"
                  bloco
                  disabled={apagando}
                  onClick={async () => {
                    if (!story) return;
                    setApagando(true);
                    try {
                      await api.apagarStory(story.id);
                      await recarregar({ stories: true });
                      toast('Story apagado');
                      fechar();
                    } catch (err) {
                      toast(err instanceof Error ? err.message : 'Não deu para apagar');
                    } finally {
                      setApagando(false);
                      setConfirmando(false);
                    }
                  }}
                >
                  {apagando ? 'Apagando…' : 'Apagar story'}
                </Button>
                <Button variante="neutro" bloco onClick={() => setConfirmando(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        <button
          aria-label="Story anterior"
          onClick={anterior}
          className="absolute bottom-28 left-0 top-20 w-1/3 cursor-pointer border-0 bg-transparent"
        />
        <button
          aria-label="Próximo story"
          onClick={proximo}
          className="absolute bottom-28 right-0 top-20 w-1/3 cursor-pointer border-0 bg-transparent"
        />

        <div className="safe-b absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4">
          {story.legenda && (
            <p className="m-0 text-sm leading-relaxed text-white">{story.legenda}</p>
          )}
          <div className="flex gap-2">
            {REACOES_STORY.map((e) => (
              <button
                key={e}
                aria-label={`Reagir ${e}`}
                onClick={() => toast(`Você reagiu ${e} ao story`)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl backdrop-blur"
              >
                <span aria-hidden>{e}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── imagem em tela cheia ──────────────────────────────────── */

/** Lightbox: capa e avatar do perfil, capa do grupo. */
function VerImagem() {
  const { s, fechar } = useApp();
  const url = s.sheet?.params?.url;
  const alt = s.sheet?.params?.alt ?? '';
  const titulo = s.sheet?.params?.titulo ?? 'Imagem';
  if (!url) return null;

  const fecharNoFundo = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) fechar();
  };

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex flex-col bg-black/92"
      onMouseDown={fecharNoFundo}
    >
      <div className="safe-t flex items-center gap-3 px-4 pb-3">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
          {titulo}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Abrir em tamanho original"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
        >
          <Icon name="link" size={18} />
        </a>
        <button
          onClick={fechar}
          aria-label="Fechar"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4"
        onMouseDown={fecharNoFundo}
      >
        <img src={url} alt={alt} className="max-h-full max-w-full rounded-xl object-contain" />
      </div>
    </div>
  );
}

/* ── seguidores / seguindo ───────────────────────────────── */

function Seguidores() {
  const { s, fechar, go, toast, recarregar } = useApp();
  const executar = useAcao();
  const handle = s.sheet?.params?.handle ?? s.perfil?.handle ?? '';
  const tipo = (s.sheet?.params?.tipo ?? 'followers') as 'followers' | 'following';
  const [lista, setLista] = useState<
    ((User & { segue: boolean; euMesmo: boolean })[]) | null
  >(null);

  const carregar = useCallback(() => {
    if (!handle) return;
    api.listaSeguidores(handle, tipo).then(setLista).catch(() => setLista([]));
  }, [handle, tipo]);

  useEffect(carregar, [carregar]);

  const titulo = tipo === 'followers' ? 'Seguidores' : 'Seguindo';

  return (
    <Sheet titulo={titulo} onClose={fechar}>
      {lista === null ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <Vazio
          icone={tipo === 'followers' ? 'users' : 'userplus'}
          titulo={tipo === 'followers' ? 'Ainda sem seguidores' : 'Não segue ninguém ainda'}
          texto={
            tipo === 'followers'
              ? 'Quando alguém começar a seguir, aparece aqui.'
              : 'Siga pessoas para o feed começar a encher.'
          }
        >
          {tipo === 'following' && (
            <Button
              onClick={() => {
                fechar();
                go('buscar');
              }}
            >
              Encontrar pessoas
            </Button>
          )}
        </Vazio>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-4">
          {lista.map((u) => (
            <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3">
              <button
                onClick={() => {
                  fechar();
                  go('perfil', { handle: u.handle });
                }}
                className="cursor-pointer border-0 bg-transparent p-0"
                aria-label={`Perfil de ${u.nome}`}
              >
                <Avatar src={u.avatar} nome={u.nome} size={48} />
              </button>

              <button
                onClick={() => {
                  fechar();
                  go('perfil', { handle: u.handle });
                }}
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 border-0 bg-transparent p-0 text-left"
              >
                <span className="one-line text-sm font-semibold text-t1">{u.nome}</span>
                <span className="one-line text-xs text-t4">
                  {u.handle}
                  {u.bio ? ` · ${u.bio}` : ''}
                </span>
              </button>

              {!u.euMesmo && (
                <Button
                  tamanho="sm"
                  variante={u.segue ? 'neutro' : 'primario'}
                  onClick={() =>
                    executar(async () => {
                      const r = await api.seguir(u.id);
                      toast(
                        r.following ? `Seguindo ${u.nome}` : `Deixou de seguir ${u.nome}`,
                      );
                      carregar();
                      void recarregar({ feed: true, perfil: true });
                    })
                  }
                >
                  {u.segue ? 'Seguindo' : 'Seguir'}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

/* ── despachante ─────────────────────────────────────────────────────── */

export function Sheets() {
  const { s } = useApp();
  switch (s.sheet?.name) {
    case 'comentarios':
      return <Comentarios />;
    case 'compartilhar':
      return <Compartilhar />;
    case 'menu-post':
      return <MenuPost />;
    case 'reacoes':
      return <Reacoes />;
    case 'sair':
      return <Sair />;
    case 'seguidores':
      return <Seguidores />;
    case 'story':
      return <StoryViewer />;
    case 'imagem':
      return <VerImagem />;
    default:
      return null;
  }
}
