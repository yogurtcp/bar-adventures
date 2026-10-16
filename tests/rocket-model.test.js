import test from "node:test";
import assert from "node:assert/strict";
import * as journey from "../src/journey-model.js";
import * as rocket from "../src/rocket-model.js";

test("six familiar stages precede rockets; every subsequent mission follows another race/food pair", () => {
  assert.equal(journey.STAGE_COUNT, 44);
  assert.deepEqual(
    journey.STAGES.slice(0, 6).map((s) => s.kind),
    ["race", "food", "race", "food", "race", "food"],
  );
  assert.equal(journey.stageFor("rocket", 1), 7);
  for (let level = 1; level <= 10; level++) {
    const stage = journey.stageFor("rocket", level);
    assert.equal(journey.stageInfo(stage - 1).kind, "food");
    assert.equal(journey.stageInfo(stage - 2).kind, "race");
    assert.equal(journey.stageInfo(stage).level, level);
  }
});
test("rocket difficulty begins independently with tiny addition; all missing-number equations and choices remain valid", () => {
  for (let level = 1; level <= 10; level++)
    for (let seed = 0; seed < 100; seed++) {
      const round = journey.newRound(journey.stageFor("rocket", level), seed);
      const difficulty = rocket.rocketDifficulty(level);
      for (const q of round.tasks) {
        assert.equal(q.answer, q[q.blank]);
        assert.equal(q.total, q.op === "+" ? q.a + q.b : q.a - q.b);
        assert.ok(
          [q.a, q.b, q.total, q.answer, ...q.choices].every(
            (n) => Number.isInteger(n) && n >= 0 && n <= difficulty.cap,
          ),
        );
        assert.equal(q.choices.length, difficulty.choices);
        assert.equal(new Set(q.choices).size, q.choices.length);
        assert.ok(q.choices.includes(q.answer));
        if (level <= 3) {
          assert.equal(q.op, "+");
          assert.equal(q.blank, "a");
          assert.equal(q.choices.length, 2);
        }
        if (level <= 2) assert.equal(q.b, 1);
        if (level <= 7) assert.equal(q.op, "+");
      }
      if (level === 1) {
        assert.equal(round.tasks[0].a, 1);
        assert.equal(round.tasks[0].b, 1);
        assert.equal(round.tasks[0].total, 2);
      }
    }
});
test("every flight stops immediately at six cells or three mistakes, survives reload, and awards progress once", () => {
  for (let level = 1; level <= 10; level++)
    for (let mask = 0; mask < 256; mask++) {
      const s = journey.freshSave();
      s.unlocked = journey.stageFor("rocket", level);
      s.selected = s.unlocked;
      s.round = journey.newRound(s.unlocked, mask + 1);
      let cells = 0,
        misses = 0;
      for (let i = 0; i < 8; i++) {
        s.round.index = i;
        const q = s.round.tasks[i],
          correct = !!(mask & (1 << i));
        const value = correct
          ? q.answer
          : q.choices.find((n) => n !== q.answer);
        assert.equal(journey.submit(s.round, value).correct, correct);
        assert.equal(journey.submit(s.round, value).accepted, false);
        if (correct) cells++;
        else misses++;
        assert.deepEqual(rocket.rocketProgress(s.round), {
          cells,
          mistakes: misses,
        });
        assert.deepEqual(
          journey.normalizeSave(JSON.parse(JSON.stringify(s))).round,
          s.round,
        );
        const terminal = cells === 6 || misses === 3;
        assert.equal(s.round.status === "finished", terminal);
        if (terminal) break;
      }
      assert.equal(journey.wonRound(s.round), cells === 6);
      const oldUnlock = s.unlocked;
      journey.completeRound(s);
      journey.completeRound(s);
      assert.equal(s.completed.length, cells === 6 ? 1 : 0);
      assert.equal(
        s.unlocked,
        cells === 6 ? Math.min(journey.STAGE_COUNT, oldUnlock + 1) : oldUnlock,
      );
      assert.equal(
        s.round.tasks.filter((q) => q.resolved).length,
        cells + misses,
      );
    }
});
test("v3 migration preserves exact unfinished races and meals, maps best results, and does not invent rocket completion", () => {
  for (let oldStage = 1; oldStage <= 24; oldStage++) {
    const kind = oldStage % 2 ? "race" : "food",
      level = Math.ceil(oldStage / 2),
      stage = journey.stageFor(kind, level);
    const r = journey.newRound(stage, 913);
    const q = r.tasks[0];
    journey.submit(
      r,
      q.choices.find((n) => n !== q.answer),
    );
    r.stage = oldStage;
    const old = {
      ...journey.freshSave(),
      version: 3,
      unlocked: oldStage,
      selected: oldStage,
      completed: [1, 2],
      best: { 1: 8, 2: 9 },
      round: r,
    };
    const original = JSON.stringify(old);
    const next = journey.migrateJourneySave(old);
    assert.equal(JSON.stringify(old), original);
    assert.equal(next.selected, stage);
    assert.equal(next.round.stage, stage);
    assert.deepEqual(next.round.tasks, r.tasks);
    assert.deepEqual(next.completed, [1, 2]);
    assert.deepEqual(next.best, { 1: 8, 2: 9 });
    assert.ok(
      next.completed.every((n) => journey.stageInfo(n).kind !== "rocket"),
    );
  }
});
test("tampered rocket saves and flights continuing after an outcome are rejected", () => {
  const s = journey.freshSave();
  s.unlocked = 7;
  s.selected = 7;
  s.round = journey.newRound(7, 8);
  const tampered = structuredClone(s);
  tampered.round.tasks[0].blank = "b";
  assert.equal(journey.normalizeSave(tampered).round, null);
  const skipped = structuredClone(s);
  skipped.round.index = 2;
  assert.equal(journey.normalizeSave(skipped).round, null);
  const early = structuredClone(s);
  early.round.status = "finished";
  assert.equal(journey.normalizeSave(early).round, null);
  for (let i = 0; i < 6; i++) {
    s.round.index = i;
    journey.submit(s.round, s.round.tasks[i].answer);
  }
  assert.equal(s.round.status, "finished");
  s.round.index = 6;
  s.round.status = "racing";
  journey.submit(s.round, s.round.tasks[6].answer);
  assert.equal(journey.normalizeSave(s).round, null);
});

test("a previously completed final food stage unlocks the newly added last rocket without a replay", () => {
  const old = {
    ...journey.freshSave(),
    version: 3,
    unlocked: 24,
    selected: 24,
    completed: Array.from({ length: 24 }, (_, i) => i + 1),
  };
  const next = journey.migrateJourneySave(old);
  assert.equal(next.unlocked, journey.stageFor("rocket", 10));
  assert.equal(next.selected, journey.stageFor("rocket", 10));
  assert.equal(next.completed.length, 24);
  assert.ok(!next.completed.includes(journey.stageFor("rocket", 10)));
});

test("completed legacy race levels unlock their inserted meal without marking it passed", () => {
  const save = journey.migrateRaceSave({
    version: 2,
    unlocked: 12,
    selected: 12,
    completed: [12],
    best: { 12: 8 },
  });
  assert.equal(save.unlocked, journey.stageFor("food", 12));
  assert.equal(save.selected, save.unlocked);
  assert.deepEqual(save.completed, [journey.stageFor("race", 12)]);
});
