# -*- coding: utf-8 -*-
"""
Расчёты к metodika/audit-v2.md (только стандартная библиотека Python 3).
Запуск: python3 raschet_audit_v2.py. Проверено 2026-09-25.
"""
import random
from math import sqrt
from statistics import NormalDist, mean

Z = NormalDist().inv_cdf(0.975)   # 1.95996
ZB = NormalDist().inv_cdf(0.80)   # 0.84162


def wilson(x, n, z=Z):
    if n == 0:
        return (0.0, 1.0)
    p = x / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return max(0.0, c - h), min(1.0, c + h)


def deff(m, icc):
    return 1 + (m - 1) * icc


def n_two(p1, p2):
    pb = (p1 + p2) / 2
    return (Z * sqrt(2 * pb * (1 - pb)) + ZB * sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p1 - p2) ** 2


def mde(p1, n_eff):
    p2 = p1
    while p2 < 0.999:
        p2 += 0.001
        if n_two(p1, p2) <= n_eff:
            return p2 - p1
    return float("nan")


def newcombe(x1, n1, x2, n2):
    """95% ДИ для разности p1-p2 (Ньюкомб, метод 10, гибрид Уилсона)."""
    p1, p2 = x1 / n1, x2 / n2
    l1, u1 = wilson(x1, n1)
    l2, u2 = wilson(x2, n2)
    d = p1 - p2
    lo = d - sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    hi = d + sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return d, lo, hi


def z_test(x1, n1, x2, n2):
    p1, p2 = x1 / n1, x2 / n2
    p = (x1 + x2) / (n1 + n2)
    se = sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    zz = (p1 - p2) / se
    return zz, 2 * (1 - NormalDist().cdf(abs(zz)))


def holm(pvals):
    order = sorted(range(len(pvals)), key=lambda i: pvals[i])
    m = len(pvals)
    adj = [0] * m
    run = 0
    for rank, i in enumerate(order):
        run = max(run, min(1, (m - rank) * pvals[i]))
        adj[i] = run
    return adj


def icc_anova(clusters):
    """clusters: список списков 0/1 одинаковой длины m. ICC(1) по однофакторному ANOVA."""
    k = len(clusters); m = len(clusters[0])
    grand = mean(v for c in clusters for v in c)
    msb = m * sum((mean(c) - grand) ** 2 for c in clusters) / (k - 1)
    msw = sum((v - mean(c)) ** 2 for c in clusters for v in c) / (k * (m - 1))
    return (msb - msw) / (msb + (m - 1) * msw)


def cluster_bootstrap(clusters, B=5000, seed=1):
    rnd = random.Random(seed)
    k = len(clusters)
    est = []
    for _ in range(B):
        s = [clusters[rnd.randrange(k)] for _ in range(k)]
        est.append(sum(map(sum, s)) / sum(map(len, s)))
    est.sort()
    return est[int(0.025 * B)], est[int(0.975 * B) - 1]


def plan_row(k, m, icc=0.5):
    n = k * m
    ne = n / deff(m, icc)
    lo, hi = wilson(0.3 * ne, ne)
    _, up0 = wilson(0, ne)
    return n, ne, (hi - lo) / 2 * 100, up0 * 100, 3 / ne * 100, mde(0.10, ne) * 100, mde(0.30, ne) * 100


def main():
    print("=== 1. Планы на ОДНУ генеративную систему, ICC=0,5 ===")
    for k, m in ((45, 2), (60, 2), (90, 2), (120, 2), (60, 3)):
        n, ne, hw, up0, r3, m10, m30 = plan_row(k, m)
        print(f"{k}x{m}: n={n} n_eff={ne:.0f} ±{hw:.1f} пп; 0 упом.: Уилсон≤{up0:.1f}%, 3/n_eff={r3:.1f}%; MDE от10%=+{m10:.0f}, от30%=+{m30:.0f}")
    print("чувствительность ICC для 60x2 и 120x2:")
    for k in (60, 120):
        for icc in (0.3, 0.7):
            n, ne, hw, *_ , m10, m30 = plan_row(k, 2, icc)
            print(f"  {k}x2 ICC={icc}: n_eff={ne:.0f} ±{hw:.1f} MDE10=+{m10:.0f} MDE30=+{m30:.0f}")

    print("\nДвухуровневая корреляция: интент -> 2 перефразы -> 2 повтора, rho1 (повторы)=0,5")
    print("DEFF = 1 + (r-1)*rho1 + r*(q-1)*rho2, r=2 повтора, q=2 перефразы")
    for n in (120, 240):
        for rho2 in (0.0, 0.2, 0.3):
            D = 1 + (2 - 1) * 0.5 + 2 * (2 - 1) * rho2
            ne = n / D
            lo, hi = wilson(0.3 * ne, ne); _, u0 = wilson(0, ne)
            print(f"  n={n} rho2={rho2}: DEFF={D:.1f} n_eff={ne:.0f} ±{(hi-lo)/2*100:.1f} пп, 0 упом.<={u0*100:.1f}%, MDE10=+{mde(0.1, ne)*100:.0f} MDE30=+{mde(0.3, ne)*100:.0f}")

    print("\n=== 2. Пример Уилсона 12/90 ===")
    x, n = 12, 90
    p = x / n; z2 = Z * Z
    print(f"p={p:.5f}; z^2={z2:.5f}; z^2/n={z2/n:.5f}; знам=1+z^2/n={1+z2/n:.5f}")
    print(f"центр числ = p+z^2/2n = {p + z2/(2*n):.5f}; центр={ (p+z2/(2*n))/(1+z2/n):.5f}")
    print(f"p(1-p)/n={p*(1-p)/n:.6f}; z^2/4n^2={z2/(4*n*n):.6f}; корень={sqrt(p*(1-p)/n+z2/(4*n*n)):.5f}")
    print(f"полуширина = {Z*sqrt(p*(1-p)/n+z2/(4*n*n))/(1+z2/n):.5f}")
    lo, hi = wilson(x, n); print(f"ДИ = {lo*100:.2f}–{hi*100:.2f}%")
    # с кластеризацией: 45 промптов x 2, ICC 0.5
    ne = n / deff(2, 0.5); xe = x / deff(2, 0.5)
    lo2, hi2 = wilson(xe, ne); print(f"DEFF=1,5 -> n_eff={ne:.0f}, x_eff={xe:.0f}: ДИ {lo2*100:.2f}–{hi2*100:.2f}%")
    # наивный Вальд для сравнения
    se = sqrt(p*(1-p)/n); print(f"Вальд: {100*(p-Z*se):.2f}–{100*(p+Z*se):.2f}%")

    print("\n=== 3. Пример ICC и бутстрэпа на синтетических данных 45x2 ===")
    # 45 промптов: 4 с упоминанием в обоих повторах, 4 в одном из двух, 37 без
    clusters = [[1, 1]] * 4 + [[1, 0]] * 4 + [[0, 0]] * 37
    xs = sum(map(sum, clusters)); ns = sum(map(len, clusters))
    print(f"x={xs} n={ns}; ICC={icc_anova(clusters):.3f}; DEFF={deff(2, icc_anova(clusters)):.2f}")
    lo, hi = cluster_bootstrap(clusters); print(f"кластерный бутстрэп ДИ {lo*100:.1f}–{hi*100:.1f}%")
    lo, hi = wilson(xs, ns); print(f"Уилсон без поправки {lo*100:.1f}–{hi*100:.1f}%")
    d = deff(2, icc_anova(clusters)); lo, hi = wilson(xs / d, ns / d); print(f"Уилсон с n_eff {lo*100:.1f}–{hi*100:.1f}%")

    print("\n=== 4. Сравнения ===")
    # до/после: 12/90 -> 27/90 (45x2, ICC .5 -> n_eff 60)
    for (a, b) in ((12, 27), (12, 20)):
        zz, pv = z_test(a, 90, b, 90)
        dd, l, h = newcombe(a, 90, b, 90)
        de = 1.5
        zze, pve = z_test(a / de, 90 / de, b / de, 90 / de)
        dd2, l2, h2 = newcombe(a / de, 90 / de, b / de, 90 / de)
        print(f"{a}/90 vs {b}/90: наивно z={zz:.2f} p={pv:.4f} Ньюкомб {dd*100:.1f} [{l*100:.1f};{h*100:.1f}] | c DEFF1,5: z={zze:.2f} p={pve:.4f} Ньюкомб [{l2*100:.1f};{h2*100:.1f}]")
    # пересечение интервалов при значимой разнице
    a, b = 30, 50
    la, ha = wilson(a, 120); lb, hb = wilson(b, 120); zz, pv = z_test(a, 120, b, 120)
    print(f"30/120 [{la*100:.1f};{ha*100:.1f}] vs 50/120 [{lb*100:.1f};{hb*100:.1f}] p={pv:.4f}")
    print("Критическая наблюдаемая разница (|z|=1,96, независимые группы, общий p):")
    for ne in (57, 80, 114, 160):
        print("  n_eff", ne, ", ".join(f"p≈{pb}: {Z*sqrt(2*pb*(1-pb)/ne)*100:.1f} пп" for pb in (0.1, 0.15, 0.3, 0.5)))
    ps = [0.004, 0.012, 0.03, 0.04, 0.2]
    print("Холм:", ps, "->", [round(v, 3) for v in holm(ps)])
    print("Правило трёх: n=60 ->", round(3/60*100, 1), "%; n=90 ->", round(3/90*100, 1), "%; n=120 ->", round(3/120*100, 1))
    print("точная граница (1-0.05^(1/n)): n=60", round((1-0.05**(1/60))*100, 2), "n=80", round((1-0.05**(1/80))*100, 2))


# ===== Стоимость =====
USD = 84.9057  # ЦБ РФ на 25.09.2026


def cost():
    print("\n=== 5. Стоимость одного ответа (₽) ===")
    tin = (100, 300); tout = (400, 800)
    rows = {}
    def tok(pin, pout):  # ₽ за 1000 токенов
        return (tin[0] * pin + tout[0] * pout) / 1000, (tin[1] * pin + tout[1] * pout) / 1000
    rows["YandexGPT Lite (0,2 вх/вых)"] = tok(0.2, 0.2)
    rows["YandexGPT Lite (0,2 вх/0,4 вых)"] = tok(0.2, 0.4)
    rows["YandexGPT Pro 5.1 (0,8)"] = tok(0.8, 0.8)
    rows["YandexGPT Pro (1 вх/2 вых)"] = tok(1, 2)
    rows["Alice AI LLM (0,5/2)"] = tok(0.5, 2)
    rows["GenSearch (5,08 за запрос)"] = (5.08, 5.08)
    rows["GigaChat Lite (пакет 0,065)"] = tok(0.065, 0.065)
    rows["GigaChat Lite (0,4)"] = tok(0.4, 0.4)
    rows["GigaChat Pro (пакет 0,5)"] = tok(0.5, 0.5)
    rows["GigaChat Pro (1,5)"] = tok(1.5, 1.5)
    rows["GigaChat Max (пакет 0,65)"] = tok(0.65, 0.65)
    rows["GigaChat Max (3)"] = tok(3, 3)
    # OpenAI: $/1M; поиск $10/1000 вызовов; поисковый контент 5k-15k вх. токенов по цене модели; 1-2 вызова
    def oai(pin, pout, calls=(1, 2), sc=(5000, 15000)):
        lo = (tin[0] * pin + tout[0] * pout + sc[0] * calls[0] * pin) / 1e6 + 0.01 * calls[0]
        hi = (tin[1] * pin + tout[1] * pout + sc[1] * calls[1] * pin) / 1e6 + 0.01 * calls[1]
        return lo * USD, hi * USD
    rows["OpenAI GPT-5.6 Terra + web search"] = oai(2, 12)
    rows["OpenAI GPT-5.6 Luna + web search"] = oai(0.2, 1.2)
    rows["OpenAI GPT-5.6 Sol ($5/$30) + web search"] = oai(5, 30)
    rows["Perplexity Search API ($5/1000)"] = (0.005 * USD, 0.005 * USD)
    def sonar(pin, pout, fee):
        return ((tin[0]*pin + tout[0]*pout)/1e6 + fee[0]) * USD, ((tin[1]*pin + tout[1]*pout)/1e6 + fee[1]) * USD
    rows["Perplexity Sonar ($1/$1 + $5–12/1000)"] = sonar(1, 1, (0.005, 0.012))
    rows["Perplexity Sonar Pro ($3/$15 + $6–14/1000)"] = sonar(3, 15, (0.006, 0.014))
    for k, (a, b) in rows.items():
        print(f"{k}: {a:.3f}–{b:.3f} ₽")
    return rows


def audit_cost(rows):
    print("\n=== 6. Стоимость API на аудит ===")
    # (небрендовых промптов, повторов, брендовых промптов x 1 повтор)
    plans = {"19 900 (30 интентов x 2 перефразы x 2 повт. + 10 брендовых)": (60, 2, 10),
             "39 900 (60 интентов x 2 перефразы x 2 повт. + 20 брендовых)": (120, 2, 20)}
    base = {
        "YandexGPT Pro 5.1": "YandexGPT Pro (1 вх/2 вых)",
        "GenSearch (прокси «Поиска с Алисой»)": "GenSearch (5,08 за запрос)",
        "GigaChat Max": "GigaChat Max (3)",
        "OpenAI GPT-5.6 Terra + поиск": "OpenAI GPT-5.6 Terra + web search",
    }
    for name, (k, m, br) in plans.items():
        n = k * m + br
        tot_lo = tot_hi = 0
        print(name, f"ответов на систему {n} (из них в долю {k*m}), генеративных всего {4*n}")
        for lab, key in base.items():
            lo = rows[{"YandexGPT Pro 5.1": "YandexGPT Pro 5.1 (0,8)", "GigaChat Max": "GigaChat Max (пакет 0,65)"}.get(lab, key)][0] * n
            hi = rows[key][1] * n
            tot_lo += lo; tot_hi += hi
            print(f"  {lab}: {lo:.0f}–{hi:.0f} ₽")
        px = rows["Perplexity Search API ($5/1000)"][0] * k * 2
        tot_lo += px; tot_hi += px
        print(f"  Perplexity Search API ({k*2} запросов): {px:.0f} ₽")
        print(f"  ИТОГО переменные: {tot_lo:.0f}–{tot_hi:.0f} ₽; +20% на пилот/перезапуски: до {tot_hi*1.2:.0f} ₽")


if __name__ == "__main__":
    main()
    r = cost()
    audit_cost(r)
