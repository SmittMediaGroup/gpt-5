import type { ReactNode } from 'react'

/**
 * HairlineUI — интерфейс «из волосяных линий и одной залитой панели» (формула Parrot:
 * "an interface built from hairlines and one filled panel"). Правила:
 *  - все линии 1px, цвет с низкой альфой (--hk-hairline);
 *  - ровно ОДИН залитый элемент на экран (CTA-кнопка) — больше нельзя;
 *  - мелкий моноширинный служебный текст (hint) по углам — «приборная панель».
 */

export interface HairlineUIProps {
  /** бренд слева в навбаре */
  brand: ReactNode
  /** пункты меню */
  links?: { label: string; href: string }[]
  /** ЕДИНСТВЕННЫЙ залитый элемент — CTA */
  cta?: { label: string; href: string }
  /** мелкая подпись слева внизу (hint), моноширинная */
  hint?: ReactNode
  /** подпись у индикатора прокрутки */
  scrollLabel?: string
}

export function HairlineUI({
  brand,
  links = [],
  cta,
  hint,
  scrollLabel = 'листайте',
}: HairlineUIProps) {
  return (
    <div className="hk-layer hk-ui">
      <nav className="hk-nav">
        <div className="hk-brand">{brand}</div>
        <div className="hk-links">
          {links.map((l) => (
            <a className="hk-link" href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        {cta && (
          <a className="hk-cta" href={cta.href}>
            {cta.label}
          </a>
        )}
      </nav>

      <div className="hk-bar">
        {hint && <div className="hk-hint">{hint}</div>}
        <div className="hk-scroll">
          <span className="hk-scroll-label">{scrollLabel}</span>
          <span className="hk-scroll-line" />
        </div>
      </div>

      {/* угловые метки кадра */}
      <span className="hk-corner hk-tl" />
      <span className="hk-corner hk-tr" />
      <span className="hk-corner hk-bl" />
      <span className="hk-corner hk-br" />
    </div>
  )
}

export default HairlineUI
