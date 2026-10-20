import test from "node:test";
import assert from "node:assert/strict";
import * as journey from "../src/journey-model.js";
import * as race from "../src/race-model.js";

test("the familiar race and food stages keep their independent difficulty after rocket insertion", () => {
  for (let stage = 1; stage <= journey.STAGE_COUNT; stage++) {
    const info = journey.stageInfo(stage);
    if (!["race", "food"].includes(info.kind)) continue;
    for (let seed = 1; seed <= 40; seed++) {
      const r = journey.newRound(stage, seed),
        original = race.newRound(info.level, seed);
      if (info.kind === "race") assert.deepEqual(r.tasks, original.tasks);
      else
        for (const q of r.tasks) {
          const cap = info.level <= 3 ? 5 : 10;
          assert.equal(q.answer, q.a - q.b);
          assert.ok(q.a >= q.b && q.a <= cap && q.b >= 0);
          assert.equal(new Set(q.choices).size, q.choices.length);
          assert.ok(q.choices.includes(q.answer));
          assert.ok(q.choices.every((n) => n >= 0 && n <= cap));
        }
    }
  }
});
test("double sweets affect the outcome; every food history has consistent energy, completion, and saves", () => {
  for (const stage of journey.STAGES.flatMap((s, i) =>
    s.kind === "food" ? [i + 1] : [],
  ))
    for (let history = 0; history < 256; history++) {
      const s = journey.freshSave();
      s.unlockedByKind[journey.stageInfo(stage).kind] =
        journey.stageInfo(stage).level;
      s.selected = stage;
      s.round = journey.newRound(stage, 445);
      let points = 0,
        misses = 0;
      for (let i = 0; i < 8; i++) {
        s.round.index = i;
        const q = s.round.tasks[i],
          meal = journey.mealFor(s.round);
        assert.equal(meal.bonus, i === 2 || i === 6);
        const correct = !!(history & (1 << i));
        const value = correct
          ? q.answer
          : q.choices.find((n) => n !== q.answer);
        assert.equal(journey.submit(s.round, value).correct, correct);
        assert.equal(journey.submit(s.round, value).accepted, false);
        if (correct) points += meal.value;
        else misses++;
        const progress = journey.foodProgress(s.round);
        assert.equal(progress.points, points);
        assert.equal(
          progress.energy,
          Math.max(0, Math.min(10, 3 + points - misses)),
        );
        assert.equal(progress.collected.length, points);
        assert.deepEqual(
          journey.normalizeSave(JSON.parse(JSON.stringify(s))).round,
          s.round,
        );
      }
      assert.equal(journey.wonRound(s.round), points >= 7);
      journey.completeRound(s);
      journey.completeRound(s);
      assert.equal(s.completed.includes(stage), points >= 7);
      assert.equal(s.completed.length, points >= 7 ? 1 : 0);
      assert.equal(
        s.unlockedByKind.food,
        Math.min(12, journey.stageInfo(stage).level + (points >= 7 ? 1 : 0)),
      );
      if (points >= 7) assert.ok(journey.foodProgress(s.round).energy >= 7);
    }
  const r = journey.newRound(2, 4);
  assert.notEqual(journey.mealFor(r, 2).item, journey.mealFor(r, 6).item);
});
test("race migration preserves exact unfinished work and earned results at the new odd-numbered stages", () => {
  const old = race.freshSave();
  old.unlocked = 4;
  old.selected = 3;
  old.completed = [1, 2];
  old.best = { 1: 8, 2: 6 };
  old.round = race.newRound(3, 1);
  const q = old.round.tasks[0];
  race.submit(
    old.round,
    q.choices.find((n) => n !== q.answer),
  );
  const before = JSON.stringify(old);
  const save = journey.migrateRaceSave(old);
  assert.equal(JSON.stringify(old), before);
  assert.equal(save.unlockedByKind.race, 4);
  assert.equal(save.selected, 5);
  assert.deepEqual(save.completed, [1, 3]);
  assert.deepEqual(save.best, { 1: 8, 3: 6 });
  assert.deepEqual(save.round.tasks, old.round.tasks);
  assert.equal(save.round.stage, 5);
  assert.equal(save.round.kind, "race");
  assert.deepEqual(journey.normalizeSave(save), save);
});
test("malformed food saves are rejected; debug access and completed replays preserve earned progress", () => {
  const s = journey.freshSave();
  const stage = journey.stageFor("food", 9);
  s.selected = stage;
  s.round = journey.newRound(stage, 12);
  assert.equal(journey.normalizeSave(s).round, null);
  assert.equal(
    journey.normalizeSave(s, { unlockAllLevels: true }).round.stage,
    stage,
  );
  s.unlockedByKind[journey.stageInfo(stage).kind] =
    journey.stageInfo(stage).level;
  const changed = structuredClone(s);
  changed.round.tasks[0].answer = 99;
  assert.equal(journey.normalizeSave(changed).round, null);
  const skipped = structuredClone(s);
  skipped.round.index = 2;
  assert.equal(journey.normalizeSave(skipped).round, null);
  s.completed = [stage];
  s.best[stage] = 10;
  for (let i = 0; i < 8; i++) {
    s.round.index = i;
    const q = s.round.tasks[i];
    journey.submit(
      s.round,
      q.choices.find((n) => n !== q.answer),
    );
  }
  journey.completeRound(s);
  assert.deepEqual(s.completed, [stage]);
  assert.equal(s.best[stage], 10);
});
