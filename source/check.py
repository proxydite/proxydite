"""Validate the generated production site using only Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree
import json

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://proxydite.net"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids, self.refs, self.errors = set(), [], []
        self.meta, self.canonical = {}, None
        self.headings = self.mains = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids:
                self.errors.append(f"duplicate ID: {a['id']}")
            self.ids.add(a["id"])
        self.headings += tag == "h1"
        self.mains += tag == "main"
        if tag == "meta":
            self.meta[a.get("name", a.get("property"))] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        for key in ("href", "src", "poster", "data-enlarge"):
            if a.get(key):
                self.refs.append(a[key])
        if a.get("srcset"):
            self.refs.extend(item.strip().split()[0] for item in a["srcset"].split(","))
        if tag == "img" and "alt" not in a:
            self.errors.append("image missing alt attribute")
        if tag == "iframe" and not a.get("title"):
            self.errors.append("iframe missing title")


def main():
    errors, pages = [], {}
    for path in ROOT.rglob("*.html"):
        if ".git" in path.relative_to(ROOT).parts:
            continue
        page = Page(path)
        page.feed(path.read_text())
        pages[path.resolve()] = page
        if page.headings != 1 or page.mains != 1:
            page.errors.append("expected one H1 and one main")
        if not page.canonical or not page.canonical.startswith(ORIGIN + "/"):
            page.errors.append("missing production canonical URL")
        for key in ("description", "og:title", "og:description", "og:url", "og:image", "twitter:image"):
            if not page.meta.get(key):
                page.errors.append(f"missing metadata: {key}")
        if path.name != "404.html" and "noindex" in page.meta.get("robots", ""):
            page.errors.append("preview noindex remains in production")
        errors.extend(f"{path.relative_to(ROOT)}: {e}" for e in page.errors)

    refs = 0
    for path, page in pages.items():
        for value in page.refs:
            u = urlsplit(value)
            if u.scheme or u.netloc:
                continue
            refs += 1
            target = (ROOT / unquote(u.path).lstrip("/")) if u.path.startswith("/") else path.parent / unquote(u.path)
            if not u.path:
                target = path
            if target.is_dir():
                target /= "index.html"
            target = target.resolve()
            if not target.is_relative_to(ROOT) or not target.is_file():
                errors.append(f"{path.relative_to(ROOT)}: missing local resource {value}")
            elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
                errors.append(f"{path.relative_to(ROOT)}: missing fragment {value}")

    asset_map = json.loads((ROOT / "source/asset-map.json").read_text())
    for original, item in asset_map.items():
        for value in [original] + [variant["src"] for variant in item["variants"]]:
            if not (ROOT / value).is_file():
                errors.append(f"asset map: missing {value}")
    for path in ROOT.rglob("*"):
        if path.is_file() and ".git" not in path.relative_to(ROOT).parts and path.stat().st_size >= 100 * 1024 * 1024:
            errors.append(f"file exceeds GitHub limit: {path.relative_to(ROOT)}")
    if (ROOT / "CNAME").read_text().strip() != "proxydite.net":
        errors.append("unexpected CNAME")
    if not (ROOT / ".nojekyll").is_file():
        errors.append("missing .nojekyll")
    if "Disallow: /" in (ROOT / "robots.txt").read_text():
        errors.append("production robots.txt blocks crawling")
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.is_file():
        errors.append("missing sitemap")
    else:
        locations = {n.text for n in ElementTree.parse(sitemap).iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
        expected = {p.canonical for p in pages.values() if p.path.name != "404.html"}
        if locations != expected:
            errors.append("sitemap does not match canonical pages")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"PASS: {len(pages)} pages, {refs} local references, asset map, metadata and sitemap.")


if __name__ == "__main__":
    main()
