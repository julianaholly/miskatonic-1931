// MISKATONIC 1931 · Act I
// Story data only. The engine in ../engine.js reads it. The chapters live in part1–3.js.
//
// Node fields
//   chapter     { n, title, narration }   shows a chapter card before the lines
//   checkpoint  true                      "Rewind to checkpoint" returns here
//   set         { var: delta | value }    numbers add, anything else assigns
//   lines       [ line ]                  d() Dyer · h() Dyer when the sound gets in · sys() the set
//                                         any line may carry { if: 'condition' }
//   wait        { minutes, status }       Dyer goes busy in real time (player taps STAND BY first)
//   choices     [ { label, goto, set?, if? } ]
//   branch      [ { if?, goto } ]          first match wins, no line shown
//   next        'node-id'
//   ending      'ending-id'
import { NODES as PART1 } from './part1.js';
import { NODES as PART2 } from './part2.js';
import { NODES as PART3 } from './part3.js';

export const NODES = { ...PART1, ...PART2, ...PART3 };

export const START = 'c1_start';
export const FIRST_WAIT = ['c1_09a', 'c1_13']; // the first timer is the tent search or, if skipped, the fuelling (checked by the validator)

export const INITIAL_VARS = {
  sanity: 8,      // 6+ composed · 4–5 strained · 1–3 fraying · 0 or less broken
  lamp: 2,        // charges left in Dyer's electric lamp
  paraffin: 1,    // stove fuel for the first night
  fuel: 2,        // aeroplane fuel; 0 by the end means coming down short of base
  danforth: 0,    // 0 well · 1 hurt · 2 fevered
  knowledge: 0,
  shelter: '',
  notebook: false, photos: false, map: false, // all three home → the hidden ending is possible
  fixed: false,   // fuel line repaired
  heard: false,   // listened in the dark and heard it coming
  sample: false, alone: false, saw: false, morphine: false, truth: false,
};

export const CHAPTERS = 9;

export const ENDINGS = {
  cold: {
    title: 'The long cold.',
    kind: 'death',
    status: 'SIGNAL LOST',
    epilogue: 'The relief party found the aeroplane in February, on its side under a skin of snow. They did not find the city. The wind had seen to that.',
  },
  fall: {
    title: 'The floor gives way.',
    kind: 'death',
    status: 'SIGNAL LOST',
    epilogue: 'The set fell with him, and kept transmitting for some time: wind, falling grit, and once, far below, the sound of water. Nobody has ever been able to say how deep the city goes.',
  },
  lost: {
    title: 'Lost in the dark.',
    kind: 'death',
    status: 'NO CARRIER',
    marker: 'NO CARRIER', // the line the log shows as the signal dies (default: CARRIER LOST)
    epilogue: 'The carrier held for nine minutes after his last word. Then there was only the hiss of the set, and the long silence of the plateau.',
  },
  taken: {
    title: 'Taken in the dark.',
    kind: 'death',
    status: 'SIGNAL LOST',
    epilogue: 'The last thing the set carried was not his voice. It was a piping, whistling sound, very far down, that went on for a long time after the carrier failed.',
    echo: 'tekeli-li',
  },
  short: {
    title: 'Short of the camp.',
    kind: 'death',
    status: 'SIGNAL LOST',
    epilogue: 'The aeroplane came down eighteen miles from base. A sledge party reached it at dawn. The cockpit was empty, and two lines of footprints led toward the camp. They stopped halfway.',
  },
  alone: {
    title: 'Alone over the range.',
    kind: 'grim',
    status: 'SIGNAL HOLDING',
    epilogue: 'Dyer landed at base on the evening of the twenty-fifth, alive and alone. He spoke of Danforth only once in the years after, and then only to say that he had not looked back.',
  },
  saw: {
    title: 'What Danforth saw.',
    kind: 'grim',
    status: 'SIGNAL HOLDING',
    epilogue: 'Both men landed at base alive on the twenty-fifth. Only one of them ever slept soundly again. Danforth spent the rest of his life in Arkham, whispering the same word to the walls.',
  },
  clear: {
    title: 'Clear of the range.',
    kind: 'survive',
    status: 'SIGNAL HOLDING',
    epilogue: 'They landed at base on the evening of the twenty-fifth. Both men walked off the plane alive. Dyer gave his report with the most important pages left out. Everything you heard tonight is what those pages said.',
  },
  second: {
    title: 'The second expedition.',
    kind: 'survive',
    status: 'SIGNAL HOLDING',
    epilogue: 'Both men came home alive. Dyer burned the plates on the shore of McMurdo Sound. Years later, when a new expedition to the range was announced, he published his account to stop it. This is that account.',
  },
};

export const ENDING_ORDER = ['cold', 'fall', 'lost', 'taken', 'short', 'alone', 'saw', 'clear', 'second'];
