// Shared sounds and quiz feedback. Audio starts only after a user gesture.
let context = null;
let soundEnabled = true;
try { soundEnabled = localStorage.getItem('wisdom_sfx_enabled') !== 'false'; } catch {}
export const reducedMotion = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
function audio() {
  if (!soundEnabled || typeof window === 'undefined') return null;
  try {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    if (!Constructor) return null;
    context ||= new Constructor();
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  } catch { return null; }
}
function notes(frequencies, volume = .035) {
  const ctx = audio(); if (!ctx) return;
  try {
    frequencies.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime + index * .065;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + .15);
      oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(start); oscillator.stop(start + .18);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch {}
}
export const playCorrect = () => notes([660, 880]);
export const playWrong = () => notes([294, 247], .025);
export const playShard = () => notes([620, 820, 1040]);
// Short drum-like cues, generated locally; no audio file download is needed.
function impact(ctx, start, pitch, duration, volume, noiseVolume) {
  const oscillator = ctx.createOscillator(), body = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(pitch, start);
  oscillator.frequency.exponentialRampToValueAtTime(38, start + duration * .7);
  body.gain.setValueAtTime(.0001, start);
  body.gain.exponentialRampToValueAtTime(volume, start + .008);
  body.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(body); body.connect(ctx.destination);
  oscillator.start(start); oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); body.disconnect(); };
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .12), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), attack = ctx.createGain();
  noise.buffer = buffer; filter.type = 'lowpass'; filter.frequency.setValueAtTime(1800, start);
  attack.gain.setValueAtTime(.0001, start);
  attack.gain.exponentialRampToValueAtTime(noiseVolume, start + .003);
  attack.gain.exponentialRampToValueAtTime(.0001, start + .11);
  noise.connect(filter); filter.connect(attack); attack.connect(ctx.destination);
  noise.start(start); noise.stop(start + .12);
  noise.onended = () => { noise.disconnect(); filter.disconnect(); attack.disconnect(); };
}
export function playBossEntrance() {
  const ctx = audio(); if (!ctx) return;
  try {
    [[0, 100, .25], [.18, 85, .28], [.42, 65, .65]].forEach(([offset, pitch, duration]) => {
      impact(ctx, ctx.currentTime + offset, pitch, duration, .095, .025);
    });
  } catch {}
}
export function playBossHit() {
  const ctx = audio(); if (!ctx) return;
  try { impact(ctx, ctx.currentTime, 165, .34, .11, .065); } catch {}
}
export function bindSoundToggle(button) {
  if (!button) return;
  const render = () => { button.textContent = soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'; button.setAttribute('aria-pressed', String(soundEnabled)); };
  button.onclick = () => { soundEnabled = !soundEnabled; try { localStorage.setItem('wisdom_sfx_enabled', String(soundEnabled)); } catch {} render(); if (soundEnabled) notes([520], .02); };
  render();
}
export async function answerFeedback(correct, root) {
  if (correct) playCorrect(); else playWrong();
  const status = document.createElement('p'); status.className = `answer-feedback ${correct ? 'answer-correct' : 'answer-wrong'}`;
  status.setAttribute('role', 'status'); status.textContent = correct ? '✦ 정답이에요!' : '한 번 더 생각해 봐요.';
  root.append(status);
  root.classList.add(correct ? 'feedback-correct' : 'feedback-wrong');
  if (correct && !reducedMotion()) {
    for (let index = 0; index < 8; index++) {
      const particle = document.createElement('span'); particle.className = 'answer-spark'; particle.textContent = '✦'; particle.setAttribute('aria-hidden', 'true');
      particle.style.setProperty('--spark-x', `${(index - 3.5) * 36}px`); particle.style.setProperty('--spark-y', `${-45 - index % 3 * 25}px`); root.append(particle);
    }
  }
  await new Promise(resolve => setTimeout(resolve, reducedMotion() ? 180 : 520));
  root.classList.remove('feedback-correct', 'feedback-wrong');
  root.querySelectorAll('.answer-feedback, .answer-spark').forEach(element => element.remove());
}
if (typeof window !== 'undefined') {
  window.WisdomFeedback = { correct: playCorrect, wrong: playWrong, shard: playShard, clear: () => notes([523, 659, 784, 1046]), tap: () => notes([520], .02), vibrate: pattern => { try { navigator.vibrate?.(pattern); } catch {} }, bossHit: playBossHit, bossEntrance: playBossEntrance };
  const unlock = () => audio();
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
}
