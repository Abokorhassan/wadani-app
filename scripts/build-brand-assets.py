#!/usr/bin/env python3
"""Generate app icons and in-app logo assets from the official Waddani artwork.

The official files are 2677x2676 transparent PNGs holding the seal (falcon in a
laurel ring) above the "XISBIGA WADDANI / SOMALILAND NATIONAL PARTY" wordmark,
surrounded by a lot of empty space. This script trims that space, splits the
seal and the wordmark from the full lockup, and writes the exports the app and
the stores need.

Usage:  python3 scripts/build-brand-assets.py      (needs Pillow)
"""

from pathlib import Path

from PIL import Image

BRAND = Path(__file__).resolve().parent.parent / "assets" / "brand"
STORE = BRAND.parent / "store"
BRAND_ORANGE = (254, 102, 0, 255)  # #FE6600

SOURCES = {
    "color": "logo-full-color.png",
    "white": "logo-white.png",
    "black": "logo-black.png",
}


def trim(image: Image.Image) -> Image.Image:
    box = image.split()[3].getbbox()
    return image.crop(box)


def split_seal_and_wordmark(
    image: Image.Image,
) -> tuple[Image.Image, Image.Image, Image.Image]:
    """Split at the widest fully transparent horizontal band.

    Returns the seal, the full lockup and the wordmark on its own.
    """
    alpha = image.split()[3]
    width, height = image.size
    rows = [max(alpha.crop((0, y, width, y + 1)).getdata()) for y in range(height)]

    gaps, start = [], None
    for y, value in enumerate(rows):
        if value < 8 and start is None:
            start = y
        elif value >= 8 and start is not None:
            gaps.append((start, y))
            start = None
    if start is not None:
        gaps.append((start, height))

    # ignore gaps touching the edges: we want the one between the two elements
    inner = [g for g in gaps if g[0] > 0 and g[1] < height]
    if not inner:
        raise SystemExit("Could not find the gap between the seal and the wordmark")
    gap = max(inner, key=lambda g: g[1] - g[0])
    cut = (gap[0] + gap[1]) // 2
    return (
        trim(image.crop((0, 0, width, cut))),
        trim(image),
        trim(image.crop((0, cut, width, height))),
    )


def place(mark: Image.Image, canvas: int, scale: float, background=None) -> Image.Image:
    """Centre `mark` on a square canvas, sized to `scale` of the canvas."""
    target = int(canvas * scale)
    ratio = min(target / mark.width, target / mark.height)
    resized = mark.resize(
        (max(1, round(mark.width * ratio)), max(1, round(mark.height * ratio))),
        Image.LANCZOS,
    )
    out = Image.new("RGBA", (canvas, canvas), background or (0, 0, 0, 0))
    out.alpha_composite(
        resized, ((canvas - resized.width) // 2, (canvas - resized.height) // 2)
    )
    return out


def main() -> None:
    seals: dict[str, Image.Image] = {}
    wordmarks: dict[str, Image.Image] = {}

    for name, filename in SOURCES.items():
        source = Image.open(BRAND / filename).convert("RGBA")
        seal, lockup, wordmark = split_seal_and_wordmark(source)
        seals[name] = seal
        wordmarks[name] = wordmark
        seal.save(BRAND / f"seal-{name}.png")
        lockup.save(BRAND / f"lockup-{name}.png")
        wordmark.save(BRAND / f"wordmark-{name}.png")
        print(f"{filename}: seal {seal.size}, lockup {lockup.size}, wordmark {wordmark.size}")

    # App icon: white seal on the brand orange, generous bleed for rounded corners.
    place(seals["white"], 1024, 0.68, BRAND_ORANGE).save(BRAND / "icon.png")

    # Android adaptive icon: the foreground is masked, so keep inside the safe circle.
    place(seals["white"], 1024, 0.52).save(BRAND / "android-icon-foreground.png")
    place(seals["black"], 1024, 0.52).save(BRAND / "android-icon-monochrome.png")

    # Splash: white seal on the orange splash background.
    place(seals["white"], 1024, 0.9).save(BRAND / "splash-icon.png")

    print("icons written to", BRAND)

    # Google Play listing: 512px icon and 1024x500 feature graphic, both without
    # transparency (Play rejects an alpha channel on the feature graphic).
    STORE.mkdir(exist_ok=True)
    place(seals["white"], 512, 0.68, BRAND_ORANGE).convert("RGB").save(STORE / "play-icon-512.png")
    feature_graphic(seals["white"], wordmarks["black"]).save(STORE / "play-feature-graphic.png")
    print("store graphics written to", STORE)


def feature_graphic(seal: Image.Image, wordmark: Image.Image) -> Image.Image:
    """Seal on the left, wordmark on the right, on the brand orange.

    The wordmark is dark: white text on orange fails contrast (AGENTS.md).
    """
    out = Image.new("RGBA", (1024, 500), BRAND_ORANGE)
    seal = seal.resize((300, round(seal.height * 300 / seal.width)), Image.LANCZOS)
    wordmark = wordmark.resize((460, round(wordmark.height * 460 / wordmark.width)), Image.LANCZOS)
    gap = 60
    left = (1024 - seal.width - gap - wordmark.width) // 2
    out.alpha_composite(seal, (left, (500 - seal.height) // 2))
    out.alpha_composite(
        wordmark, (left + seal.width + gap, (500 - wordmark.height) // 2)
    )
    return out.convert("RGB")


if __name__ == "__main__":
    main()
