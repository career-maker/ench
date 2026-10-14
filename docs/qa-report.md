# QA report

Run on 2026-10-14, Windows 11, Chrome (headless) against `python -m http.server` on localhost.

| Check | Result |
|---|---|
| Sass compile (`npm run build`) | Pass – `css/main.css`, `css/main.min.css` generated, 0 errors |
| Local links / anchors / duplicate ids (`npm run check`) | Pass – 13 pages |
| Horizontal overflow, 13 pages × widths 1920/1440/1280/1024/768/414/360 (`scripts/overflow-test.html`) | Pass – none (tested in iframes) |
| Forms: invalid shows errors + focus; valid shows honest "not sent" notice; no endpoint | Pass (`scripts/func-test.html`) |
| Mobile menu open, submenu toggle, closes on link | Pass (same harness) |
| Visual comparison to PDF (desktop, home) | Reviewed by eye; layout/sections/order match, fonts approximate (see design-system.md) |
| HTML validity (html-validate, recommended) | No structural errors after fixes. 55 stylistic notices remain (uppercase DOCTYPE, `&nbsp;` in tel text) – not W3C errors |
| W3C Nu validator | **Not run** |
| Browser zoom 75–150% | **Not run** (layout is fluid/rem-based; overflow tested by viewport width instead) |
| Console errors | **Not inspected** with DevTools; scripts executed without failing the test harnesses |
| PageSpeed Insights | **Not measured** – site not publicly hosted. After staging deploy run PSI mobile + desktop; images are WebP with dimensions, fonts self-hosted/swap, no third-party JS |
| Security headers | **Not verifiable locally** – see README |
| Keyboard/contrast audit | Focus styles and labels implemented; no automated audit run |
