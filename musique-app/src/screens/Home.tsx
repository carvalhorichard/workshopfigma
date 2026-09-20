import { useApp } from '../app/store';
import { Shell } from '../components/layout/Shell';
import {
  ComunidadeCard,
  PessoaLinha,
  PostCard,
  StoriesRail,
} from '../components/domain';
import { Avatar, Button, Icon, IconButton, Skeleton, Vazio } from '../components/ui';

function Cabecalho() {
  const { s, go } = useApp();
  const temNova = s.notificacoes.some((n) => !n.lida);

  return (
    <header className="safe-t sticky top-0 z-20 flex h-17 items-center gap-2 bg-canvas/95 px-4 backdrop-blur dk:hidden">
      <span className="min-w-0 text-2xl font-bold tracking-tight text-t1">Musique</span>
      <div className="flex-1" />
      <IconButton name="plus" label="Criar publicação" size={24} onClick={() => go('criar')} />
      <button
        onClick={() => go('notificacoes')}
        aria-label="Notificações"
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t2"
      >
        <Icon name="bell" size={24} />
        {temNova && (
          <span
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </button>
      <button
        onClick={() => go('perfil')}
        aria-label="Seu perfil"
        className="cursor-pointer border-0 bg-transparent p-0"
      >
        <Avatar src={s.perfil?.avatar} nome={s.perfil?.nome ?? '?'} size={40} />
      </button>
    </header>
  );
}

function TituloSecao({
  titulo,
  acao,
  onAcao,
}: {
  titulo: string;
  acao?: string;
  onAcao?: () => void;
}) {
  return (
    <div className="flex items-baseline gap-3 px-4">
      <h2 className="m-0 min-w-0 text-xl font-semibold text-t1">{titulo}</h2>
      <div className="flex-1" />
      {acao && (
        <button
          onClick={onAcao}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
        >
          {acao}
        </button>
      )}
    </div>
  );
}

function FeedCarregando() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="rail">
        <div className="flex w-max gap-3 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-38 w-26 rounded-[20px]" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="aspect-4/3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ColunaDireita() {
  const { s, go } = useApp();
  return (
    <div className="flex flex-col gap-4">
      {s.sugestoes.length > 0 && (
        <div className="rounded-2xl bg-surface p-4">
          <h3 className="m-0 mb-3 text-sm font-semibold text-t1">Sugestões para você</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {s.sugestoes.slice(0, 4).map((u) => (
              <PessoaLinha key={u.id} u={u} />
            ))}
          </ul>
        </div>
      )}

      {s.grupos.filter((g) => g.status === 'ACTIVE').length > 0 && (
        <div className="rounded-2xl bg-surface p-4">
          <h3 className="m-0 mb-3 text-sm font-semibold text-t1">Seus grupos</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {s.grupos
              .filter((g) => g.status === 'ACTIVE')
              .slice(0, 4)
              .map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => go('grupo', { grupoId: g.id })}
                    className="w-full cursor-pointer rounded-xl border-0 bg-transparent px-2 py-2 text-left text-sm text-t2 hover:bg-elevated"
                  >
                    {g.nome}
                    <span className="block text-xs text-t4">{g.membros} membros</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      <p className="m-0 px-2 text-xs leading-relaxed text-t5">
        Musique 1.0.0 · feito para ouvir junto
      </p>
    </div>
  );
}

export function Home() {
  const { s, go, recarregar } = useApp();

  let conteudo: React.ReactNode;

  if (s.estadoFeed === 'carregando') {
    conteudo = <FeedCarregando />;
  } else if (s.estadoFeed === 'erro') {
    conteudo = (
      <div className="flex flex-col gap-6 py-6">
        <div className="mx-4 flex items-center gap-3 rounded-2xl border border-line-strong bg-surface px-4 py-3 text-sm text-t2">
          <Icon name="wifioff" size={20} />
          Não foi possível falar com o servidor.
        </div>
        <Vazio
          icone="refresh"
          titulo="Não deu para carregar o feed"
          texto={s.erroFeed || 'Verifique sua conexão e tente de novo.'}
        >
          <Button onClick={() => void recarregar({ feed: true })}>Tentar de novo</Button>
          <Button variante="neutro" onClick={() => go('grupos')}>
            Ver grupos
          </Button>
        </Vazio>
      </div>
    );
  } else if (s.estadoFeed === 'vazio') {
    conteudo = (
      <div className="flex flex-col gap-6 py-6">
        <StoriesRail stories={s.stories} />
        <Vazio
          icone="home"
          titulo="Seu feed ainda está em silêncio"
          texto="Publique algo ou siga alguém para começar a ver publicações por aqui."
        >
          <Button onClick={() => go('criar')}>Publicar a primeira</Button>
          <Button variante="neutro" onClick={() => go('grupos')}>
            Explorar comunidades
          </Button>
        </Vazio>

        {s.sugestoes.length > 0 && (
          <section className="flex flex-col gap-3">
            <TituloSecao titulo="Para começar" acao="Ver mais" onAcao={() => go('buscar')} />
            <ul className="m-0 flex list-none flex-col gap-2 px-4 p-0">
              {s.sugestoes.slice(0, 5).map((u) => (
                <PessoaLinha key={u.id} u={u} onMudou={() => void recarregar({ feed: true })} />
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  } else {
    conteudo = (
      <div className="flex flex-col gap-6 pb-6 dk:pt-6">
        <StoriesRail stories={s.stories} />

        {s.grupos.length > 0 && (
          <section className="flex flex-col gap-3">
            <TituloSecao titulo="Comunidades" acao="Ver todas" onAcao={() => go('grupos')} />
            <div className="rail w-full">
              <div className="flex w-max items-stretch gap-3 px-4">
                {s.grupos.slice(0, 8).map((g) => (
                  <ComunidadeCard key={g.id} g={g} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section aria-label="Publicações" className="flex flex-col gap-3 px-4">
          {s.feed.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </section>
      </div>
    );
  }

  return (
    <Shell direita={<ColunaDireita />}>
      <Cabecalho />
      {conteudo}
    </Shell>
  );
}
