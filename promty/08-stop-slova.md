# Стоп-слова: чего не писать никогда

Единый список. Если кадр пришёл тёмным, мутным или «как у всех» — почти всегда
в промте есть что-то отсюда.

## Уводят в темноту

```
moody · cinematic lighting · dramatic lighting · chiaroscuro · low-key
film noir · candlelit · by candlelight · night scene · dark background
black backdrop · velvet black · deep shadows · high contrast dramatic
rim light on black · volumetric light rays · god rays · smoky · foggy
mysterious atmosphere · dutch master still life · rembrandt lighting
teal and orange grade · moody colour grade
```

Отдельно: слово `cinematic` само по себе. В 2026 году оно означает «тёмное
с оранжево-бирюзовым грейдом» — то есть ровно то, от чего мы уходим.

## Делают кадр дешёвым

```
hyperrealistic · ultra detailed · 8k · 4k uhd · masterpiece · award winning
trending on artstation · professional photography · stunning · beautiful
vibrant colors (без указания каких именно) · colorful explosion
bokeh · lens flare · glowing · neon · magical · dreamy · ethereal
```

Это слова-пустышки: они ничего не задают, но съедают внимание модели и тянут
за собой стоковую эстетику. Вместо `ultra detailed` — конкретика:
`every petal edge sharp`, `visible paper fibre`.

## Ломают композицию

```
full body · wide shot · epic scale · panoramic (если нужен предмет крупно)
busy background · lots of props · surrounded by flowers
```

Нам нужен предмет на 50–75% кадра и пустое поле под текст. Любое слово,
расширяющее сцену, работает против этого.

## Приводят к браку

```
hands (без кадрирования) · holding (без уточнения) · model wearing
reading a book · with text on the label · signboard · poster
```

Руки и текст — главные источники артефактов. Либо кадрируем
(`cropped at the wrist`), либо запрещаем (`no text, no letters`).

## Обязательный хвост промта

```
no text, no watermark, no logo, no caption, no signature
```

И для видео дополнительно:

```
camera completely static, no zoom, no pan, no camera shake, constant light, no flicker
```

## Проверка перед отправкой

1. Есть ли в промте слово про свет? Если нет — модель решит сама и будет темно.
2. Назван ли фон цветом и hex?
3. Указана ли доля кадра под предмет?
4. Стоит ли хвост `no text, no watermark`?
5. Нет ли в промте ни одного слова из этого файла?

Пять проверок занимают полминуты и экономят 2–3 перегенерации по 2 кредита.
