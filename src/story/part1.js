// Chapters I–III: Static · The Range · First Night
import { d, h, sys } from './helpers.js';

export const NODES = {
  // ─────────────────────────────── I · STATIC  (no real-time waits until c1_13)
  c1_start: {
    chapter: { n: 1, title: 'Static', narration: "It was Lake's silence that sent us out. I have tried, since, to wish that I had not been the one to answer it." },
    checkpoint: true,
    lines: [sys('CARRIER DETECTED · 7.4 MC'), d('Is this set working?'), d('Can anyone read me? Anyone at all?')],
    choices: [
      { label: 'Who is this?', goto: 'c1_who' },
      { label: 'I read you.', goto: 'c1_read' },
    ],
  },
  c1_who: {
    lines: [d('Thank God. Two hours on this key and nothing but static.'), d('Who is— forgive me. Yes. Of course you would ask that.')],
    next: 'c1_intro',
  },
  c1_read: {
    lines: [d('Thank God. Two hours on this key and nothing but static.')],
    choices: [
      { label: 'Who are you?', goto: 'c1_intro' },
      { label: 'What happened?', goto: 'c1_what' },
    ],
  },
  c1_what: {
    lines: [d('I hardly know where to begin.'), d('Forgive me. I should have begun with who I am.')],
    next: 'c1_intro',
  },
  c1_intro: {
    lines: [
      d('Dyer. William Dyer. Miskatonic University. Geology.'),
      d("You're the base camp operator? McMurdo Sound?"),
    ],
    choices: [
      { label: 'Yes. Where are you?', goto: 'c1_where' },
      { label: 'This is base. Go ahead.', goto: 'c1_where' },
    ],
  },
  c1_where: {
    lines: [
      d("Lake's advance camp. Four hundred miles south-west of you."),
      d('Lake stopped answering yesterday. Danforth and I flew out to see why.'),
      d("Danforth is one of my students. He's with me."),
    ],
    choices: [
      { label: 'What did you find?', goto: 'c1_find' },
      { label: 'Are you both safe?', goto: 'c1_safe' },
    ],
  },
  c1_safe: {
    lines: [
      d('For the moment. Cold, and shaken.'),
      d("I'll tell you what we found, but I want it on record. Are you logging this?"),
    ],
    choices: [
      { label: 'Every word.', goto: 'c1_find' },
      { label: 'Just tell me.', goto: 'c1_find' },
    ],
  },
  c1_find: {
    set: { sanity: -1 },
    lines: [
      d('The wind did a good deal of damage. That much we expected.'),
      d('The tents are down. The aeroplane shelter is torn open. From the inside.'),
      d('The dogs are dead. All of them.'),
    ],
    choices: [
      { label: 'What killed them?', goto: 'c1_dogs' },
      { label: 'And the men?', goto: 'c1_men' },
    ],
  },
  c1_dogs: {
    lines: [
      d("I'm not certain anything killed them, in the ordinary sense."),
      d('They are not as we left them. Someone has been careful with them.'),
      d('As one is careful in a laboratory.'),
    ],
    next: 'c1_06',
  },
  c1_men: {
    lines: [
      d("Eleven bodies. I've counted twice."),
      d("Gedney isn't among them. Neither is one of the dogs."),
    ],
    next: 'c1_06',
  },
  c1_06: {
    lines: [
      d("Lake's specimens are gone too. The ones from the cave."),
      d('He wired us about them last week. Fourteen of them. Barrel-shaped, eight feet long.'),
      d('He thought they were fossils.'),
    ],
    choices: [
      { label: 'What happened to them?', goto: 'c1_07a' },
      { label: "Where's Danforth?", goto: 'c1_07b' },
    ],
  },
  c1_07a: {
    lines: [
      d('Some are missing. Six are buried, in the snow past the drill.'),
      d('The graves are shaped like five-pointed stars. Very neat.'),
      d('Too neat, Danforth says.'),
    ],
    next: 'c1_08',
  },
  c1_07b: {
    lines: [
      d('By the drill. Looking at the graves.'),
      d('Six mounds in the snow, shaped like five-pointed stars.'),
      d("He hasn't moved for ten minutes."),
    ],
    next: 'c1_08',
  },
  c1_08: {
    lines: [
      d("Danforth wants to search Lake's tent for his notebook."),
      d('I want to get back in the air before the light goes.'),
      d('What do you say?'),
    ],
    choices: [
      { label: 'Search the tent.', goto: 'c1_09a' },
      { label: 'Get back to the plane.', goto: 'c1_09b' },
    ],
  },
  c1_09a: {
    lines: [d('Very well. Give me a few minutes. Stay on the frequency.')],
    wait: { minutes: 5, status: "Dyer is searching Lake's tent." },
    next: 'c1_09f',
  },
  c1_09f: {
    set: { knowledge: 1, notebook: true, sanity: -1 },
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("Found it. Lake's field book, frozen to his cot."),
      d('His last pages are sketches. A barrel shape, ridged, with wings folded like a fan.'),
      d('He writes that they were not fossils.'),
      d('He writes that one of them moved.'),
    ],
    next: 'c1_10',
  },
  c1_09b: {
    lines: [d("Agreed. I'll pull Danforth away from the graves."), d('He keeps asking who dug them.')],
    next: 'c1_10',
  },
  c1_10: {
    lines: [
      d('Base. One more thing.'),
      d('There are sledge tracks going west. Toward the range. Fresh ones.'),
      d('Someone took a sledge and a dog over the pass. It may be Gedney.'),
    ],
    choices: [
      { label: 'Follow them. He may be alive.', goto: 'c1_11a' },
      { label: "Don't fly over that range.", goto: 'c1_11b' },
    ],
  },
  c1_11a: {
    lines: [
      d("That's what I hoped you'd say."),
      d('Lake measured those peaks. Thirty thousand feet, some of them.'),
      d("We'll need every foot of ceiling the plane has."),
    ],
    next: 'c1_12',
  },
  c1_11b: {
    lines: [
      d('I hear you. I do.'),
      d("But if he's out there, he has a day of rations at most."),
      d("We'll look, and turn back at the first sign of trouble. You have my word."),
    ],
    next: 'c1_12',
  },
  c1_12: {
    lines: [d('Before we go. Is there anything I should take from the camp?'), d('We have room for one more crate.')],
    choices: [
      { label: 'Spare cells for the lamp.', goto: 'c1_13', set: { lamp: 1 } },
      { label: 'Extra paraffin.', goto: 'c1_13', set: { paraffin: 1 } },
    ],
  },
  c1_13: {
    lines: [
      d("Done. Danforth's lashing it down."),
      d("Fuelling now. It's slow work at forty below."),
      d("I'll call you when we're airborne."),
    ],
    wait: { minutes: 25, status: 'Dyer is fuelling the plane.' },
    next: 'c2_start',
  },

  // ─────────────────────────────── II · THE RANGE
  c2_start: {
    chapter: { n: 2, title: 'The Range', narration: 'I had seen mountains all my life. I had never before seen mountains that looked as though they had been built.' },
    checkpoint: true,
    lines: [
      sys('SIGNAL REACQUIRED'),
      d('Airborne. Twenty-one thousand feet and climbing.'),
      d("Danforth is navigating. He's very quiet."),
      d("The range is ahead. I've never seen anything like it."),
    ],
    choices: [
      { label: 'Describe it.', goto: 'c2_02a' },
      { label: "How's the engine?", goto: 'c2_02b' },
    ],
  },
  c2_02a: {
    set: { knowledge: 1 },
    lines: [
      d('Black rock, mostly bare. Snow only in the hollows.'),
      d('And on the summits... cubes. Square blocks, standing on the peaks.'),
      d("Danforth says it's frost. He says it twice."),
    ],
    next: 'c2_03',
  },
  c2_02b: {
    lines: [d("Coughing. The cold does that. It'll hold."), d('Danforth says there are shapes on the summits. Square ones.')],
    next: 'c2_03',
  },
  c2_03: {
    lines: [
      d("Climbing for the pass now. Twenty-three thousand."),
      d("The air is thin. Danforth's breathing through his scarf."),
      d('There is a mirage over the pass. A city in the air, upside down.'),
    ],
    choices: [
      { label: "It's only a mirage.", goto: 'c2_04a' },
      { label: 'What kind of city?', goto: 'c2_04b' },
    ],
  },
  c2_04a: {
    lines: [
      d('Yes. Of course it is. Refracted light.'),
      d("Only a mirage doesn't invent. It borrows. It's showing us something real."),
    ],
    next: 'c2_05',
  },
  c2_04b: {
    set: { sanity: -1, knowledge: 1 },
    lines: [
      d('Towers. Cones and terraces. Walls without windows.'),
      d('Bigger than anything in New York. Older than anything anywhere.'),
      d("Lake's specimens could have built a city like that. That's a mad thing to say."),
    ],
    next: 'c2_05',
  },
  c2_05: {
    lines: [
      d("We're through the pass."),
      d('Base. There is a city down there. Real stone. Miles of it, half under the ice.'),
    ],
    choices: [
      { label: 'Take photographs.', goto: 'c2_06a' },
      { label: 'Turn back now.', goto: 'c2_06b' },
    ],
  },
  c2_06a: {
    set: { photos: true },
    lines: [
      d("Danforth's on the camera. Twelve plates."),
      d("He's shaking so much I'm not sure they'll come out."),
    ],
    next: 'c2_07',
  },
  c2_06b: {
    lines: [
      d("I'd like to. Danforth won't hear of it."),
      d("He says we've come too far to fly home and wonder."),
    ],
    next: 'c2_07',
  },
  c2_07: {
    lines: [
      d('Wait.'),
      d("Downdraught. We're dropping. Hard."),
      d("I'll have to put it down on the plateau. Hold on."),
    ],
    wait: { minutes: 6, status: 'Dyer is landing the plane.' },
    next: 'c2_08',
  },
  c2_08: {
    set: { danforth: 1 },
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("We're down."),
      d("Danforth is hurt. His arm, I think. He's conscious."),
      d('The plane is on its side. The stove survived. The radio too, obviously.'),
    ],
    choices: [
      { label: 'Can you move him?', goto: 'c2_09a' },
      { label: 'Is the plane flyable?', goto: 'c2_09b' },
    ],
  },
  c2_09a: {
    lines: [d("Barely. He's grey. He keeps saying he's fine.")],
    next: 'c2_09x',
  },
  c2_09b: {
    lines: [
      d('Not as it lies. The undercarriage is bent, and something is wrong in the fuel line.'),
      d("That's tomorrow's problem."),
    ],
    next: 'c2_09x',
  },
  c2_09x: {
    lines: [
      d('The medical kit survived. One ampoule of morphine.'),
      d("Danforth is asking for it. He's trying very hard not to."),
    ],
    choices: [
      { label: 'Give it to him.', goto: 'c2_09g' },
      { label: 'Save it for later.', goto: 'c2_10', set: { morphine: true } },
    ],
  },
  c2_09g: {
    set: { danforth: -1 },
    lines: [d("Given. He's calmer. There's colour coming back to his face.")],
    next: 'c2_10',
  },
  c2_10: {
    lines: [
      d("The wind's coming up off the plateau. Night in three hours."),
      d("There are ruins on the ridge above us. Or there's the fuselage."),
      d('Fuselage or the ruins? Tell me fast.'),
    ],
    choices: [
      { label: 'Stay in the fuselage.', goto: 'c3_start', set: { shelter: 'plane' } },
      { label: 'Head for the ruins.', goto: 'c3_start', set: { shelter: 'ruins' } },
    ],
  },

  // ─────────────────────────────── III · FIRST NIGHT
  c3_start: {
    chapter: { n: 3, title: 'First Night', narration: 'That first night I learned how quiet a dead city can be. Then I learned that it was not dead.' },
    checkpoint: true,
    branch: [{ if: 'shelter == ruins', goto: 'c3_r1' }, { goto: 'c3_p1' }],
  },
  // the fuselage
  c3_p1: {
    lines: [
      d("Fuselage. I've wedged the door with a ration box."),
      d("Danforth's arm is splinted with a map board."),
      d('Enough paraffin for the whole night, thanks to you.', { if: 'paraffin >= 2' }),
      d('Enough paraffin for half the night. Or all of it, if I ration.', { if: 'paraffin < 2' }),
    ],
    branch: [{ if: 'paraffin >= 2', goto: 'c3_p4' }, { goto: 'c3_p2' }],
  },
  c3_p2: {
    lines: [d('Burn it now and keep him warm? Or ration it?')],
    choices: [
      { label: 'Burn it. Keep him warm.', goto: 'c3_p3a' },
      { label: 'Ration it.', goto: 'c3_p3b' },
    ],
  },
  c3_p3a: {
    set: { paraffin: -1 },
    lines: [d('Stove lit. The first warm air in two days.'), d("We'll be cold before dawn. But not yet.")],
    next: 'c3_p4',
  },
  c3_p3b: {
    set: { danforth: 1 },
    lines: [d('Rationed. Two hours on, two off.'), d("It's very cold, Base. Colder than I'd like for his arm.")],
    next: 'c3_p4',
  },
  c3_p4: {
    lines: [
      d("Danforth's asleep. I'll take the first watch."),
      d('Talk to me for a while, if you would. It helps.'),
    ],
    choices: [
      { label: 'Tell me about Lake.', goto: 'c3_p5a' },
      { label: 'Tell me about Arkham.', goto: 'c3_p5b' },
    ],
  },
  c3_p5a: {
    lines: [
      d('Lake was the best of us. Biologist. Impatient. Brilliant.'),
      d('He wanted to know what those things were more than he wanted to live.'),
      d('I think that is what killed him.'),
    ],
    next: 'c3_p6',
  },
  c3_p5b: {
    lines: [
      d('Elms. The river. The university library, with its locked rooms.'),
      d("Danforth reads in those rooms. Books he shouldn't."),
      d("He quotes them when he's frightened. He's been quoting them all day."),
    ],
    next: 'c3_p6',
  },
  c3_p6: {
    lines: [d("I'll try to rest. Stay close to the set.")],
    wait: { minutes: 40, status: 'Dyer is keeping watch.' },
    next: 'c3_night',
  },
  c3_night: {
    branch: [{ if: 'danforth >= 2', goto: 'c3_fever' }, { goto: 'c3_sound' }],
  },
  c3_fever: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("Base. The stove's out. I let it go too low."),
      d('Danforth is shaking badly. Fever.'),
      d('The ruins might hold heat better than this tin can. Or we wait for dawn. Three hours.'),
    ],
    choices: [
      { label: 'Carry him to the ruins.', goto: 'c3_carry' },
      { label: 'Stay put until dawn.', goto: 'c3_stay' },
    ],
  },
  c3_stay: {
    lines: [d('Very well. Three hours.'), d('Four matches left. Three, now.')],
    wait: { minutes: 30, status: 'Dyer is waiting for dawn.' },
    next: 'c3_cold',
  },
  c3_cold: {
    lines: [
      sys('SIGNAL WEAK'),
      d("base. can't feel my hands."),
      d('danforth stopped shaking an hour ago.'),
      d("that's good, isn't it. that he stopped."),
      d("i'll rest my eyes until the sun..."),
    ],
    ending: 'cold',
  },
  c3_carry: {
    set: { sanity: -1 },
    lines: [d('Right. Into the dark, then.')],
    wait: { minutes: 15, status: 'Dyer is carrying Danforth.' },
    next: 'c3_r2',
  },
  // the ruins
  c3_r1: {
    lines: [d('Into the ruins.'), d("Wind's at our backs. Danforth is walking, just about.")],
    wait: { minutes: 15, status: 'Dyer is crossing to the ruins.' },
    next: 'c3_r2',
  },
  c3_r2: {
    set: { sanity: -1, knowledge: 1 },
    lines: [
      sys('SIGNAL REACQUIRED'),
      d("We're inside. A chamber of black stone, out of the wind."),
      d('The walls are carved. Long bands of images, like a frieze.'),
      d("Barrel-shaped figures. Exactly like Lake's sketches.", { if: 'notebook' }),
      d('Barrel-shaped figures, ridged, with folded wings.', { if: '!notebook' }),
      d('The stone is warmer than it has any right to be.'),
    ],
    choices: [
      { label: 'Light the stove.', goto: 'c3_r3a' },
      { label: 'Look at the carvings.', goto: 'c3_r3b' },
    ],
  },
  c3_r3a: {
    lines: [d('Lit. Danforth is asleep already. Exhausted.'), d("I'll sit up a while.")],
    next: 'c3_r4',
  },
  c3_r3b: {
    set: { knowledge: 1, lamp: -1 },
    lines: [
      d('By lamplight, then. Only a minute.'),
      d('They run in rows, like pages. The figures build things. Fly. Swim.'),
      d('They are a history, Base. Someone wrote a history on these walls.'),
    ],
    next: 'c3_r4',
  },
  c3_r4: {
    lines: [d("I'll try to sleep. Stay close to the set.")],
    wait: { minutes: 40, status: 'Dyer is sleeping.' },
    next: 'c3_sound',
  },
  // the night sound
  c3_sound: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d('Base. Are you there?'),
      d('Something woke me. A sound outside.'),
      d('Piping. Musical. Very far off.'),
    ],
    choices: [
      { label: "It's the wind.", goto: 'c3_s1a' },
      { label: "Stay inside. Don't look.", goto: 'c3_s1b' },
    ],
  },
  c3_s1a: {
    lines: [d('Yes. The wind in the stone. That must be it.'), d("I don't believe that, and neither do you.")],
    next: 'c3_dawn',
  },
  c3_s1b: {
    set: { sanity: 1 },
    lines: [d("I won't. I've put my hands over my ears like a child."), d('It stopped. Ten minutes ago now.')],
    next: 'c3_dawn',
  },
  c3_dawn: {
    lines: [
      d('Morning. Or what passes for it. The sun never quite gets up, here.'),
      d('Base. There are tracks in the snow around us.'),
      d('Not ours. Not boots. Something dragged, in a wide loop. Then away, toward the city.'),
    ],
    choices: [
      { label: 'Follow them.', goto: 'c3_d1a' },
      { label: 'Leave them. Fix the plane.', goto: 'c3_d1b' },
    ],
  },
  c3_d1a: {
    set: { sanity: -1, knowledge: 1 },
    lines: [
      d('They lead to the edge of the city and stop at a wall.'),
      d('No door. Just a wall. The snow is smooth right up to the stone.'),
    ],
    next: 'c3_end',
  },
  c3_d1b: {
    lines: [d("Agreed. I don't want to know.")],
    next: 'c3_end',
  },
  c3_end: {
    lines: [
      d("I've looked at the plane. The fuel line is split and the tank weeps."),
      d('I can patch the line. It will take the better part of an hour.'),
      d('Danforth wants to follow the sledge tracks into the city while I work.'),
      d("I'd rather we stayed together."),
    ],
    choices: [
      { label: 'Fix the plane first.', goto: 'c3_fix' },
      { label: 'Follow the tracks together.', goto: 'c3_together' },
    ],
  },
  c3_fix: {
    set: { fixed: true },
    lines: [d('Right. Stand by. I need both hands.')],
    wait: { minutes: 35, status: 'Dyer is clearing the fuel line.' },
    next: 'c3_gone',
  },
  c3_gone: {
    lines: [
      sys('SIGNAL REACQUIRED'),
      d('Line is patched. Enough fuel to clear the range, perhaps.'),
      d("Base. Danforth isn't here."),
      d('His tracks go into the city. He went after the sledge alone.'),
      d("I'm going after him."),
    ],
    next: 'c4_start',
  },
  c3_together: {
    set: { fuel: -1 },
    lines: [
      d("Together, then. The plane will keep. It'll lose a little fuel, and I'll have to accept that."),
      d('The tracks lead between two towers, toward the centre.'),
    ],
    next: 'c4_start',
  },
};
