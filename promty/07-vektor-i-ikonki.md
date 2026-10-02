# Вектор, иконки, плоская графика

Для иконок и плоских иллюстраций берём `recraft_v4_1` с `model_type: vector`
или `utility_vector` — он один отдаёт результат в векторной манере и принимает
палитру параметром.

## Набор иконок в одной палитре

```
model: recraft_v4_1 | model_type: vector | aspect_ratio: 1:1 | resolution: 1k
colors: ["#FF5A7A", "#4FA860", "#14181A"] | background_color: "#FFF4E8"
```

```
a single flat line icon of a flower stem in a vase, geometric, two colours,
uniform stroke width, centred, generous padding around the icon,
no gradient, no shadow, no 3D, no text
```

Правила, без которых набор не соберётся:
1. **Одна иконка на генерацию.** Просьба «сделай 6 иконок» даёт лист, который
   потом не нарезать чисто.
2. **`uniform stroke width`** в каждом промте — иначе толщина линии гуляет,
   и набор выглядит собранным с миру по нитке.
3. **Одинаковый `colors` и `background_color`** на весь набор, без исключений.
4. **`generous padding`** — иначе иконки обрезаны по-разному и не выстраиваются в ряд.

Опыт 01.10.2026 (реестр `ledger.json`): набор из 7 иконок под демо «Заявка-маршрут»
собрался с 2–3 попыток на иконку по 2,5 кредита; расхождение толщины линии было
главной причиной перегенерации.

## Плоская иллюстрация-пятно

```
model_type: vector
a large abstract flower shape, flat colour, no outline, organic silhouette,
filling 80% of the frame, off-centre to the right,
two colours only, no gradient, no shadow, no text
```

Такие пятна — дешёвый способ сделать «цветной блок» секции, который не конкурирует
с фотографией и масштабируется без веса (SVG).

## Логотип / монограмма

```
model_type: vector
a minimal monogram mark made of two overlapping petal shapes,
single colour, geometric, perfectly symmetrical, thick uniform stroke,
centred with wide padding, no text, no letters, no gradient
```

`no letters` обязательно: модели пишут буквы с ошибками, а в логотипе это заметно.
Буквенную часть ставим шрифтом в вёрстке.

## Что потом с файлом

Вектор приходит растром или SVG в зависимости от варианта. SVG прогоняем через
`svgo`, лишние группы и `style` вычищаем, цвета заменяем на `currentColor` —
тогда иконка перекрашивается CSS-ом и один файл работает на светлом и на цветном фоне.
