import type { CSSProperties } from 'react'

/**
 * OrbitParticles — частицы, висящие ОРБИТОЙ вокруг предмета после заморозки
 * (зёрна COFFEE COLLISION, лепестки «Ноктюрна», стикеры обучения, шестерёнки внедрения).
 * Чистый CSS (hero-kit.css: .hk-orbit, @keyframes hk-orbit, hk-bob) — без canvas/three.
 *
 * Каждая частица = обёртка, вращающаяся вокруг центра (translate на радиус внутри
 * rotate), плюс медленное «дыхание» по вертикали. Детерминирована по индексу —
 * без случайности между рендерами (правило наших лендингов).
 */

export interface OrbitParticleSpec {
  /** PNG с альфой (вырезка rembg) — или не задавать: будет светящаяся точка */
  src?: string
  /** размер, px (на 1440; масштабируется em-ом контейнера) */
  size?: number
  /** стартовый угол, град */
  angle?: number
  /** радиус орбиты, vmin (≈ % меньшей стороны экрана) */
  radius?: number
  /** период полного оборота, с (60–180 — едва заметный дрейф) */
  duration?: number
  /** доп. поворот самой частицы, град */
  tilt?: number
  /** прозрачность 0–1 */
  opacity?: number
  /** размытие дальних частиц, px (глубина) */
  blur?: number
}

export interface OrbitParticlesProps {
  /** список частиц; либо count для автогенерации точек */
  items?: OrbitParticleSpec[]
  count?: number
  /** цвет точек-частиц без src (например var(--hk-accent)) */
  dotColor?: string
  /** центр орбиты, % (совпадает с maskCenter героя) */
  center?: [number, number]
  className?: string
}

/** детерминированный «шум» по индексу */
const h = (i: number, k: number) => ((i * 2654435761 + k * 40503) % 1000) / 1000

export function OrbitParticles({
  items,
  count = 14,
  dotColor = 'var(--hk-accent, #fff)',
  center = [50, 58],
  className,
}: OrbitParticlesProps) {
  const specs: OrbitParticleSpec[] =
    items ??
    Array.from({ length: count }, (_, i) => ({
      size: 4 + Math.round(h(i, 1) * 8),
      angle: Math.round(h(i, 2) * 360),
      radius: 18 + Math.round(h(i, 3) * 22),
      duration: 70 + Math.round(h(i, 4) * 110),
      opacity: 0.35 + h(i, 5) * 0.55,
      blur: h(i, 6) > 0.72 ? 2 : 0,
    }))

  return (
    <div
      className={`hk-orbit-field ${className ?? ''}`}
      style={{ '--hk-ox': `${center[0]}%`, '--hk-oy': `${center[1]}%` } as CSSProperties}
      aria-hidden
    >
      {specs.map((p, i) => {
        const wrap: CSSProperties = {
          '--hk-angle': `${p.angle ?? (i * 360) / specs.length}deg`,
          '--hk-radius': `${p.radius ?? 26}vmin`,
          '--hk-dur': `${p.duration ?? 90}s`,
          '--hk-delay': `${-(h(i, 7) * (p.duration ?? 90)).toFixed(1)}s`,
        } as CSSProperties
        const body: CSSProperties = {
          width: p.size ?? 8,
          height: p.size ?? 8,
          opacity: p.opacity ?? 0.8,
          filter: p.blur ? `blur(${p.blur}px)` : undefined,
          transform: p.tilt ? `rotate(${p.tilt}deg)` : undefined,
        }
        return (
          <span className="hk-orbit" style={wrap} key={i}>
            {p.src ? (
              <img className="hk-orbit-img" src={p.src} alt="" style={body} draggable={false} />
            ) : (
              <span className="hk-orbit-dot" style={{ ...body, background: dotColor }} />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default OrbitParticles
