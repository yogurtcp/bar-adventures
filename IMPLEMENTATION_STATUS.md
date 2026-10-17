# Race rebuild status

## Current scope

The current product has one scrolling route with 44 race, food, rocket and pancake café stages. The first rocket is stage 7, after three complete race/food pairs. The first café is stage 8. Other activities remain hidden. The historical race-only sections below document earlier work; the food update at the end describes the new baseline.

## Implemented

- Separate Bar/red, bunny/pink, fox/yellow and panda/blue transparent pixel car sprites with visible drivers.
- Four visible lanes, starting grid, finish line, actual car positions, animated overtaking, correct-answer acceleration and a shorter sputter/recovery effect.
- Cars do not advance while the child thinks. No answer countdown or speech.
- Eight addition tasks. Correct first attempts award 12 distance units. A missed task awards 4.5 on the initial mistake and 2 on supported completion. Animals move once per judged task at 10.25, 9.6 and 9 units; the fastest animal rotates between levels.
- Six first-try successes produces 85 distance units, ahead of the fastest animal’s 82. Five produces 79.5, behind that animal. A shared-speed finishing sprint makes the current leader cross first. The ending is selected from the same standings.
- Solved questions automatically advance after a 2.4-second reward. Incorrect answers remain available for retry after a 2.1-second reaction; no next button is used between questions. Reloading a solved task resumes at the next question.
- Bar’s head enlarges to 3.5 times its normal size during a reaction, anchored to his actual car, then shrinks away. It uses the existing transparent art with no new raster assets.
- Two additional Bar sprite expressions show a delighted forward lean during a boost and a puzzled look until a missed task is solved.
- Four generated finish illustrations: Bar’s victory and a kind ending for each animal winner.
- Two-, three-, and four-choice difficulty bands, all within the initial 0–10 cap. Early quantities stay within five.
- Wrong-answer rejection, retries, quantity support, additional joined groups after two mistakes, and input locking during movement.
- A separate unscored, speech-free hand/quantity demonstration on first visit, replayable from the hand icon.
- Picture/icon-only start, numbered 12-level winding route, independent best results, completion retention, next-level action, and replay.
- Versioned/validated saves. An unfinished question, rejected answer and race distances survive reload. Old race unlocks migrate without touching the other game records. Completed results cannot award duplicate unlocks.
- Layered acceleration whooshes, engine revs, sparkles, soft interface taps and short finish melodies use a shared compressor and immediate master mute.
- Nonverbal synthesized engine bursts, soft feedback, starting lights, finish melody, mute, volume and reduced motion. No runtime dependencies or external asset requests.
- Adult settings with arithmetic gate, focus containment and explicit reset confirmation.
- Local server now limits serving to the app, source modules, runtime assets and art review. Malformed file requests return errors without crashing it.

## Verification

- Model tests cover all 256 correct/missed answer histories at every level (3,072 races), confirming standings agree with the six-of-eight outcome and completion is idempotent.
- Generated 11,520 questions across all twelve levels and checked range, choice uniqueness, correct-answer presence, difficulty choice count and question variety.
- Save/retry tests check rejected choices, score retention, replay after an earlier win and malformed saves.
- Real Chrome touch-input flows completed a 6/8 win and a 5/8 loss. The first unlocked the next level and selected Bar’s victory art; the second retained the current level and selected the actual fox winner’s art. No browser runtime exceptions occurred.
- Verified cars remain in exactly the same position while waiting, move after an answer, and restore the exact question/rejection after reload. Repeated immediate answer activation did not award a second score.
- Reviewed landscape and portrait game/route layouts at 1280 × 800, 1024 × 768, 1180 × 820, 800 × 1280 and 768 × 1024. Four-answer layouts fit without page overflow or overlapping header controls. Endings and the silent example were also reviewed in Chrome.
- A final browser pass checked all three answer-grid bands at all five requested sizes (15 layouts), every winner illustration through the last-question flow, the protected parent settings, and the unscored example.
- Checked both new Bar reaction assets in the real answer/retry flow: puzzled on a mistake and until solved, delighted during the recovery boost, then idle again; all images loaded and no browser exceptions occurred.
- Screenshots and the captured browser reports are in `artifacts/review-v2/`.

## Automatic flow and feedback update — 2026-10-16

- Completed full 6/8 and 5/8 races in Chrome using answer taps only, with no next button. Incorrect answers kept the same task; correct answers advanced automatically after the reaction. Results and unlocks remained correct.
- Checked enlarged heads and the new answer layout at all five tablet sizes, with no page overflow or missing artwork. The head was measured at 2.25× during the held expression and disappeared before the next question.
- Verified a solved-task reload advances exactly once, leaving during a reward cancels its pending transition, and reduced motion keeps a readable static head emphasis and automatic progression.
- Probed the real browser audio output: boost audio produced a signal, muting reduced the output to zero, and muted effects created no new tones. No runtime exceptions occurred.
- Reports: `artifacts/review-v2/auto-advance-review.json` and `audio-resume-review.json`; head-zoom screenshots are alongside them. All model tests still pass.

## Limits

- Browser touch emulation was used; a physical tablet has not been tested.
- The cars move, bounce, boost and sputter as independent sprites. Drivers are not yet frame-by-frame facial/arm animation atlases.
- Arithmetic above ten and additional games are deliberately deferred.

## Stage progress update — 2026-10-16

- The home screen now directly shows the numbered stage map, with prominent green checkmarks for passed stages, padlocks for locked stages, and a gold-highlighted current stage marked by Bar’s car and a flag. Numbers remain visible in every state.
- A win retains the finish and victory illustration, then returns automatically to that home screen after 3.2 seconds. The next unlocked stage is selected. Explicit navigation or replay cancels the pending return.
- Expression emphasis increased to 3.5×; its horizontal placement is kept within the track, including near the starting line.

- Browser checks passed at all five tablet sizes for stage status symbols and 3.5× expression emphasis. A 6/8 win showed its victory illustration, automatically returned home, marked stage 1 passed, highlighted stage 2, and left stage 3 locked. Passed stages replayed and locked stages ignored taps. All-twelve-completed and early replay/cancel-return edge cases also passed with no browser runtime errors. Reports: `stage-status-review.json` and `stage-edge-review.json` in the review artifact directory.

## Temporary debug access — 2026-10-16

- `DEBUG_UNLOCK_ALL_LEVELS` in `src/config.js` is currently `true`: all twelve stage buttons can be used. Set it to `false` and refresh to restore normal locks.
- Debug progress uses its own `bar-race-v2-debug` save, initially copied from normal progress. The normal save remains untouched. Save validation permits selected/debug rounds up to stage twelve only when debug access is enabled.
- Seven model tests pass. A Chrome check verified all twelve stages are enabled, stage twelve starts and resumes its exact rejected answer after reload, and the normal saved progress remains byte-for-byte unchanged.

## Musical ending variations — 2026-10-16

- Added six win and six explicit loss variations using synthesized brass, bowed/plucked strings, bells, marimba, bass, kazoo and spring-like pitch bends. Each outcome has a separate shuffle bag, with all six played before repeats and no immediate repeat across bag boundaries.
- Losses now trigger the dedicated loss bank. All endings finish within two seconds, before the existing victory return. Parent settings includes preview buttons; starting another preview fades and stops the previous one. Mute and volume still use the shared master.
- Nine model/score tests pass. Rendered all twelve through Chrome’s OfflineAudioContext using the production synthesizer: every waveform is distinct, audible and unclipped. WAVs and metrics are saved in `artifacts/audio-review/`.

- Live Chrome checks confirmed six unique previews per bank, audible music on both actual win and loss results, immediate silence when muted, and no browser runtime exceptions. Metrics are in `artifacts/audio-review/live-report.json`.

## Per-answer sound correction — 2026-10-16

- Moved the six celebration and six mishap variations to individual answers: every accepted correct choice plays the win bank, and every accepted wrong choice plays the loss bank. Retries also receive their matching sound.
- The result illustration no longer draws from those banks; the finish-line engine cue remains. Wrong-answer reactions now last 2.1 seconds so even the longest musical clip finishes before retry is enabled. Parent preview buttons explicitly label correct and wrong answers.
- Verified actual question taps in Chrome: six distinct audible correct-answer clips and six distinct audible wrong-answer clips; correct answers auto-advanced, wrong choices kept the same task, and muting produced zero output and no new tones. No runtime exceptions. Report: `artifacts/audio-review/question-feedback-report.json`. All nine automated tests pass.

## Food activity and shared journey — 2026-10-16

- Added twelve subtraction meals between the twelve existing addition races. One scrolling snake route presents picture-coded car/egg stages, numbers, passed checkmarks, current flags and locks. The header and play dock remain fixed while the map scrolls by touch or mouse. Temporary debug access now covers all 24 stages.
- Added a single kitchen scene with offered food, an animated bite, funny bad snacks, a collected-food tray and an energy meter. Five generated, transparent pixel Bar poses show ready, chewing, disgusted, tired and flexing/happy states. Generation used the built-in imagegen tool; final assets and exact prompts are in `public/assets/food-v1/` and `art-source/FOOD_V1_PROMPTS.md`.
- Eight subtraction questions per meal, with sweet double bonuses on the third and seventh questions. Seven of ten possible food points passes. Correct answers add energy; wrong answers remove energy. Energy never drains while thinking. The longest reaction/audio clips finish before automatic progression.
- Food questions resolve after one attempt, briefly showing the correct answer after a mistake. Race retries, six-of-eight threshold, cars, sound variations and enlarged heads retain their existing behavior. Both activities have separate silent examples.
- Version 3 journey saves migrate old race records to odd stages and retain exact unfinished race tasks and results. Original race save keys are left untouched. Normal and debug journey saves remain separate.
- Thirteen automated tests pass. New tests cover 3,072 full food histories with save validation after every answer, double rewards, energy/outcome consistency, subtraction validity, race task preservation, race migration, malformed saves and debug access.
- Real Chrome touch checks passed on 1280×800, 1024×768, 1180×820, 800×1280 and 768×1024: scroll to stage 24, two/three/four answer choices, all loaded art, readable controls and no page overflow.
- Full answer-tap meal wins/losses verified both reaction sprites, audible positive/negative music, actual double rewards, strong/tired finales, automatic question changes, and return to the map after winning. Solved-question reload advanced exactly once, mute produced zero output, leaving canceled pending transitions, and the existing race still showed four moving cars and unlocked the inserted food stage. No runtime exceptions; the old normal race save remained unchanged.
- A separate isolated browser origin with debug disabled verified 23 initially locked stages, migration of earned race checks to odd stages without passing new food stages, and race → food → race unlocks. Production debug access remains enabled. Screenshots and reports: `artifacts/food-review/`.

## Public deployment and yucky feedback — 2026-10-16

- Made runtime asset and entry paths work under the GitHub Pages project subpath. Added a static build and a branch-based Pages deployment command; the authenticated account has repository permission but no workflow scope, so publishing does not require a workflow upload.
- Yucky items now fly toward Bar’s mouth just like the food rewards. Added three short, locally synthesized cartoon “eww” vocal gestures, timed to the approaching item, with automatic ducking of the musical loss cue. Mute and canceled navigation apply to the delayed cue too.
- Chrome verified the yucky item moves from the plate toward Bar’s face, the three vowel/formant variants produce distinct audible, unclipped output, mute suppresses the sound, and leaving the game cancels the delayed “eww.” No runtime errors. Report: `artifacts/food-review/eww-report.json`.

## Rocket missions and gradual introduction — 2026-10-16

- Inserted ten rocket missions into the shared scrolling route. Stages 1–6 remain the three original easy race/food pairs. Rocket mission 1 is stage 7, followed by another race/food pair before every later mission; the complete route has 34 stages. Debug unlocks remain enabled for review.
- Rocket difficulty starts independently at missing-number addition `□ + 1 = 2`, totals up to three, dot frames and two distinct choices. Missions 1–3 keep the blank on the left. Mission 4 introduces the other position; later addition grows gradually to ten. Subtraction starts only at rocket mission 8. Operands, results and solutions remain nonnegative and no larger than ten.
- Six earned cells move the actual ship through six visible checkpoints. Three mistakes sends it safely home. Missions end immediately at either boundary, using at most eight questions. No thinking-time penalty, narration, or between-question button. Filled answers appear in the missing operand, not at the result.
- Five generated pixel assets show Bar piloting, cheering and puzzled inside his rocket, a moon landing, and a gentle return to an alien mechanic. Cockpit expressions briefly enlarge above the actual moving ship. Added space engines, swooshes and landing/return cues alongside the existing six rotating answer scores per outcome.
- Version 4 saves migrate both v3 races and meals by activity/level, preserving completed checks, best scores and exact unfinished questions. A completed last old stage unlocks its newly inserted successor without requiring a replay. Old save keys remain untouched; debug and normal saves stay separate.
- Twenty tests pass, including all 2,560 rocket answer histories across ten difficulty levels, early outcomes, equation/choice validity, save restoration, invalid saves, first-six-stage scheduling, and legacy migration. Existing race and food tests still pass.
- Chrome checks passed for all three rocket choice bands and late-flight cockpit close-ups at 1280×800, 1024×768, 1180×820, 800×1280 and 768×1024. Full eight-question wins and immediate three-mistake losses verified audible feedback, corrected equations, endings, automatic progression and map returns. Normal-mode checks verified food stage 6 → easy rocket 7 → race 8 unlocks, and exact old race/food resume after migration. Screenshots and reports are in `artifacts/rocket-review/`.
- Static builds version the complete module/CSS directory together to prevent stale cached modules after a public update.

## Pancake café and shared animal reactions — 2026-10-16

- Added ten café stages after rocket missions, starting at stage 8. First six race/food stages and first rocket stage 7 are preserved. Total is 44 stages; temporary debug access still enables all stages.
- Five animal orders per café; four matching pairs wins. First café uses totals 3–4 and three plates; later cafés gradually reach ten with four plates. Any valid pair/order is accepted; tapping the first plate again undoes. The second plate submits automatically. Five different animals appear per round.
- Generated three transparent Bar chef poses and six three-frame animal sheets (bunny, fox, panda, kitten, puppy, penguin). All waiting, delighted and surprised frames were visually inspected. Native pancake stacks have exact counts. Correct stacks travel from Bar’s fitted plate to the customer; wrong orders show the actual sum then a worked valid pair. Wrong selections are not shown as correct; the demonstrated pair highlights with its equation. Bar reactions include a large face close-up and a pancake on his chef hat.
- Animal car buttons show reaction portraits; kitchen and rocket scenes include companions. Café customers, queue and finale animals are tappable. Shared expression/wiggle/voice reactions do not submit, save, change score/position, or reschedule questions. Three voice contours per species use the existing shared master mute/volume.
- Save version 5 migrates v4/v3 journey and v2 race records by activity/difficulty. Existing completions, best scores and exact unfinished work are preserved; new cafés are not marked complete. Original records remain untouched. Partial café selections survive reload.
- All 25 automated tests passed, including every café result history at all ten difficulties, every ordered plate pair across 200 seeded rounds, undo/reload, malformed selections and all v4 stage migrations. Existing race/food/rocket tests remain green.
- Chrome touch checks reviewed both the first and last café at 1280×800, 1024×768, 800×1280, 768×1024, 1024×640 and 1280×720 (12 layouts): no page overflow, all images loaded, every plate target at least 64px, and scene height at least 250px. Screenshots are in ignored `artifacts/cafe-review/`.
- Completed a full café win and full loss through actual touch input, verified delivery, equation correction, auto-advance, celebration with six animals, map return/completion, loss remaining for replay, clean replay, tutorial, refresh with a first plate selected, and navigation cancellation. The win check completed before a test-harness selector quoting error; the remaining checks were rerun separately and passed.
- Tested taps in race, food, rocket and café: visible reaction, automatic return to base mood, exact save record unchanged and no runtime exceptions. Offline browser audio rendering checked all 18 voices for distinct, nonzero, unclipped signals. A real animal tap produced output RMS 0.02248; mute reduced output RMS to zero while keeping the visual reaction.
- Normal-mode browser testing confirmed 43 stages initially locked, first rocket victory unlocking café stage 8 while stage 9 remains locked, and real v4 race/food/rocket migration resumes the right question without rewriting old records.
- Built static-site browser check passed under `/bar-adventures/` for map, food, rocket and café with content-versioned module imports and local assets. Physical tablet audio/touch remains untested.

## Map between stages and normal locks — 2026-10-17

- Result screens now offer a prominent adventure-map button and replay, with the direct start-next-stage shortcut removed. The map button opens the full home map and centers the selected stage. Winning still automatically returns to that map after the celebration.
- Disabled `DEBUG_UNLOCK_ALL_LEVELS`. New players can open stage 1; each win unlocks the next stage and passed stages remain replayable. Existing normal saves and migrations remain in use; debug saves stay separate and cannot unlock normal stages.
- All 25 tests and the static build passed. Chrome touch checks completed a win in race, food, rocket and café, verified the map/replay controls, automatic map return, manual map return, passed/current markers, exactly one new unlock, and disabled future-stage taps. A separate full-unlock debug record did not affect normal play. No browser runtime errors occurred. These checks used an isolated local origin and left existing player saves untouched.

## Installable tablet app and Bar icon — 2026-10-17

- Added a map-only install button showing Bar with a download badge. It invokes Chrome’s deferred native install prompt on a user tap, handles acceptance/dismissal, and hides after installation or in standalone mode. When no prompt is available, a native modal offers browser-specific home-screen instructions, including Share → Add to Home Screen on iPad/iPhone. The modal can close by button, Escape or tapping outside, and restores game focus/inert state.
- Added a relative-scope web manifest with stable ID/start URL and `display: standalone`, 192/512px PNG icons, Apple 180px icon and mobile metadata. A new opaque, generated smiling Bar portrait supplies all icon sizes and the browser favicon. Exact built-in imagegen prompt and provenance are in `art-source/APP_ICON_V1_PROMPT.md`; assets are in `public/assets/app-v1/`.
- Build now publishes the manifest and a release-fingerprinted service worker. The shell and map artwork are cached atomically; other same-app images/modules cache as used. Home launches check the network first, with cached-home fallback offline. Adult gallery navigations cannot overwrite the cached game. Workers wait for old app clients to close before activation and remove only obsolete caches for their own scope. Saves and earned locks are untouched.
- Local server now serves the manifest with the correct MIME type and exposes the worker at app scope. Production root/subpath URLs remain relative and content-versioned modules remain intact.
- All 29 tests passed, including four PWA tests for manifest/icon dimensions, offline fallback/update reads, scope/write isolation, gallery protection and scoped cache cleanup.
- Chrome reviewed the built app under `/bar-adventures/`: manifest parsed without errors, installability errors were empty, and a real `beforeinstallprompt` event fired. Native prompt acceptance/dismissal was tested with event-contract stubs to avoid installing an OS app during QA. Standalone media-query behavior was simulated; actual device installation was not performed.
- Six layouts passed (1280×800, 1024×768, 800×1280, 768×1024, 1024×640, 360×740), with visible touch targets and no horizontal page overflow. Modal screenshots are in ignored `artifacts/install-review/`.
- Actual browser checks verified an updated service worker remains waiting while the app is open, the cached map reopens with network disabled, iPad-specific instructions appear, modal Escape/focus restoration works, and all localStorage records remain unchanged. No runtime exceptions or 404s occurred. Physical tablet OS installation remains untested.
