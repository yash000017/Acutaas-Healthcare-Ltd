"""Patch HTML pages for performance assets."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FONT_LINK = (
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:'
    'ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" '
    'media="print" onload="this.media=\'all\'">\n'
    '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:'
    'ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap"></noscript>'
)

LOGO_NAV = (
    '<img src="./assets/images/logo-capsule-nav.webp" alt="Acutaas Logo" '
    'class="logo-img" width="48" height="48"'
)

PAGE_CONFIG = {
    "index.html": {
        "bundle": "home.bundle.css",
        "preload": "hero_main_bg.webp",
        "strip_script": True,
    },
    "careers.html": {"bundle": "site.bundle.css", "preload": "careers_bg.webp", "strip_script": True},
    "news.html": {"bundle": "site.bundle.css", "preload": "news_bg.webp", "strip_script": True},
    "contact.html": {"bundle": "site.bundle.css", "preload": "contact_us_bg.webp", "strip_script": "contact"},
    "compliance.html": {"bundle": "site.bundle.css", "preload": "compliance_bg.webp", "strip_script": True},
    "privacy.html": {"bundle": "site.bundle.css", "preload": "privacy_bg.webp", "strip_script": True},
    "terms.html": {"bundle": "site.bundle.css", "preload": "terms_bg.webp", "strip_script": True},
}


def replace_head(content: str, bundle: str, preload: str, extra_head: str = "", contact_script: str = "") -> str:
    start = content.index("<head>")
    end = content.index("</head>") + len("</head>")
    new_head = f"""<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{content.split("<title>", 1)[1].split("</title>", 1)[0]}</title>
<meta name="description" content="{content.split('name="description" content="', 1)[1].split('"', 1)[0]}">
<link rel="icon" type="image/webp" href="./assets/images/logo-capsule-nav.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="./assets/images/{preload}" fetchpriority="high" type="image/webp">
{FONT_LINK}
<link rel="stylesheet" href="./css/{bundle}">
{extra_head}<script src="./js/site.js" defer></script>
{contact_script}
</head>"""
    return content[:start] + new_head + content[end:]


EMAILJS_HEAD = """<script defer src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  emailjs.init('ziCqBvPC-MPUfeoyY');
</script>
"""


def patch_file(path: Path, cfg: dict) -> None:
    text = path.read_text(encoding="utf-8")
    extra = EMAILJS_HEAD if path.name == "contact.html" else ""
    contact_script = '<script src="./js/contact.js" defer></script>\n' if path.name == "contact.html" else ""
    text = replace_head(text, cfg["bundle"], cfg["preload"], extra, contact_script)

    text = text.replace(
        'src="./assets/images/logo-capsule.png" alt="Acutaas Logo" class="logo-img" width="624" height="609" loading="lazy"',
        'src="./assets/images/logo-capsule-nav.webp" alt="Acutaas Logo" class="logo-img" width="48" height="48" loading="lazy"',
    )
    text = text.replace(
        'src="./assets/images/logo-capsule.png" alt="Acutaas Logo" class="logo-img" width="624" height="609"',
        'src="./assets/images/logo-capsule-nav.webp" alt="Acutaas Logo" class="logo-img" width="48" height="48"',
    )
    text = text.replace(".png')", ".webp')")
    text = text.replace('.png")', '.webp")')
    text = text.replace(".png", ".webp")
    text = text.replace("../../assets/", "./assets/")
    text = text.replace("background-attachment: fixed;", "")
    text = text.replace(
        'src="./assets/images/logo-hero.png" alt="Acutaas Healthcare Logo" class="hero-logo-image" width="624" height="609"',
        'src="./assets/images/logo-hero.webp" alt="Acutaas Healthcare Logo" class="hero-logo-image" width="440" height="430" fetchpriority="high" decoding="async"',
    )
    text = text.replace("hero_compliance.png", "compliance_bg.webp")

    strip = cfg.get("strip_script")
    if strip is True:
        markers = ["<script>\n// Mobile menu toggle", "<script>\n// ─── Mobile menu"]
        for marker in markers:
            if marker in text:
                start = text.index(marker)
                end = text.index("</script>", start) + len("</script>")
                text = text[:start].rstrip() + "\n" + text[end:]
                break
    elif strip == "contact":
        marker = "<script>\n// ─── Mobile menu"
        if marker in text:
            start = text.index(marker)
            end = text.index("</script>", start) + len("</script>")
            text = text[:start].rstrip() + "\n" + text[end:]

    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}")


def main() -> None:
    for name, cfg in PAGE_CONFIG.items():
        patch_file(ROOT / name, cfg)


if __name__ == "__main__":
    main()
