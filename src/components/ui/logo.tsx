type LogoProps = { size?: number; className?: string };

export function Logo({ size = 96, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Restaurante Tabajara's Churrascaria"
      className={className}
    >
      <defs>
        <linearGradient id="tabajara-ring" x1="14" y1="18" x2="106" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f7c83f" />
          <stop offset="0.42" stopColor="#f36a2a" />
          <stop offset="0.73" stopColor="#f36a2a" />
          <stop offset="1" stopColor="#27a8d9" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill="#0a0a0a" />

      <path d="M17 46A45 45 0 0 1 47 16" fill="none" stroke="#f3bd2f" strokeWidth="6" strokeLinecap="round" />
      <path d="M17 76A45 45 0 0 1 12 61" fill="none" stroke="#ef6230" strokeWidth="6" strokeLinecap="round" />
      <path d="M103 76A45 45 0 0 0 108 60" fill="none" stroke="#2ca9d9" strokeWidth="6" strokeLinecap="round" />

      <path d="M43 26h34" stroke="#f4bf32" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 94h36" stroke="#f4bf32" strokeWidth="4" strokeLinecap="round" />

      <path
        d="M26 47h15v30H26zM39 47c0-11 7-18 17-18 8 0 14 6 14 14v9H57v-7c0-3-1-5-4-5-3 0-5 2-5 6v19H39z"
        fill="#fff"
      />
      <path
        d="M70 29h13c11 0 18 8 18 20s-7 20-18 20H70zm12 12v16h2c4 0 7-3 7-8s-3-8-7-8z"
        fill="#f2c33a"
      />

      <path d="M31 84l-6 7" stroke="#f4bf32" strokeWidth="3" strokeLinecap="round" />
      <path d="M89 84l6 7" stroke="#f4bf32" strokeWidth="3" strokeLinecap="round" />

      <g transform="translate(46 4) scale(.52)">
        <path d="M8 2v28M16 2v28M24 2v28M32 2v28" stroke="#f4bf32" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M8 16h24" stroke="#f4bf32" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M20 29v22" stroke="#f4bf32" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M44 4l-9 18h8l-5 17 15-24h-9z" fill="#f4bf32" />
      </g>

      <g transform="translate(45 92) scale(.46)">
        <path d="M7 2c3 8 3 15 0 23-1 7 3 11 8 11s9-4 8-11c-3-8-3-15 0-23" fill="none" stroke="#f4bf32" strokeWidth="4" strokeLinecap="round" />
        <path d="M15 37v15" stroke="#f4bf32" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 2v52" stroke="#f4bf32" strokeWidth="4" strokeLinecap="round" />
      </g>

      <circle cx="60" cy="60" r="56" fill="none" stroke="url(#tabajara-ring)" strokeWidth="1.4" opacity=".55" />
    </svg>
  );
}
