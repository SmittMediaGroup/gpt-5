import { useEffect } from 'react'
import Lenis from 'lenis'
import { MotionConfig } from 'framer-motion'
import { Hero } from './sections/Hero'
import { SceneCollapse } from './sections/SceneCollapse'
import { SceneCall } from './sections/SceneCall'
import { SceneRail } from './sections/SceneRail'
import { FillShift } from './sections/FillShift'
import { ProcessLineDesktop } from './sections/ProcessLine'
import { Cta, Faq, Footer, Header, Includes, Pain, Plate, Prices, Proof, Results } from './sections/Blocks'

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.05 })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // якоря через Lenis, чтобы не было рывка
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')!
      const el = id === '#top' ? document.body : document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: 0 })
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      lenis.destroy()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <ProcessLineDesktop />
      <main>
        <Hero />
        <Pain />
        <Plate
          tone="peach"
          kicker="Наш подход"
          sub={
            <>
              Внедрение ИИ в бизнес-процессы начинается не с выбора нейросети, а с вопроса: какой шаг
              сотрудник делает руками десятки раз в день — и что будет, если его не станет.
            </>
          }
        >
          Мы не внедряем «ИИ вообще». Мы убираем из процесса ручные шаги — по одному, и каждый
          видно.
        </Plate>
        <SceneCollapse />
        <Includes />
        <SceneCall />
        <Proof />
        <FillShift />
        <SceneRail />
        <Prices />
        <Results />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </MotionConfig>
  )
}
