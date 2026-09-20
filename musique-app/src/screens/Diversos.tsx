import { useState } from 'react';
import { useApp, type FeedEstado } from '../app/store';
import { Shell, TopBar } from '../components/layout/Shell';
import { ComentarioItem } from '../components/domain';
import {
  Avatar,
  Button,
  Icon,
  Img,
  Tag,
  Vazio,
  type IconName,
} from '../components/ui';
import { userById } from '../data/db';

/* ── notificações ────────────────────────────────────────────────────── */

const ICONE: Record<string, { i: IconName; bg: string }> = {
  curtida: { i: 'heart', bg: '#EF5B67' },
  comentario: { i: 'chat', bg: 'var(--accent)' },
  seguir: { i: 'userplus', bg: '#4CCB88' },
  grupo: { i: 'nodes', bg: '#4A494E' },
};

export function Notificacoes() {
  const { s, d, go, toast } = useApp();
  const grupos: ('Hoje' | 'Esta semana')[] = ['Hoje', 'Esta semana'];

  return (
    <Shell>
      <TopBar
        titulo="Notificações"
        acao={
          <Button
            tamanho="sm"
            variante="fantasma"
            onClick={() => {
              d({ t: 'ler-notificacoes' });
              toast('Tudo marcado como lido');
            }}
          >
            Marcar como lidas
          </Button>
        }
      />

      <div className="flex flex-col gap-5 py-4">
        {grupos.map((g) => {
          const itens = s.notificacoes.filter((n) => n.grupo === g);
          if (!itens.length) return null;
          return (
            <section key={g} className="flex flex-col gap-2">
              <h2 className="m-0 px-4 text-sm font-semibold text-t3">{g}</h2>
              <ul className="m-0 flex list-none flex-col gap-1 px-2 p-0">
                {itens.map((n) => {
                  const ic = ICONE[n.tipo];
                  return (
                    <li key={n.id}>
                      <div
                        className={`flex items-center gap-3 rounded-2xl p-2 pr-3 ${
                          n.lida ? 'bg-transparent' : 'bg-surface'
                        }`}
                      >
                        <span className="relative shrink-0">
                          <Avatar src={n.avatar} size={44} />
                          <span
                            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas text-white"
                            style={{ background: ic.bg }}
                          >
                            <Icon name={ic.i} size={11} stroke={2.2} />
                          </span>
                        </span>

                        <button
                          onClick={() =>
                            n.tipo === 'grupo'
                              ? go('grupos')
                              : n.tipo === 'seguir'
                                ? go('perfil', { userId: 'marina' })
                                : go('post', { postId: s.posts[0].id })
                          }
                          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
                        >
                          <p className="m-0 text-sm leading-relaxed text-t2">
                            <span className="font-semibold text-t1">{n.quem}</span>{' '}
                            {n.texto}
                          </p>
                          <span className="text-xs text-t4">{n.tempo}</span>
                        </button>

                        {n.cta && (
                          <Button
                            tamanho="sm"
                            variante={n.ctaPrimario ? 'primario' : 'neutro'}
                            onClick={() => toast(`${n.cta}: feito`)}
                          >
                            {n.cta}
                          </Button>
                        )}

                        {n.thumb && (
                          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-elevated">
                            <Img src={n.thumb} alt="" />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {s.notificacoes.length === 0 && (
          <Vazio
            icone="bell"
            titulo="Nada por aqui"
            texto="Quando alguém curtir, comentar ou seguir você, aparece nesta tela."
          />
        )}
      </div>
    </Shell>
  );
}

/* ── publicação aberta ───────────────────────────────────────────────── */

export function PostDetalhe() {
  const { s, d, rota, postAtual, abrir, go, toast } = useApp();
  const post = postAtual(rota.params?.postId) ?? s.posts[0];
  const autor = userById(post.autorId);
  const segue = !!s.seguindo[autor.id];
  const [comentario, setComentario] = useState('');

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar
          titulo="Publicação"
          acao={
            <Button
              tamanho="sm"
              variante={segue ? 'neutro' : 'primario'}
              onClick={() => {
                d({ t: 'seguir', userId: autor.id });
                toast(segue ? `Deixou de seguir ${autor.nome}` : `Seguindo ${autor.nome}`);
              }}
            >
              {segue ? 'Seguindo' : 'Seguir'}
            </Button>
          }
        />

        <div className="scroll-y min-h-0 flex-1 dk:mx-auto dk:w-full dk:max-w-5xl">
          <div className="flex flex-col dk:flex-row dk:gap-6 dk:p-6">
            <div className="dk:flex-1">
              <div className="aspect-4/3 w-full overflow-hidden bg-elevated dk:rounded-2xl">
                <Img src={post.media} alt={post.mediaAlt} loading="eager" />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4 dk:w-96 dk:shrink-0 dk:p-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => go('perfil', { userId: autor.id })}
                  className="cursor-pointer border-0 bg-transparent p-0"
                  aria-label={`Perfil de ${autor.nome}`}
                >
                  <Avatar src={autor.avatar} size={44} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="one-line text-sm font-semibold text-t1">
                    {autor.handle}
                  </span>
                  <span className="one-line text-xs text-t4">{post.meta}</span>
                </div>
                <button
                  onClick={() => abrir('menu-post', { postId: post.id })}
                  aria-label="Mais opções"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t3"
                >
                  <Icon name="more" size={20} />
                </button>
              </div>

              <p className="m-0 text-sm leading-relaxed break-words text-t2">
                {post.texto} {post.mencao && <span className="font-medium text-brand-300">{post.mencao}</span>} {post.cauda}
              </p>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Tag
                      key={t}
                      onClick={() => {
                        d({ t: 'busca', valor: t.replace('#', '') });
                        go('buscar');
                      }}
                    >
                      {t}
                    </Tag>
                  ))}
                </div>
              )}

              <span className="flex items-center gap-1.5 text-xs text-t4">
                <Icon name="pin" size={14} />
                {post.quando} · {post.local}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {post.reacoes.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => abrir('reacoes', { postId: post.id })}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-elevated px-2.5 text-xs text-t2"
                  >
                    <span aria-hidden>{r.emoji}</span>
                    {r.count}
                  </button>
                ))}
                <button
                  onClick={() => abrir('reacoes', { postId: post.id })}
                  aria-label="Reagir"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong bg-transparent text-t3"
                >
                  <Icon name="plus" size={14} />
                </button>
                <div className="flex-1" />
                <span className="flex items-center gap-1.5 text-sm font-semibold text-t1">
                  <Icon name="like" size={16} />
                  {post.curtidas}
                </span>
              </div>

              <div className="flex items-center gap-1 border-y border-elevated py-1">
                <button
                  onClick={() => d({ t: 'curtir', postId: post.id })}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium"
                  style={{ color: post.curtido ? 'var(--accent)' : 'var(--color-t2)' }}
                >
                  <Icon name="like" size={18} /> Curtir
                </button>
                <button
                  onClick={() => abrir('comentarios', { postId: post.id })}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium text-t2"
                >
                  <Icon name="chat" size={18} /> Comentar
                </button>
                <button
                  onClick={() => abrir('compartilhar', { postId: post.id })}
                  className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-sm font-medium text-t2"
                >
                  <Icon name="share" size={18} /> Enviar
                </button>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="m-0 text-sm font-semibold text-t1">
                  {post.comentarios.length} comentários
                </h2>
                <div className="flex-1" />
                <button
                  onClick={() => abrir('comentarios', { postId: post.id })}
                  className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
                >
                  Ver todos
                </button>
              </div>

              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {post.comentarios.slice(0, 3).map((c) => (
                  <ComentarioItem key={c.id} c={c} postId={post.id} />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!comentario.trim()) return;
            d({ t: 'comentar', postId: post.id, texto: comentario.trim() });
            setComentario('');
            toast('Comentário publicado');
          }}
          className="safe-b flex shrink-0 items-center gap-2 border-t border-elevated bg-canvas px-4 py-3"
        >
          <Avatar src={s.perfil.avatar} size={36} />
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escreva um comentário"
            aria-label="Escreva um comentário"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
          />
          <button
            type="submit"
            disabled={!comentario.trim()}
            aria-label="Enviar comentário"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            <Icon name="send" size={18} />
          </button>
        </form>
      </div>
    </Shell>
  );
}

/* ── configurações ───────────────────────────────────────────────────── */

const ACCENTS = ['#6155F5', '#756BFF', '#558DF5'];

export function Configuracoes() {
  const { s, d, go, abrir, toast } = useApp();

  const secoes: {
    titulo: string;
    itens: { label: string; valor?: string; onClick: () => void; extra?: React.ReactNode }[];
  }[] = [
    {
      titulo: 'Conta',
      itens: [
        {
          label: 'Alterar e-mail',
          valor: 'richard@email.com',
          onClick: () => toast('Troca de e-mail entra com o back-end'),
        },
        {
          label: 'Alterar senha',
          valor: 'Trocada há 3 meses',
          onClick: () => toast('Troca de senha entra com o back-end'),
        },
        {
          label: 'Privacidade da conta',
          valor: 'Pública',
          onClick: () => toast('Conta pública: qualquer pessoa pode ver seu perfil'),
        },
        { label: 'Editar perfil', onClick: () => go('editar-perfil') },
      ],
    },
    {
      titulo: 'Preferências',
      itens: [
        {
          label: 'Notificações',
          valor: 'Curtidas, comentários e menções',
          onClick: () => go('notificacoes'),
        },
        { label: 'Aparência', valor: 'Escuro', onClick: () => toast('Só o tema escuro nesta versão') },
        {
          label: 'Cor de destaque',
          extra: (
            <span className="flex gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  aria-label={`Usar ${c}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    d({ t: 'accent', valor: c });
                  }}
                  className="h-6 w-6 cursor-pointer rounded-full border-2"
                  style={{
                    background: c,
                    borderColor: s.accent === c ? '#fff' : 'transparent',
                  }}
                />
              ))}
            </span>
          ),
          onClick: () => {},
        },
        {
          label: 'Idioma',
          valor: 'Português (Brasil)',
          onClick: () => toast('Só português nesta versão'),
        },
      ],
    },
    {
      titulo: 'Estados do feed (demonstração)',
      itens: (
        [
          ['Feed normal', 'ok'],
          ['Carregando', 'loading'],
          ['Feed vazio', 'vazio'],
          ['Erro de conexão', 'erro'],
        ] as [string, FeedEstado][]
      ).map(([label, estado]) => ({
        label,
        valor: s.feed === estado ? 'ativo' : '',
        onClick: () => {
          d({ t: 'feed', estado });
          go('home');
        },
      })),
    },
    {
      titulo: 'Suporte',
      itens: [
        { label: 'Ajuda', onClick: () => toast('Central de ajuda em breve') },
        { label: 'Termos de uso', onClick: () => toast('Termos de uso em breve') },
        { label: 'Política de privacidade', onClick: () => toast('Política em breve') },
      ],
    },
  ];

  return (
    <Shell>
      <TopBar titulo="Configurações" />

      <div className="flex flex-col gap-5 py-4 dk:mx-auto dk:w-full dk:max-w-2xl">
        <button
          onClick={() => go('perfil')}
          className="mx-4 flex cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface p-3 text-left"
        >
          <Avatar src={s.perfil.avatar} size={52} />
          <span className="min-w-0 flex-1">
            <span className="one-line block text-base font-semibold text-t1">
              {s.perfil.nome}
            </span>
            <span className="one-line block text-xs text-t4">{s.perfil.handle}</span>
          </span>
          <Icon name="next" size={18} className="text-t4" />
        </button>

        {secoes.map((sec) => (
          <section key={sec.titulo} className="flex flex-col gap-2">
            <h2 className="m-0 px-4 text-sm font-semibold text-t3">{sec.titulo}</h2>
            <ul className="m-0 flex list-none flex-col gap-0.5 px-2 p-0">
              {sec.itens.map((i) => (
                <li key={i.label}>
                  <button
                    onClick={i.onClick}
                    className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left transition-colors hover:bg-surface"
                  >
                    <span className="one-line min-w-0 flex-1 text-sm text-t2">
                      {i.label}
                    </span>
                    {i.extra}
                    {i.valor && (
                      <span className="one-line max-w-[45%] min-w-0 text-right text-sm text-t4">
                        {i.valor}
                      </span>
                    )}
                    {!i.extra && <Icon name="next" size={18} className="shrink-0 text-t4" />}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="px-4">
          <Button variante="perigo" bloco onClick={() => abrir('sair')}>
            <Icon name="logout" size={18} /> Sair da conta
          </Button>
        </div>

        <p className="m-0 pb-4 text-center text-xs text-t5">
          Musique 1.0.0 · feito para ouvir junto
        </p>
      </div>
    </Shell>
  );
}
