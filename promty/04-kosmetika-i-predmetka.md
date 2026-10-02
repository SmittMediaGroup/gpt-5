# Косметика и предметка

Жанр, где «дорого» достигается не затемнением, а чистотой: ровный фон, один предмет,
одна тень, одна цветная плоскость. Ошибка новичка — добавить «атмосферу»; каждая
добавленная деталь удешевляет кадр.

## Флакон на цветной плоскости

```
model: recraft_v4_1 | model_type: utility | aspect_ratio: 4:5
colors: ["#FF5A7A", "#FFF4E8"] | background_color: "#FFF4E8"
```

```
a frosted glass bottle with a matte cap standing on a thin horizontal ledge,
front view, product fills 50% of frame, centred, generous empty space above and below,
flat bright studio light, single soft contact shadow to the right,
matte finish, no reflections on the glass, no label text,
no text, no watermark, no logo
```

Проверка «дорого»: если убрать предмет, фон должен оставаться пригодным под заголовок.
Если фон пёстрый — кадр уже дешёвый.

## Текстура-мазок (крупно)

```
a thick swatch of coral cream smeared across a cream paper surface,
overhead macro, 100mm, f/8, swatch fills 70% of frame diagonally,
bright even light from above, fill ratio 1.5:1, no hard shadow,
palette: saturated coral #FF5A7A on warm cream #FFF4E8,
visible creamy texture and ridges, matte, no shine,
no text, no watermark
```

Текстура-мазок — самый дешёвый способ получить большое пятно чистого цвета
с «ручным» характером. Годится как фон секции и как подложка карточки.

## Раскладка (flat lay) с воздухом

```
overhead flat lay: three cosmetic items arranged in a loose triangle
on a pale sage surface #9FB79A, large empty space in the upper third,
items fill 40% of frame in total,
bright overcast daylight, soft short shadows pointing down-right,
palette: sage #9FB79A, cream #FFF4E8, one coral accent #FF5A7A,
crisp clean colour, no props, no text
```

Доля предмета 40% и пустая треть — это и есть «воздух». На раскладках, где предметы
занимают 70%+, дорого не бывает.

## Предмет в руке (без лица)

```
a hand holding a small jar, cropped at the wrist by the frame edge,
three-quarter view, 85mm, f/4, hand and jar fill 55% of frame,
soft window light from the left, white bounce right, fill ratio 2:1,
palette: warm skin, cream background #FFF4E8, coral lid #FF5A7A,
natural skin texture, short clean nails, no rings,
no text, no watermark
```

`cropped at the wrist` и `no rings` — против лишних пальцев и украшений, на которых
модели регулярно ломаются.

## Удаление фона вместо перегенерации

Если кадр хорош, а фон не тот — не генерируем заново:
`seedream_v5_pro` с `remove_bg: true`, затем фон ставится плашкой в вёрстке.
Это 1 генерация вместо 3–4 и гарантированно тот самый hex.
