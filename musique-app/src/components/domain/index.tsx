import { useApp } from '../../app/store';
import { userById, type Comentario, type Grupo, type User } from '../../data/db';
import { Avatar, AvatarStack, Button, Icon, Img } from '../ui';

export { PostCard } from './PostCard';

/* ── trilho de stories ───────────────────────────────────────────────── */

export function StoriesRail() {
  const { s, d, abrir, go } = useApp();

  return (
    <section aria-label="Stories" className="shrink-0">
      <div className="rail w-full">
        <div className="flex w-max gap-3 px-4">
          <button
            onClick={() => go('criar-story')}
            className="flex w-26 shrink-0 cursor-pointer flex-col gap-2 border-0 bg-transparent p-0"
          >
            <span className="flex h-38 w-26 items-center justify-center rounded-[20px] border border-dashed border-line-strong bg-surface">
              <span className="relative block h-11 w-11">
                <Avatar src={s.perfil.avatar} size={44} />
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

          {s.stories.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                d({ t: 'ver-story', storyId: st.id });
                abrir('story', { storyId: st.id });
              }}
              className="flex w-26 shrink-0 cursor-pointer flex-col gap-2 border-0 bg-transparent p-0"
            >
              <span className="relative block h-38 w-26 overflow-hidden rounded-[20px] bg-surface">
                <Img src={st.img} alt="" />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <Avatar
                    src={userById(st.autorId).avatar}
                    size={40}
                    ring={st.novo ? 'var(--accent)' : '#4A494E'}
                  />
                </span>
              </span>
              <span className="one-line block text-center text-xs text-t3">
                {st.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── card de comunidade / grupo ──────────────────────────────────────── */

export function ComunidadeCard({ g }: { g: Grupo }) {
  const { go, toast } = useApp();
  return (
    <article className="flex w-42 shrink-0 flex-col overflow-hidden rounded-2xl bg-surface">
      <button
        onClick={() => go('grupo', { grupoId: g.id })}
        className="relative block h-21 w-full cursor-pointer border-0 p-0"
        aria-label={`Abrir ${g.nome}`}
      >
        <Img src={g.cover} alt="" />
        <span className="absolute -bottom-3.5 left-3">
          <AvatarStack urls={g.avatares.slice(0, 3)} size={28} />
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-5.5">
        <div className="flex items-start gap-2">
          <h3 className="clamp2 m-0 min-h-10 min-w-0 flex-1 text-base font-semibold break-words text-t1">
            {g.nome}
          </h3>
          <button
            onClick={() => toast('Link da comunidade copiado')}
            aria-label="Compartilhar comunidade"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-t3"
          >
            <Icon name="share" size={18} />
          </button>
        </div>
        <span className="flex items-center gap-2 text-xs text-t3">
          <Icon name="nodes" size={16} />
          {g.grupos}
        </span>
        <span className="flex items-center gap-2 text-xs text-t3">
          <Icon name="users" size={16} />
          {g.membros}
        </span>
      </div>
    </article>
  );
}

/** Linha de grupo usada em Grupos e na Busca. */
export function GrupoLinha({ g, compacto }: { g: Grupo; compacto?: boolean }) {
  const { go, d, toast } = useApp();
  const rotulo =
    g.status === 'participando'
      ? 'Participando'
      : g.status === 'solicitado'
        ? 'Solicitado'
        : g.privacidade === 'Privado'
          ? 'Solicitar'
          : 'Participar';

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
          {compacto ? g.membros : `${g.membros} · ${g.privacidade}`}
        </span>
      </div>
      <Button
        tamanho="sm"
        variante={g.status === 'fora' && g.privacidade === 'Público' ? 'primario' : 'neutro'}
        onClick={() => {
          d({ t: 'grupo-status', grupoId: g.id });
          toast(
            g.status === 'participando'
              ? `Você saiu de ${g.nome}`
              : g.privacidade === 'Privado'
                ? 'Solicitação enviada'
                : `Você entrou em ${g.nome}`,
          );
        }}
      >
        {rotulo}
      </Button>
    </li>
  );
}

/* ── linha de pessoa ─────────────────────────────────────────────────── */

export function PessoaLinha({
  u,
  acao = 'seguir',
}: {
  u: User;
  acao?: 'seguir' | 'mensagem';
}) {
  const { s, d, go, toast } = useApp();
  const segue = !!s.seguindo[u.id];

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3">
      <button
        onClick={() => go('perfil', { userId: u.id })}
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Perfil de ${u.nome}`}
      >
        <Avatar src={u.avatar} size={48} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button
          onClick={() => go('perfil', { userId: u.id })}
          className="one-line cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-t1"
        >
          {u.nome}
        </button>
        <span className="one-line text-xs text-t4">
          {u.handle}
          {u.contexto ? ` · ${u.contexto}` : ''}
        </span>
      </div>
      {acao === 'seguir' ? (
        <Button
          tamanho="sm"
          variante={segue ? 'neutro' : 'primario'}
          onClick={() => {
            d({ t: 'seguir', userId: u.id });
            toast(segue ? `Deixou de seguir ${u.nome}` : `Seguindo ${u.nome}`);
          }}
        >
          {segue ? 'Seguindo' : 'Seguir'}
        </Button>
      ) : (
        <Button
          tamanho="sm"
          variante="neutro"
          onClick={() => {
            d({ t: 'nova-conversa', userId: u.id });
            const cv = s.conversas.find((c) => c.comId === u.id);
            go('chat', { conversaId: cv?.id ?? '', userId: u.id });
          }}
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
  postId,
}: {
  c: Comentario;
  postId: string;
}) {
  const { d, go, toast } = useApp();
  const autor = userById(c.autorId);
  const resposta = !!c.respostaDe;

  return (
    <li
      className="flex gap-3"
      style={{ marginLeft: resposta ? 48 : 0 }}
    >
      <button
        onClick={() => go('perfil', { userId: autor.id })}
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Perfil de ${autor.nome}`}
      >
        <Avatar src={autor.avatar} size={resposta ? 28 : 36} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-t1">{autor.handle}</span>
          <span className="text-xs text-t4">{c.tempo}</span>
          {c.autora && (
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-t3">
              autora
            </span>
          )}
        </div>
        <p className="m-0 text-sm leading-relaxed break-words text-t2">{c.texto}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => toast('Resposta ainda não implementada no mock')}
            className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-t4"
          >
            Responder
          </button>
        </div>
      </div>
      <button
        onClick={() => d({ t: 'curtir-comentario', postId, comentarioId: c.id })}
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
