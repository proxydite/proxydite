document.documentElement.classList.add('js');

// Preserve links to sections of the previous single-page portfolio.
if (location.pathname === '/' || location.pathname === '/index.html') {
  const legacySections = {
    '#projects': '/#selected-work',
    '#about': '/about/',
    '#video': '/work/moving-image/',
    '#theatre': '/#recent-collaborations',
    '#art': '/#art-and-technology',
    '#creativetech': '/work/creative-technology/',
    '#music': '/work/music/',
    '#contact': '/contact/',
    '#top': '/#hero-title'
  };
  if (legacySections[location.hash]) location.replace(legacySections[location.hash]);
}

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
function closeMenu(restoreFocus) {
  if (!navigation || !menuButton) return;
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
  if (restoreFocus) menuButton.focus();
}
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  matchMedia('(min-width:701px)').addEventListener('change', () => closeMenu(false));
}

const filters = [...document.querySelectorAll('[data-filter]')];
const rows = [...document.querySelectorAll('.index-row[data-category]')];
const count = document.querySelector('#work-count');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let visible = 0;
  rows.forEach(row => {
    row.hidden = category !== 'All' && row.dataset.category !== category;
    if (!row.hidden) visible++;
  });
  if (count) count.textContent = visible + (visible === 1 ? ' entry' : ' entries');
}));

const lightbox = document.querySelector('#image-viewer');
if (lightbox) {
  let opener = null;
  const enlarged = lightbox.querySelector('img');
  const caption = lightbox.querySelector('p');
  document.querySelectorAll('[data-enlarge]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      enlarged.src = button.dataset.enlarge;
      enlarged.alt = button.dataset.alt || '';
      caption.textContent = button.dataset.caption || '';
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => {
    const bounds = lightbox.getBoundingClientRect();
    if (event.target === lightbox && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    enlarged.removeAttribute('src');
    if (opener) opener.focus();
  });
}

document.querySelectorAll('video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  });
});
window.addEventListener('pagehide', () => document.querySelectorAll('video').forEach(video => video.pause()));
