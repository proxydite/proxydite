from pathlib import Path
import argparse, json, html, re, shutil, urllib.parse, hashlib

parser = argparse.ArgumentParser(description="Build the portfolio at the repository root.")
parser.add_argument("--production", action="store_true", help="Enable public indexing and proxydite.net metadata.")
PRODUCTION = parser.parse_args().production

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT
SITE_URL = "https://proxydite.net"
SITE_NAME = "Ryan Samuel Davies"
DEFAULT_COVER = {
    "src": "assets/Home/hero.jpg",
    "alt": "Ryan Samuel Davies beside the clay figures of Y Cynfod, lit by blue and magenta projection",
}
CANONICAL_ALIASES = {"field.html": "writing/y-cynfod", "writing/y-stori": "writing/y-cynfod"}
GENERATED_ROUTES = set()
PROJECTS = json.loads((ROOT / "source/projects.json").read_text())
EDITORIAL = json.loads((ROOT / "source/editorial.json").read_text())
ASSETS = json.loads((ROOT / "source/asset-map.json").read_text())
BY_SLUG = {p["slug"]: p for p in PROJECTS}
E = lambda s: html.escape(str(s), quote=True)
STYLE_VERSION = hashlib.sha256((ROOT / "styles.css").read_bytes()).hexdigest()[:10]
SCRIPT_VERSION = hashlib.sha256((ROOT / "site.js").read_bytes()).hexdigest()[:10]

def url(path):
    if path == "field.html": return "/writing/y-cynfod/"
    if path.startswith(("https://", "http://", "mailto:", "#", "/")): return path
    return "/" + urllib.parse.quote(path, safe="/#?=&")

def image(src, alt="", sizes="(max-width: 700px) 90vw, 85vw", eager=False):
    m = ASSETS.get(src, {})
    attrs = f'alt="{E(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"'
    if eager: attrs += ' fetchpriority="high"'
    if m: attrs += f' width="{m["width"]}" height="{m["height"]}"'
    variants = m.get("variants", [])
    source = ""
    if variants:
        srcset = ", ".join(f'{url(v["src"])} {v["width"]}w' for v in variants)
        source = f'<source type="image/webp" srcset="{E(srcset)}" sizes="{E(sizes)}">'
    return f'<picture>{source}<img src="{E(url(src))}" {attrs}></picture>'

def textlink(label, href, extra=""):
    return f'<a class="text-link {extra}" href="{E(url(href))}">{E(label)}<span class="arrow" aria-hidden="true">↗</span></a>'

def header(active="Work", home=False):
    nav = ""
    for name,href in [("Work","/"),("Writing","/writing/"),("About","/about/"),("Contact","/contact/")]:
        current = ' aria-current="page"' if name == active else ""
        nav += f'<a href="{href}"{current}>{name}</a>'
    return f'''<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header"><a class="brand" href="/">Ryan Samuel Davies</a>
    <button class="menu-toggle" aria-controls="primary-nav" aria-expanded="false">Menu</button>
    <nav class="site-nav" id="primary-nav" aria-label="Primary">{nav}</nav></header>'''

FOOTER = '''<footer class="footer"><div>© 2026 Ryan Samuel Davies<br>making things for calmer futures</div>
<div class="footer-links"><a href="https://www.instagram.com/proxydite_/">Instagram ↗</a><a href="https://proxydite.substack.com">Substack ↗</a><a href="https://github.com/proxydite/">GitHub ↗</a><a href="/contact/">Contact</a></div></footer>'''
DIALOG = '''<dialog class="lightbox" id="image-viewer" aria-label="Enlarged artwork">
<button class="close" autofocus>Close ×</button><img alt=""><p></p></dialog>'''

def social_metadata(title, description, cover=None, page_type="website"):
    if not PRODUCTION:
        return ""
    cover = cover or DEFAULT_COVER
    share_url = SITE_URL + url(cover["src"])
    return f'''<meta property="og:locale" content="en_GB"><meta property="og:site_name" content="{E(SITE_NAME)}">
<meta property="og:type" content="{E(page_type)}"><meta property="og:image" content="{E(share_url)}">
<meta property="og:image:alt" content="{E(cover.get("alt", SITE_NAME))}">
<meta name="twitter:title" content="{E(title)} — {E(SITE_NAME)}"><meta name="twitter:description" content="{E(description)}">
<meta name="twitter:image" content="{E(share_url)}"><meta name="twitter:image:alt" content="{E(cover.get("alt", SITE_NAME))}">
'''

def canonical_url(route):
    route = CANONICAL_ALIASES.get(route, route)
    path = "/" + route if route.endswith(".html") else "/" + route + "/" if route else "/"
    return SITE_URL + urllib.parse.quote(path, safe="/")

def shell(title, description, body, active="Work", home=False, lightbox=False, cover=None, page_type="website"):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)} — Ryan Samuel Davies</title><meta name="description" content="{E(description)}">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0f0d0b">
<meta property="og:title" content="{E(title)} — Ryan Samuel Davies"><meta property="og:description" content="{E(description)}">
<meta name="twitter:card" content="summary_large_image">
{social_metadata(title, description, cover, page_type)}<link rel="icon" href="/assets/About/favicon.png"><link rel="stylesheet" href="/styles.css?v={STYLE_VERSION}">
<script defer src="/site.js?v={SCRIPT_VERSION}"></script></head><body class="{"home" if home else "inner"}">
{header(active,home)}<main id="main">{body}</main>{FOOTER}{DIALOG if lightbox else ""}</body></html>'''

def save(route, content):
    route = route.strip("/")
    file = OUT / route if route.endswith(".html") else OUT / route / "index.html"
    if PRODUCTION:
        if route != "404.html":
            content = content.replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow">', 1)
        canonical = E(canonical_url(route))
        content = content.replace("</head>", f'<link rel="canonical" href="{canonical}"><meta property="og:url" content="{canonical}"></head>', 1)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content)
    GENERATED_ROUTES.add(route)

def write_crawl_files():
    sitemap = OUT / "sitemap.xml"
    if PRODUCTION:
        routes = sorted(GENERATED_ROUTES - {"404.html"} - CANONICAL_ALIASES.keys())
        entries = "\n".join(f"  <url><loc>{E(canonical_url(route))}</loc></url>" for route in routes)
        sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + "\n</urlset>\n")
        (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    else:
        (OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
        if sitemap.exists():
            sitemap.unlink()

def feature(slug, number, cls="", custom_image=None, title=None):
    p = BY_SLUG[slug]
    im = custom_image or image(p["cover"]["src"],p["cover"]["alt"])
    credit = f'<p class="feature-credit">{E(p["home_image_credit"])}</p>' if p.get("home_image_credit") else ""
    return f'''<a class="feature {cls}" href="/work/{slug}/">
    <div class="image-wrap">{im}<span class="feature-arrow" aria-hidden="true">↗</span></div>
    <div class="feature-info"><div><div class="feature-title"><span class="feature-number">{number}</span><h2>{E(title or p["title"])}</h2></div>
    <p class="meta">{E(p["year"])} · {E(p.get("role") if slug=="shape-of-things-to-come-2026" else p["category"])}</p></div>
    <p class="summary">{E(p["summary"])}</p></div>{credit}</a>'''

def smallcard(slug):
    p=BY_SLUG[slug]
    return f'''<a class="small-card" href="/work/{slug}/">{image(p["cover"]["src"],p["cover"]["alt"],"(max-width: 700px) 45vw, 28vw")}
    <div><h3>{E(p["title"])}</h3><p class="meta">{E(p.get("role",p["category"]))}<br>{E(p["year"])}</p></div></a>'''

music = {"slug":"music","title":"Music as proxydite","year":"2014–","category":"Sound","summary":"Electronic music, recorded sound and compositions for performance."}
categories=["All","Installation","Moving image","Performance","Theatre","Painting","Digital art","Creative technology","Sound"]
index_order=["y-cynfod","shape-of-things-to-come-2026","maybe-its-summer-now","what-the-fuck-is-going-on","painting","jane-eyre","opera-prelude","ble-mae-fy-nghartref","theatr-iolo","volcano-telephone-booths","moving-image","digital-work","music","studies-for-a-loving-machine","silent-night-raging-eve","the-hunger-games-on-stage","you-know-my-mum","iphigenia-yn-sblot","moving-screens","simul","opera-triple-bill","rhyddid"]
def index():
    rows=""
    for slug in index_order:
        p=music if slug=="music" else BY_SLUG[slug]
        display_year = p["year"] if p["year"] != "Selected work" else "—"
        rows+=f'''<a class="index-row" data-category="{E(p["category"])}" href="/work/{slug}/"><span class="index-title">{E(p["title"])}</span><span class="index-category">{E(p["category"])}</span><span class="index-year">{E(display_year)}</span></a>'''
    buttons="".join(f'<button type="button" data-filter="{E(c)}" aria-pressed="{str(c=="All").lower()}">{E(c)}</button>' for c in categories)
    return f'''<section class="wrap index-section" id="all-work"><div class="work-index"><div class="index-head"><h2>Work index</h2><p class="meta count" id="work-count" aria-live="polite">{len(index_order)} entries</p></div>
    <div class="filters" aria-label="Filter work by form">{buttons}</div><div class="index-list">{rows}</div>
    <p class="index-note">For the fuller record of theatre and live performance, see <a href="/about/#credits"><u>selected credits</u></a>.</p></div></section>'''

shape_feature = '<div class="shape-card">'+image("assets/new/shape/georgia1.jpg","Georgia Griffiths in The Last Place Left, wearing a VR headset in red light","(max-width: 700px) 90vw, 43vw")+"</div>"
summer=BY_SLUG["maybe-its-summer-now"]
film_image='<div class="film-card">'+image(summer["cover"]["src"],summer["cover"]["alt"],"(max-width: 700px) 90vw, 40vw")+'<span class="play-mark" aria-hidden="true"><span>▷</span></span></div>'
wt=BY_SLUG["what-the-fuck-is-going-on"]
practice_cards=""
for label, href, src, alt, description in [
    ("Painting","/work/painting/","assets/Art/Y Cynfod/proofofexistence.jpg","Proof of Existence, acrylic and clay on canvas","Acrylic, clay & chalk"),
    ("Digital art","/work/digital-work/","assets/Art/Digital Art/thekiss.jpg","the kiss, digital artwork","Images & compositions"),
    ("Creative technology","/work/creative-technology/","assets/Creative Technology/Volcano Telephone Booth/telephone-booth-use.jpg","A visitor using a tin-can telephone inside Volcano’s yellow booth","Interactive systems & experiments")
]:
    practice_cards+=f'<a class="practice-card" href="{href}"><div class="practice-image">{image(src,alt,"(max-width: 700px) 90vw, 28vw")}</div><div><h3>{E(label)} <span aria-hidden="true">↗</span></h3><p class="meta">{E(description)}</p></div></a>'
home=f'''<section class="hero" aria-labelledby="hero-title">
{image("assets/Home/hero.jpg","Ryan Samuel Davies beside the clay figures of Y Cynfod, lit by blue and magenta projection","100vw",True)}
<div class="hero-copy wrap"><div><p class="eyebrow">making things for calmer futures</p><h1 id="hero-title">Ryan Samuel Davies</h1>
<p class="hero-lead">Welsh artist based in Abertawe. I make moving images, objects and performances, bringing together light, sound and words.</p></div>
<div class="hero-note">Abertawe, Wales<br><a href="/work/y-cynfod/">With Y Cynfod, 2026 ↗</a></div></div></section>
<section class="section wrap" id="selected-work"><div class="section-head"><p class="eyebrow">Selected work</p><p>Images, objects and encounters.<br>Different forms, shared questions.</p></div>
{feature("y-cynfod","01","feature-full")}
<div class="feature-pair">{feature("shape-of-things-to-come-2026","02",custom_image=shape_feature)}{feature("maybe-its-summer-now","03",custom_image=film_image)}</div>
<article class="authored"><a href="/work/what-the-fuck-is-going-on/">{image(wt["cover"]["src"],wt["cover"]["alt"],"(max-width: 700px) 90vw, 45vw")}</a>
<div><p class="eyebrow">04 / Written, performed, scored & designed</p><h2>{E(wt["title"])}</h2><p>A solo performance about artificial intelligence and its place in everyday life. Projection, music and satire, made for Volcano in 2025.</p>{textlink("Enter the work","/work/what-the-fuck-is-going-on/")}</div></article></section>
<section class="wrap practice-section" id="art-and-technology"><div class="section-head"><h2 class="eyebrow">Art & creative technology</h2></div><div class="practice-grid">{practice_cards}</div></section>
<section class="wrap section recent" id="recent-collaborations"><div class="section-head"><h2 class="eyebrow">Recent collaborations</h2><p>Lighting, sound and video for live performance.</p></div>
<div class="recent-grid">{smallcard("jane-eyre")}{smallcard("opera-prelude")}{smallcard("ble-mae-fy-nghartref")}</div></section>
{index()}
<section class="wrap"><div class="writing-strip"><div><p class="eyebrow">Writing</p><h2>The Presence of<br>Everything Else</h2></div><div><p>A personal essay on sobriety, attention and finding a way back to making. Alongside further essays, the story of Y Cynfod and a recorded talk.</p>{textlink("Read & listen","/writing/")}</div></div></section>'''
save("",shell("Work","Moving images, objects and performances by Ryan Samuel Davies, a Welsh artist based in Abertawe.",home,home=True))

def media(item, skip_src=None):
    kind=item["kind"]
    if kind=="image":
        if item["src"]==skip_src:return ""
        img=image(item["src"],item.get("alt",""))
        m=ASSETS.get(item["src"],{})
        large=m.get("variants",[{"src":item["src"]}])[-1]["src"]
        cap=item.get("caption","")
        caption=f'<figcaption class="media-caption">{E(cap)}</figcaption>' if cap else ""
        return f'<figure class="media"><button class="image-button" data-enlarge="{E(url(large))}" data-alt="{E(item.get("alt",""))}" data-caption="{E(cap)}" aria-label="Enlarge: {E(item.get("alt","artwork"))}">{img}</button>{caption}</figure>'
    if kind=="video":
        poster=item.get("poster","")
        if poster in ASSETS:poster=ASSETS[poster]["variants"][-1]["src"]
        title=item.get("title","Video artwork")
        caption=item.get("caption",title)
        orientation = " portrait-media" if item.get("orientation")=="portrait" else ""
        return f'''<figure class="media{orientation}"><video controls playsinline preload="none" poster="{E(url(poster))}" aria-label="{E(title)}"><source src="{E(url(item["src"]))}" type="video/mp4"><a href="{E(url(item["src"]))}">Open {E(title)}</a></video><figcaption class="media-caption">{E(caption)}</figcaption></figure>'''
    if kind=="vimeo":
        return f'''<figure class="media video-frame"><iframe title="{E(item["title"])}" src="https://player.vimeo.com/video/{E(item["vimeoId"])}?dnt=1" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe><figcaption class="media-caption">{E(item.get("caption",item["title"]))}</figcaption></figure>'''
    raise ValueError(kind)

def blocks(items,skip_src=None):
    out=""
    for b in items:
        t=b["type"]
        if t=="paras":out+='<div class="prose">'+ "".join(f'<p>{E(x)}</p>' for x in b["items"])+"</div>"
        elif t=="heading":out+=f'<h2 class="block-heading">{E(b["text"])}</h2>'
        elif t=="media":out+=media(b["item"],skip_src)
        elif t=="grid":
            rendered=[media(i,skip_src) for i in b["items"]];rendered=[x for x in rendered if x]
            if len(rendered)==1:out+=rendered[0]
            elif rendered:out+=f'<div class="media-grid cols-{min(b.get("cols",2),len(rendered))}">{"".join(rendered)}</div>'
        elif t=="links":out+='<div class="block-links">'+ "".join(textlink(i["label"].lstrip("→ ").strip(),i["url"]) for i in b["items"])+"</div>"
        elif t=="credit":out+=f'<p class="credit">{E(b["text"])}</p>'
        elif t=="reel":
            out+=f'<section class="reel-feature"><div><h2>{E(b["title"])}</h2><p>{E(b["description"])}</p></div>{media(b["item"])}</section>'
        elif t=="show":
            out+=f'<section class="show"><header class="show-heading"><h2>{E(b["title"])}</h2><p class="show-meta"><span>{E(b["artist"])}</span><span>{E(b["dates"])}</span></p></header><p class="show-description">{E(b["description"])}</p><div class="media-grid cols-2">'+"".join(media(i) for i in b["images"])+"</div></section>"
        elif t=="score":
            out+=f'''<section class="score-feature"><div><p class="eyebrow">Music / proxydite</p><h2>The original score</h2><p>{E(b["description"])}</p>{textlink("Listen to the score on Bandcamp",b["url"])}</div><iframe title="Original score — what the fuck is going on? (or how I see things)" src="https://bandcamp.com/EmbeddedPlayer/album={E(b["album_id"])}/size=large/bgcol=0f0d0b/linkcol=a6896a/artwork=small/transparent=true/" loading="lazy"><a href="{E(b["url"])}">Listen to the original score by proxydite</a></iframe></section>'''
        else:raise ValueError(t)
    return out

for p in PROJECTS:
    slug=p["slug"]
    form="Sculpture, painting, moving image & writing" if slug=="y-cynfod" else p["category"]
    fact_items=[("Year",p["year"] if p["year"]!="Selected work" else None),("Form",form),("Role",p.get("role")),("Context",p.get("venue"))]
    facts="".join(f'<div><span class="fact-label">{E(k)}</span><span class="fact-value">{E(v)}</span></div>' for k,v in fact_items if v)
    sub=f'<p class="meta" style="margin-top:18px">{E(p["subtitle"])}</p>' if p.get("subtitle") else ""
    meta=f'<p class="meta" style="margin-top:24px">{E(p["meta"])}</p>' if p.get("meta") else ""
    head=f'''<div class="wrap page-head"><a class="back-link" href="/#all-work">← All work</a><h1>{E(p["title"])}</h1>{sub}</div>'''
    introduction=f'''<div class="wrap project-intro"><p class="lead">{E(p["summary"])}</p><div class="project-facts">{facts}</div>{meta}</div>'''
    show_cover=slug not in ("maybe-its-summer-now","painting","digital-work","moving-image","shape-of-things-to-come-2026","moving-screens")
    cover=""
    if show_cover:
        wide = " wide" if slug in ("y-cynfod","what-the-fuck-is-going-on","jane-eyre","opera-prelude") else ""
        cover=f'<div class="wrap project-cover{wide}">{image(p["cover"]["src"],p["cover"]["alt"],eager=True)}</div>'
    body=blocks(p["blocks"],p["cover"]["src"] if show_cover else None)
    if slug=="y-cynfod":
        body+='<h2 class="block-heading">Painting & matter</h2>'+media({"kind":"image","src":"assets/Art/Y Cynfod/proofofexistence.jpg","alt":"Proof of Existence, acrylic and clay on canvas","caption":"Proof of Existence. Acrylic and clay on canvas. 2026."})+textlink("Explore the paintings","/work/painting/")+textlink("Read The Presence of Everything Else","https://proxydite.substack.com/p/the-presence-of-everything-else")
    if slug=="shape-of-things-to-come-2026":
        cover=f'<div class="wrap project-cover">{image(p["cover"]["src"],p["cover"]["alt"],eager=True)}<p class="media-caption">{E(p["cover"]["caption"])}</p></div>'
    if slug in ("maybe-its-summer-now","moving-screens"):
        cover='<div class="wrap project-cover">'+media(p["blocks"][0]["item"])+'</div>'
        body=""
    if slug=="opera-prelude":
        body+=textlink("Production information","https://operahollandpark.com/productions/opera-prelude-trouble-in-tahiti-seven-deadly-sins/")
    end=f'<div class="wrap project-end">{textlink("Back to all work","/#all-work")}{textlink("Get in touch","/contact/")}</div>'
    save("work/"+slug,shell(p["title"],p["summary"],head+cover+introduction+'<div class="wrap project-body">'+body+"</div>"+end,lightbox=True,cover=p.get("cover")))

technology_cards=""
for slug in ("volcano-telephone-booths","theatr-iolo"):
    p=BY_SLUG[slug]
    technology_cards+=f'<article class="technology-project">{smallcard(slug)}<p>{E(p["summary"])}</p></article>'
technology=f'''<div class="wrap page-head"><a class="back-link" href="/#art-and-technology">← Work</a><h1>Creative technology</h1><p class="lead">Interactive sound, physical interfaces and experiments with technology in live spaces.</p></div><div class="wrap project-body"><div class="technology-grid">{technology_cards}</div></div>'''
save("work/creative-technology",shell("Creative technology","Interactive sound and creative technology projects by Ryan Samuel Davies.",technology))

writing_items=[
    ("Personal essay","2026","The Presence of Everything Else","Notes at six months sober. On attention, place and finding a way back to making.","https://proxydite.substack.com/p/the-presence-of-everything-else","Read on Substack ↗"),
    ("Personal essay","2025","Do the Little Things: Under Welsh Skies","A 120-kilometre walk to St Davids, reflecting on pilgrimage, digital disconnection, solitude and renewal.","https://proxydite.substack.com/p/do-the-little-things-under-welsh","Read on Substack ↗"),
    ("Personal essay","2024","Escape Velocity","On emotional recovery, digital validation, masculinity and finding strength through honesty, vulnerability and connection.","https://proxydite.substack.com/p/escape-velocity","Read on Substack ↗"),
    ("Short story","","Y Cynfod","The story at the heart of Y Cynfod.","/writing/y-cynfod/","Read the story →"),
    ("Recorded talk","2026","Studies for a Loving Machine","A talk from the 5th World Congress of Psychogeography in Abertawe.","https://www.youtube.com/watch?v=qxjMMxJeJgw&t=41s","Watch the talk ↗")]
writing_rows=""
for kind,year,title,desc,href,action in writing_items:
    writing_rows+=f'<a class="writing-entry" href="{E(href)}"><span class="entry-type">{E(kind)}<br>{E(year)}</span><div><h2>{E(title)}</h2><p>{E(desc)}</p></div><span class="entry-action">{E(action)}</span></a>'
writing=f'''<div class="wrap page-head"><p class="eyebrow">Words, on the page and aloud</p><h1>Writing</h1><p class="lead">Stories, personal essays and recorded talks. Another way into the work.</p></div><div class="wrap writing-list">{writing_rows}<p class="meta">Further writing is published through <a href="https://proxydite.substack.com"><u>Proxydite Papers ↗</u></a>.</p></div>'''
save("writing",shell("Writing","Stories, personal essays and recorded talks by Ryan Samuel Davies.",writing,"Writing"))

story_source=json.loads((ROOT/"source/story.json").read_text())
story_paragraphs=story_source["paragraphs"]
coda=story_source["coda"]
story_head='<div class="wrap page-head"><a class="back-link" href="/writing/">← Writing</a><p class="eyebrow">Short story</p><h1>Y Cynfod</h1></div>'
story_text='<article class="reading"><div class="prose">'+ "".join(f'<p>{E(x)}</p>' for x in story_paragraphs)+'</div><div class="coda">'+ "".join(f'<span>{E(x)}</span>' for x in coda)+'</div>'+textlink("Return to Y Cynfod","/work/y-cynfod/")+'</article>'
story_html=shell("Y Cynfod","A short story from Y Cynfod by Ryan Samuel Davies.",story_head+story_text,"Writing",cover=BY_SLUG["y-cynfod"]["cover"],page_type="article")
save("writing/y-cynfod",story_html)
save("writing/y-stori",story_html)
save("field.html",story_html)

about_paras=[
"I’m Ryan Samuel Davies, a Welsh artist from Llanelli, now based in Abertawe.",
"I work with moving image, sound, light, objects and words. Sometimes these become an installation or a performance; sometimes a painting, a film or a piece of music. I’m interested in what makes us act, what we believe, and how we find meaning in the world we inhabit.",
"In Y Cynfod, clay figures, projected light and an imagined mythology become ways of thinking about presence and the impulse to make. In my solo performance what the fuck is going on? (or how I see things), writing, music and projection become ways of questioning technology and its place in everyday life.",
"Theatre has been part of my life since youth theatre in Llanelli. Alongside my own work, I collaborate with artists and companies on lighting, sound and video, developing both the design and the systems that make it possible.",
"“Making things for calmer futures” describes a hope running through the practice: that making and encountering art can give us time to notice, question and reconsider how we live."]
credits=""
for group in EDITORIAL["credits"]:
    items=""
    for item in group["items"]:
        title=E(item["title"]);href=item.get("url")
        if href:title=f'<a href="{E(url(href))}">{title} ↗</a>'
        items+=f'<li>{title}<span>{E(item.get("context",""))}</span></li>'
    credits+=f'<section class="credits-group"><h3>{E(group["role"])}</h3><ul>{items}</ul></section>'
about=f'''<div class="wrap page-head"><p class="eyebrow">Abertawe, Wales</p><h1>About</h1></div>
<div class="wrap about-layout"><figure>{image("assets/About/portrait.jpeg","Ryan Samuel Davies",eager=True)}<figcaption class="media-caption">Ryan Samuel Davies</figcaption></figure>
<div><div class="prose">{"".join(f"<p>{E(x)}</p>" for x in about_paras)}</div>
<div class="practice-note"><h2>Making & sharing</h2><p>I publish code and share methods, documentation and source material where practical. Openness is part of how I work.</p>{textlink("Code & experiments","https://github.com/proxydite/")}</div>
<p class="meta">BA (Hons) Video Design for Live Performance, Guildhall School of Music & Drama, 2020–2023. Visiting teaching in Design Realisation, 2023–2026.</p></div></div>
<div class="wrap"><h2 class="eyebrow">Selected credits</h2><details class="credits" id="credits"><summary>Theatre & live performance</summary><div class="credits-grid">{credits}</div></details></div>'''
save("about",shell("About","Ryan Samuel Davies is a Welsh artist from Llanelli, based in Abertawe. Art, performance, writing and design for live performance.",about,"About"))

contact='''<div class="wrap contact-main"><p class="eyebrow">Commissions, collaborations, conversations</p><h1>Get in touch.</h1><a class="email" href="mailto:hello@proxydite.net">hello@proxydite.net</a><p class="lead">For artwork, performance, lighting, sound and video design—or to start a conversation.</p><div class="social-list"><a href="https://www.instagram.com/proxydite_/">Instagram ↗</a><a href="https://proxydite.substack.com">Proxydite Papers ↗</a><a href="https://proxydite.bandcamp.com">Music on Bandcamp ↗</a><a href="https://x.com/proxydite">X ↗</a></div></div>'''
save("contact",shell("Contact","Contact Ryan Samuel Davies for artwork, performance and design collaborations.",contact,"Contact"))

albums=[("socially awkward chicken","3287311794","socially-awkward-chicken"),("what the fuck is going on? (or how I see things)","1514763297","what-the-fuck-is-going-on-or-how-i-see-things"),("non, je ne regrette rien","495219216","non-je-ne-regrette-rien"),("TODAY, TOMORROW & YESTERDAY","3354648981","today-tomorrow-yesterday")]
album_html=""
for title,identifier,slug in albums:
    album_html+=f'<article class="album"><h2>{E(title)}</h2><iframe title="{E(title)} — Bandcamp album player" loading="lazy" src="https://bandcamp.com/EmbeddedPlayer/album={identifier}/size=large/bgcol=0f0d0b/linkcol=a6896a/tracklist=false/transparent=true/" seamless><a href="https://proxydite.bandcamp.com/album/{slug}">{E(title)}</a></iframe>{textlink("Listen on Bandcamp","https://proxydite.bandcamp.com/album/"+slug)}</article>'
music_html=f'''<div class="wrap page-head"><a class="back-link" href="/#all-work">← All work</a><p class="eyebrow">Sound / proxydite</p><h1>Music</h1><p class="lead">Electronic synthesis, recorded sound and melodies. Released as proxydite, and sometimes finding their way into performance and installation.</p></div>
<div class="wrap project-body"><div class="album-grid">{album_html}</div><aside class="ongoing-note"><div><p class="eyebrow">In development</p><h2>HEDDIW</h2></div><p>A new album in progress.</p></aside></div>'''
save("work/music",shell("Music as proxydite","Music and electronic sound work by Ryan Samuel Davies, released as proxydite.",music_html))

notfound='''<div class="wrap contact-main"><p class="eyebrow">404</p><h1>This page isn’t here.</h1><p class="lead">Return to the work to find a project, or get in touch.</p>'''+textlink("Back to the work","/")+"</div>"
save("404.html",shell("Page not found","Return to Ryan Samuel Davies’s portfolio.",notfound))
write_crawl_files()
(OUT/"site-data.json").write_text(json.dumps({"projects":PROJECTS,"editorial":EDITORIAL},ensure_ascii=False,indent=2))
print(f"Built {len(list(OUT.rglob('*.html')))} static pages in {OUT}")
