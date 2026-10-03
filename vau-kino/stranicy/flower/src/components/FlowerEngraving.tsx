import type { StemKind } from '../data/stems'

/**
 * Цветы-гравюры: рисованные SVG-линией в духе подписей к голландским
 * натюрмортам. Единственная графика сайта — ни одной фотографии.
 * Каждый вид — своя пластика: пион шаром, тюльпан бокалом, дельфиниум
 * свечой, эвкалипт монетками, берграс дугой.
 */

const LINE = 'var(--color-bone)'

function PeonyHead({ hue }: { hue: string }) {
  /* махровая головка: веер лепестков от основания, как раскрытый пион сбоку */
  const outer = 'M 0 0 C -8 -6, -10 -20, 0 -28 C 10 -20, 8 -6, 0 0 Z'
  const inner = 'M 0 0 C -5 -4, -6 -13, 0 -19 C 6 -13, 5 -4, 0 0 Z'
  return (
    <g transform="translate(0 -1)">
      {[-56, -28, 0, 28, 56].map((a, i) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={outer} fill={hue} opacity={0.55 + (i % 2) * 0.12} />
          <path d={outer} fill="none" stroke={LINE} strokeWidth={0.7} opacity={0.45} />
        </g>
      ))}
      {[-26, 0, 26].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={inner} fill={hue} opacity={0.9} />
          <path d={inner} fill="none" stroke={LINE} strokeWidth={0.6} opacity={0.4} />
        </g>
      ))}
    </g>
  )
}

function RanunculusHead({ hue }: { hue: string }) {
  /* чашка со слоями лепестков — дуги убывающего радиуса */
  return (
    <g transform="translate(0 -14)">
      <path
        d="M -13 4 C -14 -8, -8 -16, 0 -16 C 8 -16, 14 -8, 13 4 C 12 10, 6 13, 0 13 C -6 13, -12 10, -13 4 Z"
        fill={hue}
        opacity={0.85}
      />
      <path
        d="M -13 4 C -14 -8, -8 -16, 0 -16 C 8 -16, 14 -8, 13 4 C 12 10, 6 13, 0 13 C -6 13, -12 10, -13 4 Z"
        fill="none"
        stroke={LINE}
        strokeWidth={0.8}
        opacity={0.5}
      />
      {[9, 6, 3.4].map((r) => (
        <path
          key={r}
          d={`M ${-r} 2 A ${r} ${r} 0 0 1 ${r} 2`}
          fill="none"
          stroke={LINE}
          strokeWidth={0.7}
          opacity={0.45}
        />
      ))}
    </g>
  )
}

function TulipHead({ hue }: { hue: string }) {
  return (
    <g>
      <path
        d="M -14 -18 C -16 -34, -8 -46, 0 -46 C 8 -46, 16 -34, 14 -18 C 12 -8, 6 -4, 0 -4 C -6 -4, -12 -8, -14 -18 Z"
        fill={hue}
        opacity={0.85}
      />
      {/* створки бокала */}
      <path d="M 0 -45 C -3 -34, -3 -16, 0 -5" fill="none" stroke={LINE} strokeWidth={0.9} opacity={0.55} />
      <path d="M -12 -32 C -8 -24, -4 -12, 0 -5 M 12 -32 C 8 -24, 4 -12, 0 -5" fill="none" stroke={LINE} strokeWidth={0.7} opacity={0.4} />
    </g>
  )
}

function DelphiniumHead({ hue }: { hue: string }) {
  /* колос из маленьких цветков вдоль верхней трети стебля */
  const florets = [-64, -54, -44, -34, -24, -14]
  return (
    <g>
      {florets.map((y, i) => (
        <g key={y} transform={`translate(${i % 2 === 0 ? -6 : 6} ${y})`}>
          <circle r={5.5} fill={hue} opacity={0.85} />
          <circle r={5.5} fill="none" stroke={LINE} strokeWidth={0.7} opacity={0.45} />
          <circle r={1.4} fill={LINE} opacity={0.7} />
        </g>
      ))}
    </g>
  )
}

function EucalyptusHead({ hue }: { hue: string }) {
  /* монетки цинереи парами вдоль стебля */
  const coins = [-58, -46, -34, -22, -10]
  return (
    <g>
      {coins.map((y, i) => (
        <g key={y}>
          <circle cx={i % 2 === 0 ? -8 : 8} cy={y} r={6} fill={hue} opacity={0.8} />
          <circle cx={i % 2 === 0 ? -8 : 8} cy={y} r={6} fill="none" stroke={LINE} strokeWidth={0.7} opacity={0.4} />
        </g>
      ))}
    </g>
  )
}

function GrassHead() {
  return (
    <g>
      <path d="M 0 -6 C -4 -30, -16 -48, -26 -58" fill="none" stroke={LINE} strokeWidth={1} opacity={0.5} />
      <path d="M 0 -6 C 2 -34, 10 -54, 22 -66" fill="none" stroke={LINE} strokeWidth={1} opacity={0.5} />
    </g>
  )
}

/**
 * Один стебель с головкой. ViewBox: (-30..30, -80..0), корень в (0,0).
 * bend — лёгкий изгиб стебля, чтобы букет не был веером из линейки.
 */
export function StemGlyph({ kind, hue, bend = 0 }: { kind: StemKind; hue: string; bend?: number }) {
  const showStalk = kind !== 'grass'
  return (
    <g>
      {showStalk && (
        <path
          d={`M 0 0 C ${bend} -22, ${-bend} -46, 0 -${kind === 'delphinium' || kind === 'eucalyptus' ? 66 : 44}`}
          fill="none"
          stroke="var(--color-stem)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      )}
      {kind === 'peony' && <g transform="translate(0 -42)"><PeonyHead hue={hue} /></g>}
      {kind === 'ranunculus' && <g transform="translate(0 -32)"><RanunculusHead hue={hue} /></g>}
      {kind === 'tulip' && <g transform="translate(0 -40)"><TulipHead hue={hue} /></g>}
      {kind === 'delphinium' && <DelphiniumHead hue={hue} />}
      {kind === 'eucalyptus' && <EucalyptusHead hue={hue} />}
      {kind === 'grass' && <GrassHead />}
    </g>
  )
}

/**
 * Крупный одиночный пион для hero-фолбэка: гравюрная розетка анфас —
 * три яруса полупрозрачных лепестков с линией контура, как оттиск
 * с медной доски. Короткий стебель с листом внизу.
 */
const HERO_PETAL = 'M 0 0 C -15 -20, -13 -50, 0 -66 C 13 -50, 15 -20, 0 0 Z'
const HERO_MID = 'M 0 0 C -10 -13, -9 -34, 0 -46 C 9 -34, 10 -13, 0 0 Z'
const HERO_CORE = 'M 0 0 C -6 -8, -5 -20, 0 -27 C 5 -20, 6 -8, 0 0 Z'

export function HeroPeony({ className }: { className?: string }) {
  return (
    <svg viewBox="-90 -160 180 200" className={className} role="presentation">
      {/* стебель с листом */}
      <path
        d="M 0 -22 C 3 -4, -3 16, 0 36"
        fill="none"
        stroke="var(--color-stem)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M 0.5 8 C 12 6, 21 -2, 21 -14 C 10 -11, 3 -2, 0.5 8 Z"
        fill="var(--color-stem)"
        opacity={0.9}
      />
      <g transform="translate(0 -88)">
        {/* внешний ярус: восемь лепестков, ловящих свет по-разному */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={HERO_PETAL} fill="var(--color-peony)" opacity={0.24 + (i % 3) * 0.05} />
            <path d={HERO_PETAL} fill="none" stroke="var(--color-bone)" strokeWidth={0.8} opacity={0.42} />
            {/* жилка лепестка */}
            <path d="M 0 -8 C -2 -26, -1 -46, 0 -58" fill="none" stroke="var(--color-bone)" strokeWidth={0.5} opacity={0.25} />
          </g>
        ))}
        {/* средний ярус */}
        {[22, 82, 142, 202, 262, 322].map((a, i) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={HERO_MID} fill="var(--color-peony)" opacity={0.4 + (i % 2) * 0.08} />
            <path d={HERO_MID} fill="none" stroke="var(--color-bone)" strokeWidth={0.7} opacity={0.5} />
          </g>
        ))}
        {/* сердцевина: четыре сомкнутых лепестка вокруг тычинок */}
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a + 45})`}>
            <path d={HERO_CORE} fill="var(--color-peony)" opacity={0.75} />
            <path d={HERO_CORE} fill="none" stroke="var(--color-bone)" strokeWidth={0.6} opacity={0.5} />
          </g>
        ))}
        {[-6, 0, 6].map((x) => (
          <circle key={x} cx={x} cy={-3} r={1.6} fill="#f0d9a8" opacity={0.85} />
        ))}
      </g>
    </svg>
  )
}
