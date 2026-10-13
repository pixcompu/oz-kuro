#!/usr/bin/env bash
# Add a photo of Oz to the album. By default it becomes a sticker (Oz cut out, fur darkened);
# with --photo it stays a regular photo, background and all (e.g. you with Oz). See README.md.
#
#   tools/album/add-to-album.sh <photo> <name> [options]
#
#   --photo                keep it as a regular photo: no cut-out, no fur filter
#   --point X,Y            sticker: a pixel on Oz, if the photo has other subjects
#   --ev -0.4              sticker: exposure change in stops (negative = darker)
#   --gamma 1.7            sticker: fur darkening strength (1 = none)
#   --whiskers 0.5         sticker: brightness where whisker protection starts
#   --collar-box x0,y0,x1,y1  sticker: limit collar protection to this area of the sticker
#   --no-darken            sticker: skip the fur darkening
#   --force                overwrite an existing entry with the same name
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
usage() { sed -n '6,18p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }
[ $# -ge 2 ] || usage
photo="$1" name="$2"; shift 2

mode=sticker lift_opts=() dark_opts=() darken=1 force=0
while [ $# -gt 0 ]; do
  case "$1" in
    --photo) mode=photo; shift ;;
    --point|--ev) lift_opts+=("$1" "$2"); shift 2 ;;
    --gamma|--whiskers|--collar-box) dark_opts+=("$1" "$2"); shift 2 ;;
    --no-darken) darken=0; shift ;;
    --force) force=1; shift ;;
    *) usage ;;
  esac
done

if [ "$mode" = photo ]; then original="$root/assets/img/originals/$name.jpg"; else original="$root/assets/img/originals/$name.png"; fi
site="$root/assets/img/$name.webp"
if [ "$force" = 0 ] && { [ -e "$original" ] || [ -e "$site" ]; }; then
  echo "$name already exists (${original#$root/} or ${site#$root/}); pick another name or use --force" >&2
  exit 1
fi

# Python tools run in a local virtualenv (numpy + Pillow), created on first use.
python="$here/.venv/bin/python"
if [ ! -x "$python" ]; then
  echo "setting up $here/.venv (first run only)…"
  python3 -m venv "$here/.venv"
  "$here/.venv/bin/pip" install --quiet -r "$here/requirements.txt"
fi

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
# lift.swift also reports the day the photo was taken ("taken: YYYY-MM-DD"), if the camera recorded it.
lift() { local out; out="$(swift "$here/lift.swift" "$@")"; echo "$out"; taken="$(echo "$out" | sed -n 's/^taken: //p')"; }
taken=""
if [ "$mode" = photo ]; then
  lift "$photo" "$tmp/upright.png" --keep-background --max 2000
  "$python" "$here/photo.py" "$tmp/upright.png" "$original" "$site" --date "$taken"
  exit 0
fi

lift "$photo" "$tmp/lifted.png" ${lift_opts[@]+"${lift_opts[@]}"}
if [ "$darken" = 1 ]; then
  "$python" "$here/darkfur.py" "$tmp/lifted.png" "$original" ${dark_opts[@]+"${dark_opts[@]}"}
else
  cp "$tmp/lifted.png" "$original"
fi
"$python" "$here/webp.py" "$original" "$site" --date "$taken"
