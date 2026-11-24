// Background music: two looping cues that crossfade with the story, plus two one-shot stings.
//   main    → the soundtrack, from the title screen on (the logo glows with it)  Ruskerdax: Pondering the Cosmos
//   pulse   → when death is approaching (fades in over main, then back out)     Dark Sci-Fi Audio Pack: Pulse
//   hover   → plays once as the title screen opens, before main fades in        Dark Sci-Fi Audio Pack: Hover
//   victory → sting when the story reaches a survival ending                    Dark Sci-Fi Audio Pack: Victory
// All tracks CC0 (OpenGameArt).
// Played through Web Audio so volumes fade smoothly (iPhone ignores <audio>.volume).
// A missing file falls back to 'main', and with no files at all the game is silent.
import { settings } from './store.js';

const FILES = { main: 'audio/main.mp3', pulse: 'audio/pulse.mp3' };
const STINGS = { hover: 'audio/hover.mp3', victory: 'audio/victory.mp3' };
const LEVELS = { low: 0.18, medium: 0.32, high: 0.5 };
const FADE = 2.5;

let ctx = null, master = null, analyser = null, levelData = null, peak = 0.01, smooth = 0;
const tracks = {};        // cue → { el, gain, ok }
let current = null, wanted = 'main', ducked = false, faded = false, waiting = false, introDone = false;

function volume() {
  if (!settings.get('music') || faded) return 0;
  const v = LEVELS[settings.get('musicVolume')] ?? LEVELS.medium;
  return v * (ducked ? 0.55 : 1) * (waiting ? 0.7 : 1);
}

function setGain(g, value, seconds) {
  const t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(value, t + seconds);
}

// Load a file as a same-page blob: audio from another address is silenced by Web Audio,
// and published files may be served from a different address than the page.
function localSrc(el, url, onFail) {
  fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then((b) => { el.src = URL.createObjectURL(b); el.load(); if (el.dataset.want === '1') el.play().catch(() => {}); })
    .catch(onFail);
}

function load(cue) {
  if (tracks[cue]) return tracks[cue];
  const el = new Audio();
  el.loop = true; el.preload = 'auto';
  const gain = ctx.createGain(); gain.gain.value = 0;
  ctx.createMediaElementSource(el).connect(gain).connect(master);
  gain.connect(analyser); // measured before the volume setting, so the glow works at any volume
  const t = { el, gain, ok: true };
  localSrc(el, FILES[cue], () => { t.ok = false; if (current === cue) { current = null; music.cue(wanted === cue ? 'main' : wanted); } });
  tracks[cue] = t;
  return t;
}

function play(cue) {
  const t = load(cue);
  if (!t.ok) { if (cue !== 'main') play('main'); return; }
  for (const [k, o] of Object.entries(tracks)) {
    if (k !== cue) { setGain(o.gain, 0, FADE); setTimeout(() => { if (current !== k) o.el.pause(); }, FADE * 1000 + 100); }
  }
  current = cue;
  t.el.dataset.want = settings.get('music') ? '1' : '0';
  if (settings.get('music') && t.el.src) t.el.play().catch(() => {});
  setGain(t.gain, 1, FADE);
}

export const music = {
  // Call from a tap: browsers only allow audio to start after the player interacts.
  get running() { return !!ctx && ctx.state === 'running'; },
  start() {
    faded = false;
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0;
        analyser = ctx.createAnalyser(); analyser.fftSize = 512;
        levelData = new Uint8Array(analyser.fftSize);
        master.connect(ctx.destination);
      } catch (e) { ctx = null; return; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    play(wanted);
    setGain(master, volume(), 1.5);
  },
  // The opening: Hover plays once, then the main soundtrack fades in beneath it.
  intro() {
    if (introDone) return this.start();
    introDone = true;
    this.start();
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(0, t);
    master.gain.setValueAtTime(0, t + 1.2);
    master.gain.linearRampToValueAtTime(volume(), t + 5.5);
    this.sting('hover');
  },
  // Back from an ending: bring the music up again.
  unfade() { if (faded && ctx) { faded = false; setGain(master, volume(), 2); } },
  // Switch to a cue; crossfades if music is already running.
  cue(name) {
    if (!FILES[name]) return;
    wanted = name;
    if (ctx && current !== name) play(name);
  },
  duck(on) { ducked = on; if (ctx) setGain(master, volume(), on ? 0.4 : 1.5); },
  // Softer music while the player waits for Dyer.
  waiting(on) { if (waiting === on) return; waiting = on; if (ctx) setGain(master, volume(), 2); },
  // A one-shot sound over the music (not affected by fades or ducking).
  sting(name) {
    if (!ctx || !STINGS[name] || !settings.get('music')) return;
    try {
      const el = new Audio();
      el.dataset.want = '1';
      const g = ctx.createGain();
      g.gain.value = (LEVELS[settings.get('musicVolume')] ?? LEVELS.medium) * 2.2;
      ctx.createMediaElementSource(el).connect(g).connect(ctx.destination);
      localSrc(el, STINGS[name], () => {});
    } catch (e) { /* ignore */ }
  },
  fadeOut() { faded = true; if (ctx) setGain(master, 0, 2); },
  refresh() { if (!ctx) return; if (settings.get('music') && current && tracks[current].el.src) tracks[current].el.play().catch(() => {}); setGain(master, volume(), 0.6); },
  // Loudness of what's playing right now, 0–1 (for the title logo glow).
  // Relative to the track's own recent peaks, so quiet and loud tracks both give a full range.
  level() {
    if (!analyser || !current || !settings.get('music') || faded) return 0;
    analyser.getByteTimeDomainData(levelData);
    let sum = 0;
    for (let k = 0; k < levelData.length; k++) { const v = (levelData[k] - 128) / 128; sum += v * v; }
    const rms = Math.sqrt(sum / levelData.length);
    peak = Math.max(rms, peak * 0.997, 0.002);
    smooth += (rms / peak - smooth) * 0.15;
    return Math.max(0.001, Math.min(1, smooth));
  },
};

document.addEventListener('visibilitychange', () => {
  if (!ctx || !current) return;
  const el = tracks[current].el;
  if (document.hidden) el.pause();
  else if (settings.get('music') && !faded && el.src) el.play().catch(() => {});
});
