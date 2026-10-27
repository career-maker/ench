// Generates src/pages for Destinations, Celebrations and Luxe from the client Word-doc text in scripts/content/*.txt
// (one line per paragraph, "[Style] " prefix). Copy lives only in those files; re-run `npm run gen` then `npm run html`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = (f) => readFileSync(join(root, 'scripts/content', f), 'utf8').split('\n').filter(Boolean)
  .map((l) => { const m = l.match(/^\[(\w+)\] (.*)$/); return m ? { s: m[1], t: m[2] } : { s: '', t: l }; });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const T = (n) => `assets/images/temp/${n}-temp.webp`; // temp stock photos, see docs/image-manifest.md
const write = (name, meta, body) => writeFileSync(join(root, 'src/pages', name), `<!-- ${JSON.stringify(meta)} -->\n${body}\n`);
const hero = (img, crumbs, title) => `<section class="hero hero--inner">
  <div class="hero__slides"><img class="hero__slide is-active" src="${img}" alt="" width="1920" height="1080" fetchpriority="high"></div>
  <div class="container hero__inner">
    <nav class="breadcrumbs hero__crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([h, l]) => (h ? `<li><a href="${h}">${esc(l)}</a></li>` : `<li aria-current="page">${esc(l)}</li>`)).join('')}</ol></nav>
    <h1 class="h-display hero__title">${esc(title)}</h1>
  </div>
</section>`;
const tc = (s) => s.toLowerCase().replace(/(^|[ ,-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const ps = (arr) => arr.map((t) => `<p>${esc(t)}</p>`).join('');
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const card = (href, img, num, title, text) => `<a class="topic-card" href="${href}"><span class="topic-card__img"><img src="${img}" alt="" width="1400" height="933" loading="lazy"></span>${num ? `<span class="topic-card__num">${num}</span>` : ''}<span class="topic-card__title">${esc(title)}</span>${text ? `<span class="topic-card__text">${esc(text)}</span>` : ''}</a>`;

// ---------- Destinations ----------
const L = lines('destinations.txt');
const planAt = L.findIndex((x) => x.t === "LET'S PLAN YOUR THAILAND");
const idx = L.map((x, i) => (x.s === 'Heading1' ? i : -1)).filter((i) => i >= 0);
const hubLines = L.slice(idx[0], idx[1]);
const tail = L.slice(planAt);
const dests = idx.slice(1).map((start, k) => {
  const blk = L.slice(start, idx[k + 2] ?? planAt);
  const secs = [];
  let cur = { h3: null, ps: [] };
  for (const x of blk.slice(2)) { if (x.s === 'Heading3') { secs.push(cur); cur = { h3: x.t, ps: [] }; } else cur.ps.push(x.t); }
  secs.push(cur);
  const name = blk[0].t.split(' ').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
  return { name, slug: slug(name), tag: blk[1].t, intro: secs[0].ps, secs: secs.slice(1) };
});
const IMG = { bangkok: 'dest-bangkok', 'chiang-mai': 'dest-chiang-mai', pattaya: 'dest-pattaya', ayutthaya: 'dest-ayutthaya', 'hua-hin': 'dest-hua-hin' };

const hubH2 = hubLines.filter((x) => x.s === 'Heading2'), hubP = hubLines.filter((x) => x.s === 'NormalWeb');
write('destinations.html', { title: 'Destinations | Enchantive Asia', desc: hubP[0].t, nav: 'destinations', og: T('destinations-hero') },
`${hero(T('destinations-hero'), [['index.html', 'Home'], [null, 'Destinations']], tc(hubLines[0].t))}
<section class="section" aria-labelledby="dest-hub-title">
  <div class="container split split--top">
    <h2 class="h-1 reveal" id="dest-hub-title">${esc(hubH2[0].t)}</h2>
    <div class="stack reveal">${ps(hubP.slice(0, 2).map((x) => x.t))}</div>
  </div>
</section>
<section class="section section--flush-top" aria-label="Destinations">
  <div class="container"><div class="topic-grid topic-grid--3">
    ${dests.map((d, i) => card(`destination-${d.slug}.html`, T(IMG[d.slug]), `0${i + 1}`, d.name, d.tag)).join('\n    ')}
  </div></div>
</section>
<section class="section section--tint" aria-labelledby="dest-journey-title">
  <div class="container split split--top">
    <h2 class="h-1 reveal" id="dest-journey-title">${esc(hubH2[1].t)}</h2>
    <div class="stack reveal">${ps(hubP.slice(2).map((x) => x.t))}</div>
  </div>
</section>
<section class="section" aria-labelledby="dest-plan-title">
  <div class="container heading-center stack reveal">
    <p class="eyebrow">${esc(tail[0].t)}</p>
    <h2 class="h-1" id="dest-plan-title">${esc(tail[1].t)}</h2>
    ${ps(tail.slice(2).map((x) => x.t))}
  </div>
</section>
{{CTA}}`);

for (const [i, d] of dests.entries()) {
  const [adv, exp, ...rest] = d.secs;
  const last = rest[rest.length - 1];
  const closing = last.ps.pop();
  const items = [];
  for (let k = 0; k < exp.ps.length; k += 2) items.push([exp.ps[k], exp.ps[k + 1]]);
  write(`destination-${d.slug}.html`, { title: `${d.name} | Destinations | Enchantive Asia`, desc: d.intro[0], nav: 'destinations', og: T(IMG[d.slug]) },
`${hero(T(IMG[d.slug]), [['index.html', 'Home'], ['destinations.html', 'Destinations'], [null, d.name]], d.name)}
<section class="section" aria-labelledby="d-title">
  <div class="container split">
    <div class="stack reveal"><p class="eyebrow">0${i + 1} / 05</p><h2 class="h-1" id="d-title">${esc(d.tag)}</h2>${ps(d.intro)}</div>
    <div class="photo-mosaic reveal">${[T(IMG[d.slug]), ...[2, 3, 4].map((n) => `assets/images/temp/${IMG[d.slug]}-${n}-temp.webp`).filter((f) => existsSync(join(root, f)))].map((f) => `<img src="${f}" alt="${attr(d.name)}, Thailand" width="1200" height="800" loading="lazy">`).join('')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="d-adv">
  <div class="container split split--top">
    <h2 class="h-2 reveal" id="d-adv">${esc(adv.h3)}</h2>
    <div class="stack reveal">${ps(adv.ps)}</div>
  </div>
</section>
<section class="section" aria-labelledby="d-exp">
  <div class="container">
    <div class="section-heading section-heading--center"><h2 class="h-1" id="d-exp">${esc(exp.h3)}</h2></div>
    <div class="feature-grid">
      ${items.map(([t, p]) => `<article class="feature-card"><h3 class="feature-card__title">${esc(t)}</h3><p>${esc(p)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="d-more">
  <div class="container split split--top">
    <h2 class="h-2 reveal" id="d-more">${esc(last.h3)}</h2>
    <div class="stack reveal">${ps(last.ps)}<p class="lead">${esc(closing)}</p></div>
  </div>
</section>
<section class="section" aria-labelledby="d-other">
  <div class="container">
    <div class="section-heading"><h2 class="h-2" id="d-other">More Destinations</h2></div>
    <div class="topic-grid topic-grid--4">
      ${dests.filter((o) => o !== d).map((o) => card(`destination-${o.slug}.html`, T(IMG[o.slug]), '', o.name, '')).join('\n      ')}
    </div>
  </div>
</section>
{{CTA}}`);
}

// ---------- Celebrations & Experiences ----------
const C = lines('celebrations.txt');
const cIntro = C[0].t; // exact heading from the doc
const cItems = [];
for (let k = 2; k < C.length; k += 3) {
  const m = C[k].t.match(/^(\d+)\. (.*)$/);
  cItems.push({ n: m[1].padStart(2, '0'), title: m[2], tag: C[k + 1].t, body: C[k + 2].t });
}
const CIMG = ['cel-01-weddings', 'cel-02-leadership', 'cel-03-themed', 'cel-04-gala', 'cel-05-awards', 'cel-06-brand', 'cel-07-anniversary', 'cel-08-parties', 'cel-09-client', 'cel-10-music', 'cel-11-after'];
const cFile = (i) => (i === 0 ? 'destination-weddings.html' : `celebrations-${slug(cItems[i].title)}.html`);
const CEL = 'Celebrations & Experiences';
write('celebrations-events.html', { title: `${CEL} | Enchantive Asia`, desc: C[1].t, nav: 'celebrations', og: T('cel-hub-hero') },
`${hero(T('cel-hub-hero'), [['index.html', 'Home'], ['services.html', 'Services'], [null, CEL]], CEL)}
<section class="section" aria-labelledby="cel-title">
  <div class="container split split--top">
    <h2 class="h-1 reveal" id="cel-title">${esc(cIntro)}</h2>
    <p class="lead reveal">${esc(C[1].t)}</p>
  </div>
</section>
<section class="section section--flush-top" aria-label="Celebrations and experiences">
  <div class="container"><div class="topic-grid topic-grid--3">
    ${cItems.map((c, i) => card(cFile(i), T(CIMG[i]), c.n, c.title, c.tag)).join('\n    ')}
  </div></div>
</section>
{{CTA}}`);
for (const [i, c] of cItems.entries()) {
  const pi = (i + cItems.length - 1) % cItems.length, ni = (i + 1) % cItems.length;
  write(cFile(i), { title: `${c.title} | ${CEL} | Enchantive Asia`, desc: c.body, nav: 'celebrations', og: T(CIMG[i]) },
`${hero(T(CIMG[i]), [['index.html', 'Home'], ['celebrations-events.html', CEL], [null, c.title]], c.title)}
<section class="section" aria-labelledby="c-title">
  <div class="container split split--top">
    <div class="stack reveal"><p class="eyebrow">${c.n} / 11</p><h2 class="h-1" id="c-title">${esc(c.tag)}</h2><p class="lead">${esc(c.body)}</p><div class="media media--wide"><img src="${T(CIMG[i])}" alt="${attr(c.title)}" width="1400" height="933" loading="lazy"></div></div>
    <div class="tile-aside reveal">${[1, 2, 3, 4].map((d) => (i + d) % cItems.length).map((k) => `<a class="tile" href="${cFile(k)}"><img src="${T(CIMG[k])}" alt="" width="1400" height="933" loading="lazy"><span class="tile__body"><span class="tile__title">${esc(cItems[k].title)}</span></span></a>`).join('')}</div>
  </div>
</section>
<section class="section section--flush-top" aria-label="Previous and next">
  <div class="container pager">
    <a href="${cFile(pi)}"><span>Previous</span>${esc(cItems[pi].title)}</a>
    <a href="${cFile(ni)}"><span>Next</span>${esc(cItems[ni].title)}</a>
  </div>
</section>
{{CTA}}`);
}

// ---------- Luxe Experiences ----------
const X = lines('luxe.txt');
const xs = [];
for (let k = 5; k < X.length; k += 4) {
  const m = X[k].t.match(/^(\d+)\. (.*)$/);
  xs.push({ n: m[1].padStart(2, '0'), title: m[2], tag: X[k + 1].t, body: X[k + 2].t, tags: X[k + 3].t.replace(/^Hashtags: /, '').split(/\s+/) });
}
const XIMG = ['luxe-01-andaman', 'luxe-02-residence', 'luxe-03-muaythai', 'luxe-04-serenity', 'luxe-05-bangkok', 'luxe-06-wild', 'luxe-07-siam', 'luxe-08-river', 'luxe-09-lanna', 'luxe-10-skyborne'];
write('luxe-experiences.html', { title: 'Luxe Experiences | Enchantive Asia', desc: X[3].t, nav: 'luxe', og: T('luxe-hero') },
`${hero(T('luxe-hero'), [['index.html', 'Home'], ['services.html', 'Services'], [null, 'Luxe Experiences']], 'Luxe Experiences')}
<section class="section" aria-labelledby="luxe-title">
  <div class="container split split--top">
    <div class="stack reveal"><h2 class="h-1" id="luxe-title">${esc(X[1].t)}</h2><p class="h-3">${esc(X[2].t)}</p></div>
    <div class="stack reveal">${ps([X[3].t, X[4].t])}<a class="btn btn--primary" href="contact.html?service=Luxe+Experiences#enquiry">Enquire About a Luxe Experience</a></div>
  </div>
</section>
${xs.map((x, i) => `<section class="section luxe-band${i % 2 ? ' section--tint' : ''}" id="${slug(x.title)}" aria-labelledby="x${i}-title">
  <div class="container split${i % 2 ? ' split--reverse' : ''}">
    <div class="media media--wide reveal"><img src="${T(XIMG[i])}" alt="${attr(x.title)}" width="1400" height="933" loading="lazy"></div>
    <div class="stack reveal"><p class="eyebrow">${x.n}</p><h2 class="h-1" id="x${i}-title">${esc(x.title)}</h2><p class="h-3">${esc(x.tag)}</p><p>${esc(x.body)}</p><ul class="hashtags" aria-label="Hashtags">${x.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
  </div>
</section>`).join('\n')}
{{CTA}}`);
// ---------- MICE ----------
const M = lines('mice.txt').map((x) => x.t);
const mice = (a, b) => M.slice(a - 1, b ?? a);
const btn = (label, href, cls = 'btn--primary') => `<a class="btn ${cls}" href="${href}">${esc(label)}</a>`;
const MICE_Q = 'contact.html?service=MICE#enquiry';
const pairs = (a, b) => { const o = []; for (let k = a; k < b; k += 2) o.push([M[k - 1], M[k]]); return o; };
const MSERV = ['luxury-hotel-lounge.webp', 'mice-accommodation-transport.webp', 'mice-corporate-events.webp', 'mice-event-day-coordination.webp', 'temp/leisure-concierge-temp.webp', 'heritage-dining-room.webp', 'temp/luxe-07-siam-temp.webp'];
const MPURP = ['temp/mice-team-temp.webp', 'temp/mice-conference-temp.webp', 'mice-incentive-travel.webp', 'temp/mice-launch-temp.webp', 'temp/mice-gala-temp.webp', 'temp/mice-retreat-temp.webp', 'temp/mice-themed-temp.webp'];
const mcard = (img, [t, p]) => `<article class="topic-card topic-card--static"><span class="topic-card__img"><img src="assets/images/${img}" alt="" width="1400" height="933" loading="lazy"></span><h3 class="topic-card__title">${esc(t)}</h3><p class="topic-card__text">${esc(p)}</p></article>`;
const bcard = (img, [t, p]) => { const m = t.match(/^(\d+)\. (.*)$/); return `<article class="bring-card"><div class="bring-card__img"><img src="assets/images/${img}" alt="" width="1400" height="933" loading="lazy"><span>${m ? m[1] : ''}</span></div><div class="bring-card__body"><h3>${esc(m ? m[2] : t)}</h3><p>${esc(p)}</p></div></article>`; };
const pcard = (img, [t, p]) => `<article class="purpose-tile" tabindex="0"><img src="assets/images/${img}" alt="" width="1400" height="933" loading="lazy"><div class="purpose-tile__body"><h3>${esc(t)}</h3><p>${esc(p)}</p></div></article>`;
write('mice.html', { title: 'MICE: Meetings, Incentives, Conferences & Exhibitions | Enchantive Asia', desc: M[2], nav: 'mice', og: 'assets/images/luxury-hotel-lounge.webp' },
`${hero('assets/images/mice-hero-conference.webp', [['index.html', 'Home'], [null, 'MICE']], tc(M[0]))}
<section class="section mice-intro" aria-labelledby="mice-intro-title">
  <div class="container mice-intro__grid">
    <div class="mice-intro__text stack reveal">
      <h2 class="h-1 mice-intro__title" id="mice-intro-title">${esc(M[1])}</h2>
      <p class="lead">${esc(M[2])}</p>
      ${ps(mice(4, 6))}
      <p class="h-3">${esc(M[6])}</p>
      ${btn(M[7].slice(1, -1), MICE_Q)}
    </div>
    <div class="photo-mosaic reveal">${[['mice-intro-stage.webp', 'Speaker presenting to a seated audience at a conference'], ['temp/mice-gala-temp.webp', 'Guests at a formal gala dinner'], ['temp/mice-team-temp.webp', 'Team meeting around a table'], ['temp/mice-launch-temp.webp', 'Product launch on stage']].map(([f, a]) => `<img src="assets/images/${f}" alt="${a}" width="1400" height="933" loading="lazy">`).join('')}</div>
  </div>
</section>
<section class="section section--tint mice-way" aria-labelledby="mice-way-title">
  <div class="container mice-way__grid">
    <div class="photo-trio reveal"><img src="assets/images/mice-meetings.webp" alt="Boardroom with a long table" width="900" height="1200" loading="lazy"><img src="assets/images/luxury-hotel-lounge.webp" alt="Ornate hotel lounge" width="1000" height="666" loading="lazy"><img src="assets/images/mice-event-day-coordination.webp" alt="Ballroom set for a banquet" width="900" height="1200" loading="lazy"></div>
    <div class="stack reveal"><p class="eyebrow">${esc(M[8])}</p><h2 class="h-1" id="mice-way-title">${esc(M[9])}</h2><p class="lead">${esc(M[10])}</p>${ps(mice(12, 15))}</div>
  </div>
</section>
<section class="section" aria-labelledby="mice-bring-title">
  <div class="container">
    <div class="section-heading section-heading--center"><p class="eyebrow">${esc(M[15])}</p><h2 class="h-1" id="mice-bring-title">${esc(M[16])}</h2><p>${esc(M[17])}</p></div>
    <div class="bring-grid">${pairs(19, 32).map((pr, i) => bcard(MSERV[i], pr)).join('')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="mice-purpose-title">
  <div class="container">
    <div class="section-heading section-heading--center"><p class="eyebrow">${esc(M[32])}</p><h2 class="h-1" id="mice-purpose-title">${esc(M[33])}</h2><p>${esc(M[34])}</p></div>
    <div class="purpose-grid">${pairs(36, 49).map((pr, i) => pcard(MPURP[i], pr)).join('')}</div>
  </div>
</section>
<section class="section" aria-labelledby="mice-why-title">
  <div class="container">
    <div class="section-heading section-heading--center"><p class="eyebrow">${esc(M[49])}</p><h2 class="h-1" id="mice-why-title">${esc(M[50])}</h2></div>
    <div class="feature-grid feature-grid--3">${pairs(52, 63).map(([t, p]) => `<article class="feature-card"><h3 class="feature-card__title">${esc(t)}</h3><p>${esc(p)}</p></article>`).join('')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="mice-process-title">
  <div class="container">
    <div class="section-heading section-heading--center"><p class="eyebrow">${esc(M[63])}</p><h2 class="h-1" id="mice-process-title">${esc(M[64])}</h2></div>
    <ol class="steps">${pairs(66, 75).map(([t, p]) => `<li><h3 class="h-3">${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div>
</section>
<section class="section" aria-labelledby="mice-scale-title">
  <div class="container split split--top">
    <div class="stack reveal"><p class="eyebrow">${esc(M[75])}</p><h2 class="h-1" id="mice-scale-title">${esc(M[76])}</h2></div>
    <div class="stack reveal">${ps(mice(78, 81))}</div>
  </div>
</section>
<section class="cta" aria-labelledby="mice-cta-title">
  <img class="cta__bg" src="assets/images/temp/mice-conference-temp.webp" alt="" width="1400" height="933" loading="lazy">
  <div class="container reveal">
    <p class="eyebrow eyebrow--light">${esc(M[81])}</p>
    <h2 class="h-1 cta__title" id="mice-cta-title">${esc(M[82])}</h2>
    ${ps(mice(84, 85)).replace(/<p>/g, '<p class="cta__text">')}
    <p class="cta__text"><strong>${esc(M[85])}</strong></p>
    ${btn(M[86].slice(1, -1), MICE_Q, 'btn--white')}
    <p class="cta__text">${esc(M[87])}</p>
  </div>
</section>`);

// ---------- Leisure ----------
const Z = lines('leisure.txt').map((x) => x.t.replace(/^• /, ''));
const zhead = Z[0].replace('LEISURE PAGE DESIGN ', '');
const perfect = (s) => `<p class="perfect"><strong>Perfect for:</strong> ${esc(s.replace(/^Perfect for: /, ''))}</p>`;
const [p1, p2] = Z[14].split('2. Fixed Departures');
const [f1, f2] = Z[24].split('5. Private Getaways Escape the Ordinary.');
const [c1, c2] = Z[29].split('Private Travel. Personally Taken Care Of.');
const LEIS = [
  { id: 'fit', img: 'leisure-fit', h: Z[11], tag: Z[12], body: [Z[13]], pf: p1 },
  { id: 'fixed-departures', img: 'leisure-fixed', h: '2. Fixed Departures', tag: Z[15], body: [Z[16]], pf: Z[17] },
  { id: 'social', img: 'leisure-social', h: Z[18], tag: Z[19], body: [Z[20]], pf: Z[21] },
  { id: 'family', img: 'leisure-family', h: Z[22], body: [Z[23], f1], tag: '' },
  { id: 'private-getaways', img: 'leisure-private', h: '5. Private Getaways', sub: 'Escape the Ordinary.', tag: Z[25], body: Z.slice(26, 29) },
  { id: 'concierge', img: 'leisure-concierge', h: c1, sub: 'Private Travel. Personally Taken Care Of.', tag: Z[30], body: Z.slice(31, 35) },
];
LEIS[5].h = '6. Private Travel & Personal Concierge';
write('leisure.html', { title: 'Leisure | Enchantive Asia', desc: Z[1], nav: 'leisure', og: T('leisure-hero') },
`${hero(T('leisure-hero'), [['index.html', 'Home'], ['services.html', 'Services'], [null, 'Leisure']], zhead)}
<section class="section" aria-labelledby="l-intro">
  <div class="container split split--top">
    <div class="stack reveal"><h2 class="h-1" id="l-intro">${esc(Z[3])}</h2>${ps([Z[4]])}${btn(Z[5].replace('CTA: ', ''), 'contact.html?service=Leisure#enquiry')}</div>
    <div class="stack reveal"><p class="lead">${esc(Z[1])}</p>${btn(Z[2].replace('CTA: ', ''), '#fit', 'btn--outline')}</div>
  </div>
</section>
<section class="section section--tint" aria-labelledby="l-story">
  <div class="container split split--top">
    <div class="stack reveal"><h2 class="h-1" id="l-story">${esc(Z[6])}</h2><p>${esc(Z[7])}</p></div>
    <ul class="ticks reveal" aria-label="Leisure">${Z.slice(8, 11).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  </div>
</section>
${LEIS.map((s, i) => `<section class="section subservice${i % 2 ? ' section--tint' : ''}" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="container split${i % 2 ? '' : ' split--reverse'}">
    <div class="media media--wide reveal"><img src="${T('' + s.img)}" alt="${attr(s.h.replace(/^\d+\. /, ''))}" width="1400" height="933" loading="lazy"></div>
    <div class="stack reveal"><h2 class="h-1" id="${s.id}-title">${esc(s.h)}</h2>${s.sub ? `<p class="h-3">${esc(s.sub)}</p>` : ''}${s.tag ? `<p class="h-3">${esc(s.tag)}</p>` : ''}${ps(s.body)}${s.pf ? perfect(s.pf) : ''}</div>
  </div>
</section>`).join('\n')}
{{CTA}}`);
console.log('generated', dests.length, 'destinations,', cItems.length, 'celebrations,', xs.length, 'luxe, mice, leisure');
