import { seeded } from "./race-model.js";

export const ROCKET_GOAL = 6;
export const ROCKET_MISTAKES = 3;
export function rocketDifficulty(level) {
  return {
    cap: [3, 4, 5, 5, 6, 8, 10, 5, 8, 10][level - 1] || 10,
    choices: level <= 5 ? 2 : level <= 9 ? 3 : 4,
    dots: level <= 5,
  };
}
function shuffled(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function makeRocketQuestions(level, seed) {
  const random = seeded(seed ^ 0x726f636b);
  const { cap, choices } = rocketDifficulty(level);
  let previous = "";
  return Array.from({ length: 8 }, (_, index) => {
    const op =
      level >= 8 && (level === 10 ? index % 2 : index >= 4) ? "−" : "+";
    const blank =
      level <= 3 || (level === 8 && op === "−")
        ? "a"
        : level === 4
          ? "b"
          : index % 2
            ? "b"
            : "a";
    const pool = [];
    for (let a = 1; a <= cap; a++)
      for (let b = 1; b <= cap; b++) {
        const total = op === "+" ? a + b : a - b;
        const known = blank === "a" ? b : a;
        if (
          total < 0 ||
          total > cap ||
          (level <= 2 && b !== 1) ||
          (level <= 4 && op === "+" && known > 2) ||
          (level === 8 && op === "−" && b !== 1)
        )
          continue;
        pool.push({ a, b, total, op, blank });
      }
    let available = pool.filter(
      (q) => `${q.a}:${q.b}:${q.op}:${q.blank}` !== previous,
    );
    if (!available.length) available = pool;
    const base =
      level === 1 && index === 0
        ? { a: 1, b: 1, total: 2, op: "+", blank: "a" }
        : available[Math.floor(random() * available.length)];
    previous = `${base.a}:${base.b}:${base.op}:${base.blank}`;
    const answer = base[blank];
    const others = shuffled(
      Array.from({ length: cap + 1 }, (_, n) => n).filter((n) => n !== answer),
      random,
    );
    others.sort((a, b) =>
      level <= 3
        ? (Math.abs(a - answer) < 2) - (Math.abs(b - answer) < 2)
        : Math.abs(a - answer) - Math.abs(b - answer),
    );
    return {
      ...base,
      id: `${seed}-rocket-${index}`,
      answer,
      choices: shuffled([answer, ...others.slice(0, choices - 1)], random),
      rejected: [],
      firstTry: null,
      resolved: false,
      assisted: false,
    };
  });
}
export function rocketProgress(round) {
  const judged = round.tasks.filter((q) => q.resolved);
  return {
    cells: judged.filter((q) => q.firstTry).length,
    mistakes: judged.filter((q) => !q.firstTry).length,
  };
}
export function rocketFinished(round) {
  const p = rocketProgress(round);
  return p.cells >= ROCKET_GOAL || p.mistakes >= ROCKET_MISTAKES;
}
export function submitRocket(round, value) {
  const q = round.tasks[round.index];
  if (
    round.status === "finished" ||
    !q ||
    q.resolved ||
    !q.choices.includes(value)
  )
    return { accepted: false };
  const correct = value === q.answer;
  q.firstTry = correct;
  q.resolved = true;
  if (!correct) q.rejected.push(value);
  if (rocketFinished(round)) round.status = "finished";
  return { accepted: true, correct, firstTry: correct };
}
export function validRocketRound(round) {
  const expected = makeRocketQuestions(round.level, round.seed);
  let cells = 0,
    misses = 0;
  const valid = round.tasks.every((q, i) => {
    const e = expected[i];
    if (
      !q ||
      ["id", "a", "b", "total", "op", "blank", "answer"].some(
        (k) => q[k] !== e[k],
      ) ||
      JSON.stringify(q.choices) !== JSON.stringify(e.choices) ||
      typeof q.resolved !== "boolean" ||
      q.assisted !== false ||
      !Array.isArray(q.rejected) ||
      q.rejected.length > 1
    )
      return false;
    if (q.resolved) {
      if (i > round.index || cells >= ROCKET_GOAL || misses >= ROCKET_MISTAKES)
        return false;
      if (q.firstTry === true && q.rejected.length === 0) cells++;
      else if (
        q.firstTry === false &&
        q.rejected.length === 1 &&
        q.choices.includes(q.rejected[0]) &&
        q.rejected[0] !== q.answer
      )
        misses++;
      else return false;
    } else if (i < round.index || q.firstTry !== null || q.rejected.length)
      return false;
    return true;
  });
  return (
    valid &&
    (round.status === "finished") ===
      (cells >= ROCKET_GOAL || misses >= ROCKET_MISTAKES)
  );
}
