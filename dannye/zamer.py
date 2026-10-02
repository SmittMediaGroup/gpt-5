# -*- coding: utf-8 -*-
"""Числовой разбор первого экрана по снимку.

Считает:
  * colorfulness по Hasler & Susstrunk (2003) — метрика «красочности»;
  * среднюю яркость (L* по sRGB -> Lab приближённо) и среднюю насыщенность HSV;
  * долю площади: насыщенные пиксели (S>=0.35), полунасыщенные, нейтральные (S<0.12);
  * долю тёмных пикселей (V<0.25) — «полумрак»;
  * доминирующие цвета (квантование до 8) с hex и процентом площади.

Запуск: python analyze.py <папка со снимками или файл> [...]
"""
from __future__ import annotations

import colorsys
import glob
import json
import os
import sys

import numpy as np
from PIL import Image


def colorfulness(a: np.ndarray) -> float:
    """Hasler & Susstrunk, «Measuring colorfulness in natural images», 2003."""
    r, g, b = a[..., 0].astype(float), a[..., 1].astype(float), a[..., 2].astype(float)
    rg = r - g
    yb = 0.5 * (r + g) - b
    return float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2))


def verdikt(c: float) -> str:
    for porog, name in [
        (15, "не красочно"),
        (33, "чуть красочно"),
        (45, "умеренно"),
        (59, "средне"),
        (82, "довольно красочно"),
        (109, "очень красочно"),
    ]:
        if c < porog:
            return name
    return "предельно красочно"


def srgb_to_lin(x: np.ndarray) -> np.ndarray:
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)


def razbor(path: str) -> dict:
    im = Image.open(path).convert("RGB")
    im.thumbnail((640, 640))
    a = np.asarray(im)
    f = a.astype(np.float32) / 255.0

    mx = f.max(axis=2)
    mn = f.min(axis=2)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    v = mx

    lin = srgb_to_lin(f)
    Y = lin[..., 0] * 0.2126 + lin[..., 1] * 0.7152 + lin[..., 2] * 0.0722
    L = np.where(Y > 0.008856, 116 * np.cbrt(Y) - 16, 903.3 * Y)

    q = im.quantize(colors=8, method=Image.MEDIANCUT)
    pal = q.getpalette()[: 8 * 3]
    counts = np.bincount(np.asarray(q).ravel(), minlength=8)
    total = counts.sum()
    dom = []
    for i in np.argsort(-counts)[:6]:
        if counts[i] == 0:
            continue
        rr, gg, bb = pal[i * 3 : i * 3 + 3]
        h, ss, vv = colorsys.rgb_to_hsv(rr / 255, gg / 255, bb / 255)
        dom.append(
            {
                "hex": "#%02x%02x%02x" % (rr, gg, bb),
                "dolya_%": round(100 * counts[i] / total, 1),
                "S": round(ss, 2),
                "V": round(vv, 2),
                "H": round(h * 360),
            }
        )

    c = colorfulness(a)
    return {
        "fayl": os.path.basename(path),
        "colorfulness": round(c, 1),
        "verdikt": verdikt(c),
        "L_sredn": round(float(L.mean()), 1),
        "S_sredn": round(float(s.mean()), 3),
        "nasyshchennye_%": round(float((s >= 0.35).mean() * 100), 1),
        "yarkiy_cvet_%": round(float(((s >= 0.40) & (v >= 0.50)).mean() * 100), 1),
        "polunasyshch_%": round(float(((s >= 0.12) & (s < 0.35)).mean() * 100), 1),
        "neytralnye_%": round(float((s < 0.12).mean() * 100), 1),
        "temnye_V<0.25_%": round(float((v < 0.25).mean() * 100), 1),
        "svetlye_V>0.85_%": round(float((v > 0.85).mean() * 100), 1),
        "dominanty": dom,
    }


def main() -> None:
    paths: list[str] = []
    for arg in sys.argv[1:]:
        if os.path.isdir(arg):
            paths += sorted(glob.glob(os.path.join(arg, "*.png"))) + sorted(glob.glob(os.path.join(arg, "*.jpg")))
        else:
            paths += sorted(glob.glob(arg))
    out = []
    for p in paths:
        try:
            r = razbor(p)
        except Exception as e:  # noqa: BLE001
            r = {"fayl": os.path.basename(p), "oshibka": str(e)[:120]}
        out.append(r)
        print(
            "%-44s C=%-6s L=%-5s vivid=%-5s neutral=%-5s dark=%-5s"
            % (
                r.get("fayl", "")[:44],
                r.get("colorfulness", "-"),
                r.get("L_sredn", "-"),
                r.get("yarkiy_cvet_%", "-"),
                r.get("neytralnye_%", "-"),
                r.get("temnye_V<0.25_%", "-"),
            )
        )
    dst = os.environ.get("CVET_OUT", "cvet-razbor.json")
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print("->", dst)


if __name__ == "__main__":
    main()
