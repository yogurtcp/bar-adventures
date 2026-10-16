import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeQuestions,
  newRound,
  positions,
  standings,
  score,
  submit,
  normalizeSave,
  freshSave,
  completeRound,
} from "../src/race-model.js";

test("all 256 answer histories finish in an order that matches the six-of-eight rule, for every rival rotation", () => {
  for (let level = 1; level <= 12; level++)
    for (let mask = 0; mask < 256; mask++) {
      const r = newRound(level, mask + 1);
      for (let i = 0; i < 8; i++) {
        r.index = i;
        const q = r.tasks[i];
        if (!(mask & (1 << i)))
          submit(
            r,
            q.choices.find((n) => n !== q.answer),
          );
        submit(r, q.answer);
      }
      assert.equal(r.status, "finished");
      assert.equal(
        standings(r)[0].id === "bar",
        score(r) >= 6,
        `level ${level}, mask ${mask}`,
      );
      assert.ok(Object.values(positions(r)).every((n) => n >= 0 && n < 100));
      const s = freshSave();
      s.round = r;
      completeRound(s);
      completeRound(s);
      assert.equal(s.completed.includes(level), score(r) >= 6);
      assert.equal(
        new Set(s.completed).size,
        s.completed.length,
        "completion is idempotent",
      );
    }
});
test("questions stay within the promised range, offer a unique correct answer, and vary", () => {
  for (let level = 1; level <= 12; level++)
    for (let seed = 1; seed <= 120; seed++) {
      const tasks = makeQuestions(level, seed),
        cap = level <= 3 ? 5 : 10;
      assert.equal(tasks.length, 8);
      assert.ok(new Set(tasks.map((q) => `${q.a}+${q.b}`)).size >= 7);
      for (const q of tasks) {
        assert.ok(q.a >= 0 && q.b >= 0 && q.answer <= cap);
        assert.equal(q.a + q.b, q.answer);
        assert.ok(q.choices.includes(q.answer));
        assert.equal(new Set(q.choices).size, q.choices.length);
        assert.ok(q.choices.every((n) => n >= 0 && n <= cap));
        assert.equal(q.choices.length, level <= 3 ? 2 : level <= 6 ? 3 : 4);
      }
    }
});
test("a retry cannot turn a miss into a first-try success or award a second boost", () => {
  const r = newRound(4, 123),
    q = r.tasks[0],
    bad = q.choices.find((n) => n !== q.answer);
  submit(r, bad);
  const afterWrong = positions(r);
  assert.ok(afterWrong.bunny > afterWrong.bar);
  assert.equal(q.firstTry, false);
  assert.equal(submit(r, bad).accepted, false);
  assert.deepEqual(positions(r), afterWrong);
  submit(r, q.answer);
  const afterRetry = positions(r);
  assert.ok(afterRetry.bar > afterWrong.bar);
  assert.equal(score(r), 0);
  assert.equal(q.firstTry, false);
  assert.equal(submit(r, q.answer).accepted, false);
  assert.deepEqual(positions(r), afterRetry);
});
test("save round-trips preserve rejected choices, the exact question, and earned progress", () => {
  const s = freshSave();
  s.unlocked = 4;
  s.selected = 4;
  s.round = newRound(4, 887);
  s.completed = [1, 2, 3];
  const q = s.round.tasks[0];
  submit(
    s.round,
    q.choices.find((n) => n !== q.answer),
  );
  const restored = normalizeSave(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored, s);
  assert.deepEqual(positions(restored.round), positions(s.round));
  submit(restored.round, q.answer);
  assert.equal(score(restored.round), 0);
});
test("invalid or malformed saves recover to usable progress", () => {
  for (const value of [
    null,
    {},
    "bad",
    [],
    { version: 2, unlocked: NaN, round: {} },
    { version: 2, unlocked: 99, completed: [-1, 50, "a"] },
  ])
    assert.doesNotThrow(() => normalizeSave(value));
  const s = freshSave();
  s.round = newRound(1, 22);
  s.round.tasks[0].answer = 99;
  assert.equal(normalizeSave(s).round, null);
});
test("replaying a level unsuccessfully does not erase a win or relock levels", () => {
  const s = freshSave();
  s.unlocked = 4;
  s.completed = [1, 2, 3];
  s.best = { 3: 8 };
  s.round = newRound(3, 20);
  for (let i = 0; i < 8; i++) {
    s.round.index = i;
    const q = s.round.tasks[i];
    submit(
      s.round,
      q.choices.find((n) => n !== q.answer),
    );
    submit(s.round, q.answer);
  }
  completeRound(s);
  assert.equal(s.unlocked, 4);
  assert.equal(s.best[3], 8);
  assert.ok(s.completed.includes(3));
});

test("temporary debug access resumes any stage without changing earned unlocks", () => {
  const s = freshSave();
  s.selected = 12;
  s.round = newRound(12, 551);
  const q = s.round.tasks[0];
  submit(
    s.round,
    q.choices.find((n) => n !== q.answer),
  );
  const debug = normalizeSave(s, { unlockAllLevels: true });
  assert.equal(debug.unlocked, 1);
  assert.deepEqual(debug.completed, []);
  assert.equal(debug.selected, 12);
  assert.deepEqual(debug.round, s.round);
  const normal = normalizeSave(s);
  assert.equal(normal.selected, 1);
  assert.equal(normal.round, null);
  s.selected = 13;
  s.round = newRound(13, 554);
  const invalid = normalizeSave(s, { unlockAllLevels: true });
  assert.equal(invalid.round, null);
  assert.equal(invalid.selected, 1);
});
