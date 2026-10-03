import { useEffect, useMemo, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import { StopContext } from './lib/scene'
import { Hero } from './sections/Hero'
import { Bol, Obeshchanie, PlashkaBot, PlashkaPeredFormoy } from './sections/Plashki'
import { Noch } from './sections/Noch'
import { Shtat } from './sections/Shtat'
import { Tabel } from './sections/Tabel'
import { Etapy } from './sections/Etapy'
import { UzheRabotayut } from './sections/UzheRabotayut'
import { Zvonok } from './sections/Zvonok'
import { Integracii } from './sections/Integracii'
import { Formaty } from './sections/Formaty'
import { Garantii } from './sections/Garantii'
import { Faq } from './sections/Faq'
import { Forma } from './sections/Forma'
import { Sputnik } from './sections/Sputnik'

const KEY = 'vau-ii-stop'

function Header({ stopped, toggle }: { stopped: boolean; toggle: () => void }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-bumaga/90 shadow-[0_1px_0_oklch(0.22_0.05_148/0.12)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <span className="tochka" aria-hidden />
          <span className="head text-[1.35rem] font-[800] leading-none">SMITT<span className="hidden sm:inline"> · ИИ-⁠сотрудники</span></span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3">
          <a href="#shtat" className={`hidden min-h-11 items-center px-2 text-sm font-semibold hover:underline ${solid ? 'md:flex' : ''}`}>
            Роли
          </a>
          <a href="#formaty" className={`hidden min-h-11 items-center px-2 text-sm font-semibold hover:underline ${solid ? 'md:flex' : ''}`}>
            Стоимость
          </a>
          <a href="#faq" className={`hidden min-h-11 items-center px-2 text-sm font-semibold hover:underline ${solid ? 'md:flex' : ''}`}>
            Вопросы
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={stopped}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold hover:bg-chern/8"
            title={stopped ? 'Включить движение' : 'Остановить движение'}
          >
            <span aria-hidden className="mono text-base">{stopped ? '▶' : '❚❚'}</span>
            <span className="sr-only">{stopped ? 'Включить движение' : 'Остановить движение'}</span>
          </button>
          <a
            href="#forma"
            className={`flex min-h-11 items-center rounded-full border-2 border-chern px-4 text-sm font-bold transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
              solid ? 'bg-chern text-pole' : 'bg-bumaga text-chern'
            }`}
          >
            Разбор <span className="hidden sm:inline">&nbsp;30 минут</span>
          </a>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [stopped, setStopped] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  const ctx = useMemo(
    () => ({
      stopped,
      toggle: () =>
        setStopped((s) => {
          try {
            localStorage.setItem(KEY, s ? '0' : '1')
          } catch {
            /* хранилище недоступно — просто не запоминаем */
          }
          return !s
        }),
    }),
    [stopped],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('bez-dvizheniya', stopped)
  }, [stopped])

  useEffect(() => {
    if (stopped) return
    const lenis = new Lenis({ duration: 1.05 })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [stopped])

  return (
    <StopContext.Provider value={ctx}>
      <MotionConfig reducedMotion={stopped ? 'always' : 'user'}>
        <Header stopped={stopped} toggle={ctx.toggle} />
        <Sputnik />
        <main id="top">
          <Hero />
          <Bol />
          <Obeshchanie />
          <Noch />
          <Shtat />
          <PlashkaBot />
          <Tabel />
          <Etapy />
          <UzheRabotayut />
          <Zvonok />
          <Integracii />
          <Formaty />
          <Garantii />
          <Faq />
          <PlashkaPeredFormoy />
          <Forma />
        </main>
        <footer className="bg-bumaga px-4 pb-12 pt-10 text-sm text-seryy sm:px-6">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-4 border-t border-chern/15 pt-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[60ch] space-y-2">
              <p className="font-semibold text-chern">SmittMediaGroup · ИИ-⁠сотрудники для бизнеса</p>
              <p>
                ИИ ошибается — результаты проверяет человек. ИИ-⁠сотрудник не даёт юридических, медицинских и
                финансовых заключений: он готовит справку, решение принимает специалист.
              </p>
              <p>Сценарии на странице — примеры, а не отчёты клиентов. Страница — превью, не публичная оферта.</p>
            </div>
            <div className="flex flex-col gap-1">
              <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://smittmediagroup.ru/privacy" rel="noopener">
                Политика обработки персональных данных
              </a>
              <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="mailto:info@smittmediagroup.ru">
                info@smittmediagroup.ru
              </a>
              <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://t.me/SmittMG" rel="noopener">
                Telegram @SmittMG
              </a>
            </div>
          </div>
        </footer>
      </MotionConfig>
    </StopContext.Provider>
  )
}
