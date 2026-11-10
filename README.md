# proxydite

The static portfolio of Ryan Samuel Davies, a Welsh artist working across moving image, sound, sculpture, painting, text and creative technology. Live at [proxydite.net](https://proxydite.net).

The site uses HTML, CSS and JavaScript. A Python 3 script generates the pages from local source files; no packages or frontend build tools are required.

## Local preview

From the repository root:

```sh
python source/build.py
python preview.py
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/). The server supports video seeking; stop it with Ctrl+C. Use `python preview.py --port 8766` to choose another port.

The default build is for preview: it asks search engines not to index the pages and blocks crawling in `robots.txt`. Building rewrites the generated pages in this repository, so rebuild for production before committing a publishing change.

## Editing

| File or directory | Purpose |
| --- | --- |
| `source/projects.json` | Project summaries, roles, galleries, media and links. |
| `source/editorial.json` | Editorial data and selected performance credits. |
| `source/story.json` | The Y Cynfod short story. |
| `source/asset-map.json` | Image dimensions and responsive image variants. |
| `source/build.py` | Page templates, navigation, page composition and remaining page copy. |
| `styles.css` | Shared layout, typography and responsive styles. |
| `site.js` | Navigation, project filters and image viewing. |
| `assets/` | Portfolio images, video, fonts and other public media. |
| `preview.py` | Local preview server. |

Edit the source files, then rebuild. Direct edits to generated HTML, `site-data.json` or crawl files will be replaced by the next build. The image map references existing exports; the build does not create or resize images. Keep captions, image descriptions and photography credits with their project data.

Font attribution and the included SIL Open Font License notices are in [assets/fonts/README.md](assets/fonts/README.md).

## Publishing

Prepare the public build:

```sh
python source/build.py --production
python source/check.py
```

This enables indexing for public pages and writes canonical URLs, sharing metadata, `robots.txt` and `sitemap.xml` for `https://proxydite.net`. Review the generated site locally, then commit source changes together with their generated pages and required media.

The check validates local links and assets, page metadata, canonical URLs, the sitemap and GitHub's file-size limit. It does not contact external links.

GitHub Pages publishes the repository root from `main`, using the custom domain in `CNAME`. A review branch does not publish to the live site. Publishing requires merging the reviewed production build into `main`; keep `CNAME` in place.
