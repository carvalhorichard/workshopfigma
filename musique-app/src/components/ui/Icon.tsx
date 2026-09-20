/** Ícones extraídos dos SVGs inline dos exports, sem lib externa. */
export type IconName =
  | 'home'
  | 'search'
  | 'plus'
  | 'chat'
  | 'user'
  | 'bell'
  | 'close'
  | 'back'
  | 'next'
  | 'down'
  | 'heart'
  | 'like'
  | 'share'
  | 'bookmark'
  | 'more'
  | 'sun'
  | 'clock'
  | 'pin'
  | 'nodes'
  | 'users'
  | 'userplus'
  | 'settings'
  | 'image'
  | 'send'
  | 'refresh'
  | 'lock'
  | 'flag'
  | 'link'
  | 'check'
  | 'logout'
  | 'camera'
  | 'eyeoff'
  | 'wifioff';

const P: Record<IconName, { d: string; fill?: boolean }> = {
  home: { d: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1Z' },
  search: { d: 'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm5 11.5 4.5 4.5' },
  plus: { d: 'M12 6v12M6 12h12' },
  chat: { d: 'M21 11.5a7.5 7.5 0 0 1-10.9 6.7L4 20l1.4-5A7.5 7.5 0 1 1 21 11.5Z' },
  user: { d: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4.5 20a7.5 7.5 0 0 1 15 0' },
  bell: {
    d: 'M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a2 2 0 0 1-3.4 0',
  },
  close: { d: 'M6 6l12 12M18 6L6 18' },
  back: { d: 'M15 6l-6 6 6 6' },
  next: { d: 'M9 6l6 6-6 6' },
  down: { d: 'M6 9l6 6 6-6' },
  heart: {
    d: 'M12 20.5s-7.5-4.6-7.5-9.7A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8c0 5.1-7.5 9.7-7.5 9.7Z',
  },
  like: { d: 'M7 21V10l4.5-7a2 2 0 0 1 2.9 2.4L13 10h5.2a2 2 0 0 1 2 2.5l-1.6 6.5a2.5 2.5 0 0 1-2.4 2H7ZM7 10H4v11h3' },
  share: { d: 'M4 16c0-6 5-8 10-8V4l6 6-6 6v-4c-4 0-8 .8-10 4Z' },
  bookmark: { d: 'M6 4h12v17l-6-4.2L6 21Z' },
  more: { d: 'M12 3.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm0 7a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm0 7a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z', fill: true },
  sun: {
    d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.6v2.2M12 19.2v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6',
  },
  clock: { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7.5V12l3 2' },
  pin: { d: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11ZM12 7.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z' },
  nodes: {
    d: 'M12 3.4a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM6.4 13.4a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm11.2 0a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
  },
  users: { d: 'M12 4.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2ZM5.5 20.2a6.5 6.5 0 0 1 13 0' },
  userplus: {
    d: 'M16 20v-1.6a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 4.1a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8ZM19 8v6M22 11h-6',
  },
  settings: {
    d: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7.4 3a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7.4 7.4 0 0 0-2-1.2L14.6 3H9.4l-.4 2.7c-.7.3-1.4.7-2 1.2l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1c.6.5 1.3.9 2 1.2l.4 2.7h5.2l.4-2.7c.7-.3 1.4-.7 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z',
  },
  image: { d: 'M4 5h16v14H4zM4 16l4.5-4.5 3 3L15 11l5 5' },
  send: { d: 'M4 12l16-7-7 16-2.2-6.8Z' },
  refresh: { d: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5' },
  lock: { d: 'M6 10h12v10H6zM9 10V7a3 3 0 0 1 6 0v3' },
  flag: { d: 'M6 21V4h11l-2 4 2 4H6' },
  link: {
    d: 'M10 13a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3M14 11a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3',
  },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  logout: { d: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h9' },
  camera: {
    d: 'M4 8h3.5L9 6h6l1.5 2H20v11H4zM12 10.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
  },
  eyeoff: { d: 'M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M6.5 6.7C4.4 8 3 10 3 12c0 0 3.5 5 9 5 1.4 0 2.7-.3 3.8-.8M17.5 17.3' },
  wifioff: { d: 'M3 3l18 18M8.8 16.2a4.5 4.5 0 0 1 6.4 0M5.6 12.9a9 9 0 0 1 4-2.3M18.4 12.9a9 9 0 0 0-2.8-1.9M2.4 9.5a14 14 0 0 1 5-3M21.6 9.5a14 14 0 0 0-8-3.4M12 20h.01' },
};

export function Icon({
  name,
  size = 22,
  className = '',
  stroke = 1.7,
  preenchido,
}: {
  name: IconName;
  size?: number;
  className?: string;
  stroke?: number;
  /** pinta o interior do traço — usado para o estado "curtido"/"salvo" */
  preenchido?: boolean;
}) {
  const p = P[name];
  const solido = p.fill || preenchido;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solido ? 'currentColor' : 'none'}
      stroke={p.fill ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={p.d} />
    </svg>
  );
}
