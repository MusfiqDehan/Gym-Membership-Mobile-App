#!/usr/bin/env python3
"""
Generate Android launcher PNG icons from launcher-icon.svg.
Creates ic_launcher.png and ic_launcher_round.png for every mipmap density.
Adds a dark (#121212) background so the yellow logo reads well on any launcher.
"""

import io
import os
import sys

import cairosvg
from PIL import Image, ImageDraw

SVG_PATH = os.path.join(os.path.dirname(__file__), "..", "launcher-icon.svg")
RES_DIR = os.path.join(os.path.dirname(__file__), "..", "android", "app", "src", "main", "res")

# (density-folder, px-size)
SIZES = [
    ("mipmap-mdpi",    48),
    ("mipmap-hdpi",    72),
    ("mipmap-xhdpi",   96),
    ("mipmap-xxhdpi",  144),
    ("mipmap-xxxhdpi", 192),
]

BG_COLOR   = (18, 18, 18, 255)   # #121212 — near-black
LOGO_PAD   = 0.14                 # 14 % padding on each side

RENDER_SIZE = 1024  # intermediate high-res render


def load_svg_as_rgba(svg_path: str, size: int) -> Image.Image:
    """Render SVG to RGBA PIL image at `size × size`."""
    png_bytes = cairosvg.svg2png(
        url=svg_path,
        output_width=size,
        output_height=size,
        background_color=None,
    )
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def make_square_icon(logo: Image.Image, out_size: int) -> Image.Image:
    """Compose logo onto a solid dark square, with padding."""
    canvas = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), BG_COLOR)
    pad = int(RENDER_SIZE * LOGO_PAD)
    logo_box = RENDER_SIZE - 2 * pad
    logo_resized = logo.resize((logo_box, logo_box), Image.LANCZOS)
    canvas.paste(logo_resized, (pad, pad), logo_resized)
    return canvas.resize((out_size, out_size), Image.LANCZOS).convert("RGB")


def make_round_icon(logo: Image.Image, out_size: int) -> Image.Image:
    """Compose logo onto a dark circle (round launcher variant)."""
    canvas = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    # Draw filled circle background
    circle_layer = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(circle_layer)
    draw.ellipse([0, 0, RENDER_SIZE - 1, RENDER_SIZE - 1], fill=BG_COLOR)
    canvas = Image.alpha_composite(canvas, circle_layer)

    pad = int(RENDER_SIZE * LOGO_PAD)
    logo_box = RENDER_SIZE - 2 * pad
    logo_resized = logo.resize((logo_box, logo_box), Image.LANCZOS)
    canvas.paste(logo_resized, (pad, pad), logo_resized)
    return canvas.resize((out_size, out_size), Image.LANCZOS)


def main():
    svg_path = os.path.abspath(SVG_PATH)
    if not os.path.isfile(svg_path):
        print(f"ERROR: SVG not found at {svg_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading SVG: {svg_path}")
    logo_hires = load_svg_as_rgba(svg_path, RENDER_SIZE)

    for folder, px in SIZES:
        dest_dir = os.path.join(RES_DIR, folder)
        os.makedirs(dest_dir, exist_ok=True)

        square = make_square_icon(logo_hires, px)
        square_path = os.path.join(dest_dir, "ic_launcher.png")
        square.save(square_path, "PNG", optimize=True)

        round_img = make_round_icon(logo_hires, px)
        round_path = os.path.join(dest_dir, "ic_launcher_round.png")
        round_img.save(round_path, "PNG", optimize=True)

        print(f"  {folder:20s}  ic_launcher.png ({px}×{px})  ic_launcher_round.png")

    print("\nDone — all mipmap icons written.")


if __name__ == "__main__":
    main()
