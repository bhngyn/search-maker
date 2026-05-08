// Wire the Beginner-mode "more options" disclosure. Reveals fields beyond
// the first four. The CSS rule
//   body.mode-beginner #fields-container > .field:nth-child(n+5) { display: none; }
// is overridden by adding `advanced-revealed` to the body.

export function wireMoreOptions() {
  const moreOptionsBtn = document.getElementById('more-options-btn');
  if (!moreOptionsBtn) return null;

  function setRevealed(revealed) {
    document.body.classList.toggle('advanced-revealed', revealed);
    moreOptionsBtn.setAttribute('aria-expanded', revealed ? 'true' : 'false');
  }

  moreOptionsBtn.addEventListener('click', () => {
    setRevealed(!document.body.classList.contains('advanced-revealed'));
  });

  return { setRevealed };
}
