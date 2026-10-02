import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, SourceTextModule, createContext } from 'node:vm';

test('boss dialogue uses the centered shared speaker UI; battle plays one entrance and one hit per HP lost', async () => {
  const source = (await readFile(new URL('../src/game/Map12Scene.js', import.meta.url), 'utf8'))
    .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, '').replace('export default class','class')
    .replaceAll('import.meta.env', '({ BASE_URL: "/" })');
  const lines=[];let entrance=0,hits=0;
  const context = createContext({ Phaser: { Scene: class {}, Math: { Clamp: (v,min,max)=>Math.max(min,Math.min(v,max)) } },
    playBossEntrance:()=>entrance++, playBossHit:()=>hits++, GameUI:{say:async text=>lines.push(text)},console });
  new Script(`${source}\nSceneClass = Map12Scene;`).runInContext(context);
  const scene=new context.SceneClass();
  const dialogue=['침묵의 군주: 도전해라.','나: 좋아!','루미: 할 수 있어!'];
  await scene.bossSay(dialogue);assert.equal(lines[0],dialogue);
  scene.state={bossHp:5,bossRound:1};scene.save=()=>{};scene.updateBossHud=()=>{};
  let questions=0,completed=false;
  scene.runBossRound=async()=>++questions!==1; // One incorrect answer must not trigger a hit.
  scene.finishBossBattle=async()=>completed=true;
  await scene.startBossBattle();
  assert.equal(entrance,1);assert.equal(hits,5);assert.equal(questions,6);assert.equal(scene.state.bossHp,0);assert.equal(completed,true);
});

test('entrance schedules three drum impacts; HP hit layers noise and bass and respects mute', async () => {
  const starts=[], types=[], gains=[];
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(value){gains.push(value);}};
  const node=()=>({connect(){},disconnect(){},start(time){starts.push(time);},stop(){},frequency:parameter});
  class AudioContext {
    state='running';currentTime=10;sampleRate=8000;destination={};
    createOscillator(){const result=node();Object.defineProperty(result,'type',{set(value){types.push(value);}});return result;}
    createGain(){return {...node(),gain:parameter};}
    createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
    createBufferSource(){return node();}
    createBiquadFilter(){return node();}
  }
  const context=createContext({window:{AudioContext},document:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},console,Math});
  const module=new SourceTextModule(await readFile(new URL('../src/feedback.js',import.meta.url),'utf8'),{context});
  await module.link(()=>{});await module.evaluate();
  module.namespace.playBossEntrance();assert.deepEqual(starts,[10,10,10.18,10.18,10.42,10.42]);
  module.namespace.playBossHit();assert.equal(starts.length,8);assert.equal(types.length,4);assert.ok(gains.includes(.065));
  const button={setAttribute(){}};module.namespace.bindSoundToggle(button);button.onclick();
  module.namespace.playBossEntrance();module.namespace.playBossHit();assert.equal(starts.length,8);
});
