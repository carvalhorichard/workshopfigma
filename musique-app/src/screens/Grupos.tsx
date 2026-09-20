import { useMemo, useState } from 'react';
import { useApp } from '../app/store';
import { Shell, TopBar } from '../components/layout/Shell';
import { PostCard } from '../components/domain';
import {
  Avatar,
  AvatarStack,
  Button,
  Chip,
  Icon,
  Img,
  Tabs,
  Vazio,
} from '../components/ui';
import { FILTROS_GRUPOS, userById } from '../data/db';

/* ── lista de grupos ─────────────────────────────────────────────────── */

export function Grupos() {
  const { s, d, go, toast } = useApp();
  const [q, setQ] = useState('');

  const lista = useMemo(() => {
    const f = s.filtroGrupos;
    return s.grupos
      .filter((g) =>
        f === 'Todos'
          ? true
          : f === 'Participando'
            ? g.status === 'participando'
            : f === 'Sugeridos'
              ? g.status === 'fora'
              : g.categoria === f,
      )
      .filter((g) => !q || g.nome.toLowerCase().includes(q.toLowerCase()));
  }, [s.grupos, s.filtroGrupos, q]);

  return (
    <Shell>
      <div className="flex flex-col gap-4 pb-6">
        <div className="safe-t sticky top-0 z-20 flex flex-col gap-4 bg-canvas/95 px-4 pb-1 pt-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <h1 className="m-0 min-w-0 flex-1 text-2xl font-bold tracking-tight text-t1">
              Grupos
            </h1>
            <Button tamanho="sm" onClick={() => toast('Criação de grupo entra na próxima etapa')}>
              <Icon name="plus" size={16} /> Criar
            </Button>
          </div>

          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar grupos"
              aria-label="Buscar grupos"
              className="h-13 w-full min-w-0 rounded-xl border border-line bg-surface pl-12 pr-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
            <span className="pointer-events-none absolute left-0 top-0 flex h-13 w-12 items-center justify-center text-t3">
              <Icon name="search" size={20} />
            </span>
          </div>

          <div className="rail -mx-4 px-4">
            <div className="flex w-max gap-2">
              {FILTROS_GRUPOS.map((f) => (
                <Chip
                  key={f}
                  ativo={s.filtroGrupos === f}
                  onClick={() => d({ t: 'filtro-grupos', valor: f })}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {lista.length === 0 ? (
          <Vazio
            icone="nodes"
            titulo="Nenhum grupo por aqui"
            texto="Troque o filtro ou busque por instrumento, estilo ou cidade."
          >
            <Button variante="neutro" onClick={() => d({ t: 'filtro-grupos', valor: 'Todos' })}>
              Ver todos
            </Button>
          </Vazio>
        ) : (
          <div className="grid gap-3 px-4 dk:grid-cols-2 xl:grid-cols-3">
            {lista.map((g) => (
              <article
                key={g.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-surface"
              >
                <button
                  onClick={() => go('grupo', { grupoId: g.id })}
                  className="relative block h-32 w-full cursor-pointer border-0 p-0"
                  aria-label={`Abrir ${g.nome}`}
                >
                  <Img src={g.cover} alt="" />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-line-strong bg-canvas/80 px-2.5 py-1 text-[11px] font-medium text-t2 backdrop-blur">
                    {g.privacidade === 'Privado' && <Icon name="lock" size={12} />}
                    {g.privacidade}
                  </span>
                  <span className="absolute -bottom-3.5 left-3">
                    <AvatarStack urls={g.avatares.slice(0, 3)} size={28} />
                  </span>
                </button>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-6">
                  <h3 className="m-0 text-base font-semibold text-t1">{g.nome}</h3>
                  <p className="clamp2 m-0 text-xs leading-relaxed text-t4">{g.sobre}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-t3">
                    <span className="flex items-center gap-1.5">
                      <Icon name="nodes" size={14} />
                      {g.grupos}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="users" size={14} />
                      {g.membros}
                    </span>
                  </div>
                  <Button
                    bloco
                    tamanho="sm"
                    className="mt-1"
                    variante={
                      g.status === 'fora' && g.privacidade === 'Público'
                        ? 'primario'
                        : 'neutro'
                    }
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
                    {g.status === 'participando'
                      ? 'Participando'
                      : g.status === 'solicitado'
                        ? 'Solicitado'
                        : g.privacidade === 'Privado'
                          ? 'Solicitar entrada'
                          : 'Participar'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── grupo aberto ────────────────────────────────────────────────────── */

export function GrupoDetalhe() {
  const { s, d, rota, go, toast } = useApp();
  const g = s.grupos.find((x) => x.id === rota.params?.grupoId) ?? s.grupos[0];
  const posts = s.posts.filter((p) => p.meta.includes(g.nome));
  const membros = ['joao', 'marina', 'elina', 'rafa', 'dani', 'teal'].map(userById);
  const papeis: Record<string, string> = {
    joao: 'Criador',
    marina: 'Admin',
    elina: 'Moderadora',
  };

  return (
    <Shell>
      <TopBar
        titulo={g.nome}
        acao={
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
            {g.status === 'participando'
              ? 'Participando'
              : g.status === 'solicitado'
                ? 'Solicitado'
                : 'Participar'}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 pb-6">
        <div className="relative h-44 w-full overflow-hidden bg-elevated dk:h-60 dk:rounded-b-3xl">
          <Img src={g.cover} alt="" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 to-transparent" />
        </div>

        <div className="-mt-12 flex flex-col gap-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs text-t2">
              {g.privacidade === 'Privado' && <Icon name="lock" size={12} />}
              {g.privacidade}
            </span>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
            >
              {g.categoria}
            </span>
          </div>

          <h1 className="m-0 text-2xl font-bold tracking-tight text-t1">{g.nome}</h1>
          <p className="m-0 text-sm leading-relaxed text-t3">{g.sobre}</p>

          <div className="flex items-center gap-3">
            <AvatarStack urls={g.avatares} size={32} borda="var(--color-canvas)" />
            <span className="text-xs text-t4">
              {g.membros} · {g.grupos}
            </span>
          </div>
        </div>

        <Tabs
          itens={['Publicações', 'Membros', 'Sobre']}
          atual={s.abaGrupo}
          onChange={(v) => d({ t: 'aba-grupo', valor: v })}
        />

        {s.abaGrupo === 'Publicações' && (
          <div className="flex flex-col gap-3 px-4">
            {posts.length ? (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <Vazio
                icone="plus"
                titulo="Nenhuma publicação ainda"
                texto={`Seja a primeira pessoa a publicar em ${g.nome}.`}
              >
                <Button onClick={() => go('criar', { grupo: g.nome })}>Publicar aqui</Button>
              </Vazio>
            )}
          </div>
        )}

        {s.abaGrupo === 'Membros' && (
          <ul className="m-0 flex list-none flex-col gap-2 px-4 p-0">
            {membros.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3"
              >
                <button
                  onClick={() => go('perfil', { userId: u.id })}
                  className="cursor-pointer border-0 bg-transparent p-0"
                  aria-label={`Perfil de ${u.nome}`}
                >
                  <Avatar src={u.avatar} size={44} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="one-line text-sm font-semibold text-t1">{u.nome}</span>
                  <span className="one-line text-xs text-t4">{u.handle}</span>
                </div>
                {papeis[u.id] && (
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--accent)',
                    }}
                  >
                    {papeis[u.id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {s.abaGrupo === 'Sobre' && (
          <div className="flex flex-col gap-4 px-4">
            <div className="rounded-2xl bg-surface p-4">
              <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Descrição</h3>
              <p className="m-0 text-sm leading-relaxed text-t3">{g.sobre}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Regras da casa</h3>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-t3">
                <li>Feedback honesto, sem grosseria.</li>
                <li>Divulgação só na quinta-feira.</li>
                <li>Cifra e áudio sempre com crédito.</li>
              </ul>
            </div>
            <Button
              variante="perigo"
              bloco
              onClick={() => {
                d({ t: 'grupo-status', grupoId: g.id });
                toast(`Você saiu de ${g.nome}`);
              }}
            >
              Sair do grupo
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}
