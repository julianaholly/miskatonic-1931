// Chapters VII–IX: The Thing in the Tunnel · Ascent · Homeward
import { d, h, sys } from './helpers.js';

export const NODES = {
  // ─────────────────────────────── VII · THE THING IN THE TUNNEL
  c7_start: {
    chapter: { n: 7, title: 'The Thing in the Tunnel', narration: 'I have tried to describe it for many years. It was vaster than any subway train. I shall try once more, and then I shall stop.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL WEAK'),
      d("We're moving. I can still hear it. It's closer.", { if: 'heard' }),
      d('Base. Something is coming up the tunnel.'),
    ],
    branch: [{ if: 'lamp <= 0', goto: 'c7_dark' }, { goto: 'c7_02' }],
  },
  c7_dark: {
    lines: [
      d("The lamp's dead. I can't see my own hands."),
      h('Only the green. Eyes opening in the dark, coming closer.'),
      h('Danforth is pulling at my sleeve. The sound is everywhere.'),
      h('it is not the wind. it was never the wind.'),
      h('tekeli-li...'),
    ],
    ending: 'taken',
  },
  c7_02: {
    set: { sanity: -1 },
    lines: [
      d("It's bigger than a subway train. It fills the tunnel. Wall to wall."),
      d('No shape. A mass of bubbles. Black. Heaving.'),
      d('It glows. Faintly. From inside itself.'),
      h('Eyes. Hundreds of them. Forming and unforming all over the front of it. Green, like sores of light.'),
      h("It's going over the penguins. It doesn't even slow."),
      h('Tekeli-li! Tekeli-li!'),
      h("It's faster than us."),
    ],
    choices: [
      { label: 'Run back the way you came.', goto: 'c7_03a' },
      { label: 'Take a side passage.', goto: 'c7_03b' },
    ],
  },
  c7_03a: {
    branch: [{ if: 'heard', goto: 'c7_04' }, { goto: 'c7_slow' }],
  },
  c7_slow: {
    lines: [
      d('The penguins are in the way. Dozens of them, frantic, piping.'),
      h("It's crushing them. Not slowing. The green eyes, all of them, on us."),
      h('Tekeli-li! Tekeli-li!'),
      h("it's so..."),
    ],
    ending: 'taken',
  },
  c7_03b: {
    branch: [{ if: 'map', goto: 'c7_04m' }, { goto: 'c7_lost' }],
  },
  c7_lost: {
    lines: [
      d('This passage forks. And forks again.'),
      d("I've lost the direction. The sound is behind us, and to the left."),
      d("We'll keep going. I'll call when..."),
    ],
    wait: { minutes: 9, status: 'No carrier. Dyer is silent.' },
    next: 'c7_lost2',
  },
  c7_lost2: {
    ending: 'lost',
  },
  c7_04m: {
    lines: [d('Left. Left again. Up the narrow ramp. Just as the map says.'), d('It went the other way.')],
    next: 'c7_04',
  },
  c7_04: {
    lines: [
      d("We're ahead of it. I can see the ramp. Daylight."),
      d('The floor shines behind it. Swept clean. That is why the tunnels are clean, Base.'),
      d("It's still coming. Slower now. It doesn't like the cold."),
    ],
    choices: [
      { label: "Don't look back.", goto: 'c7_05a' },
      { label: 'How far behind is it?', goto: 'c7_05b' },
    ],
  },
  c7_05a: {
    lines: [d('No. No looking back.')],
    next: 'c7_06',
  },
  c7_05b: {
    set: { sanity: -1 },
    lines: [d('Fifty yards. A wall of bubbles, glowing.'), h('Tekeli-li! Tekeli-li! It\'s mocking us, Base.')],
    next: 'c7_06',
  },
  c7_06: {
    branch: [{ if: 'danforth >= 2 && morphine', goto: 'c7_morph' }, { if: 'danforth >= 2', goto: 'c7_07' }, { goto: 'c8_start' }],
  },
  c7_morph: {
    lines: [
      d("Danforth can't keep up. The fever."),
      d('The morphine. I saved it. Thank God you made me save it.'),
      d('He can walk. For now. Up the ramp.'),
    ],
    wait: { minutes: 6, status: 'Dyer is climbing the ramp.' },
    next: 'c8_start',
  },
  c7_07: {
    lines: [
      d("Danforth can't keep up. The fever."),
      d('I can carry him and perhaps not make it. Or I can make it.'),
      d('Base. Tell me what to do.'),
    ],
    choices: [
      { label: 'Carry him.', goto: 'c7_08a' },
      { label: 'Leave him. Save yourself.', goto: 'c7_08b' },
    ],
  },
  c7_08a: {
    set: { sanity: -1 },
    lines: [d('Thank you. I was hoping you would say that.'), d('Up the ramp. One step. Another.')],
    wait: { minutes: 8, status: 'Dyer is carrying Danforth.' },
    next: 'c8_start',
  },
  c7_08b: {
    set: { sanity: -2, alone: true },
    lines: [d('I...'), d('Yes. Yes.'), h("He's calling my name, Base.")],
    wait: { minutes: 8, status: 'Dyer is climbing the ramp.' },
    next: 'c8_start',
  },

  // ─────────────────────────────── VIII · ASCENT
  c8_start: {
    chapter: { n: 8, title: 'Ascent', narration: 'We came up into the light like men surfacing from deep water.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("I'm out. I'm at the plane. Alone.", { if: 'alone' }),
      d("We're out. We're at the plane.", { if: '!alone' }),
    ],
    branch: [{ if: 'fixed', goto: 'c8_03' }, { goto: 'c8_02' }],
  },
  c8_02: {
    lines: [
      d('The fuel line. I never fixed the fuel line.'),
      d("I need a quarter of an hour. I don't know if I have a quarter of an hour."),
    ],
    choices: [
      { label: 'Fix it. Fast.', goto: 'c8_02a' },
      { label: 'Take off anyway.', goto: 'c8_02b' },
    ],
  },
  c8_02a: {
    set: { fixed: true },
    lines: [d('Stand by.')],
    wait: { minutes: 15, status: 'Dyer is clearing the fuel line.' },
    next: 'c8_03',
  },
  c8_02b: {
    lines: [
      d('Starting the engine.'),
      d("It's catching... no. It's dying."),
      h('Base, I can hear it coming up the ramp.'),
      h('tekeli-li. tekeli-li.'),
    ],
    ending: 'taken',
  },
  c8_03: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("Engine's turning. It'll fly."),
      d("The plateau is too rough for a long run. I'll need every advantage."),
    ],
    choices: [
      { label: 'Dump the extra weight.', goto: 'c8_04a' },
      { label: 'Keep everything.', goto: 'c8_04b' },
    ],
  },
  c8_04a: {
    lines: [
      d("The tent. The spare tins. Lake's instruments."),
      d('Not the plates. Never the plates.', { if: 'photos' }),
      d("Rolling. It's lifting. It's lifting."),
    ],
    next: 'c8_05',
  },
  c8_04b: {
    set: { fuel: -1 },
    lines: [d("Everything stays. It'll be a long run, and a thirsty one."), d('Rolling. Rolling. Up.')],
    next: 'c8_05',
  },
  c8_05: {
    lines: [d('Airborne. Climbing for the pass.'), d("The engine's running rough this high.")],
    choices: [
      { label: 'Lean the mixture. Save fuel.', goto: 'c8_05b' },
      { label: 'Full throttle. Get over.', goto: 'c8_05b', set: { fuel: -1 } },
    ],
  },
  c8_05b: {
    lines: [d('Over the pass. The plateau is falling away behind us.')],
    branch: [{ if: 'alone', goto: 'c8_alone' }, { goto: 'c8_06' }],
  },
  c8_alone: {
    lines: [d('There is an empty seat beside me.'), d('I keep thinking I hear him on the wind.')],
    next: 'c9_start',
  },
  c8_06: {
    lines: [d("Danforth is at the window. He's turning to look back at the peaks.")],
    choices: [
      { label: 'Tell him not to look.', goto: 'c8_07a' },
      { label: 'Let him look.', goto: 'c8_07b' },
    ],
  },
  c8_07a: {
    lines: [d("I've told him. He's put his face in his hands."), d('Thank you.')],
    next: 'c9_start',
  },
  c8_07b: {
    set: { saw: true, sanity: -1 },
    lines: [
      d('He looked.'),
      d("He's screaming, Base. At something beyond the peaks. Something taller than the mountains."),
      d("I can't make him stop."),
    ],
    next: 'c9_start',
  },

  // ─────────────────────────────── IX · HOMEWARD
  c9_start: {
    chapter: { n: 9, title: 'Homeward', narration: 'I remember the flight home only in pieces, the way one remembers a fever.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("I'm through the pass. The range is behind me.", { if: 'alone' }),
      d("We're through the pass. The range is behind us.", { if: '!alone' }),
      d("Danforth's gone quiet. He's whispering one word, over and over.", { if: 'saw' }),
      d('Four hundred miles to base.'),
      d('The tanks are low. Lower than I would like.', { if: 'fuel <= 1' }),
    ],
    choices: [
      { label: "How's the fuel?", goto: 'c9_02a' },
      { label: 'Talk to me. Stay awake.', goto: 'c9_02b' },
    ],
  },
  c9_02a: {
    lines: [
      d('Enough. Just.', { if: 'fuel >= 2' }),
      d('Not enough for mistakes.', { if: 'fuel < 2' }),
    ],
    next: 'c9_025',
  },
  c9_02b: {
    lines: [
      d("I'm awake. I don't think I'll sleep again for a long time."),
      d("Keep talking, Base. Your voice is the only thing that isn't that place."),
    ],
    next: 'c9_025',
  },
  c9_025: {
    lines: [
      d("Danforth wants to know what we'll tell them. At base. At home.", { if: '!alone' }),
      d("I keep rehearsing what I'll say about Danforth.", { if: 'alone' }),
    ],
    choices: [
      { label: 'The truth.', goto: 'c9_03', set: { truth: true } },
      { label: 'As little as you can.', goto: 'c9_03' },
    ],
  },
  c9_03: {
    lines: [
      d('The tin. Lake\'s tin. It\'s empty, Base. The lid is still on.', { if: 'sample' }),
      d("Long flight now. I'll call when there's something to see."),
    ],
    wait: { minutes: 45, status: 'Dyer is flying home.' },
    next: 'c9_04',
  },
  c9_04: {
    lines: [
      sys('SIGNAL WEAK'),
      d("Base. There's weather ahead. A wall of it. White."),
      d('I can climb over it, or go round to the east.'),
      d("Over burns fuel. Round costs time, and the light's going."),
    ],
    choices: [
      { label: 'Climb over it.', goto: 'c9_05a' },
      { label: 'Go round it.', goto: 'c9_05b' },
    ],
  },
  c9_05a: {
    set: { fuel: -1 },
    lines: [d("Climbing. The engine's labouring."), d("We're over. Stars above, cloud below.")],
    next: 'c9_06',
  },
  c9_05b: {
    lines: [d('Round, then.'), d("It's getting dark. I'm flying by the compass now.")],
    wait: { minutes: 20, status: 'Dyer is flying round the storm.' },
    next: 'c9_06',
  },
  c9_06: {
    branch: [{ if: 'fuel <= 0', goto: 'c9_short' }, { goto: 'c9_07' }],
  },
  c9_short: {
    lines: [
      sys('SIGNAL WEAK'),
      d("The engine's coughing."),
      d("Base, we're out. The gauge is on the stop."),
      d("I can see your smoke. I can see the camp. It's twenty miles off."),
      d("Putting it down on the ice. We'll walk."),
    ],
    ending: 'short',
  },
  c9_07: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d('Base. I can see it.'),
      d('Smoke. Your smoke. The huts, on the edge of the sound.'),
      d('Is that you on the ice? Waving?'),
    ],
    choices: [
      { label: "That's us. Come home.", goto: 'c9_08' },
      { label: 'We see you. Bring it in.', goto: 'c9_08' },
    ],
  },
  c9_08: {
    lines: [d('Coming in. Flaps down.'), d('Hold on.')],
    wait: { minutes: 5, status: 'Dyer is landing.' },
    next: 'c9_09',
  },
  c9_09: {
    lines: [sys('SIGNAL REACQUIRED'), d("We're down.")],
    branch: [
      { if: 'alone', goto: 'c9_end_alone' },
      { if: 'saw', goto: 'c9_end_saw' },
      { if: 'notebook && map && photos', goto: 'c9_10' },
      { goto: 'c9_end_clear' },
    ],
  },
  c9_end_alone: {
    lines: [
      d("I'm on the ice. I'm walking toward the huts."),
      d("There's only me, Base. There will only ever be me."),
    ],
    ending: 'alone',
  },
  c9_end_saw: {
    lines: [
      d('Both of us. Danforth is walking.'),
      d("He won't take his eyes off the south."),
    ],
    ending: 'saw',
  },
  c9_end_clear: {
    lines: [
      d('Both of us. Alive.'),
      d("Danforth is climbing out. He's laughing, or crying. Both."),
      d("We'll tell them the truth. Or as much of it as they can stand.", { if: 'truth' }),
      d("Put the kettle on, Base. We're coming in."),
    ],
    ending: 'clear',
  },
  c9_10: {
    lines: [
      d('Both of us. Alive.'),
      d("Base, I have Lake's notebook. The map. Twelve plates."),
      d('They will want to go back. The university. Others. Next season.'),
    ],
    choices: [
      { label: 'Show them everything.', goto: 'c9_11a' },
      { label: 'Burn it all.', goto: 'c9_11b' },
    ],
  },
  c9_11a: {
    lines: [d('Very well. Let them see what we saw.'), d("Put the kettle on, Base. We're coming in.")],
    ending: 'clear',
  },
  c9_11b: {
    lines: [
      d('Yes. They would only go back to look.'),
      d("I'll keep the notebook. If anyone tries to go, I'll tell them everything."),
      d('Every word of it true. And no one will believe me.'),
    ],
    ending: 'second',
  },
};
