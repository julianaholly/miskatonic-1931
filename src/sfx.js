// Tiny Web Audio synth: radio blips, static, button clicks and the heart monitor. No audio files.
// Audio can only start after the player taps something, so init() is called from a tap.
let ctx = null;
let enabled = true;
let clickBuf = null;
const live = new Set(); // long sounds (the flatline) that can be cut when the screen changes

export function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
  } catch (e) { ctx = null; }
}
export function setEnabled(on) { enabled = on; }

function tone(freq, dur, vol = 0.04, type = 'sine', attack = 0.008) {
  if (!ctx || !enabled) return null;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.02);
  return { o, g };
}

function noiseBuffer(dur) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  return buf;
}

function noise(dur, vol = 0.03, buf = null) {
  if (!ctx || !enabled) return;
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.7;
  g.gain.value = vol;
  src.buffer = buf || noiseBuffer(dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(0);
}

export const sfx = {
  incoming() { tone(1180, 0.06, 0.025); setTimeout(() => tone(1180, 0.06, 0.02), 90); },
  reply() { tone(760, 0.05, 0.02, 'triangle'); },
  // A soft mechanical key click. Pre-built buffer and no attack ramp, so it lands with the finger.
  click() {
    if (!ctx || !enabled) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!clickBuf) clickBuf = noiseBuffer(0.025);
    noise(0, 0.07, clickBuf);
    tone(2200, 0.02, 0.012, 'square', 0.001);
  },
  staticBurst() { noise(0.45, 0.05); },
  horror() { tone(1560, 0.35, 0.012, 'sine'); setTimeout(() => tone(1720, 0.3, 0.01), 160); },
  // Heart monitor: one short beep per heartbeat…
  monitorBeep(vol = 0.03) { tone(1000, 0.13, vol, 'sine', 0.004); },
  // …and the long flat tone: holds, then fades so it doesn't drone forever.
  flatline(hold = 4) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 1000;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.01);
    g.gain.setValueAtTime(0.022, t + hold);
    g.gain.linearRampToValueAtTime(0, t + hold + 2.5);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + hold + 2.6);
    const h = { o, g };
    live.add(h);
    o.onended = () => live.delete(h);
  },
  // Cut any long sound (leaving the ending screen).
  hush() {
    if (!ctx) return;
    for (const h of live) {
      try { h.g.gain.cancelScheduledValues(ctx.currentTime); h.g.gain.setValueAtTime(h.g.gain.value, ctx.currentTime); h.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); h.o.stop(ctx.currentTime + 0.35); } catch (e) { /* ignore */ }
    }
    live.clear();
  },
  signal() { noise(0.2, 0.03); setTimeout(() => this.incoming(), 220); },
};
