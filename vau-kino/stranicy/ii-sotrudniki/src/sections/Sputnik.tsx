import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Сквозной персонаж: маленький пропуск «в сети» сопровождает по всей
 * странице и меняет статус по секциям. Секции объявляют статус атрибутом
 * data-status; сцены меняют его сами по ходу прокрутки. На первом экране
 * спутник прячется — там большой пропуск.
 */
export function Sputnik() {
  const [status, setStatus] = useState('')
  const [vidno, setVidno] = useState(false)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const mid = window.innerHeight * 0.55
      let st = ''
      document.querySelectorAll<HTMLElement>('[data-status]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) st = el.dataset.status || ''
      })
      setStatus(st)
      setVidno(window.scrollY > window.innerHeight * 0.7 && st !== '')
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    // сцены меняют data-status без прокрутки (после рендера) — подстраховка
    const mo = new MutationObserver(on)
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-status'] })
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <AnimatePresence>
      {vidno && (
        <motion.a
          href="#forma"
          aria-label={`ИИ-сотрудник: ${status}. Перейти к заявке`}
          className="fixed bottom-3 left-3 z-40 flex h-11 max-w-[calc(100vw-24px)] items-center gap-2.5 rounded-2xl border-2 border-chern bg-bumaga py-1 pl-1 pr-3.5 shadow-[0.25rem_0.3rem_0_oklch(0.45_0.12_148/0.45)] md:bottom-6 md:left-auto md:right-6 md:h-14 md:pr-5"
          initial={{ y: 80, rotate: -6 }}
          animate={{ y: 0, rotate: 0 }}
          exit={{ y: 90, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <span className="grid h-full w-8 shrink-0 place-items-center rounded-xl bg-pole md:w-11">
            <span className="tochka" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-glub md:text-[0.68rem]">
              ИИ-сотрудник · № 0001
            </span>
            <span className="relative block h-[1.2em] overflow-hidden text-[0.86rem] font-bold md:text-[0.98rem]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
                  className="block truncate"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-110%' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {status}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
