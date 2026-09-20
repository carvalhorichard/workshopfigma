import { useRef, useState } from 'react';
import { useApp } from '../app/store';
import { api, enviarArquivo } from '../lib/api';
import { Shell, TopBar } from '../components/layout/Shell';
import { Avatar, Button, Icon, Img } from '../components/ui';

const hashtags = (t: string) =>
  Array.from(new Set(t.match(/#[\p{L}\p{N}_]+/gu) ?? []));

/** Seletor de imagem com upload real para o bucket `media`. */
function EscolherImagem({
  url,
  onUrl,
  aspecto = '4 / 3',
}: {
  url: string | null;
  onUrl: (u: string | null) => void;
  aspecto?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErro('');
    setEnviando(true);
    try {
      onUrl(await enviarArquivo(f));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={escolher}
        className="hidden"
      />

      {url ? (
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-xl bg-elevated"
          style={{ aspectRatio: aspecto }}
        >
          <Img src={url} alt="Prévia da mídia selecionada" />
          <button
            type="button"
            onClick={() => onUrl(null)}
            aria-label="Remover mídia"
            className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-canvas/70 text-white"
          >
            <Icon name="close" size={18} stroke={1.8} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={enviando}
          onClick={() => input.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface text-t3 disabled:opacity-60"
          style={{ aspectRatio: aspecto }}
        >
          <Icon name={enviando ? 'refresh' : 'image'} size={28} />
          <span className="text-sm">{enviando ? 'Enviando…' : 'Adicionar foto'}</span>
          <span className="text-xs text-t5">JPG, PNG ou WebP até 5 MB</span>
        </button>
      )}

      {erro && <span className="text-xs text-danger">{erro}</span>}
    </div>
  );
}

export function Criar() {
  const { s, rota, back, go, toast, recarregar } = useApp();
  const [texto, setTexto] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [grupoId, setGrupoId] = useState<string | null>(rota.params?.grupoId ?? null);
  const [local, setLocal] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const tags = hashtags(texto).map((t) => t.slice(1));
  const meusGrupos = s.grupos.filter((g) => g.status === 'ACTIVE');
  const grupo = meusGrupos.find((g) => g.id === grupoId) ?? null;

  async function publicar() {
    if (!texto.trim() && !media) {
      setErro('Escreva algo ou escolha uma foto.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await api.publicar({
        texto: texto.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim(),
        mediaUrl: media,
        alt: texto.slice(0, 120) || null,
        tags,
        grupoId,
        local: local.trim() || null,
      });
      await recarregar({ feed: true, perfil: true });
      toast('Publicado');
      go('home');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para publicar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar
          titulo="Nova publicação"
          fechar
          onVoltar={back}
          acao={
            <Button tamanho="sm" onClick={publicar} disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar'}
            </Button>
          }
        />

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-4 p-4 dk:mx-auto dk:w-full dk:max-w-2xl">
          <div
            role="group"
            aria-label="Tipo de conteúdo"
            className="flex gap-1 rounded-xl bg-surface p-1"
          >
            <button
              aria-current="page"
              className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border-0 text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Publicação
            </button>
            <button
              onClick={() => go('criar-story')}
              className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-sm font-medium text-t3"
            >
              Story
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Avatar src={s.perfil?.avatar} nome={s.perfil?.nome ?? '?'} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="one-line text-sm font-semibold text-t1">
                {s.perfil?.nome}
              </span>
              <span className="text-xs text-t4">{s.perfil?.handle}</span>
            </div>
          </div>

          <label htmlFor="legenda" className="sr-only">
            Legenda da publicação
          </label>
          <textarea
            id="legenda"
            rows={4}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setErro('');
            }}
            placeholder="Conta pra gente. Use #hashtags pra virar tag."
            className="w-full min-w-0 resize-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base leading-relaxed text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
          />
          {erro && <span className="text-xs text-danger">{erro}</span>}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex h-7.5 items-center rounded-full border border-line-strong bg-surface px-3 text-xs font-medium text-brand-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <EscolherImagem url={media} onUrl={setMedia} />

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-t3">Local</span>
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Onde foi? (opcional)"
              className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-t3">Publicar em</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setGrupoId(null)}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-medium ${
                  grupoId === null ? 'text-white' : 'border-line bg-surface text-t2'
                }`}
                style={
                  grupoId === null
                    ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
                    : undefined
                }
              >
                <Icon name="home" size={14} /> Meu perfil
              </button>

              {meusGrupos.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrupoId(g.id)}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-medium ${
                    grupoId === g.id ? 'text-white' : 'border-line bg-surface text-t2'
                  }`}
                  style={
                    grupoId === g.id
                      ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
                      : undefined
                  }
                >
                  <Icon name="nodes" size={14} /> {g.nome}
                </button>
              ))}
            </div>
            {meusGrupos.length === 0 && (
              <span className="text-xs text-t5">
                Você ainda não participa de nenhum grupo — a publicação vai para o seu perfil.
              </span>
            )}
            {grupo?.privacidade === 'PRIVATE' && (
              <span className="text-xs text-t4">
                Só quem é membro de {grupo.nome} vai ver esta publicação.
              </span>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ── novo story ──────────────────────────────────────────────────────── */

export function CriarStory() {
  const { back, go, toast, recarregar } = useApp();
  const [legenda, setLegenda] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function publicar() {
    if (!media) {
      setErro('Escolha uma foto para o story.');
      return;
    }
    setEnviando(true);
    try {
      await api.publicarStory(media, legenda);
      await recarregar({ stories: true });
      toast('Story publicado — some em 24 h');
      go('home');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para publicar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar titulo="Novo story" fechar onVoltar={back} />

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-4 p-4 dk:mx-auto dk:w-full dk:max-w-lg">
          <EscolherImagem url={media} onUrl={setMedia} aspecto="9 / 16" />

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-t3">Legenda do story</span>
            <input
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Escreva algo…"
              maxLength={280}
              className="h-13 w-full rounded-xl border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
          </label>

          {erro && <span className="text-xs text-danger">{erro}</span>}

          <Button tamanho="lg" bloco onClick={publicar} disabled={enviando}>
            {enviando ? 'Publicando…' : 'Compartilhar'}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
