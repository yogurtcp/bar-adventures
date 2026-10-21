// The race is answer-driven. Time spent thinking never changes a distance.
export const QUESTION_COUNT = 8;
export const WIN_SCORE = 6;
export const SAVE_KEY = "bar-race-v2";
export const DRIVERS = [
  { id: "bar", color: "#ef6457", sprite: "bar", name: "Bar" },
  { id: "bunny", color: "#eaa4c0", sprite: "bunny", name: "Bunny" },
  { id: "fox", color: "#f1be54", sprite: "fox", name: "Fox" },
  { id: "panda", color: "#79b7db", sprite: "panda", name: "Panda" },
];
export function seeded(seed) {
  let value = seed >>> 0 || 1;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}
function shuffle(items, random) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
export function makeQuestions(level, seed) {
  const random = seeded(seed);
  const cap = level <= 3 ? 5 : 10;
  const count = level <= 3 ? 2 : level <= 6 ? 3 : 4;
  const pairs = [];
  for (let a = 1; a < cap; a++)
    for (let b = 1; a + b <= cap; b++) pairs.push([a, b]);
  let selected = shuffle(pairs, random).slice(0, QUESTION_COUNT);
  if (level >= 2) {
    const value = 1 + Math.floor(random() * cap);
    selected.splice(
      2 + Math.floor(random() * 4),
      1,
      random() < 0.5 ? [value, 0] : [0, value],
    );
  }
  return selected.map(([a, b], index) => {
    const answer = a + b;
    const other = shuffle(
      Array.from({ length: cap + 1 }, (_, n) => n).filter((n) => n !== answer),
      random,
    );
    other.sort((x, y) =>
      level <= 3
        ? (Math.abs(y - answer) >= 2) - (Math.abs(x - answer) >= 2)
        : Math.abs(x - answer) - Math.abs(y - answer),
    );
    return {
      id: `${seed}-${index}`,
      a,
      b,
      answer,
      choices: shuffle([answer, ...other.slice(0, count - 1)], random),
      rejected: [],
      firstTry: null,
      resolved: false,
      assisted: false,
    };
  });
}
export function newRound(
  level,
  seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0,
) {
  return {
    id: `${seed}-${Date.now()}`,
    level,
    seed,
    index: 0,
    status: "racing",
    tasks: makeQuestions(level, seed),
  };
}
export function score(round) {
  return round.tasks.filter((q) => q.firstTry === true && q.resolved).length;
}
export function positions(round) {
  if (!round) return { bar: 0, bunny: 0, fox: 0, panda: 0 };
  const judged = round.tasks.filter((q) => q.firstTry !== null);
  const bar = judged.reduce(
    (sum, q) => sum + (q.firstTry ? 12 : q.resolved ? 6.5 : 4.5),
    0,
  );
  const rivals = ["bunny", "fox", "panda"];
  const fastest = (round.level - 1) % 3;
  const distances = { bar };
  rivals.forEach((id, i) => {
    const relative = (i - fastest + 3) % 3;
    const step = [10.25, 9.6, 9.0][relative];
    distances[id] = judged.length * step;
  });
  return distances;
}
export function standings(round) {
  const distance = positions(round);
  return [...DRIVERS].sort(
    (a, b) =>
      distance[b.id] - distance[a.id] ||
      DRIVERS.indexOf(a) - DRIVERS.indexOf(b),
  );
}
export function submit(round, value) {
  const q = round.tasks[round.index];
  if (
    !q ||
    q.resolved ||
    !q.choices.includes(value) ||
    q.rejected.includes(value)
  )
    return { accepted: false };
  const correct = value === q.answer;
  if (q.firstTry === null) q.firstTry = correct;
  if (correct) q.resolved = true;
  else {
    q.rejected.push(value);
    if (q.rejected.length >= 2) q.assisted = true;
  }
  if (q.resolved && round.index === QUESTION_COUNT - 1)
    round.status = "finished";
  return { accepted: true, correct, firstTry: q.firstTry };
}
export function freshSave() {
  return {
    version: 2,
    unlocked: 1,
    selected: 1,
    completed: [],
    best: {},
    sound: true,
    volume: 0.35,
    reducedMotion: false,
    taught: false,
    round: null,
  };
}
export function normalizeSave(raw, { unlockAllLevels = false } = {}) {
  const save = freshSave();
  if (!raw || raw.version !== 2) return save;
  const bounded = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
  save.unlocked = bounded(raw.unlocked, 1, 12) ? raw.unlocked : 1;
  const accessibleLimit = unlockAllLevels ? 12 : save.unlocked;
  save.selected = bounded(raw.selected, 1, accessibleLimit)
    ? raw.selected
    : save.unlocked;
  save.completed = Array.isArray(raw.completed)
    ? [...new Set(raw.completed.filter((n) => bounded(n, 1, save.unlocked)))]
    : [];
  if (raw.best && typeof raw.best === "object")
    for (const [key, value] of Object.entries(raw.best))
      if (bounded(+key, 1, 12) && bounded(value, 0, 8)) save.best[key] = value;
  save.sound = raw.sound !== false;
  save.volume =
    typeof raw.volume === "number" && Number.isFinite(raw.volume)
      ? Math.max(0, Math.min(0.7, raw.volume))
      : 0.35;
  save.reducedMotion = raw.reducedMotion === true;
  save.taught = raw.taught === true;
  const r = raw.round;
  if (
    r &&
    typeof r.id === "string" &&
    bounded(r.level, 1, accessibleLimit) &&
    bounded(r.index, 0, 7) &&
    ["racing", "finished"].includes(r.status) &&
    Array.isArray(r.tasks) &&
    r.tasks.length === 8 &&
    r.tasks.every((q, i) => validQuestion(q, i, r)) &&
    (r.status === "finished") === (r.index === 7 && r.tasks[7].resolved)
  )
    save.round = r;
  return save;
}
function validQuestion(q, i, r) {
  const cap = r.level <= 3 ? 5 : 10;
  return (
    q &&
    Number.isInteger(q.a) &&
    Number.isInteger(q.b) &&
    q.a >= 0 &&
    q.b >= 0 &&
    q.a + q.b <= cap &&
    q.answer === q.a + q.b &&
    typeof q.id === "string" &&
    Array.isArray(q.choices) &&
    q.choices.length >= 2 &&
    q.choices.length <= 4 &&
    q.choices.every((n) => Number.isInteger(n) && n >= 0 && n <= cap) &&
    new Set(q.choices).size === q.choices.length &&
    q.choices.includes(q.answer) &&
    Array.isArray(q.rejected) &&
    q.rejected.every((n) => q.choices.includes(n) && n !== q.answer) &&
    new Set(q.rejected).size === q.rejected.length &&
    [null, true, false].includes(q.firstTry) &&
    typeof q.resolved === "boolean" &&
    typeof q.assisted === "boolean" &&
    (q.firstTry !== null || !q.resolved) &&
    (!q.resolved || q.firstTry !== null) &&
    (q.firstTry !== true || (q.resolved && q.rejected.length === 0)) &&
    (q.firstTry !== false || q.rejected.length > 0) &&
    (q.firstTry !== null || q.rejected.length === 0) &&
    (i >= r.index || q.resolved) &&
    (i <= r.index || (!q.resolved && q.firstTry === null)) &&
    (r.status !== "finished" || (r.index === 7 && q.resolved))
  );
}
export function completeRound(save) {
  const round = save.round;
  if (!round || round.status !== "finished") return;
  const result = score(round);
  save.best[round.level] = Math.max(save.best[round.level] || 0, result);
  if (result >= WIN_SCORE) {
    if (!save.completed.includes(round.level)) save.completed.push(round.level);
    save.unlocked = Math.max(save.unlocked, Math.min(12, round.level + 1));
    if (save.selected <= round.level)
      save.selected = Math.min(12, round.level + 1);
  }
}
