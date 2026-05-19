"""Generate WebP assets and a single CSS bundle for production."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "assets" / "images"
CSS_DIR = ROOT / "css"

BACKGROUND_MAX_WIDTH = 1920
BACKGROUND_QUALITY = 78

BACKGROUNDS = [
    "hero_main_bg.png",
    "careers_bg.png",
    "careers_new_bg.png",
    "compliance_bg.png",
    "contact_hero_bg.png",
    "contact_us_bg.png",
    "cta_bg.png",
    "mission_bg.png",
    "news_bg.png",
    "news_box.png",
    "pharma_values_bg.png",
    "privacy_bg.png",
    "terms_bg.png",
    "hero_careers.png",
    "hero_compliance.png",
]

CONTENT_IMAGES = {
    "logo-capsule.png": [(96, 96, "logo-capsule-nav.webp", 88)],
    "logo-hero.png": [(440, None, "logo-hero.webp", 85)],
}

CSS_BUNDLE_ORDER = [
    "base/variables.css",
    "base/global.css",
    "base/animations.css",
    "base/common.css",
    "components/navbar.css",
    "components/hero.css",
    "components/about.css",
    "components/mission.css",
    "components/values.css",
    "components/partner.css",
    "components/cta.css",
    "components/contact.css",
    "components/footer.css",
    "components/page-layout.css",
    "components/legal.css",
    "base/responsive.css",
]

HOME_CSS_BUNDLE_ORDER = [
    "base/variables.css",
    "base/global.css",
    "base/animations.css",
    "base/common.css",
    "components/navbar.css",
    "components/hero.css",
    "components/about.css",
    "components/mission.css",
    "components/values.css",
    "components/partner.css",
    "components/cta.css",
    "components/contact.css",
    "components/footer.css",
    "base/responsive.css",
]


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    image.save(path, "WEBP", quality=quality, method=6)


def resize_background(src: Path) -> None:
    with Image.open(src) as img:
        img = img.convert("RGB")
        if img.width > BACKGROUND_MAX_WIDTH:
            ratio = BACKGROUND_MAX_WIDTH / img.width
            size = (BACKGROUND_MAX_WIDTH, int(img.height * ratio))
            img = img.resize(size, Image.Resampling.LANCZOS)
        out = IMG_DIR / f"{src.stem}.webp"
        save_webp(img, out, BACKGROUND_QUALITY)
        print(f"{src.name} -> {out.name} ({out.stat().st_size // 1024} KB)")


def resize_content(src_name: str, variants: list) -> None:
    src = IMG_DIR / src_name
    with Image.open(src) as img:
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
        for max_w, max_h, out_name, quality in variants:
            copy = img.copy()
            if max_h is None:
                if copy.width > max_w:
                    ratio = max_w / copy.width
                    copy = copy.resize((max_w, int(copy.height * ratio)), Image.Resampling.LANCZOS)
            else:
                copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
            out = IMG_DIR / out_name
            save_webp(copy, out, quality)
            print(f"{src_name} -> {out_name} ({out.stat().st_size // 1024} KB)")


def bundle_css(files: list[str], out_name: str) -> None:
    parts = []
    for rel in files:
        path = CSS_DIR / rel
        content = path.read_text(encoding="utf-8")
        content = content.replace("../../assets/images/", "../assets/images/")
        content = content.replace(".png)", ".webp)")
        content = content.replace(".png'", ".webp'")
        parts.append(f"/* {rel} */\n{content.strip()}\n")
    out = CSS_DIR / out_name
    out.write_text("\n".join(parts), encoding="utf-8")
    print(f"Wrote {out_name} ({out.stat().st_size // 1024} KB)")


def main() -> None:
    for name in BACKGROUNDS:
        src = IMG_DIR / name
        if src.exists():
            resize_background(src)
        else:
            print(f"skip missing {name}")

    for src_name, variants in CONTENT_IMAGES.items():
        resize_content(src_name, variants)

    bundle_css(CSS_BUNDLE_ORDER, "site.bundle.css")
    bundle_css(HOME_CSS_BUNDLE_ORDER, "home.bundle.css")
    print("Done.")


if __name__ == "__main__":
    main()
