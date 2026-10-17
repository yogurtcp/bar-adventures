# Bar’s Adventures

The game follows one scrolling route with **44 stages**: twelve addition races, twelve subtraction meals, ten missing-number rocket missions, and ten pancake cafés. The first six stages are race/food pairs; the first rocket is stage 7. The first café is stage 8; later rounds follow race → food → rocket → café. Other activities remain hidden.

**[Play Bar’s Adventures](https://yogurtcp.github.io/bar-adventures/)**

[Source code](https://github.com/yogurtcp/bar-adventures)

## Deploy

Push source changes to `main`, then run `npm run deploy` to test, build and publish the game to the `gh-pages` branch. GitHub Pages automatically publishes that branch. The deploy command uses Git and an authenticated GitHub CLI (`gh`), keeps the working checkout untouched, and needs no workflow token scope. `npm run build` produces the standalone static site in `dist/`; no backend or dependencies are required. Asset paths work at both the local root and the GitHub Pages repository subpath. Built code and styles share a content-versioned folder so tablets load a consistent set of modules after deployment. Player progress is local to each browser and site origin.

## Run locally

```sh
cd /home/yevgeny/Documents/work/bar-adventures
npm start
```

Open **http://localhost:4173**. No dependency installation is needed: runtime uses browser APIs and Node’s built-in HTTP server. For a tablet on the same Wi-Fi, use this computer’s LAN address with port 4173. The server binds to the local network; the public version is hosted separately on GitHub Pages.

## What Bar plays

- The start screen shows the scrolling, numbered 44-stage map, with Bar’s car for races, an egg for meals, his spaceship for rocket missions, and a pancake stack for cafés. Passed stages have green checkmarks, locked stages have padlocks, and the current stage has a gold highlight with an activity picture and a flag. Tap a stage to play it, or use the large play button to resume the selected stage. Passed stages remain replayable.
- Four independent transparent car sprites show Bar, bunny, fox, and panda driving. Their positions are actual saved race progress, animated across four lanes toward a visible finish line.
- Races use one addition problem at a time. Activity levels 1–3 stay within five and offer two answers; later levels stay within ten and offer three, then four answers.
- Correct first attempts give a substantial boost. A wrong answer lets the animals gain ground; a successful retry gives Bar a smaller recovery boost. The same question stays visible, rejected choices are disabled, and additional quantity help appears after mistakes.
- Thinking time never changes positions. A race has eight questions; six correct first attempts wins. The last answer triggers a visible sprint across the finish before the illustrated ending. Each possible animal winner has a matching ending. A win shows the victory picture briefly, then automatically returns to the start map with the next stage selected. Every game returns through the map between stages; the result screen also has a prominent map button, with no direct start-next-stage shortcut.
- Solved questions advance automatically after a 2.4-second reward; there is no between-question next button. Mistakes retain the question and allow retry after the reaction. Bar’s head briefly enlarges to 3.5× on his own car to emphasize each new expression.
- No speech or written instructions in the child flow. There are short nonverbal sounds, mute, a first-visit silent demonstration, and a replay-example hand icon.
- Progress saves locally, including the exact unfinished question and rejected choices. Existing race-level unlocks migrate from the previous version. Reset and volume/motion settings are inside the protected parent panel.

## Food stages

- A single kitchen scene shows full-body pixel Bar and the food offered for the current subtraction question. Correct answers send the food to Bar, who chews happily; wrong choices bring a frog, sock, shoe or snail and an exaggerated “eww” reaction. Yucky items fly toward his face too, with three rotating synthesized “eww” vocal sounds timed to their arrival.
- There are eight questions, with double-reward sweets on questions three and seven. The gold **×2** badge and a short chime announce them. Normal food earns one point; sweets earn two. Seven of ten possible food points passes the stage.
- Food questions have one attempt. After either reaction the next question appears automatically; wrong answers briefly reveal the correct result. Race retries retain their existing behavior.
- Bar starts with three energy units. Correct answers add their food reward and wrong answers remove one energy unit. Low energy shows slumped shoulders and a sad face; high energy shows a bigger, flexing, smiling Bar. Thinking time never drains energy. A tray shows every earned food point, including both bonus rewards.
- Five new generated character poses cover ready, eating, disgusted, tired and strong. No speech or child-facing words. Correct/wrong answers use the six existing sound variations per set.
- Food wins show a strong, happy finale and then return to the map. Losses show tired Bar with replay and map controls. Progress, unfinished questions and activity difficulty persist in the browser.
- Existing race and food progress migrates by activity and difficulty level when rocket missions are inserted. Completed stages, best results and unfinished questions are preserved; new rocket stages are not marked passed.

## Rocket missions

- The first rocket is **stage 7**, after three race/food pairs. Further rocket missions are stages 11, 15, 19, 23, 27, 31, 35, 39 and 43. Rocket difficulty is independent of the race and food difficulty.
- Mission 1 starts with `□ + 1 = 2`, only two answer choices, totals no larger than three, and a dot frame showing known and missing quantities. Missions 2–3 keep addition and a missing left operand, with totals up to four and five. Mission 4 introduces the missing right operand; missions 5–7 gradually increase addition range and choice count. Only missions 8–10 introduce subtraction. Every value and answer stays between zero and ten.
- Correct choices fill the actual missing operand, charge a power cell and visibly fly Bar’s rocket to the next of six checkpoints. Mistakes cause a funny engine hiccup and a puzzled cockpit close-up, then show the correct equation and advance. The rocket does not move while the child thinks.
- Six cells wins immediately; three mistakes ends the mission immediately. There are at most eight questions, with no extra questions after the outcome is settled. Answers auto-advance and no next button is used.
- Bar remains visible inside the generated ship. A large, cropped cockpit portrait briefly emphasizes his new expression. Space engine sounds accompany the existing rotating answer music, with shared mute and volume.
- A win shows Bar planting a moon flag with a tiny alien, then returns to the map. A loss shows a gentle return to Earth with an alien mechanic, with replay/map controls. A separate silent example demonstrates filling the missing box.
- Five new generated assets and exact prompts are in `public/assets/rocket-v1/` and `art-source/ROCKET_V1_PROMPTS.md`.

## Pancake café

- Cafés are stages **8, 12, 16, 20, 24, 28, 32, 36, 40 and 44**, after rocket missions. Bar wears a chef hat and apron, with ready, delighted/thumbs-up and surprised/pancake-on-hat poses. A large expression close-up appears during feedback.
- A customer orders a total, shown by both a picture and a number. Tap two distinct plates to combine their pancakes. Any pair making the order is accepted, in either order. Tap the first selected plate again to undo. Two separate plates of two can make four. The second plate automatically submits, with no Serve or Next button.
- Café 1 uses only totals of three or four and three choices, with countable pancakes and remaining outlines. Later cafés use four plates and gradually reach totals of ten. Each has five orders; four correct orders wins. There is no time limit.
- Correct stacks combine on Bar’s actual plate, travel to the customer, and disappear as the animal celebrates and munches. Wrong orders wobble, Bar gets a pancake on his hat, and the animal looks surprised. The actual sum appears first, followed by a correct worked pair, then the next order starts automatically.
- A win brings all six animals together and returns to the map. A loss offers replay and map controls. A silent first-visit example demonstrates choosing two plates. Partial selections survive refresh.
- Six customers—bunny, fox, panda, kitten, puppy and penguin—each have generated waiting, delighted and surprised poses. Five different customers appear per round. Animals throughout the café, race, kitchen and rocket games are tappable: they wiggle, change expression and make short species-specific cartoon sounds. Taps never change answers, scores, positions or progress. Voices have three variations per species, share mute/volume, and contain no narration.
- Built-in imagegen assets are saved in `public/assets/cafe-v1/`; exact prompts and provenance are in [`art-source/CAFE_V1_PROMPTS.md`](art-source/CAFE_V1_PROMPTS.md). Pancake stacks are rendered in code so their counts always match the math.
- Existing stage progress migrates by activity and difficulty, preserving completions, best scores and exact unfinished questions. Newly inserted cafés are not marked passed. Debug and normal records remain separate.

## Code map

- `src/pancake-model.js`, `src/pancake-view.js`, `src/pancake.css`: pair selection, countable stacks, café customers, serving, reactions and outcomes.
- `src/animal-view.js`, `src/animals.css`, `src/animal-sound.js`: shared tappable animal poses and locally synthesized voices.
- `src/app.js`: screens, shared input locking, automatic transitions, map scrolling and persistence.
- `src/journey-model.js`: activity schedule, v2/v3/v4 save migration, subtraction generation, food rewards, energy and completion.
- `src/rocket-model.js`, `src/rocket-view.js`, `src/rocket.css`: easy-to-hard missing-number questions, early mission outcomes, flight movement, cockpit reactions and endings.
- `src/food-view.js`, `src/food.css`: kitchen, food animation, Bar expressions and scrolling map.
- `public/assets/food-v1/`: five generated Bar sprites; prompts in `art-source/FOOD_V1_PROMPTS.md`.
- `src/race-sound.js`: layered nonverbal engine/whoosh, sparkle, tap and finish sounds with immediate master mute.
- `src/race-endings.js`: six win and six loss musical cartoons, synthesized brass/strings/bells/boings, and a shuffle bag that avoids repeats.
- `src/race-model.js`: addition generation, grading, race distances, result thresholds and save validation.
- `src/race-art.js`: icons and code-native pixel scenery.
- `src/style.css`: responsive layout, car movement and feedback animation.
- `public/assets/race-v2/`: four generated transparent drivers/cars, two matching Bar reaction variants, and four finish illustrations. All runtime art is local. The original photograph is not served or copied here.
- `art-source/RACE_V2_PROMPTS.md`: generation prompts and asset provenance.
- `artifacts/review-v2/`: browser screenshots and review reports.
- `artifacts/app-v1.js`, `style-v1.css`, `index-v1.html`: previous implementation backups, excluded from the served app.

Art review: **http://localhost:4173/art-gallery.html**. This adult review page has labels; the game does not.

## Checks

```sh
npm test
```

The 25 tests cover every eight-answer history for all twelve race and food levels, subtraction choices, double rewards, energy, save recovery, race migration, retries, debug access and retained progress. Rocket tests also cover every answer history at all ten difficulties, early stopping, migration, the six-stage prerequisite, all café answer histories, every plate pair, selection undo/reload, tampered café saves and v4 migration. See `IMPLEMENTATION_STATUS.md` for actual browser checks and remaining limitations.

## Temporary debug access

`DEBUG_UNLOCK_ALL_LEVELS` in `src/config.js` is disabled. New players start at stage 1; wins unlock the next stage, and passed stages remain replayable. Normal adventure progress uses `bar-journey-v5`. Previous debug records under `bar-journey-v5-debug` remain separate and do not unlock normal stages. Previous v4/v3 adventure and v2 race records are retained for migration and left untouched.

## Answer sounds

Every correct answer plays a celebration, and every wrong choice plays a funny mishap sound, including retries. Each set rotates through six variations before any repeats. Correct answers: trumpet parade, plucky string sprint, boing party, disco dash, tiny orchestra, magic confetti. Wrong answers: wobbly trombone, tiptoe strings, rubber wheels, kazoo pit stop, xylophone tumble, tiny dramatic violin. The reaction holds long enough for each clip to finish before the next answer. The finish-line engine cue remains separate; the musical sets play during questions. All are short, nonverbal and respect the shared mute/volume controls. Open Parent settings, pass the arithmetic check, and use the two preview buttons to hear the sets without playing a race.
