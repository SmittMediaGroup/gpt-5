"""Проверка трёх главных цифр (+51 / +22 / −20 п.п.): Алиса против ChatGPT.

Стандартная библиотека. Два режима:
1) Без аргументов: пороговая таблица — при каком n разница значима (сырых чисел пока нет).
2) С аргументами k1 n1 k2 n2 [deff]: Уилсон для каждой доли, Ньюкомб для разности, вывод.
   Пример: python3 tri_cifry.py 26 40 5 40 1.5
"""
import math
import sys

Z = 1.959963984540054  # 95 %


def wilson(k, n, z=Z):
    if n <= 0:
        return (float("nan"),) * 3
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return p, max(0.0, c - h), min(1.0, c + h)


def newcombe(k1, n1, k2, n2, z=Z):
    """95 % интервал разности p1 − p2 (Ньюкомб, метод 10, на Уилсоне)."""
    p1, l1, u1 = wilson(k1, n1, z)
    p2, l2, u2 = wilson(k2, n2, z)
    d = p1 - p2
    lo = d - math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    hi = d + math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return d, lo, hi


def verdict(k1, n1, k2, n2, deff=1.0):
    """deff > 1 — повторы одних промптов: считаем на эффективном n = n / deff."""
    e1, e2 = n1 / deff, n2 / deff
    kk1, kk2 = k1 / deff, k2 / deff
    d, lo, hi = newcombe(kk1, e1, kk2, e2)
    sig = lo > 0 or hi < 0
    return d, lo, hi, sig


def min_n(diff, base, deff=1.0):
    """Минимальное n ответов на систему (равные группы), при котором интервал
    Ньюкомба для разности diff при доле base у меньшей группы не содержит 0."""
    p1, p2 = base + diff, base
    for n in range(5, 5000):
        e = n / deff
        d, lo, hi = newcombe(p1 * e, e, p2 * e, e)
        if lo > 0:
            return n
    return None


if __name__ == "__main__":
    if len(sys.argv) >= 5:
        k1, n1, k2, n2 = map(int, sys.argv[1:5])
        deff = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
        for name, k, n in (("Алиса", k1, n1), ("ChatGPT", k2, n2)):
            p, lo, hi = wilson(k, n)
            print(f"{name}: {k}/{n} = {p:.1%}  [95 % Уилсон: {lo:.1%} – {hi:.1%}]")
        d, lo, hi, sig = verdict(k1, n1, k2, n2, deff)
        print(f"Разность: {d * 100:+.1f} п.п.  [Ньюкомб, DEFF={deff}: {lo * 100:+.1f} … {hi * 100:+.1f}]")
        print("ЗНАЧИМА" if sig else "НЕ ЗНАЧИМА: интервал разности содержит 0")
        sys.exit(0)

    print("Порог n (ответов на КАЖДУЮ систему) для значимости разности, 95 %, Ньюкомб")
    print("| цифра | базовая доля у меньшей стороны | n (независимые) | n (2 повтора, DEFF 1,5) | n (3 повтора, DEFF 2,0) |")
    print("|---|---|---|---|---|")
    for label, diff in (("+51 п.п. (прокат авто)", 0.51), ("+22 п.п. (строительство домов)", 0.22), ("−20 п.п. (питомник)", 0.20)):
        for base in (0.05, 0.20, 0.30, 1 - diff - 0.5 * (1 - diff)):
            if base + diff > 0.999:
                continue
            row = [min_n(diff, base, f) for f in (1.0, 1.5, 2.0)]
            print(f"| {label} | {base:.0%} → {base + diff:.0%} | {row[0]} | {row[1]} | {row[2]} |")
