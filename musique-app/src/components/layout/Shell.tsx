/**
 * Casca do app: rail lateral no desktop (≥800px) e barra inferior no mobile,
 * exatamente como as duas famílias de export. O conteúdo é full-bleed e ocupa
 * a altura real do device (dvh), não a altura fixa do artboard.
 */
import type { ReactNode } from 'react';
import { useApp, type ViewName } from '../../app/store';
import { Avatar, Icon, type IconName } from '../ui';

const ITENS: { label: string; view: ViewName; icone: IconName }[] = [
  { label: 'Início', view: 'home', icone: 'home' },
  { label: 'Buscar', view: 'buscar', icone: 'search' },
  { label: 'Mensagens', view: 'mensagens', icone: 'chat' },
  { label: 'Criar', view: 'criar', icone: 'plus' },
  { label: 'Grupos', view: 'grupos', icone: 'nodes' },
  { label: 'Perfil', view: 'perfil', icone: 'user' },
];

function useNaoLidas() {
  const { s } = useApp();
  return s.conversas.reduce((n, c) => n + (c.naoLidas > 0 ? 1 : 0), 0);
}

/* ── rail do desktop ─────────────────────────────────────────────────── */

function RailDesktop() {
  const { s, rota, go, abrir } = useApp();
  const naoLidas = useNaoLidas();

  return (
    <nav
      aria-label="Navegação principal"
      className="hidden w-60 shrink-0 flex-col gap-1 border-r border-elevated bg-canvas p-4 dk:flex xl:w-68"
    >
      <span className="mb-4 px-3 text-2xl font-bold tracking-tight text-t1">
        Musique
      </span>

      {ITENS.map((i) => {
        const on = rota.view === i.view;
        const badge = i.view === 'mensagens' && naoLidas ? String(naoLidas) : '';
        return (
          <button
            key={i.view}
            onClick={() => go(i.view)}
            aria-current={on ? 'page' : undefined}
            className={`flex h-12 cursor-pointer items-center gap-3 rounded-2xl border-0 px-3 text-left text-[15px] transition-colors ${
              on ? 'font-semibold text-white' : 'font-medium text-t3 hover:bg-elevated'
            }`}
            style={{ background: on ? 'var(--accent)' : 'transparent' }}
          >
            <Icon name={i.icone} size={22} />
            <span className="min-w-0 flex-1">{i.label}</span>
            {badge && (
              <span
                aria-label={`${badge} conversas não lidas`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                style={{
                  background: on ? '#fff' : 'var(--accent)',
                  color: on ? 'var(--accent)' : '#fff',
                }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={() => go('notificacoes')}
        className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-t3 transition-colors hover:bg-elevated"
      >
        <Icon name="bell" size={22} />
        Notificações
        {s.notificacoes.some((n) => !n.lida) && (
          <span
            className="ml-auto h-2 w-2 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        )}
      </button>

      <button
        onClick={() => go('config')}
        className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-t3 transition-colors hover:bg-elevated"
      >
        <Icon name="settings" size={22} />
        Configurações
      </button>

      <button
        onClick={() => abrir('sair')}
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 text-left transition-colors hover:bg-elevated"
      >
        <Avatar src={s.perfil.avatar} size={36} />
        <span className="min-w-0 flex-1">
          <span className="one-line block text-sm font-semibold text-t1">
            {s.perfil.nome}
          </span>
          <span className="one-line block text-xs text-t4">{s.perfil.handle}</span>
        </span>
        <Icon name="logout" size={18} />
      </button>
    </nav>
  );
}

/* ── barra inferior do mobile ────────────────────────────────────────── */

function BarraMobile() {
  const { rota, go } = useApp();
  const naoLidas = useNaoLidas();
  const itens: { label: string; view: ViewName; icone: IconName }[] = [
    { label: 'Início', view: 'home', icone: 'home' },
    { label: 'Buscar', view: 'buscar', icone: 'search' },
    { label: 'Criar publicação', view: 'criar', icone: 'plus' },
    { label: 'Mensagens', view: 'mensagens', icone: 'chat' },
    { label: 'Perfil', view: 'perfil', icone: 'user' },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="safe-b sticky bottom-0 z-30 flex shrink-0 items-center justify-between gap-1 border-t border-elevated bg-canvas px-4 pb-5 pt-2 dk:hidden"
    >
      {itens.map((i) => {
        const on = rota.view === i.view;
        const destaque = i.view === 'criar';
        if (destaque)
          return (
            <button
              key={i.view}
              onClick={() => go('criar')}
              aria-label={i.label}
              className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-elevated text-t1"
            >
              <Icon name="plus" size={24} stroke={1.8} />
            </button>
          );
        return (
          <button
            key={i.view}
            onClick={() => go(i.view)}
            aria-label={i.label}
            aria-current={on ? 'page' : undefined}
            className={`relative flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-0 ${
              on ? 'w-14 text-white' : 'w-11 bg-transparent text-t3'
            }`}
            style={{ background: on ? 'var(--accent)' : 'transparent' }}
          >
            <Icon name={i.icone} size={22} stroke={1.8} />
            {i.view === 'mensagens' && naoLidas > 0 && (
              <span
                aria-hidden
                className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-canvas px-1.5 text-xs font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                {naoLidas}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ── casca ───────────────────────────────────────────────────────────── */

export function Shell({
  children,
  semNav,
  direita,
}: {
  children: ReactNode;
  /** telas modais em tela cheia (criar, chat, story) escondem a navegação */
  semNav?: boolean;
  /** coluna auxiliar mostrada só no desktop largo */
  direita?: ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      {!semNav && <RailDesktop />}

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="scroll-y min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-5xl gap-6 px-0 dk:px-6 xl:max-w-7xl">
            <div className="min-w-0 flex-1">{children}</div>
            {direita && (
              <aside className="hidden w-80 shrink-0 py-6 xl:block">{direita}</aside>
            )}
          </div>
        </main>
        {!semNav && <BarraMobile />}
      </div>
    </div>
  );
}

/** Cabeçalho de tela empilhada (voltar + título + ação). */
export function TopBar({
  titulo,
  acao,
  onVoltar,
  fechar,
}: {
  titulo: string;
  acao?: ReactNode;
  onVoltar?: () => void;
  fechar?: boolean;
}) {
  const { back } = useApp();
  return (
    <header className="safe-t sticky top-0 z-20 flex items-center gap-3 border-b border-elevated bg-canvas/95 px-4 py-3 backdrop-blur">
      <button
        onClick={onVoltar ?? back}
        aria-label={fechar ? 'Fechar' : 'Voltar'}
        className="-ml-3 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t2 transition-colors hover:bg-elevated"
      >
        <Icon name={fechar ? 'close' : 'back'} size={22} stroke={1.8} />
      </button>
      <h1 className="m-0 min-w-0 flex-1 truncate text-base font-semibold text-t1">
        {titulo}
      </h1>
      {acao}
    </header>
  );
}
