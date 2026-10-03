# hero-kit — «кино-герой» для вау-лендингов (03.10.2026)

Переиспользуемый комплект: видео-герой «рекламный ролик», который играет один раз и
замирает в стоп-кадр с невидимым стыком, текст ЗА предметом, частицы-орбита,
киноплёнка (grain/scrim/bloom/rings/spot/виньетка) и hairline-интерфейс.
Жанр и промты: `C:\smg\docs\vau-lendingi\kino-geroi\РЕЦЕПТЫ-КИНО.md`.

Стек: React 19 + TypeScript, чистый CSS (без three.js; Tailwind и Framer Motion не
нужны — совместимо с ними). Подключение: скопировать `src/*` и `hero-kit.css`
в проект лендинга (`lendingi-vau/<slug>/src/herokit/`) — пакета намеренно нет,
каждый лендинг волен подкрутить слои под себя.

## Использование

```tsx
import { VideoFreezeHero, OrbitParticles, FilmLayers, HairlineUI } from './herokit'
import './herokit/hero-kit.css'

<VideoFreezeHero
  videoSrc="/media/hero.mp4"          // одно событие, 4–8 с, БЕЗ loop
  videoWebm="/media/hero.webm"        // необязательно, легче ~30%
  posterSrc="/media/poster.webp"      // герой-стилл = ПОСЛЕДНИЙ кадр видео
  cutoutSrc="/media/cutout.png"       // вырезка предмета (rembg) — текст уйдёт за него
  maskCenter={[50, 58]}               // где предмет в кадре, %
  headline={<h1>ИИ&#8209;сотрудники</h1>}
  particles={<OrbitParticles count={14} center={[50, 58]} />}
  onPhase={(p) => p === 'frozen' && /* запустить вход текста/цифр */ null}
>
  <FilmLayers rings={2} center={[50, 58]} />
  <HairlineUI
    brand="SMG"
    links={[{ label: 'Роли', href: '#roli' }, { label: 'Цена', href: '#cena' }]}
    cta={{ label: 'Разбор 30 минут', href: '#forma' }}
    hint={<>ролик сгенерирован ИИ · результат проверяет человек</>}
  />
</VideoFreezeHero>
```

Токены (переопределить в css страницы): `--hk-bg`, `--hk-text`, `--hk-accent`,
`--hk-bloom`, `--hk-hairline`, `--hk-grain-opacity`, `--hk-scrim-*`.

## Как устроен невидимый стык

1. `posterSrc` обязан пиксельно совпадать с последним кадром видео (рецепты А/Б из
   РЕЦЕПТЫ-КИНО.md §3: либо видео генерируется К стиллу через end frame, либо стилл
   достаётся из видео ffmpeg-ом).
2. Постер лежит слоем ПОД видео и виден мгновенно (нет белой вспышки при загрузке).
3. На `ended` последний кадр дорисовывается в canvas (страховка от сброса кадра
   браузером), видео гаснет за 140 мс → под ним тот же кадр. Стык невидим.
4. Автоплей запрещён / `prefers-reduced-motion` / `disableVideo` → сразу `frozen`:
   страница полноценна и без видео (стилл + частицы + плёнка).

Фазы: `poster → playing → frozen`; текущая — в `data-phase` на секции и в `onPhase`
(вешать вход цифр/подзаголовка на `frozen`, не на таймер).

## Конвейер ассетов (ffmpeg / rembg)

```bash
# последний кадр видео → постер (если видео первично)
ffmpeg -sseof -0.05 -i hero_raw.mp4 -frames:v 1 -q:v 1 poster.png
# постер в webp
ffmpeg -i poster.png -q:v 82 poster.webp
# вырезка предмета для «текста за предметом»
python -m pip install rembg && rembg i poster.png cutout.png
# сжать ролик (цель < 3–5 МБ, звук убрать)
ffmpeg -i hero_raw.mp4 -an -vf "scale=1600:-2,fps=24" -c:v libx264 -preset slow \
  -crf 23 -pix_fmt yuv420p -movflags +faststart hero.mp4
ffmpeg -i hero.mp4 -c:v libvpx-vp9 -b:v 0 -crf 34 -an hero.webm
# реверс (событие «куски собираются в предмет» генерировать как взрыв)
ffmpeg -i vzryv.mp4 -vf reverse -an sborka.mp4
```

## Правила (из замеров и ТЗ)

- Герой `100svh`; на 390px предмет держать в центральной трети (`object-fit: cover`).
- Видео НЕ в бюджете первого кадра: постер-webp ≤ 200 КБ показывается сразу.
- Один залитый элемент на экран (CTA), остальной UI — hairline 1px.
- Частицы детерминированы по индексу — без случайности между рендерами.
- Текст и интерфейсы в генерацию не отправлять; заголовок — всегда DOM.
- Телефон: решить по трафику — либо `disableVideo` на <640px, либо оставить
  (7 с ~2 МБ терпимо на LTE); постер обязателен в обоих случаях.
