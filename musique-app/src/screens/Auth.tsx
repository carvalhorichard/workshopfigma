import { useState } from 'react';
import { useApp } from '../app/store';
import { auth } from '../lib/api';
import { Button, Campo, Icon, Img, entradaCls } from '../components/ui';
import { FOTO_CADASTRO, FOTO_LOGIN, fotoUrl, type Foto } from '../data/fotos';

/** Crédito do fotógrafo — exigido pelas diretrizes da Unsplash. */
function Credito({ foto, className = '' }: { foto: Foto; className?: string }) {
  return (
    <span className={`text-[11px] leading-none text-white/55 ${className}`}>
      Foto de{' '}
      <a
        href={foto.autorUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="text-white/75 underline decoration-white/25 underline-offset-2"
      >
        {foto.autor}
      </a>{' '}
      na{' '}
      <a
        href="https://unsplash.com"
        target="_blank"
        rel="noreferrer noopener"
        className="text-white/75 underline decoration-white/25 underline-offset-2"
      >
        Unsplash
      </a>
    </span>
  );
}

/**
 * Moldura comum: no desktop a foto ocupa a coluna da esquerda; no mobile vira
 * uma faixa no topo, com altura menor no cadastro — lá o formulário é longo.
 */
function Moldura({
  children,
  titulo,
  subtitulo,
  foto,
  alturaMobile = 'h-52',
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo: string;
  foto: Foto;
  alturaMobile?: string;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      {/* desktop: foto em tela cheia na esquerda */}
      <div className="relative hidden flex-1 overflow-hidden dk:flex dk:items-end">
        <div className="absolute inset-0">
          <Img src={fotoUrl(foto, 1400)} alt={foto.alt} loading="eager" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(25,24,27,.94) 0%, rgba(25,24,27,.45) 45%, rgba(25,24,27,.15) 100%),' +
              'radial-gradient(120% 90% at 15% 0%, var(--accent-soft) 0%, transparent 60%)',
          }}
        />
        <div className="relative w-full p-10 pb-14">
          <span className="text-3xl font-bold tracking-tight text-t1">Musique</span>
          <p className="m-0 mt-3 max-w-lg text-2xl font-medium leading-snug text-t2">
            A rede das pessoas que tocam, gravam e ouvem junto.
          </p>
        </div>
        <Credito foto={foto} className="absolute bottom-4 right-6" />
      </div>

      {/* coluna do formulário */}
      <div className="scroll-y flex w-full flex-col dk:w-[480px] dk:shrink-0 dk:border-l dk:border-elevated">
        {/* mobile: faixa no topo */}
        <div
          className={`safe-t relative w-full shrink-0 overflow-hidden px-4 pt-4 dk:hidden`}
        >
          <div className={`relative ${alturaMobile} w-full overflow-hidden rounded-[20px] bg-surface`}>
            <Img src={fotoUrl(foto, 800)} alt={foto.alt} loading="eager" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(25,24,27,.85) 0%, rgba(25,24,27,.1) 60%)',
              }}
            />
            <Credito foto={foto} className="absolute bottom-2.5 right-3" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6 dk:p-10">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-bold tracking-tight text-t1">{titulo}</h1>
            <p className="m-0 max-w-[34ch] text-sm leading-relaxed text-t3">{subtitulo}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { go, toast } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setOcupado(true);
    try {
      await auth.entrar(email.trim(), senha);
      // o onAuthStateChange do store leva para a Home
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setOcupado(false);
    }
  }

  async function recuperar() {
    if (!email.trim()) {
      setErro('Escreva seu e-mail para receber o link de recuperação.');
      return;
    }
    try {
      await auth.recuperar(email.trim());
      toast('Link de recuperação enviado para seu e-mail');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para enviar o link.');
    }
  }

  return (
    <Moldura
      titulo="Musique"
      subtitulo="Bem-vindo de volta. Compartilhe um pouco do seu dia."
      foto={FOTO_LOGIN}
    >
      <form onSubmit={entrar} className="flex flex-col gap-3">
        <Campo label="E-mail">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className={entradaCls}
          />
        </Campo>
        <Campo label="Senha" erro={erro}>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className={entradaCls}
          />
        </Campo>

        <div className="flex min-h-11 items-center justify-end">
          <button
            type="button"
            onClick={recuperar}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
          >
            Esqueci minha senha
          </button>
        </div>

        <Button type="submit" tamanho="lg" bloco disabled={ocupado}>
          {ocupado ? 'Entrando…' : 'Entrar no Musique'}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <span className="text-sm text-t4">Ainda não tem conta?</span>
        <button
          onClick={() => go('cadastro')}
          className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
        >
          Criar conta
        </button>
      </div>

      <p className="m-0 mx-auto max-w-[36ch] text-center text-xs leading-relaxed text-t5">
        Ao continuar você concorda com os Termos de uso e a Política de privacidade.
      </p>
    </Moldura>
  );
}

export function Cadastro() {
  const { back, toast } = useApp();
  const [v, setV] = useState({ nome: '', user: '', email: '', senha: '', senha2: '' });
  const [aceito, setAceito] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);

  const campo = (k: keyof typeof v) => ({
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setV({ ...v, [k]: e.target.value }),
  });

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.nome.trim()) err.nome = 'Diga seu nome.';
    if (!/^[a-z0-9._]{3,30}$/.test(v.user.trim().toLowerCase()))
      err.user = 'Use 3 a 30 caracteres: letras minúsculas, números, ponto ou _.';
    if (!v.email.includes('@')) err.email = 'E-mail inválido.';
    if (v.senha.length < 6) err.senha = 'Mínimo de 6 caracteres.';
    if (v.senha !== v.senha2) err.senha2 = 'As senhas não batem.';
    if (!aceito) err.termos = 'É preciso aceitar os termos.';
    setErros(err);
    if (Object.keys(err).length) return;

    setOcupado(true);
    try {
      const { precisaConfirmar } = await auth.cadastrar(
        v.email.trim(),
        v.senha,
        v.nome.trim(),
        v.user.trim().toLowerCase(),
      );
      if (precisaConfirmar) {
        toast('Conta criada! Confirme o e-mail para entrar.');
        back();
      }
      // com confirmação desligada, o store já leva para a Home
    } catch (err) {
      setErros({ email: err instanceof Error ? err.message : 'Não deu para criar a conta.' });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Moldura
      titulo="Criar conta"
      subtitulo="Leva menos de um minuto. Depois é só escolher suas comunidades."
      foto={FOTO_CADASTRO}
      alturaMobile="h-36"
    >
      <form onSubmit={criar} className="flex flex-col gap-3">
        <Campo label="Nome" erro={erros.nome}>
          <input {...campo('nome')} placeholder="Como as pessoas te chamam" className={entradaCls} />
        </Campo>

        <Campo
          label="Usuário"
          hint="Seu @ é único e aparece nas publicações."
          erro={erros.user}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-0 flex h-13 items-center text-base text-t4">
              @
            </span>
            <input
              value={v.user}
              onChange={(e) =>
                setV({ ...v, user: e.target.value.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase() })
              }
              placeholder="seunome"
              className={`${entradaCls} pl-9`}
            />
          </div>
        </Campo>

        <Campo label="E-mail" erro={erros.email}>
          <input {...campo('email')} type="email" placeholder="voce@email.com" className={entradaCls} />
        </Campo>

        <Campo label="Senha" hint="Mínimo de 6 caracteres." erro={erros.senha}>
          <input {...campo('senha')} type="password" placeholder="••••••••" className={entradaCls} />
        </Campo>

        <Campo label="Confirmar senha" erro={erros.senha2}>
          <input {...campo('senha2')} type="password" placeholder="••••••••" className={entradaCls} />
        </Campo>

        <label className="flex items-start gap-3 py-1 text-sm leading-relaxed text-t2">
          <input
            type="checkbox"
            checked={aceito}
            onChange={(e) => setAceito(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span>
            Li e aceito os <span className="text-brand-200">Termos de uso</span> e a{' '}
            <span className="text-brand-200">Política de privacidade</span>.
          </span>
        </label>
        {erros.termos && <span className="text-xs text-danger">{erros.termos}</span>}

        <Button type="submit" tamanho="lg" bloco disabled={ocupado}>
          {ocupado ? 'Criando…' : 'Criar minha conta'}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <span className="text-sm text-t4">Já tem conta?</span>
        <button
          onClick={back}
          className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
        >
          <Icon name="back" size={14} />
          Entrar
        </button>
      </div>
    </Moldura>
  );
}
