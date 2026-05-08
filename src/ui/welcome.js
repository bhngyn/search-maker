// Wire the welcome panel close button. Once collapsed within a session, the
// panel stays collapsed until the page is refreshed.

export function wireWelcomePanel() {
  const closeBtn = document.getElementById('welcome-close-btn');
  if (!closeBtn) return;
  closeBtn.addEventListener('click', () => {
    document.body.classList.add('welcome-collapsed');
  });
}
