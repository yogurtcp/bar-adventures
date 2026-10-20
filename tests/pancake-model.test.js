import test from "node:test";
import assert from "node:assert/strict";
import * as j from "../src/journey-model.js";
import * as p from "../src/pancake-model.js";
test("legacy café IDs stay stable; orders begin small with diverse customers and valid pairs", () => {
  assert.equal(j.stageFor("pancake", 1), 8);
  const animals = new Set();
  for (let level = 1; level <= 10; level++)
    for (let seed = 0; seed < 100; seed++) {
      const r = j.newRound(j.stageFor("pancake", level), seed);
      assert.equal(r.tasks.length, 5);
      assert.equal(new Set(r.tasks.map((q) => q.animal)).size, 5);
      for (const q of r.tasks) {
        animals.add(q.animal);
        assert.ok(q.target >= 3 && q.target <= 10);
        assert.equal(
          p.correctPair(q).reduce((n, x) => n + x.value, 0),
          q.target,
        );
        assert.equal(q.plates.length, level === 1 ? 3 : 4);
        if (level === 1) assert.ok(q.target <= 4);
      }
    }
  assert.equal(animals.size, 6);
});
test("first tap is tentative, same plate undoes, any valid pair in either order is accepted", () => {
  for (let level = 1; level <= 10; level++)
    for (let seed = 1; seed <= 20; seed++) {
      const base = j.newRound(j.stageFor("pancake", level), seed),
        q = base.tasks[0];
      for (const a of q.plates)
        for (const b of q.plates) {
          const r = structuredClone(base),
            s = j.freshSave();
          s.unlockedByKind.pancake = r.level;
          s.selected = r.stage;
          s.round = r;
          assert.equal(j.submit(r, a.id).graded, false);
          assert.equal(r.tasks[0].firstTry, null);
          assert.deepEqual(j.normalizeSave(s).round, r);
          const result = j.submit(r, b.id);
          if (a.id === b.id) {
            assert.equal(result.graded, false);
            assert.deepEqual(r.tasks[0].selected, []);
          } else {
            assert.equal(result.correct, a.value + b.value === q.target);
            assert.equal(j.submit(r, b.id).accepted, false);
          }
          assert.deepEqual(j.normalizeSave(s).round, r);
        }
    }
});
test("every café outcome saves, advances once, and needs four correct orders", () => {
  for (let level = 1; level <= 10; level++)
    for (let mask = 0; mask < 32; mask++) {
      const s = j.freshSave();
      s.unlockedByKind.pancake = level;
      s.selected = j.stageFor("pancake", level);
      s.round = j.newRound(s.selected, mask + 1);
      let count = 0;
      for (let i = 0; i < 5; i++) {
        s.round.index = i;
        const q = s.round.tasks[i],
          right = !!(mask & (1 << i));
        let pair = p.correctPair(q);
        if (!right) {
          outer: for (const a of q.plates)
            for (const b of q.plates)
              if (a.id !== b.id && a.value + b.value !== q.target) {
                pair = [a, b];
                break outer;
              }
        }
        j.submit(s.round, pair[0].id);
        assert.equal(j.submit(s.round, pair[1].id).correct, right);
        if (right) count++;
        assert.deepEqual(j.normalizeSave(structuredClone(s)).round, s.round);
      }
      assert.equal(j.wonRound(s.round), count >= 4);
      j.completeRound(s);
      j.completeRound(s);
      assert.equal(s.completed.length, count >= 4 ? 1 : 0);
      assert.equal(s.best[s.round.stage], count);
    }
});
test("v4 migration preserves every existing stage and exact active round, inserts no café completion", () => {
  const oldStages = j.LEGACY_STAGES.filter((s) => s.kind !== "pancake");
  for (let i = 0; i < oldStages.length; i++) {
    const info = oldStages[i],
      stage = j.stageFor(info.kind, info.level),
      r = j.newRound(stage, 93);
    j.submit(r, r.tasks[0].answer);
    r.stage = i + 1;
    const raw = {
      ...j.freshSave(),
      version: 4,
      unlocked: i + 1,
      selected: i + 1,
      completed: [1, 2],
      best: { 1: 8, 2: 10 },
      round: r,
    };
    const before = JSON.stringify(raw),
      next = j.migrateJourneySave(raw);
    assert.equal(JSON.stringify(raw), before);
    assert.equal(next.round.stage, stage);
    assert.deepEqual(next.round.tasks, r.tasks);
    assert.equal(next.selected, stage);
    assert.ok(next.completed.every((n) => j.stageInfo(n).kind !== "pancake"));
  }
  const s = j.migrateJourneySave({
    ...j.freshSave(),
    version: 4,
    unlocked: 34,
    selected: 34,
    completed: [34],
    best: { 34: 6 },
    round: null,
  });
  assert.equal(s.unlockedByKind.rocket, 10);
  assert.equal(s.unlockedByKind.pancake, 1);
  assert.equal(s.selected, 43);
  assert.deepEqual(s.completed, [43]);
});
test("tampered plates, duplicate selections, skipped orders and invented outcomes are rejected", () => {
  const s = j.freshSave();
  s.unlockedByKind.pancake = 1;
  s.selected = 8;
  s.round = j.newRound(8, 1);
  for (const mutate of [
    (r) => (r.tasks[0].plates[0].value = 99),
    (r) => (r.tasks[0].selected = ["p0", "p0"]),
    (r) => (r.tasks[0].selected = ["foreign"]),
    (r) => (r.tasks[1].selected = ["p0"]),
    (r) => (r.index = 2),
    (r) => (r.status = "finished"),
    (r) => (r.tasks[0].firstTry = true),
  ]) {
    const copy = structuredClone(s);
    mutate(copy.round);
    assert.equal(j.normalizeSave(copy).round, null);
  }
});
