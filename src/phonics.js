const names = ['에이','비','씨','디','이','에프','지','에이치','아이','제이','케이','엘','엠','엔','오','피','큐','아르','에스','티','유','브이','더블유','엑스','와이','지'];
export const ALPHABET = names.map((name, index) => ({ upper: String.fromCharCode(65 + index), lower: String.fromCharCode(97 + index), name }));
const shuffle = items => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
export function makePhonicsQuiz(kind, words = []) {
  let letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  let question, lower = false, word;
  if (kind === 'initial') {
    const eligible = words.filter(item => /^[a-z]/i.test(item.english));
    if (!eligible.length) throw new Error('첫 글자 문제에 사용할 단어가 없습니다.');
    word = eligible[Math.floor(Math.random() * eligible.length)];
    letter = ALPHABET.find(item => item.upper === word.english[0].toUpperCase());
    question = `‘${word.english}’(${word.korean})은 어떤 알파벳으로 시작할까요?`;
  } else if (kind === 'lower') {
    lower = true; question = `대문자 ${letter.upper}와 짝이 되는 소문자를 골라보세요.`;
  } else if (kind === 'upper') {
    question = `소문자 ${letter.lower}와 짝이 되는 대문자를 골라보세요.`;
  } else if (kind === 'listen') {
    question = '알파벳 이름을 듣고 대문자를 골라보세요.';
  } else throw new Error('지원하지 않는 알파벳 문제입니다.');
  const letters = shuffle([letter, ...shuffle(ALPHABET.filter(item => item !== letter)).slice(0, 3)]);
  const options = letters.map(item => lower ? item.lower : item.upper);
  return { kind, letter, question, options, correctIndex: letters.indexOf(letter) };
}
export function speakLetter(letter, onFailure = () => {}) {
  if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) { onFailure(); return; }
  const utterance = new SpeechSynthesisUtterance(letter.upper);
  utterance.lang = 'en-US'; utterance.rate = 0.8;
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices.find(voice => /^en[-_]/i.test(voice.lang)) || null;
  utterance.onerror = event => { if (!['interrupted', 'canceled'].includes(event.error)) onFailure(); };
  speechSynthesis.cancel(); speechSynthesis.speak(utterance);
}
export function mountPhonicsControls(root, quiz) {
  const panel = document.createElement('div'); panel.className = 'phonics-controls';
  const status = document.createElement('p'); status.className = 'letter-reading'; status.setAttribute('role', 'status');
  const hint = () => { status.textContent = `이 알파벳의 이름은 ‘${quiz.letter.name}’예요.`; };
  const play = document.createElement('button'); play.type = 'button'; play.className = 'phonics-listen';
  play.textContent = quiz.kind === 'listen' ? '▶ 알파벳 이름 듣기 · 다시 듣기' : `▶ ${quiz.letter.upper} ${quiz.letter.lower} 읽는 법 듣기`;
  play.onclick = () => speakLetter(quiz.letter, hint);
  panel.append(play);
  if (quiz.kind === 'listen') {
    const reveal = document.createElement('button'); reveal.type = 'button'; reveal.className = 'text-button'; reveal.textContent = '읽는 법 보기'; reveal.onclick = hint; panel.append(reveal);
  } else hint();
  panel.append(status);
  const guide = document.createElement('details'); guide.className = 'alphabet-guide';
  const summary = document.createElement('summary'); summary.textContent = 'A~Z 읽는 법 · 대문자와 소문자 연습';
  const grid = document.createElement('div'); grid.className = 'alphabet-grid';
  for (const letter of ALPHABET) {
    const button = document.createElement('button'); button.type = 'button';
    const pair = document.createElement('strong'); pair.textContent = `${letter.upper} ${letter.lower}`;
    const reading = document.createElement('span'); reading.textContent = letter.name;
    button.append(pair, reading); button.onclick = () => speakLetter(letter, () => { status.textContent = `소리를 재생할 수 없어요. ${letter.upper} ${letter.lower}: ${letter.name}`; });
    grid.append(button);
  }
  guide.append(summary, grid); panel.append(guide);
  root.querySelector('#quiz-options').before(panel);
  if (!globalThis.speechSynthesis) hint();
}
