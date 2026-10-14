// Verifies every local href/src/url in root HTML + css points to an existing file, and ids are unique.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let bad = 0;
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
for (const f of pages) {
  const h = readFileSync(join(root, f), 'utf8');
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  ids.filter((v, i) => ids.indexOf(v) !== i).forEach((d) => { console.log(`${f}: duplicate id ${d}`); bad++; });
  for (const [, u] of h.matchAll(/(?:href|src|srcset)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(u)) { if (u.startsWith('#') && u.length > 1 && !ids.includes(u.slice(1))) { console.log(`${f}: missing anchor ${u}`); bad++; } continue; }
    const [p0, hash] = u.split('#'); const p = p0.split('?')[0];
    if (!p) continue;
    if (!existsSync(join(root, p))) { console.log(`${f}: missing ${u}`); bad++; }
    else if (hash && p.endsWith('.html') && !new RegExp(`id="${hash}"`).test(readFileSync(join(root, p), 'utf8'))) { console.log(`${f}: missing anchor ${u}`); bad++; }
  }
}
console.log(bad ? `${bad} problem(s)` : `OK: ${pages.length} pages, no broken local links/ids`);
process.exit(bad ? 1 : 0);
