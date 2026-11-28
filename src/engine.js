// Story engine: walks the node graph, keeps state, saves after every step,
// and runs real-time waits that survive a reload.
import { NODES, START, INITIAL_VARS, ENDINGS } from './story/act1.js';
import { load, save } from './store.js';

const SAVE_KEY = 'm1931.game';
const STORY_START = Date.UTC(1931, 0, 23, 13, 58); // in-story clock, 23 Jan 1931 13:58

// ── conditions: "lamp <= 0", "heard", "!notebook", "map && !heard", "a || b"
export function test(expr, vars) {
  if (!expr) return true;
  return expr.split('||').some((any) =>
    any.split('&&').every((term) => {
      const t = term.trim();
      const m = t.match(/^([a-zA-Z_]\w*)\s*(<=|>=|==|!=|<|>)\s*(.+)$/);
      if (m) {
        const a = vars[m[1]];
        let b = m[3].trim();
        b = b === 'true' ? true : b === 'false' ? false : isNaN(+b) ? b.replace(/^['"]|['"]$/g, '') : +b;
        switch (m[2]) {
          case '<=': return a <= b; case '>=': return a >= b; case '<': return a < b;
          case '>': return a > b; case '==': return a === b; case '!=': return a !== b;
        }
      }
      if (t.startsWith('!')) return !vars[t.slice(1).trim()];
      return !!vars[t];
    })
  );
}

function applySet(vars, set) {
  if (!set) return;
  for (const [k, v] of Object.entries(set)) {
    vars[k] = typeof v === 'number' && typeof vars[k] === 'number' ? vars[k] + v : v;
  }
}

export function sanityTier(s) {
  if (s >= 6) return 0; // composed
  if (s >= 4) return 1; // strained
  if (s >= 1) return 2; // fraying
  return 3;             // broken
}

export function clockLabel(minutes) {
  const t = new Date(STORY_START + minutes * 60000);
  return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
}
export function dateLabel(minutes) {
  const t = new Date(STORY_START + minutes * 60000);
  return `${String(t.getUTCDate()).padStart(2, '0')} 01 31`;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export class Engine {
  // ui: { line(entry, animate) → Promise, typing(on), choices(list), busy(until, status), clearBusy(),
  //       chapter(info) → Promise, ending(id), update(state) }
  constructor(ui, settings) {
    this.ui = ui;
    this.settings = settings;
    this.state = load(SAVE_KEY);
    this.runId = 0;
  }

  get hasSave() { return !!(this.state && this.state.node && this.state.phase !== 'ending'); }
  get started() { return !!(this.state && this.state.log && this.state.log.length); }
  get vars() { return this.state.vars; }

  fresh() {
    return {
      v: 1, node: START, step: 0, phase: 'enter', vars: { ...INITIAL_VARS }, log: [],
      clock: 0, transmission: 1, waitUntil: 0, waitStatus: '', checkpoint: null, ending: null,
    };
  }

  persist() { save(SAVE_KEY, this.state); this.ui.update(this.state); }

  newGame() { this.state = this.fresh(); this.persist(); this.resume(); }

  // From a checkpoint, can the player still survive with the right choices?
  // (Rewinding to a point where every path dies, e.g. a dead lamp before the tunnel, would trap them.)
  survivable(cp) {
    const seen = new Set();
    const walk = (id, vars, depth) => {
      if (depth > 400) return false;
      const key = id + JSON.stringify(vars);
      if (seen.has(key)) return false;
      seen.add(key);
      const n = NODES[id];
      const v = { ...vars }; applySet(v, n.set);
      if (n.ending) return ENDINGS[n.ending].kind !== 'death';
      if (n.choices) return n.choices.some((c) => test(c.if, v) && walk(c.goto, (() => { const w = { ...v }; applySet(w, c.set); return w; })(), depth + 1));
      if (n.branch) return walk(n.branch.find((x) => test(x.if, v)).goto, v, depth + 1);
      return walk(n.next, v, depth + 1);
    };
    return walk(cp.node, { ...cp.vars }, 0);
  }
  doomed(cp) { return !this.survivable(cp); }

  // The checkpoint a rewind will use: the latest one that still offers a way out.
  rewindTarget() {
    const s0 = this.state;
    const list = (s0.checkpoints && s0.checkpoints.length) ? s0.checkpoints : (s0.checkpoint ? [s0.checkpoint] : []);
    let k = list.length - 1;
    while (k > 0 && this.doomed(list[k])) k--;
    return { list, k, cp: list[k] };
  }

  rewind() {
    const s0 = this.state;
    const { list, k, cp } = this.rewindTarget();
    if (!cp || this.doomed(cp)) return this.newGame();
    s0.checkpoints = list.slice(0, k + 1);
    s0.checkpoint = cp;
    const s = this.state;
    s.node = cp.node; s.vars = { ...cp.vars }; s.log = s.log.slice(0, cp.logLen);
    s.clock = cp.clock; s.transmission = cp.transmission; s.step = 0; s.phase = 'enter';
    if (cp.ch) s.chapterN = cp.ch;
    s.ending = null; s.waitUntil = 0; s.endMarked = false; s.unread = 0; s.readUntil = 0; s.holdTarget = null;
    this.persist();
    this.ui.rebuild(s);
    this.resume();
  }

  stop() { this.runId++; clearTimeout(this.waitTimer); }

  // Continue from whatever phase was saved.
  resume() {
    this.stop();
    const run = this.runId;
    const s = this.state;
    switch (s.phase) {
      case 'enter': return this.enter(s.node, run, false);
      case 'chapter': return this.showChapter(run);
      case 'lines': return this.deliver(run);
      case 'choices': return this.ui.choices(this.visibleChoices());
      case 'hold-wait': // saves from the STAND BY version fall through to the reading pause
      case 'reading': return this.readThenWait(run);
      case 'hold-chapter': return this.holdChapter(run);
      case 'hold-end': return this.holdEnd(run, true);
      case 'wait': return this.startWait(run);
      case 'ending': return this.ui.ending(s.ending, s);
    }
  }

  // Arrive at a node: apply effects once, then chapter card, then lines.
  enter(id, run, applyEffects = true) {
    const s = this.state;
    const n = NODES[id];
    // Dyer's last lines lead straight into a new chapter: let the player finish reading first.
    if (n.chapter && s.phase === 'lines' && (s.unread || 0) > 0) {
      s.phase = 'hold-chapter'; s.holdTarget = id; this.persist();
      return this.holdChapter(run);
    }
    s.node = id; s.step = 0;
    if (n.chapter) s.chapterN = n.chapter.n;
    // Checkpoints at every chapter start and every decision, so a rewind only goes back
    // to the last choice that could still have saved Dyer, never all the way to the start.
    if (n.checkpoint || n.choices) {
      // snapshot before this node's effects, so a rewind re-applies them exactly once
      s.checkpoint = { node: id, vars: { ...s.vars }, logLen: s.log.length, clock: s.clock, transmission: s.transmission, ch: s.chapterN || 1 };
      s.checkpoints = (s.checkpoints || []).filter((c) => c.node !== id).concat([s.checkpoint]);
    }
    if (applyEffects || s.phase === 'enter') applySet(s.vars, n.set);
    if (n.chapter) { s.phase = 'chapter'; this.persist(); return this.showChapter(run); }
    s.phase = 'lines'; this.persist();
    return this.deliver(run);
  }

  async showChapter(run) {
    const s = this.state;
    const n = NODES[s.node];
    await this.ui.chapter(n.chapter);
    if (run !== this.runId) return;
    s.log.push({ from: 'chapter', text: n.chapter.title, n: n.chapter.n });
    s.phase = 'lines'; this.persist();
    this.deliver(run);
  }

  linesOf(n) { return (n.lines || []).filter((l) => test(l.if, this.state.vars)); }

  async deliver(run) {
    const s = this.state;
    const n = NODES[s.node];
    const lines = this.linesOf(n);
    const fast = this.settings.get('fast');
    while (s.step < lines.length) {
      const l = lines[s.step];
      const entry = { from: l.from, text: l.text, tone: l.tone, at: clockLabel(s.clock), tier: sanityTier(s.vars.sanity), sanity: s.vars.sanity };
      if (l.from === 'dyer') {
        this.ui.typing(true);
        await delay((fast ? 700 : 1500) + Math.min(l.text.length * (fast ? 6 : 16), fast ? 700 : 2200)); // a breath between sentences
        if (run !== this.runId) return;
        this.ui.typing(false);
      } else {
        await delay(fast ? 500 : 900);
        if (run !== this.runId) return;
      }
      await this.ui.line(entry, true);
      if (run !== this.runId) return;
      s.log.push(entry);
      s.unread = (s.unread || 0) + l.text.length;
      s.step++;
      if (s.step % 2 === 0) s.clock += 1;
      this.persist();
    }
    this.afterLines(run);
  }

  afterLines(run) {
    const s = this.state;
    const n = NODES[s.node];
    if (n.ending) { s.phase = 'hold-end'; s.endMarked = false; this.persist(); return this.holdEnd(run, false); }
    if (n.wait) {
      const fast = this.settings.get('fast');
      // The wait bar sits below the text and no longer covers it, so it follows Dyer's last line after a short beat.
      const ms = fast ? 800 : 1200;
      s.phase = 'reading'; s.readUntil = Date.now() + ms; this.persist();
      return this.readThenWait(run);
    }
    if (n.choices) { s.phase = 'choices'; this.persist(); return this.ui.choices(this.visibleChoices()); }
    if (n.branch) {
      const b = n.branch.find((x) => test(x.if, s.vars));
      return this.enter(b.goto, run, true);
    }
    if (n.next) return this.enter(n.next, run, true);
  }

  // A reading pause sized to what Dyer just said; then the real-time wait starts by itself.
  async readThenWait(run) {
    const s = this.state;
    if (!s.readUntil) s.readUntil = Date.now() + 1200;
    this.ui.reading(true);
    await delay(Math.max(0, s.readUntil - Date.now()));
    this.ui.reading(false);
    if (run !== this.runId || !['reading', 'hold-wait'].includes(s.phase)) return;
    const n = NODES[s.node];
    s.unread = 0; s.readUntil = 0;
    const ms = this.settings.get('fast') ? 5000 : n.wait.minutes * 60000;
    s.phase = 'wait'; s.waitUntil = Date.now() + ms; s.waitStatus = n.wait.status;
    s.waitMinutes = n.wait.minutes;
    this.persist();
    this.startWait(run);
  }

  // CONTINUE before a chapter card, so the last lines of a chapter can be read.
  async holdChapter(run) {
    const s = this.state;
    await this.ui.hold('chapter');
    if (s.phase !== 'hold-chapter') return;
    if (run !== this.runId) { this.stop(); run = this.runId; } // the player tapped: always honour it
    s.unread = 0; s.phase = 'to-chapter';
    const id = s.holdTarget; s.holdTarget = null;
    this.enter(id, run, true);
  }

  // The signal dies (or holds) in the log first; the ending screen opens only when the player taps.
  async holdEnd(run, resumed) {
    const s = this.state;
    const id = NODES[s.node].ending;
    if (!s.endMarked) {
      if (!resumed) { await delay(2000); if (run !== this.runId) return; }
      const entry = { from: 'system', text: ENDINGS[id].marker || (ENDINGS[id].kind === 'death' ? 'CARRIER LOST' : 'SIGNAL HOLDING'), end: ENDINGS[id].kind };
      await this.ui.line(entry, true);
      s.log.push(entry); s.endMarked = true; this.persist();
    }
    await this.ui.hold('end', ENDINGS[id].kind);
    if (s.phase !== 'hold-end') return;
    if (run !== this.runId) { this.stop(); run = this.runId; }
    s.phase = 'ending'; s.ending = id;
    const found = load('m1931.endings') || [];
    if (!found.includes(id)) { found.push(id); save('m1931.endings', found); }
    this.persist();
    this.ui.ending(id, s);
  }

  visibleChoices() {
    const n = NODES[this.state.node];
    return (n.choices || []).filter((c) => test(c.if, this.state.vars));
  }

  choose(choice) {
    const s = this.state;
    if (s.phase !== 'choices') return;
    this.stop();
    const run = this.runId;
    const entry = { from: 'base', text: choice.label, at: clockLabel(s.clock) };
    s.log.push(entry);
    this.ui.line(entry, false);
    applySet(s.vars, choice.set);
    s.clock += 1;
    s.unread = 0;
    this.enter(choice.goto, run, true);
  }

  startWait(run) {
    const s = this.state;
    const left = s.waitUntil - Date.now();
    if (left <= 0) return this.endWait(run);
    this.ui.busy(s.waitUntil, s.waitStatus);
    this.waitTimer = setTimeout(() => { if (run === this.runId) this.endWait(run); }, Math.min(left, 2 ** 31 - 1));
  }

  // Fast mode switched on mid-wait: cut the remaining wait short.
  hurry() {
    const s = this.state;
    if (s.phase !== 'wait') return;
    s.waitUntil = Math.min(s.waitUntil, Date.now() + 5000);
    this.persist();
    this.stop();
    this.startWait(this.runId);
  }

  endWait(run) {
    const s = this.state;
    const n = NODES[s.node];
    s.clock += s.waitMinutes || 0;
    s.transmission += 1;
    s.waitUntil = 0;
    s.unread = 0;
    this.ui.clearBusy(true);
    this.enter(n.next, run, true);
  }
}

export { ENDINGS };
