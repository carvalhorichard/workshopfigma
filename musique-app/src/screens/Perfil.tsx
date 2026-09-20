import { useState } from 'react';
import { useApp } from '../app/store';
import { Shell, TopBar } from '../components/layout/Shell';
import { PessoaLinha } from '../components/domain';
import {
  Avatar,
  AvatarStack,
  Button,
  Campo,
  Chip,
  Icon,
  IconButton,
  Img,
  Tabs,
  Vazio,
  entradaCls,
} from '../components/ui';
import { INTERESSES, MEUS_POSTS, userById } from '../data/db';
import { img } from '../data/images';

const CAPA = img('8c05828cc80395269ce165e1604d7d12', 1400);

export function Perfil() {
  const { s, d, rota, go, abrir, toast } = useApp();
  const outroId = rota.params?.userId;
  const eu = !outroId || outroId === 'eu';
  const u = eu ? s.perfil : userById(outroId);
  const segue = !eu && !!s.seguindo[u.id];

  const abas = eu
    ? ['Publicações', 'Salvos', 'Grupos', 'Sobre']
    : ['Publicações', 'Grupos', 'Sobre'];
  const aba = abas.includes(s.abaPerfil) ? s.abaPerfil : 'Publicações';

  const salvos = s.posts.filter((p) => p.salvo);
  const meusGrupos = s.grupos.filter((g) => g.status === 'participando');
  const interesses = eu ? s.perfil.interesses : ['Violão', 'MPB', 'Fingerstyle', 'Ensino'];
  const stats = eu
    ? [
        { v: String(s.posts.filter((p) => p.autorId === 'eu').length + 128), l: 'publicações' },
        { v: '1.204', l: 'seguidores' },
        { v: '342', l: 'seguindo' },
      ]
    : [
        { v: '96', l: 'publicações' },
        { v: '3.480', l: 'seguidores' },
        { v: '210', l: 'seguindo' },
      ];

  return (
    <Shell>
      {!eu && <TopBar titulo={u.handle} />}

      <div className="flex flex-col gap-4 pb-6">
        <div className="relative h-36 w-full overflow-hidden bg-elevated dk:h-52 dk:rounded-b-3xl">
          <Img src={CAPA} alt="" loading="eager" />
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
            src={u.avatar}
            size={88}
            className="border-4 border-canvas"
            alt={u.nome}
          />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-2xl font-bold tracking-tight text-t1">{u.nome}</h1>
            <span className="text-sm text-t4">{u.handle}</span>
          </div>
          {u.bio && (
            <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-t2">{u.bio}</p>
          )}
          {u.local && (
            <span className="flex items-center gap-1.5 text-xs text-t4">
              <Icon name="pin" size={14} />
              {u.local}
            </span>
          )}

          <div className="flex gap-6 py-1">
            {stats.map((st) => (
              <button
                key={st.l}
                onClick={() => toast(`Lista de ${st.l} entra na próxima etapa`)}
                className="cursor-pointer border-0 bg-transparent p-0 text-left"
              >
                <span className="block text-lg font-bold text-t1">{st.v}</span>
                <span className="block text-xs text-t4">{st.l}</span>
              </button>
            ))}
          </div>

          {!eu && (
            <div className="flex items-center gap-2 text-xs text-t4">
              <AvatarStack
                urls={['elina', 'marina', 'teal'].map((i) => userById(i).avatar)}
                size={24}
                borda="var(--color-canvas)"
              />
              Seguido por Elina, Marina e mais 12
            </div>
          )}

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
                  variante={segue ? 'neutro' : 'primario'}
                  onClick={() => {
                    d({ t: 'seguir', userId: u.id });
                    toast(segue ? `Deixou de seguir ${u.nome}` : `Seguindo ${u.nome}`);
                  }}
                >
                  {segue ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button
                  variante="neutro"
                  onClick={() => {
                    d({ t: 'nova-conversa', userId: u.id });
                    const cv = s.conversas.find((c) => c.comId === u.id);
                    go('chat', { conversaId: cv?.id ?? '', userId: u.id });
                  }}
                >
                  Mensagem
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-sm font-semibold text-t1">Interesses</h2>
            <div className="flex flex-wrap gap-2">
              {interesses.map((i) => (
                <Chip
                  key={i}
                  onClick={() => {
                    d({ t: 'busca', valor: i });
                    go('buscar');
                  }}
                >
                  {i}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <Tabs itens={abas} atual={aba} onChange={(v) => d({ t: 'aba-perfil', valor: v })} />

        {aba === 'Publicações' && (
          <div className="grid grid-cols-3 gap-1 px-1 dk:gap-2 dk:px-4">
            {MEUS_POSTS.map((p, i) => (
              <button
                key={i}
                onClick={() => go('post', { postId: s.posts[i % s.posts.length].id })}
                className="aspect-square cursor-pointer overflow-hidden border-0 bg-elevated p-0 dk:rounded-xl"
              >
                <Img src={p.img} alt={p.alt} />
              </button>
            ))}
          </div>
        )}

        {aba === 'Salvos' && (
          <div className="px-4">
            {salvos.length ? (
              <div className="grid grid-cols-3 gap-2">
                {salvos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => go('post', { postId: p.id })}
                    className="aspect-square cursor-pointer overflow-hidden rounded-xl border-0 bg-elevated p-0"
                  >
                    <Img src={p.media} alt={p.mediaAlt} />
                  </button>
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
          <ul className="m-0 flex list-none flex-col gap-2 px-4 p-0">
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
                    <span className="one-line block text-xs text-t4">{g.membros}</span>
                  </span>
                  <Icon name="next" size={18} className="text-t4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {aba === 'Sobre' && (
          <div className="flex flex-col gap-4 px-4">
            <div className="rounded-2xl bg-surface p-4">
              <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Bio</h3>
              <p className="m-0 text-sm leading-relaxed text-t3">{u.bio}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <h3 className="m-0 mb-2 text-sm font-semibold text-t1">Onde</h3>
              <p className="m-0 text-sm leading-relaxed text-t3">{u.local}</p>
            </div>
            {eu && (
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="m-0 mb-3 text-sm font-semibold text-t1">Sugestões para você</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {['joao', 'marina', 'rafa'].map(userById).map((x) => (
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
  const { s, d, back, toast } = useApp();
  const [nome, setNome] = useState(s.perfil.nome);
  const [user, setUser] = useState(s.perfil.handle.replace('@', ''));
  const [bio, setBio] = useState(s.perfil.bio ?? '');
  const [local, setLocal] = useState(s.perfil.local ?? '');
  const [interesses, setInteresses] = useState<string[]>(s.perfil.interesses);
  const [novo, setNovo] = useState('');
  const [erro, setErro] = useState('');

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !user.trim()) {
      setErro('Nome e usuário são obrigatórios.');
      return;
    }
    d({
      t: 'salvar-perfil',
      dados: { nome, handle: `@${user}`, bio, local, interesses },
    });
    toast('Perfil atualizado');
    back();
  }

  return (
    <Shell semNav>
      <form onSubmit={salvar} className="flex h-dvh flex-col">
        <TopBar
          titulo="Editar perfil"
          fechar
          acao={
            <Button type="submit" tamanho="sm">
              Salvar
            </Button>
          }
        />

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-4 p-4 dk:mx-auto dk:w-full dk:max-w-2xl">
          <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-elevated">
            <Img src={CAPA} alt="" />
            <button
              type="button"
              onClick={() => toast('Upload real entra quando ligarmos o banco')}
              className="absolute inset-0 flex cursor-pointer items-center justify-center gap-2 border-0 bg-canvas/50 text-sm font-medium text-t1"
            >
              <Icon name="camera" size={20} /> Trocar capa
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Avatar src={s.perfil.avatar} size={72} />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variante="neutro"
                tamanho="sm"
                onClick={() => toast('Upload real entra quando ligarmos o banco')}
              >
                Trocar foto
              </Button>
              <span className="text-xs text-t4">JPG ou PNG, até 5 MB.</span>
            </div>
          </div>

          <Campo label="Nome" erro={erro}>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={entradaCls}
            />
          </Campo>

          <Campo
            label="Usuário"
            hint={user.length > 2 ? 'Disponível' : 'Use ao menos 3 caracteres.'}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-0 flex h-13 items-center text-base text-t4">
                @
              </span>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value.replace(/\s|@/g, ''))}
                className={`${entradaCls} pl-9`}
              />
            </div>
          </Campo>

          <Campo
            label="Bio"
            hint={`Hashtags viram interesses. ${bio.length}/150`}
          >
            <textarea
              value={bio}
              maxLength={150}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-w-0 resize-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base leading-relaxed text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
          </Campo>

          <Campo label="Localização">
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
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
            {interesses.length === 0 && (
              <span className="text-xs text-t4">
                Sugestões: {INTERESSES.join(', ')}
              </span>
            )}
          </div>
        </div>
      </form>
    </Shell>
  );
}
