# Вес, скорость, телефон

## Сколько весят эталоны на самом деле

Замер 02.10.2026, окно 1440×900, Chrome, сумма `content-length` всех ответов за
первые ~8 секунд (сайты со стримящимся видео завышены — это «сколько утекло»,
а не вес документа).

| Сайт | Вес, КБ | Видео на первом экране | WebGL-холсты |
|---|---|---|---|
| jacquemus.com | 509 | 0 | 0 |
| lemonade.com | 574 | 0 | 0 |
| dixonbaxi.com | 737 | 0 | 0 |
| typology.com | 1 178 | 3 | 0 |
| tympanus.net/codrops | 1 559 | 0 | 0 |
| obys.agency | 1 555 | 0 | 1 |
| freddiesflowers.com | 1 708 | 0 | 0 |
| stripe.com | 1 959 | 0 | 1 |
| tonyschocolonely.com | 2 018 | 0 | 0 |
| loewe.com | 2 456 | 0 | 0 |
| mailchimp.com | 2 481 | 0 | 0 |
| buildinamsterdam.com | 3 132 | 1 | 0 |
| rarebeauty.com | 4 953 | 0 | 0 |
| innocentdrinks.co.uk | 5 813 | 1 | 0 |
| glossier.com | 6 263 | 2 | 0 |
| bloomandwild.com | 6 924 | 0 | 0 |
| figma.com | 8 032 | 0 | 0 |
| chobani.com | 8 155 | 0 | 0 |
| oddbox.co.uk | 8 328 | 1 | 0 |
| fentybeauty.com | 11 860 | 1 | 0 |
| drinkolipop.com | 12 466 | 0 | 0 |
| igloo.inc | 15 691 | 0 | 0 |
| lusion.co | 16 638 | 0 | 3 |
| marni.com | 17 602 | 1 | 0 |
| pentagram.com | 19 361 | 22 | 0 |
| drinkpoppi.com | 20 690 | 1 | 0 |
| hellomonday.com | 20 906 | 2 | 2 |
| koto.studio | 35 795 | 15 | 0 |
| oatly.com | 50 043 | 0 | 0 |
| farmgirlflowers.com | 59 932 | 1 | 0 |
| graza.co | 109 427 | 10 | 0 |

Два вывода, которые стоит прочитать дважды:

1. **Красочность не стоит мегабайт.** Tony's Chocolonely — красочность 128 при
   2 МБ. Dixon Baxi — красочность 51 при 737 КБ. А Graza с её 109 МБ по красочности
   30. Деньги на вес уходят в видео и каталоги, а не в «вау».
2. **WebGL в этом жанре почти не нужен.** Из 31 снятого сайта WebGL-холст нашёлся
   у четырёх (Stripe, Obys, Lusion, Hello Monday), библиотека `three` подгружалась
   у двух. Остальные — обычная вёрстка, видео и CSS. Это прямо снимает вопрос
   «нужен ли нам three.js»: нет.

## С чем сравнивать: медиана по вебу

HTTP Archive, срез 01.09.2026 (p50, КБ) — https://httparchive.org/reports/page-weight :

| Что | Десктоп | Телефон |
|---|---|---|
| вся страница | 2 994 | 2 629 |
| JavaScript | 773 | 689 |
| картинки | 1 040 | 880 |

Web Almanac 2025 (краулинг 07.2025) даёт 2 412 / 2 164 КБ —
https://almanac.httparchive.org/en/2025/page-weight

Главное наблюдение: **мобильная страница в медиане легче десктопной всего
на 10–12%** — то есть «мобильную лёгкость» почти никто не делает. Это наш зазор.

Систематического замера веса «награждённых» сайтов публично нет. Единственное
измерение — Greenspector, 10 сайтов номинации Awwwards Mobile Excellence, 2022:
betterup.com «более 12 МБ и >400 запросов при прокрутке»
(https://greenspector.com/en/resources/blog/analysis_sites_nominated_mobile_excellence_awwwards/).

## Наши бюджеты

| Что | Бюджет |
|---|---|
| первый экран целиком | ≤1,5 МБ |
| герой-видео, десктоп | ≤1,2 МБ |
| герой-видео, телефон | ≤600 КБ |
| одна петля в секции | ≤150 КБ |
| фотография (webp, q80) | ≤120 КБ |
| JS-бандл (gzip) | ≤180 КБ |
| шрифты | ≤120 КБ (2 переменных файла) |
| вся страница | ≤4 МБ |

Для сравнения — наши собственные файлы «Ноктюрна»:
`flower-opus-*.mp4` по 34–79 КБ (хорошо), `flower-bloom-mobile.mp4` 2,0 МБ и
`flower-bloom.mp4` 4,2 МБ (**выше бюджета втрое**), `flower-hero-169.mp4` 1,67 МБ.

## Core Web Vitals

| Метрика | Хорошо | Плохо |
|---|---|---|
| LCP | ≤2,5 с | >4,0 с |
| INP | ≤200 мс | >500 мс |
| CLS | ≤0,1 | >0,25 |

Пороги и методика: https://web.dev/articles/vitals

Что обычно роняет LCP на таких страницах: автозапуск видео без `poster`,
шрифт без `font-display: swap`, и картинка героя без `fetchpriority="high"`.

## Видео в герое: как правильно

```html
<video
  autoplay muted loop playsinline
  preload="none"
  poster="/media/hero.webp"
  class="h-full w-full object-cover">
  <source src="/media/hero-390.mp4" type="video/mp4" media="(max-width: 700px)">
  <source src="/media/hero-1280.mp4" type="video/mp4">
</video>
```

| Атрибут | Зачем |
|---|---|
| `muted` + `playsinline` | без них iOS не запустит автовоспроизведение |
| `poster` | то, что увидят в первую секунду; это и есть LCP-элемент |
| `preload="none"` | видео не конкурирует с постером за канал |
| `<source media=...>` | телефон получает свой файл, а не десктопный |

Кодек: h.264/MP4 обязателен как универсальный запасной — WebM/VP9 в iOS Safari
появился только с 17.4 (https://caniuse.com/webm), AV1 в Safari «частично»
с 17.0 (https://caniuse.com/av1). WebM/VP9 ставим первым `<source>`, MP4 вторым.

Цифры web.dev для короткой немой петли: `-crf 25` для libx264 (с `-b:v 0`) и
`-crf 41` для VP9; измеренный пример — GIF 3,7 МБ → MP4 551 КБ → WebM 341 КБ
(https://web.dev/articles/replace-gifs-with-videos). Битрейтных норм именно для
hero-петли никто не публикует — ориентируемся на CRF и на целевой вес в сотнях КБ.

Важная поправка про `preload`: по MDN атрибут — «a mere hint», и **`autoplay`
приоритетнее `preload`**, поэтому на автозапускающемся герое `preload="none"`
не спасёт (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video).
Само видео через `<link rel=preload>` предзагрузить нельзя — в списке `as` видео нет.

Политика iOS (первоисточник WebKit, https://webkit.org/blog/6784/new-video-policies-for-ios/):
автозапуск разрешён, если нет звуковой дорожки или стоит `muted`; видео должно
быть видимо, за пределами экрана воспроизведение ставится на паузу; `playsinline`
обязателен, иначе iPhone уводит в полный экран.

## Что показываем на телефоне вместо тяжёлого героя

1. Постер (webp, ≤120 КБ) + лёгкая петля ≤600 КБ, запускаемая **после** первого
   экрана через `IntersectionObserver`.
2. Либо вовсе статический кадр с медленным CSS-зумом (`transform: scale`) —
   весит ноль, выглядит живым.
3. Скраб-секции на телефоне отключаются: тач-скролл их рвёт.

## `prefers-reduced-motion`

```tsx
import { useReducedMotion } from 'motion/react'
const tihо = useReducedMotion()
// параллакс, скраб, автозапуск видео и бесконечные петли — только если !tihо
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Что гасим: параллакс, скраб по прокрутке, автозапуск видео, бесконечные петли,
«дыхание» фона. Что оставляем: смену непрозрачности ≤0,2 с и отклик кнопок —
без них интерфейс кажется сломанным.

Справка: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
и критерий WCAG 2.3.3 Animation from Interactions (уровень AAA, в примерах прямо
назван параллакс):
https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

**Юридически важнее другой критерий — WCAG 2.2.2 Pause, Stop, Hide, уровень A:**
любое движение, которое запускается само, длится дольше 5 секунд и идёт
параллельно с контентом, должно иметь способ остановить или скрыть его
(https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
Зацикленное hero-видео под это подпадает. Минимально достаточное решение —
остановка при `prefers-reduced-motion: reduce`; аккуратное — ещё и маленькая
кнопка паузы в углу героя.

Ещё одна мина: у Motion `<MotionConfig reducedMotion>` по умолчанию `"never"` —
библиотека системную настройку НЕ уважает, пока явно не поставить `"user"`
(https://motion.dev/docs/react-motion-config).

## Ленивая загрузка — порядок

1. Постер героя: `<link rel="preload" as="image" fetchpriority="high">`.
2. Шрифт заголовка: `<link rel="preload" as="font" crossorigin>` — один файл, не четыре.
3. Всё ниже первого экрана: `loading="lazy"` для картинок, `IntersectionObserver`
   для видео (ставить `src` только при приближении).
4. Тяжёлые секции — `React.lazy` + `Suspense`, чтобы не тащить их в первый бандл.
5. `LazyMotion` + компоненты `m.` вместо `motion.` — у Framer Motion это
   официальный способ урезать бандл: https://motion.dev/docs/react-lazy-motion
