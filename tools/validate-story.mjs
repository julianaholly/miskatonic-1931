// Checks the story graph: links resolve, every node is reachable,
// every path reaches an ending, and copy follows the voice guide limits.
// Run: node tools/validate-story.mjs
import { NODES, START, ENDINGS, ENDING_ORDER, FIRST_WAIT } from '../src/story/act1.js';

const errors = [];
const warnings = [];
const ids = Object.keys(NODES);

const targetsOf = (n) => [
  ...(n.choices || []).map((c) => c.goto),
  ...(n.branch || []).map((b) => b.goto),
  ...(n.next ? [n.next] : []),
];

for (const [id, n] of Object.entries(NODES)) {
  const exits = ['choices', 'branch', 'next', 'ending'].filter((k) => n[k]);
  if (exits.length !== 1) errors.push(`${id}: needs exactly one of choices/branch/next/ending (has ${exits.join(', ') || 'none'})`);
  if (n.wait && !n.next) errors.push(`${id}: a wait must be followed by next`);
  if (n.ending && !ENDINGS[n.ending]) errors.push(`${id}: unknown ending "${n.ending}"`);
  for (const t of targetsOf(n)) if (!NODES[t]) errors.push(`${id}: goes to missing node "${t}"`);
  if (n.branch && n.branch[n.branch.length - 1].if) errors.push(`${id}: last branch must have no condition (fallback)`);
  for (const c of n.choices || []) {
    if (c.label.length > 32) warnings.push(`${id}: choice over 32 characters: "${c.label}"`);
    if (/!/.test(c.label)) warnings.push(`${id}: choice uses an exclamation mark: "${c.label}"`);
  }
  if (n.choices && n.choices.length !== 2) warnings.push(`${id}: has ${n.choices.length} choices (guide says two)`);
  for (const l of n.lines || []) {
    const words = l.text.split(/\s+/).length;
    if (l.from === 'dyer' && words > 22) warnings.push(`${id}: Dyer line over 20 words (${words}): "${l.text.slice(0, 40)}..."`);
  }
  if (n.wait && n.wait.status.length > 34) warnings.push(`${id}: busy status over 34 characters`);
  for (const l of n.lines || []) {
    if (l.from === 'dyer' && !/[.?!…—"')]$/.test(l.text.trim())) warnings.push(`${id}: Dyer line ends with no punctuation (trail off with "..."): "${l.text}"`);
    if (l.from === 'dyer' && /\b(she|her|she's|she'll|old girl)\b/i.test(l.text)) errors.push(`${id}: the plane is "it", never "she": "${l.text}"`);
  }
}

// No real-time wait before the first one the user approved (end of chapter I)
{
  const early = new Set();
  const st = [START];
  while (st.length) {
    const id = st.pop();
    if (early.has(id) || FIRST_WAIT.includes(id) || !NODES[id]) continue;
    early.add(id);
    if (NODES[id].wait) errors.push(`${id}: has a timer before ${FIRST_WAIT.join(' / ')}`);
    st.push(...targetsOf(NODES[id]));
  }
}

// Reachability from START
const seen = new Set();
const stack = [START];
while (stack.length) {
  const id = stack.pop();
  if (seen.has(id) || !NODES[id]) continue;
  seen.add(id);
  stack.push(...targetsOf(NODES[id]));
}
for (const id of ids) if (!seen.has(id)) errors.push(`${id}: unreachable from ${START}`);

// Every node can reach an ending
const canEnd = new Set(ids.filter((id) => NODES[id].ending));
let grew = true;
while (grew) {
  grew = false;
  for (const id of ids) {
    if (canEnd.has(id)) continue;
    if (targetsOf(NODES[id]).some((t) => canEnd.has(t))) { canEnd.add(id); grew = true; }
  }
}
for (const id of ids) if (!canEnd.has(id)) errors.push(`${id}: no path to any ending`);

// Every ending is used
const used = new Set(ids.map((id) => NODES[id].ending).filter(Boolean));
for (const e of ENDING_ORDER) if (!used.has(e)) errors.push(`ending "${e}" is never reached by any node`);

const lineCount = ids.reduce((s, id) => s + (NODES[id].lines || []).length, 0);
const choiceCount = ids.reduce((s, id) => s + (NODES[id].choices ? 1 : 0), 0);
console.log(`${ids.length} nodes · ${lineCount} lines · ${choiceCount} decisions · ${used.size} endings`);
for (const w of warnings) console.log('warn  ' + w);
for (const e of errors) console.log('ERROR ' + e);
if (errors.length) { console.log(`\n${errors.length} error(s)`); process.exit(1); }
console.log('Story OK');
