# Яркий свет и насыщенный цвет вместо полумрака

Главный файл библиотеки. Наша системная ошибка: мы просим «кинематографично»,
и модель даёт то, чему её учили, — низкий ключ, одно пятно света, 60% кадра в тени.

Замер нашей витрины «Ноктюрн» (02.10.2026, снимки `C:\smg\data\higgsfield\out\laendingi\flower\sekcii`,
метрика красочности по Hasler & Susstrunk, 2003 — см. `dannye/zamer-cveta.md`):

| Секция | Красочность C | Средняя светлота L* | Площадь яркого цвета | Площадь тёмного (V<0,25) |
|---|---|---|---|---|
| герой (top) | 23,5 — «чуть красочно» | 25,4 | **1,9%** | **57,1%** |
| bloom | 53,1 — «средне» | 17,9 | 22,0% | 61,1% |
| hands | 18,8 | 29,7 | 0,2% | 62,1% |
| finale | 26,4 | 23,7 | 2,7% | 50,3% |

Красочность ниже 33 — это «чуть красочно». Владелец называет это «полумрак», и он прав:
яркого цвета в герое меньше двух процентов площади.

## Словарь: что писать

Свет (ставить в промт обязательно, иначе модель решит сама):

| Пишем | Что даёт |
|---|---|
| `high-key lighting` | светлый кадр, тени мягкие и светлые — противоположность нашей проблеме |
| `large diffused softbox, 1.5 m, from front-left` | названный размер источника = мягкая граница тени |
| `white bounce card on the right, fill ratio 2:1` | тень не чернеет; отношение ключ/заполняющий 2:1 — светлый кадр, 8:1 — драма |
| `bright overcast daylight, 6000K` | ровный дневной свет без драмы |
| `sunlit window light, soft, late morning` | тёплый, но светлый |
| `background one stop brighter than the subject` | фон светлее предмета — предмет «вырезается» и не тонет |
| `no deep shadows, shadow areas stay above 20% luminance` | прямой запрет на провалы |
| `clean white studio, seamless cyclorama` | фон не крадёт цвет |

Цвет:

| Пишем | Что даёт |
|---|---|
| `saturated coral #FF5A7A against warm cream #FFF4E8` | насыщенность названа и привязана к hex |
| `two-colour scheme: one saturated accent, one light neutral` | модель не тащит пять цветов |
| `colour on the subject, background desaturated` | правильный порядок: гасим фон, а не поджигаем предмет |
| `crisp, clean colour, no colour cast` | убирает жёлтую или синюю вуаль |
| `pastel surround, one vivid focal colour` | дорогой контраст: приглушённое поле + одно пятно |

Оптика и фактура (добавляют «дорого» без затемнения):

`100mm macro`, `f/5.6`, `shallow but not extreme depth of field`,
`visible water droplet with specular highlight`, `fine paper grain`,
`matte surface, no plastic shine`, `natural film grain`.

## Словарь: что НЕ писать

Эти слова в 2026 году однозначно уводят в темноту. Проверено на нашем же проекте —
именно от них «Ноктюрн» стал ночным:

```
moody, cinematic lighting, dramatic lighting, chiaroscuro, low-key,
film noir, candlelit, night, dark background, black backdrop,
rim light on black, teal and orange, moody atmosphere, mysterious,
smoky, foggy, volumetric light rays in darkness, velvet darkness,
deep shadows, high contrast dramatic
```

Отдельно: `cinematic` без уточнения — всегда темнее, чем хочется. Если нужна
«киношность» в светлом кадре, пишем `editorial, magazine still life, high-key`.

Так же опасны модели с киношным уклоном: `soul_cinematic`, `cinematic_studio_2_5`,
`cinematic_studio_image` — у них темнота в описании модели («dramatic», «film»),
и промт её не перебивает. Для яркой предметки берём `recraft_v4_1` (с палитрой),
`nano_banana_pro`, `seedream_v5_pro`, `flux_2`.

## Проверенный словарь (со ссылками на первоисточники)

Токены ниже подтверждены официальными гайдами или страницей с отрендеренными
примерами — это не наши догадки.

**Свет, который гарантированно даёт светлый кадр**

`high-key lighting` · `bright` · `ultrabright` · `bright and airy` · `well-lit` ·
`evenly lit` · `brightly illuminated` · `luminous` · `clear daylight` · `sunlit` ·
`soft diffused daylight` · `soft window light` · `overcast light` · `softbox lighting` ·
`large softbox` · `white bounce card` · `bounce fill` · `flat lighting` ·
`minimal shadows` · `no harsh shadows` · `near-shadowless, even illumination` ·
`slightly overexposed` · `clamshell lighting` (косметика) ·
`backlit translucent petals` (цветы на просвет) · `specular highlight`

Источники: страница Lighting со сравнительными рендерами по каждому токену —
https://github.com/willwulfken/MidJourney-Styles-and-Keywords-Reference (путь
`Pages/MJ_V4/Style_Pages/Just_The_Style/Lighting.md`); словарь света Black Forest
Labs, где `overcast` прямо назван подходящим для предметки —
https://docs.bfl.ai/guides/prompting_unified_reference ; определение high-key
«low lighting ratio, near 1:1 between key and fill, so shadows barely register» —
https://prompt-architects.com/blog/206-lighting-vocabulary-for-ai-image-prompts-40-terms ;
готовые формулировки «белый фон» — https://scalio.app/prompts/white-background-product-photography/

**Фон**

`pure white #FFFFFF seamless background` (самая сильная одиночная формулировка) ·
`white seamless sweep` · `white cyclorama` · `clean light gray studio surface` ·
`minimalist composition with generous negative space` · `flat white background`

**Цвет**

`vibrant saturation` · `vivid colors` · `pastel tones` · `high dynamic range` ·
`clean sharp` · и фиксация палитры прямо в hex: `#RRGGBB` — это официально
поддержано FLUX.2 (https://docs.bfl.ai/guides/prompting_guide_flux2).
Дисциплина из гайда Kling: порядок **палитра → свет → камера** и максимум
2–4 дескриптора, не стакать пять цветовых прилагательных —
https://kling.ai/blog/kling-ai-video-color-prompts-mood-guide

**Почему модели вообще уводят в темноту**

«Models default to moody, low-light renders because so much of their training
imagery is dramatic photography» — https://zsky.ai/blog/ai-image-too-dark-fix

## Готовые заготовки

**Яркая предметка, светлый фон, один акцент**

```
a single coral peony, petals half open, one water drop on the outer petal,
extreme close-up, 100mm macro, f/5.6, subject fills 70% of frame,
high-key lighting: large diffused softbox from front-left, white bounce card right,
fill ratio 2:1, 5600K daylight, no deep shadows,
palette: saturated coral #FF5A7A, warm cream #FFF4E8, fresh green #4FA860,
seamless warm cream background #FFF4E8 one stop brighter than the subject,
matte cold-pressed paper surface, fine grain,
sharp focus on petal edge, no text, no watermark, no logo
```

**Цветное поле под заголовок (плашка, не фотография)**

```
flat colour field, deep coral #FF5A7A, with a single large peony in the lower right
corner cropped by the frame edge, top-left 60% of the frame left empty for text,
bright even light, no gradient banding, subtle paper texture,
no text, no watermark
```

**Раскладка «цвет пятнами»**

```
overhead flat lay: five peony heads in a loose row, alternating coral #FF5A7A
and cream white #FFF4E8, on a mid-tone sage surface #9FB79A,
bright overcast daylight from above, soft even shadows, fill ratio 2:1,
subjects fill 55% of frame, generous empty margin at the top,
crisp clean colour, natural grain, no text
```

## Если кадр всё равно вышел тёмным

Не переписываем промт пятый раз — доводим файлом. Цифры проверены на наших же
кадрах, команды целиком в `dannye/grading-ffmpeg.md`:

```
ffmpeg -i vhod.png -vf "eq=brightness=0.06:contrast=1.06:saturation=1.12,
curves=all='0/0.04 0.5/0.56 1/1',unsharp=5:5:0.6" vyhod.png
```

`curves` с точкой `0/0.04` — приподнятый чёрный: тени перестают быть провалами.
`0.5/0.56` — середина светлее, кадр «раскрывается». `saturation=1.12` — предел,
выше начинают гореть лепестки (проверять по каналу: красный не должен уходить в 255).
