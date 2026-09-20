import { useEffect, useState } from 'react';
import { useApp } from '../app/store';
import { api } from '../lib/api';
import { Shell } from '../components/layout/Shell';
import { GrupoLinha, PessoaLinha } from '../components/domain';
import {
  Button,
  CabecalhoTela,
  CampoBusca,
  Chip,
  Skeleton,
  Vazio,
} from '../components/ui';
import { SUGESTOES_BUSCA, type Grupo, type Post, type User } from '../data/types';

const TIPOS = ['Tudo', 'Pessoas', 'Grupos', 'Publicações'];

export function Buscar() {
  const { s, set, go } = useApp();
  const [tipo, setTipo] = useState('Tudo');
  const [carregando, setCarregando] = useState(false);
  const [r, setR] = useState<{ pessoas: User[]; grupos: Grupo[]; posts: Post[] }>({
    pessoas: [],
    grupos: [],
    posts: [],
  });

  // busca com atraso, para não disparar a cada tecla
  useEffect(() => {
    const q = s.busca.trim();
    if (!q) {
      setR({ pessoas: [], grupos: [], posts: [] });
      return;
    }
    setCarregando(true);
    const t = setTimeout(() => {
      api
        .buscar(q)
        .then(setR)
        .catch(() => setR({ pessoas: [], grupos: [], posts: [] }))
        .finally(() => setCarregando(false));
    }, 350);
    return () => clearTimeout(t);
  }, [s.busca]);

  async function refazer() {
    if (s.busca.trim()) setR(await api.buscar(s.busca.trim()));
  }

  const vazio =
    s.busca.trim() && !carregando && !r.pessoas.length && !r.grupos.length && !r.posts.length;
  const mostra = (t: string) => tipo === 'Tudo' || tipo === t;

  return (
    <Shell>
      <div className="flex flex-col gap-5 pb-6">
        <CabecalhoTela titulo="Buscar">
          <CampoBusca
            valor={s.busca}
            onChange={(v) => set('busca', v)}
            placeholder="O que deseja fazer de bom hoje?"
            rotulo="Buscar pessoas e grupos"
          />

          <div className="rail -mx-4 px-4">
            <div className="flex w-max gap-2">
              {TIPOS.map((t) => (
                <Chip key={t} ativo={tipo === t} onClick={() => setTipo(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </CabecalhoTela>

        {!s.busca.trim() && (
          <section className="flex flex-col gap-3 px-4">
            <h2 className="m-0 text-xl font-semibold text-t1">Comece por aqui</h2>
            <div className="flex flex-wrap gap-2">
              {SUGESTOES_BUSCA.map((t) => (
                <Chip key={t} icone="search" onClick={() => set('busca', t)}>
                  {t}
                </Chip>
              ))}
            </div>
            {s.sugestoes.length > 0 && (
              <>
                <h2 className="m-0 mt-3 text-xl font-semibold text-t1">Pessoas para seguir</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {s.sugestoes.map((u) => (
                    <PessoaLinha key={u.id} u={u} />
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {carregando && (
          <div className="flex flex-col gap-2 px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        )}

        {vazio && (
          <>
            <Vazio
              icone="search"
              titulo={`Nenhum resultado para “${s.busca}”`}
              texto="Confira a escrita ou tente um termo mais amplo, como o instrumento ou o estilo."
            >
              <Button variante="neutro" onClick={() => set('busca', '')}>
                Limpar busca
              </Button>
            </Vazio>
            <section className="flex flex-col gap-3 px-4">
              <h2 className="m-0 text-xl font-semibold text-t1">Tente por aqui</h2>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES_BUSCA.map((t) => (
                  <Chip key={t} onClick={() => set('busca', t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </section>
          </>
        )}

        {!carregando && !vazio && s.busca.trim() && (
          <div className="flex flex-col gap-5">
            {mostra('Pessoas') && r.pessoas.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <h2 className="m-0 text-xl font-semibold text-t1">Pessoas</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {(tipo === 'Tudo' ? r.pessoas.slice(0, 4) : r.pessoas).map((u) => (
                    <PessoaLinha
                      key={u.id}
                      u={u}
                      segue={u.contexto === 'Você segue'}
                      onMudou={refazer}
                    />
                  ))}
                </ul>
              </section>
            )}

            {mostra('Grupos') && r.grupos.length > 0 && (
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
                  {(tipo === 'Tudo' ? r.grupos.slice(0, 4) : r.grupos).map((g) => (
                    <GrupoLinha key={g.id} g={g} onMudou={refazer} />
                  ))}
                </ul>
              </section>
            )}

            {mostra('Publicações') && r.posts.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <h2 className="m-0 text-xl font-semibold text-t1">Publicações</h2>
                <div className="grid grid-cols-3 gap-1">
                  {r.posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go('post', { postId: p.id })}
                      className="aspect-square cursor-pointer overflow-hidden rounded-lg border-0 bg-elevated p-0"
                    >
                      {p.media ? (
                        <img src={p.media} alt={p.mediaAlt} className="h-full w-full object-cover" />
                      ) : (
                        <span className="clamp2 block p-2 text-left text-xs text-t3">
                          {p.texto}
                        </span>
                      )}
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
