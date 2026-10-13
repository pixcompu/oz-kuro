"""Turn an upright photo into a regular album photo (no cut-out, no fur filter): a full-quality JPEG
original and the WebP the site loads, then print a ready-to-paste gallery.js entry.

    python photo.py <upright.png> <original.jpg> <out.webp> [--date YYYY-MM-DD]

Nothing from the camera's metadata is kept (no GPS location, no device info).
"""
import os
import sys

from PIL import Image

def date_line(argv):
    """`date: '…',` for the gallery entry when --date was given, otherwise a reminder to add it."""
    if '--date' in argv and argv[argv.index('--date') + 1]:
        return f"    date: '{argv[argv.index('--date') + 1]}',\n"
    return "    // date: 'YYYY-MM-DD',   (the photo didn't say when it was taken; add it if you know)\n"

src, original, out = sys.argv[1], sys.argv[2], sys.argv[3]
img = Image.open(src).convert('RGB')   # re-encoded from pixels only, so no EXIF/GPS is carried over

master = img.copy()
master.thumbnail((2000, 2000), Image.LANCZOS)
master.save(original, 'JPEG', quality=92, optimize=True)

site = img.copy()
site.thumbnail((1200, 1200), Image.LANCZOS)
site.save(out, 'WEBP', quality=85, method=6)
print(f'{original}: {master.width}x{master.height}, {os.path.getsize(original) // 1024} KB (original, not loaded by the site)')
print(f'{out}: {site.width}x{site.height}, {os.path.getsize(out) // 1024} KB')

site_path = os.path.relpath(out, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
print(f'''
gallery.js entry:
  {{
    type: 'photo',
    src: '{site_path}', width: {site.width}, height: {site.height},
    name: {{ es: '…', en: '…' }},
    alt: {{ es: '…', en: '…' }},
{date_line(sys.argv)}    tags: [],
  }},''')
