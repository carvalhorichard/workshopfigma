import { useEffect, useRef, useState } from 'react';
import { useApp } from '../app/store';
import { Shell } from '../components/layout/Shell';
import { PessoaLinha } from '../components/domain';
import { Avatar, Button, Icon, IconButton, Vazio } from '../components/ui';
import { userById, type Conversa } from '../data/db';

function LinhaConversa({ c, ativa }: { c: Conversa; ativa?: boolean }) {
  const { d, go } = useApp();
  const u = userById(c.comId);
  const naoLida = c.naoLidas > 0;

  return (
    <li>
      <button
        onClick={() => {
          d({ t: 'ler-conversa', conversaId: c.id });
          go('chat', { conversaId: c.id });
        }}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 p-2 pr-3 text-left transition-colors hover:bg-elevated ${
          ativa ? 'bg-elevated' : naoLida ? 'bg-surface' : 'bg-transparent'
        }`}
      >
        <span className="relative shrink-0">
          <Avatar src={u.avatar} size={48} />
          {u.online && (
            <span
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-canvas"
              style={{ background: 'var(--color-ok)' }}
            />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={`one-line block text-sm text-t1 ${naoLida ? 'font-semibold' : 'font-medium'}`}
          >
            {u.nome}
          </span>
          <span
            className={`one-line block text-xs ${naoLida ? 'text-t2' : 'text-t4'}`}
          >
            {c.preview}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="text-xs"
            style={{ color: naoLida ? 'var(--accent)' : '#626166' }}
          >
            {c.hora}
          </span>
          {naoLida && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              {c.naoLidas}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function Mensagens() {
  const { s, rota, go, toast } = useApp();
  const [q, setQ] = useState('');
  const conversas = s.conversas.filter((c) =>
    userById(c.comId).nome.toLowerCase().includes(q.toLowerCase()),
  );
  const ativa = rota.params?.conversaId;

  return (
    <Shell>
      <div className="flex flex-col gap-4 pb-6">
        <div className="safe-t sticky top-0 z-20 flex flex-col gap-3 bg-canvas/95 px-4 pb-1 pt-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <h1 className="m-0 min-w-0 flex-1 text-2xl font-bold tracking-tight text-t1">
              Mensagens
            </h1>
            <IconButton
              name="plus"
              label="Nova conversa"
              onClick={() => toast('Escolha alguém da lista abaixo para começar')}
            />
          </div>
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar conversa"
              aria-label="Buscar conversa"
              className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
            <span className="pointer-events-none absolute left-0 top-0 flex h-12 w-11 items-center justify-center text-t3">
              <Icon name="search" size={18} />
            </span>
          </div>
        </div>

        {conversas.length === 0 ? (
          <>
            <Vazio
              icone="chat"
              titulo="Nenhuma conversa ainda"
              texto="Combine um ensaio, troque uma cifra, mande aquele disco. Comece por alguém do seu grupo."
            >
              <Button onClick={() => go('buscar')}>Nova conversa</Button>
            </Vazio>
            <section className="flex flex-col gap-3 px-4">
              <h2 className="m-0 text-xl font-semibold text-t1">Do seu grupo</h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {['joao', 'elina', 'marina'].map(userById).map((u) => (
                  <PessoaLinha key={u.id} u={u} acao="mensagem" />
                ))}
              </ul>
            </section>
          </>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 px-2 p-0">
            {conversas.map((c) => (
              <LinhaConversa key={c.id} c={c} ativa={c.id === ativa} />
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

/* ── chat ────────────────────────────────────────────────────────────── */

export function Chat() {
  const { s, d, rota, back, go, toast } = useApp();
  const conversa =
    s.conversas.find((c) => c.id === rota.params?.conversaId) ??
    s.conversas.find((c) => c.comId === rota.params?.userId) ??
    s.conversas[0];
  const u = userById(conversa.comId);
  const [rascunho, setRascunho] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' });
  }, [conversa.mensagens.length]);

  useEffect(() => {
    if (conversa.naoLidas) d({ t: 'ler-conversa', conversaId: conversa.id });
  }, [conversa.id, conversa.naoLidas, d]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = rascunho.trim();
    if (!texto) return;
    d({ t: 'enviar', conversaId: conversa.id, texto });
    setRascunho('');
  }

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <header className="safe-t sticky top-0 z-20 flex items-center gap-3 border-b border-elevated bg-canvas/95 px-4 py-2.5 backdrop-blur">
          <button
            onClick={back}
            aria-label="Voltar"
            className="-ml-3 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-t2"
          >
            <Icon name="back" size={22} stroke={1.8} />
          </button>
          <button
            onClick={() => go('perfil', { userId: u.id })}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
          >
            <Avatar src={u.avatar} size={40} />
            <span className="min-w-0">
              <span className="one-line block text-sm font-semibold text-t1">
                {u.nome}
              </span>
              <span className="block text-xs" style={{ color: u.online ? 'var(--color-ok)' : '#858487' }}>
                {u.online ? 'online' : 'visto por último há 2 h'}
              </span>
            </span>
          </button>
          <IconButton
            name="more"
            label="Opções da conversa"
            size={20}
            onClick={() => toast('Opções da conversa entram na próxima etapa')}
          />
        </header>

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-2 p-4 dk:mx-auto dk:w-full dk:max-w-3xl">
          <div className="mx-auto rounded-full bg-surface px-3 py-1 text-xs text-t4">
            Hoje
          </div>
          {conversa.mensagens.length === 0 && (
            <Vazio
              icone="chat"
              titulo={`Diga oi para ${u.nome}`}
              texto="Ainda não há mensagens nesta conversa."
            />
          )}
          {conversa.mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.minha ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words"
                style={{
                  background: m.minha ? 'var(--accent)' : 'var(--color-surface)',
                  color: m.minha ? '#fff' : 'var(--color-t2)',
                  borderBottomRightRadius: m.minha ? 4 : 16,
                  borderBottomLeftRadius: m.minha ? 16 : 4,
                }}
              >
                {m.texto}
                <span
                  className="mt-1 block text-right text-[11px]"
                  style={{ color: m.minha ? 'rgba(255,255,255,.72)' : '#858487' }}
                >
                  {m.hora}
                </span>
              </div>
            </div>
          ))}
          <div ref={fim} />
        </div>

        <form
          onSubmit={enviar}
          className="safe-b flex shrink-0 items-center gap-2 border-t border-elevated bg-canvas px-4 py-3 dk:mx-auto dk:w-full dk:max-w-3xl"
        >
          <input
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            placeholder="Escreva uma mensagem"
            aria-label="Escreva uma mensagem"
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
          />
          <button
            type="submit"
            disabled={!rascunho.trim()}
            aria-label="Enviar"
            className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </Shell>
  );
}
