# -*- coding: utf-8 -*-
"""
Расчёты для рубрики «Барометр нейросетей». Только стандартная библиотека Python 3.
Запуск: python3 raschet_barometra.py
 1) интервалы Уилсона для выпуска №1 при n = 30/60/90 ответов на систему;
 2) двухвыборочный z-тест долей и точный тест Фишера: 43% vs 26%, 17% vs 15%;
 3) минимальный n, при котором 43 vs 26 значимо (с учётом эффекта дизайна и без);
 4) «правило трёх» для 0 упоминаний;
 5) индекс расхождения (ИР) + кластерный бутстрэп по промптам + шумовой порог
    (перестановка меток систем внутри промпта) — проверка на синтетических данных.
"""
import random
from math import sqrt, comb
from statistics import NormalDist

Z = NormalDist()
Z95 = Z.inv_cdf(0.975)


def wilson(x, n, z=Z95):
    if n == 0:
        return (0.0, 1.0)
    p = x / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0.0, c - h), min(1.0, c + h))


def ztest(x1, n1, x2, n2):
    """Двусторонний z-тест разности двух независимых долей (объединённая дисперсия)."""
    p1, p2 = x1 / n1, x2 / n2
    pp = (x1 + x2) / (n1 + n2)
    se = sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2))
    if se == 0:
        return 0.0, 1.0
    z = (p1 - p2) / se
    return z, 2 * (1 - Z.cdf(abs(z)))


def fisher(a, n1, b, n2):
    k, N = a + b, n1 + n2
    pr = lambda x: comb(n1, x) * comb(n2, k - x) / comb(N, k)
    po = pr(a)
    return sum(pr(x) for x in range(max(0, k - n2), min(k, n1) + 1) if pr(x) <= po * (1 + 1e-9))


def pct(v):
    return f"{v*100:.0f}"


def part_issue1():
    print("=== 1. Выпуск №1: интервалы Уилсона и тесты ===")
    print("| n | бренд | Алиса x/n | Алиса ДИ | ChatGPT x/n | ChatGPT ДИ | z-тест p | Фишер p |")
    for n in (30, 60, 90, 120):
        for name, pa, pc in (("Бобкэт Центр", .43, .26), ("СпецЛидер", .17, .15)):
            xa, xc = round(pa * n), round(pc * n)
            la, ha = wilson(xa, n)
            lc, hc = wilson(xc, n)
            _, pz = ztest(xa, n, xc, n)
            pf = fisher(xa, n, xc, n)
            print(f"| {n} | {name} | {xa}/{n} ({xa/n*100:.0f}%) | {pct(la)}–{pct(ha)}% | "
                  f"{xc}/{n} ({xc/n*100:.0f}%) | {pct(lc)}–{pct(hc)}% | {pz:.3f} | {pf:.3f} |")
    print()


def min_n(pa, pc, test, deff=1.0, nmax=20000):
    """Минимальный n ответов на систему, начиная с которого p<0,05 держится и дальше.
    Для eff. размера n_eff = n/deff (округление вниз)."""
    first = None
    for n in range(10, nmax + 1):
        ne = int(n / deff)
        xa, xc = round(pa * ne), round(pc * ne)
        p = test(xa, ne, xc, ne)
        if p < 0.05:
            if first is None:
                first = n
        else:
            first = None
    return first


def part_min_n():
    print("=== 2. С какого n разница значима (p<0,05, устойчиво для всех n дальше) ===")
    zt = lambda a, n1, b, n2: ztest(a, n1, b, n2)[1]
    for deff, lab in ((1.0, "независимые ответы"), (1.5, "m=2, ICC=0,5 (DEFF 1,5)"), (2.0, "m=3, ICC=0,5 (DEFF 2,0)")):
        print(f"43 vs 26, {lab}: z-тест n>={min_n(.43,.26,zt,deff,600)}, Фишер n>={min_n(.43,.26,fisher,deff,600)}")
    n1715 = min_n(.17, .15, zt, 1.0, 20000)
    print(f"17 vs 15, независимые ответы: z-тест n>={n1715} на систему")
    # нужная выборка с мощностью 80%
    za, zb = Z.inv_cdf(.975), Z.inv_cdf(.8)
    for p1, p2 in ((.26, .43), (.15, .17)):
        pb = (p1 + p2) / 2
        n = (za * sqrt(2 * pb * (1 - pb)) + zb * sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p1 - p2) ** 2
        print(f"n на систему для мощности 80%: {p1:.2f} vs {p2:.2f} -> {n:.0f}")
    print()


def part_zero():
    print("=== 3. Ноль упоминаний: правило трёх и Уилсон ===")
    for n in (30, 60, 90, 120):
        print(f"n={n}: 3/n = {3/n*100:.1f}%, верх Уилсона 95% = {wilson(0,n)[1]*100:.1f}%, "
              f"с DEFF 2 (n_eff={n//2}): 3/n_eff = {3/(n//2)*100:.1f}%")
    print()


# ---------- Индекс расхождения ----------

def shares(data, system, brands, prompts=None):
    """data: {prompt: {system: [set(brands), ...]}}. Доля ответов с упоминанием каждого бренда."""
    prompts = prompts if prompts is not None else list(data)
    tot = 0
    cnt = {b: 0 for b in brands}
    for p in prompts:
        for ans in data[p].get(system, []):
            tot += 1
            for b in brands:
                if b in ans:
                    cnt[b] += 1
    return {b: (cnt[b] / tot if tot else 0.0) for b in brands}, tot


def top_k(data, k, sa="alice", sb="chatgpt"):
    allb = set()
    for p in data:
        for s in (sa, sb):
            for ans in data[p].get(s, []):
                allb |= ans
    allb = sorted(allb)
    a, _ = shares(data, sa, allb)
    c, _ = shares(data, sb, allb)
    return sorted(allb, key=lambda b: -(a[b] + c[b]) / 2)[:k]


def index_ir(data, brands, prompts=None, sa="alice", sb="chatgpt"):
    a, _ = shares(data, sa, brands, prompts)
    c, _ = shares(data, sb, brands, prompts)
    return sum(abs(a[b] - c[b]) for b in brands) / len(brands) * 100  # п.п.


def bootstrap_ir(data, brands, B=2000, seed=1):
    """Кластерный бутстрэп по промптам (промпт перевыбирается целиком со всеми ответами).
    Возвращает (процентильный ДИ, «базовый» ДИ = 2*ИР - квантили, обрезанный снизу нулём).
    ИР смещён вверх (модуль шума > 0), процентильный ДИ из-за этого недопокрывает;
    базовый ДИ частично компенсирует смещение — его и публикуем."""
    rnd = random.Random(seed)
    ps = list(data)
    th = index_ir(data, brands)
    vals = sorted(index_ir(data, brands, [rnd.choice(ps) for _ in ps]) for _ in range(B))
    q_lo, q_hi = vals[int(0.025 * B)], vals[int(0.975 * B) - 1]
    return (q_lo, q_hi), (max(0.0, 2 * th - q_hi), 2 * th - q_lo)


def noise_floor(data, brands, B=1000, seed=2):
    """Шумовой порог: перемешиваем метки «Алиса/ChatGPT» между ответами внутри каждого промпта.
    Если систем-различий нет, ИР всё равно > 0 из-за случайности; 95-й перцентиль — порог."""
    rnd = random.Random(seed)
    vals = []
    for _ in range(B):
        d2 = {}
        for p, sysd in data.items():
            pool = sysd["alice"] + sysd["chatgpt"]
            rnd.shuffle(pool)
            na = len(sysd["alice"])
            d2[p] = {"alice": pool[:na], "chatgpt": pool[na:]}
        vals.append(index_ir(d2, brands))
    vals.sort()
    return vals[int(0.95 * B) - 1]


def synth(true_a, true_c, n_prompts=30, m=2, icc_like=0.5, seed=7):
    """Синтетика: у каждого промпта своя «склонность» к бренду (корреляция повторов)."""
    rnd = random.Random(seed)
    data = {}
    for i in range(n_prompts):
        data[i] = {"alice": [], "chatgpt": []}
        for s, tv in (("alice", true_a), ("chatgpt", true_c)):
            base = {b: (1 if rnd.random() < p else 0) for b, p in tv.items()}  # «память» промпта
            for _ in range(m):
                ans = set()
                for b, p in tv.items():
                    hit = base[b] if rnd.random() < icc_like else (rnd.random() < p)
                    if hit:
                        ans.add(b)
                data[i][s].append(ans)
    return data


SCEN = {
    "сильное расхождение": ({"A": .45, "B": .15, "C": .30, "D": .10, "E": .20},
                            {"A": .25, "B": .15, "C": .10, "D": .30, "E": .20}),
    "умеренное расхождение": ({"A": .40, "B": .15, "C": .30, "D": .10, "E": .20},
                              {"A": .30, "B": .20, "C": .25, "D": .15, "E": .20}),
    "расхождения нет": ({"A": .40, "B": .15, "C": .30, "D": .10, "E": .20},
                        {"A": .40, "B": .15, "C": .30, "D": .10, "E": .20}),
}


def part_index(R=100):
    print("=== 4. Индекс расхождения на синтетике (30 промптов x 2 повтора на систему) ===")
    brands = ["A", "B", "C", "D", "E"]
    for lab, (ta, tc) in SCEN.items():
        truth = sum(abs(ta[b] - tc[b]) for b in brands) / 5 * 100
        d = synth(ta, tc)
        top = top_k(d, 5)
        ir = index_ir(d, top)
        (plo, phi), (blo, bhi) = bootstrap_ir(d, top)
        nf = noise_floor(d, top)
        print(f"{lab}: истинный ИР={truth:.1f}; оценка={ir:.1f} п.п.; базовый ДИ [{blo:.1f}; {bhi:.1f}], "
              f"процентильный [{plo:.1f}; {phi:.1f}]; шумовой порог={nf:.1f}; выше порога: {ir > nf}")
    print(f"Покрытие 95%-интервалов на {R} синтетических прогонах (истинный ИР внутри ДИ):")
    for lab in ("сильное расхождение", "умеренное расхождение"):
        ta, tc = SCEN[lab]
        truth = sum(abs(ta[b] - tc[b]) for b in brands) / 5 * 100
        cp = cb = 0
        bias = 0.0
        for r in range(R):
            d = synth(ta, tc, seed=100 + r)
            (plo, phi), (blo, bhi) = bootstrap_ir(d, brands, B=400, seed=r)
            cp += plo <= truth <= phi
            cb += blo <= truth <= bhi
            bias += index_ir(d, brands) - truth
        print(f"  {lab}: процентильный {cp}/{R}, базовый {cb}/{R}; среднее смещение ИР +{bias/R:.1f} п.п.")
    print()


def part_issue_index():
    print("=== 5. ИР выпуска №1 (только 2 бренда, без сырых данных) ===")
    print(f"ИР_2 = (|43-26| + |17-15|)/2 = {(17+2)/2:.1f} п.п.")


if __name__ == "__main__":
    part_issue1()
    part_min_n()
    part_zero()
    part_index()
    part_issue_index()
