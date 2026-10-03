import { useEffect, useState } from 'react'

/**
 * Мост сайта со Студией. Копируется в src/content/ каждого проекта как есть.
 *
 * Сайт в Студии открывается в iframe с ?studio=1. Студия шлёт сюда черновик
 * содержимого на каждую правку и просит прокрутить к разделу, который клиент
 * раскрыл в панели. Сообщения принимаются ТОЛЬКО от родительского окна и
 * ТОЛЬКО когда сайт действительно встроен — открытый напрямую сайт мост
 * игнорирует полностью.
 */

export const inStudioPreview: boolean =
  typeof window !== 'undefined' &&
  window.parent !== window &&
  new URLSearchParams(window.location.search).has('studio')

type Listener = (content: unknown) => void

export function onStudioMessage(listener: Listener): () => void {
  if (!inStudioPreview) return () => {}
  const handler = (e: MessageEvent) => {
    if (e.source !== window.parent || !e.data || typeof e.data !== 'object') return
    if (e.data.type === 'studio:content' && e.data.content && typeof e.data.content === 'object') {
      listener(e.data.content)
    }
    if (e.data.type === 'studio:scroll' && typeof e.data.anchor === 'string' && /^#[\w-]+$/.test(e.data.anchor)) {
      const target = document.querySelector(e.data.anchor)
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
      }
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

export function studioReady() {
  if (inStudioPreview) window.parent.postMessage({ type: 'studio:ready' }, '*')
}

/**
 * Путь к медиа из content.json -> адрес для <img src>.
 * В content.json пути относительные («uploads/ab12.webp», «img/hero.jpg»),
 * а сайт может жить в подпапке — дописываем BASE_URL сборки.
 */
export function media(path: string | undefined | null): string {
  if (!path) return ''
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  if (path.startsWith('/')) return path
  return import.meta.env.BASE_URL + path
}

export type BlogPost = { slug: string; title: string; excerpt: string; cover: string; date: string }

/** Свежие записи блога (blog/posts.json пишет Студия). Нет блога — пустой список. */
export function useBlogPosts(limit = 3): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([])
  useEffect(() => {
    let alive = true
    fetch(new URL('blog/posts.json', document.baseURI).href, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (alive && Array.isArray(data)) setPosts(data.slice(0, limit))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [limit])
  return posts
}

export function ruDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
