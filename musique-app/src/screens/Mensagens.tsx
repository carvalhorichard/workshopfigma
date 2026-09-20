import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../app/store';
import { api } from '../lib/api';
import { Shell } from '../components/layout/Shell';
import { PessoaLinha } from '../components/domain';
import { Avatar, Button, Icon, IconButton, Skeleton, Vazio } from '../components/ui';
import type { Conversa, Mensagem } from '../data/types';

function LinhaConversa({ c, onAbrir }: { c: Conversa; onAbrir: () => void }) {
  const naoLida = c.naoLidas > 0;
  return (
    <li>
      <button
        onClick={onAbrir}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 p-2 pr-3 text-left transition-colors hover:bg-elevated ${
          naoLida ? 'bg-surface' : 'bg-transparent'
        }`}
      >
        <Avatar src={c.com?.avatar} nome={c.com?.nome ?? '?'} size={48} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={`one-line block text-sm text-t1 ${naoLida ? 'font-semibold' : 'font-medium'}`}
          >
            {c.com?.nome ?? 'Conversa'}
          </span>
          <span className={`one-line block text-xs ${naoLida ? 'text-t2' : 'text-t4'}`}>
            {c.preview}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs" style={{ color: naoLida ? 'var(--accent)' : '#626166' }}>
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
  const { s, go, recarregar } = useApp();
  const [q, setQ] = useState('');

  const conversas = s.conversas.filter((c) =>
    (c.com?.nome ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Shell>
      <div className="flex flex-col gap-4 pb-6">
        <div className="safe-t sticky top-0 z-20 flex flex-col gap-3 bg-canvas/95 px-4 pb-1 pt-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <h1 className="m-0 min-w-0 flex-1 text-2xl font-bold tracking-tight text-t1">
              Mensagens
            </h1>
            <IconButton name="search" label="Buscar pessoas" onClick={() => go('buscar')} />
          </div>
          {s.conversas.length > 0 && (
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
          )}
        </div>

        {s.conversas.length === 0 ? (
          <>
            <Vazio
              icone="chat"
              titulo="Nenhuma conversa ainda"
              texto="Combine um ensaio, troque uma cifra, mande aquele disco. Comece por alguém que você segue."
            >
              <Button onClick={() => go('buscar')}>Encontrar pessoas</Button>
            </Vazio>
            {s.sugestoes.length > 0 && (
              <section className="flex flex-col gap-3 px-4">
                <h2 className="m-0 text-xl font-semibold text-t1">Pessoas no Musique</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {s.sugestoes.slice(0, 5).map((u) => (
                    <PessoaLinha key={u.id} u={u} acao="mensagem" />
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 px-2 p-0">
            {conversas.map((c) => (
              <LinhaConversa
                key={c.id}
                c={c}
                onAbrir={() => {
                  void api.lerConversa(c.id).then(() => recarregar({ conversas: true }));
                  go('chat', { conversaId: c.id });
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

/* ── chat ────────────────────────────────────────────────────────────── */

export function Chat() {
  const { s, rota, back, go, recarregar } = useApp();
  const id = rota.params?.conversaId ?? '';
  const conversa = s.conversas.find((c) => c.id === id);
  const [msgs, setMsgs] = useState<Mensagem[] | null>(null);
  const [rascunho, setRascunho] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  const carregar = useCallback(() => {
    if (!id) return;
    api.mensagens(id).then(setMsgs).catch(() => setMsgs([]));
  }, [id]);

  useEffect(carregar, [carregar]);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' });
  }, [msgs?.length]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = rascunho.trim();
    if (!texto || enviando) return;
    setEnviando(true);
    setRascunho('');
    try {
      await api.enviarMensagem(id, texto);
      carregar();
      void recarregar({ conversas: true });
    } catch {
      setRascunho(texto);
    } finally {
      setEnviando(false);
    }
  }

  const u = conversa?.com;

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
            onClick={() => u && go('perfil', { handle: u.handle })}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
          >
            <Avatar src={u?.avatar} nome={u?.nome ?? '?'} size={40} />
            <span className="min-w-0">
              <span className="one-line block text-sm font-semibold text-t1">
                {u?.nome ?? 'Conversa'}
              </span>
              <span className="block text-xs text-t4">{u?.handle}</span>
            </span>
          </button>
        </header>

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-2 p-4 dk:mx-auto dk:w-full dk:max-w-3xl">
          {msgs === null ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={`h-12 w-48 ${i % 2 ? 'self-end' : ''}`} />
              ))}
            </div>
          ) : msgs.length === 0 ? (
            <Vazio
              icone="chat"
              titulo={`Diga oi para ${u?.nome ?? 'essa pessoa'}`}
              texto="Ainda não há mensagens nesta conversa."
            />
          ) : (
            msgs.map((m) => (
              <div key={m.id} className={`flex ${m.minha ? 'justify-end' : 'justify-start'}`}>
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
            ))
          )}
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
            disabled={!rascunho.trim() || enviando}
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
