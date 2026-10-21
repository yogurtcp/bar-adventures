import { seeded } from "./race-model.js";
import { ANIMALS } from "./pancake-model.js";
export const ICECREAM_GOAL = 4;
export const FLAVORS = ["strawberry", "vanilla", "chocolate", "mint"];
export function makeIcecreamQuestions(level, seed) {
  const random = seeded(Math.imul(seed ^ 0x1cec, 0x9e3779b1));
  const choices = FLAVORS.slice(0, level <= 2 ? 2 : level <= 5 ? 3 : 4);
  return Array.from({ length: 5 }, (_, i) => {
    const length =
      level === 1 ? (i < 2 ? 1 : 2) : level <= 3 ? 2 : level <= 7 ? 3 : 4;
    const recipe = Array.from(
      { length },
      () => choices[Math.floor(random() * choices.length)],
    );
    // The first two orders teach each flavor before introducing a stack.
    if (level === 1 && i < 2) recipe[0] = choices[i];
    return {
      id: `${seed}-ice-${i}`,
      animal: ANIMALS[(seed + i) % ANIMALS.length],
      recipe,
      choices: [...choices],
      selected: [],
      resolved: false,
      firstTry: null,
      assisted: false,
      rejected: [],
    };
  });
}
export const icecreamScore = (r) =>
  r.tasks.filter((q) => q.firstTry === true).length;
export function submitIcecream(r, value) {
  const q = r.tasks[r.index];
  if (r.status === "finished" || !q || q.resolved) return { accepted: false };
  if (value === "undo") {
    if (!q.selected.length) return { accepted: false };
    q.selected.pop();
    return { accepted: true, graded: false };
  }
  if (!q.choices.includes(value)) return { accepted: false };
  q.selected.push(value);
  if (q.selected.length < q.recipe.length)
    return { accepted: true, graded: false };
  const correct = q.selected.every((flavor, i) => flavor === q.recipe[i]);
  q.resolved = true;
  q.firstTry = correct;
  if (r.index === 4) r.status = "finished";
  return { accepted: true, graded: true, correct, firstTry: correct };
}
export function validIcecreamRound(r) {
  const expected = makeIcecreamQuestions(r.level, r.seed);
  return (
    r.tasks.every((q, i) => {
      const e = expected[i];
      if (
        !q ||
        ["id", "animal", "recipe", "choices", "assisted", "rejected"].some(
          (k) => JSON.stringify(q[k]) !== JSON.stringify(e[k]),
        ) ||
        !Array.isArray(q.selected) ||
        q.selected.length > q.recipe.length ||
        q.selected.some((f) => !q.choices.includes(f)) ||
        typeof q.resolved !== "boolean"
      )
        return false;
      if (
        (i < r.index && !q.resolved) ||
        (i > r.index && (q.resolved || q.selected.length))
      )
        return false;
      return q.resolved
        ? q.selected.length === q.recipe.length &&
            q.firstTry === q.selected.every((f, n) => f === q.recipe[n])
        : q.firstTry === null && q.selected.length < q.recipe.length;
    }) && (r.status === "finished") === (r.index === 4 && r.tasks[4].resolved)
  );
}
