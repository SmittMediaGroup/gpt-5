import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { Preloader } from './components/Preloader'
import { ActShift } from './components/ActShift'
import { Hero } from './sections/Hero'
import { BloomScrub } from './sections/BloomScrub'
import { Bouquets } from './sections/Bouquets'
import { Atelier } from './sections/Atelier'
import { Hands } from './sections/Hands'
import { Finale } from './sections/Finale'
import { BlogTeaser } from './sections/BlogTeaser'
import { useContent } from './content/useContent'
import { useBlogPosts } from './content/studio'

/**
 * Шапка над кадром прозрачна: кремовая полоса поверх первого экрана
 * рубила кинокадр пополам. Как только зритель ушёл с первого экрана,
 * полоса возвращается — на светлых секциях она нужна для контраста.
 */
function Header() {
  const txt = useContent()
  const [overStage, setOverStage] = useState(true)
  useEffect(() => {
    /* Полоса прозрачна над ЛЮБОЙ тёмной секцией, а не только над первым
       экраном: кремовая плашка резала и кадр «внутри цветка», и ночные
       полосы — ровно так же, как раньше резала hero (02.10).
       Тёмные секции помечены data-night; ищем ту, что сейчас под шапкой. */
    const on = () => {
      let dark = false
      document.querySelectorAll<HTMLElement>('[data-night]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top <= 56 && r.bottom >= 24) dark = true
      })
      setOverStage(dark)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-6 transition-colors duration-500 ${
        overStage
          ? 'border-b border-transparent bg-transparent text-white [text-shadow:0_1px_10px_rgba(43,19,32,0.55)]'
          : 'border-b border-bone/10 bg-velvet/85 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4">
        <a
          href="#top"
          className="display flex min-h-11 min-w-0 items-center truncate text-lg tracking-[0.04em]"
        >
          {txt.header.brand}
        </a>
        <nav className="flex shrink-0 items-center gap-6 text-sm">
          <a
            href="#opus"
            className={`hidden min-h-11 items-center transition-colors duration-200 sm:flex ${
              overStage ? 'text-white/90 hover:text-white' : 'text-smoke hover:text-bone'
            }`}
          >
            {txt.header.navOpus}
          </a>
          <a
            href="#atelier"
            className={`flex min-h-11 items-center transition-colors duration-200 ${
              overStage ? 'text-white hover:text-white/80' : 'text-peony hover:text-bone'
            }`}
          >
            {txt.header.navAtelier}
          </a>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const txt = useContent()
  const hasBlog = useBlogPosts(1).length > 0
  // Hero-хореография ждёт ухода шторки прелоадера
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.05 })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Preloader onReveal={() => setBooted(true)} />
      <ActShift />
      <Header />
      <main>
        <Hero go={booted} />
        <BloomScrub />
        <Bouquets />
        <Hands />
        <Atelier />
        <BlogTeaser />
        <Finale />
      </main>
      {/* Подвал — продолжение ночного финала, а не кремовый обрыв под ним */}
      <footer className="night-band px-6 py-12 text-xs text-smoke/95">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-8 gap-y-2">
          <span>{txt.footer.left}</span>
          <span>{txt.footer.right}</span>
          {hasBlog ? (
            <a
              href={`${import.meta.env.BASE_URL}blog/`}
              className="inline-flex min-h-11 items-center underline decoration-smoke/52 underline-offset-4 transition-colors duration-200 hover:text-bone focus-visible:text-bone text-smoke/95"
            >
              {txt.footer.blog}
            </a>
          ) : null}
          <a
            href={`${import.meta.env.BASE_URL}legal.html`}
            className="inline-flex min-h-11 items-center underline decoration-smoke/52 underline-offset-4 transition-colors duration-200 hover:text-bone focus-visible:text-bone text-smoke/95"
          >
            {txt.footer.legal}
          </a>
          {/* Витрина агентства: отсюда разговор уходит в SmittMediaGroup */}
          <a
            href="https://smittmediagroup.ru/#contact"
            rel="noopener"
            className="inline-flex min-h-11 items-center rounded-full border border-bone/25 px-5 text-xs text-bone transition-colors duration-200 hover:border-bone/60 hover:bg-bone hover:text-velvet"
          >
            Обсудить задачу
          </a>
        </div>
      </footer>
    </>
  )
}
