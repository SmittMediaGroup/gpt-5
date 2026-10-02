# Как устроен промт под предметный кадр

## Порядок полей — всегда один

```
[1 предмет и его состояние] , [2 крупность и оптика] , [3 свет] ,
[4 палитра] , [5 фон] , [6 фактура и материал] , [7 техническое]
```

Модель читает начало промта сильнее конца. Поэтому предмет — первым словом,
свет — в первой половине, технические слова — в конце. Длина 35–60 слов:
короче — модель додумывает свет сама (и уводит в полумрак), длиннее — поля
начинают конфликтовать.

| Поле | Что писать | Пример |
|---|---|---|
| 1 предмет | что это, сколько, в каком состоянии | `a single coral peony, petals half open, one drop of water on the outer petal` |
| 2 крупность | кадр + объектив + диафрагма | `extreme close-up, 100mm macro, f/5.6, subject fills 70% of frame` |
| 3 свет | тип источника + размер + направление + температура | `large diffused softbox from front-left, white bounce card on the right, 5600K daylight, soft shadows` |
| 4 палитра | 2–3 цвета словами и в hex | `palette: coral pink #FF5A7A, warm cream #FFF4E8, fresh leaf green #4FA860` |
| 5 фон | ровный, светлый, названный цветом | `seamless warm cream background #FFF4E8, no props` |
| 6 фактура | материал, на котором стоит/лежит | `matte cold-pressed paper surface, fine grain` |
| 7 техническое | резкость, зерно, отсутствие текста | `sharp focus on the petal edge, natural film grain, no text, no watermark, no logo` |

Структура совпадает с тем, что предписывают официальные гайды моделей:
Black Forest Labs — `Subject + Action + Style + Context (+ Lighting + Technical)`
(https://docs.bfl.ai/guides/prompting_guide_flux2, https://github.com/black-forest-labs/skills);
Recraft — `A <style> of <main content>. <details>. <background>. <style description>.`
(https://www.recraft.ai/blog/how-to-craft-prompts-for-accurate-ai-generated-images);
Kling для видео — `Subject + Subject Movement + Scene (+ Camera + Lighting + Atmosphere)`
(https://kling.ai/quickstart/text-to-video-prompt-guide); Higgsfield — «subject →
details → environment → style» и правило «Say what you want, not what you don't»
(https://higgsfield.ai/creator-hub/help-center/getting-started/how-do-i-write-a-good-prompt).

## Негативные промты: где есть, где нет

| Модель | Негативы | Как писать |
|---|---|---|
| FLUX.2 | **не поддерживает** | только утвердительно: `sharp focus throughout`, а не `no blur` |
| Recraft | **поддерживает** отдельным полем | в поле негатива — голые существительные: `apples`, а не `no apples` |
| Gemini / Nano Banana | «semantic negative prompts» | описывать желаемое, а не запрещённое |

Из этого следует правило: **хвост `no text, no watermark` работает не везде**.
Он безвреден, но полагаться на него нельзя — лучше дополнительно описать,
что должно быть: `clean unlabelled packaging`, `plain surface`.

## Что указывать всегда

1. **Соотношение сторон параметром, а не словами.** `aspect_ratio: "9:16"` для телефона,
   `"16:9"` или `"3:2"` для десктопа, `"4:5"` для карточек. Слова `vertical`, `portrait`
   в промте модель тратит на композицию, а не на размер кадра.
2. **Фон назван цветом и hex.** «Светлый фон» модель понимает как «серый». Нужен
   `seamless background #FFF4E8`.
3. **Доля кадра, которую занимает предмет** — `subject fills 60–75% of frame`. Без этого
   приходят общие планы, где предмет мелкий, а значит и цвет не читается.
4. **Запрет на текст** в конце: `no text, no watermark, no logo, no caption`. Модели
   любят дописывать подписи на упаковке.

## Жёсткая палитра: только Recraft

`recraft_v4_1` — единственная модель в нашем доступе, которая принимает палитру
параметром: `colors` (до 10 значений `#RRGGBB`) и `background_color`. Если нужен
предмет точно в цвете бренда — идём через неё, а не через словесное описание цвета.

```json
{
  "model": "recraft_v4_1",
  "prompt": "a single coral peony seen from above, petals half open, extreme close-up",
  "aspect_ratio": "4:5",
  "params": {
    "model_type": "utility",
    "resolution": "2k",
    "colors": ["#FF5A7A", "#FFF4E8", "#4FA860"],
    "background_color": "#FFF4E8"
  }
}
```

`model_type` выбирается так: `utility` — ровная предметка и мокапы (фронтально,
предсказуемо), `standard` — выразительный кадр с воздухом, `vector` / `utility_vector` —
иконки и плоские illustration-ы в SVG-подобной манере.

## Петля вместо «видео»

Для сайта нужны не ролики, а петли 3–5 с. Делаются так: сначала кадр картинкой
(2–2,5 кредита), потом этот кадр уходит в `minimax_h3` как `start_image`, и — если
нужна настоящая петля — тот же файл подаётся вторым, как `end_image`. Начало совпадает
с концом, стык не виден. У `kling3_0_turbo` и `kling2_6` роль только `start_image`,
петли из них не получится — у них берём «движение в одну сторону» и зацикливаем
в вёрстке через `playbackRate` + `direction: alternate` на уровне CSS-слоя.

## Повторяемость

Одинаковый кадр в серии (пять букетов в одном свете) держится не промтом, а
референсами: первый одобренный кадр подаётся в `image_references` у `nano_banana_pro`
или `seedream_v5_pro`, и в промте остаётся только то, что меняется. Про единое лицо
и серии — отдельный опыт в `C:\StableDiffusion\docs\единое-лицо-персонажа.md`:
тот же принцип, параметры важнее слов.
