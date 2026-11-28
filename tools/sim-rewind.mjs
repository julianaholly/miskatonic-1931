// Simulates many random playthroughs to a death and reports where Rewind lands,
// with checkpoints only at chapter starts (old) versus also at every decision (new).
// Run: node tools/sim-rewind.mjs
import { NODES, START, INITIAL_VARS, ENDINGS } from '../src/story/act1.js';
import { Engine, test } from '../src/engine.js';

const applySet = (v, set) => { for (const [k, x] of Object.entries(set || {})) v[k] = typeof x === 'number' && typeof v[k] === 'number' ? v[k] + x : x; };
const eng = Object.create(Engine.prototype);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const stats = { old: {}, neu: {} }; let deaths = 0, newLoops = 0;
for (let run = 0; run < 4000; run++) {
  let id = START, vars = { ...INITIAL_VARS }, ch = 1, step = 0;
  const cpOld = [], cpNew = [];
  while (!NODES[id].ending) {
    const n = NODES[id];
    if (n.chapter) ch = n.chapter.n;
    const snap = { node: id, vars: { ...vars }, ch, step };
    if (n.checkpoint) cpOld.push(snap);
    if (n.checkpoint || n.choices) cpNew.push(snap);
    applySet(vars, n.set);
    if (n.choices) { const ok = n.choices.filter((c) => test(c.if, vars)); const c = ok[Math.floor(rnd() * ok.length)]; applySet(vars, c.set); id = c.goto; }
    else if (n.branch) id = n.branch.find((b) => test(b.if, vars)).goto;
    else id = n.next;
    step++;
  }
  if (ENDINGS[NODES[id].ending].kind !== 'death') continue;
  deaths++;
  for (const [name, list] of [['old', cpOld], ['neu', cpNew]]) {
    eng.state = { checkpoints: list };
    const { cp } = eng.rewindTarget();
    const back = step - cp.step;
    const key = cp.node === START ? 'to the very start' : back <= 3 ? '1-3 steps back' : back <= 10 ? '4-10 steps back' : '11+ steps back';
    stats[name][key] = (stats[name][key] || 0) + 1;
    if (name === 'neu' && eng.doomed(cp)) newLoops++;
  }
}
console.log(`${deaths} random deaths`);
console.log('chapter checkpoints only:', stats.old);
console.log('plus every decision:     ', stats.neu);
console.log('new rewinds into a forced death:', newLoops);
