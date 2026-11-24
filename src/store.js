// localStorage with an in-memory fallback. Storage can be blocked
// (private windows, previews), so every call is guarded.
const memory = new Map();

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw);
  } catch (e) { /* fall through */ }
  return memory.has(key) ? JSON.parse(memory.get(key)) : null;
}

export function save(key, value) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try { localStorage.setItem(key, raw); } catch (e) { /* memory only */ }
}

export function remove(key) {
  memory.delete(key);
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

// Settings with defaults; fast mode is a testing aid, planned to be removed for the final version.
const DEFAULTS = { fast: false, notify: false, sound: true, music: true, musicVolume: 'medium', distortion: 'full', textSize: 'm' };

// Fast mode lasts for this visit only (sessionStorage), so the game always opens at real-time pace.
let fastMemory = false;
function getFast() { try { return sessionStorage.getItem('m1931.fast') === '1'; } catch (e) { return fastMemory; } }
function setFast(on) { fastMemory = on; try { sessionStorage.setItem('m1931.fast', on ? '1' : '0'); } catch (e) { /* memory only */ } }

export const settings = {
  all() { return { ...DEFAULTS, ...(load('m1931.settings') || {}), fast: getFast() }; },
  get(k) { return this.all()[k]; },
  set(k, v) {
    if (k === 'fast') return setFast(!!v);
    const s = this.all(); delete s.fast; s[k] = v; save('m1931.settings', s);
  },
};
