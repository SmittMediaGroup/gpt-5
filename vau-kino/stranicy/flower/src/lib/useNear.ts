import { useEffect, useState, type RefObject } from 'react'

/**
 * true, как только элемент подошёл к экрану на rootMargin (03.10.2026).
 * Зачем: ролики «руки» и «финал» стояли с src и autoPlay сразу и качались
 * вместе с первым экраном — 1,1 МБ из 6,1 МБ, которые первый экран не
 * показывает. Теперь src появляется, когда секция в одном экране от зрителя.
 */
export function useNear(ref: RefObject<Element | null>, rootMargin = '100% 0px'): boolean {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, near])
  return near
}
