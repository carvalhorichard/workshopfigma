import { useApp, useAcao } from '../../app/store';
import { api } from '../../lib/api';
import type { Comentario, Grupo, GrupoStories, User } from '../../data/types';
import { Avatar, AvatarStack, Button, Icon, Img, Rail } from '../ui';

export { PostCard } from './PostCard';

/* ── trilho de stories ───────────────────────────────────────────────── */

export function StoriesRail({ stories }: { stories: GrupoStories[] }) {
  const { s, abrir, go } = useApp();

  return (
    <section aria-label="Stories" className="shrink-0">
      <Rail label="Stories">
        <div className="flex w-max gap-3">
          <button
            onClick={() => go('criar-story')}
            className="flex w-26 shrink-0 cursor-pointer flex-col gap-2 border-0 bg-transparent p-0"
          >
            <span className="flex h-38 w-26 items-center justify-center rounded-[20px] border border-dashed border-line-strong bg-surface">
              <span className="relative block h-11 w-11">
                <Avatar src={s.perfil?.avatar} nome={s.perfil?.nome ?? '?'} size={44} />
                <span
                  className="absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-surface text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <Icon name="plus" size={12} stroke={3} />
                </span>
              </span>
            </span>
            <span className="one-line block text-center text-xs text-t3">
              Seus stories
            </span>
          </button>

          {/* um card por pessoa: a capa é o primeiro story ainda não visto */}
          {stories.map((g) => (
            <button
              key={g.autor.id}
              onClick={() => abrir('story', { autorId: g.autor.id })}
              aria-label={`Stories de ${g.autor.nome}, ${g.stories.length} ${
                g.stories.length === 1 ? 'item' : 'itens'
              }`}
              className="flex w-26 shrink-0 cursor-pointer flex-col gap-2 border-0 bg-transparent p-0"
            >
              <span className="relative block h-38 w-26 overflow-hidden rounded-[20px] bg-surface">
                <Img src={g.capa} alt="" />

                {/* quantos stories a pessoa tem, quando é mais de um */}
                {g.stories.length > 1 && (
                  <span className="absolute right-1.5 top-1.5 flex gap-0.5 rounded-full bg-canvas/70 px-1.5 py-1 backdrop-blur">
                    {g.stories.slice(0, 5).map((st, i) => (
                      <span
                        key={st.id}
                        className="block h-0.5 w-2 rounded-full"
                        style={{
                          background: st.visto
                            ? 'rgba(255,255,255,.35)'
                            : i < 5
                              ? '#fff'
                              : '#fff',
                        }}
                      />
                    ))}
                  </span>
                )}

                <span className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <Avatar
                    src={g.autor.avatar}
                    nome={g.autor.nome}
                    size={40}
                    ring={g.todosVistos ? '#4A494E' : 'var(--accent)'}
                  />
                </span>
              </span>
              <span className="one-line block text-center text-xs text-t3">
                {g.autor.handle.replace('@', '')}
              </span>
            </button>
          ))}
        </div>
      </Rail>
    </section>
  );
}

/* ── card de comunidade (carrossel da home) ──────────────────────────── */

export function ComunidadeCard({ g }: { g: Grupo }) {
  const { go } = useApp();
  return (
    <article className="flex w-42 shrink-0 flex-col overflow-hidden rounded-2xl bg-surface">
      <button
        onClick={() => go('grupo', { grupoId: g.id })}
        className="relative block h-21 w-full cursor-pointer border-0 p-0"
        aria-label={`Abrir ${g.nome}`}
      >
        <Img src={g.cover} alt="" />
        {g.avatares.length > 0 && (
          <span className="absolute -bottom-3.5 left-3">
            <AvatarStack urls={g.avatares.slice(0, 3)} size={28} />
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-5.5">
        <h3 className="clamp2 m-0 min-h-10 text-base font-semibold break-words text-t1">
          {g.nome}
        </h3>
        <span className="flex items-center gap-2 text-xs text-t3">
          <Icon name="users" size={16} />
          {g.membros} {g.membros === 1 ? 'membro' : 'membros'}
        </span>
      </div>
    </article>
  );
}

/* ── botão de participar, reaproveitado em três telas ────────────────── */

export function BotaoGrupo({
  g,
  bloco,
  onMudou,
}: {
  g: Grupo;
  bloco?: boolean;
  onMudou?: () => void;
}) {
  const { toast } = useApp();
  const acao = useAcao();
  const rotulo =
    g.status === 'ACTIVE'
      ? 'Participando'
      : g.status === 'PENDING'
        ? 'Solicitado'
        : g.privacidade === 'PRIVATE'
          ? 'Solicitar entrada'
          : 'Participar';

  return (
    <Button
      tamanho="sm"
      bloco={bloco}
      variante={g.status === null && g.privacidade === 'PUBLIC' ? 'primario' : 'neutro'}
      onClick={() =>
        acao(async () => {
          const r = await api.participarGrupo(g.id);
          toast(
            r.status === 'ACTIVE'
              ? `Você entrou em ${g.nome}`
              : r.status === 'PENDING'
                ? 'Solicitação enviada'
                : `Você saiu de ${g.nome}`,
          );
          onMudou?.();
        })
      }
    >
      {rotulo}
    </Button>
  );
}

/** Linha de grupo usada em Grupos e na Busca. */
export function GrupoLinha({ g, onMudou }: { g: Grupo; onMudou?: () => void }) {
  const { go } = useApp();
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3">
      <button
        onClick={() => go('grupo', { grupoId: g.id })}
        className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-0 bg-elevated p-0"
        aria-label={`Abrir ${g.nome}`}
      >
        <Img src={g.cover} alt="" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          onClick={() => go('grupo', { grupoId: g.id })}
          className="one-line cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-t1"
        >
          {g.nome}
        </button>
        <span className="one-line flex items-center gap-2 text-xs text-t4">
          <Icon name="users" size={14} />
          {g.membros} {g.membros === 1 ? 'membro' : 'membros'} ·{' '}
          {g.privacidade === 'PRIVATE' ? 'Privado' : 'Público'}
        </span>
      </div>
      <BotaoGrupo g={g} onMudou={onMudou} />
    </li>
  );
}

/* ── linha de pessoa ─────────────────────────────────────────────────── */

export function PessoaLinha({
  u,
  segue,
  acao: tipo = 'seguir',
  onMudou,
}: {
  u: User;
  segue?: boolean;
  acao?: 'seguir' | 'mensagem';
  onMudou?: () => void;
}) {
  const { go, toast } = useApp();
  const executar = useAcao();

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3">
      <button
        onClick={() => go('perfil', { handle: u.handle })}
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Perfil de ${u.nome}`}
      >
        <Avatar src={u.avatar} nome={u.nome} size={48} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button
          onClick={() => go('perfil', { handle: u.handle })}
          className="one-line cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-t1"
        >
          {u.nome}
        </button>
        <span className="one-line text-xs text-t4">
          {u.handle}
          {u.contexto ? ` · ${u.contexto}` : ''}
        </span>
      </div>
      {tipo === 'seguir' ? (
        <Button
          tamanho="sm"
          variante={segue ? 'neutro' : 'primario'}
          onClick={() =>
            executar(async () => {
              const r = await api.seguir(u.id);
              toast(r.following ? `Seguindo ${u.nome}` : `Deixou de seguir ${u.nome}`);
              onMudou?.();
            })
          }
        >
          {segue ? 'Seguindo' : 'Seguir'}
        </Button>
      ) : (
        <Button
          tamanho="sm"
          variante="neutro"
          onClick={() =>
            executar(async () => {
              const id = await api.abrirConversa(u.id);
              go('chat', { conversaId: id });
            })
          }
        >
          Mensagem
        </Button>
      )}
    </li>
  );
}

/* ── comentário ──────────────────────────────────────────────────────── */

export function ComentarioItem({
  c,
  onMudou,
}: {
  c: Comentario;
  onMudou?: () => void;
}) {
  const { go } = useApp();
  const acao = useAcao();

  return (
    <li className="flex gap-3" style={{ marginLeft: c.resposta ? 48 : 0 }}>
      <button
        onClick={() => go('perfil', { handle: c.autor.handle })}
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Perfil de ${c.autor.nome}`}
      >
        <Avatar src={c.autor.avatar} nome={c.autor.nome} size={c.resposta ? 28 : 36} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-t1">{c.autor.handle}</span>
          <span className="text-xs text-t4">{c.tempo}</span>
          {c.autora && (
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-t3">
              autor
            </span>
          )}
        </div>
        <p className="m-0 text-sm leading-relaxed break-words text-t2">{c.texto}</p>
      </div>
      <button
        onClick={() => acao(async () => { await api.curtirComentario(c.id); onMudou?.(); })}
        aria-label={c.curtido ? 'Remover curtida' : 'Curtir comentário'}
        className="flex shrink-0 cursor-pointer flex-col items-center gap-0.5 border-0 bg-transparent p-0 text-xs"
        style={{ color: c.curtido ? 'var(--accent)' : '#858487' }}
      >
        <Icon name="heart" size={16} />
        {c.curtidas > 0 && c.curtidas}
      </button>
    </li>
  );
}
