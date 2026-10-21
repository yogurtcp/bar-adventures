# Bar’s Adventures

**[Play Bar’s Adventures](https://yogurtcp.github.io/bar-adventures/)** · [Source code](https://github.com/yogurtcp/bar-adventures)

Seven picture-based games for Bar, with generated pixel art, expressive animal friends, playful sounds, tablet layouts, and no narration or thinking-time limit.

## Pick a game

Each game has **its own squiggly level path**. The first level of all seven games is open immediately. A win unlocks only the next level of that same game; other paths keep their own progress. Passed levels have checks, the current level has a gold flag, and later levels have padlocks. Scroll vertically between game cards and swipe horizontally along each path. Levels are numbered separately within each game.

The café starts with **waffles**. Its two picture buttons switch between pancakes and waffles without changing its questions or progress.

There are 74 levels: 12 races, 12 meals, and 10 each for rockets, café, fishing, balloons and ice cream. Existing stage IDs stay stable internally so older saved questions still resume exactly; the child sees the level number within the selected game.

Wins show a celebration and automatically return to the map with the next level of the same game selected. A prominent map button and replay are also available on results. There is no direct next-game shortcut or between-question next button.

## Games

| Game                  | What Bar does                                                                                                                                                            | Easy starting point                                                                                         | Pass rule                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Car race              | Drives a red car against visible bunny, fox and panda karts. Correct answers boost his actual position; mistakes let rivals gain ground.                                 | Addition within five, two choices; later totals up to ten and more choices.                                 | Six first-try answers from eight; mistakes allow a supported retry.                        |
| Feed Bar              | Receives healthy food or a silly yucky item, with chewing/eww reactions. Collected food makes him visibly stronger.                                                      | Subtraction within five; later within ten.                                                                  | Seven food points from ten possible. Sweets on questions 3 and 7 are double bonuses.       |
| Rocket trip           | Fills missing numbers, earns power cells and flies between real checkpoints.                                                                                             | `□ + 1 = 2`, two choices, totals up to three. Subtraction appears only in later rocket levels.              | Six cells before three mistakes, at most eight questions.                                  |
| Pancake / waffle café | Chooses two physical stacks to match an animal’s order; Bar serves the combined stack. Any valid pair in either order works. Tap the first selected plate again to undo. | Orders of three or four, three plates, countable food and remaining outlines.                               | Four correct orders from five. Wrong orders show the actual sum, then a valid worked pair. |
| Fishing               | Matches a requested numeral to a school of fish. Bar reels in that exact number; a wrong choice catches a funny boot.                                                    | Groups of 1–3 fish, two choices; later up to ten with four choices.                                         | Four successful catches from six. Every pictured fish is a separate sprite.                |
| Balloon adventure     | Chooses `>`, `<` or `=` between two numbers and visible groups of apples. Correct comparisons raise his balloon toward a cloud castle.                                   | Unequal numbers up to three, only greater/less choices. Equality starts at level 3; later values reach ten. | Four stars from six comparisons. Mistakes produce a puzzled face and a gentle puff.        |

| Ice cream shop | Copies an animal’s pictured cone by stacking flavors from bottom to top. Finished cones serve automatically; the curved arrow undoes an unfinished scoop. | Two one-scoop orders, then two scoops with two flavors; gradually reaches four scoops and four flavors. Distinct scoop patterns supplement colors. | Four matching orders from five. Mistakes show a matching cone and a funny ice-cream-on-hat reaction. |

Every game has an unscored, speech-free first-visit example, replayable through the hand icon. Feedback shows a large Bar expression. Animal taps trigger species-specific cartoon sounds and expressions without affecting answers, scores, positions, or progression. Shared mute, volume and reduced-motion controls apply throughout.

## Progress and settings

Normal progress saves under `bar-journey-v6`, including independent per-game unlocks, passed levels, best scores, exact unfinished questions and café plate selections. Version 5, 4 and 3 adventure records and version 2 race records migrate without rewriting the original records. Earned access is preserved; new games begin at level 1. Debug saves remain separate and are not used in normal play.

`DEBUG_UNLOCK_ALL_LEVELS` in `src/config.js` remains **false**. Opening each game’s first level is normal progression, not debug access. Parent settings are protected by an arithmetic check and contain sound volume, motion preference, tutorial reset and progress reset.

## Install on a tablet

Open the [public HTTPS game](https://yogurtcp.github.io/bar-adventures/) and tap **Bar’s portrait with the download arrow** at the top of the map. In Chrome, confirm **Install**, then launch Bar’s home-screen/app-list icon. The installed game uses a standalone window without browser tabs or the address bar; its install control is hidden.

If the native prompt is unavailable, the button opens platform-specific instructions. On iPad/iPhone, use **Share → Add to Home Screen → Add**, keeping **Open as Web App** enabled if offered. See the browser’s [PWA installation support](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).

The app shell and map artwork cache for offline launches; other artwork caches as used, so unseen artwork may still need a connection. App launches check for updates. A new worker waits for existing game windows/tabs to close rather than interrupting play. Cached files never change player saves or stage locks. Progress remains local to the browser/app environment.

## Run locally

```sh
npm start
```

Open **http://localhost:4173**. No dependency installation is required: runtime uses native browser APIs and Node’s built-in server. For browser play on a tablet on the same Wi-Fi, use the computer’s LAN address and port 4173. Install from the public HTTPS URL.

## Build and deploy

```sh
npm test
npm run build
npm run deploy
```

Push source to `main`, then run `npm run deploy` to test, build and publish the static site to `gh-pages`. The deploy script uses Git and an authenticated GitHub CLI, keeps the working checkout untouched and requires no workflow token scope. GitHub Pages publishes that branch.

The build creates `dist/`, fingerprints all source modules/styles together, emits the manifest and a versioned service worker, and supports both root and `/bar-adventures/` hosting. The shell precaches atomically, navigation checks the network first, and old workers/caches retire only within this app’s scope. No backend or external runtime assets are required.

## Code and artwork

- `src/journey-model.js`: activity catalog, independent unlocks, stable stage IDs, save validation/migration, food rewards and completion.
- `src/trails-view.js`, `src/trails.css`: seven picture-led squiggly paths, current/passed/locked states and café style selection.
- `src/icecream-model.js`, `src/icecream-view.js`, `src/icecream.css`: visual sequence matching, exact scoop stacks, undo, customer service, tutorials and celebrations.
- `src/explore-model.js`, `src/explore-view.js`, `src/explore.css`: fishing counts, balloon comparisons, animated progress, expressions, tutorials and endings.
- `src/pancake-model.js`, `src/pancake-view.js`, `src/pancake.css`: two-plate café selection, countable pancakes/waffles and customer reactions.
- `src/race-model.js`, `src/race-art.js`, `src/style.css`: race questions, actual car positions, pixel scenery and shared layouts.
- `src/food-view.js`, `src/food.css`, `src/rocket-model.js`, `src/rocket-view.js`, `src/rocket.css`: food and rocket scenes, questions and rewards.
- `src/animal-view.js`, `src/animals.css`, `src/animal-sound.js`, `src/race-sound.js`, `src/race-endings.js`, `src/food-sound.js`: cosmetic animal interactions, six correct/wrong music variations per set and short locally synthesized effects. No speech APIs.
- `src/app.js`: screens, input locking, automatic transitions, persistence, layout fitting and sound integration.
- `src/install.js`, `src/install.css`, `public/manifest.webmanifest`, `sw.js`: install experience, standalone mode and scoped caching.

Ice cream art: [`public/assets/icecream-v1/bar.png`](public/assets/icecream-v1/bar.png), three expressive Bar poses generated with built-in imagegen. Exact prompt/provenance: [`art-source/ICECREAM_V1_PROMPTS.md`](art-source/ICECREAM_V1_PROMPTS.md).

Fishing/balloon art: [`public/assets/explore-v1/`](public/assets/explore-v1/) with ready/happy/surprised fishing and balloon sprite sheets plus six fish designs. Exact built-in imagegen prompts and provenance: [`art-source/EXPLORE_V1_PROMPTS.md`](art-source/EXPLORE_V1_PROMPTS.md).

Earlier generated art remains in `public/assets/race-v2/`, `food-v1/`, `rocket-v1/`, `cafe-v1/` and `app-v1/`, with corresponding prompt files in `art-source/`. Native shapes render the exact counts of pancakes, waffles, apples and fish; generated illustrations never determine the math. The original family photograph is not served or copied into this repository.

Adult art review: **http://localhost:4173/art-gallery.html**. The game itself uses pictures, symbols and numbers.

## Verification

All 39 tests cover exhaustive race, food, rocket, café and new-game answer histories; independent path progression; initial access; idempotent completion; valid questions; tampered-save rejection; exact migrations; PWA metadata/icon dimensions and scoped offline/update behavior. Browser reviews cover real touch-input wins/losses, map return, per-game unlocks, animal taps, tutorials, waffle selection, resume, migration, tablet layouts and installation metadata. Details and physical-device limitations are in `IMPLEMENTATION_STATUS.md`. Screenshots/reports live in ignored `artifacts/`.
