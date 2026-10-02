import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, createContext } from 'node:vm';
import { getTextbookPreset, TEXTBOOK_PRESETS } from '../src/textbook-presets.js';
import { validateAllMaps, validateMapContent } from '../src/content-validation.js';
import { ALPHABET, makePhonicsQuiz } from '../src/phonics.js';

test('four complete textbook sets map exactly to twelve lessons; only grade 3 lesson 1 uses phonics', () => {
  assert.deepEqual(TEXTBOOK_PRESETS.map(item => item.grade), [3,4,5,6]);
  for (const { grade, available } of TEXTBOOK_PRESETS) {
    assert.equal(available, true);
    const maps = getTextbookPreset(grade);
    validateAllMaps(maps);
    assert.equal(Object.keys(maps).length, 12);
    for (const [id, content] of Object.entries(maps)) {
      assert.ok(content.lessonTitle);
      assert.equal(content.mode === 'phonics', grade === 3 && id === 'MAP01');
    }
  }
  assert.equal(getTextbookPreset(3).MAP01.words.length, 27);
  assert.equal(getTextbookPreset(3).MAP01.expressions.length, 0);
  assert.equal(getTextbookPreset(4).MAP01.expressions[3].english, 'Nice to meet you, too.');
  assert.equal(getTextbookPreset(5).MAP07.expressions[0].english, 'What did you do this summer?');
  const changed = getTextbookPreset(3); changed.MAP01.words[0].english = 'changed';
  assert.equal(getTextbookPreset(3).MAP01.words[0].english, 'apple');
  assert.throws(() => validateMapContent('MAP02', changed.MAP01));
  assert.throws(() => validateMapContent('MAP01', {...changed.MAP01, mode: undefined}));
});

test('alphabet questions use four distinct valid choices and correct case/name/word initial', () => {
  assert.equal(ALPHABET.length, 26);
  assert.equal(new Set(ALPHABET.map(item => item.upper)).size, 26);
  for (const kind of ['listen','lower','upper','initial']) for (let i = 0; i < 80; i++) {
    const quiz = makePhonicsQuiz(kind, getTextbookPreset(3).MAP01.words);
    assert.equal(new Set(quiz.options).size, 4);
    assert.equal(quiz.options[quiz.correctIndex], kind === 'lower' ? quiz.letter.lower : quiz.letter.upper);
    assert.ok(quiz.options.every(option => (kind === 'lower' ? /^[a-z]$/ : /^[A-Z]$/).test(option)));
    if (kind === 'initial') assert.ok(quiz.question.includes(`‘${getTextbookPreset(3).MAP01.words.find(word => quiz.question.includes(`‘${word.english}’`)).english}’`));
  }
});

test('phonics progresses through all five quizzes, keeps chest/push puzzles, and records wrong attempts', async () => {
  const source = (await readFile(new URL('../src/game/Map01Scene.js', import.meta.url), 'utf8')).replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace('export default class', 'class').replaceAll('import.meta.env', '({ BASE_URL: "/" })');
  let correct = true, shown = [];
  const context = createContext({ Phaser: { Scene: class {}, Utils: { Array: { GetRandom: items => items[0] } } }, makePhonicsQuiz,
    GameUI: { choice: async (question, options, index, quiz) => { shown.push(quiz.kind); return correct; }, say: async () => {} }
  });
  new Script(`${source}\nSceneClass = Map01Scene;`).runInContext(context);
  const scene = new context.SceneClass(); scene.content = getTextbookPreset(3).MAP01;
  scene.state = { phase: 'blackboard', shards: 0, questionsShown: 0, firstTryCorrect: 0, wrongAttempts: 0, mistakes: {} };
  scene.save = () => {};
  correct = false; await scene.handleBlackboard(); assert.equal(scene.state.phase, 'blackboard'); assert.equal(scene.state.wrongAttempts, 1);
  correct = true; await scene.handleBlackboard(); assert.equal(scene.state.phase, 'desk_quiz'); assert.equal(scene.state.shards, 1);
  await scene.handleDesk(); assert.equal(scene.state.phase, 'desk_push');
  scene.state.phase = 'locker'; await scene.handleLocker(); assert.equal(scene.state.phase, 'chest_quiz'); assert.equal(scene.state.shards, 2);
  await scene.handleChest({}); assert.equal(scene.state.phase, 'chest'); assert.equal(scene.state.targetChest, 'red');
  scene.state.phase = 'final'; await scene.runFinalQuiz(); assert.equal(scene.state.phase, 'exit');
  assert.deepEqual(shown, ['listen','listen','lower','initial','upper','listen']);
  assert.equal(scene.state.firstTryCorrect, 4); assert.equal(scene.state.questionsShown, 6);
});
