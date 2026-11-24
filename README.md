# Miskatonic 1931

*Transmissions from the Mountains of Madness.* A real-time radio story for the browser, after H. P. Lovecraft.

You are the wireless operator at the Miskatonic expedition's base camp, Antarctica, 1931. Professor William Dyer's plane has gone down beyond the mountains. His messages are all you have. Keep him alive.

## Play it

Online: deployed on Netlify from this repository (see "Publishing" below).

Locally:

Because the game uses JavaScript modules, it has to be served, not opened by double-clicking. From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser. Progress is saved in that browser.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The six screens: title, transmission log, chapter card, ending, settings, endings list |
| `styles/app.css` | The Cracked Glass design system as CSS: colour tokens, logo, components, animations |
| `src/story/act1.js` | Act I: variables and the 9 endings; assembles the chapters |
| `src/story/part1.js`–`part3.js` | The story itself: 9 chapters, 160 nodes, 50 decisions. Writing goes here. |
| `src/engine.js` | Walks the story, saves after every message, runs real-time waits that survive a reload |
| `src/main.js` | Connects the engine to the screens |
| `src/store.js` | Saved game and settings |
| `src/sfx.js` | Radio blips and static, synthesised (no audio files) |
| `src/music.js` | Background music: plays `audio/ambient.mp3` on a loop if it exists |
| `tools/validate-story.mjs` | Checks every story path reaches an ending: `node tools/validate-story.mjs` |

## Writing story

Each node in `act1.js` has lines from Dyer (`d('...')`), the radio set (`sys('...')`) or Dyer when the sound gets in (`h('...')`), then one of: two `choices`, a real-time `wait`, a `branch` on the story's variables, a `next` node, or an `ending`. Run the validator after every change.

## Fast mode

Fast mode (in Settings) cuts every wait to 5 seconds. It is for testing and is planned to be removed for the final version: delete the "Fast mode" row in `index.html` and the `fast` default in `src/store.js`.

## Music

All tracks are CC0 (free to use, no credit required; credited in Settings anyway):
- `audio/main.mp3`: *Pondering the Cosmos* by Ruskerdax. The soundtrack, from the title screen on.
- `audio/hover.mp3`: plays once as the title screen opens, before the soundtrack fades in.
- `audio/pulse.mp3`: fades in over the soundtrack whenever a death is one or two steps away.
- `audio/victory.mp3`: sting at a survival ending.

The last three are from the *Dark Sci-Fi Audio Pack* by SRG774. `src/music.js` handles the crossfades. Music starts on the first tap (browsers block sound before that). Settings has a Music switch and volume.

## Publishing

Netlify builds the site with `node tools/build-site.mjs` (which wraps `index.html` in a full HTML page and copies everything into `dist/`) and runs the story validator; a broken story fails the deploy. Settings are in `netlify.toml`. Every push to `main` redeploys.
