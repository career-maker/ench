function initNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  const mq = window.matchMedia('(max-width: 991.98px)');

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-menu-open', open && mq.matches);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  mq.addEventListener('change', () => setMenu(false));
}

// Footer link groups become accordions on small screens (<768px); plain lists above that.
function initFooterAccordion() {
  const mq = window.matchMedia('(max-width: 767.98px)');
  document.querySelectorAll('.site-footer__group').forEach((group) => {
    const title = group.querySelector('.site-footer__title');
    const list = group.querySelector('ul');
    if (!title || !list) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'site-footer__toggle';
    btn.setAttribute('aria-expanded', 'false');
    list.id = list.id || `${title.id}-list`;
    btn.setAttribute('aria-controls', list.id);
    btn.innerHTML = '<span class="site-footer__toggle-icon" aria-hidden="true"></span>';
    title.append(btn);
    const sync = () => {
      const small = mq.matches;
      btn.hidden = !small;
      if (!small) { group.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    };
    btn.setAttribute('aria-label', `Toggle ${title.textContent.trim()} links`);
    title.addEventListener('click', (e) => {
      if (!mq.matches) return;
      const open = !group.classList.contains('is-open');
      group.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    mq.addEventListener('change', sync);
    sync();
  });
}

// Sticky header: hide on scroll down, show on scroll up; transparent again at the very top.
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    header.classList.toggle('is-stuck', y > 60);
    if (document.body.classList.contains('is-menu-open') || y <= 60) {
      header.classList.remove('is-hidden');
    } else if (delta > 6 && y > header.offsetHeight) {
      header.classList.add('is-hidden');
    } else if (delta < -6) {
      header.classList.remove('is-hidden');
    }
    if (Math.abs(delta) > 6 || y <= 60) lastY = y;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden')); // keyboard users
  update();
}
