# Фоны, фактуры и цветные плашки

Фон — половина ощущения «дорого». Правило: фон либо **плоский цвет**, либо
**одна фактура без сюжета**. Фон с содержанием спорит с текстом и удешевляет страницу.

## Плоское цветное поле под заголовок

Генерировать не обязательно: плашку дешевле сделать CSS-ом. Генерация нужна, когда
нужна фактура (бумага, ткань, краска).

```
model: recraft_v4_1 | model_type: utility | aspect_ratio: 16:9
colors: ["#FF5A7A"] | background_color: "#FF5A7A"
```

```
a flat even field of colour with a very subtle cold-pressed paper texture,
no objects, no gradient, no vignette, uniform brightness across the whole frame,
no text, no watermark
```

Важно `no vignette`: модели почти всегда затемняют края, и из-за этого плашка
на сайте выглядит «грязной» по краям.

## Фактура бумаги / ткани / краски

```
extreme close-up of cold-pressed watercolour paper, warm cream #FFF4E8,
even flat lighting from the front, no shadows, no objects,
fine fibre texture visible, uniform across the frame, seamless and tileable,
no text, no watermark
```

Варианты второй строки: `raw linen weave, sage green #9FB79A` /
`thick acrylic paint stroke texture, coral #FF5A7A` / `matte ceramic glaze surface`.

## Окружение (комната, мастерская) — только `soul_location`

```
model: soul_location | aspect_ratio: 21:9
```

```
a bright flower workshop interior, large north-facing windows, white walls,
wooden worktable with scattered stems, daylight flooding the room,
no people, wide empty wall on the left for text,
bright airy atmosphere, high-key, no deep shadows, crisp clean colour
```

`soul_location` не принимает параметров и референсов — только текст. Зато умеет
21:9 и 9:21, что удобно для широких полос-разделителей.

## Градиент, который не выглядит дёшево

Градиент лучше делать в CSS, а не генерацией: получится без бандинга и весит ноль.
Правила дорогого градиента — в `dannye/palitry.md`; коротко: две ступени, разница
по тону не больше 40°, интерполяция `in oklch`, сверху зерно 2–3% непрозрачности.

Если градиент всё-таки нужен картинкой:

```
a smooth two-stop gradient from coral #FF5A7A to warm amber #E0A03C,
diagonal from top-left to bottom-right, no banding, no texture, no objects,
even and clean, no text
```

## Разделитель-полоса

```
a horizontal band of loose coral peony petals scattered on a cream surface,
overhead view, petals occupy the lower half only, upper half empty cream,
bright even light, no shadows, aspect 21:9,
palette: coral #FF5A7A, cream #FFF4E8,
no text, no watermark
```

## Чего не писать про фоны

`bokeh background`, `moody gradient`, `dark vignette`, `smoke`, `fog`,
`abstract 3D render` — всё это шум, который конкурирует с текстом и быстро устаревает.
