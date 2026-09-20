import { useMemo, useState } from 'react';
import { useApp } from '../app/store';
import { Shell } from '../components/layout/Shell';
import { GrupoLinha, PessoaLinha } from '../components/domain';
import { Button, Chip, Icon, Vazio } from '../components/ui';
import { BUSCAS_RECENTES, SUGESTOES_BUSCA, USERS } from '../data/db';

const TIPOS = ['Tudo', 'Pessoas', 'Grupos', 'Publicações'];

export function Buscar() {
  const { s, d, go } = useApp();
  const [tipo, setTipo] = useState('Tudo');
  const q = s.busca.trim().toLowerCase();

  const pessoas = useMemo(
    () =>
      USERS.filter(
        (u) =>
          u.id !== 'eu' &&
          (!q ||
            u.nome.toLowerCase().includes(q) ||
            u.handle.toLowerCase().includes(q) ||
            (u.contexto ?? '').toLowerCase().includes(q)),
      ),
    [q],
  );

  const grupos = useMemo(
    () =>
      s.grupos.filter(
        (g) =>
          !q ||
          g.nome.toLowerCase().includes(q) ||
          g.categoria.toLowerCase().includes(q) ||
          g.sobre.toLowerCase().includes(q),
      ),
    [s.grupos, q],
  );

  const posts = useMemo(
    () =>
      s.posts.filter(
        (p) =>
          !q ||
          p.texto.toLowerCase().includes(q) ||
          p.tags.join(' ').toLowerCase().includes(q),
      ),
    [s.posts, q],
  );

  const semResultado = q && !pessoas.length && !grupos.length && !posts.length;
  const mostra = (t: string) => tipo === 'Tudo' || tipo === t;

  return (
    <Shell>
      <div className="flex flex-col gap-5 pb-6">
        <div className="safe-t sticky top-0 z-20 flex flex-col gap-4 bg-canvas/95 px-4 pb-1 pt-4 backdrop-blur">
          <h1 className="m-0 text-2xl font-bold tracking-tight text-t1">Buscar</h1>

          <div className="relative">
            <label htmlFor="q" className="sr-only">
              Buscar pessoas e grupos
            </label>
            <input
              id="q"
              type="search"
              value={s.busca}
              onChange={(e) => d({ t: 'busca', valor: e.target.value })}
              placeholder="O que deseja fazer de bom hoje?"
              className="h-13 w-full min-w-0 rounded-xl border border-line bg-surface pl-12 pr-12 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
            <span className="pointer-events-none absolute left-0 top-0 flex h-13 w-12 items-center justify-center text-t3">
              <Icon name="search" size={20} />
            </span>
            {s.busca && (
              <button
                onClick={() => d({ t: 'busca', valor: '' })}
                aria-label="Limpar busca"
                className="absolute right-1 top-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t3"
              >
                <Icon name="close" size={18} stroke={1.8} />
              </button>
            )}
          </div>

          <div className="rail -mx-4 px-4">
            <div className="flex w-max gap-2">
              {TIPOS.map((t) => (
                <Chip key={t} ativo={tipo === t} onClick={() => setTipo(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {!q && (
          <div className="rail w-full">
            <div className="flex w-max gap-2 px-4">
              {BUSCAS_RECENTES.map((r) => (
                <Chip key={r} icone="clock" onClick={() => d({ t: 'busca', valor: r })}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {semResultado ? (
          <>
            <Vazio
              icone="search"
              titulo={`Nenhum resultado para “${s.busca}”`}
              texto="Confira a escrita ou tente um termo mais amplo, como o instrumento ou o estilo."
            >
              <Button variante="neutro" onClick={() => d({ t: 'busca', valor: '' })}>
                Limpar busca
              </Button>
            </Vazio>

            <section className="flex flex-col gap-3 px-4">
              <h2 className="m-0 text-xl font-semibold text-t1">Tente por aqui</h2>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES_BUSCA.map((t) => (
                  <Chip key={t} onClick={() => d({ t: 'busca', valor: t })}>
                    {t}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3 px-4">
              <h2 className="m-0 text-xl font-semibold text-t1">Grupos em alta</h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {s.grupos.slice(0, 2).map((g) => (
                  <GrupoLinha key={g.id} g={g} compacto />
                ))}
              </ul>
            </section>
          </>
        ) : (
          <div className="flex flex-col gap-5">
            {mostra('Pessoas') && pessoas.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="m-0 min-w-0 text-xl font-semibold text-t1">Pessoas</h2>
                  <div className="flex-1" />
                  <button
                    onClick={() => setTipo('Pessoas')}
                    className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
                  >
                    Ver todas
                  </button>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {(tipo === 'Tudo' ? pessoas.slice(0, 4) : pessoas).map((u) => (
                    <PessoaLinha key={u.id} u={u} />
                  ))}
                </ul>
              </section>
            )}

            {mostra('Grupos') && grupos.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="m-0 min-w-0 text-xl font-semibold text-t1">Grupos</h2>
                  <div className="flex-1" />
                  <button
                    onClick={() => go('grupos')}
                    className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
                  >
                    Ver todos
                  </button>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {(tipo === 'Tudo' ? grupos.slice(0, 4) : grupos).map((g) => (
                    <GrupoLinha key={g.id} g={g} />
                  ))}
                </ul>
              </section>
            )}

            {mostra('Publicações') && posts.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <h2 className="m-0 text-xl font-semibold text-t1">Publicações</h2>
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go('post', { postId: p.id })}
                      className="aspect-square cursor-pointer overflow-hidden rounded-lg border-0 bg-elevated p-0"
                    >
                      <img
                        src={p.media}
                        alt={p.mediaAlt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
