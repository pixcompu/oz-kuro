# Album tools

Add a photo of Oz to the sticker album ("Oz en todas sus formas"). A photo goes in one of two ways:

- **Sticker** (default): Oz cut out of the background, fur darkened to the same deep black as the
  other stickers (eyes, collar and whiskers untouched). The white sticker outline isn't baked in;
  CSS draws it (`.sticker`).
- **Regular photo** (`--photo`): kept as it is, background and all; for photos where someone is with
  Oz, or any photo that shouldn't be cut out. It's shown in the album as a print with a white border.

Requires macOS 14+ (Vision subject lifting, run with `swift`) and Python 3. The first run creates
`tools/album/.venv` with numpy and Pillow. Photos can be JPEG, HEIC (iPhone), PNG… anything macOS opens.

## Add a pose

```bash
tools/album/add-to-album.sh ~/Downloads/photo.jpg oz9            # as a sticker
tools/album/add-to-album.sh ~/Downloads/me-and-oz.heic oz10 --photo   # as a regular photo
```

This writes:

- `assets/img/oz9.webp`: what the site loads
- `assets/img/originals/oz9.png` (sticker) or `oz10.jpg` (photo): the full-quality original, kept for
  future edits; the site doesn't load it

and prints an entry to paste into `gallery.js` (regular photos come with `type: 'photo'`, and the `date`
is filled in from the photo when the camera recorded when it was taken). Fill in the
sticker's `name` and `alt` description in Spanish and English, and the pose appears in the album; a
new album page appears on its own once a page is full.

Camera metadata is never published: the files are re-encoded from pixels, so a phone photo's GPS
location and device info don't end up on the site.

## When a sticker needs tweaking

| Problem | Option |
|---|---|
| The wrong subject was cut out (a person, another pet) | `--point X,Y`: a pixel on Oz in the photo |
| The photo is too bright or too dark overall | `--ev -0.6` (darker) or `--ev 0` (unchanged) |
| Fur still looks grey / too crushed | `--gamma 2.0` (darker) or `--gamma 1.4` (lighter) |
| Fur sheen stays light in patches | `--whiskers 0.6` |
| Warm-lit fur stays brownish in patches | `--collar-box x0,y0,x1,y1`: the collar area in the sticker |
| Keep the fur as it is | `--no-darken` |

Run it again with `--force` to overwrite the same name.

## The steps on their own

The fur filter and the other steps can be used separately, e.g. to darken an existing cut-out:

- `swift lift.swift <photo> <out.png>`: cut Oz out (`--keep-background` only turns the photo upright)
- `.venv/bin/python darkfur.py <in.png> <out.png>`: darken the fur of a cut-out
- `.venv/bin/python webp.py <sticker.png> <out.webp>`: sticker WebP + gallery entry
- `.venv/bin/python photo.py <upright.png> <original.jpg> <out.webp>`: regular-photo files + gallery entry
