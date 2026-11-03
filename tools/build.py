#!/usr/bin/env python3
"""Construit les pages de mains à partir de tools/hands.json.

Usage (depuis la racine du dépôt) :
    python3 tools/build.py main-3          construit uniquement cette main (refuse si la page existe déjà)
    python3 tools/build.py main-3 --force  reconstruit une main déjà publiée (seulement sur demande de l'auteur)
    python3 tools/build.py --all           reconstruit toutes les mains (seulement sur demande de l'auteur)
Les mains déjà publiées ne sont jamais réécrites par défaut.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / 'tools/config.json').read_text(encoding='utf-8'))
hands = json.loads((ROOT / 'tools/hands.json').read_text(encoding='utf-8'))
src = (ROOT / 'tools/replay-source.html').read_text(encoding='utf-8')

# Les tags et notes de l'auteur ne doivent jamais partir dans une page publique.
NOTE = re.compile(r'^\s*[-•*]?\s*(notes?|comm?entaires?|remarques?|pourquoi|why|tags?|[ée]tiquettes?)\s*[:\-–]', re.I)
lit = lambda v: json.dumps(v, ensure_ascii=False).replace('</', '<\\/')

def build(entry):
    slug, title = entry['slug'], entry['title'].strip()
    if not title:
        sys.exit(f'{slug} : le titre est obligatoire')
    hand = (ROOT / entry['file']).read_text(encoding='utf-8').strip()
    hand = '\n'.join(l for l in hand.splitlines() if not NOTE.match(l))
    s = src
    for marker in ('const GUEST_HAND = null;', 'const GUEST_TITLE = null;', 'const NTFY_TOPIC = null;'):
        assert s.count(marker) == 1, marker
    s = s.replace('const GUEST_HAND = null;', 'const GUEST_HAND = ' + lit(hand) + ';')
    s = s.replace('const GUEST_TITLE = null;', 'const GUEST_TITLE = ' + lit(title) + ';')
    s = s.replace('const NTFY_TOPIC = null;', 'const NTFY_TOPIC = ' + lit(cfg['ntfy_topic']) + ';')
    # <title>, meta et police remontés dans le <head>
    pull = lambda pat: (lambda m: (s.replace(m.group(0), '', 1), m.group(0)))(re.search(pat, s))
    s, _ = pull(r'<title>.*?</title>\n')
    s, _ = pull(r'<meta name="claude:viewport-fit-sides"[^>]*>\n')
    s, font = pull(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n')
    head = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            '<meta name="robots" content="noindex,nofollow">\n<meta name="color-scheme" content="dark">\n'
            '<meta name="theme-color" content="#0a0a0d">\n'
            f'<title>{cfg["page_title"]}</title>\n{font}'
            '<style>:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
            '</head>\n<body>\n')
    out = ROOT / slug / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(head + s + '\n</body>\n</html>\n', encoding='utf-8')
    print('ok', out.relative_to(ROOT))

args = sys.argv[1:]
force = '--force' in args or '--all' in args
slugs = [a for a in args if not a.startswith('--')]
if not slugs and '--all' not in args:
    sys.exit(__doc__)
known = {e['slug'] for e in hands}
unknown = [x for x in slugs if x not in known]
if unknown:
    sys.exit('Inconnu dans tools/hands.json : ' + ', '.join(unknown))
for e in hands:
    if '--all' not in args and e['slug'] not in slugs:
        continue
    if (ROOT / e['slug'] / 'index.html').exists() and not force:
        print('déjà publiée, laissée telle quelle :', e['slug'])
        continue
    build(e)
