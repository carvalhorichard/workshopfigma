/** Primitivas de UI compartilhadas por todas as telas. */
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { FALLBACK, avatarPadrao } from '../../data/images';
import { useApp } from '../../app/store';
import { Icon, type IconName } from './Icon';

export { Icon };
export type { IconName };

/* ── imagem à prova de link quebrado ─────────────────────────────────── */

export function Img({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      loading={loading}
      className={`h-full w-full object-cover ${className}`}
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src !== FALLBACK) el.src = FALLBACK;
      }}
    />
  );
}

export function Avatar({
  src,
  alt = '',
  nome = '?',
  size = 40,
  ring,
  className = '',
}: {
  src: string | null | undefined;
  alt?: string;
  /** usado para desenhar a inicial quando ainda não há foto */
  nome?: string;
  size?: number;
  ring?: string;
  className?: string;
}) {
  return (
    <span
      className={`block shrink-0 overflow-hidden rounded-full bg-elevated ${className}`}
      style={{
        width: size,
        height: size,
        border: ring ? `2px solid ${ring}` : undefined,
      }}
    >
      <Img src={src || avatarPadrao(nome)} alt={alt} />
    </span>
  );
}

/** Pilha de avatares sobrepostos, como nos cards de grupo. */
export function AvatarStack({
  urls,
  size = 26,
  borda = 'var(--color-surface)',
}: {
  urls: (string | null)[];
  size?: number;
  borda?: string;
}) {
  return (
    <span className="flex items-center">
      {urls.map((u, i) => (
        <span
          key={`${u}-${i}`}
          className="block overflow-hidden rounded-full bg-elevated"
          style={{
            width: size,
            height: size,
            border: `2px solid ${borda}`,
            marginLeft: i === 0 ? 0 : -10,
          }}
        >
          <Img src={u} />
        </span>
      ))}
    </span>
  );
}

/* ── botões ──────────────────────────────────────────────────────────── */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'neutro' | 'fantasma' | 'perigo';
  tamanho?: 'sm' | 'md' | 'lg';
  bloco?: boolean;
};

export function Button({
  variante = 'primario',
  tamanho = 'md',
  bloco,
  className = '',
  children,
  ...rest
}: BtnProps) {
  const alturas = { sm: 'h-10 px-4 text-xs', md: 'h-11 px-4 text-sm', lg: 'h-13 px-5 text-base' };
  const estilos: Record<string, string> = {
    primario: 'text-on-brand border-transparent',
    neutro: 'bg-transparent border-line-strong text-t2 hover:bg-elevated',
    fantasma: 'bg-transparent border-transparent text-t2 hover:bg-elevated',
    perigo: 'bg-transparent border-line-strong text-danger hover:bg-elevated',
  };
  return (
    <button
      {...rest}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${alturas[tamanho]} ${estilos[variante]} ${bloco ? 'w-full' : ''} ${className}`}
      style={
        variante === 'primario'
          ? { background: 'var(--accent)', ...rest.style }
          : rest.style
      }
    >
      {children}
    </button>
  );
}

export function IconButton({
  name,
  label,
  size = 22,
  ativo,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  name: IconName;
  label: string;
  size?: number;
  ativo?: boolean;
}) {
  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-colors hover:bg-elevated ${className}`}
      style={{ color: ativo ? 'var(--accent)' : undefined, ...rest.style }}
    >
      <Icon name={name} size={size} />
    </button>
  );
}

/* ── chips e tags ────────────────────────────────────────────────────── */

export function Chip({
  children,
  ativo,
  onClick,
  icone,
}: {
  children: ReactNode;
  ativo?: boolean;
  onClick?: () => void;
  icone?: IconName;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors ${
        ativo ? 'text-white' : 'border-line bg-surface text-t2 hover:bg-elevated'
      }`}
      style={
        ativo
          ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
          : undefined
      }
    >
      {icone && <Icon name={icone} size={14} />}
      {children}
    </button>
  );
}

export function Tag({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7.5 cursor-pointer items-center rounded-full border border-line-strong bg-transparent px-3.5 text-xs font-medium text-brand-200 transition-colors hover:bg-elevated"
    >
      {children}
    </button>
  );
}

/* ── formulário ──────────────────────────────────────────────────────── */

export function Campo({
  label,
  hint,
  children,
  erro,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  erro?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-t3">{label}</span>
      {children}
      {erro ? (
        <span className="text-xs text-danger">{erro}</span>
      ) : hint ? (
        <span className="text-xs text-t4">{hint}</span>
      ) : null}
    </label>
  );
}

export const entradaCls =
  'h-13 w-full min-w-0 rounded-xl border border-line bg-surface px-4 text-base text-t1 placeholder:text-t4 outline-none focus-visible:border-brand-300';

/* ── abas ────────────────────────────────────────────────────────────── */

export function Tabs({
  itens,
  atual,
  onChange,
}: {
  itens: string[];
  atual: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rail border-b border-elevated" role="tablist">
      <div className="flex w-max min-w-full">
        {itens.map((t) => {
          const on = t === atual;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t)}
              className={`h-12 flex-1 cursor-pointer border-0 border-b-2 bg-transparent px-5 text-sm transition-colors ${
                on ? 'font-semibold text-t1' : 'font-medium text-t4 hover:text-t2'
              }`}
              style={{ borderBottomColor: on ? 'var(--accent)' : 'transparent' }}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── estados vazios ──────────────────────────────────────────────────── */

export function Vazio({
  icone,
  titulo,
  texto,
  children,
}: {
  icone: IconName;
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface text-t3">
        <Icon name={icone} size={28} />
      </span>
      <h2 className="m-0 text-xl font-semibold text-t1">{titulo}</h2>
      <p className="m-0 max-w-[42ch] text-sm leading-relaxed text-t3">{texto}</p>
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

/* ── sheet / modal ───────────────────────────────────────────────────── */

/**
 * Bottom sheet no mobile, diálogo centralizado no desktop. Fecha no backdrop,
 * no Escape (tratado no store) e devolve o foco ao fechar.
 */
export function Sheet({
  titulo,
  children,
  onClose,
  rodape,
  alturaMax = '86vh',
}: {
  titulo: string;
  children: ReactNode;
  onClose: () => void;
  rodape?: ReactNode;
  alturaMax?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    caixa.current?.focus();
  }, []);

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-black/64 dk:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={caixa}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="anim-sheet-up safe-b flex w-full flex-col rounded-t-3xl border-t border-line bg-canvas outline-none dk:anim-pop dk:max-w-lg dk:rounded-3xl dk:border"
        style={{ maxHeight: alturaMax }}
      >
        <div className="flex items-center gap-3 border-b border-elevated px-4 py-3">
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line-strong dk:hidden"
          />
          <h2 className="m-0 min-w-0 flex-1 text-base font-semibold text-t1">{titulo}</h2>
          <IconButton name="close" label="Fechar" size={20} onClick={onClose} />
        </div>
        <div className="scroll-y min-h-0 flex-1">{children}</div>
        {rodape && <div className="border-t border-elevated p-4">{rodape}</div>}
      </div>
    </div>
  );
}

/* ── toasts ──────────────────────────────────────────────────────────── */

export function Toasts() {
  const { s } = useApp();
  if (!s.toasts.length) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-4 dk:bottom-8"
    >
      {s.toasts.map((t) => (
        <div
          key={t.id}
          className="anim-pop max-w-sm rounded-xl border border-line-strong bg-elevated px-4 py-3 text-sm text-t1 shadow-lg shadow-black/40"
        >
          {t.texto}
        </div>
      ))}
    </div>
  );
}
