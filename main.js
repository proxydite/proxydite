/* proxydite — single-page site renderer */

function qs(sel, parent = document) {
  return parent.querySelector(sel);
}

function qsa(sel, parent = document) {
  return [...parent.querySelectorAll(sel)];
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value ?? '';
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadContent() {
  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // For local file:// preview, fetch() is blocked by most browsers.
    if (window.SITE_CONTENT) return window.SITE_CONTENT;
    console.error('Failed to load content.json and no fallback content.js was found.', err);
    return null;
  }
}

function renderFeaturedCredits(container, items = []) {
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="loading">No featured credits yet.</div>';
    return;
  }

  for (const item of items) {
    const el = document.createElement(item.href ? 'a' : 'div');
    el.className = 'featured-item';
    if (item.href) {
      el.href = item.href;
      el.style.textDecoration = 'none';
    }

    const role = document.createElement('div');
    role.className = 'featured-role';
    role.textContent = item.role || '';

    const title = document.createElement('div');
    title.className = 'featured-title';
    title.textContent = item.title || '';

    const meta = document.createElement('p');
    meta.className = 'featured-meta';
    const parts = [item.context, item.year].filter(Boolean);
    meta.textContent = parts.join(' · ');

    el.appendChild(role);
    el.appendChild(title);
    el.appendChild(meta);

    container.appendChild(el);
  }
}

function renderWorkGrid(container, items = [], accent = 'work') {
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="loading">No items yet.</div>';
    return;
  }

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'work-card';
    card.dataset.accent = accent;

    // Media / images
    if (Array.isArray(item.images) && item.images.length) {
      const media = document.createElement('div');
      media.className = 'work-media';

      const gallery = document.createElement('div');
      gallery.className = 'work-gallery';

      for (const img of item.images) {
        const image = document.createElement('img');
        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = img.src;
        image.alt = img.alt || item.title || '';
        gallery.appendChild(image);
      }

      media.appendChild(gallery);
      card.appendChild(media);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'work-body';

    const top = document.createElement('div');
    top.className = 'work-top';

    const title = document.createElement('h3');
    title.className = 'work-title';
    title.textContent = item.title || '';

    top.appendChild(title);

    const tagText = [item.tag, item.year].filter(Boolean).join(' · ');
    if (tagText) {
      const tag = document.createElement('div');
      tag.className = 'work-tag';
      tag.textContent = tagText;
      top.appendChild(tag);
    }

    body.appendChild(top);

    if (item.text) {
      const p = document.createElement('p');
      p.className = 'work-text';
      p.textContent = item.text;
      body.appendChild(p);
    }

    const metaItems = Array.isArray(item.meta) ? [...item.meta] : [];

    // If year exists and not already in meta, add it.
    if (item.year && !metaItems.some(m => (m.label || '').toLowerCase() === 'year')) {
      metaItems.unshift({ label: 'Year', value: item.year });
    }

    if (metaItems.length) {
      const ul = document.createElement('ul');
      ul.className = 'meta';
      for (const m of metaItems) {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = m.label || '';
        const value = document.createElement('span');
        value.className = 'value';
        value.textContent = m.value || '';
        li.appendChild(label);
        li.appendChild(value);
        ul.appendChild(li);
      }
      body.appendChild(ul);
    }

    if (Array.isArray(item.links) && item.links.length) {
      const links = document.createElement('div');
      links.className = 'work-links';
      for (const l of item.links) {
        const a = document.createElement('a');
        a.className = 'pill';
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = l.label || 'Link';
        links.appendChild(a);
      }
      body.appendChild(links);
    }

    card.appendChild(body);
    container.appendChild(card);
  }
}

function ensureInstagramScript() {
  return new Promise((resolve, reject) => {
    if (window.instgrm && window.instgrm.Embeds) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Instagram script failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Instagram script failed to load.'));
    document.body.appendChild(script);
  });
}

async function renderInstagramEmbeds(container, posts = []) {
  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = '<div class="loading">No videos yet.</div>';
    return;
  }

  for (const post of posts) {
    const card = document.createElement('div');
    card.className = 'embed-card';

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'instagram-media';
    blockquote.setAttribute('data-instgrm-permalink', post.url);
    blockquote.setAttribute('data-instgrm-version', '14');
    if (post.captioned) blockquote.setAttribute('data-instgrm-captioned', '');

    // Minimal placeholder (the embed.js script will replace it).
    blockquote.innerHTML = `
      <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener">View this on Instagram</a>
    `;

    card.appendChild(blockquote);
    container.appendChild(card);
  }

  try {
    await ensureInstagramScript();
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
      window.instgrm.Embeds.process();
    }
  } catch (err) {
    console.warn(err);
    // Leave placeholder links in place.
  }
}

function renderMusic(container, releases = []) {
  container.innerHTML = '';

  if (!releases.length) {
    container.innerHTML = '<div class="loading">No releases yet.</div>';
    return;
  }

  for (const rel of releases) {
    const card = document.createElement('article');
    card.className = 'music-card';

    const h = document.createElement('h3');
    h.textContent = rel.title || 'Release';

    const iframe = document.createElement('iframe');
    iframe.className = 'music-frame';
    iframe.loading = 'lazy';
    iframe.src = rel.embedSrc;
    iframe.height = rel.height || 472;
    iframe.setAttribute('title', `${rel.title || 'Bandcamp'} player`);
    iframe.setAttribute('seamless', '');

    const links = document.createElement('div');
    links.className = 'music-links';
    links.innerHTML = `<a href="${escapeHtml(rel.url)}" target="_blank" rel="noopener">Open on Bandcamp →</a>`;

    card.appendChild(h);
    card.appendChild(iframe);
    card.appendChild(links);

    container.appendChild(card);
  }
}

function renderAbout(container, paragraphs = []) {
  container.innerHTML = '';
  for (const p of paragraphs) {
    const el = document.createElement('p');
    el.textContent = p;
    container.appendChild(el);
  }
}

function renderAvailability(listEl, bullets = []) {
  listEl.innerHTML = '';
  for (const b of bullets) {
    const li = document.createElement('li');
    li.textContent = b;
    listEl.appendChild(li);
  }
}

function setupCreditsModal(content) {
  const modal = document.getElementById('creditsModal');
  const openBtn = document.getElementById('openCreditsBtn');
  const closeEls = qsa('[data-close]', modal);
  const creditsTitle = document.getElementById('creditsTitle');
  const creditsNote = document.getElementById('creditsNote');
  const creditsContent = document.getElementById('creditsContent');

  if (!modal || !openBtn || !creditsContent) return;

  const credits = content.theatreCredits;
  if (!credits) {
    openBtn.style.display = 'none';
    return;
  }

  creditsTitle.textContent = credits.heading || 'Full theatre credits';
  creditsNote.textContent = credits.note || '';

  // Build credits UI
  creditsContent.innerHTML = '';
  for (const group of credits.groups || []) {
    const details = document.createElement('details');

    const summary = document.createElement('summary');
    summary.textContent = group.role || 'Credits';

    details.appendChild(summary);

    const ul = document.createElement('ul');

    for (const item of group.items || []) {
      const li = document.createElement('li');
      const title = item.title || '';
      const ctx = item.context ? ` — ${item.context}` : '';
      const notes = item.notes ? ` (${item.notes})` : '';
      if (item.url) {
        li.innerHTML = `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(title)}</a>${escapeHtml(ctx)}${escapeHtml(notes)}`;
      } else {
        li.textContent = `${title}${ctx}${notes}`;
      }
      ul.appendChild(li);
    }

    details.appendChild(ul);
    creditsContent.appendChild(details);
  }

  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the close button.
    const close = qs('[data-close]', modal);
    if (close) close.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openBtn.addEventListener('click', openModal);
  for (const el of closeEls) {
    el.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // Prevent clicks in dialog from closing modal
  const dialog = qs('.modal-dialog', modal);
  if (dialog) {
    dialog.addEventListener('click', (e) => e.stopPropagation());
  }

  // Backdrop click closes
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });
}

function applySocialLinks(content) {
  const { social } = content.site || {};
  if (!social) return;

  const insta = qs('a[aria-label="Instagram"]');
  const x = qs('a[aria-label="X"]');
  if (insta && social.instagram) insta.href = social.instagram;
  if (x && social.x) x.href = social.x;
}

async function main() {
  setText('year', new Date().getFullYear());

  const content = await loadContent();
  if (!content) return;

  // Site / hero
  if (content.site) {
    document.title = content.site.title || document.title;
    setText('brandTitle', content.site.title || 'proxydite');
    setText('brandSubtitle', content.site.tagline || '');

    const hero = content.site.hero || {};
    setText('heroName', hero.name || '');
    setText('heroLead', hero.lead || '');
    setText('heroTagline', content.site.tagline || '');

    if (hero.image?.src) {
      const img = document.getElementById('heroImg');
      if (img) {
        img.src = hero.image.src;
        img.alt = hero.image.alt || '';
      }
    }

    // Hero CTA
    const heroCta = document.getElementById('heroCta');
    if (heroCta && Array.isArray(hero.cta) && hero.cta.length) {
      heroCta.innerHTML = '';
      hero.cta.slice(0, 3).forEach((c, idx) => {
        const a = document.createElement('a');
        a.href = c.href;
        a.className = idx === 0 ? 'btn' : 'btn btn-ghost';
        a.textContent = c.label;
        heroCta.appendChild(a);
      });
    }

    applySocialLinks(content);
  }

  // Featured
  if (content.featured) {
    setText('featuredHeading', content.featured.heading || 'Recent credits');
    renderFeaturedCredits(document.getElementById('featuredCredits'), content.featured.items || []);
  }

  // Selected work
  if (content.work) {
    setText('workHeading', content.work.heading || 'Selected work');
    setText('workIntro', content.work.intro || '');
    renderWorkGrid(document.getElementById('workGrid'), content.work.items || [], 'work');
  }

  // Theatre
  if (content.theatre) {
    setText('theatreHeading', content.theatre.heading || 'Theatre (selected)');
    setText('theatreIntro', content.theatre.intro || '');
    renderWorkGrid(document.getElementById('theatreGrid'), content.theatre.items || [], 'theatre');
  }

  // Videos
  if (content.videos) {
    setText('videosHeading', content.videos.heading || 'Video notes');
    setText('videosIntro', content.videos.intro || '');
    await renderInstagramEmbeds(document.getElementById('instagramEmbeds'), content.videos.instagram || []);
  }

  // Music
  if (content.music) {
    setText('musicHeading', content.music.heading || 'Music');
    setText('musicIntro', content.music.intro || '');
    renderMusic(document.getElementById('musicGrid'), content.music.releases || []);
  }

  // About
  if (content.about) {
    setText('aboutHeading', content.about.heading || 'About');
    renderAbout(document.getElementById('aboutBody'), content.about.body || []);
    setText('openCreditsBtn', content.about.creditsButtonLabel || 'Full theatre credits');
  }

  // Availability
  if (content.availability) {
    setText('availabilityHeading', content.availability.heading || 'Work with me');
    renderAvailability(document.getElementById('availabilityBullets'), content.availability.bullets || []);
  }

  // Contact
  if (content.contact) {
    setText('contactHeading', content.contact.heading || 'Contact');
    const email = content.contact.email || '';
    const emailEl = document.getElementById('contactEmail');
    if (emailEl && email) {
      emailEl.textContent = email;
      emailEl.href = `mailto:${email}`;
    }
    setText('contactNote', content.contact.note || '');
  }

  setupCreditsModal(content);
}

main();
