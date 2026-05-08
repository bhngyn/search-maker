// Wire the welcome panel close button and the small re-open link that
// replaces it once collapsed. State is in-memory only (per the no-persist
// rule); refreshing the page restores the welcome panel.

export function wireWelcomePanel() {
  const closeBtn = document.getElementById('welcome-close-btn');
  const reopenBtn = document.getElementById('welcome-reopen-btn');
  if (!closeBtn) return;

  closeBtn.addEventListener('click', () => {
    document.body.classList.add('welcome-collapsed');
    if (reopenBtn) reopenBtn.hidden = false;
  });

  if (reopenBtn) {
    reopenBtn.addEventListener('click', () => {
      document.body.classList.remove('welcome-collapsed');
      reopenBtn.hidden = true;
    });
  }
}
