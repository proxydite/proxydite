/* ==========================================================================
   proxydite — main.js
   Renders the whole site from window.SITE_CONTENT (content.js).
   No content lives here: edit content.js instead.
   ========================================================================== */

(function () {
  "use strict";

  const C = window.SITE_CONTENT;
  if (!C) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:monospace'>content.js failed to load.</p>";
    return;
  }

  /* ---------- utilities ---------- */

  const $ = (id) => document.getElementById(id);

  function esc(s) {
    if (typeof s !== "string") return "";
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const attr = (s) => esc(s).replaceAll("\n", " ").trim();

  /* ---------- intro (plays once per session; skipped for reduced motion) ---------- */

  (function intro() {
    const el = $("intro");
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!C.intro || !C.intro.enabled || reduced || sessionStorage.getItem("px-intro")) {
      el.remove();
      return;
    }
    try { sessionStorage.setItem("px-intro", "1"); } catch (e) { /* private mode */ }
    $("introWord").textContent = C.site.title;
    $("introTag").textContent = C.site.tagline;
    document.body.classList.add("intro-lock");
    const shapes = $("introShapes");
    const tMorph = setTimeout(() => { shapes.dataset.config = "2"; }, 1250);
    const tEnd = setTimeout(end, 3050);
    function end() {
      clearTimeout(tMorph); clearTimeout(tEnd);
      el.classList.add("out");
      document.body.classList.remove("intro-lock");
      setTimeout(() => el.remove(), 800);
    }
    el.addEventListener("click", end);
  })();

  /* ---------- media rendering ---------- */

  function pendingFrame(item, ratio) {
    return `<div class="ph ${ratio || "r169"}">
      ${item.kind !== "image" ? '<div class="play">▶</div>' : ""}
      ${item.title ? `<span class="t">${esc(item.title)}</span>` : ""}
      <span class="f">${esc(item.note || "coming soon")}</span>
    </div>`;
  }

  function media(item, ratio) {
    if (!item) return "";
    let inner = "";

    if (item.pending) {
      inner = pendingFrame(item, ratio);
    } else if (item.kind === "image") {
      if (item.natural) {
        inner = `<img class="natural" src="${attr(item.src)}" alt="${attr(item.alt || "")}" loading="lazy" decoding="async">`;
      } else {
        inner = `<div class="imgframe ${ratio || ""}"><img src="${attr(item.src)}" alt="${attr(item.alt || "")}" loading="lazy" decoding="async"></div>`;
      }
    } else if (item.kind === "video") {
      inner = `<video controls preload="none" playsinline ${item.poster ? `poster="${attr(item.poster)}"` : ""} src="${attr(item.src)}" title="${attr(item.title || "")}"></video>`;
    } else if (item.kind === "vimeo") {
      inner = `<div class="embed169"><iframe src="https://player.vimeo.com/video/${attr(item.vimeoId)}?dnt=1" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen title="${attr(item.title || "Vimeo video")}"></iframe></div>`;
    }

    const cap = item.caption ? `<p class="caption">${esc(item.caption)}</p>` : "";
    return `<figure class="media">${inner}${cap}</figure>`;
  }

  function renderBlocks(blocks) {
    return (blocks || []).map((b) => {
      if (b.type === "paras") {
        return `<div class="ptext">${b.items.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
      }
      if (b.type === "grid") {
        return `<div class="pgrid cols${b.cols || 3}">${b.items.map((i) => media(i, i.ratio)).join("")}</div>`;
      }
      if (b.type === "media") {
        return `<div class="pwide">${media(b.item, "r169")}</div>`;
      }
      if (b.type === "links") {
        return `<div class="plinks">${b.items
          .map((l) => `<a href="${attr(l.url)}">${esc(l.label)}</a>`)
          .join("")}</div>`;
      }
      return "";
    }).join("");
  }

  /* ---------- panel ---------- */

  const panel = $("panel");
  const panelInner = $("panelInner");
  const panelClose = $("panelClose");
  let lastFocus = null;

  function openPanel(html) {
    lastFocus = document.activeElement;
    panelInner.innerHTML = html;
    [...panelInner.children].forEach((el, i) => {
      el.classList.add("arrive");
      el.style.animationDelay = (0.25 + i * 0.22) + "s";
    });
    panel.classList.add("open");
    document.body.style.overflow = "hidden";
    panel.scrollTop = 0;
    collectGallery();
    panelClose.focus();
  }

  function closePanel() {
    panel.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  panelClose.addEventListener("click", closePanel);
  panel.addEventListener("click", (e) => { if (e.target === panel) closePanel(); });

  /* ---------- lightbox (images inside panels) ---------- */

  const lb = $("lightbox");
  const lbImg = $("lbImg");
  const lbCount = $("lbCount");
  const lbCaption = $("lbCaption");
  const lbPrev = $("lbPrev");
  const lbNext = $("lbNext");
  let gallery = [];
  let gIndex = 0;

  function collectGallery() {
    gallery = [];
    const imgs = [...panelInner.querySelectorAll("img")];
    imgs.forEach((img, i) => {
      const fig = img.closest("figure");
      const cap = fig ? fig.querySelector(".caption") : null;
      gallery.push({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        caption: cap ? cap.textContent : ""
      });
      img.classList.add("zoomable");
      img.addEventListener("click", () => openLightbox(i));
    });
  }

  function showSlide() {
    const g = gallery[gIndex];
    if (!g) return;
    lbImg.src = g.src;
    lbImg.alt = g.alt;
    lbCount.textContent = gallery.length > 1 ? `${gIndex + 1} / ${gallery.length}` : "";
    lbCaption.textContent = g.caption;
    const solo = gallery.length < 2;
    lbPrev.style.visibility = solo ? "hidden" : "visible";
    lbNext.style.visibility = solo ? "hidden" : "visible";
  }

  function openLightbox(i) {
    gIndex = i;
    showSlide();
    lb.classList.add("open");
    $("lbClose").focus();
  }

  function closeLightbox() {
    lb.classList.remove("open");
    lbImg.src = "";
    panelClose.focus();
  }

  function lbStep(dir) {
    if (gallery.length < 2) return;
    gIndex = (gIndex + dir + gallery.length) % gallery.length;
    showSlide();
  }

  $("lbClose").addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => lbStep(-1));
  lbNext.addEventListener("click", () => lbStep(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

  /* swipe */
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) lbStep(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* keys: lightbox first, then panel */
  document.addEventListener("keydown", (e) => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "ArrowLeft") lbStep(-1);
      return;
    }
    if (e.key === "Escape") {
      const mn = $("mnav");
      if (mn && mn.classList.contains("open")) { mn.classList.remove("open"); document.body.style.overflow = ""; return; }
      if (panel.classList.contains("open")) closePanel();
    }
  });

  /* ---------- head / hero / footer ---------- */

  document.title = C.site.title;
  $("wordmark").textContent = C.site.title;
  $("tagline").textContent = C.site.tagline;
  $("heroName").textContent = C.hero.name;
  $("heroLead").textContent = C.hero.lead;
  const heroImg = $("heroImg");
  heroImg.src = C.hero.image.src;
  heroImg.alt = C.hero.image.alt || "";
  $("footerText").textContent = C.footer;

  /* ---------- header: socials + nav ---------- */

const ICONS = {
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.3.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.3.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.1.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.1 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.1-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.1-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.9a1.1 1.1 0 1 1 0 2.3 1.1 1.1 0 0 1 0-2.3Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  substack: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 3H2v2.4h20V3ZM2 7.9v2.4h20V7.9H2Zm0 4.9V21l10-5.5L22 21v-8.2H2Z"/></svg>'
};

  $("socials").innerHTML = (C.socials || [])
    .map((s) => `<a href="${attr(s.url)}" target="_blank" rel="noopener" aria-label="${attr(s.label)}" title="${attr(s.label)}">${ICONS[s.id] || esc(s.label)}</a>`)
    .join("");

  $("nav").innerHTML = C.nav
    .map((n) => `<a href="${attr(n.to)}">${esc(n.label)}</a>`)
    .join("");

  document.querySelectorAll("#nav a").forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- mobile menu ---------- */

  const mnav = $("mnav");
  const menuToggle = $("menuToggle");

  $("mnavLinks").innerHTML = C.nav
    .map((n) => `<a href="${attr(n.to)}">${esc(n.label)}</a>`)
    .join("");

  function openMnav() {
    mnav.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMnav() {
    mnav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", openMnav);
  $("mnavClose").addEventListener("click", closeMnav);
  mnav.addEventListener("click", (e) => { if (e.target === mnav) closeMnav(); });
  document.querySelectorAll("#mnavLinks a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeMnav();
      const el = document.querySelector(a.getAttribute("href"));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- tile sections (Ongoing Projects, Art, Creative Technology) ---------- */

  function renderTileSection(items, mountId) {
    const mount = $(mountId);
    (items || []).forEach((p) => {
      const b = document.createElement("button");
      b.className = "ptile";
      const imgHtml = (p.tile && p.tile.src)
        ? `<img src="${attr(p.tile.src)}" alt="${attr(p.tile.alt || p.title)}" loading="lazy" decoding="async">`
        : `<span class="ph tileph"><span class="t">${esc(p.title)}</span><span class="f">image to come</span></span>`;
      b.innerHTML = `${imgHtml}
        <span class="pt-label">
          <span class="pt-title">${esc(p.title)}</span>
          <span class="pt-cta">${esc(p.cta || "enter the project →")}</span>
        </span>`;
      b.addEventListener("click", () => {
        openPanel(`
          <h3>${esc(p.title)}</h3>
          ${p.panel.meta ? `<p class="pmeta">${esc(p.panel.meta)}</p>` : ""}
          ${renderBlocks(p.panel.blocks)}
        `);
      });
      mount.appendChild(b);
    });
  }

  $("projectsHeading").textContent = C.projects.heading;
  renderTileSection(C.projects.items, "projectTiles");

  $("artHeading").textContent = C.art.heading;
  renderTileSection(C.art.groups, "artTiles");

  if (C.creativeTech && C.creativeTech.enabled) {
    $("creativetechWrap").hidden = false;
    $("ctHeading").textContent = C.creativeTech.heading;
    renderTileSection(C.creativeTech.groups, "ctTiles");
  }

  /* ---------- upcoming ---------- */

  if (C.upcoming && C.upcoming.items && C.upcoming.items.length) {
    $("upcomingWrap").hidden = false;
    $("upcomingHeading").textContent = C.upcoming.heading;
    $("upcomingList").innerHTML = C.upcoming.items.map((u) => {
      const t = u.url
        ? `<a class="up-title" href="${attr(u.url)}" target="_blank" rel="noopener">${esc(u.title)}</a>`
        : `<span class="up-title">${esc(u.title)}</span>`;
      const meta = [u.by, u.role, u.venue, u.when].filter(Boolean).join(" · ");
      return `<div class="up-item">${t}<p class="up-meta">${esc(meta)}</p></div>`;
    }).join("");
  }

  /* ---------- about ---------- */

  $("aboutHeading").textContent = C.about.heading;
  $("aboutBody").innerHTML = C.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
  $("aboutBullets").innerHTML = C.about.bullets.map((b) => `<li>${esc(b)}</li>`).join("");

  /* ---------- video art ---------- */

  $("videoHeading").textContent = C.video.heading;
  $("videoSpotlight").innerHTML = media(C.video.spotlight, "r169");
  const feat = $("videoFeatured");
  if (C.video.featured && C.video.featured.length) {
    feat.innerHTML = C.video.featured.map((v) => media(v, "r169")).join("");
  } else {
    feat.remove();
  }
  $("videoTrack").innerHTML = C.video.items
    .map((v) => `<div class="c-slide vid">${media(v, "r169")}</div>`)
    .join("");

  /* ---------- theatre ---------- */

  $("theatreHeading").textContent = C.theatre.heading;
  $("theatreIntro").textContent = C.theatre.intro;
  $("theatreNote").textContent = C.theatre.rowNote;

  const row = $("theatreRow");
  C.theatre.row.forEach((t) => {
    const b = document.createElement("button");
    b.innerHTML = `<img src="${attr(t.img)}" alt="${attr(t.title)}" loading="lazy" decoding="async"><span class="lbl">${esc(t.title)}</span>`;
    b.addEventListener("click", () => {
      openPanel(`
        <h3>${esc(t.title)}</h3>
        <p class="pmeta">${esc(t.role)} · ${esc(t.venue)} · ${esc(t.year)}</p>
        <div class="ptext"><p>${esc(t.text)}</p></div>
        <div class="pwide"><figure class="media"><div class="imgframe r169"><img src="${attr(t.img)}" alt="${attr(t.title)}" loading="lazy"></div></figure></div>
        ${t.url ? `<div class="plinks"><a href="${attr(t.url)}" target="_blank" rel="noopener">→ production page</a></div>` : ""}
      `);
    });
    row.appendChild(b);
  });

  const credits = C.theatre.credits;
  $("creditsSummary").textContent = credits.heading;
  $("creditsGroups").innerHTML = credits.groups.map((g) => `
    <details class="role">
      <summary>${esc(g.role)}</summary>
      <ul>${g.items.map((i) => `
        <li>${i.url
          ? `<a href="${attr(i.url)}" target="_blank" rel="noopener">${esc(i.title)}</a>`
          : esc(i.title)}${i.context ? ` <span class="ctx">· ${esc(i.context)}</span>` : ""}</li>`).join("")}
      </ul>
    </details>`).join("");

  /* ---------- music ---------- */

  $("musicHeading").textContent = C.music.heading;
  $("musicIntro").textContent = C.music.intro;
  $("musicGrid").innerHTML = C.music.embeds.map((m) => `
    <div class="bc">
      <iframe loading="lazy" title="${attr(m.title)} — Bandcamp"
        src="https://bandcamp.com/EmbeddedPlayer/album=${attr(m.album)}/size=large/bgcol=${attr(C.music.playerBg)}/linkcol=${attr(C.music.playerLink)}/tracklist=false/transparent=true/"
        seamless><a href="${attr(m.link)}">${esc(m.title)} by proxydite</a></iframe>
    </div>`).join("");

  /* ---------- contact ---------- */

  $("contactHeading").textContent = C.contact.heading;
  const email = $("contactEmail");
  email.textContent = C.contact.email;
  email.href = "mailto:" + C.contact.email;
  $("contactNote").textContent = C.contact.note;

  /* ---------- dividers: figures taking turns being visible ---------- */

  const FIGURE = `<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 1.5 C7.5 1.5 5.4 5.2 5.4 9.4 L5 29.8 C5 32.4 7.2 34.5 9.4 34.5 L14.6 34.5 C16.8 34.5 19 32.4 19 29.8 L18.6 9.4 C18.6 5.2 16.5 1.5 12 1.5 Z"/></svg>`;
  document.querySelectorAll(".divider").forEach((d) => {
    d.innerHTML = FIGURE.repeat(7);
  });

  /* ---------- return to top ---------- */

  const toTop = $("toTop");
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });

  /* ---------- carousels ---------- */

  document.querySelectorAll("[data-carousel]").forEach((c) => {
    const track = c.querySelector(".c-track");
    const count = c.querySelector(".c-count");
    const slides = () => [...track.querySelectorAll(".c-slide")];
    const step = () => {
      const s = slides();
      return s.length > 1 ? s[1].offsetLeft - s[0].offsetLeft : track.clientWidth;
    };
    const updateCount = () => {
      const s = slides();
      if (!s.length) return;
      const i = Math.min(s.length - 1, Math.max(0, Math.round(track.scrollLeft / step())));
      count.textContent = `${i + 1} / ${s.length}`;
    };
    c.querySelector(".c-next").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    c.querySelector(".c-prev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    track.addEventListener("scroll", updateCount, { passive: true });
    updateCount();
  });

})();
