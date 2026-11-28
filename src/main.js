// UI glue: screens, the transmission log, choices, the busy timer, chapter cards and endings.
import { Engine, clockLabel, dateLabel, sanityTier } from './engine.js';
import { ENDINGS, ENDING_ORDER, CHAPTERS, NODES } from './story/act1.js';
import { load, save, remove, settings } from './store.js';
import { init as initAudio, setEnabled as setSound, sfx } from './sfx.js';
import { music } from './music.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const SCREENS = ['title', 'intro', 'game', 'chapter', 'ending', 'settings', 'endings'];
let current = 'title';
let returnTo = 'title';

function show(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
  current = id;
  if (id === 'title') { music.cue('main'); music.unfade(); }
  if (id === 'game' && engine && engine.state) music.cue(cueFor(engine.state));
  drawFrame();
}

// ── cracked-glass frame, sized to the panel ─────────────────────────
function drawFrame() {
  const w = app.clientWidth, h = app.clientHeight, c = 12;
  const f = $('frame');
  f.setAttribute('viewBox', `0 0 ${w} ${h}`);
  f.setAttribute('width', w); f.setAttribute('height', h);
  const o = 10, i = 15;
  const box = (p, k) => `M${p + k} ${p} H${w - p - k} L${w - p} ${p + k} V${h - p - k} L${w - p - k} ${h - p} H${p + k} L${p} ${h - p - k} V${p + k} Z`;
  f.innerHTML = `
    <path d="${box(o, c)}" fill="none" stroke="#5A5650"/>
    <path d="${box(i, c - 1)}" fill="none" stroke="#2A2825"/>
    <path d="M${o} ${o + c} L${o + c} ${o} M${w - o - c} ${h - o} L${w - o} ${h - o - c}" stroke="#8F8A82" stroke-width="1.2"/>
    <path d="M${w * 0.15} 40 L${w * 0.36} 46 M${w * 0.62} ${h - 54} L${w * 0.85} ${h - 62} M${w * 0.77} 60 L${w * 0.9} 58" stroke="#E4E0D8" stroke-width="0.4" opacity="0.12"/>`;
}
window.addEventListener('resize', drawFrame);

// ── settings ────────────────────────────────────────────────────────
function applySettings() {
  const s = settings.all();
  app.classList.toggle('calm', s.distortion === 'calm');
  document.documentElement.dataset.text = s.textSize;
  setSound(s.sound);
  $('setFast').setAttribute('aria-checked', s.fast);
  $('setNotify').setAttribute('aria-checked', s.notify);
  $('setSound').setAttribute('aria-checked', s.sound);
  $('setMusic').setAttribute('aria-checked', s.music);
  for (const b of $('setVol').children) b.setAttribute('aria-checked', b.dataset.v === s.musicVolume);
  music.refresh();
  for (const b of $('setDist').children) b.setAttribute('aria-checked', b.dataset.v === s.distortion);
  for (const b of $('setText').children) b.setAttribute('aria-checked', b.dataset.v === s.textSize);
  const found = (load('m1931.endings') || []).length;
  $('sEndings').innerHTML = `${found} <span>/ ${ENDING_ORDER.length}</span>`;
  if (!('Notification' in window)) $('notifyNote').textContent = 'Not available in this browser';
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  app.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

async function askNotify() {
  if (!('Notification' in window)) { toast('Notifications are not available here.'); return false; }
  try {
    const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (p === 'granted') { settings.set('notify', true); applySettings(); toast("We'll tell you when Dyer is back."); return true; }
  } catch (e) { /* refused */ }
  toast('Notifications are blocked. Keep this tab open.');
  return false;
}

// ── instability: hesitations and a tremor that build as Dyer's sanity falls ──
// Both are seeded by the line's text, so a reload shows exactly the same thing.
function seeded(text) {
  let h = 2166136261;
  for (let k = 0; k < text.length; k++) { h ^= text.charCodeAt(k); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function hesitate(text, sanity, horror) {
  if (sanity >= 6 || text.length < 24) return text;
  const rnd = seeded(text);
  let count = 0;
  if (sanity >= 4) count = rnd() < 0.25 ? 1 : 0;
  else if (sanity >= 1) count = rnd() < 0.6 ? 1 : 0;
  else count = rnd() < 0.75 ? 1 + (rnd() < 0.35 ? 1 : 0) : 0;
  if (horror) count = Math.min(count, 1);            // let the creature's imagery land
  if (!count) return text;
  const words = text.split(' ');
  const spots = [];
  for (let k = 0; k < words.length - 1; k++) {
    const w = words[k];
    if (/[.,!?;:—…]$/.test(w) || /\.\.\.$/.test(w)) continue; // already a natural break
    const weight = w.replace(/[^a-z']/gi, '').length <= 6 ? 3 : 1;   // prefer short words: "we", "it's", "always"
    for (let j = 0; j < weight; j++) spots.push(k);
  }
  const chosen = new Set();
  const distinct = new Set(spots).size;            // never ask for more pauses than there are places
  for (let tries = 0; chosen.size < Math.min(count, distinct) && tries < 50; tries++) chosen.add(spots[Math.floor(rnd() * spots.length)]);
  const repeat = sanity <= 0 && rnd() < 0.3;
  return words.map((w, k) => {
    if (!chosen.has(k)) return w;
    if (repeat && k === Math.min(...chosen)) return `${w}... ${w.toLowerCase()}`; // "Always... always downhill"
    return `${w}...`;
  }).join(' ');
}

function tremor(p, entry) {
  const sv = entry.sanity ?? (entry.tier === 3 ? 0 : entry.tier === 2 ? 2 : entry.tier === 1 ? 4 : 7);
  if (sv >= 6) return;
  const steps = [[5, 0.3, 7], [4, 0.45, 5.5], [3, 0.7, 4.5], [2, 0.9, 3.6], [1, 1.2, 2.8], [0, 1.5, 2.2]];
  const [, amp, dur] = steps.find(([lv]) => sv >= lv) || [0, 1.9, 1.8];
  const rnd = seeded(entry.text + 'tremor');
  p.classList.add('shake');
  if (sv <= 0) p.classList.add('split');
  p.style.setProperty('--amp', `${amp}px`);
  p.style.setProperty('--dur', `${dur}s`);
  p.style.animationDelay = `-${(rnd() * dur).toFixed(2)}s`;
}

// ── the log ─────────────────────────────────────────────────────────
const log = $('log');
let group = null;
let typingRow = null;

function nearBottom() { return log.scrollHeight - log.scrollTop - log.clientHeight < 80; }
function toBottom() { log.scrollTop = log.scrollHeight; }

function newGroup(from, at) {
  const g = document.createElement('div');
  g.className = `grp ${from}`;
  g.innerHTML = `<div class="body"><span class="label">${from === 'base' ? 'BASE' : 'DYER'} · ${at}</span></div>`;
  log.appendChild(g);
  group = { from, el: g.firstChild };
  return group;
}

function renderEntry(entry, animate) {
  const stick = nearBottom() || !animate;
  if (entry.from === 'chapter') {
    const c = document.createElement('div');
    c.className = 'chap';
    c.textContent = `${roman(entry.n)} · ${entry.text.toUpperCase()}`;
    log.appendChild(c); group = null;
    if (stick) toBottom();
    return Promise.resolve();
  }
  if (entry.from === 'system') {
    const s = document.createElement('div');
    s.className = 'sys' + (entry.end ? ` end ${entry.end === 'death' ? 'death' : 'hold'}` : '');
    s.textContent = entry.text;
    if (entry.end && animate) entry.end === 'death' ? sfx.staticBurst() : sfx.signal();
    log.appendChild(s); group = null;
    if (stick) toBottom();
    return Promise.resolve();
  }
  if (!group || group.from !== entry.from) newGroup(entry.from, entry.at);
  const p = document.createElement('p');
  p.className = `line ${entry.from}`;
  if (entry.tone === 'horror') p.classList.add('horror');
  if (entry.from === 'dyer') tremor(p, entry);
  group.el.appendChild(p);
  const text = entry.from === 'dyer' ? hesitate(entry.text, entry.sanity ?? 7, entry.tone === 'horror') : entry.text;
  if (!animate || entry.from !== 'dyer') {
    p.textContent = text;
    if (stick) toBottom();
    return Promise.resolve();
  }
  // type it out. Where Dyer hesitates ("...") the dots come slowly, then a real pause.
  const fast = settings.get('fast');
  const per = Math.min(fast ? 400 : 2200, text.length * (fast ? 10 : 34)) / text.length;
  const dotStep = fast ? 160 : 300, afterDots = fast ? 500 : 1000, dash = fast ? 300 : 550;
  entry.tone === 'horror' ? sfx.horror() : sfx.incoming();
  music.duck(true);
  return new Promise((resolve) => {
    let n = 0;
    const next = () => {
      n++;
      p.textContent = text.slice(0, n);
      if (stick) toBottom();
      if (n >= text.length) { music.duck(false); resolve(); return; }
      const c = text[n - 1], inDots = c === '.' && (text[n] === '.' || text[n - 2] === '.');
      let wait = per;
      if (inDots && text[n] === '.') wait = dotStep;                    // the dots arrive one by one
      else if (inDots && text[n - 2] === '.' && text[n - 3] === '.') wait = afterDots; // ...then he gathers himself
      else if (c === '—') wait = dash;
      setTimeout(next, wait);
    };
    next();
  });
}

function setTyping(on) {
  if (on && !typingRow) {
    typingRow = document.createElement('div');
    typingRow.className = 'typingrow';
    typingRow.setAttribute('aria-label', 'Dyer is transmitting');
    typingRow.innerHTML = `<span class="typing"></span><span class="wave" aria-hidden="true">${[6, 12, 4, 16, 8, 2, 10, 6].map((hh, k) => `<i style="height:${hh}px;animation-delay:-${(k * 0.17).toFixed(2)}s"></i>`).join('')}</span>`;
    log.appendChild(typingRow);
    toBottom();
  } else if (!on && typingRow) { typingRow.remove(); typingRow = null; }
}

function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n); }
const pad = (n) => String(n).padStart(2, '0');

// ── bottom panel: choices or busy ──────────────────────────────────
const bottom = $('bottom');
let busyTimer = null;

function renderChoices(list) {
  clearBusyPanel(false);
  // emphasise only the question Dyer is waiting on (gold is used sparingly)
  const last = [...log.querySelectorAll('.line.dyer')].pop();
  if (last) last.classList.add('key');
  bottom.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'respond';
  panel.innerHTML = '<span class="label">RESPOND</span>';
  list.forEach((c, k) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.innerHTML = `<span class="k">${'AB'[k] || k + 1}</span><span class="t"></span><span class="chev" aria-hidden="true">›</span>`;
    b.querySelector('.t').textContent = c.label;
    b.addEventListener('click', () => {
      bottom.innerHTML = '';
      log.querySelectorAll('.line.key').forEach((el) => el.classList.remove('key'));
      engine.choose(c);
    });
    panel.appendChild(b);
  });
  bottom.appendChild(panel);
  toBottom();
}

// One button before a chapter card or an ending, so the player chooses when the scene changes.
function renderHold(kind, endKind) {
  clearBusyPanel(false);
  bottom.innerHTML = '';
  if (kind === 'end') $('game').classList.add(endKind === 'death' ? 'is-ending' : 'is-ending-hold');
  const panel = document.createElement('div');
  panel.className = 'respond';
  if (kind === 'end') panel.innerHTML = `<span class="label">${endKind === 'death' ? 'NO CARRIER' : 'SIGNAL HOLDING'}</span>`;
  const b = document.createElement('button');
  b.className = 'btn hold-btn' + (kind === 'end' ? ' primary' : '');
  b.innerHTML = `<span>${kind === 'end' ? 'END OF TRANSMISSION' : 'STAY ON THE FREQUENCY'}</span><span class="chev" aria-hidden="true">›</span>`;
  panel.appendChild(b);
  bottom.appendChild(panel);
  toBottom();
  if (kind === 'end') music.fadeOut();
  return new Promise((resolve) => {
    b.addEventListener('click', () => {
      bottom.innerHTML = '';
      $('game').classList.remove('is-ending', 'is-ending-hold');
      resolve();
    }, { once: true });
  });
}

// While the player reads Dyer's last lines before he goes quiet.
function renderReading(on) {
  if (on) { clearBusyPanel(false); bottom.innerHTML = ''; }
}

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

function renderBusy(until, status) {
  bottom.innerHTML = '';
  $('game').classList.add('is-busy');
  const total = Math.max(1, (engine.state.waitMinutes || 1) * 60000);
  const panel = document.createElement('div');
  panel.className = 'busy';
  panel.innerHTML = `
    <svg class="ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#2A2825" stroke-width="1.5"/>
      <circle id="ringArc" cx="20" cy="20" r="17" fill="none" stroke="#8F8A82" stroke-width="1.5" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 20 20)"/>
      <circle class="ringdot" cx="20" cy="20" r="2.5" fill="#D4A04A"/>
    </svg>
    <div class="busy-info">
      <span class="busy-time"><b id="ringTime">00:00</b><span class="note">WAITING FOR SIGNAL</span></span>
      <span class="status"></span>
    </div>
    <div class="actions">
      <button class="icon-btn" id="bNotify" aria-label="Notify me when Dyer is back">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 11 V7 a4 4 0 0 1 8 0 V11 L13 12 H3 Z M6.5 13.5 a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
      </button>
    </div>`;
  panel.querySelector('.status').textContent = status;
  panel.setAttribute('aria-label', `${status} Waiting for signal.`);
  bottom.appendChild(panel);
  const nb = $('bNotify');
  const markNotify = () => { nb.classList.toggle('on', !!settings.get('notify')); nb.setAttribute('aria-pressed', !!settings.get('notify')); };
  markNotify();
  nb.addEventListener('click', async () => {
    if (settings.get('notify')) { settings.set('notify', false); toast('Notifications off.'); } else await askNotify();
    markNotify(); applySettings();
  });
  const tick = () => {
    const left = until - Date.now();
    const frac = Math.max(0, Math.min(1, left / total));
    $('ringTime').textContent = fmt(left);
    $('ringArc').setAttribute('stroke-dasharray', `${frac} ${1 - frac + 0.001}`);
  };
  tick();
  clearInterval(busyTimer);
  busyTimer = setInterval(tick, 1000);
  sfx.staticBurst();
  music.waiting(true);
}

function clearBusyPanel(signalBack) {
  clearInterval(busyTimer); busyTimer = null;
  music.waiting(false);
  $('game').classList.remove('is-busy');
  if (bottom.querySelector('.busy')) bottom.innerHTML = '';
  if (signalBack) {
    sfx.signal();
    if (document.hidden) {
      document.title = '● Dyer is back on the air';
      if (settings.get('notify') && 'Notification' in window && Notification.permission === 'granted') {
        try { new Notification('Miskatonic 1931', { body: 'Dyer is back on the air.' }); } catch (e) { /* ignore */ }
      }
    }
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) document.title = 'Miskatonic 1931'; });

// ── header, rail and readouts ──────────────────────────────────────
const SIGNAL = [88, 74, 66, 58, 47, 36, 24, 52, 71];
function chapterOf(state) {
  if (state.chapterN) return state.chapterN;
  const n = NODES[state.checkpoint ? state.checkpoint.node : state.node];
  return (n && n.chapter && n.chapter.n) || 1;
}
// Which music loop fits the moment: Dyer fraying or the climax chapters → pulse; otherwise main.
// Death is approaching when a death ending is at most two steps away from where the story is.
const NEAR_DEATH = (() => {
  const out = (n) => [...(n.choices || []).map((c) => c.goto), ...(n.branch || []).map((b) => b.goto), ...(n.next ? [n.next] : [])];
  const isDeath = (id) => NODES[id] && NODES[id].ending && ENDINGS[NODES[id].ending].kind === 'death';
  const near = new Set();
  for (const id of Object.keys(NODES)) {
    if (isDeath(id)) { near.add(id); continue; }
    const one = out(NODES[id]);
    if (one.some(isDeath) || one.some((t) => NODES[t] && out(NODES[t]).some(isDeath))) near.add(id);
  }
  return near;
})();
function cueFor(state) {
  if (state.phase === 'ending' || NEAR_DEATH.has(state.node)) return 'pulse';
  return 'main';
}
function updateChrome(state) {
  if (current === 'game') music.cue(cueFor(state));
  const ch = chapterOf(state);
  $('txNo').textContent = String(state.transmission).padStart(3, '0');
  $('railCh').innerHTML = `CH<br>${pad(ch)}`;
  $('pip').style.top = `${((ch - 1) / (CHAPTERS - 1)) * 100}%`;
  $('sigOut').innerHTML = `SIGNAL ${SIGNAL[ch - 1]}%<br>7.4 MC`;
  $('clockOut').innerHTML = `${dateLabel(state.clock)}<br>${clockLabel(state.clock)}`;
}

function rebuild(state) {
  log.innerHTML = ''; group = null; typingRow = null; bottom.innerHTML = '';
  $('game').classList.remove('is-busy');
  for (const e of state.log) renderEntry(e, false);
  updateChrome(state);
  toBottom();
}

// ── chapter card ───────────────────────────────────────────────────
function showChapter(info) {
  $('cNo').innerHTML = `${pad(info.n)} <span>/ ${pad(CHAPTERS)}</span>`;
  $('cTitle').textContent = info.title;
  $('cNarr').textContent = info.narration;
  show('chapter');
  sfx.staticBurst();
  return new Promise((resolve) => {
    $('cGo').onclick = () => { show('game'); resolve(); };
    $('cGo').focus({ preventScroll: true });
  });
}

// ── ending ─────────────────────────────────────────────────────────
function showEnding(id, state) {
  const e = ENDINGS[id];
  const death = e.kind === 'death';
  const found = load('m1931.endings') || [];
  const scr = $('ending');
  scr.classList.toggle('ending-death', death);
  scr.classList.toggle('ending-hold', !death);
  $('eStatus').textContent = `${e.status} · ${clockLabel(state.clock)}`;
  $('eStatus').className = `label ${death ? 'lost' : 'hold'}`;
  $('eTitle').textContent = e.title;
  $('eEpi').textContent = e.epilogue;
  $('eEcho').hidden = !e.echo; $('eEcho').textContent = e.echo || '';
  $('eEcg').innerHTML = death
    ? `<svg viewBox="0 0 330 80" preserveAspectRatio="none"><defs><clipPath id="ecgClip"><rect id="ecgReveal" x="0" y="0" width="0" height="80"/></clipPath></defs><path clip-path="url(#ecgClip)" d="${MONITOR_D}" fill="none" stroke="#7FE0D0" stroke-width="1" style="filter: drop-shadow(0 0 3px rgba(127,224,208,0.6))"/><path d="M0 62 H330" stroke="#24403C" stroke-dasharray="2 4"/></svg><i class="ecg-tip" id="ecgTip"></i>`
    : `<svg viewBox="0 0 330 80" preserveAspectRatio="none" style="-webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"><g class="beatscroll"><path d="M0 40 H30 L34 26 L38 54 L42 32 L46 44 L50 40 H110 L114 26 L118 54 L122 32 L126 44 L130 40 H190 L194 26 L198 54 L202 32 L206 44 L210 40 H270 L274 26 L278 54 L282 32 L286 44 L290 40 H350 L354 26 L358 54 L362 32 L366 44 L370 40 H430 L434 26 L438 54 L442 32 L446 44 L450 40 H500" fill="none" stroke="#D4A04A" stroke-width="1" style="filter: drop-shadow(0 0 3px rgba(212,160,74,0.6))"/></g><path d="M0 62 H330" stroke="#3B3833" stroke-dasharray="2 4"/></svg>`;
  const target = engine.rewindTarget().cp;
  const cpN = target && (target.ch || (NODES[target.node].chapter || {}).n);
  $('eCp').textContent = cpN ? `CH ${pad(cpN)}` : '';
  show('ending');
  if (death) runMonitor(); else { sfx.signal(); music.sting('victory'); }
  applySettings();
}

// The death monitor: drawn once, left to right. Three weakening heartbeats, each beeping as its
// spike is drawn, then the line goes flat with a long flat tone, and stays flat. No loop.
const MONITOR = [[0, 40], [30, 40], [34, 20], [38, 60], [42, 30], [46, 44], [50, 40], [100, 40], [104, 27], [108, 53], [112, 35], [115, 42], [118, 40], [168, 40], [171, 33], [174, 47], [177, 38], [179, 41], [181, 40], [330, 40]];
const MONITOR_D = 'M' + MONITOR.map(([x, y]) => `${x} ${y}`).join(' L');
const MONITOR_BEATS = [[34, 0.035], [104, 0.024], [171, 0.014]];
const MONITOR_FLAT = 196;
let monitorRun = 0;
function monitorY(x) {
  for (let k = 1; k < MONITOR.length; k++) {
    const [x1, y1] = MONITOR[k], [x0, y0] = MONITOR[k - 1];
    if (x <= x1) return y0 + ((x - x0) / Math.max(0.001, x1 - x0)) * (y1 - y0);
  }
  return 40;
}
function runMonitor() {
  const run = ++monitorRun;
  const total = 7000, start = performance.now();
  let beat = 0, flat = false;
  const box = $('eEcg');
  const frame = (now) => {
    if (run !== monitorRun || current !== 'ending') return;
    const x = Math.min(330, ((now - start) / total) * 330);
    $('ecgReveal').setAttribute('width', x);
    const r = box.querySelector('svg').getBoundingClientRect(), b = box.getBoundingClientRect();
    $('ecgTip').style.transform = `translate(${r.left - b.left + x * (r.width / 330)}px, ${r.top - b.top + monitorY(x) * (r.height / 80)}px)`;
    while (beat < MONITOR_BEATS.length && x >= MONITOR_BEATS[beat][0]) { sfx.monitorBeep(MONITOR_BEATS[beat][1]); beat++; }
    if (!flat && x >= MONITOR_FLAT) { flat = true; sfx.flatline(4); }
    if (x < 330) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function leaveEnding() { monitorRun++; sfx.hush(); }

// ── endings list ───────────────────────────────────────────────────
function showEndings() {
  const found = load('m1931.endings') || [];
  $('enList').innerHTML = ENDING_ORDER.map((id, k) => {
    const e = ENDINGS[id];
    if (!found.includes(id)) return `<div class="end-item locked"><span class="no">${pad(k + 1)}</span><div><b>· · · · ·</b><small>Not yet found.</small></div></div>`;
    const kind = e.kind === 'death' ? 'death' : 'hold';
    return `<div class="end-item"><span class="no">${pad(k + 1)}</span><div><b>${e.title}</b><span class="kind ${kind}">${e.status}</span><small>${e.epilogue}</small></div></div>`;
  }).join('');
  $('enCount').textContent = `${found.length} OF ${ENDING_ORDER.length} FOUND`;
  show('endings');
}

// ── engine ─────────────────────────────────────────────────────────
const engine = new Engine({
  line: (entry, animate) => renderEntry(entry, animate),
  typing: setTyping,
  choices: renderChoices,
  hold: renderHold,
  reading: renderReading,
  busy: renderBusy,
  clearBusy: clearBusyPanel,
  chapter: showChapter,
  ending: showEnding,
  update: updateChrome,
  rebuild,
}, settings);

// ── title screen ───────────────────────────────────────────────────
function refreshTitle() {
  const resume = engine.hasSave;
  $('startLabel').textContent = resume ? 'RESUME THE SIGNAL' : 'ANSWER THE SIGNAL';
  $('newgame').hidden = !resume;
  applySettings();
}

let incomingTimer = null;
function incomingLoop() {
  const el = $('incoming');
  const word = 'INCOMING';
  let n = 0, blinks = 0, showing = true;
  clearInterval(incomingTimer);
  const typeStep = () => {
    n++;
    el.innerHTML = word.slice(0, n) + (n < word.length ? '<span class="caret"></span>' : '');
    if (n >= word.length) { clearInterval(incomingTimer); incomingTimer = setInterval(blinkStep, 800); }
  };
  const blinkStep = () => {
    showing = !showing; blinks++;
    el.textContent = showing ? word : '';
    if (blinks >= 6) { clearInterval(incomingTimer); setTimeout(incomingLoop, 1200); }
  };
  el.innerHTML = '<span class="caret"></span>';
  setTimeout(() => { incomingTimer = setInterval(typeStep, 130); }, 600);
}

// Title ridges: drawn like a monitor trace. The near ridge scrolls left and appears at a glowing
// write-head three-quarters across; the mask in CSS hides what hasn't been "drawn" yet.
const RIDGE = [[0, 70], [40, 58], [70, 66], [112, 30], [150, 58], [186, 40], [214, 56], [256, 16], [300, 50], [338, 36], [390, 70]];
function ridgeY(x) {
  x = ((x % 390) + 390) % 390;
  for (let k = 1; k < RIDGE.length; k++) {
    const [x1, y1] = RIDGE[k], [x0, y0] = RIDGE[k - 1];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 70;
}
const ridgeStart = performance.now();
const nearRidge = document.querySelector('.ridges .near');
const logoHaze = document.querySelector('#title .logo .haze');
const logoBeam = document.querySelector('#title .logo .beam');
function ridgeLoop(now) {
  if (current === 'title') {
    const off = (((now - ridgeStart) / 14000) * 390) % 390;
    const hx = $('title').querySelector('.ridges').clientWidth * 0.745;
    nearRidge.style.transform = `translateX(${-off}px)`;
    $('ridgeHead').style.transform = `translate(${hx}px, ${ridgeY(hx + off)}px)`;
    const lvl = music.level();
    const k = lvl ? 0.2 + Math.pow(lvl, 3) * 1.15 : 1;   // follows the music's swells; with no music the logo stays as designed
    logoHaze.style.opacity = k; logoBeam.style.opacity = 0.8 * k;
  }
  requestAnimationFrame(ridgeLoop);
}
requestAnimationFrame(ridgeLoop);

setInterval(() => {
  if (current !== 'title') return;
  const d = new Date();
  $('titleClock').innerHTML = `23 01 31<br>${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}, 1000);

function beginNew() {
  engine.stop();
  show('game');
  rebuild({ log: [], transmission: 1, clock: 0, node: 'c1_start' });
  engine.newGame();
}
function startOrIntro() {
  if (!load('m1931.introSeen')) { show('intro'); $('iGo').focus({ preventScroll: true }); return; }
  beginNew();
}
$('start').addEventListener('click', () => {
  initAudio(); setSound(settings.get('sound')); music.start();
  if (engine.hasSave) { show('game'); rebuild(engine.state); engine.resume(); }
  else startOrIntro();
});
$('newgame').addEventListener('click', () => { initAudio(); music.start(); startOrIntro(); });
$('iGo').addEventListener('click', () => { save('m1931.introSeen', true); beginNew(); });
$('iNotify').addEventListener('click', async () => {
  if (await askNotify()) { $('iNotify').textContent = 'NOTIFICATIONS ON'; $('iNotify').disabled = true; }
});
$('toEndings').addEventListener('click', showEndings);
$('enClose').addEventListener('click', () => { applySettings(); show('settings'); });
const openSettings = () => { returnTo = current; applySettings(); show('settings'); };
$('toSettings').addEventListener('click', openSettings);
$('gameMenu').addEventListener('click', openSettings);
$('sClose').addEventListener('click', () => {
  show(returnTo);
  if (returnTo === 'title') refreshTitle();
});

// settings controls
$('setFast').addEventListener('click', () => {
  const on = !settings.get('fast'); settings.set('fast', on); applySettings();
  if (on && engine.state) engine.hurry();
});
$('setNotify').addEventListener('click', async () => {
  if (settings.get('notify')) { settings.set('notify', false); applySettings(); } else await askNotify();
});
$('setSound').addEventListener('click', () => { settings.set('sound', !settings.get('sound')); applySettings(); initAudio(); sfx.reply(); });
$('setMusic').addEventListener('click', () => { settings.set('music', !settings.get('music')); applySettings(); music.start(); });
$('setVol').addEventListener('click', (ev) => { const v = ev.target.dataset.v; if (v) { settings.set('musicVolume', v); applySettings(); music.start(); } });
$('setDist').addEventListener('click', (ev) => { const v = ev.target.dataset.v; if (v) { settings.set('distortion', v); applySettings(); } });
$('setText').addEventListener('click', (ev) => { const v = ev.target.dataset.v; if (v) { settings.set('textSize', v); applySettings(); } });
let eraseArmed = false;
$('sErase').addEventListener('click', () => {
  if (!eraseArmed) {
    eraseArmed = true; $('sErase').classList.add('armed'); $('sEraseGo').textContent = 'TAP AGAIN TO ERASE';
    setTimeout(() => { eraseArmed = false; $('sErase').classList.remove('armed'); $('sEraseGo').textContent = 'RESTART ›'; }, 4000);
    return;
  }
  engine.stop(); remove('m1931.game'); remove('m1931.endings'); remove('m1931.introSeen');
  engine.state = null; eraseArmed = false;
  $('sErase').classList.remove('armed'); $('sEraseGo').textContent = 'RESTART ›';
  show('title'); refreshTitle(); toast('The record is erased.');
});

// ending controls
$('eRewind').addEventListener('click', () => { leaveEnding(); show('game'); music.start(); engine.rewind(); });
$('eTitleBtn').addEventListener('click', () => { leaveEnding(); show('title'); refreshTitle(); });

// boot
window.__m1931 = { music, engine, sfx }; // handy for testing in the browser console
// Button click sound on press (pointerdown), not on release; keyboard presses still click.
let lastPress = 0;
document.addEventListener('pointerdown', (ev) => { if (ev.target.closest('button')) { initAudio(); sfx.click(); lastPress = performance.now(); } }, true);
document.addEventListener('click', (ev) => { if (ev.target.closest('button') && performance.now() - lastPress > 600) { initAudio(); sfx.click(); } }, true);
document.addEventListener('pointerdown', () => { initAudio(); music.intro(); setTimeout(() => { $('tapSound').hidden = music.running; }, 300); }, { once: true });
$('tapSound').addEventListener('click', () => { initAudio(); music.intro(); $('tapSound').hidden = true; });
applySettings();
refreshTitle();
show('title');
incomingLoop();
