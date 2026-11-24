// Chapters IV–VI: The City · The Archive · Below
import { d, h, sys } from './helpers.js';

export const NODES = {
  // ─────────────────────────────── IV · THE CITY
  c4_start: {
    chapter: { n: 4, title: 'The City', narration: 'We should never have gone down among those stones. I set this down only so that no one else will follow the trail we left across the plateau.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("Found Danforth. He was standing in front of a wall, not moving. He's all right.", { if: 'fixed' }),
      d('The city goes on for miles. Every surface is carved.'),
      d('The streets are not streets. They are ramps. Nothing here was built for feet.'),
    ],
    choices: [
      { label: 'What were they built for?', goto: 'c4_02a' },
      { label: 'Stay on the sledge tracks.', goto: 'c4_02b' },
    ],
  },
  c4_02a: {
    lines: [d('Whatever the specimens were. Things that glided, or slid.'), d('There are no stairs anywhere. Not one.')],
    next: 'c4_02x',
  },
  c4_02b: {
    lines: [d('We are. They lead toward the middle. Downhill. Always downhill.')],
    next: 'c4_02x',
  },
  c4_02x: {
    lines: [
      d("Danforth keeps stopping. He's touching the carvings. Reading them with his fingertips."),
      d('He says he can almost hear them.'),
    ],
    choices: [
      { label: 'Tell him to stop.', goto: 'c4_03' },
      { label: 'Let him read.', goto: 'c4_02y' },
    ],
  },
  c4_02y: {
    set: { knowledge: 1, sanity: -1 },
    lines: [d("He's smiling. I wish he wouldn't."), d('He says they were lonely, at the end.')],
    next: 'c4_03',
  },
  c4_03: {
    lines: [
      d("We're in a great hall. Five-sided, like everything here."),
      d('The carvings tell a story, Base. A history. I think I could read it, given time.'),
    ],
    choices: [
      { label: 'Read the carvings.', goto: 'c4_04a' },
      { label: 'Keep moving. Find Gedney.', goto: 'c4_04b' },
    ],
  },
  c4_04a: {
    set: { lamp: -1, knowledge: 1, sanity: -1 },
    lines: [d("Very well. I'll copy what I can by lamplight.")],
    wait: { minutes: 20, status: 'Dyer is copying the carvings.' },
    next: 'c4_05',
  },
  c4_05: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d('They came from the stars, Base. The barrel-things.'),
      d('They built this city before there was life on land.'),
      d('They made servants. Great shapeless things that took any form they were told to.'),
      d('And the servants learned.'),
    ],
    next: 'c4_06',
  },
  c4_04b: {
    lines: [d('Agreed. The carvings will outlast us.')],
    next: 'c4_06',
  },
  c4_06: {
    set: { sanity: -1 },
    lines: [
      d("Base. We've found the sledge."),
      d('Gedney is on it. Wrapped in canvas, with the missing dog.'),
      d('Packed. Labelled, almost. As if someone meant to study them later.'),
    ],
    choices: [
      { label: 'Come away from it.', goto: 'c4_07a' },
      { label: 'Is there anything else?', goto: 'c4_07b' },
    ],
  },
  c4_07a: {
    lines: [d("Yes. You're right.")],
    next: 'c4_08',
  },
  c4_07b: {
    set: { knowledge: 1 },
    lines: [
      d("Lake's instruments. A tent pole. Matches. A few books."),
      d('Things that interested someone. Someone who had never seen them before.'),
    ],
    next: 'c4_08',
  },
  c4_08: {
    lines: [
      d('Danforth wants to bury Gedney. Here, under the stones.'),
      d('It would take time we may not have.'),
    ],
    choices: [
      { label: 'Bury him.', goto: 'c4_09a' },
      { label: 'Leave him. Keep moving.', goto: 'c4_09b' },
    ],
  },
  c4_09a: {
    set: { sanity: 1 },
    lines: [
      d('Thank you. It matters to Danforth. It matters to me.'),
      d("We've no shovel. We'll cover him with what we can."),
    ],
    wait: { minutes: 15, status: 'Dyer is burying Gedney.' },
    next: 'c4_10',
  },
  c4_09b: {
    set: { sanity: -1 },
    lines: [d('Yes. The living first.'), d("Danforth won't look at me.")],
    next: 'c4_10',
  },
  c4_10: {
    lines: [
      d('There is a ramp at the far end of the hall, going down.'),
      d('Cold air comes up it. And something else. A smell, like petrol.'),
    ],
    choices: [
      { label: 'Go down. Carefully.', goto: 'c5_start' },
      { label: 'Go back to the plane.', goto: 'c4_11' },
    ],
  },
  c4_11: {
    lines: [
      d("I tried, Base. He won't."),
      d("He says if we don't see it, we'll spend our lives imagining it."),
      d("We're going down."),
    ],
    next: 'c5_start',
  },

  // ─────────────────────────────── V · THE ARCHIVE
  c5_start: {
    chapter: { n: 5, title: 'The Archive', narration: 'The deeper we went, the newer the carvings grew. And the newer they grew, the worse.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL WEAK'),
      d("We've gone deeper. The halls here are lower, and older."),
      d('Base, the carvings change as we go down. They get later. Cruder.'),
      d('As if the artists had forgotten how.'),
    ],
    choices: [
      { label: 'What do they show?', goto: 'c5_02a' },
      { label: "How's the lamp?", goto: 'c5_02b' },
    ],
  },
  c5_02a: {
    set: { knowledge: 1, sanity: -1 },
    lines: [
      d('The servants. Rising up. Pouring over the builders like a tide.'),
      d('Then the builders, fewer and fewer, retreating underground. To a sea.'),
    ],
    next: 'c5_03',
  },
  c5_02b: {
    lines: [
      d('Strong enough. For now.', { if: 'lamp >= 2' }),
      d("Dimming. I'm walking by touch where I can.", { if: 'lamp < 2' }),
    ],
    next: 'c5_03',
  },
  c5_03: {
    lines: [
      d('There is a crack across the floor ahead. As wide as a man is tall.'),
      d("We can jump it. Or there's a gallery round the side. Longer. Darker."),
    ],
    choices: [
      { label: 'Jump it.', goto: 'c5_04a' },
      { label: 'Take the gallery.', goto: 'c5_04b' },
    ],
  },
  c5_04a: {
    branch: [{ if: 'danforth >= 2', goto: 'c5_fall' }, { goto: 'c5_jump' }],
  },
  c5_jump: {
    lines: [
      d('Danforth first. Good.'),
      d('Now me.'),
      d("Made it. The floor groaned under us. I don't want to do that again."),
    ],
    next: 'c5_05',
  },
  c5_fall: {
    lines: [
      d("Danforth can't jump. Not with the arm. Not with the fever."),
      d("I'll go first and catch him. I'll—"),
      d('The edge is going. Base, the edge is...'),
    ],
    ending: 'fall',
  },
  c5_04b: {
    branch: [{ if: 'lamp <= 0', goto: 'c5_gdark' }, { goto: 'c5_gal' }],
  },
  c5_gal: {
    lines: [
      d('The gallery runs along the edge of the crack. Slow going.'),
      d('Base, some of the carvings here are fresh. The chisel marks are clean.'),
    ],
    wait: { minutes: 10, status: 'Dyer is crossing the gallery.' },
    next: 'c5_05',
  },
  c5_gdark: {
    lines: [
      d("No light at all. I'm feeling along the wall."),
      d('The wall ends.'),
      d('The floor—'),
    ],
    ending: 'fall',
  },
  c5_05: {
    lines: [
      sys('SIGNAL WEAK'),
      d("There's a map here, Base. Carved into the floor."),
      d('The whole city. And tunnels, running down to the buried sea.'),
      d('I could copy it. Twenty minutes, by lamplight.'),
    ],
    choices: [
      { label: 'Copy it.', goto: 'c5_06a' },
      { label: 'No time. Move.', goto: 'c5_06b' },
    ],
  },
  c5_06a: {
    set: { map: true, lamp: -1 },
    lines: [d('Copying. Talk to me if you hear me stop.')],
    wait: { minutes: 20, status: 'Dyer is copying the map.' },
    next: 'c5_07',
  },
  c5_07: {
    lines: [
      sys('SIGNAL WEAK'),
      d("Copied. Every tunnel. I've marked a way out that doesn't use the main ramp."),
    ],
    next: 'c5_07x',
  },
  c5_06b: {
    lines: [d('Moving.')],
    next: 'c5_07x',
  },
  c5_07x: {
    lines: [
      d("There's a doorway here, sealed with a slab."),
      d('Something has scratched at it. From the other side.'),
    ],
    choices: [
      { label: 'Leave it sealed.', goto: 'c5_08' },
      { label: 'Look through the crack.', goto: 'c5_07y' },
    ],
  },
  c5_07y: {
    set: { sanity: -1, knowledge: 1 },
    lines: [
      d('Nothing. Dark.'),
      d('Then the dark moved back from the crack.'),
      h('As if it had been looking out.'),
    ],
    next: 'c5_08',
  },
  c5_08: {
    lines: [
      d('Base. Penguins.'),
      d("Huge. Albino. Taller than any king penguin I've ever seen."),
      d('No eyes. Not blind. Eyeless. Generations down here in the dark.'),
      d("They waddle right past us. No fear of us at all. They're fleeing something else."),
    ],
    choices: [
      { label: 'Go back to the plane.', goto: 'c5_09a' },
      { label: 'See where they came from.', goto: 'c5_09b' },
    ],
  },
  c5_09a: {
    lines: [
      d('I said so. Danforth laughed. Not his laugh.'),
      d("He's already walking into the tunnel. I can't leave him."),
    ],
    next: 'c6_start',
  },
  c5_09b: {
    lines: [d('Danforth was already walking.'), d("We're going down.")],
    next: 'c6_start',
  },

  // ─────────────────────────────── VI · BELOW
  c6_start: {
    chapter: { n: 6, title: 'Below', narration: 'Below the city the air grew warmer. I remember thinking that warmth, in that place, was the worst thing of all.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL WEAK'),
      d("We're in a tunnel, sloping down. Warmer here. Much warmer."),
      d('The petrol smell is stronger.'),
      d('And there are marks on the floor. Drag marks, as wide as a cart.'),
    ],
    choices: [
      { label: 'Switch off the lamp. Listen.', goto: 'c6_02a' },
      { label: 'Keep the lamp on. Keep moving.', goto: 'c6_02b' },
    ],
  },
  c6_02a: {
    set: { heard: true },
    lines: [d('Lamp off.')],
    wait: { minutes: 4, status: 'Dyer is listening in the dark.' },
    next: 'c6_03',
  },
  c6_03: {
    set: { sanity: -1 },
    lines: [
      sys('SIGNAL WEAK'),
      h("There's a sound. Very far down."),
      h('Piping. Like a flute played under water.'),
      h("Tekeli-li. That's what it says. Tekeli-li."),
    ],
    next: 'c6_03x',
  },
  c6_02b: {
    set: { lamp: -1 },
    lines: [d("Moving. The lamp's beginning to dim.")],
    next: 'c6_03x',
  },
  c6_03x: {
    lines: [
      d("One of the penguins is following us. Bumping at Danforth's legs."),
      d('Eyeless. White as paper. It makes a muffled piping and wants the warmth of us.'),
    ],
    choices: [
      { label: 'Let it follow.', goto: 'c6_04' },
      { label: 'Drive it off.', goto: 'c6_03y' },
    ],
  },
  c6_03y: {
    set: { sanity: -1 },
    lines: [d('Gone. Squawking back down the tunnel.'), h('Something down there answered it. Not a bird.')],
    next: 'c6_04',
  },
  c6_04: {
    set: { sanity: -1 },
    lines: [
      d("We've found the barrel-things. The ones from Lake's cave."),
      d('Four of them. Their heads are gone. Not cut. Pulled.'),
      d('And there is slime on everything. Black. Glistening. There are bubbles in it.'),
    ],
    choices: [
      { label: 'Get out. Now.', goto: 'c7_start' },
      { label: 'Look closer.', goto: 'c6_05' },
    ],
  },
  c6_05: {
    set: { knowledge: 1, sanity: -1 },
    lines: [
      d("It's moving, Base."),
      d('The bubbles open and close. Very slowly, it slides back down the tunnel. Toward the dark.'),
      h("As if it's going home."),
    ],
    choices: [
      { label: 'Take a sample.', goto: 'c6_06a' },
      { label: "Don't touch it.", goto: 'c7_start' },
    ],
  },
  c6_06a: {
    set: { sample: true, sanity: -1 },
    lines: [d("In a specimen tin. Lake's tin."), d("It's warm through the metal.")],
    next: 'c7_start',
  },
};
