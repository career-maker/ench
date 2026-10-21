// Client preview: switch the "15 years" section between its three styles (Mosaic / Postcards / Orbit).
// Remembers the choice; ?heritage=postcards in the URL also works. Delete this file + the switcher markup once chosen.
function initHeritageStyle() {
  const section = document.querySelector('[data-heritage]');
  if (!section) return;
  const buttons = section.querySelectorAll('[data-heritage-style]');
  const styles = Array.from(buttons, (b) => b.dataset.heritageStyle);
  const KEY = 'ea-heritage-style';
  const apply = (style) => {
    if (!styles.includes(style)) return;
    section.dataset.style = style;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.heritageStyle === style)));
    try { localStorage.setItem(KEY, style); } catch (e) { /* storage unavailable */ }
  };
  let initial = new URLSearchParams(location.search).get('heritage');
  if (!initial) { try { initial = localStorage.getItem(KEY); } catch (e) { /* ignore */ } }
  if (initial) apply(initial);
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.heritageStyle)));
}
