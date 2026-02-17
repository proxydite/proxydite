/* proxydite single-page site
   - Content source: content.json (preferred when served via a local server)
   - Fallback: content.js (for file:// preview) which defines window.SITE_CONTENT
*/

const CONTENT_URL = "./content.json";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function safeGetEl(id) {
  return document.getElementById(id) || null;
}

function setText(id, text) {
  const el = safeGetEl(id);
  if (!el) return;
  el.textContent = isNonEmptyString(text) ? text : "";
}

function setHTML(id, html) {
  const el = safeGetEl(id);
  if (!el) return;
  el.innerHTML = isNonEmptyString(html) ? html : "";
}

function escapeHtml(str) {
  if (!isNonEmptyString(str)) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ").trim();
}

async function loadContent() {
  // Prefer content.json when served via a local server.
  try {
    const res = await fetch(CONTENT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== "object") throw new Error("Invalid JSON");
    return data;
  } catch (_) {
    // Fallback for file:// preview
    if (window.SITE_CONTENT && typeof window.SITE_CONTENT === "object") {
      return window.SITE_CONTENT;
    }
    throw new Error(
      "Content failed to load. Serve this folder with a local server (recommended), or ensure content.js is present for file:// preview."
    );
  }
}

function ensureImageSrc(img, fallbackSrc) {
  if (!img) return;
  img.addEventListener("error", () => {
    if (fallbackSrc && img.src !== fallbackSrc) img.src = fallbackSrc;
  });
}

function applySocialLinks(social) {
  if (!social || typeof social !== "object") return;

  const items = [
    ["instagram", "socialInstagram"],
    ["youtube", "socialYouTube"],
    ["bandcamp", "socialBandcamp"],
    ["vimeo", "socialVimeo"],
  ];

  for (const [key, id] of items) {
    const url = social[key];
    const el = safeGetEl(id);
    if (!el) continue;
    if (isNonEmptyString(url)) {
      el.href = url;
      el.classList.remove("is-hidden");
    } else {
      el.classList.add("is-hidden");
    }
  }
}

function renderWorkGrid(container, items) {
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="muted">No items yet.</p>`;
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "work-card";

    const title = escapeHtml(item.title || "");
    const year = escapeHtml(item.year || "");
    const tag = escapeHtml(item.tag || "");
    const text = escapeHtml(item.text || "");

    const images = Array.isArray(item.images) ? item.images : [];
    const firstImg = images[0];

    let mediaHtml = "";
    if (firstImg && isNonEmptyString(firstImg.src)) {
      mediaHtml = `
        <div class="work-media">
          <img src="${escapeAttr(firstImg.src)}" alt="${escapeAttr(firstImg.alt || item.title || "")}" loading="lazy" decoding="async">
        </div>
      `;
    }

    const meta = Array.isArray(item.meta) ? item.meta : [];
    const metaHtml = meta.length
      ? `<ul class="meta">
          ${meta
            .map((m) => {
              const label = escapeHtml(m.label || "");
              const value = escapeHtml(m.value || "");
              return `<li><span class="meta-label">${label}</span><span class="meta-value">${value}</span></li>`;
            })
            .join("")}
        </ul>`
      : "";

    const links = Array.isArray(item.links) ? item.links : [];
    const linksHtml = links.length
      ? `<div class="links">
          ${links
            .map((l) => {
              const label = escapeHtml(l.label || "Link");
              const url = escapeAttr(l.url || "#");
              return `<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`;
            })
            .join("")}
        </div>`
      : "";

    card.innerHTML = `
      ${mediaHtml}
      <div class="work-body">
        <div class="work-top">
          <h3>${title}</h3>
          <div class="work-tags">
            ${tag ? `<span class="pill">${tag}</span>` : ""}
            ${year ? `<span class="pill">${year}</span>` : ""}
          </div>
        </div>
        ${text ? `<p class="muted">${text}</p>` : ""}
        ${metaHtml}
        ${linksHtml}
      </div>
    `;

    container.appendChild(card);
  }
}

function renderParagraphs(container, paragraphs) {
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(paragraphs) || paragraphs.length === 0) return;

  for (const p of paragraphs) {
    const el = document.createElement("p");
    el.textContent = isNonEmptyString(p) ? p : "";
    container.appendChild(el);
  }
}

function renderBullets(container, items) {
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = isNonEmptyString(item) ? item : "";
    container.appendChild(li);
  }
}

function ensureInstagramScriptLoaded() {
  if (window.instgrm?.Embeds?.process) return Promise.resolve();

  const existing = Array.from(document.scripts).find((s) =>
    (s.src || "").includes("instagram.com/embed.js")
  );

  const waitForInstgrm = () =>
    new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (window.instgrm?.Embeds?.process) return resolve();
        if (Date.now() - start > 5000) return resolve(); // fail soft
        requestAnimationFrame(tick);
      };
      tick();
    });

  if (existing) {
    // If it already loaded, instgrm should appear quickly; if not, wait softly.
    return waitForInstgrm();
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(script);
  return waitForInstgrm();
}

async function renderInstagramEmbeds(container, embedsHtml) {
  if (!container) return;

  container.innerHTML = "";
  if (!Array.isArray(embedsHtml) || embedsHtml.length === 0) return;

  for (const html of embedsHtml) {
    const wrap = document.createElement("div");
    wrap.className = "embed-card";
    wrap.innerHTML = html; // trusted, provided by site owner
    container.appendChild(wrap);
  }

  await ensureInstagramScriptLoaded();
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  }
}

function renderTheatreCredits(container, credits) {
  if (!container) return;
  container.innerHTML = "";

  if (!credits || typeof credits !== "object") return;
  const groups = Array.isArray(credits.groups) ? credits.groups : [];
  if (groups.length === 0) return;

  for (const group of groups) {
    const details = document.createElement("details");
    details.className = "credits-group";

    const summary = document.createElement("summary");
    summary.textContent = group.role || "Credits";
    details.appendChild(summary);

    const ul = document.createElement("ul");
    for (const item of group.items || []) {
      const li = document.createElement("li");
      if (item.url) {
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = item.title || "";
        li.appendChild(a);
      } else {
        li.textContent = item.title || "";
      }
      ul.appendChild(li);
    }
    details.appendChild(ul);

    container.appendChild(details);
  }
}

function renderBandcamp(container, html) {
  if (!container) return;
  container.innerHTML = isNonEmptyString(html) ? html : "";
}

function enableSmoothScrolling() {
  // Smooth scroll within page
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function main() {
  const content = await loadContent();

  // Brand + meta
  const siteTitle = content?.site?.title || "proxydite";
  document.title = siteTitle;

  setText("brandTitle", siteTitle);
  setText("brandSubtitle", content?.site?.tagline || "");

  // Hero
  setText("heroName", content?.site?.hero?.name || "");
  setText("heroLead", content?.site?.hero?.lead || "");

  const heroImg = safeGetEl("heroImg");
  if (heroImg && content?.site?.hero?.image?.src) {
    heroImg.src = content.site.hero.image.src;
    heroImg.alt = content.site.hero.image.alt || "Hero image";
  }
  ensureImageSrc(heroImg, "assets/portrait.jpg");

  // Hero CTA (kept optional; this site currently uses text-only hero)
  const heroCta = safeGetEl("heroCta");
  if (heroCta) heroCta.innerHTML = "";

  // Social links
  applySocialLinks(content?.site?.social || {});

  // Work
  setText("workHeading", content?.work?.heading || "");
  setText("workIntro", content?.work?.intro || "");
  await renderInstagramEmbeds(safeGetEl("workEmbeds"), content?.work?.instagramEmbedsHtml || []);
  renderWorkGrid(safeGetEl("workGrid"), content?.work?.items || []);

  // About + Availability
  setText("aboutHeading", content?.about?.heading || "");
  renderParagraphs(safeGetEl("aboutBody"), content?.about?.body || []);

  setText("availabilityHeading", content?.availability?.heading || "");
  renderBullets(safeGetEl("availabilityBullets"), content?.availability?.bullets || []);

  // Theatre
  setText("theatreHeading", content?.theatre?.heading || "");
  setText("theatreIntro", content?.theatre?.intro || "");
  renderWorkGrid(safeGetEl("theatreGrid"), content?.theatre?.items || []);

  // Full theatre credits (inline)
  setText("theatreCreditsHeading", content?.theatreCredits?.heading || "Full theatre credits");
  setText("theatreCreditsNote", content?.theatreCredits?.note || "");
  renderTheatreCredits(safeGetEl("theatreCreditsContent"), content?.theatreCredits || {});

  // Music (Bandcamp grid)
  setText("musicHeading", content?.music?.heading || "");
  setText("musicIntro", content?.music?.intro || "");
  renderBandcamp(safeGetEl("musicEmbeds"), content?.music?.bandcampHtml || "");

  // Contact
  setText("contactHeading", content?.contact?.heading || "");
  const emailEl = safeGetEl("contactEmail");
  if (emailEl && isNonEmptyString(content?.contact?.email)) {
    emailEl.href = `mailto:${content.contact.email}`;
    emailEl.textContent = content.contact.email;
  }
  setText("contactNote", content?.contact?.note || "");

  enableSmoothScrolling();
}

document.addEventListener("DOMContentLoaded", () => {
  main().catch((err) => {
    // Keep the page usable even if content load fails.
    console.error(err);
  });
});
