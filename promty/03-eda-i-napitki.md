# Еда и напитки

Самая «цветная» тема: продукт яркий, фон можно делать плоским цветным полем.
Приём, который берут Oatly, Poppi, Olipop, Graza — продукт на **плоской заливке**
фирменного цвета, без студийной сцены. Это и дешевле в генерации, и читается дороже.

## Банка/бутылка на плоской цветной заливке

```
model: recraft_v4_1 | model_type: utility | aspect_ratio: 4:5 | resolution: 2k
colors: ["#FF5A7A", "#FFF4E8", "#4FA860"] | background_color: "#FF5A7A"
```

```
a slim beverage can standing centred, front view, no label text,
product fills 55% of frame, large empty margin above,
flat even studio light, soft contact shadow under the can only,
clean matte background, no gradient, no reflections,
no text, no watermark, no logo
```

`model_type: utility` здесь важен: он даёт фронтальный, ровный, предсказуемый кадр —
то, что нужно для карточки товара. `standard` уводит в «художественность».

## Брызги и всплеск

```
a splash of pink grapefruit juice frozen mid-air next to a glass,
high-speed capture, droplets sharp, 100mm, f/8,
bright high-key lighting, two large softboxes left and right, fill ratio 1.5:1,
white seamless background one stop brighter than the subject,
palette: vivid grapefruit pink #FF5A7A, pale cream #FFF4E8,
every droplet has a specular highlight,
no text, no watermark
```

Отношение 1.5:1 (почти равные источники) — то, что даёт «рекламный», а не «киношный»
свет. Для драмы берут 8:1, нам нельзя.

## Разрез фрукта, фактура

```
a halved blood orange lying flat on a saturated cobalt blue surface #2F5BEA,
overhead view, fruit fills 45% of frame, off-centre to the right,
bright diffused daylight from above, soft short shadow,
palette: blood orange red #E8402A, cobalt #2F5BEA, nothing else,
juicy translucent flesh, visible texture, water drops on the surface,
crisp clean colour, no text
```

Два насыщенных цвета рядом работают только когда они **контрастны по светлоте**:
оранжевый L*≈60, кобальт L*≈42. Два одинаково светлых насыщенных цвета рядом
вибрируют и читаются дёшево — это и есть «аляповато».

## Десерт/выпечка крупно

```
a slice of pistachio cake on a cream ceramic plate, three-quarter view,
85mm, f/4, dessert fills 50% of frame,
soft window light from the left, white bounce right, fill ratio 2:1,
palette: pistachio green #7BA05B, cream #FFF4E8, raspberry #D4426A,
crumbs and one raspberry beside the slice, matte surface,
bright airy mood, no deep shadows, no text
```

## Группа товаров (линейка)

```
five identical cans in a row, evenly spaced, front view, each a different flavour colour,
flat even light, no shadows between cans, products fill 60% of frame width,
plain background #FFF4E8,
palette: coral #FF5A7A, cobalt #2F5BEA, pistachio #7BA05B, amber #E0A03C, cream #FFF4E8,
no text, no watermark, no logo
```

Для линейки `recraft_v4_1` с явным `colors` — единственный надёжный путь: иначе
пять «разных» цветов придут случайными и палитра рассыплется.

## Чего не писать про еду

`rustic dark wood table`, `moody food photography`, `dark and moody`, `chiaroscuro`,
`candlelight dinner`, `vintage film look` — всё это стандартный «тёмный фуд» 2018 года.
Нам нужен `bright editorial food photography, high-key, flat colour background`.
