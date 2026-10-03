/**
 * Маркер-выделитель — сквозной «персонаж» страницы. Нарисован вектором (≈2 КБ).
 * Кончик слева: точка (≈1,5 %, 50 %) — опорная, вокруг неё поворачиваем.
 */
export function Marker({ className = '', style, plain = false }: { className?: string; style?: React.CSSProperties; plain?: boolean }) {
  // Маркер нарисован, а не сгенерирован: 2 КБ вектора. Кончик слева (x≈0, y≈85) —
  // это точка поворота: маркер «лежит» на конце только что проведённой полосы.
  return (
    <svg viewBox="0 0 640 170" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="mk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf3" />
          <stop offset="1" stopColor="#fdeeb8" />
        </linearGradient>
      </defs>
      <path d="M100 150 L600 150 L600 168 L100 168 Z" fill="#d99a00" opacity="0.35" />
      <path d="M10 74 L28 66 L28 104 L10 96 Z" fill="#fff7da" stroke="#17140a" strokeWidth="5" strokeLinejoin="round" />
      <path d="M28 66 L100 46 L100 124 L28 104 Z" fill="#f2b705" stroke="#17140a" strokeWidth="5" strokeLinejoin="round" />
      <rect x="90" y="34" width="400" height="102" rx="22" fill="url(#mk-body)" stroke="#17140a" strokeWidth="5" />
      <rect x="136" y="67" width="250" height="36" rx="18" fill="#ffd43b" stroke="#17140a" strokeWidth="4" />
      {plain ? null : (
      <text x="261" y="93" textAnchor="middle" fontFamily="Geologica Variable, Arial Black, sans-serif" fontWeight="900" fontSize="25" letterSpacing="3" fill="#17140a">
        ИИ · ПРАКТИКА
      </text>
      )}
      <rect x="470" y="26" width="152" height="118" rx="26" fill="#4a4024" stroke="#17140a" strokeWidth="5" />
      <rect x="522" y="12" width="80" height="26" rx="10" fill="#4a4024" stroke="#17140a" strokeWidth="5" />
      <rect x="494" y="54" width="78" height="10" rx="5" fill="#ffd43b" opacity="0.9" />
    </svg>
  )
}


/**
 * Маркер, поставленный кончиком в точку (x, y) контейнера и повёрнутый на angle
 * (0° — корпус уходит вправо от кончика). Ширина — в пикселях или em.
 */
export function MarkerAt({
  x,
  y,
  angle,
  width,
  opacity = 1,
  flip = false,
  className = '',
}: {
  x: number | string
  y: number | string
  angle: number
  width: string
  opacity?: number
  /** зеркалит поперёк корпуса — чтобы надпись не шла вверх ногами при ходе влево */
  flip?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block h-0 w-0 ${className}`}
      style={{ left: x, top: y, opacity }}
    >
      <span
        className="absolute block"
        style={{
          width,
          left: `calc(${width} * -0.015)`,
          top: `calc(${width} * -0.1328)`,
          transformOrigin: `calc(${width} * 0.015) calc(${width} * 0.1328)`,
          transform: `rotate(${angle}deg)${flip ? ' scaleY(-1)' : ''}`,
        }}
      >
        <Marker className="block w-full" plain={flip} />
      </span>
    </span>
  )
}
