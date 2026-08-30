type LogoProps = { size?: number; className?: string };

export function Logo({ size = 96, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Restaurante Tabajara's Churrascaria" className={className}>
      <defs>
        <linearGradient id="tb-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb20f" />
          <stop offset="48%" stopColor="#f26a21" />
          <stop offset="100%" stopColor="#21a9d8" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#111111" />
      <path d="M8 39a45 45 0 0 1 39-35" fill="none" stroke="#ffb20f" strokeWidth="4" strokeLinecap="round" />
      <path d="M19 82a45 45 0 0 1-13-30" fill="none" stroke="#ef5b2a" strokeWidth="4" strokeLinecap="round" />
      <path d="M79 82a45 45 0 0 0 13-30" fill="none" stroke="#27a7d8" strokeWidth="4" strokeLinecap="round" />
      <path d="M37 23h24" stroke="#f6ca55" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 54h14v19H20z" fill="#f8f8f8" />
      <path d="M31 54c0-8 5-12 11-12 5 0 9 4 9 9v6h-8v-5c0-2-1-3-3-3s-3 1-3 3v12h-9V54z" fill="#f8f8f8" />
      <path d="M52 42h9c8 0 13 5 13 12s-5 12-13 12h-9V42zm9 8h-2v8h2c3 0 5-2 5-4s-2-4-5-4z" fill="#f5c94f" />
      <path d="M37 78h26" stroke="#f5c94f" strokeWidth="3" strokeLinecap="round" />
      <path d="M31 81l-7 6M69 81l7 6" stroke="url(#tb-ring)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27 89h46" stroke="#f5c94f" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 14c3-3 8-5 13-6" stroke="#f5c94f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
