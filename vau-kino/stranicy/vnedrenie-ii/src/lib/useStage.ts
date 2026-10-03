import { useEffect, type RefObject } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

/**
 * Прогресс sticky-сцены 0…1 и прямая запись стилей в DOM (без ререндера
 * на каждый кадр). При reduced motion сцена сразу показывает конечное
 * состояние — смысл не теряется, движение пропадает.
 */
export function useStage(
  ref: RefObject<HTMLElement | null>,
  apply: (p: number) => void,
  reduced: boolean,
) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduced) apply(v)
  })
  useEffect(() => {
    const run = () => apply(reduced ? 1 : scrollYProgress.get())
    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])
}
