import { useCallback, useEffect, useState } from 'react';
import { useApp, useAcao } from '../app/store';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { ComentarioItem } from '../components/domain';
import { Avatar, Button, Icon, Img, Sheet, Skeleton, Vazio } from '../components/ui';
import { EMOJIS_REACAO, type Comentario, type Post } from '../data/types';

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
                  const { error } = await supabase
                    .from('posts')
                    .update({ deleted_at: new Date().toISOString() })
                    .eq('id', post.id);
                  if (error) throw new Error(error.message);
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
  const { s, fechar, toast } = useApp();
  const inicial = Math.max(0, s.stories.findIndex((x) => x.id === s.sheet?.params?.storyId));
  const [i, setI] = useState(inicial);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const story = s.stories[i];

  useEffect(() => setProgresso(0), [i]);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => {
      setProgresso((p) => {
        if (p >= 100) {
          if (i < s.stories.length - 1) setI((x) => x + 1);
          else fechar();
          return 0;
        }
        return p + 2;
      });
    }, 90);
    return () => clearInterval(t);
  }, [pausado, i, s.stories.length, fechar]);

  const idAtual = story?.id;
  const naoVisto = story && !story.visto;
  useEffect(() => {
    if (idAtual && naoVisto) void api.marcarStoryVisto(idAtual).catch(() => {});
  }, [idAtual, naoVisto]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-dvh w-full max-w-[460px] overflow-hidden bg-canvas-deep">
        <Img src={story.img} alt={story.legenda} loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        <div className="safe-t absolute inset-x-0 top-0 flex gap-1 p-3">
          {s.stories.map((_, k) => (
            <span key={k} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full bg-white transition-[width] duration-100"
                style={{ width: k < i ? '100%' : k === i ? `${progresso}%` : '0%' }}
              />
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 top-8 flex items-center gap-3 px-4">
          <Avatar
            src={story.autor.avatar}
            nome={story.autor.nome}
            size={36}
            ring="rgba(255,255,255,.5)"
          />
          <span className="min-w-0 flex-1">
            <span className="one-line block text-sm font-semibold text-white">
              {story.autor.handle}
            </span>
            <span className="block text-xs text-white/70">{story.tempo}</span>
          </span>
          <button
            onClick={() => setPausado((p) => !p)}
            aria-label={pausado ? 'Continuar' : 'Pausar'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name={pausado ? 'next' : 'eyeoff'} size={18} />
          </button>
          <button
            onClick={fechar}
            aria-label="Fechar story"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <button
          aria-label="Story anterior"
          onClick={() => (i > 0 ? setI(i - 1) : fechar())}
          className="absolute bottom-28 left-0 top-20 w-1/3 cursor-pointer border-0 bg-transparent"
        />
        <button
          aria-label="Próximo story"
          onClick={() => (i < s.stories.length - 1 ? setI(i + 1) : fechar())}
          className="absolute bottom-28 right-0 top-20 w-1/3 cursor-pointer border-0 bg-transparent"
        />

        <div className="safe-b absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4">
          {story.legenda && (
            <p className="m-0 text-sm leading-relaxed text-white">{story.legenda}</p>
          )}
          <div className="flex gap-2">
            {['❤️', '👏', '🔥', '😍'].map((e) => (
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
    case 'story':
      return <StoryViewer />;
    default:
      return null;
  }
}
