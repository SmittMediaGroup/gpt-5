import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { MotionConfig } from 'framer-motion'
import { Hero } from './sections/Hero'
import { Pain, Plate } from './sections/Calm'
import { ScenePrompt } from './sections/ScenePrompt'
import { SceneClass } from './sections/SceneClass'
import { SceneLine } from './sections/SceneLine'
import { Fill } from './sections/Fill'
import { Cta, Faq, Footer, Keep, Price, Program, Steps, Who } from './sections/Content'

function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-4 transition-colors duration-300 md:px-10 ${
        solid ? 'border-b-2 border-ink bg-pole/92 backdrop-blur-sm' : 'border-b-2 border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 md:h-16">
        <a href="#top" className="flex min-h-11 items-center gap-2.5 font-display text-[0.95rem] font-extrabold tracking-[0.06em]">
          <span className="inline-block h-3.5 w-6 rounded-[4px] bg-ink" aria-hidden="true" />
          SMITT·MEDIA·GROUP
        </a>
        <nav className="flex items-center gap-1 text-[0.95rem] font-semibold md:gap-6">
          <a href="#programma" className="hidden min-h-11 items-center hover:underline md:flex">Программа</a>
          <a href="#cena" className="hidden min-h-11 items-center hover:underline md:flex">Цена</a>
          <a href="#voprosy" className="hidden min-h-11 items-center hover:underline md:flex">Вопросы</a>
          <a href="#zayavka" className="flex min-h-10 items-center rounded-full bg-ink px-4 text-pole md:min-h-11 md:px-5">
            Заявка
          </a>
        </nav>
      </div>
    </header>
  )
}

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
      lenis.scrollTo(el as HTMLElement, { offset: id === '#top' ? 0 : -64 })
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
      <main>
        <Hero />
        <Pain />
        <Plate
          tone="deep"
          kicker="Что меняем"
          note={
            <>
              Не лекция про «эпоху ИИ». Программа одна, а задачи внутри — только ваши: письма, КП,
              договоры, отчёты. За шесть часов каждый участник переводит на нейросеть хотя бы одну
              свою рабочую задачу — при ведущем.
            </>
          }
        >
          Садимся с вашей командой и переводим на&nbsp;ИИ то, что сейчас делают руками
        </Plate>
        <ScenePrompt />
        <Program />
        <Fill />
        <SceneClass />
        <Steps />
        <Price />
        <Plate tone="light" kicker="Главный вопрос первого занятия">
          Не «как спросить», а «что туда вообще можно загружать»
        </Plate>
        <SceneLine />
        <Keep />
        <Who />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </MotionConfig>
  )
}
