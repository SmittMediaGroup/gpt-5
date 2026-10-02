# Видео-петли 3–5 секунд

Для лендинга нужны не ролики, а короткие петли: герой, карточки, разделители.
Петля в 3–5 с при 720p весит 150–600 КБ и грузится быстрее, чем длинное видео,
которое всё равно никто не досматривает.

## Схема, которая даёт бесшовную петлю

1. Генерируем кадр картинкой (`nano_banana_pro` / `recraft_v4_1`), 2–2,5 кредита.
2. Кадр одобрен → он же идёт в `minimax_h3` и как `start_image`, и как `end_image`.
   Начало и конец совпадают — стык не виден.
3. `duration: 4` (минимум модели), `resolution: 2K`, `batch_size: 1`.
4. Перекодируем под веб (см. ниже).

У `kling3_0_turbo` и `kling2_6` есть только `start_image` — бесшовной петли не выйдет.
Их берём, когда движение одностороннее (лепесток падает, пар поднимается), и зацикливаем
в вёрстке «туда-обратно».

## Промты движения

Движение описывается ОДНИМ действием. Два действия в промте — модель смешает и получится каша.

**Раскрытие бутона**

```
the peony slowly opens, petals unfurling outward, very slow continuous motion,
camera completely static, no zoom, no pan,
light stays constant and bright throughout, no flicker,
background unchanged
```

**Падающие лепестки**

```
loose petals drift downward slowly across the frame, gentle and even,
camera completely static, no zoom,
constant bright light, no change in exposure,
background unchanged
```

**Лёгкое дыхание кадра (для статичного героя)**

```
almost imperceptible movement: the flower breathes slightly, one petal trembles,
camera completely static, no zoom, no pan, no parallax,
constant light, no flicker
```

Последний приём — самый полезный: даёт «живой» герой без ощущения видео и без веса.

**Поворот предмета**

```
the bottle rotates slowly around its vertical axis, exactly 180 degrees,
camera static, product centred, constant flat studio light,
background unchanged, no reflections moving
```

## Обязательные стоп-слова для видео

```
camera completely static, no zoom, no pan, no dolly, no camera shake,
constant light, no flicker, background unchanged, no people entering the frame
```

Без этого модель «оживляет» кадр движением камеры, и петля перестаёт стыковаться.

## Перекодировка под веб

```
ffmpeg -i vhod.mp4 -t 4 -an -vf "scale=1280:-2:flags=lanczos,fps=25" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow \
  -movflags +faststart vyhod.mp4
```

| Что | Зачем |
|---|---|
| `-an` | звук не нужен; лишние килобайты и проблемы с автозапуском |
| `fps=25` | 25 вместо 30 — минус ~15% веса, глазом не видно |
| `crf 26` | для мягкого предметного кадра достаточно; на 23 вес растёт в 1,5 раза |
| `yuv420p` | иначе не играет в Safari |
| `+faststart` | moov в начало, иначе видео ждёт полной загрузки |
| `scale=1280` | на десктопе хватает; для телефона отдельный файл 720 |

Проверенные ориентиры веса по нашим же файлам (`C:\fitnessgo\projects\flower\site\public\media`):
`flower-opus-*.mp4` — 34–79 КБ за клип, `flower-bloom-mobile.mp4` — 2,0 МБ (это уже много,
см. бюджеты в `dannye/ves-i-mobilnye.md`).

## Если петля всё равно «дёргается»

Стык лечится в вёрстке, не перегенерацией: дублировать клип и склеить прямой с
развёрнутым (`ffmpeg -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1"`).
Получается палиндром — стык невозможен в принципе, вес растёт вдвое.
