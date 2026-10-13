"""Darken Oz's fur evenly so every sticker has the same deep black.

Only the fur changes: the yellow eyes, the collar and bright whiskers are protected, and the
protection is softened so there are no hard edges or blotches.

    python darkfur.py <in.png> <out.png> [--gamma 1.7] [--whiskers 0.5] [--collar-box x0,y0,x1,y1]

--gamma       strength (1 = unchanged; 1.7 was used for oz4 and oz8)
--whiskers    brightness where whisker protection starts; raise it (e.g. 0.5) for greyish fur so
              its sheen isn't mistaken for whiskers, lower it (e.g. 0.42) for already-dark fur
--collar-box  only treat reddish-brown as collar inside this box; use it when warm light tints
              the fur (otherwise those patches would stay light)
"""
import argparse

import numpy as np
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument('src')
parser.add_argument('out')
parser.add_argument('--gamma', type=float, default=1.7)
parser.add_argument('--whiskers', type=float, default=0.5)
parser.add_argument('--collar-box', type=lambda s: [int(v) for v in s.split(',')])
args = parser.parse_args()

img = np.asarray(Image.open(args.src).convert('RGBA'), dtype=np.float64) / 255
h, w = img.shape[:2]
r, g, b, a = img[..., 0], img[..., 1], img[..., 2], img[..., 3]
mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
d = np.maximum(mx - mn, 1e-6)
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

ys, xs = np.mgrid[0:h, 0:w]
eyes = (sat > 0.3) & (mx > 0.25) & (hue > 30) & (hue < 80)
if args.collar_box:
    x0, y0, x1, y1 = args.collar_box
    area = (xs > x0) & (ys > y0) & (xs < x1) & (ys < y1)
else:
    area = np.ones((h, w), bool)
collar = area & (sat > 0.3) & (mx > 0.26)   # leather is brighter than warm-tinted fur


def soften(mask, radius=3, passes=3):
    """Repeated box blur (close to a gaussian), so protected areas fade out instead of ending sharply."""
    m = mask.astype(np.float64)
    for _ in range(passes):
        for axis in (0, 1):
            pad = [(0, 0), (0, 0)]
            pad[axis] = (radius + 1, radius)
            c = np.cumsum(np.pad(m, pad), axis=axis)
            n = c.shape[axis]
            m = (np.take(c, range(2 * radius + 1, n), axis=axis) - np.take(c, range(0, n - 2 * radius - 1), axis=axis)) / (2 * radius + 1)
    return np.clip(m * 1.5, 0, 1)


protect = soften(eyes | collar)
whisker = np.clip((lum - args.whiskers) / 0.2, 0, 1)
fur = (1 - protect) * (1 - whisker)
curve = np.where(lum > 1e-6, lum ** args.gamma / np.maximum(lum, 1e-6), 1)   # darkens midtones, black stays black
k = 1 - fur * (1 - curve)
out = np.stack([r * k, g * k, b * k, a], axis=2)

cat = a > 0.5
after = 0.2126 * out[..., 0] + 0.7152 * out[..., 1] + 0.0722 * out[..., 2]
print(f'fur brightness {lum[cat].mean():.3f} -> {after[cat].mean():.3f} (protected: eyes {eyes.sum()} px, collar {collar.sum()} px)')
Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(args.out)   # 4 channels -> RGBA
