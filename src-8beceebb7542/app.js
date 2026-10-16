import {
  pancakeScene,
  pancakeQuestion,
  pancakeTutorial,
  pancakeResult,
  pancakeStack,
  CAFE_ASSET,
} from "./pancake-view.js";
import { animalSprite, bindAnimalTaps } from "./animal-view.js";
import {
  DRIVERS,
  WIN_SCORE,
  positions,
  standings,
  score,
} from "./race-model.js";
import {
  SAVE_KEY,
  STAGE_COUNT,
  freshSave,
  normalizeSave,
  migrateRaceSave,
  migrateJourneySave,
  newRound,
  submit,
  completeRound,
  stageInfo,
  wonRound,
  mealFor,
} from "./journey-model.js";
import { foodScene, foodResult, FOOD_ASSET, objectImage } from "./food-view.js";
import {
  rocketScene,
  rocketQuestion,
  rocketTutorial,
  rocketResult,
  rocketPoint,
  ROCKET_ASSET,
} from "./rocket-view.js";
import { ASSET, icon, scenery, checkers } from "./race-art.js";
import { playSound, updateSoundOptions } from "./race-sound.js";
import { DEBUG_UNLOCK_ALL_LEVELS } from "./config.js";

const root = document.getElementById("app");
const activeSaveKey = DEBUG_UNLOCK_ALL_LEVELS ? `${SAVE_KEY}-debug` : SAVE_KEY;
const normalizeForMode = (raw) =>
  normalizeSave(raw, { unlockAllLevels: DEBUG_UNLOCK_ALL_LEVELS });
let save = readSave();
let view = "home";
let phase = "idle";
let feedback = "";
let countdown = 3;
let demo = false;
let demoStep = 0;
const REACTION_MS = { correct: 2400, wrong: 2100 };
const WIN_RETURN_MS = 3200;
let questionEntry = false;
let timers = [];
let locked = false;
let storageAvailable = true;
let mapScroll = null;
let disposeAnimalTaps = () => {};
const isPancake = () => save.round?.kind === "pancake";
const isFood = () => save.round?.kind === "food";
const isRocket = () => save.round?.kind === "rocket";
const roundStage = () => save.round?.stage || save.selected;
function readSave() {
  try {
    const raw =
      localStorage.getItem(activeSaveKey) ||
      (DEBUG_UNLOCK_ALL_LEVELS ? localStorage.getItem(SAVE_KEY) : null);
    if (raw) return normalizeForMode(JSON.parse(raw));
    for (const version of [4, 3]) {
      const key = `bar-journey-v${version}`;
      const journeyRaw =
        localStorage.getItem(DEBUG_UNLOCK_ALL_LEVELS ? `${key}-debug` : key) ||
        localStorage.getItem(key);
      if (journeyRaw)
        return migrateJourneySave(JSON.parse(journeyRaw), {
          unlockAllLevels: DEBUG_UNLOCK_ALL_LEVELS,
        });
    }
    const raceRaw =
      localStorage.getItem(
        DEBUG_UNLOCK_ALL_LEVELS ? "bar-race-v2-debug" : "bar-race-v2",
      ) || localStorage.getItem("bar-race-v2");
    if (raceRaw)
      return migrateRaceSave(JSON.parse(raceRaw), {
        unlockAllLevels: DEBUG_UNLOCK_ALL_LEVELS,
      });
    const old = JSON.parse(
      localStorage.getItem("bar-adventures-save-v1") || "null",
    );
    const base = freshSave();
    if (old?.games?.race) {
      const race = old.games.race;
      base.unlocked = Math.min(12, Math.max(1, Math.floor(race.unlocked) || 1));
      base.selected = base.unlocked;
      base.completed = (
        Array.isArray(race.completed) ? race.completed : []
      ).filter((n) => Number.isInteger(n) && n > 0 && n <= base.unlocked);
      base.best = race.best || {};
      base.sound = old.sound !== false;
      return migrateRaceSave(
        { ...base, version: 2 },
        { unlockAllLevels: DEBUG_UNLOCK_ALL_LEVELS },
      );
    }
  } catch {}
  return freshSave();
}
function persist() {
  try {
    localStorage.setItem(activeSaveKey, JSON.stringify(save));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}
function later(fn, ms) {
  const timer = setTimeout(fn, ms);
  timers.push(timer);
  return timer;
}
function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}
function reduced() {
  return (
    save.reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function button(id, label, glyph, cls = "icon-button") {
  return `<button type="button" class="${cls}" id="${id}" aria-label="${label}">${icon(glyph)}</button>`;
}
function currentTask() {
  return save.round?.tasks[save.round.index];
}
function topbar() {
  const level =
    view === "play" || view === "result" ? roundStage() : save.selected;
  return `<header class="topbar"><div class="brand-symbol ${view !== "home" && isPancake() ? "cafe-brand" : view !== "home" && isRocket() ? "rocket-brand" : view !== "home" && isFood() ? "food-brand" : ""}" aria-label="Bar’s adventures">${view !== "home" && isPancake() ? pancakeStack(3) : view !== "home" && isRocket() ? icon("rocket") : view !== "home" && isFood() ? icon("plate") : checkers()}</div><div class="top-middle">${view === "play" ? `<div class="question-flags" aria-label="Round questions">${save.round.tasks.map((q, i) => `<span class="question-flag ${q.resolved ? (q.firstTry ? "passed" : "missed") : i === save.round.index ? "active" : ""}" aria-label="Question ${i + 1}${q.resolved ? (q.firstTry ? ", correct first try" : ", completed with help") : ""}">${q.resolved ? icon(q.firstTry ? "check" : "flag") : `<i></i>`}</span>`).join("")}</div>` : `<span class="level-pill" aria-label="Level ${level}">${icon("flag")}<b>${level}</b></span>`}</div><nav class="top-actions" aria-label="Game controls">${view !== "home" ? button("home", "Back to stage map", "home") : ""}${view === "play" && phase !== "finish" ? button("help", "Show silent example", "hand") : ""}${button("sound", save.sound ? "Mute sounds" : "Enable sounds", save.sound ? "sound" : "mute")}${button("parent", "Parent settings", "settings")}</nav></header>`;
}
function racerSprite(driver) {
  if (driver.id !== "bar" || view !== "play") return driver.sprite;
  if (
    feedback === "correct" ||
    (phase === "finish" && score(save.round) >= WIN_SCORE)
  )
    return "bar-boost";
  const task = currentTask();
  return task.rejected.length && !task.resolved ? "bar-oops" : "bar";
}
function expressionHead(driver) {
  if (driver.id !== "bar" || view !== "play" || !feedback) return "";
  return `<span class="expression-head ${feedback}" style="--expression-time:${REACTION_MS[feedback]}ms" aria-hidden="true"><img src="${ASSET + racerSprite(driver)}.png" alt="" draggable="false"/>${feedback === "correct" ? '<i class="expression-spark one"></i><i class="expression-spark two"></i>' : ""}</span>`;
}
function fitExpressionHeads() {
  root.querySelectorAll(".expression-head").forEach((head) => {
    const box = head.closest(".racer").getBoundingClientRect();
    const width = Math.min(box.width, (box.height * 4) / 3);
    const height = (width * 3) / 4;
    const stage = head.closest(".race-stage").getBoundingClientRect();
    const center = box.left + (box.width - width) / 2 + width * 0.47;
    const radius = width * 0.18 * 3.65;
    const shift =
      Math.max(0, stage.left + 8 - (center - radius)) -
      Math.max(0, center + radius - (stage.right - 8));
    Object.assign(head.style, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${(box.width - width) / 2 + shift}px`,
      top: `${(box.height - height) / 2}px`,
    });
  });
}
function racers(distance, finishing = false) {
  const order =
    save.round && view !== "home"
      ? standings(save.round).map((d) => d.id)
      : ["bar", "bunny", "fox", "panda"];
  return DRIVERS.map(
    (d) =>
      `<div class="lane ${d.id === "bar" ? "bar-lane" : ""}" data-lane="${d.id}"><div class="lane-dashes"></div><${d.id === "bar" ? "div" : 'button type="button"'} ${d.id !== "bar" ? `data-animal="${d.id}" data-mood="ready" aria-label="Play with ${d.name}"` : ""} class="racer ${d.id === "bar" ? "player" : ""} ${d.id === "bar" && feedback ? "emphasizing" : ""} ${feedback === "correct" && d.id === "bar" ? "boosting" : ""} ${feedback === "wrong" && d.id === "bar" ? "sputtering" : ""}" data-car="${d.id}" data-distance="${distance[d.id]}" style="left:${12 + distance[d.id] * 0.76}%;--car-color:${d.color};${finishing ? `--drive-time:${Math.max(0.35, (104 - distance[d.id]) / 18)}s` : ""}"><span class="exhaust" aria-hidden="true"><i></i><i></i><i></i></span><span class="rank" aria-label="${d.name}, position ${order.indexOf(d.id) + 1}">${order.indexOf(d.id) + 1}</span><img src="${ASSET + racerSprite(d)}.png" draggable="false" alt="${d.name} driving ${d.id === "bar" ? "a red" : d.id === "bunny" ? "a pink" : d.id === "fox" ? "a yellow" : "a blue"} car" />${expressionHead(d)}${d.id !== "bar" ? `<span class="car-reaction">${animalSprite(d.id)}</span>` : ""}</${d.id === "bar" ? "div" : "button"}></div>`,
  ).join("");
}
function track(distance, finishing = false) {
  return `<section class="race-stage ${feedback ? "reaction-" + feedback : ""} ${phase === "countdown" ? "starting" : ""} ${finishing ? "finishing" : ""}" aria-label="Live race track">${scenery(roundStage())}<div class="track-side"><span class="track-flower"></span><span class="track-flower second"></span></div><div class="road"><div class="curb upper"></div><div class="start-line" aria-hidden="true"></div><div class="finish-line" aria-label="Finish line">${checkers()}<span class="finish-pole"></span></div>${racers(distance, finishing)}<div class="curb lower"></div></div><div class="grass-bottom"></div>${phase === "countdown" ? `<div class="start-lights" aria-label="Race starts in ${countdown}">${[3, 2, 1].map((n) => `<i class="${countdown >= n ? "lit" : ""}"></i>`).join("")}</div>` : ""}${phase === "finish" ? `<div class="finish-flags" aria-hidden="true">${checkers()}${checkers()}</div>` : ""}</section>`;
}
function activityPicture(kind) {
  if (kind === "pancake") return pancakeStack(3);
  return kind === "race"
    ? `<img src="${ASSET}bar.png" alt="Race" draggable="false"/>`
    : kind === "rocket"
      ? `<img src="${ROCKET_ASSET}ship.png" alt="Rocket trip" draggable="false"/>`
      : objectImage("egg");
}
function homeScreen() {
  return `<section class="home-screen">${routeScreen()}<div class="start-dock"><div class="selected-activity" aria-label="Selected activity">${activityPicture(stageInfo(save.selected).kind)}<b>${save.selected}</b></div><button class="start-button" id="play" aria-label="Start or continue stage ${save.selected}">${icon("play")}</button><div class="earned-cups" aria-label="${save.completed.length} completed stages">${[0, 1, 2].map((i) => `<span class="${save.completed.length > i ? "earned" : ""}">${icon("trophy")}</span>`).join("")}</div></div></section>`;
}
function routeScreen() {
  const height = Math.ceil(STAGE_COUNT / 3) * 165 + 120;
  const pts = Array.from({ length: STAGE_COUNT }, (_, i) => {
    const row = Math.floor(i / 3),
      col = row % 2 ? 2 - (i % 3) : i % 3;
    return { x: 180 + col * 320, y: 125 + row * 165 };
  });
  let path = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i],
      prev = pts[i - 1];
    const side = Math.floor((i - 1) / 3) % 2 ? -110 : 110;
    path +=
      i % 3 === 0
        ? ` C${prev.x + side} ${prev.y + 60} ${p.x + side} ${p.y - 60} ${p.x} ${p.y}`
        : ` L${p.x} ${p.y}`;
  }
  return `<section class="route-screen journey-route"><div class="route-scroll" tabindex="0" aria-label="Scroll to explore race, food, rocket and café stages"><div class="route-map" style="height:${height}px"><svg class="level-road" viewBox="0 0 1000 ${height}" preserveAspectRatio="none" aria-hidden="true"><path d="${path}" fill="none" stroke="#a3b599" stroke-width="65" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#fff2c9" stroke-width="3" stroke-dasharray="12 12"/></svg>${pts
    .map((p, i) => {
      const n = i + 1,
        kind = stageInfo(n).kind,
        done = save.completed.includes(n),
        locked = !DEBUG_UNLOCK_ALL_LEVELS && n > save.unlocked,
        current = n === save.unlocked;
      return `<button class="level-node activity-${kind} ${done ? "complete" : ""} ${current ? "current" : ""} ${n === save.selected ? "selected" : ""} ${locked ? "locked" : ""}" style="left:${p.x / 10}%;top:${p.y}px" data-level="${n}" data-activity="${kind}" data-stage-state="${locked ? "locked" : done ? "passed" : current ? "current" : "available"}" ${current ? 'aria-current="step"' : ""} ${locked ? "disabled" : ""} aria-label="Stage ${n}, ${kind}${done ? ", passed" : ""}${current ? ", current stage" : ""}${locked ? ", locked" : ""}"><span class="node-picture">${activityPicture(kind)}</span><b>${n}</b>${done ? `<span class="node-check">${icon("check")}</span>` : locked ? `<span class="node-lock">${icon("lock")}</span>` : ""}${current ? `<span class="current-stage-marker">${icon("flag")}</span>` : ""}</button>`;
    })
    .join(
      "",
    )}</div></div><div class="map-scroll-hint" aria-hidden="true">${icon("next")}</div></section>`;
}
function dots(n, kind) {
  return `<span class="dot-group ${kind}">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`;
}
function quantity(q, help = false) {
  if (isFood())
    return `<div class="quantity-cue take-away" aria-hidden="true"><span class="dot-group red">${Array.from({ length: q.a }, (_, i) => `<i class="${i >= q.answer ? "taken" : ""}"></i>`).join("")}</span>${help ? `<span>=</span>${dots(q.answer, "red")}` : ""}</div>`;
  return `<div class="quantity-cue ${help ? "joining" : ""}" aria-hidden="true">${dots(q.a, "red")}<span>${isFood() ? "−" : "+"}</span>${dots(q.b, "blue")}${help ? `<span>=</span><span class="joined-dots">${isFood() ? dots(q.answer, "red") : dots(q.a, "red") + dots(q.b, "blue")}</span>` : ""}</div>`;
}
function questionPanel() {
  if (isPancake()) return pancakeQuestion(save.round, feedback, locked);
  if (isRocket())
    return `<section class="math-dock rocket-dock ${feedback ? "feedback-" + feedback : ""} ${questionEntry ? "new-question" : ""}" aria-label="Missing-number question">${rocketQuestion(currentTask(), save.round, locked)}<span class="feedback-symbol ${feedback}" role="status" aria-label="${feedback === "correct" ? "Power cell earned" : feedback === "wrong" ? "Engine hiccup, correct number shown" : ""}">${feedback ? icon(feedback === "correct" ? "check" : "replay") : ""}</span></section>`;
  const q = currentTask(),
    done = q.resolved;
  const showHelp = save.round.level <= 3 || q.rejected.length > 0;
  return `<section class="math-dock ${feedback ? "feedback-" + feedback : ""} ${questionEntry ? "new-question" : ""}" aria-label="${isFood() ? "Subtraction" : "Addition"} question"><div class="question-block"><div class="equation" aria-label="${q.a} ${isFood() ? "minus" : "plus"} ${q.b} equals ${done ? q.answer : "what"}"><span class="operand-a">${q.a}</span><span class="operator">${isFood() ? "−" : "+"}</span><span class="operand-b">${q.b}</span><span class="operator">=</span><span class="answer-slot ${done ? "filled" : ""}">${done ? q.answer : "?"}</span></div><div class="quantity-space">${showHelp ? quantity(q, q.assisted) : ""}</div></div><div class="answer-grid choices-${q.choices.length}">${q.choices.map((value) => `<button class="answer-button ${q.rejected.includes(value) ? "rejected" : ""} ${done && value === q.answer ? "correct" : ""} ${q.assisted && value === q.answer && !done ? "assisted" : ""}" data-answer="${value}" ${locked || done || q.rejected.includes(value) ? "disabled" : ""} aria-label="Answer ${value}">${value}${q.rejected.includes(value) ? `<span class="rejected-mark" aria-hidden="true">${icon("close")}</span>` : ""}</button>`).join("")}</div><span class="feedback-symbol ${feedback}" role="status" aria-label="${feedback === "correct" ? (isFood() ? "Correct, Bar gets the food" : "Correct, Bar gets a boost") : feedback === "wrong" ? (isFood() ? "Wrong answer, a silly bad snack" : "Try again, an animal moves ahead") : ""}">${feedback ? icon(feedback === "correct" ? "check" : "replay") : ""}</span></section>`;
}
function resultButtons(won) {
  return `${button("levels", "Choose a stage", "map", "result-button")}${button("replay", "Play again", "replay", "result-button")}${won && roundStage() < STAGE_COUNT ? button("next-level", "Start next stage", "play", "result-button primary") : ""}`;
}
function resultScreen() {
  const won = wonRound(save.round);
  if (isPancake()) return pancakeResult(save.round, resultButtons(won));
  if (isFood()) return foodResult(save.round, resultButtons(won));
  if (isRocket()) return rocketResult(save.round, resultButtons(won));
  const winner = standings(save.round)[0];
  return `<section class="result-screen ${won ? "won" : "try-again"}"><div class="result-art"><img src="${ASSET}${won ? "victory" : "finish-" + winner.id}.png" alt="${won ? "Bar crosses first in his red car while his animal friends cheer" : winner.name + " wins this race and Bar gives a friendly wave from his red car"}"/></div><div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "flag")}</div><div class="result-score" aria-label="${score(save.round)} out of 8 correct on the first try">${save.round.tasks.map((q) => `<i class="${q.firstTry ? "passed" : "missed"}">${icon(q.firstTry ? "check" : "flag")}</i>`).join("")}</div><div class="result-actions">${resultButtons(won)}</div></div></section>`;
}
function tutorial() {
  if (isPancake()) return pancakeTutorial(demoStep);
  if (isRocket()) return rocketTutorial(demoStep);
  const food = isFood(),
    result = food ? 2 : 3;
  return `<div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="Silent example: ${food ? "three minus one makes two" : "one plus two makes three"}"><div class="tutorial-card ${food ? "food-example" : ""} step-${demoStep}"><div class="example-equation"><span>${food ? 3 : 1}</span><b>${food ? "−" : "+"}</b><span>${food ? 1 : 2}</span><b>=</b><span class="answer-slot ${demoStep >= 2 ? "filled" : ""}">${demoStep >= 2 ? result : "?"}</span></div><div class="example-dots">${food ? `<span class="dot-group red"><i></i><i></i><i class="taken"></i></span><span class="join-arrow">${icon("next")}</span>${dots(2, "red")}` : `${dots(1, "red")}<span>+</span>${dots(2, "blue")}<span class="join-arrow">${icon("next")}</span><span class="joined-dots">${dots(1, "red")}${dots(2, "blue")}</span>`}</div><div class="example-options"><span class="example-answer ${demoStep >= 2 ? "correct" : ""}">${result}${demoStep >= 1 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span><span class="example-answer">${food ? 4 : 5}</span></div><div class="demo-reward"><img src="${food ? FOOD_ASSET + "eating" : ASSET + "bar"}.png" alt=""/>${food ? objectImage("apple") : '<span class="boost-chevrons">»</span>'}</div><button class="demo-continue" id="demo-continue" aria-label="Start playing">${icon("play")}</button></div></div>`;
}
function render(options = {}) {
  document.documentElement.classList.toggle("reduce-motion", reduced());
  const target =
    view === "play" && !isRocket() && !isPancake()
      ? positions(save.round)
      : { bar: 0, bunny: 0, fox: 0, panda: 0 };
  const from = options.from || target;
  const finishing = phase === "finish";
  const oldScroll = root.querySelector(".route-scroll");
  if (oldScroll) mapScroll = oldScroll.scrollTop;
  disposeAnimalTaps();
  root.innerHTML = `<main class="app-shell screen-${view}">${topbar()}${view === "home" ? homeScreen() : view === "levels" ? routeScreen() : view === "result" ? resultScreen() : `<div class="race-screen">${isPancake() ? pancakeScene(save.round, feedback) : isRocket() ? rocketScene(save.round, feedback, options.rocketFrom, finishing) : isFood() ? foodScene(save.round, feedback) : track(from, finishing)}${questionPanel()}</div>`}${demo ? tutorial() : ""}</main>`;
  bind();
  disposeAnimalTaps = bindAnimalTaps(root, sound);
  questionEntry = false;
  fitExpressionHeads();
  fitChefPlate();
  const chefImage = root.querySelector(".bar-chef img");
  if (chefImage && !chefImage.complete)
    chefImage.addEventListener("load", fitChefPlate, { once: true });
  const scroller = root.querySelector(".route-scroll");
  if (scroller) {
    const selected = scroller.querySelector(`[data-level="${save.selected}"]`);
    scroller.scrollTop =
      mapScroll ?? Math.max(0, selected.offsetTop - scroller.clientHeight / 2);
    scroller.addEventListener(
      "scroll",
      () => {
        scroller
          .closest(".journey-route")
          .classList.toggle(
            "at-bottom",
            scroller.scrollTop + scroller.clientHeight >=
              scroller.scrollHeight - 12,
          );
      },
      { passive: true },
    );
  }
  for (const id of ["help"]) {
    const control = document.getElementById(id);
    if (control) control.disabled = locked;
  }
  if (demo) {
    root.querySelector(".topbar").inert = true;
    root.querySelector(".race-screen").inert = true;
    document.getElementById("demo-continue")?.focus({ preventScroll: true });
  }
  if (isRocket() && view === "play") {
    const craft = root.querySelector("[data-rocket]");
    if (options.rocketFrom || finishing) {
      craft.getBoundingClientRect();
      const point = finishing
        ? wonRound(save.round)
          ? { x: 88, y: 26 }
          : { x: 12, y: 76 }
        : rocketPoint(save.round);
      craft.style.left = `${point.x}%`;
      craft.style.top = `${point.y}%`;
    }
    fitPilotZoom();
  }
  if (!isRocket() && (options.from || finishing)) {
    root.querySelector(".road")?.getBoundingClientRect();
    root.querySelectorAll("[data-car]").forEach((car) => {
      const distance = finishing ? 104 : target[car.dataset.car];
      car.style.left = `${12 + distance * 0.76}%`;
      car.dataset.distance = distance;
    });
  }
}
function bind() {
  const on = (id, fn) =>
    document.getElementById(id)?.addEventListener("click", fn);
  on("home", () => navigate("home"));
  on("sound", () => {
    save.sound = !save.sound;
    persist();
    updateSoundOptions(save);
    const b = document.getElementById("sound");
    b.innerHTML = icon(save.sound ? "sound" : "mute");
    b.setAttribute("aria-label", save.sound ? "Mute sounds" : "Enable sounds");
    if (save.sound) sound("tap");
  });
  on("parent", adultSettings);
  on("play", () => prepareRace(save.selected));
  on("levels", () => navigate("levels"));
  on("help", () => showDemo(false));
  on("demo-continue", () => {
    clearTimers();
    demo = false;
    if (view === "play" && phase === "intro") {
      if (isPancake()) save.taughtPancake = true;
      else if (isRocket()) save.taughtRocket = true;
      else if (isFood()) save.taughtFood = true;
      else save.taught = true;
      persist();
      if (isFood() || isRocket() || isPancake()) {
        phase = "question";
        locked = false;
        render();
      } else startCountdown();
    } else render();
  });
  on("replay", () => prepareRace(roundStage(), true));
  on("next-level", () =>
    prepareRace(Math.min(STAGE_COUNT, roundStage() + 1), true),
  );
  root.querySelectorAll("[data-level]").forEach((b) =>
    b.addEventListener("click", () => {
      save.selected = +b.dataset.level;
      persist();
      prepareRace(save.selected);
    }),
  );
  root
    .querySelectorAll("[data-plate]")
    .forEach((b) => b.addEventListener("click", () => answer(b.dataset.plate)));
  root
    .querySelectorAll("[data-answer]")
    .forEach((b) =>
      b.addEventListener("click", () => answer(+b.dataset.answer)),
    );
}
function navigate(screen) {
  sound("tap");
  clearTimers();
  questionEntry = false;
  demo = false;
  feedback = "";
  locked = false;
  phase = "idle";
  view = screen;
  persist();
  render();
}
function prepareRace(level, replay = false) {
  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > STAGE_COUNT ||
    (!DEBUG_UNLOCK_ALL_LEVELS && level > save.unlocked)
  )
    return;
  sound("tap");
  clearTimers();
  feedback = "";
  locked = true;
  view = "play";
  save.selected = level;
  if (
    replay ||
    !save.round ||
    save.round.stage !== level ||
    save.round.status === "finished"
  )
    save.round = newRound(level);
  persist();
  if (isRocket()) {
    for (const state of [
      "ship",
      "ship-boost",
      "ship-oops",
      "landing",
      "return",
    ]) {
      const image = new Image();
      image.decoding = "async";
      image.src = `${ROCKET_ASSET}${state}.png`;
    }
  }
  if (
    isPancake()
      ? !save.taughtPancake
      : isRocket()
        ? !save.taughtRocket
        : isFood()
          ? !save.taughtFood
          : !save.taught
  ) {
    phase = "intro";
    render();
    showDemo(true);
  } else if (currentTask().firstTry !== null || save.round.index > 0) {
    phase = "question";
    locked = false;
    if (currentTask().resolved) nextQuestion();
    else {
      questionEntry = true;
      render();
    }
  } else if (isFood() || isRocket() || isPancake()) {
    phase = "question";
    locked = false;
    questionEntry = true;
    render();
  } else startCountdown();
}
function showDemo(first) {
  if (locked && !first) return;
  clearTimers();
  demo = true;
  demoStep = 0;
  render();
  later(() => {
    demoStep = 1;
    render();
  }, 850);
  later(() => {
    demoStep = 2;
    render();
    sound("tap");
  }, 1700);
  later(() => {
    demoStep = 3;
    render();
    sound(
      isPancake()
        ? "win"
        : isRocket()
          ? "rocket-boost"
          : isFood()
            ? "win"
            : "boost",
    );
  }, 2300);
}
function startCountdown() {
  phase = "countdown";
  locked = true;
  countdown = 3;
  render();
  sound("light");
  later(() => {
    countdown = 2;
    render();
    sound("light");
  }, 650);
  later(() => {
    countdown = 1;
    render();
    sound("light");
  }, 1300);
  later(() => {
    phase = "question";
    locked = false;
    questionEntry = true;
    render();
    sound("go");
  }, 1950);
}
function answer(value) {
  if (view !== "play" || phase !== "question" || locked || demo) return;
  const before = isPancake()
    ? null
    : isRocket()
      ? rocketPoint(save.round)
      : positions(save.round);
  const result = submit(save.round, value);
  if (!result.accepted) return;
  if (isPancake() && !result.graded) {
    persist();
    sound("tap");
    render();
    return;
  }
  locked = true;
  feedback = result.correct ? "correct" : "wrong";
  completeRound(save);
  persist();
  sound(result.correct ? "win" : "lose");
  if (isRocket()) sound(result.correct ? "rocket-boost" : "rocket-sputter");
  render(
    isPancake() ? {} : isRocket() ? { rocketFrom: before } : { from: before },
  );
  const roundId = save.round.id;
  const taskId = currentTask().id;
  if (isPancake()) {
    later(() => {
      if (
        view === "play" &&
        save.round?.id === roundId &&
        currentTask()?.id === taskId
      )
        sound(
          `animal:${currentTask().animal}:${result.correct ? "happy" : "surprised"}`,
        );
    }, 650);
  }
  if (isFood() && !result.correct) {
    later(() => {
      if (
        view === "play" &&
        save.round?.id === roundId &&
        currentTask()?.id === taskId &&
        feedback === "wrong"
      )
        sound("eww");
    }, 580);
  }
  later(
    () => {
      if (
        view !== "play" ||
        save.round?.id !== roundId ||
        currentTask()?.id !== taskId
      )
        return;
      feedback = "";
      locked = false;
      if (currentTask().resolved) nextQuestion();
      else render();
    },
    isPancake() ? (result.correct ? 2600 : 3100) : REACTION_MS[feedback],
  );
}
function nextQuestion() {
  if (locked || demo || !currentTask()?.resolved) return;
  if (save.round.status === "finished") {
    finishRace();
    return;
  }
  save.round.index++;
  feedback = "";
  phase = "question";
  questionEntry = true;
  persist();
  render();
  sound(isFood() && mealFor(save.round).bonus ? "bonus" : "question");
}
function finishRace() {
  if (isRocket()) {
    phase = "finish";
    locked = true;
    feedback = "";
    completeRound(save);
    persist();
    render({ rocketFrom: rocketPoint(save.round) });
    sound(wonRound(save.round) ? "rocket-land" : "rocket-return");
    later(
      () => {
        view = "result";
        phase = "idle";
        locked = false;
        render();
        scheduleWinReturn();
      },
      reduced() ? 700 : 1500,
    );
    return;
  }
  if (isFood() || isPancake()) {
    view = "result";
    phase = "idle";
    feedback = "";
    locked = false;
    completeRound(save);
    persist();
    render();
    scheduleWinReturn();
    return;
  }
  phase = "finish";
  locked = true;
  feedback = "";
  completeRound(save);
  persist();
  const from = positions(save.round);
  render({ from });
  sound("finish");
  const winner = standings(save.round)[0].id;
  const crossing = ((100 - from[winner]) / 18) * 1000;
  later(
    () => {
      view = "result";
      phase = "idle";
      locked = false;
      render();
      scheduleWinReturn();
    },
    reduced() ? 700 : Math.max(1600, crossing + 1000),
  );
}
function scheduleWinReturn() {
  if (!wonRound(save.round)) return;
  const finishedRound = save.round.id;
  later(() => {
    if (view !== "result" || save.round?.id !== finishedRound) return;
    save.selected = save.unlocked;
    mapScroll = null;
    navigate("home");
  }, WIN_RETURN_MS);
}
function sound(kind) {
  return playSound(kind, save);
}
function adultSettings() {
  if (document.querySelector(".adult-backdrop")) return;
  const panel = document.createElement("div");
  panel.className = "adult-backdrop";
  const a = 7 + Math.floor(Math.random() * 8),
    b = 6 + Math.floor(Math.random() * 6);
  panel.innerHTML = `<form class="adult-dialog"><div class="adult-heading"><h2>Parent settings</h2><button type="button" data-close aria-label="Close parent settings">${icon("close")}</button></div><label>What is ${a} + ${b}?<input type="number" inputmode="numeric" required autocomplete="off" aria-label="Parent check answer" /></label><button class="adult-primary" type="submit">Continue</button></form>`;
  root.inert = true;
  document.body.append(panel);
  const close = () => {
    panel.remove();
    root.inert = false;
    document.getElementById("parent")?.focus();
  };
  panel.querySelector("[data-close]").onclick = close;
  panel.onkeydown = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const nodes = [...panel.querySelectorAll("button,input")];
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Parent settings");
  panel.querySelector("input").focus();
  panel.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    if (+panel.querySelector("input").value !== a + b) {
      panel.querySelector("input").value = "";
      panel.querySelector("input").focus();
      return;
    }
    panel.innerHTML = `<div class="adult-dialog"><div class="adult-heading"><h2>Parent settings</h2><button type="button" data-close aria-label="Close parent settings">${icon("close")}</button></div><p>Addition races, subtraction meals, and missing-number rocket trips. Rockets begin after three race/food pairs, with their own easy starting difficulty. Races and meals have eight questions each. Races need six first-try answers; meals need seven food points out of ten. Two sweets are double bonuses. Food questions have one attempt, then show the answer and move on. Rocket missions need six power cells before three mistakes, ending as soon as either is reached. Café stages begin at stage 8. Choose two pancake plates to match the order; tap your first plate again to undo. Any matching pair works. Four correct orders out of five wins. Tap animal friends for a playful reaction; this never affects answers or progress. Thinking time is unlimited.</p><label>Sound volume<input type="range" min="0" max=".7" step=".05" value="${save.volume}"/></label><div class="adult-sound-previews"><button type="button" data-preview-win>Preview correct-answer sound</button><button type="button" data-preview-lose>Preview wrong-answer sound</button></div><label class="check-label"><input type="checkbox" data-motion ${save.reducedMotion ? "checked" : ""}/> Reduce motion</label><button type="button" data-demo>Show silent example next time</button><button type="button" data-reset>Reset adventure progress</button><p class="storage-status">${storageAvailable ? "Progress saves in this browser." : "This browser is not allowing progress to be saved."}</p></div>`;
    panel.querySelector("[data-close]").onclick = close;
    panel.querySelector("input[type=range]").oninput = (e) => {
      save.volume = +e.target.value;
      updateSoundOptions(save);
      persist();
    };
    for (const outcome of ["win", "lose"]) {
      panel.querySelector(`[data-preview-${outcome}]`).onclick = (e) => {
        const played = sound(outcome);
        e.currentTarget.textContent = played
          ? played.label
          : "Enable sound and raise volume to preview";
      };
    }
    panel.querySelector("[data-motion]").onchange = (e) => {
      save.reducedMotion = e.target.checked;
      persist();
      document.documentElement.classList.toggle("reduce-motion", reduced());
    };
    panel.querySelector("[data-demo]").onclick = () => {
      save.taught = false;
      save.taughtFood = false;
      save.taughtRocket = false;
      save.taughtPancake = false;
      persist();
      panel.querySelector("[data-demo]").textContent =
        "Example will play before the next activity";
    };
    panel.querySelector("[data-reset]").onclick = () => {
      const target = panel.querySelector("[data-reset]");
      if (target.dataset.confirm !== "yes") {
        target.dataset.confirm = "yes";
        target.textContent = "Confirm: reset all adventure progress";
        return;
      }
      const oldSound = save.sound;
      save = freshSave();
      save.sound = oldSound;
      persist();
      close();
      navigate("home");
    };
    panel.querySelector("[data-close]").focus();
  };
}
function fitPilotZoom() {
  const zoom = root.querySelector(".pilot-zoom");
  if (!zoom) return;
  const stage = zoom.closest(".rocket-stage");
  const craft = zoom.closest(".rocket-craft");
  const point = rocketPoint(save.round);
  const top = (stage.clientHeight * point.y) / 100 - craft.offsetHeight / 2;
  zoom.style.top = `${Math.max(68 - top, -90)}px`;
}
function fitChefPlate() {
  const stage = root.querySelector(".cafe-stage"),
    chef = root.querySelector(".bar-chef"),
    serving = root.querySelector(".chef-serving");
  if (!stage || !chef || !serving) return;
  const img = chef.querySelector("img");
  if (!img.naturalWidth) return;
  const w = Math.min(
      chef.clientWidth,
      (chef.clientHeight * img.naturalWidth) / img.naturalHeight,
    ),
    h = (w * img.naturalHeight) / img.naturalWidth;
  const a = stage.getBoundingClientRect(),
    b = chef.getBoundingClientRect();
  const x = b.left - a.left + (b.width - w) / 2 + w * 0.62,
    y = b.top - a.top + (b.height - h) / 2 + h * 0.575;
  stage.style.setProperty("--serve-x", `${x}px`);
  stage.style.setProperty("--serve-y", `${y}px`);
  stage.style.setProperty("--serve-scale", Math.min(1.2, (w * 0.39) / 90));
  const customer = root.querySelector(".cafe-customer");
  if (customer) {
    const c = customer.getBoundingClientRect();
    stage.style.setProperty(
      "--customer-x",
      `${c.left - a.left + c.width * 0.5}px`,
    );
    stage.style.setProperty("--customer-y", `${c.bottom - a.top}px`);
  }
}
window.addEventListener("resize", () => {
  fitChefPlate();
  fitExpressionHeads();
  fitPilotZoom();
});
render();
// Warm expression sprites while the map is open, before the first answer.
for (const pose of ["ready", "eating", "eww", "strong", "tired"]) {
  const image = new Image();
  image.decoding = "async";
  image.src = `${FOOD_ASSET}${pose}.png`;
}

for (const pose of ["ready", "happy", "oops"]) {
  const image = new Image();
  image.src = `${CAFE_ASSET}chef-${pose}.png`;
}
