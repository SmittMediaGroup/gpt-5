# -*- coding: utf-8 -*-
"""Сколько цветовых семей держит первый экран.

Семья = группа доминант, у которых тон H отличается не больше чем на 30 градусов.
Считаются только «цветные» доминанты: S>=0.25 и V>=0.30, доля площади >=3%.
"""
import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

cvet = {}
for f in ['cvet.json', 'cvet2.json']:
    if os.path.exists(f):
        for r in json.load(open(f, encoding='utf-8')):
            cvet[r['fayl']] = r


def semyi(rec, s_min=0.25, v_min=0.30, dolya_min=3.0, shag=30):
    cvetnye = [d for d in rec.get('dominanty', [])
               if d['S'] >= s_min and d['V'] >= v_min and d['dolya_%'] >= dolya_min]
    gr = []
    for d in sorted(cvetnye, key=lambda x: -x['dolya_%']):
        for g in gr:
            raznica = min(abs(d['H'] - g['H']), 360 - abs(d['H'] - g['H']))
            if raznica <= shag:
                g['dolya'] += d['dolya_%']
                g['cveta'].append(d['hex'])
                break
        else:
            gr.append({'H': d['H'], 'dolya': d['dolya_%'], 'cveta': [d['hex']]})
    return gr


if __name__ == '__main__':
    tab = json.load(open('tablica.json', encoding='utf-8'))
    out = []
    for r in tab:
        if r.get('C') is None:
            continue
        rec = None
        for k, v in cvet.items():
            if k.startswith(r['host']) and not k.endswith('-390.png'):
                rec = v
                break
        if not rec:
            continue
        g = semyi(rec)
        out.append({'host': r['host'], 'C': r['C'], 'semey': len(g),
                    'cveta': [(x['cveta'][0], round(x['dolya'], 1)) for x in g]})
    out.sort(key=lambda x: -x['C'])
    for o in out:
        print('%-34s C=%-6s семей=%s  %s' % (o['host'], o['C'], o['semey'],
                                             ' '.join('%s %s%%' % c for c in o['cveta'])))
    json.dump(out, open('semyi.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
