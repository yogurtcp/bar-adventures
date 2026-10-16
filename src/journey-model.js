import * as race from "./race-model.js";

export const SAVE_KEY = "bar-journey-v3";
export const STAGE_COUNT = 24;
export const FOOD_GOAL = 7;
export const stageInfo = (stage) => ({
  stage,
  kind: stage % 2 ? "race" : "food",
  level: Math.ceil(stage / 2),
});
export const MEALS = [
  "egg",
  "cucumber",
  "milk",
  "fish",
  "carrot",
  "apple",
  "cheese",
  "bread",
];
export const SWEETS = ["icecream", "cake", "chocolate", "candy"];
export const MISHAPS = ["frog", "sock", "shoe", "snail"];
export function mealFor(round, index = round.index) {
  const bonus = index === 2 || index === 6;
  const list = bonus ? SWEETS : MEALS;
  return {
    item: list[
      (round.seed + (bonus ? Math.floor(index / 2) : index)) % list.length
    ],
    bonus,
    value: bonus ? 2 : 1,
  };
}
export function foodProgress(round) {
  let points = 0,
    misses = 0;
  const collected = [];
  for (const [i, q] of round.tasks.entries()) {
    if (!q.resolved) continue;
    if (q.firstTry) {
      const meal = mealFor(round, i);
      points += meal.value;
      for (let n = 0; n < meal.value; n++) collected.push(meal.item);
    } else misses++;
  }
  return {
    points,
    misses,
    collected,
    energy: Math.max(0, Math.min(10, 3 + points - misses)),
  };
}
export function wonRound(round) {
  return round.kind === "food"
    ? foodProgress(round).points >= FOOD_GOAL
    : race.score(round) >= race.WIN_SCORE;
}
export function newRound(stage, seed) {
  const info = stageInfo(stage);
  const round = { ...race.newRound(info.level, seed), ...info };
  if (info.kind === "food") {
    round.tasks = round.tasks.map((q) => ({
      ...q,
      a: q.answer,
      answer: q.a,
      choices: q.choices.map((n) => (n === q.answer ? q.a : n)),
    }));
    // Regenerate distractors around the subtraction result, without duplicates.
    const random = race.seeded(round.seed ^ 0x5eed);
    for (const q of round.tasks) {
      const cap = info.level <= 3 ? 5 : 10;
      const others = Array.from({ length: cap + 1 }, (_, n) => n).filter(
        (n) => n !== q.answer,
      );
      others.sort((a, b) => Math.abs(a - q.answer) - Math.abs(b - q.answer));
      const count = q.choices.length;
      const choices = [q.answer, ...others.slice(0, count - 1)];
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      q.choices = choices;
    }
  }
  return round;
}
export function submit(round, value) {
  if (round.kind !== "food") return race.submit(round, value);
  const q = round.tasks[round.index];
  if (!q || q.resolved || !q.choices.includes(value))
    return { accepted: false };
  const correct = value === q.answer;
  q.firstTry = correct;
  q.resolved = true;
  if (!correct) q.rejected.push(value);
  if (round.index === 7) round.status = "finished";
  return { accepted: true, correct, firstTry: correct };
}
export function freshSave() {
  return { ...race.freshSave(), version: 3, taughtFood: false };
}
export function completeRound(save) {
  const r = save.round;
  if (!r || r.status !== "finished") return;
  const points = r.kind === "food" ? foodProgress(r).points : race.score(r);
  save.best[r.stage] = Math.max(save.best[r.stage] || 0, points);
  if (wonRound(r)) {
    if (!save.completed.includes(r.stage)) save.completed.push(r.stage);
    save.unlocked = Math.max(save.unlocked, Math.min(STAGE_COUNT, r.stage + 1));
    if (save.selected <= r.stage)
      save.selected = Math.min(STAGE_COUNT, r.stage + 1);
  }
}
export function migrateRaceSave(raw, options) {
  const old = race.normalizeSave(raw, options);
  const save = {
    ...old,
    version: 3,
    unlocked: old.unlocked * 2 - 1,
    selected: old.selected * 2 - 1,
    completed: old.completed.map((n) => n * 2 - 1),
    best: Object.fromEntries(
      Object.entries(old.best).map(([n, v]) => [+n * 2 - 1, v]),
    ),
    round: old.round
      ? { ...old.round, stage: old.round.level * 2 - 1, kind: "race" }
      : null,
  };
  // Newly inserted food stages remain available even before a previously unlocked race.
  return normalizeSave(save, options);
}
export function normalizeSave(raw, { unlockAllLevels = false } = {}) {
  const save = freshSave();
  if (!raw || raw.version !== 3) return save;
  const bounded = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
  save.unlocked = bounded(raw.unlocked, 1, STAGE_COUNT) ? raw.unlocked : 1;
  const limit = unlockAllLevels ? STAGE_COUNT : save.unlocked;
  save.selected = bounded(raw.selected, 1, limit)
    ? raw.selected
    : save.unlocked;
  save.completed = Array.isArray(raw.completed)
    ? [...new Set(raw.completed.filter((n) => bounded(n, 1, STAGE_COUNT)))]
    : [];
  if (raw.best && typeof raw.best === "object")
    for (const [n, v] of Object.entries(raw.best)) {
      if (bounded(+n, 1, STAGE_COUNT) && bounded(v, 0, +n % 2 ? 8 : 10))
        save.best[n] = v;
    }
  save.sound = raw.sound !== false;
  save.volume =
    typeof raw.volume === "number" && Number.isFinite(raw.volume)
      ? Math.max(0, Math.min(0.7, raw.volume))
      : 0.35;
  save.reducedMotion = raw.reducedMotion === true;
  save.taught = raw.taught === true;
  save.taughtFood = raw.taughtFood === true;
  const r = raw.round;
  if (
    !r ||
    !bounded(r.stage, 1, limit) ||
    !bounded(r.index, 0, 7) ||
    !bounded(r.seed, 0, 0xffffffff) ||
    typeof r.id !== "string" ||
    !["racing", "finished"].includes(r.status)
  )
    return save;
  const info = stageInfo(r.stage);
  if (
    r.level !== info.level ||
    r.kind !== info.kind ||
    !Array.isArray(r.tasks) ||
    r.tasks.length !== 8
  )
    return save;
  if (info.kind === "race") {
    const checked = race.normalizeSave(
      { ...race.freshSave(), unlocked: 12, round: r },
      { unlockAllLevels: true },
    );
    if (checked.round) save.round = r;
    return save;
  }
  const expected = newRound(r.stage, r.seed);
  if (
    r.tasks.every((q, i) => {
      const e = expected.tasks[i];
      return (
        q &&
        q.id === e.id &&
        q.a === e.a &&
        q.b === e.b &&
        q.answer === e.answer &&
        JSON.stringify(q.choices) === JSON.stringify(e.choices) &&
        typeof q.resolved === "boolean" &&
        typeof q.assisted === "boolean" &&
        Array.isArray(q.rejected) &&
        q.rejected.length <= 1 &&
        q.rejected.every((n) => q.choices.includes(n) && n !== q.answer) &&
        (q.resolved
          ? (q.firstTry === true && q.rejected.length === 0) ||
            (q.firstTry === false && q.rejected.length === 1)
          : q.firstTry === null && q.rejected.length === 0) &&
        (i >= r.index || q.resolved) &&
        (i <= r.index || !q.resolved)
      );
    }) &&
    (r.status === "finished") === (r.index === 7 && r.tasks[7].resolved)
  )
    save.round = r;
  return save;
}
