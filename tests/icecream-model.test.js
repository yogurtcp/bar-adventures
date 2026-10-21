import test from "node:test";
import assert from "node:assert/strict";
import * as j from "../src/journey-model.js";
import { makeIcecreamQuestions, icecreamScore } from "../src/icecream-model.js";
function save(level = 1, seed = 184) {
  const s = j.freshSave();
  s.selected = j.stageFor("icecream", level);
  s.unlockedByKind.icecream = level;
  s.round = j.newRound(s.selected, seed);
  return s;
}
test("ice cream recipes introduce single scoops before stacks, with bounded gradual flavor choices", () => {
  for (let level = 1; level <= 10; level++)
    for (let seed = 0; seed < 100; seed++) {
      const tasks = makeIcecreamQuestions(level, seed);
      assert.deepEqual(tasks, makeIcecreamQuestions(level, seed));
      assert.equal(tasks.length, 5);
      for (const [i, q] of tasks.entries()) {
        assert.ok(q.recipe.every((f) => q.choices.includes(f)));
        assert.equal(q.choices.length, level <= 2 ? 2 : level <= 5 ? 3 : 4);
        assert.equal(
          q.recipe.length,
          level === 1 ? (i < 2 ? 1 : 2) : level <= 3 ? 2 : level <= 7 ? 3 : 4,
        );
      }
    }
});
test("stacking persists partial cones, supports undo including repeated scoops, and grades only complete orders", () => {
  const s = save(10),
    q = s.round.tasks[0];
  assert.equal(j.submit(s.round, "undo").accepted, false);
  assert.equal(j.submit(s.round, "bad").accepted, false);
  for (let i = 0; i < q.recipe.length - 1; i++) {
    const result = j.submit(s.round, q.recipe[i]);
    assert.equal(result.graded, false);
    assert.equal(q.firstTry, null);
    assert.deepEqual(j.normalizeSave(structuredClone(s)), s);
  }
  assert.equal(j.submit(s.round, "undo").graded, false);
  assert.equal(q.selected.length, 2);
  j.submit(s.round, q.recipe[2]);
  assert.equal(j.submit(s.round, q.recipe[3]).correct, true);
  assert.equal(j.submit(s.round, "undo").accepted, false);
  assert.equal(j.submit(s.round, q.recipe[3]).accepted, false);
  assert.equal(icecreamScore(s.round), 1);
  assert.deepEqual(j.normalizeSave(structuredClone(s)), s);
});
test("all ice cream outcome histories finish after five orders, preserve reload, and unlock only their own path at four successes", () => {
  for (let level = 1; level <= 10; level++)
    for (let mask = 0; mask < 32; mask++) {
      const s = save(level, mask + 1);
      let points = 0;
      for (let i = 0; i < 5; i++) {
        s.round.index = i;
        const q = s.round.tasks[i],
          correct = !!(mask & (1 << i));
        const input = [...q.recipe];
        if (!correct) input[0] = q.choices.find((f) => f !== input[0]);
        let result;
        for (const f of input) {
          result = j.submit(s.round, f);
          assert.deepEqual(j.normalizeSave(structuredClone(s)).round, s.round);
        }
        assert.equal(result.correct, correct);
        if (correct) points++;
        assert.equal(j.submit(s.round, input[0]).accepted, false);
      }
      assert.equal(s.round.status, "finished");
      assert.equal(icecreamScore(s.round), points);
      assert.equal(j.wonRound(s.round), points >= 4);
      j.completeRound(s);
      j.completeRound(s);
      assert.equal(s.completed.length, points >= 4 ? 1 : 0);
      assert.equal(
        s.unlockedByKind.icecream,
        Math.min(10, level + (points >= 4 ? 1 : 0)),
      );
      for (const g of j.GAME_TYPES.filter((g) => g.kind !== "icecream"))
        assert.equal(s.unlockedByKind[g.kind], 1);
      assert.deepEqual(j.normalizeSave(structuredClone(s)), s);
    }
});
test("old v6 progress and all 64 stage IDs stay intact; ice cream defaults open at one", () => {
  assert.equal(j.stageFor("icecream", 1), 65);
  assert.equal(j.STAGE_COUNT, 74);
  for (let stage = 1; stage <= 64; stage++) {
    const s = j.freshSave(),
      info = j.stageInfo(stage);
    s.selected = stage;
    s.unlockedByKind[info.kind] = info.level;
    s.round = j.newRound(stage, 18);
    s.completed = [1, 2];
    s.best = { 1: 8, 2: 9 };
    delete s.unlockedByKind.icecream;
    delete s.taughtIcecream;
    const before = JSON.stringify(s),
      normalized = j.normalizeSave(s);
    assert.equal(JSON.stringify(s), before);
    assert.equal(normalized.selected, stage);
    assert.deepEqual(normalized.round, s.round);
    assert.deepEqual(normalized.completed, [1, 2]);
    assert.deepEqual(normalized.best, { 1: 8, 2: 9 });
    assert.equal(normalized.unlockedByKind.icecream, 1);
    assert.equal(normalized.taughtIcecream, false);
  }
});
test("invalid recipes, future inputs, dishonest grades and locked ice cream rounds cannot resume", () => {
  for (const change of [
    (r) => r.tasks[0].recipe.reverse(),
    (r) => r.tasks[0].choices.push("frog"),
    (r) => r.tasks[1].selected.push("vanilla"),
    (r) => r.tasks[0].selected.push("fake"),
    (r) => (r.tasks[0].firstTry = true),
    (r) => (r.status = "finished"),
    (r) => (r.index = 2),
  ]) {
    const s = save(10, 20);
    change(s.round);
    assert.equal(j.normalizeSave(s).round, null);
  }
  const s = save(3);
  s.unlockedByKind.icecream = 1;
  assert.equal(j.normalizeSave(s).round, null);
});
