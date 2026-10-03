import type { CSSProperties } from 'react'

/**
 * FilmLayers — «киноплёнка» поверх видео-героя: те самые слои из промтов Scrolltide
 * (hero.css: mask, spot, bloom, rings, scrim, grain). Что делает каждый:
 *
 *  scrim — вертикальный градиент-затемнение сверху и снизу: читаемость навбара
 *          и нижней строки, «кинокадр» вместо плоского видео;
 *  spot  — пятно света (radial-gradient) за предметом: собирает взгляд в центр;
 *  bloom — мягкое цветное свечение (размытый radial, screen): «дорогая» подсветка;
 *  rings — 1–3 тонкие концентрические окружности вокруг предмета: технологичность,
 *          подчёркивают орбиту частиц;
 *  grain — зерно плёнки: SVG feTurbulence в data-uri, прыгает steps()-анимацией,
 *          3–5% opacity, mix-blend-mode: overlay (убирает «ИИ-гладкость» и бандинг);
 *  mask  — у Scrolltide это маска краёв героя (виньетка-прямоугольник), здесь vignette.
 *
 * Все параметры — через CSS-переменные (см. hero-kit.css), центр совпадает с maskCenter.
 */

export interface FilmLayersProps {
  scrim?: boolean
  spot?: boolean
  bloom?: boolean
  /** количество колец: 0–3 */
  rings?: number
  grain?: boolean
  vignette?: boolean
  /** центр spot/bloom/rings, % */
  center?: [number, number]
  /** акцентный цвет bloom (по умолчанию var(--hk-accent)) */
  bloomColor?: string
}

export function FilmLayers({
  scrim = true,
  spot = true,
  bloom = true,
  rings = 2,
  grain = true,
  vignette = true,
  center = [50, 58],
  bloomColor,
}: FilmLayersProps) {
  const style = {
    '--hk-cx': `${center[0]}%`,
    '--hk-cy': `${center[1]}%`,
    ...(bloomColor ? { '--hk-bloom': bloomColor } : {}),
  } as CSSProperties

  return (
    <div className="hk-layer hk-film" style={style} aria-hidden>
      {spot && <div className="hk-spot" />}
      {bloom && <div className="hk-bloom" />}
      {rings > 0 &&
        Array.from({ length: Math.min(rings, 3) }, (_, i) => (
          <div className={`hk-ring hk-ring-${i + 1}`} key={i} />
        ))}
      {scrim && <div className="hk-scrim" />}
      {vignette && <div className="hk-vignette" />}
      {grain && <div className="hk-grain" />}
    </div>
  )
}

export default FilmLayers
