# proxydite.net

Portfolio site for Ryan Samuel Davies. Plain HTML, CSS and JavaScript, hosted on GitHub Pages.

## How it works

Every word and media reference on the site lives in **one file: `content.js`**. To change any text, caption, credit or file path, edit `content.js` and nothing else.

- `index.html` — empty structural shell. You should almost never need to touch it.
- `styles.css` — all visual design. Palette and fonts are defined in `:root` at the top.
- `main.js` — renders the page from `content.js`. Only touch it to change behaviour, not content.
- `content.js` — **everything else. Edit here.**
- `field.html` — the Y Cynfod short story, a self-contained page linked from the project panel (now with a "← proxydite" link back home).

Preview locally by opening `index.html` in a browser (double-clicking works, no server needed). Deploy by pushing to the GitHub repo; Pages does the rest. `CNAME` keeps the proxydite.net domain: do not delete it.

## What's where (v3)

- **Ongoing Projects** — Y Cynfod and Studies for a Loving Machine, tiles opening panels.
- **Video Art** — efallai spotlight, then the featured pair (body / bloom), then the Vimeo carousel.
- **Art** — Painting and Digital Art as tiles opening panels, same interaction as projects.
- **Lightbox** — any image inside any panel is clickable: click to enlarge, swipe or arrow through, Escape or × to close.
- **Intro** — plays once per browser session; never for reduced-motion visitors; click to skip. Turn off entirely with `intro: { enabled: false }` in `content.js`.
- **Socials** — header top right, edit URLs in `socials` in `content.js`. **Confirm the Substack URL** (currently proxydite.substack.com).
- **Creative Technology** — planned. A disabled skeleton exists in `content.js` (`creativeTech`); set `enabled: true`, fill in the panels, add tile images, and add `{ label: "creative technology", to: "#creativetech" }` to `nav` when ready.

## Pending media

Nothing outstanding. All videos are live and self-hosted with posters in `assets/video/posters/`. If a future piece isn't ready, add its entry with `pending: true` and it will show a labelled placeholder until you remove the flag.

## Featured instrument (Grid Pulse)

The bordered chassis under the Ongoing Projects tiles. It is a full-width feature rather than a third tile, so a live piece outweighs the portfolio entries without a redesign. Edit the `instrument` block inside `projects` in `content.js`; set `enabled: false` to remove it entirely.

Two display modes:

- `embed: false` (current) — a launch panel: an animated signal trace behind a "run the instrument" control that opens the app in a new tab.
- `embed: true` — the app itself, running live and inline in a 16:10 frame, with the launch link moved beside the text.

**It is currently `false` on purpose.** The running app shows branding in its own masthead that is not yet public, and an inline frame would put that on the homepage. Flip the flag once that is announced; the embed path is built and works.

## Upcoming section

The light text-only section between Ongoing Projects and About. Edit the `upcoming` block in `content.js`: each item takes a title, optional `by`, role, venue, `when`, and an optional URL. Empty the items list and the whole section (and its divider) hides itself.

## Mobile menu

Below 620px the inline navigation is replaced by a "menu" button opening a full-screen overlay. It's populated from the same `nav` list in `content.js`, so there is nothing separate to maintain.

## Media guidelines

- **Images**: JPEG for photographs, max ~2200px on the long edge, quality ~80. PNGs of photos are 20–30x heavier for no visible gain; keep full-resolution originals on the NAS, not in this repo. (proofofexistence, medusa and thekiss were converted this way; the originals stay with you.)
- **Video**: keep each file well under 100MB (GitHub refuses larger). Encode with:

  ```
  ffmpeg -i in.mov -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k out.mp4
  ```

- **Posters** (the still shown before a video plays):

  ```
  ffmpeg -ss 10 -i assets/video/FILM.mp4 -frames:v 1 -q:v 4 assets/video/posters/FILM.jpg
  ```

- Paths in `content.js` are **case-sensitive** on GitHub Pages (`snre.JPG` is not `snre.jpg`). Folder names with spaces work, but if an asset ever mysteriously 404s, check case and spaces first.

## Currently unused assets

Kept in the repo for possible future use, referenced nowhere: `assets/Installation/rhyddid.jpg`, `assets/Theatre/OP_OHP.jpg`, `assets/Theatre/wtfigo2.jpeg`, `assets/About/portrait.jpeg`.
# proxydite
