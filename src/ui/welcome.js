// Wire the welcome panel close button. State is in-memory only (per the
// no-persist rule); refreshing the page restores the welcome panel.

export function wireWelcomePanel() {
  const closeBtn = document.getElementById('welcome-close-btn');
  if (!closeBtn) return;

  closeBtn.addEventListener('click', () => {
    document.body.classList.add('welcome-collapsed');
  });
}
