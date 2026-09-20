import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp, useAcao } from '../app/store';
import { api, enviarArquivo } from '../lib/api';
import { Shell, TopBar } from '../components/layout/Shell';
import { PessoaLinha, PostCard } from '../components/domain';
import {
  Avatar,
  Button,
  Campo,
  Chip,
  Icon,
  IconButton,
  Img,
  Skeleton,
  Tabs,
  Vazio,
  entradaCls,
} from '../components/ui';
import { INTERESSES_SUGERIDOS, type Perfil as TPerfil, type Post } from '../data/types';

export function Perfil() {
  const { s, set, rota, go, abrir, toast, recarregar } = useApp();
  const acao = useAcao();

  const handleAlvo = rota.params?.handle;
  const eu = !handleAlvo || handleAlvo === s.perfil?.handle;

  const [p, setP] = useState<TPerfil | null>(eu ? s.perfil : null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [salvos, setSalvos] = useState<Post[] | null>(null);

  const carregar = useCallback(async () => {
    const alvo = handleAlvo ?? s.perfil?.handle;
    if (!alvo) return;
    const [perfil, lista] = await Promise.all([
      eu ? api.eu() : api.perfil(alvo),
      api.postsDoUsuario(alvo),
    ]);
    setP(perfil);
    setPosts(lista);
  }, [handleAlvo, eu, s.perfil?.handle]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (eu && s.abaPerfil === 'Salvos' && salvos === null) {
      api.salvos().then(setSalvos).catch(() => setSalvos([]));
    }
  }, [eu, s.abaPerfil, salvos]);

  const abas = eu ? ['Publicações', 'Salvos', 'Grupos', 'Sobre'] : ['Publicações', 'Sobre'];
  const aba = abas.includes(s.abaPerfil) ? s.abaPerfil : 'Publicações';
  const meusGrupos = s.grupos.filter((g) => g.status === 'ACTIVE');

  if (!p)
    return (
      <Shell>
        {!eu && <TopBar titulo="Perfil" />}
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </Shell>
    );

  return (
    <Shell>
      {!eu && <TopBar titulo={p.handle} />}

      <div className="flex flex-col gap-4 pb-6">
        <div className="relative h-36 w-full overflow-hidden bg-elevated dk:h-52 dk:rounded-b-3xl">
          {p.capa ? (
            <Img src={p.capa} alt="" loading="eager" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  'radial-gradient(120% 100% at 30% 0%, var(--accent-soft) 0%, transparent 60%), #242326',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 to-transparent" />
          {eu && (
            <div className="absolute right-3 top-3 flex gap-2">
              <IconButton
                name="bell"
                label="Notificações"
                className="border border-line-strong bg-canvas/70 backdrop-blur"
                onClick={() => go('notificacoes')}
              />
              <IconButton
                name="settings"
                label="Configurações"
                className="border border-line-strong bg-canvas/70 backdrop-blur"
                onClick={() => go('config')}
              />
            </div>
          )}
        </div>

        <div className="-mt-14 flex flex-col gap-3 px-4">
          <Avatar
            src={p.avatar}
            nome={p.nome}
            size={88}
            className="border-4 border-canvas"
            alt={p.nome}
          />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 flex items-center gap-2 text-2xl font-bold tracking-tight text-t1">
              {p.nome}
              {p.admin && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  admin
                </span>
              )}
            </h1>
            <span className="text-sm text-t4">{p.handle}</span>
          </div>

          {p.bio && <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-t2">{p.bio}</p>}
          {p.local && (
            <span className="flex items-center gap-1.5 text-xs text-t4">
              <Icon name="pin" size={14} />
              {p.local}
            </span>
          )}

          <div className="flex gap-6 py-1">
            {[
              { v: p.publicacoes, l: 'publicações' },
              { v: p.seguidores, l: 'seguidores' },
              { v: p.seguindo, l: 'seguindo' },
            ].map((st) => (
              <div key={st.l}>
                <span className="block text-lg font-bold text-t1">{st.v}</span>
                <span className="block text-xs text-t4">{st.l}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {eu ? (
              <>
                <Button onClick={() => go('editar-perfil')}>Editar perfil</Button>
                <Button variante="neutro" onClick={() => go('grupos')}>
                  Meus grupos
                </Button>
                <Button variante="neutro" onClick={() => abrir('sair')}>
                  <Icon name="logout" size={16} /> Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  variante={p.seguindoEsta ? 'neutro' : 'primario'}
                  onClick={() =>
                    acao(async () => {
                      const r = await api.seguir(p.id);
                      toast(r.following ? `Seguindo ${p.nome}` : `Deixou de seguir ${p.nome}`);
                      await carregar();
                      void recarregar({ feed: true });
                    })
                  }
                >
                  {p.seguindoEsta ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button
                  variante="neutro"
                  onClick={() =>
                    acao(async () => {
                      const id = await api.abrirConversa(p.id);
                      await recarregar({ conversas: true });
                      go('chat', { conversaId: id });
                    })
                  }
                >
                  Mensagem
                </Button>
              </>
            )}
          </div>

          {p.interesses.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="m-0 text-sm font-semibold text-t1">Interesses</h2>
              <div className="flex flex-wrap gap-2">
                {p.interesses.map((i) => (
                  <Chip
                    key={i}
                    onClick={() => {
                      set('busca', i);
                      go('buscar');
                    }}
                  >
                    {i}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs itens={abas} atual={aba} onChange={(v) => set('abaPerfil', v)} />

        {aba === 'Publicações' &&
          (posts === null ? (
            <div className="grid grid-cols-3 gap-1 px-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Vazio
              icone="plus"
              titulo={eu ? 'Você ainda não publicou' : 'Nada publicado ainda'}
              texto={eu ? 'Sua primeira publicação aparece aqui.' : 'Quando publicar, aparece aqui.'}
            >
              {eu && <Button onClick={() => go('criar')}>Publicar agora</Button>}
            </Vazio>
          ) : (
            <div className="flex flex-col gap-3 px-4">
              {posts.map((x) => (
                <PostCard key={x.id} post={x} />
              ))}
            </div>
          ))}

        {aba === 'Salvos' && (
          <div className="px-4">
            {salvos === null ? (
              <Skeleton className="h-40 w-full" />
            ) : salvos.length ? (
              <div className="flex flex-col gap-3">
                {salvos.map((x) => (
                  <PostCard key={x.id} post={x} />
                ))}
              </div>
            ) : (
              <Vazio
                icone="bookmark"
                titulo="Nada salvo ainda"
                texto="Toque no marcador de uma publicação para guardá-la aqui."
              />
            )}
          </div>
        )}

        {aba === 'Grupos' && (
          <div className="px-4">
            {meusGrupos.length ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {meusGrupos.map((g) => (
                  <li key={g.id}>
                    <button
                      onClick={() => go('grupo', { grupoId: g.id })}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface p-2 pr-3 text-left"
                    >
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-elevated">
                        <Img src={g.cover} alt="" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="one-line block text-sm font-semibold text-t1">
                          {g.nome}
                        </span>
                        <span className="one-line block text-xs text-t4">
                          {g.membros} membros
                        </span>
                      </span>
                      <Icon name="next" size={18} className="text-t4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio
                icone="nodes"
                titulo="Nenhum grupo ainda"
                texto="Entre numa comunidade para ver as publicações dela no seu feed."
              >
                <Button onClick={() => go('grupos')}>Explorar grupos</Button>
              </Vazio>
            )}
          </div>
        )}

        {aba === 'Sobre' && (
          <div className="flex flex-col gap-4 px-4">
            <div className="rounded-2xl bg-surface p-4">
              <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Bio</h3>
              <p className="m-0 text-sm leading-relaxed text-t3">
                {p.bio || 'Ainda sem bio.'}
              </p>
            </div>
            {p.local && (
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Onde</h3>
                <p className="m-0 text-sm leading-relaxed text-t3">{p.local}</p>
              </div>
            )}
            {eu && s.sugestoes.length > 0 && (
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="m-0 mb-3 text-sm font-semibold text-t1">Sugestões para você</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {s.sugestoes.slice(0, 3).map((x) => (
                    <PessoaLinha key={x.id} u={x} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── editar perfil ───────────────────────────────────────────────────── */

export function EditarPerfil() {
  const { s, back, toast, recarregar } = useApp();
  const [nome, setNome] = useState(s.perfil?.nome ?? '');
  const [user, setUser] = useState((s.perfil?.handle ?? '').replace('@', ''));
  const [bio, setBio] = useState(s.perfil?.bio ?? '');
  const [local, setLocal] = useState(s.perfil?.local ?? '');
  const [avatar, setAvatar] = useState<string | null>(s.perfil?.avatar ?? null);
  const [capa, setCapa] = useState<string | null>(s.perfil?.capa ?? null);
  const [interesses, setInteresses] = useState<string[]>(s.perfil?.interesses ?? []);
  const [novo, setNovo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const inputAvatar = useRef<HTMLInputElement>(null);
  const inputCapa = useRef<HTMLInputElement>(null);

  async function subir(
    e: React.ChangeEvent<HTMLInputElement>,
    destino: (u: string) => void,
  ) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      destino(await enviarArquivo(f));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      e.target.value = '';
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }
    if (!/^[a-z0-9._]{3,30}$/.test(user)) {
      setErro('O @ aceita 3 a 30 caracteres: letras minúsculas, números, ponto ou _.');
      return;
    }
    setSalvando(true);
    try {
      await api.salvarPerfil({
        nome: nome.trim(),
        handle: user,
        bio,
        local,
        avatar,
        capa,
        interesses,
      });
      await recarregar({ perfil: true, feed: true });
      toast('Perfil atualizado');
      back();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Shell semNav>
      <form onSubmit={salvar} className="flex h-dvh flex-col">
        <TopBar
          titulo="Editar perfil"
          fechar
          acao={
            <Button type="submit" tamanho="sm" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          }
        />

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-4 p-4 dk:mx-auto dk:w-full dk:max-w-2xl">
          <input ref={inputCapa} type="file" accept="image/*" className="hidden"
                 onChange={(e) => subir(e, setCapa)} />
          <input ref={inputAvatar} type="file" accept="image/*" className="hidden"
                 onChange={(e) => subir(e, setAvatar)} />

          <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-elevated">
            {capa && <Img src={capa} alt="" />}
            <button
              type="button"
              onClick={() => inputCapa.current?.click()}
              className="absolute inset-0 flex cursor-pointer items-center justify-center gap-2 border-0 bg-canvas/50 text-sm font-medium text-t1"
            >
              <Icon name="camera" size={20} /> {capa ? 'Trocar capa' : 'Adicionar capa'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Avatar src={avatar} nome={nome || '?'} size={72} />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variante="neutro"
                tamanho="sm"
                onClick={() => inputAvatar.current?.click()}
              >
                Trocar foto
              </Button>
              <span className="text-xs text-t4">JPG ou PNG, até 5 MB.</span>
            </div>
          </div>

          <Campo label="Nome" erro={erro}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={entradaCls} />
          </Campo>

          <Campo label="Usuário">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-0 flex h-13 items-center text-base text-t4">
                @
              </span>
              <input
                value={user}
                onChange={(e) =>
                  setUser(e.target.value.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase())
                }
                className={`${entradaCls} pl-9`}
              />
            </div>
          </Campo>

          <Campo label="Bio" hint={`${bio.length}/150`}>
            <textarea
              value={bio}
              maxLength={150}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base leading-relaxed text-t1 outline-none focus-visible:border-brand-300"
            />
          </Campo>

          <Campo label="Localização">
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Cidade, UF"
              className={entradaCls}
            />
          </Campo>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-t3">Interesses</span>
            <div className="flex flex-wrap gap-2">
              {interesses.map((i) => (
                <span
                  key={i}
                  className="inline-flex h-7.5 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-xs font-medium text-brand-200"
                >
                  {i}
                  <button
                    type="button"
                    aria-label={`Remover ${i}`}
                    onClick={() => setInteresses(interesses.filter((x) => x !== i))}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-t4"
                  >
                    <Icon name="close" size={12} stroke={2.4} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={novo}
                onChange={(e) => setNovo(e.target.value)}
                placeholder="Adicionar interesse"
                className={entradaCls}
              />
              <Button
                type="button"
                variante="neutro"
                onClick={() => {
                  const v = novo.trim().replace('#', '');
                  if (!v || interesses.includes(v)) return;
                  setInteresses([...interesses, v]);
                  setNovo('');
                }}
              >
                Adicionar
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTERESSES_SUGERIDOS.filter((i) => !interesses.includes(i)).map((i) => (
                <Chip key={i} onClick={() => setInteresses([...interesses, i])}>
                  + {i}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Shell>
  );
}
