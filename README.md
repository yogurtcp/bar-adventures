# Bar’s Adventures

The game now follows one scrolling route with **24 alternating stages**: twelve addition races and twelve subtraction meals. The other activities remain hidden.

**[Play Bar’s Adventures](https://yogurtcp.github.io/bar-adventures/)**

[Source code](https://github.com/yogurtcp/bar-adventures)

## Deploy

Push source changes to `main`, then run `npm run deploy` to test, build and publish the game to the `gh-pages` branch. GitHub Pages automatically publishes that branch. The deploy command uses Git and an authenticated GitHub CLI (`gh`), keeps the working checkout untouched, and needs no workflow token scope. `npm run build` produces the standalone static site in `dist/`; no backend or dependencies are required. Asset paths work at both the local root and the GitHub Pages repository subpath. Player progress is local to each browser and site origin.

## Run locally

```sh
cd /home/yevgeny/Documents/work/bar-adventures
npm start
```

Open **http://localhost:4173**. No dependency installation is needed: runtime uses browser APIs and Node’s built-in HTTP server. For a tablet on the same Wi-Fi, use this computer’s LAN address with port 4173. The server binds to the local network; the public version is hosted separately on GitHub Pages.

## What Bar plays

- The start screen shows the scrolling, numbered 24-stage map, alternating a Bar car picture for races and an egg picture for meals. Passed stages have green checkmarks, locked stages have padlocks, and the current stage has a gold highlight with Bar’s car and a flag. Tap a stage to play it, or use the large play button to resume the selected stage. Passed stages remain replayable.
- Four independent transparent car sprites show Bar, bunny, fox, and panda driving. Their positions are actual saved race progress, animated across four lanes toward a visible finish line.
- Races use one addition problem at a time. Activity levels 1–3 stay within five and offer two answers; later levels stay within ten and offer three, then four answers.
- Correct first attempts give a substantial boost. A wrong answer lets the animals gain ground; a successful retry gives Bar a smaller recovery boost. The same question stays visible, rejected choices are disabled, and additional quantity help appears after mistakes.
- Thinking time never changes positions. A round has eight questions; six correct first attempts wins. The last answer triggers a visible sprint across the finish before the illustrated ending. Each possible animal winner has a matching ending. A win shows the victory picture briefly, then automatically returns to the start map with the next stage selected.
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
- Existing race progress migrates to odd-numbered stages without marking the newly inserted food stages passed. For example, old race level 3 becomes stage 5.

## Code map

- `src/app.js`: screens, shared input locking, automatic transitions, map scrolling and persistence.
- `src/journey-model.js`: alternating stages, migration, subtraction generation, food rewards, energy and completion.
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

The 13 tests cover every eight-answer history for all twelve race and food levels, subtraction choices, double rewards, energy, save recovery, race migration, retries, debug access and retained progress. See `IMPLEMENTATION_STATUS.md` for actual browser checks and remaining limitations.

## Temporary debug access

All 24 stages are currently playable for review. `DEBUG_UNLOCK_ALL_LEVELS` in `src/config.js` is enabled. Set it to `false` and refresh to restore earned locks. Debug sessions save separately under `bar-journey-v3-debug`; normal adventure progress uses `bar-journey-v3`. Both previous race records are retained for migration and left untouched.

## Answer sounds

Every correct answer plays a celebration, and every wrong choice plays a funny mishap sound, including retries. Each set rotates through six variations before any repeats. Correct answers: trumpet parade, plucky string sprint, boing party, disco dash, tiny orchestra, magic confetti. Wrong answers: wobbly trombone, tiptoe strings, rubber wheels, kazoo pit stop, xylophone tumble, tiny dramatic violin. The reaction holds long enough for each clip to finish before the next answer. The finish-line engine cue remains separate; the musical sets play during questions. All are short, nonverbal and respect the shared mute/volume controls. Open Parent settings, pass the arithmetic check, and use the two preview buttons to hear the sets without playing a race.
