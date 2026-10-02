# Цветы и букеты

Наша основная тема. Пион, роза, эустома, эвкалипт — предмет сам яркий, и задача
промта не «добавить красоты», а не дать модели утопить цвет в тени.

## Герой первого экрана, вертикаль под телефон

```
model: nano_banana_pro | aspect_ratio: 9:16 | resolution: 2k
```

```
one coral peony in full bloom filling 75% of the frame, petals layered and open,
seen slightly from above, 100mm macro, f/5.6,
high-key lighting: large diffused softbox front-left, white bounce right, fill ratio 2:1,
5600K daylight, soft open shadows, no deep shadows,
palette: saturated coral #FF5A7A, warm cream #FFF4E8, fresh green #4FA860,
seamless cream background #FFF4E8 slightly brighter than the flower,
visible dew drops with small specular highlights,
sharp focus on the inner petals, natural grain, no text, no watermark
```

Что меняется под десктоп: `aspect_ratio: 16:9`, `subject fills 55% of frame,
generous empty space on the left for the headline`. Пустое поле под заголовок
просится **явно**, иначе цветок встанет по центру и текст ляжет на лепестки.

## Букет целиком

```
a hand-tied bouquet of coral peonies, white lisianthus and silver eucalyptus,
held by two hands at the bottom edge of the frame, three-quarter view,
85mm, f/4, bouquet fills 60% of frame,
bright overcast daylight from a large window, white room, fill ratio 2:1,
palette: coral #FF5A7A, cream #FFF4E8, sage #9FB79A,
plain warm white wall background, soft even shadow on the wall,
crisp clean colour, no colour cast, natural grain, no text
```

Грабля: `held by hands` часто даёт шесть пальцев. Либо кадрируем руки по запястью
(`hands cropped at the wrist by the frame edge`), либо убираем их вовсе
(`bouquet standing in a clear glass vase`).

## Лепестки в движении (исходник под петлю)

```
loose coral peony petals falling against a clean cream background #FFF4E8,
shot from the front, petals spread across the frame, some out of focus in the foreground,
bright even studio light, high-key, no deep shadows,
palette: coral #FF5A7A and cream #FFF4E8 only,
motion blur on two petals only, everything else sharp,
no text, no watermark
```

Кадр потом уходит в `minimax_h3` как `start_image` **и** `end_image` — получается
бесшовная петля (см. `06-video-petli.md`).

## Макро «внутрь цветка»

```
extreme macro into the centre of a coral peony, petal spiral filling the whole frame,
100mm macro, f/8, focus stacked, every petal edge sharp,
bright diffused light from directly above, fill ratio 2:1, no shadow wells,
palette: saturated coral #FF5A7A deepening to raspberry #D4426A in the centre,
pollen specks catching light, fine velvet petal texture,
no text, no watermark
```

Это единственный кадр, где глубина цвета нарастает к центру — «дорогой» эффект
без затемнения всего кадра: темнеет 10% площади, а не 60%.

## Раскладка карточек (пять букетов одной серией)

Первый кадр генерируем промтом, остальные четыре — по референсу:

```
model: seedream_v5_pro | medias: [первый одобренный кадр в image_references]
prompt: same framing, same light, same background, replace the flowers with
white lisianthus and green eucalyptus, keep the vase and the shadow identical
```

Так пять карточек встают в один свет. Разными промтами они не встанут никогда —
это проверено на серии `flower-buket-1..5.webp`.

## Чего не писать про цветы

`moody floral`, `dark romantic bouquet`, `gothic flowers`, `black background`,
`candlelit still life`, `dutch master painting` (последнее особенно: голландский
натюрморт — это чёрный фон и один луч, ровно наша болезнь).
