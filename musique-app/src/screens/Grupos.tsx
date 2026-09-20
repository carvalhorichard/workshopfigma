import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp, useAcao } from '../app/store';
import { api, enviarArquivo } from '../lib/api';
import { Shell, TopBar } from '../components/layout/Shell';
import { BotaoGrupo, PostCard } from '../components/domain';
import {
  AreaTexto,
  Avatar,
  AvatarStack,
  Button,
  CabecalhoTela,
  Campo,
  CampoBusca,
  Chip,
  Icon,
  Img,
  SeletorImagem,
  Sheet,
  Skeleton,
  Tabs,
  Vazio,
  entradaCls,
} from '../components/ui';
import { FILTROS_GRUPOS, type Grupo, type Post, type User } from '../data/types';

/* ── criar grupo ─────────────────────────────────────────────────────── */

function NovoGrupo({ onFechar, onCriado }: { onFechar: () => void; onCriado: () => void }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [privado, setPrivado] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function criar() {
    if (nome.trim().length < 2) {
      setErro('Dê um nome ao grupo.');
      return;
    }
    setOcupado(true);
    try {
      await api.criarGrupo(nome.trim(), descricao.trim(), privado, cover);
      onCriado();
      onFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para criar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Sheet
      titulo="Novo grupo"
      onClose={onFechar}
      alturaMax="auto"
      rodape={
        <Button bloco tamanho="lg" onClick={criar} disabled={ocupado}>
          {ocupado ? 'Criando…' : 'Criar grupo'}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-t3">Capa do grupo</span>
          <SeletorImagem
            url={cover}
            onUrl={setCover}
            aspecto="16 / 9"
            rotulo="Adicionar capa"
          />
        </div>

        <Campo label="Nome" erro={erro}>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Violão e Voz"
            className={entradaCls}
          />
        </Campo>
        <Campo label="Descrição" hint="Explique para quem é o grupo.">
          <AreaTexto
            valor={descricao}
            onChange={setDescricao}
            minLinhas={3}
            maxAltura={200}
            placeholder="Gente que toca e canta junto…"
          />
        </Campo>
        <label className="flex items-start gap-3 rounded-xl bg-surface p-3 text-sm text-t2">
          <input
            type="checkbox"
            checked={privado}
            onChange={(e) => setPrivado(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span>
            Grupo privado
            <span className="block text-xs text-t4">
              Só membros veem as publicações, e a entrada passa por aprovação.
            </span>
          </span>
        </label>
      </div>
    </Sheet>
  );
}

/* ── lista de grupos ─────────────────────────────────────────────────── */

export function Grupos() {
  const { s, set, go, recarregar } = useApp();
  const [q, setQ] = useState('');
  const [lista, setLista] = useState<Grupo[] | null>(null);
  const [novo, setNovo] = useState(false);

  const carregar = useCallback(() => {
    setLista(null);
    api
      .grupos(s.filtroGrupos)
      .then(setLista)
      .catch(() => setLista([]));
  }, [s.filtroGrupos]);

  useEffect(carregar, [carregar]);

  const filtrados = (lista ?? []).filter(
    (g) => !q || g.nome.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Shell>
      <div className="flex flex-col gap-4 pb-6">
        <CabecalhoTela
          titulo="Grupos"
          acao={
            <Button tamanho="sm" onClick={() => setNovo(true)}>
              <Icon name="plus" size={16} /> Criar
            </Button>
          }
        >
          <CampoBusca
            valor={q}
            onChange={setQ}
            placeholder="Buscar grupos"
            rotulo="Buscar grupos"
          />

          <div className="rail -mx-4 px-4">
            <div className="flex w-max gap-2">
              {FILTROS_GRUPOS.map((f) => (
                <Chip
                  key={f}
                  ativo={s.filtroGrupos === f}
                  onClick={() => set('filtroGrupos', f)}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </div>
        </CabecalhoTela>

        {lista === null ? (
          <div className="grid gap-3 px-4 dk:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <Vazio
            icone="nodes"
            titulo="Nenhum grupo por aqui"
            texto="Crie o primeiro grupo ou troque o filtro."
          >
            <Button onClick={() => setNovo(true)}>Criar grupo</Button>
            {s.filtroGrupos !== 'Todos' && (
              <Button variante="neutro" onClick={() => set('filtroGrupos', 'Todos')}>
                Ver todos
              </Button>
            )}
          </Vazio>
        ) : (
          <div className="grid gap-3 px-4 dk:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((g) => (
              <article key={g.id} className="flex flex-col overflow-hidden rounded-2xl bg-surface">
                <button
                  onClick={() => go('grupo', { grupoId: g.id })}
                  className="relative block h-32 w-full cursor-pointer border-0 p-0"
                  aria-label={`Abrir ${g.nome}`}
                >
                  <Img src={g.cover} alt="" />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-line-strong bg-canvas/80 px-2.5 py-1 text-[11px] font-medium text-t2 backdrop-blur">
                    {g.privacidade === 'PRIVATE' && <Icon name="lock" size={12} />}
                    {g.privacidade === 'PRIVATE' ? 'Privado' : 'Público'}
                  </span>
                  {g.avatares.length > 0 && (
                    <span className="absolute -bottom-3.5 left-3">
                      <AvatarStack urls={g.avatares.slice(0, 3)} size={28} />
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-6">
                  <h3 className="m-0 text-base font-semibold text-t1">{g.nome}</h3>
                  {g.descricao && (
                    <p className="clamp2 m-0 text-xs leading-relaxed text-t4">{g.descricao}</p>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-t3">
                    <Icon name="users" size={14} />
                    {g.membros} {g.membros === 1 ? 'membro' : 'membros'}
                  </span>
                  <div className="mt-1">
                    <BotaoGrupo
                      g={g}
                      bloco
                      onMudou={() => {
                        carregar();
                        void recarregar({ grupos: true, feed: true });
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {novo && (
        <NovoGrupo
          onFechar={() => setNovo(false)}
          onCriado={() => {
            carregar();
            void recarregar({ grupos: true });
          }}
        />
      )}
    </Shell>
  );
}

/* ── grupo aberto ────────────────────────────────────────────────────── */

type GrupoDetalhado = Grupo & {
  membrosLista: User[];
  posts: Post[];
  papel: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
};

export function GrupoDetalhe() {
  const { s, set, rota, go, abrir, recarregar } = useApp();
  const acao = useAcao();
  const [g, setG] = useState<GrupoDetalhado | null>(null);
  const [erro, setErro] = useState('');
  const [trocandoCapa, setTrocandoCapa] = useState(false);
  const inputCapa = useRef<HTMLInputElement>(null);

  const id = rota.params?.grupoId;

  const carregar = useCallback(() => {
    if (!id) return;
    api
      .grupo(id)
      .then((r) => {
        if (!r) setErro('Grupo não encontrado ou sem acesso.');
        else setG(r as GrupoDetalhado);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'));
  }, [id]);

  useEffect(carregar, [carregar]);

  if (erro)
    return (
      <Shell>
        <TopBar titulo="Grupo" />
        <Vazio icone="lock" titulo="Sem acesso" texto={erro}>
          <Button onClick={() => go('grupos')}>Ver grupos</Button>
        </Vazio>
      </Shell>
    );

  if (!g)
    return (
      <Shell>
        <TopBar titulo="Grupo" />
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Shell>
    );

  const membro = g.status === 'ACTIVE';
  const admin = g.papel === 'OWNER' || g.papel === 'ADMIN';

  return (
    <Shell>
      <TopBar
        titulo={g.nome}
        acao={
          <BotaoGrupo
            g={g}
            onMudou={() => {
              carregar();
              void recarregar({ grupos: true, feed: true });
            }}
          />
        }
      />

      <div className="flex flex-col gap-4 pb-6">
        <div className="relative h-44 w-full overflow-hidden bg-elevated dk:h-60 dk:rounded-b-3xl">
          {g.cover ? (
            <button
              onClick={() =>
                abrir('imagem', {
                  url: g.cover!,
                  alt: `Capa de ${g.nome}`,
                  titulo: `Capa de ${g.nome}`,
                })
              }
              aria-label="Ver capa em tela cheia"
              className="block h-full w-full cursor-zoom-in border-0 p-0"
            >
              <Img src={g.cover} alt="" loading="eager" />
            </button>
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  'radial-gradient(120% 100% at 30% 0%, var(--accent-soft) 0%, transparent 60%), #242326',
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/90 to-transparent" />

          {/* só quem administra troca a capa */}
          {admin && (
            <>
              <input
                ref={inputCapa}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  setTrocandoCapa(true);
                  await acao(async () => {
                    const url = await enviarArquivo(f);
                    await api.editarGrupo(g.id, { cover: url });
                    carregar();
                    void recarregar({ grupos: true });
                  }, 'Capa atualizada');
                  setTrocandoCapa(false);
                }}
              />
              <button
                onClick={() => inputCapa.current?.click()}
                disabled={trocandoCapa}
                className="absolute right-3 top-3 flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-canvas/75 px-3 text-xs font-medium text-t1 backdrop-blur disabled:opacity-60"
              >
                <Icon name="camera" size={16} />
                {trocandoCapa ? 'Enviando…' : g.cover ? 'Trocar capa' : 'Adicionar capa'}
              </button>
            </>
          )}
        </div>

        {/* mesmo motivo do perfil: fica acima da capa `relative` */}
        <div className="relative z-10 -mt-12 flex flex-col gap-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs text-t2">
              {g.privacidade === 'PRIVATE' && <Icon name="lock" size={12} />}
              {g.privacidade === 'PRIVATE' ? 'Privado' : 'Público'}
            </span>
            {g.interesses.map((i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
              >
                {i}
              </span>
            ))}
          </div>

          <h1 className="m-0 text-2xl font-bold tracking-tight text-t1">{g.nome}</h1>
          {g.descricao && (
            <p className="m-0 text-sm leading-relaxed text-t3">{g.descricao}</p>
          )}

          <div className="flex items-center gap-3">
            {g.avatares.length > 0 && (
              <AvatarStack urls={g.avatares} size={32} borda="var(--color-canvas)" />
            )}
            <span className="text-xs text-t4">
              {g.membros} {g.membros === 1 ? 'membro' : 'membros'}
            </span>
          </div>

          {membro && (
            <Button variante="neutro" onClick={() => go('criar', { grupoId: g.id })}>
              <Icon name="plus" size={16} /> Publicar neste grupo
            </Button>
          )}
        </div>

        <Tabs
          itens={['Publicações', 'Membros', 'Sobre']}
          atual={s.abaGrupo}
          onChange={(v) => set('abaGrupo', v)}
        />

        {s.abaGrupo === 'Publicações' && (
          <div className="flex flex-col gap-3 px-4">
            {g.posts.length ? (
              g.posts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <Vazio
                icone="plus"
                titulo="Nenhuma publicação ainda"
                texto={`Seja a primeira pessoa a publicar em ${g.nome}.`}
              >
                {membro && (
                  <Button onClick={() => go('criar', { grupoId: g.id })}>Publicar aqui</Button>
                )}
              </Vazio>
            )}
          </div>
        )}

        {s.abaGrupo === 'Membros' && (
          <ul className="m-0 flex list-none flex-col gap-2 px-4 p-0">
            {g.membrosLista.map((u) => (
              <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-surface p-2 pr-3">
                <button
                  onClick={() => go('perfil', { handle: u.handle })}
                  className="cursor-pointer border-0 bg-transparent p-0"
                  aria-label={`Perfil de ${u.nome}`}
                >
                  <Avatar src={u.avatar} nome={u.nome} size={44} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="one-line text-sm font-semibold text-t1">{u.nome}</span>
                  <span className="one-line text-xs text-t4">{u.handle}</span>
                </div>
                {u.contexto && (
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
                  >
                    {u.contexto}
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
              <p className="m-0 text-sm leading-relaxed text-t3">
                {g.descricao || 'Este grupo ainda não tem descrição.'}
              </p>
            </div>
            {membro && (
              <Button
                variante="perigo"
                bloco
                onClick={() =>
                  acao(async () => {
                    await api.participarGrupo(g.id);
                    void recarregar({ grupos: true, feed: true });
                    go('grupos');
                  }, `Você saiu de ${g.nome}`)
                }
              >
                Sair do grupo
              </Button>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
