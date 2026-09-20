import { useState } from 'react';
import { useApp } from '../app/store';
import { Shell, TopBar } from '../components/layout/Shell';
import { Avatar, Button, Icon, Img, type IconName } from '../components/ui';
import { img } from '../data/images';

const PREVIA = img('aa4851cf0928a68badd254199ce10193', 1200);

const hashtags = (t: string) =>
  Array.from(new Set(t.match(/#[\p{L}\p{N}_]+/gu) ?? []));

export function Criar() {
  const { s, d, rota, back, go, toast } = useApp();
  const [texto, setTexto] = useState(
    'Achei esse gramofone num sebo hoje. Ainda toca. #vinil #achado',
  );
  const [grupo, setGrupo] = useState(rota.params?.grupo ?? 'Vinis & Discos');
  const [local, setLocal] = useState('São Paulo, SP');
  const [publico, setPublico] = useState('Seguidores');
  const [comMidia, setComMidia] = useState(true);
  const [erro, setErro] = useState('');

  const tags = hashtags(texto);

  function publicar() {
    if (!texto.trim()) {
      setErro('Escreva alguma coisa antes de publicar.');
      return;
    }
    d({ t: 'publicar', texto: texto.replace(/#[\p{L}\p{N}_]+/gu, '').trim(), tags, grupo });
    toast('Publicado no seu feed');
    go('home');
  }

  const opcoes: { label: string; valor: string; icone: IconName; onClick: () => void; destaque?: boolean }[] = [
    {
      label: 'Marcar pessoas',
      valor: '',
      icone: 'userplus',
      onClick: () => toast('Marcação de pessoas entra na próxima etapa'),
    },
    {
      label: 'Local',
      valor: local,
      icone: 'pin',
      onClick: () =>
        setLocal(local === 'São Paulo, SP' ? 'Curitiba, PR' : 'São Paulo, SP'),
    },
    {
      label: 'Grupo',
      valor: grupo,
      icone: 'nodes',
      destaque: true,
      onClick: () => {
        const nomes = s.grupos.map((g) => g.nome);
        setGrupo(nomes[(nomes.indexOf(grupo) + 1) % nomes.length]);
      },
    },
  ];

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar
          titulo="Nova publicação"
          fechar
          onVoltar={back}
          acao={
            <Button tamanho="sm" onClick={publicar} disabled={!texto.trim()}>
              Publicar
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
            <Avatar src={s.perfil.avatar} size={44} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="one-line text-sm font-semibold text-t1">
                {s.perfil.nome}
              </span>
              <button
                onClick={() =>
                  setPublico(
                    publico === 'Seguidores'
                      ? 'Todos'
                      : publico === 'Todos'
                        ? 'Amigos próximos'
                        : 'Seguidores',
                  )
                }
                className="inline-flex h-7 cursor-pointer items-center gap-1 self-start rounded-full border border-line-strong bg-surface px-2 text-xs font-medium text-t2"
              >
                <Icon name="users" size={14} />
                {publico}
                <Icon name="down" size={14} />
              </button>
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
                  className="inline-flex h-7.5 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-xs font-medium text-brand-200"
                >
                  {t}
                  <button
                    aria-label={`Remover ${t}`}
                    onClick={() => setTexto(texto.replace(t, '').replace(/\s+/g, ' ').trim())}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-t4"
                  >
                    <Icon name="close" size={12} stroke={2.4} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {comMidia ? (
            <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl bg-elevated">
              <Img src={PREVIA} alt="Prévia da mídia selecionada: gramofone dourado" />
              <button
                onClick={() => setComMidia(false)}
                aria-label="Remover mídia"
                className="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-canvas/70 text-white"
              >
                <Icon name="close" size={18} stroke={1.8} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setComMidia(true)}
              className="flex aspect-4/3 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface text-t3"
            >
              <Icon name="image" size={28} />
              <span className="text-sm">Adicionar foto</span>
            </button>
          )}

          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {opcoes.map((o) => (
              <li key={o.label}>
                <button
                  onClick={o.onClick}
                  className="flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left transition-colors hover:bg-surface"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-t3">
                    <Icon name={o.icone} size={20} />
                  </span>
                  <span className="one-line min-w-0 flex-1 text-sm text-t2">
                    {o.label}
                  </span>
                  <span
                    className="one-line max-w-[45%] min-w-0 text-right text-sm"
                    style={{ color: o.destaque ? 'var(--color-brand-200)' : '#858487' }}
                  >
                    {o.valor}
                  </span>
                  <Icon name="next" size={18} className="shrink-0 text-t4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}

/* ── novo story ──────────────────────────────────────────────────────── */

export function CriarStory() {
  const { d, back, go, toast } = useApp();
  const [legenda, setLegenda] = useState('');
  const [quem, setQuem] = useState('Todos');

  return (
    <Shell semNav>
      <div className="flex h-dvh flex-col">
        <TopBar titulo="Novo story" fechar onVoltar={back} />

        <div className="scroll-y flex min-h-0 flex-1 flex-col gap-4 p-4 dk:mx-auto dk:w-full dk:max-w-lg">
          <div className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-elevated" style={{ aspectRatio: '9 / 16', maxHeight: '52vh' }}>
            <Img src={PREVIA} alt="Prévia do story" />
            {legenda && (
              <p className="absolute inset-x-4 bottom-4 m-0 rounded-xl bg-canvas/70 p-3 text-sm leading-relaxed text-t1 backdrop-blur">
                {legenda}
              </p>
            )}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-t3">Legenda do story</span>
            <input
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Escreva algo…"
              className="h-13 w-full rounded-xl border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-t3">Quem pode ver este story</span>
            <div className="flex gap-1 rounded-xl bg-surface p-1">
              {['Todos', 'Seguidores', 'Amigos próximos'].map((o) => (
                <button
                  key={o}
                  onClick={() => setQuem(o)}
                  className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border-0 px-2 text-xs font-semibold ${
                    quem === o ? 'text-white' : 'bg-transparent text-t3'
                  }`}
                  style={{ background: quem === o ? 'var(--accent)' : undefined }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <Button
            tamanho="lg"
            bloco
            onClick={() => {
              d({ t: 'publicar-story', legenda });
              toast(`Story publicado para: ${quem}`);
              go('home');
            }}
          >
            Compartilhar
          </Button>
        </div>
      </div>
    </Shell>
  );
}
