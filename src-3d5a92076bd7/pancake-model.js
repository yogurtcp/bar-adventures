import { seeded } from "./race-model.js";
export const PANCAKE_GOAL = 4;
export const ANIMALS = ["bunny", "fox", "panda", "cat", "dog", "penguin"];
const shuffle = (list, random) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export function makePancakeQuestions(level, seed) {
  const random = seeded(Math.imul(seed ^ 0xcafe, 0x9e3779b1)),
    animals = shuffle(ANIMALS, random);
  return Array.from({ length: 5 }, (_, index) => {
    const cap = Math.min(10, level + 3);
    const target =
      level === 1 ? (index % 2 ? 4 : 3) : 3 + Math.floor(random() * (cap - 2));
    const values =
      level === 1
        ? target === 3
          ? [1, 2, 1]
          : [2, 2, 1]
        : target === 3
          ? [1, 2, 1, 3]
          : target === 4
            ? [1, 3, 2, 2]
            : [1, target - 1, 2, target - 2];
    return {
      id: `${seed}-cafe-${index}`,
      target,
      animal: animals[index],
      plates: shuffle(values, random).map((value, i) => ({
        id: `p${i}`,
        value,
      })),
      selected: [],
      rejected: [],
      firstTry: null,
      resolved: false,
      assisted: false,
    };
  });
}
export const pancakeScore = (round) =>
  round.tasks.filter((q) => q.firstTry === true).length;
export function correctPair(q) {
  for (let i = 0; i < q.plates.length; i++)
    for (let j = i + 1; j < q.plates.length; j++)
      if (q.plates[i].value + q.plates[j].value === q.target)
        return [q.plates[i], q.plates[j]];
  return [];
}
export function submitPancake(round, id) {
  const q = round.tasks[round.index];
  if (
    round.status === "finished" ||
    !q ||
    q.resolved ||
    !q.plates.some((p) => p.id === id)
  )
    return { accepted: false };
  if (q.selected.includes(id)) {
    q.selected = [];
    return { accepted: true, graded: false };
  }
  q.selected.push(id);
  if (q.selected.length === 1) return { accepted: true, graded: false };
  const correct =
    q.selected.reduce(
      (n, id) => n + q.plates.find((p) => p.id === id).value,
      0,
    ) === q.target;
  q.firstTry = correct;
  q.resolved = true;
  if (round.index === 4) round.status = "finished";
  return { accepted: true, graded: true, correct, firstTry: correct };
}
export function validPancakeRound(r) {
  const expected = makePancakeQuestions(r.level, r.seed);
  return (
    r.tasks.every((q, i) => {
      const e = expected[i];
      if (
        !q ||
        ["id", "target", "animal"].some((k) => q[k] !== e[k]) ||
        JSON.stringify(q.plates) !== JSON.stringify(e.plates) ||
        !Array.isArray(q.selected) ||
        new Set(q.selected).size !== q.selected.length ||
        q.selected.some((id) => !q.plates.some((p) => p.id === id)) ||
        q.assisted !== false ||
        !Array.isArray(q.rejected) ||
        q.rejected.length ||
        typeof q.resolved !== "boolean"
      )
        return false;
      if (
        (i < r.index && !q.resolved) ||
        (i > r.index && (q.resolved || q.selected.length))
      )
        return false;
      if (!q.resolved) return q.firstTry === null && q.selected.length <= 1;
      return (
        q.selected.length === 2 &&
        q.firstTry ===
          (q.selected.reduce(
            (n, id) => n + q.plates.find((p) => p.id === id).value,
            0,
          ) ===
            q.target)
      );
    }) && (r.status === "finished") === (r.index === 4 && r.tasks[4].resolved)
  );
}
