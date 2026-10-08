#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vloží pestré otázky (písacie, číselné, s výberom) zo súborov otazky-predmety/pestre/*.json
do INDEXNOVY.html, medzi značky GQ_X2:BEGIN a GQ_X2:END.

Každý súbor je JSON pole objektov:
  písacia   {"s","q","t":[...],"show"?,"w":[3],"e","src"}
  číselná   {"s","q","n",  "u","tol","w":[3 čísla],"e","src"}
  s výberom {"s","q","a",  "w":[3],"e","src"}
Skript otázky skontroluje, chybné vynechá a vypíše prečo. Pole "src" (odkiaľ je údaj) ostáva len
v súboroch — do stránky sa neprenáša.

Použitie:  python3 vloz-pestre.py   (potom python3 rozdel-stranku.py)
"""
import io, json, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'INDEXNOVY.html')
DIR = os.path.join(HERE, 'otazky-predmety', 'pestre')
SETS = ['atm', 'nav', 'met', 'eqps', 'hum', 'acft', 'pen', 'law', 'hist', 'gen']
B, E = '/* GQ_X2:BEGIN', '/* GQ_X2:END */'


def norm(t):
    t = unicodedata.normalize('NFD', str(t).upper())
    return re.sub(r'[^A-Z0-9+\-/]', '', ''.join(c for c in t if unicodedata.category(c) != 'Mn'))


def check(x):
    """Vráti (vyčistená otázka, None) alebo (None, dôvod vyradenia)."""
    if not isinstance(x, dict):
        return None, 'nie je objekt'
    s, q = x.get('s'), str(x.get('q', '')).strip()
    if s not in SETS:
        return None, 'neznámy okruh %r' % s
    if len(q) < 12:
        return None, 'krátka otázka'
    w = x.get('w')
    if not isinstance(w, list) or len(w) < 2:
        return None, 'málo nesprávnych možností'
    out = {'s': s, 'q': q}
    e = str(x.get('e', '')).strip()
    if 'n' in x and x['n'] is not None:
        try:
            n = float(x['n'])
            ws = [float(v) for v in w]
        except (TypeError, ValueError):
            return None, 'číselná otázka má nečíselné hodnoty'
        ws = [v for i, v in enumerate(ws) if v != n and v not in ws[:i]][:3]
        if len(ws) < 2:
            return None, 'nesprávne čísla sa zhodujú so správnym'
        fix = lambda v: int(v) if float(v).is_integer() else v
        out.update(n=fix(n), u=str(x.get('u', '') or '')[:14], tol=abs(float(x.get('tol', 0) or 0)), w=[fix(v) for v in ws])
        if out['tol'] == 0:
            out['tol'] = 0
        elif float(out['tol']).is_integer():
            out['tol'] = int(out['tol'])
        if any(abs(v - n) <= out['tol'] for v in ws):
            return None, 'nesprávna možnosť leží v tolerancii správnej'
    elif x.get('t'):
        t = [str(v).strip() for v in x['t'] if str(v).strip()]
        if not t or not norm(t[0]):
            return None, 'prázdna písaná odpoveď'
        show = str(x.get('show') or t[0]).strip()
        ws = [str(v).strip() for v in w if str(v).strip()]
        acc = set(norm(v) for v in t) | {norm(show)}
        ws = [v for i, v in enumerate(ws) if norm(v) not in acc and v not in ws[:i]][:3]
        if len(ws) < 2:
            return None, 'nesprávne možnosti sa zhodujú so správnou'
        if len(norm(t[0])) > 28:
            return None, 'písaná odpoveď je pridlhá'
        out.update(t=t, w=ws)
        if show != t[0]:
            out['show'] = show
    elif x.get('a'):
        a = str(x['a']).strip()
        ws = [str(v).strip() for v in w if str(v).strip()]
        ws = [v for i, v in enumerate(ws) if v != a and v not in ws[:i]][:3]
        if len(ws) < 2:
            return None, 'nesprávne možnosti sa zhodujú so správnou'
        out.update(a=a, w=ws)
    else:
        return None, 'chýba odpoveď (t, n alebo a)'
    if e:
        out['e'] = e
    return out, None


def main():
    if not os.path.isdir(DIR):
        sys.exit('chýba priečinok ' + DIR)
    html = io.open(SRC, encoding='utf-8').read()
    a, b = html.find(B), html.find(E)
    if a < 0 or b < 0:
        sys.exit('v INDEXNOVY.html chýbajú značky GQ_X2:BEGIN / GQ_X2:END')
    # otázky, ktoré už v stránke sú (aby sa neopakovali)
    have = set(norm(m) for m in re.findall(r"\bq: '([^']+)'", html[:a] + html[b:]))
    out, seen, stat = [], set(), {}
    for fn in sorted(os.listdir(DIR)):
        if not fn.endswith('.json'):
            continue
        try:
            data = json.load(io.open(os.path.join(DIR, fn), encoding='utf-8'))
        except Exception as ex:
            print('!! %s sa nedá načítať: %s' % (fn, ex))
            continue
        ok = bad = 0
        for x in data if isinstance(data, list) else []:
            y, why = check(x)
            k = norm(y['q']) if y else ''
            if y and (k in seen or k in have):
                y, why = None, 'opakuje sa'
            if not y:
                bad += 1
                print('   vynechané (%s): %s' % (why, str(x.get('q', x) if isinstance(x, dict) else x)[:70]))
                continue
            seen.add(k)
            out.append(y)
            ok += 1
            kind = 'n' if 'n' in y else 't' if 't' in y else 'a'
            stat.setdefault(y['s'], {'t': 0, 'n': 0, 'a': 0})[kind] += 1
        print('%-12s %3d otázok, %d vynechaných' % (fn, ok, bad))
    js = ',\n  '.join(json.dumps(x, ensure_ascii=False) for x in out).replace('</', '<\\/')
    block = B + ' — ďalšie pestré otázky po predmetoch; tento blok prepisuje skript vloz-pestre.py */\nconst GQ_X2 = [\n  ' + js + '\n];\n'
    io.open(SRC, 'w', encoding='utf-8').write(html[:a] + block + html[b:])
    print('\nspolu %d otázok vložených do INDEXNOVY.html' % len(out))
    for s in SETS:
        if s in stat:
            print('  %-5s písacie %3d · číselné %3d · výber %3d' % (s, stat[s]['t'], stat[s]['n'], stat[s]['a']))


if __name__ == '__main__':
    main()
