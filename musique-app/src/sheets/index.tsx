import { useEffect, useState } from 'react';
import { useApp } from '../app/store';
import { ComentarioItem } from '../components/domain';
import {
  Avatar,
  Button,
  Icon,
  Img,
  Sheet,
  type IconName,
} from '../components/ui';
import { EMOJIS_REACAO, userById } from '../data/db';

/* ── comentários ─────────────────────────────────────────────────────── */

function Comentarios() {
  const { s, d, fechar, postAtual } = useApp();
  const post = postAtual(s.sheet?.params?.postId);
  const [texto, setTexto] = useState('');
  if (!post) return null;

  return (
    <Sheet
      titulo={`${post.comentarios.length} comentários`}
      onClose={fechar}
      rodape={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!texto.trim()) return;
            d({ t: 'comentar', postId: post.id, texto: texto.trim() });
            setTexto('');
          }}
          className="flex items-center gap-2"
        >
          <Avatar src={s.perfil.avatar} size={36} />
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
      <ul className="m-0 flex list-none flex-col gap-4 p-4">
        {post.comentarios.map((c) => (
          <ComentarioItem key={c.id} c={c} postId={post.id} />
        ))}
      </ul>
    </Sheet>
  );
}

/* ── compartilhar ────────────────────────────────────────────────────── */

function Compartilhar() {
  const { s, fechar, toast, abrir } = useApp();
  const [q, setQ] = useState('');
  const [enviados, setEnviados] = useState<string[]>([]);
  const pessoas = ['joao', 'marina', 'estudio', 'rafa', 'dani']
    .map(userById)
    .filter((u) => u.nome.toLowerCase().includes(q.toLowerCase()));

  const acoes: { label: string; icone: IconName; onClick: () => void }[] = [
    {
      label: 'Copiar link',
      icone: 'link',
      onClick: () => {
        navigator.clipboard?.writeText(window.location.href).catch(() => {});
        toast('Link copiado');
        fechar();
      },
    },
    {
      label: 'Compartilhar em um grupo',
      icone: 'nodes',
      onClick: () => {
        toast(`Compartilhado em ${s.grupos[0].nome}`);
        fechar();
      },
    },
    {
      label: 'Adicionar ao meu story',
      icone: 'plus',
      onClick: () => {
        abrir('story', { storyId: s.stories[0].id });
        toast('Adicionado ao seu story');
      },
    },
    {
      label: 'Compartilhar fora do Musique',
      icone: 'share',
      onClick: () => {
        toast('Compartilhamento externo entra na próxima etapa');
        fechar();
      },
    },
  ];

  return (
    <Sheet titulo="Compartilhar" onClose={fechar}>
      <div className="flex flex-col gap-4 p-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar pessoa ou grupo"
            aria-label="Buscar pessoa ou grupo"
            className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
          />
          <span className="pointer-events-none absolute left-0 top-0 flex h-12 w-11 items-center justify-center text-t3">
            <Icon name="search" size={18} />
          </span>
        </div>

        <div className="rail -mx-4 px-4">
          <div className="flex w-max gap-4">
            {pessoas.map((u) => {
              const on = enviados.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setEnviados((e) => (on ? e.filter((x) => x !== u.id) : [...e, u.id]));
                    if (!on) toast(`Enviado para ${u.nome}`);
                  }}
                  className="flex w-18 shrink-0 cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0"
                >
                  <span className="relative">
                    <Avatar src={u.avatar} size={56} ring={on ? 'var(--accent)' : undefined} />
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
                    {u.nome.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {acoes.map((a) => (
            <li key={a.label}>
              <button
                onClick={a.onClick}
                className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-t2 transition-colors hover:bg-surface"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-t2">
                  <Icon name={a.icone} size={18} />
                </span>
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

/* ── menu da publicação ──────────────────────────────────────────────── */

function MenuPost() {
  const { s, d, fechar, toast, postAtual } = useApp();
  const post = postAtual(s.sheet?.params?.postId);
  if (!post) return null;
  const autor = userById(post.autorId);
  const segue = !!s.seguindo[autor.id];

  const acoes: {
    label: string;
    ajuda?: string;
    icone: IconName;
    perigo?: boolean;
    onClick: () => void;
  }[] = [
    {
      label: post.salvo ? 'Remover dos salvos' : 'Salvar publicação',
      ajuda: 'Vai para a aba Salvos do seu perfil.',
      icone: 'bookmark',
      onClick: () => {
        d({ t: 'salvar', postId: post.id });
        toast(post.salvo ? 'Removido dos salvos' : 'Salvo no seu perfil');
        fechar();
      },
    },
    {
      label: 'Não tenho interesse',
      ajuda: 'Mostramos menos publicações como esta.',
      icone: 'eyeoff',
      onClick: () => {
        toast('Vamos mostrar menos publicações como esta');
        fechar();
      },
    },
    {
      label: `${segue ? 'Deixar de seguir' : 'Seguir'} ${autor.handle}`,
      icone: 'userplus',
      onClick: () => {
        d({ t: 'seguir', userId: autor.id });
        toast(segue ? `Deixou de seguir ${autor.nome}` : `Seguindo ${autor.nome}`);
        fechar();
      },
    },
    {
      label: 'Copiar link',
      icone: 'link',
      onClick: () => {
        navigator.clipboard?.writeText(window.location.href).catch(() => {});
        toast('Link copiado');
        fechar();
      },
    },
    {
      label: 'Denunciar publicação',
      ajuda: 'A pessoa não fica sabendo quem denunciou.',
      icone: 'flag',
      perigo: true,
      onClick: () => {
        toast('Denúncia enviada. Obrigado por avisar.');
        fechar();
      },
    },
  ];

  return (
    <Sheet titulo={`Publicação de ${autor.handle}`} onClose={fechar}>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-4">
        {acoes.map((a) => (
          <li key={a.label}>
            <button
              onClick={a.onClick}
              className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3 text-left transition-colors hover:bg-surface"
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated"
                style={{ color: a.perigo ? 'var(--color-danger)' : 'var(--color-t2)' }}
              >
                <Icon name={a.icone} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block text-sm font-medium"
                  style={{ color: a.perigo ? 'var(--color-danger)' : 'var(--color-t1)' }}
                >
                  {a.label}
                </span>
                {a.ajuda && (
                  <span className="block text-xs leading-relaxed text-t4">{a.ajuda}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/* ── reações ─────────────────────────────────────────────────────────── */

function Reacoes() {
  const { s, d, fechar, postAtual } = useApp();
  const post = postAtual(s.sheet?.params?.postId);
  if (!post) return null;

  const quemReagiu = [
    { u: userById('joao'), emoji: '❤️' },
    { u: userById('marina'), emoji: '🙌' },
    { u: userById('rafa'), emoji: '❤️' },
  ];

  return (
    <Sheet titulo="Reagir" onClose={fechar} alturaMax="70vh">
      <div className="flex flex-col gap-5 p-4">
        <div className="grid grid-cols-5 gap-2">
          {EMOJIS_REACAO.map((e) => {
            const on = post.minhaReacao === e.emoji;
            return (
              <button
                key={e.emoji}
                aria-label={e.label}
                aria-pressed={on}
                onClick={() => {
                  d({ t: 'reagir', postId: post.id, emoji: e.emoji, label: e.label });
                  fechar();
                }}
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

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-sm font-semibold text-t3">Quem reagiu</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {quemReagiu.map((r) => (
              <li key={r.u.id} className="flex items-center gap-3">
                <span className="relative">
                  <Avatar src={r.u.avatar} size={40} />
                  <span
                    aria-hidden
                    className="absolute -bottom-1 -right-1 rounded-full border-2 border-canvas bg-elevated px-1 text-xs"
                  >
                    {r.emoji}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="one-line block text-sm font-semibold text-t1">
                    {r.u.nome}
                  </span>
                  <span className="one-line block text-xs text-t4">{r.u.handle}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Sheet>
  );
}

/* ── sair ────────────────────────────────────────────────────────────── */

function Sair() {
  const { s, d, fechar } = useApp();
  return (
    <Sheet titulo="Deseja sair?" onClose={fechar} alturaMax="auto">
      <div className="flex flex-col gap-4 p-4">
        <p className="m-0 text-sm leading-relaxed text-t3">
          Você vai sair de{' '}
          <span className="font-semibold text-t1">{s.perfil.handle}</span>. Seus
          rascunhos ficam salvos neste aparelho.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variante="perigo"
            bloco
            tamanho="lg"
            onClick={() => d({ t: 'sair' })}
          >
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
  const { s, d, fechar, toast } = useApp();
  const inicial = Math.max(
    0,
    s.stories.findIndex((x) => x.id === s.sheet?.params?.storyId),
  );
  const [i, setI] = useState(inicial);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const story = s.stories[i];

  useEffect(() => {
    setProgresso(0);
  }, [i]);

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

  /* marca como visto uma única vez por story — depender do objeto inteiro
     reiniciaria o efeito a cada dispatch (a lista é recriada) e travaria */
  const naoVisto = story && !story.visto;
  const idAtual = story?.id;
  useEffect(() => {
    if (idAtual && naoVisto) d({ t: 'ver-story', storyId: idAtual });
  }, [idAtual, naoVisto, d]);

  if (!story) return null;
  const autor = userById(story.autorId);

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
          <Avatar src={autor.avatar} size={36} ring="rgba(255,255,255,.5)" />
          <span className="min-w-0 flex-1">
            <span className="one-line block text-sm font-semibold text-white">
              {autor.handle}
            </span>
            <span className="block text-xs text-white/70">{story.tempo}</span>
          </span>
          <button
            onClick={() => setPausado((p) => !p)}
            aria-label={pausado ? 'Continuar' : 'Pausar'}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name={pausado ? 'next' : 'close'} size={18} />
          </button>
          <button
            onClick={fechar}
            aria-label="Fechar story"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 text-white"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* zonas de toque: anterior / próximo */}
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
          <p className="m-0 text-sm leading-relaxed text-white">{story.legenda}</p>
          <div className="flex gap-2">
            {[
              { emoji: '❤️', label: 'Amei' },
              { emoji: '👏', label: 'Palmas' },
              { emoji: '🔥', label: 'Demais' },
              { emoji: '😍', label: 'Apaixonei' },
            ].map((r) => (
              <button
                key={r.emoji}
                aria-label={r.label}
                onClick={() => toast(`Você reagiu ${r.emoji} ao story`)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl backdrop-blur"
              >
                <span aria-hidden>{r.emoji}</span>
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast(`Resposta enviada para ${autor.handle}`);
            }}
            className="flex items-center gap-2"
          >
            <input
              placeholder="Responder ao story"
              aria-label="Responder ao story"
              onFocus={() => setPausado(true)}
              onBlur={() => setPausado(false)}
              className="h-12 min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-4 text-base text-white placeholder:text-white/60 outline-none backdrop-blur"
            />
            <button
              type="submit"
              aria-label="Enviar resposta"
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Icon name="send" size={20} />
            </button>
          </form>
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
