import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

/**
 * VideoFreezeHero — герой-«рекламный ролик»: видео играет ОДИН раз и замирает
 * в стоп-кадр с невидимым стыком. Слои (снизу вверх):
 *   z0 постер-стилл (фон; = последний кадр видео)
 *   z1 <video> (без loop)
 *   z2 заголовок (во время ролика — приглушён, с радиальной маской-дырой вокруг предмета)
 *   z3 cutout предмета (PNG с альфой) — поднимается при заморозке → «текст за предметом»
 *   z4 частицы-орбита (particles)
 *   z5 киноплёнка: scrim/bloom/rings/spot/grain (children → <FilmLayers/>)
 *   z6 hairline-UI (children → <HairlineUI/>)
 *
 * Требования к ассетам: posterSrc пиксельно совпадает с последним кадром видео
 * (рецепт A или B из РЕЦЕПТЫ-КИНО.md §3). Подключить hero-kit.css.
 */

export type HeroPhase = 'poster' | 'playing' | 'frozen'

export interface VideoFreezeHeroProps {
  /** mp4 (h264, yuv420p, faststart) */
  videoSrc: string
  /** необязательный webm (vp9) — легче на ~30% */
  videoWebm?: string
  /** герой-стилл = последний кадр видео */
  posterSrc: string
  /** PNG предмета с альфой (rembg из постера) — слой «текст за предметом» */
  cutoutSrc?: string
  /** гигантский заголовок */
  headline: ReactNode
  /** частицы-орбита (появляются после заморозки) */
  particles?: ReactNode
  /** киноплёнка + hairline-UI */
  children?: ReactNode
  /** центр маски-дыры в заголовке, % по X/Y (где предмет). По умолчанию 50/58 */
  maskCenter?: [number, number]
  /** радиус дыры, % меньшей стороны. По умолчанию 26 */
  maskRadius?: number
  /** пауза перед стартом ролика, мс (дать странице отрисоваться) */
  startDelayMs?: number
  /** true — не грузить видео вообще (телефон / экономия трафика) */
  disableVideo?: boolean
  playbackRate?: number
  onPhase?: (p: HeroPhase) => void
  className?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function VideoFreezeHero({
  videoSrc,
  videoWebm,
  posterSrc,
  cutoutSrc,
  headline,
  particles,
  children,
  maskCenter = [50, 58],
  maskRadius = 26,
  startDelayMs = 350,
  disableVideo = false,
  playbackRate = 1,
  onPhase,
  className,
}: VideoFreezeHeroProps) {
  const skipVideo = disableVideo || prefersReducedMotion()
  const [phase, setPhaseRaw] = useState<HeroPhase>(skipVideo ? 'frozen' : 'poster')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const setPhase = useCallback(
    (p: HeroPhase) => {
      setPhaseRaw(p)
      onPhase?.(p)
    },
    [onPhase],
  )

  /** страховка C: дорисовать последний кадр в canvas, чтобы браузер его не сбросил */
  const freeze = useCallback(() => {
    const v = videoRef.current
    const c = canvasRef.current
    if (v && c && v.videoWidth > 0) {
      c.width = v.videoWidth
      c.height = v.videoHeight
      c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height)
    }
    setPhase('frozen')
  }, [setPhase])

  useEffect(() => {
    if (skipVideo) return
    const v = videoRef.current
    if (!v) return
    v.playbackRate = playbackRate
    let cancelled = false
    const t = window.setTimeout(() => {
      v.play()
        .then(() => !cancelled && setPhase('playing'))
        .catch(() => !cancelled && setPhase('frozen')) // автоплей запрещён → сразу стоп-кадр
    }, startDelayMs)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [skipVideo, startDelayMs, playbackRate, setPhase])

  const frozen = phase === 'frozen'

  // маска-дыра: пока ролик играет, заголовок «пропускает» предмет сквозь себя
  const headlineStyle: CSSProperties = frozen
    ? {}
    : ({
        WebkitMaskImage: `radial-gradient(circle ${maskRadius}% at ${maskCenter[0]}% ${maskCenter[1]}%, transparent 55%, black 100%)`,
        maskImage: `radial-gradient(circle ${maskRadius}% at ${maskCenter[0]}% ${maskCenter[1]}%, transparent 55%, black 100%)`,
      } as CSSProperties)

  return (
    <section
      className={`hk-hero ${frozen ? 'hk-frozen' : `hk-${phase}`} ${className ?? ''}`}
      data-phase={phase}
    >
      {/* z0: постер-стилл — всегда под всем; после заморозки он же гарантирует пиксели */}
      <img className="hk-layer hk-poster" src={posterSrc} alt="" aria-hidden draggable={false} />

      {/* z1: видео (одно проигрывание) + canvas-страховка */}
      {!skipVideo && (
        <>
          <video
            ref={videoRef}
            className="hk-layer hk-video"
            muted
            playsInline
            preload="auto"
            poster={posterSrc}
            onEnded={freeze}
            onError={() => setPhase('frozen')}
            disablePictureInPicture
          >
            {videoWebm && <source src={videoWebm} type="video/webm" />}
            <source src={videoSrc} type="video/mp4" />
          </video>
          <canvas ref={canvasRef} className="hk-layer hk-freeze-canvas" aria-hidden />
        </>
      )}

      {/* z2: заголовок — ЗА предметом */}
      <div className="hk-layer hk-headline" style={headlineStyle}>
        {headline}
      </div>

      {/* z3: вырезка предмета — НАД заголовком после заморозки */}
      {cutoutSrc && (
        <img
          className="hk-layer hk-cutout"
          src={cutoutSrc}
          alt=""
          aria-hidden
          draggable={false}
        />
      )}

      {/* z4: частицы-орбита */}
      {particles && <div className="hk-layer hk-particles">{particles}</div>}

      {/* z5–z6: киноплёнка и hairline-UI */}
      {children}
    </section>
  )
}

export default VideoFreezeHero
