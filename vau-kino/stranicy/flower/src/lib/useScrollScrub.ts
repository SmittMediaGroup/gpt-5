import { useEffect, type RefObject } from 'react'

/**
 * Скролл-скраб видео: прогресс секции двигает кадр. Рецепты —
 * rules/motion-video.md: all-intra файл (грабля 5), прогресс из
 * getBoundingClientRect в rAF (грабля 3), seeking guard (грабля 5).
 * На таче — «догоняющий» playbackRate: видео всегда доигрывает до
 * кадра, соответствующего прогрессу скролла (проверено на sad138),
 * прогрев первым жестом (грабля 7), reduced-motion не прячем
 * (грабля 10). Видео секции без loop: финальный кадр должен остаться.
 * onProgress — для подписей этапов и линии прогресса.
 */
export function useScrollScrub(
  sectionRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  srcDesktop: string,
  srcMobile: string,
  onProgress?: (p: number) => void,
  /**
   * Какую долю прокрутки секции занимает сам ролик. 1 — как было: ролик
   * растянут на всю секцию. Меньше единицы — ролик доигрывает раньше, а
   * остаток прокрутки достаётся следующей сцене (влёт внутрь цветка).
   * onProgress при этом по-прежнему отдаёт СЫРОЙ прогресс всей секции.
   */
  scrubSpan = 1,
) {
  useEffect(() => {
    const section = sectionRef.current
    const v = videoRef.current
    if (!section || !v) return

    const coarse = window.matchMedia('(pointer: coarse)').matches
    const mobile = window.innerWidth < 768

    let srcSet = false
    let idle = 0
    const intent = ['scroll', 'wheel', 'touchstart', 'keydown'] as const
    const lazyIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !srcSet) {
          lazyIo.disconnect()
          /* 03.10: секция стоит сразу под первым экраном, и запас 150 %
             тянул 3,9 МБ ролика вместе с героем. Теперь ролик ждёт первого
             жеста прокрутки (до секции ещё целый экран — успевает) либо
             5 с простоя, чтобы к приходу зрителя он уже был. */
          const load = () => {
            if (srcSet) return
            srcSet = true
            v.src = mobile ? srcMobile : srcDesktop
            intent.forEach((ev) => window.removeEventListener(ev, load))
            clearTimeout(idle)
          }
          if (window.scrollY > 8) return load()
          intent.forEach((ev) => window.addEventListener(ev, load, { passive: true, once: true }))
          idle = window.setTimeout(load, 5000)
        }
      },
      { rootMargin: '150% 0px' },
    )
    lazyIo.observe(section)

    const warm = () => {
      v.muted = true
      v.play()
        .then(() => v.pause())
        .catch(() => {})
    }
    if (coarse) {
      window.addEventListener('touchstart', warm, { once: true, passive: true })
      window.addEventListener('scroll', warm, { once: true, passive: true })
    }

    let raf = 0
    let lastProgress = -1
    let pendingSeek = -1

    const onSeeked = () => {
      if (pendingSeek >= 0) {
        const t = pendingSeek
        pendingSeek = -1
        v.currentTime = t
      }
    }
    v.addEventListener('seeked', onSeeked)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const rect = section.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      const raw = Math.min(Math.max(-rect.top / span, 0), 1)
      onProgress?.(raw)
      if (!v.duration) return
      // прогресс самого ролика: он доигрывает к доле scrubSpan секции
      const progress = Math.min(raw / Math.max(scrubSpan, 0.05), 1)

      if (!coarse) {
        if (progress === lastProgress) return
        lastProgress = progress
        const t = progress * (v.duration - 0.05)
        if (v.seeking) pendingSeek = t
        else v.currentTime = t
        return
      }

      // Тач: покадровый seek ленивый (грабля 8) — играем вперёд со
      // скоростью, пропорциональной отставанию от целевого кадра.
      const target = progress * (v.duration - 0.05)
      const err = target - v.currentTime
      if (err > 0.05) {
        v.playbackRate = Math.min(Math.max(err * 1.5, 0.5), 3)
        if (v.paused && rect.top < window.innerHeight && rect.bottom > 0) {
          v.play().catch(() => {})
        }
      } else if (err < -0.35) {
        // Отлистали назад: играть в минус нельзя — редкий guarded seek
        if (!v.paused) v.pause()
        if (v.seeking) pendingSeek = target
        else v.currentTime = target
      } else if (!v.paused) {
        v.pause()
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lazyIo.disconnect()
      clearTimeout(idle)
      v.removeEventListener('seeked', onSeeked)
      window.removeEventListener('touchstart', warm)
      window.removeEventListener('scroll', warm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcDesktop, srcMobile, scrubSpan])
}
