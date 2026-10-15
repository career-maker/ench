// Reveal-on-scroll, hero slider and destination tabs. No libraries; respects prefers-reduced-motion.
function initAnimation() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
  } else {
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  initTitles(reduce);
  initBgFade(reduce);
  initCoverflow(reduce);
  initBanners(reduce);

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero__slide')];
    const dots = [...hero.querySelectorAll('.hero__dots button')];
    let i = 0, timer;
    const show = (n) => {
      i = n;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === n));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === n)));
    };
    const play = () => { if (!reduce) timer = setInterval(() => show((i + 1) % slides.length), 6000); };
    dots.forEach((d, k) => d.addEventListener('click', () => { clearInterval(timer); show(k); play(); }));
    play();
  }

  const tabs = [...document.querySelectorAll('[data-location]')];
  const cur = document.querySelector('[data-location-photo]');
  const nxt = document.querySelector('[data-location-photo-next]');
  let busy = false, queued = null;
  // Crossfade: next image is loaded on the hidden layer, then faded in over the current one.
  const swap = (t) => {
    if (!cur || !nxt || cur.getAttribute('src') === t.dataset.img) return;
    busy = true;
    const done = () => {
      cur.src = nxt.src; cur.alt = t.dataset.alt;
      nxt.classList.remove('is-showing');
      busy = false;
      if (queued && queued.dataset.img !== cur.getAttribute('src')) { const q = queued; queued = null; swap(q); }
      queued = null;
    };
    nxt.onload = () => {
      nxt.getBoundingClientRect(); // flush so the transition runs
      nxt.classList.add('is-showing');
      setTimeout(done, reduce ? 0 : 750);
    };
    nxt.alt = t.dataset.alt;
    nxt.src = t.dataset.img;
  };
  const select = (t) => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    if (busy) { queued = t; return; }
    swap(t);
  };
  tabs.forEach((t) => ['mouseenter', 'focus', 'click'].forEach((ev) => t.addEventListener(ev, () => select(t))));
}

// Split headings into words (keeps <br>, sr-only helpers and inline spacing) and reveal them on view.
function initTitles(reduce) {
  const root = document.documentElement;
  if (reduce || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('main h1, main h2, main h3:not(.photo-card__title), .site-footer__title:not(.site-footer__group .site-footer__title)');
  const split = (node, counter) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span');
          w.className = 'word';
          const i = document.createElement('span');
          i.className = 'word__inner';
          i.style.setProperty('--i', counter.n++);
          i.textContent = part;
          w.append(i);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('sr-only')) {
        split(child, counter);
      }
    });
  };
  targets.forEach((el) => { split(el, { n: 0 }); el.setAttribute('data-split', ''); });
  root.classList.add('anim-ready');
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  requestAnimationFrame(() => targets.forEach((el) => io.observe(el)));
}

// Banner (CTA) zoom/ghost reveal when scrolled into view.
function initBanners(reduce) {
  const ctas = document.querySelectorAll('.cta');
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('anim-ready');
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: 0.25 });
  ctas.forEach((c) => io.observe(c));
}

// Full-section background slideshow (crossfade, slow zoom) for [data-bgfade] containers.
function initBgFade(reduce) {
  document.querySelectorAll('[data-bgfade]').forEach((box) => {
    const imgs = [...box.querySelectorAll('img')];
    if (imgs.length < 2 || reduce) return;
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove('is-active');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('is-active');
    }, 6500);
  });
}

// Coverflow: centre image with its neighbours peeking left/right; advances every 2s, endless loop.
function initCoverflow(reduce) {
  document.querySelectorAll('[data-coverflow]').forEach((box) => {
    const slides = [...box.querySelectorAll('.coverflow__slide')];
    const n = slides.length;
    if (n < 3) return;
    let cur = 0;
    const roles = ['is-active', 'is-prev', 'is-next'];
    const paint = (jumper) => {
      slides.forEach((s, i) => {
        const role = i === cur ? 'is-active' : i === (cur + n - 1) % n ? 'is-prev' : 'is-next';
        if (s === jumper) { s.classList.add('is-jump'); }
        s.classList.remove(...roles);
        s.classList.add(role);
        s.setAttribute('aria-hidden', String(role !== 'is-active'));
      });
      if (jumper) { jumper.getBoundingClientRect(); jumper.classList.remove('is-jump'); }
    };
    paint();
    if (reduce) return;
    setInterval(() => {
      // the slide leaving the left side wraps to the right side without crossing the centre
      const jumper = slides[(cur + n - 1) % n];
      cur = (cur + 1) % n;
      paint(jumper);
    }, 2000);
  });
}
