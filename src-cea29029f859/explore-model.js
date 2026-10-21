import { seeded } from "./race-model.js";
export const EXPLORE_GOAL = 4;
export const EXPLORE_COUNT = 6;
function shuffled(items, random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function makeExploreQuestions(kind, level, seed) {
  const random = seeded(
    Math.imul(seed ^ (kind === "fishing" ? 0xf15 : 0xba11), 0x9e3779b1),
  );
  return Array.from({ length: EXPLORE_COUNT }, (_, i) => {
    const cap = Math.min(10, level <= 2 ? level + 2 : level + 3);
    const common = {
      id: `${seed}-${kind}-${i}`,
      resolved: false,
      firstTry: null,
      assisted: false,
      rejected: [],
    };
    if (kind === "fishing") {
      const answer = level === 1 ? 1 + (i % 3) : 1 + Math.floor(random() * cap),
        count = level <= 2 ? 2 : level <= 6 ? 3 : 4;
      const others = shuffled(
        Array.from({ length: cap }, (_, n) => n + 1).filter(
          (n) => n !== answer,
        ),
        random,
      );
      if (level >= 4)
        others.sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer));
      return {
        ...common,
        answer,
        choices: shuffled([answer, ...others.slice(0, count - 1)], random),
        species: (seed + i) % 6,
      };
    }
    let a = 1 + Math.floor(random() * cap),
      b = 1 + Math.floor(random() * cap);
    if (level <= 2 && a === b) b = (a % cap) + 1;
    if (level >= 3 && i === 2) b = a;
    if (level === 1 && i === 0) {
      a = 3;
      b = 1;
    }
    return {
      ...common,
      a,
      b,
      answer: a > b ? ">" : a < b ? "<" : "=",
      choices: level <= 2 ? [">", "<"] : [">", "=", "<"],
    };
  });
}
export const exploreScore = (r) =>
  r.tasks.filter((q) => q.firstTry === true).length;
export function submitExplore(round, value) {
  const q = round.tasks[round.index];
  if (
    round.status === "finished" ||
    !q ||
    q.resolved ||
    !q.choices.includes(value)
  )
    return { accepted: false };
  const correct = value === q.answer;
  q.resolved = true;
  q.firstTry = correct;
  if (!correct) q.rejected.push(value);
  if (round.index === EXPLORE_COUNT - 1) round.status = "finished";
  return { accepted: true, graded: true, correct, firstTry: correct };
}
export function validExploreRound(r) {
  const expected = makeExploreQuestions(r.kind, r.level, r.seed);
  return (
    r.tasks.every((q, i) => {
      const e = expected[i];
      if (
        !q ||
        Object.keys(e)
          .filter((k) => !["resolved", "firstTry", "rejected"].includes(k))
          .some((k) => JSON.stringify(q[k]) !== JSON.stringify(e[k])) ||
        typeof q.resolved !== "boolean" ||
        !Array.isArray(q.rejected)
      )
        return false;
      if ((i < r.index && !q.resolved) || (i > r.index && q.resolved))
        return false;
      return q.resolved
        ? (q.firstTry === true && q.rejected.length === 0) ||
            (q.firstTry === false &&
              q.rejected.length === 1 &&
              q.choices.includes(q.rejected[0]) &&
              q.rejected[0] !== q.answer)
        : q.firstTry === null && q.rejected.length === 0;
    }) &&
    (r.status === "finished") ===
      (r.index === EXPLORE_COUNT - 1 && r.tasks[EXPLORE_COUNT - 1].resolved)
  );
}
