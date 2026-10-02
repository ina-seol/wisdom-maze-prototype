// Capture quiz keys before they reach the scene or the generic modal shortcuts.
export function installQuizKeyboard(modal, root) {
  const handler = event => {
    if (!modal || modal.classList.contains('hidden')) return;
    if (event.target?.matches?.('input, textarea, [contenteditable="true"]')) return;
    if (event.target?.closest?.('.phonics-controls')) return;
    const choices = [...root.querySelectorAll('.quiz-option')];
    const tokens = root.querySelector('#sentence-tokens');
    if (!choices.length && !tokens) return;
    const arrow = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
    const confirm = event.code === 'Space' || event.key === 'Enter';
    if (!arrow && !confirm) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;

    if (choices.length) {
      const index = choices.findIndex(button => button.classList.contains('selected'));
      if (arrow) {
        const columns = getComputedStyle(root.querySelector('#quiz-options')).gridTemplateColumns.split(/\s+/).length;
        const step = event.key === 'ArrowUp' ? -columns : event.key === 'ArrowDown' ? columns : event.key === 'ArrowLeft' ? -1 : 1;
        const next = index < 0 ? 0 : (index + step + choices.length) % choices.length;
        choices[next].click();
        choices[next].focus({ preventScroll: true });
      } else if (index < 0) {
        choices[0].click();
        choices[0].focus({ preventScroll: true });
      } else {
        root.querySelector('#quiz-submit')?.click();
      }
      return;
    }

    const controls = [...root.querySelectorAll('#sentence-tokens .token, #sentence-reset, #sentence-submit')].filter(button => !button.disabled);
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement);
    if (arrow) {
      const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
      controls[index < 0 ? 0 : (index + step + controls.length) % controls.length].focus({ preventScroll: true });
    } else {
      const button = controls[index < 0 ? 0 : index];
      button.click();
      if (button.classList.contains('token')) {
        const next = [...tokens.querySelectorAll('.token')].find(token => !token.disabled);
        (next || root.querySelector('#sentence-submit'))?.focus({ preventScroll: true });
      } else if (button.id === 'sentence-reset') {
        tokens.querySelector('.token')?.focus({ preventScroll: true });
      }
    }
  };
  document.addEventListener('keydown', handler, true);
  return () => document.removeEventListener('keydown', handler, true);
}
