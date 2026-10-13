"""Turn a sticker PNG into the WebP the site loads, and print a ready-to-paste gallery.js entry.

    python webp.py <in.png> <out.webp> [--date YYYY-MM-DD]

Colour is compressed (quality 88); transparency is kept exact, because the white sticker
outline is drawn by CSS along it.
"""
import os
import sys

from PIL import Image

def date_line(argv):
    """`date: '…',` for the gallery entry when --date was given, otherwise a reminder to add it."""
    if '--date' in argv and argv[argv.index('--date') + 1]:
        return f"    date: '{argv[argv.index('--date') + 1]}',\n"
    return "    // date: 'YYYY-MM-DD',   (the photo didn't say when it was taken; add it if you know)\n"

src, out = sys.argv[1], sys.argv[2]
img = Image.open(src).convert('RGBA')
img.save(out, 'WEBP', quality=88, method=6, alpha_quality=100)
before, after = os.path.getsize(src), os.path.getsize(out)
print(f'{out}: {img.width}x{img.height}, {before // 1024} KB -> {after // 1024} KB')

site_path = os.path.relpath(out, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
print(f'''
gallery.js entry:
  {{
    src: '{site_path}', width: {img.width}, height: {img.height},
    name: {{ es: '…', en: '…' }},
    alt: {{ es: 'Oz …', en: 'Oz …' }},
{date_line(sys.argv)}    tags: [],
  }},''')
