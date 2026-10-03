import type { ReactNode } from 'react'

export const TG = 'https://t.me/SmittMG'
export const MAIL = 'info@smittmediagroup.ru'

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mono text-[12px] font-medium uppercase tracking-[0.12em] sm:text-[13px] ${className}`}>
      {children}
    </p>
  )
}

export function CtaButton({
  children,
  tone = 'choc',
  className = '',
}: {
  children: ReactNode
  tone?: 'choc' | 'krem' | 'pole' | 'rust'
  className?: string
}) {
  const tones = {
    choc: 'bg-choc text-krem hover:bg-choc2',
    krem: 'bg-krem text-choc hover:bg-white',
    pole: 'bg-pole text-choc hover:bg-pole2',
    rust: 'bg-rust text-krem hover:bg-choc',
  }
  return (
    <a
      href="#razbor"
      className={`focus-ring group inline-flex min-h-14 items-center gap-3 rounded-full px-7 text-[16px] font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98] sm:text-[17px] ${tones[tone]} ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </a>
  )
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** доля пути t внутри окна [a, b] */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
