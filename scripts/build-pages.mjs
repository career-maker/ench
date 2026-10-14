// Static page builder: src/pages/*.html + src/partials/*.html -> root *.html
// First line of each page: <!-- {"title":"...","desc":"...","nav":"about","og":"assets/images/x.webp"} -->
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const part = (n) => readFileSync(join(root, 'src/partials', n), 'utf8');
const SITE = 'https://www.enchantiveasia.com/'; // ponytail: canonical base; confirm production domain
const BUILD = Date.now().toString(36); // cache-buster so browsers never serve stale CSS/JS
const STAGING = true; // set false at launch to remove the noindex tag (see README)

const sprite = part('sprite.html');
const footer = part('footer.html');
const cta = part('cta.html');

const built = [];
for (const file of readdirSync(join(root, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  let src = readFileSync(join(root, 'src/pages', file), 'utf8');
  const m = src.match(/^<!--\s*(\{.*?\})\s*-->\s*/s);
  if (!m) throw new Error(`${file}: missing meta comment`);
  const meta = JSON.parse(m[1]);
  for (const k of ['title', 'desc']) meta[k] = meta[k].replace(/&(?!amp;)/g, '&amp;');
  src = src.slice(m[0].length);
  const header = part('header.html').replace(
    new RegExp(`(data-nav="${meta.nav}")`, 'g'),
    '$1 aria-current="page"'
  );
  const og = SITE + (meta.og || 'assets/images/hero-koh-phangan-coast.webp');
  const html = `<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
${STAGING ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${SITE}${file === 'index.html' ? '' : file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.desc}">
<meta property="og:image" content="${og}">
<meta property="og:url" content="${SITE}${file === 'index.html' ? '' : file}">
<meta name="theme-color" content="#0658a7">
<link rel="icon" href="assets/logos/enchantive-asia-logo-black.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/libre-caslon-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/figtree-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/main.min.css?v=${BUILD}">
<script>document.documentElement.classList.remove('no-js')</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${sprite}
${header}
<main id="main">
${src.trim().replace("{{CTA}}", cta)}
</main>
${footer}
<script src="js/components/navigation.js?v=${BUILD}" defer></script>
<script src="js/components/forms.js?v=${BUILD}" defer></script>
<script src="js/components/animation.js?v=${BUILD}" defer></script>
<script src="js/components/gallery.js?v=${BUILD}" defer></script>
<script src="js/main.js?v=${BUILD}" defer></script>
</body>
</html>
`;
  writeFileSync(join(root, file), html);
  built.push(file);
  console.log('built', file);
}

// sitemap.xml: every public page (404 excluded). While STAGING the site is also noindex + robots Disallow.
const today = new Date().toISOString().slice(0, 10);
const urls = built.filter((f) => f !== '404.html').sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
const entries = urls.map((f) => '  <url><loc>' + SITE + (f === 'index.html' ? '' : f) + '</loc><lastmod>' + today + '</lastmod></url>');
writeFileSync(
  join(root, 'sitemap.xml'),
  ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join(String.fromCharCode(10))
);
console.log('built sitemap.xml');
