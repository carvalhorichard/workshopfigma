import { useState } from 'react';
import { useApp } from '../app/store';
import { Button, Campo, Icon, Img, entradaCls } from '../components/ui';
import { img } from '../data/images';

const CAPA = img('aa4851cf0928a68badd254199ce10193', 1400);

/** Moldura comum: imagem à esquerda no desktop, capa no topo no mobile. */
function Moldura({
  children,
  titulo,
  subtitulo,
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <div className="relative hidden flex-1 dk:block">
        <Img src={CAPA} alt="Gramofone dourado em uma oficina" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
        <p className="absolute bottom-10 left-10 right-10 m-0 max-w-md text-2xl font-semibold leading-snug text-t1">
          A rede das pessoas que tocam, gravam e ouvem junto.
        </p>
      </div>

      <div className="scroll-y flex w-full flex-col dk:w-[480px] dk:shrink-0 dk:border-l dk:border-elevated">
        <div className="safe-t mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4 dk:justify-center dk:p-10">
          <div className="relative h-58 w-full shrink-0 overflow-hidden rounded-[20px] bg-surface dk:hidden">
            <Img src={CAPA} alt="Gramofone dourado em uma oficina" loading="eager" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-bold tracking-tight text-t1">{titulo}</h1>
            <p className="m-0 max-w-[34ch] text-sm leading-relaxed text-t3">
              {subtitulo}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { d, go, toast } = useApp();
  const [email, setEmail] = useState('richard@email.com');
  const [senha, setSenha] = useState('musique2026');
  const [erro, setErro] = useState('');

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || senha.length < 6) {
      setErro('Confira o e-mail e a senha (mínimo 6 caracteres).');
      return;
    }
    setErro('');
    d({ t: 'entrar' });
    toast('Bem-vindo de volta ao Musique');
  }

  return (
    <Moldura
      titulo="Musique"
      subtitulo="Bem-vindo de volta. Compartilhe um pouco do seu dia."
    >
      <form onSubmit={entrar} className="flex flex-col gap-3">
        <Campo label="E-mail">
          <input
            type="email"
            autoComplete="email"
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
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className={entradaCls}
          />
        </Campo>

        <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-t2">
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5"
              style={{ accentColor: 'var(--accent)' }}
            />
            Lembrar minha senha
          </label>
          <button
            type="button"
            onClick={() => toast('Enviamos um link de recuperação para seu e-mail')}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-brand-200"
          >
            Esqueci minha senha
          </button>
        </div>

        <Button type="submit" tamanho="lg" bloco className="mt-1">
          Entrar no Musique
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

const CAMPOS = [
  { id: 'nome', label: 'Nome', type: 'text', placeholder: 'Como as pessoas te chamam', hint: '' },
  { id: 'user', label: 'Usuário', type: 'text', placeholder: '@seunome', hint: 'Seu @ é único e aparece nas publicações.' },
  { id: 'email', label: 'E-mail', type: 'email', placeholder: 'voce@email.com', hint: '' },
  { id: 'senha', label: 'Senha', type: 'password', placeholder: '••••••••', hint: 'Mínimo de 8 caracteres.' },
  { id: 'senha2', label: 'Confirmar senha', type: 'password', placeholder: '••••••••', hint: '' },
] as const;

export function Cadastro() {
  const { d, back, toast } = useApp();
  const [v, setV] = useState<Record<string, string>>({});
  const [aceito, setAceito] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  function criar(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!v.nome?.trim()) err.nome = 'Diga seu nome.';
    if (!v.user?.trim()) err.user = 'Escolha um @.';
    if (!v.email?.includes('@')) err.email = 'E-mail inválido.';
    if ((v.senha ?? '').length < 8) err.senha = 'Mínimo de 8 caracteres.';
    if (v.senha !== v.senha2) err.senha2 = 'As senhas não batem.';
    if (!aceito) err.termos = 'É preciso aceitar os termos.';
    setErros(err);
    if (Object.keys(err).length) return;

    d({ t: 'salvar-perfil', dados: { nome: v.nome, handle: `@${v.user.replace('@', '')}` } });
    d({ t: 'entrar' });
    toast('Conta criada. Escolha suas comunidades!');
  }

  return (
    <Moldura
      titulo="Criar conta"
      subtitulo="Leva menos de um minuto. Depois é só escolher suas comunidades."
    >
      <form onSubmit={criar} className="flex flex-col gap-3">
        {CAMPOS.map((f) => (
          <Campo key={f.id} label={f.label} hint={f.hint} erro={erros[f.id]}>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={v[f.id] ?? ''}
              onChange={(e) => setV({ ...v, [f.id]: e.target.value })}
              className={entradaCls}
            />
          </Campo>
        ))}

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

        <Button type="submit" tamanho="lg" bloco>
          Criar minha conta
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
