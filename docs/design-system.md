# Design system (from Design.pdf)

Source: `D:\iss\Enchantive Asia\Design.pdf` – one page, 1920 × 8688 px desktop artboard (no tablet/mobile comps; responsive layouts are derived).
**Measured** = read from PDF geometry/colours. **Estimated** = judged visually.

| Item | Value | Status |
|---|---|---|
| Artboard / container | 1920px; content x=110→1810 (1700px), side padding 110px | measured |
| Brand blue | `#0658A7` (PDF fill 0.024/0.345/0.655) | measured |
| Accent red (arrows, quote marks, contact tile) | `#E8372A` | estimated |
| Footer dark | `#1A1717` (PDF fill 0.10/0.09/0.09) | measured |
| Tint background | `#F4F8FE` | estimated |
| Heading font | high-contrast serif; implemented with **Libre Caslon Display 400** (PDF uses an outlined/unidentified face, ~18% narrower) – sizes scaled to ~0.88 and letter-spacing −0.012em to match line breaks | estimated |
| Body / UI font | geometric sans; implemented with **Figtree 300/400/500** | estimated |
| Hero H1 | 68px / 73px line-height at 1920 → `clamp(2rem, 3.2vw, 3.875rem)` | measured/adapted |
| Section H2 | ≈52–56px | estimated |
| Body | 20px on desktop in PDF (hero sub 20px, paragraphs 20px) → 17px base, 1.65 line-height | adapted |
| Header | logo 110→395px wide, nav pill x=919→1840, y=42→110, bg dark translucent, radius 8, links 20px | measured |
| Buttons | pill, 1px border, arrow icon; primary blue fill; outline with red arrow; glass in hero | measured |
| Cards / images | radius 8–14px; tile aspect ≈ 552×680 (blue section) | measured |
| Sections (order) | Hero slider → 15-years intro (split, handshake bg) → stats ticker → Why choose us (tint) → MICE text + 3 staggered portrait images → "More than a Destination" (blue, 3 tiles) → Iconic Locations (tabs + image) → Partner testimonials → Partner logos + Accreditations → Contact CTA over aerial image → Footer | measured |
| Footer | 4 columns on dark, outlined "ENCHANTIVE ASIA" watermark, social row, copyright bar | measured |
| Animations | none specified; implemented: hero cross-fade, ticker, reveal-on-scroll, hover lifts (all disabled under `prefers-reduced-motion`) | added |

Breakpoints (`scss/abstracts/_breakpoints.scss`): 576 / 768 / 992 / 1200 / 1600.
Navigation collapses to a full-screen menu below 992px.

## Deviations
- Nav items "Destinations" → `index.html#destinations`; "Gallery" → `gallery.html` (added page using PDF imagery); "Blogs" footer link dropped (no blog supplied).
- Testimonials: PDF shows 4 cards (2 duplicated); 2 unique cards are used.
- Lower-case sentence starts / "thailand" in PDF body copy were capitalised (see content-notes).
