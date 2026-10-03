# Scrolltide.co до дна — вторая волна разведки (03.10.2026, без регистрации)

Дополняет `РЕЦЕПТЫ-КИНО.md` §6. Здесь: конспекты ВСЕХ 11 уроков академии, что видно в
бесплатных шаблонах без входа, и вердикт по $29 одним словом.

## Вердикт по $29/мес одним словом: **НЕ НУЖНО**

Развёрнуто: $29/мес даёт только «Fair use: 10 premium templates copy / week» + полный
исходный код core-библиотеки. **3D-шаблоны и шейдер-фоны в Monthly НЕ входят** — они
только в Yearly $129 и Lifetime $239 (это уточнение второй волны: первая волна думала,
что $29 даёт core целиком — нет, core без 3D/шейдеров). Возвратов нет («All sales are
final»). Вся методика восстановлена из бесплатной академии и уже лежит в hero-kit;
премиум-промты — это ~12 000 знаков арт-дирекшена, который мы и так пишем сами под
ЯРКИЕ поля (их промты — тёмные, «Ground #0A0A0B», нам всё равно переписывать).
Цены: Monthly $29 (обычно $49), Yearly $129 (обычно $299), Lifetime $239 (обычно $699),
лицензия «Personal & client use» на всех платных тарифах.

## Академия: все 11 уроков (конспекты, бесплатно, без входа)

### 1. Build an animated website from one prompt (Start here)
Workflow из 5 шагов: выбрать дизайн ПО ОТРАСЛИ (не по вкусу) → скопировать полный промт
→ вставить в AI-редактор (Lovable / Claude Code / Cursor / v0) → **дать билду дойти до
конца не перебивая** → править маленькими точечными шагами по одному.
Ключ: «A one-line brief gives the model nothing to be specific about, so it returns the
statistical average» — детальный промт с layout-зонами, типографикой, таймингами
анимаций ломает «среднестатистический» результат.
Запреты: не резать длинный промт; не перебивать билд; не описывать чувства
(«make it more premium») — описывать ИЗМЕНЕНИЯ.

### 2. Interactive landing free with Google Antigravity (Beginner)
Персонаж следит головой за курсором. 6 шагов: референсы с Pinterest (layout и
типографика, НЕ цвета) → персонаж в Gemini на ОДНОТОННОМ фоне («a plain background
matters more than the character does») → image2video «subtle motion — a slight head
turn, a breath, a shift in weight» → обрезать до 2–3 с из СЕРЕДИНЫ ролика (бесшовный
луп) → скормить Antigravity клип + референс, попросить КОНКРЕТНО «the head should
follow the pointer» → полировка (отступы, вес шрифта, мобильная).
Главный урок: **порядок ассетов жёсткий** — image → video → trim → build; в обратном
порядке всё переделывается.

### 3. AI-generated video hero (Intermediate) — НАШ ЖАНР
Пайплайн «prepare, animate, clean, host, then build» (разобран в РЕЦЕПТЫ-КИНО §4).
Дополнения второй волны: референсы собирать на ВСЕ секции до старта; стилл в ChatGPT
с «a clear area where the headline will sit» и контрастом под текст; движение
«restrained motion: drifting cloud, a slow push, light moving across a surface»;
видео передавать Клоду ССЫЛКОЙ (URL), не файлом; секции строить по одной,
доводя каждую до идеала («Hero first, and finished»).

### 4. Spotlight hover-reveal (Intermediate)
Два ПОЧТИ ИДЕНТИЧНЫХ изображения друг над другом + мягкая круглая маска за курсором.
Генерация: «explicitly instruct that the pose, the lighting and the framing stay
pixel-identical to the first image» — иначе reveal виден как скачок. Параметры из
урока: **радиус 260px, перо (feather) от ~40%** для лица; настройка «change one number
per pass so you can tell what moved». Сначала статичная вёрстка, потом интеракция.
Суть: сложность не в коде, а в подготовке картинок.

### 5. Switching AI tools mid-build (Intermediate)
Правило: «Failures that vary → keep refining the prompt. Failures that repeat
identically → change tools». Ставить бюджет попыток. Пример: hover-reveal не дался
Google AI Studio/Gemini → перенесли в Claude Code. Про ассеты: смотреть PNG «at full
size, on the background it will actually sit on. Artifacts hide well on white»;
артефакт чинить в ФАЙЛЕ (rembg и т.п.), а не костылём в коде.

### 6. Cursor-reactive site / физика занавеса (Intermediate)
«Gates of Hell»: текст-занавес с физикой реагирует на курсор. Стек: Pinterest →
ChatGPT (арт) → Claude Code (Opus). Главный перенимаемый приём — **визуальный дебаг**:
«Screenshot the broken state and paste it in. Name one specific difference between
what you see and what you want» — сходится там, где пере-описывание цели не сходится.
Слои: ворота отдельным PNG на прозрачном, фон отдельно; параметры физики вынести
в контролы для тюнинга; звук — последним.

### 7. 3D portal scroll (Intermediate)
Иллюзия глубины БЕЗ 3D: «three flat images arranged in space and moved at different
rates» — параллакс из 3 слоёв: фон (full-bleed), портал (PNG с дырой), передние
облака (PNG). «Depth comes from moving them at different rates… only possible if they
are separate files». Ближние слои быстрее. Next.js, выравнивание по референсу.

### 8. Scroll-scrubbing animation (Advanced)
«video cannot be seeked frame-accurately on the web» → видео конвертируется в
СЕКВЕНЦИЮ КАДРОВ, скролл выбирает кадр. Контент: одно непрерывное движение (пуш
камеры, вращение, пролёт), без склеек — «читатель управляет плейхедом».
**60–120 кадров на секцию** — стартовая норма. Обязательно: прелоад кадров до
появления секции и отрисовка в CANVAS (не подмена src у img).

### 9. 300-frame scroll character site (Advanced)
300 кадров, персонаж ИЗОЛИРОВАН от сцены («isolate your subject so it can be animated
independently of its scene») — можно пинить и передавать между секциями. Стек:
Pinterest → ChatGPT → Gemini (видео) → **Ezgif** (нарезка кадров) → Claude Code.
Число кадров считать от ДЛИНЫ СКРОЛЛА (чтобы последний кадр лёг на отпуск пина),
а не от длины клипа. Урок про дебаг: «the page renders again» ≠ баг починен.

### 10. Perfect loop + scroll frames (Advanced) — КЛЮЧЕВОЙ ДЛЯ СТЫКА
Google Flow, Veo 3.1: **start frame = end frame = один и тот же файл** → «The model
then generates a clip that travels through the motion and arrives back exactly where
it began», луп «seamless by construction rather than by luck». 7 стадий: референс
покадрово → ChatGPT превращает стиллы в описание движения → чистые старт/энд кадры
БЕЗ motion blur → генерация с совпадающими кадрами → экспорт **192 WebP max quality**
→ секции по одной в Claude Code (референс на каждую) → дебаг. Стек: Pinterest,
ChatGPT, Google Flow, Claude Code, Framer Motion. «Treating it as one is how you get
a site where every section is slightly wrong».

### 11. Procedural 3D, no models (Advanced)
Трёхфазный порядок: «Geometry first — shapes and positions, flat shading / Shaders
second — glass, metal, light / Scroll last — nothing moves until it looks right
standing still». Референсы — на ДЕТАЛИ (отдельные части камеры), не на готовый
продукт. «Getting something impressive on screen is the first ten percent. The
remaining ninety is the polish». Фон — не последняя мысль: замена серого на звёздное
поле «changed the whole impression instantly». Claude Code (Opus) + WebGL-шейдеры.

## Бесплатные шаблоны — что видно без входа

- **Glacier** (hero, free): «Slow, monumental motion — built for brands that move
  deliberately and want to look unshakeable». Полноэкранный постер: «everything
  centred, everything deliberate, one statement given the entire viewport»; навигацию
  и фичи — НЕ сюда («turns an event into a website»). Стек: React, Vite, Motion.
- **Monsoon** (hero, free): «Atmospheric hero… motion builds like weather rolling in» —
  SaaS устойчивости/инцидентов; давление без паники, в центре композиция спокойная.
  Советуют конкретные метрики (uptime, время восстановления) вместо эпитетов.
- **Aurora** (hero, free): разобран первой волной (РЕЦЕПТЫ-КИНО §6).
- **Fluxora** (лендинг, free): «Amber light raking across a visor, a headline that
  breaks to italic serif on the word doing the work, and the proof stacked
  underneath it». Приём «курсив на РАБОТАЮЩЕМ слове заголовка» — забрать себе.
- Сами ПРОМТЫ без регистрации не выдаются (кнопка «Get the prompt» за бесплатным
  аккаунтом) — но вся их структура восстановлена: см. РЕЦЕПТЫ-КИНО §6 «Анатомия»
  и кадр рилса 694 (видна вставка в Claude: «Implement exactly as specified below.
  Do NOT simplify or change anything», «ASSETS — download them, do not hotlink»,
  файлы tokens/base/navbar/hero(mask,spot,bloom,rings,scrim,grain)/copy/bar/hint/
  collection + META/SEO).

## Что из этого берём себе (сухой остаток)

1. Стык: start=end frame — «бесшовность по построению» (уже проверено нашей сменой:
   kling3_0 pro 5s silent start=end — 8,75 кр, см. ИНСТРУМЕНТЫ-СТЫКА.md).
2. Дисциплина: промт одним сообщением → не перебивать → точечные правки; «describe
   WHAT to change»; скриншот сломанного состояния + ОДНО отличие.
3. Порядок ассетов: image → video → trim → build. Герой первым и до конца.
4. Повторяющиеся одинаковые фейлы = менять инструмент, не промт.
5. Артефакты чинить в файле ассета; смотреть PNG на ЦЕЛЕВОМ фоне (у нас — яркое поле!).
6. Курсив на работающем слове заголовка (Fluxora) — дешёвый приём дороговизны.
7. Скролл-скраб при желании: 60–120 кадров WebP, canvas, прелоад (на будущее, не MVP).
