import test from "node:test";
import assert from "node:assert/strict";
import * as j from "../src/journey-model.js";
import * as e from "../src/explore-model.js";
import { correctPair } from "../src/pancake-model.js";
function finish(s, kind, level = 1) {
  s.unlockedByKind[kind] = level;
  s.round = j.newRound(j.stageFor(kind, level), 184);
  s.selected = s.round.stage;
  for (let i = 0; i < s.round.tasks.length; i++) {
    if (s.round.status === "finished") break;
    s.round.index = i;
    const q = s.round.tasks[i];
    if (kind === "pancake")
      for (const p of correctPair(q)) j.submit(s.round, p.id);
    else j.submit(s.round, q.answer);
  }
  j.completeRound(s);
}
test("every game opens at level one; winning advances only that same path, including replay and final level", () => {
  for (const game of j.GAME_TYPES) {
    const s = j.freshSave();
    assert.equal(s.cafeStyle, "waffle");
    for (const g of j.GAME_TYPES) {
      assert.ok(j.isStageUnlocked(s, j.stageFor(g.kind, 1)));
      assert.equal(j.isStageUnlocked(s, j.stageFor(g.kind, 2)), false);
    }
    finish(s, game.kind);
    assert.equal(s.unlockedByKind[game.kind], 2);
    assert.equal(s.selected, j.stageFor(game.kind, 2));
    j.completeRound(s);
    assert.equal(s.completed.length, 1);
    for (const g of j.GAME_TYPES)
      if (g !== game) assert.equal(s.unlockedByKind[g.kind], 1);
    finish(s, game.kind, 1);
    assert.equal(s.unlockedByKind[game.kind], 2);
    finish(s, game.kind, game.levels);
    assert.equal(s.selected, j.stageFor(game.kind, game.levels));
    assert.equal(s.unlockedByKind[game.kind], game.levels);
  }
});
test("fishing counts and balloon comparisons start tiny, remain exact, and introduce equality gradually", () => {
  for (const kind of ["fishing", "balloon"])
    for (let level = 1; level <= 10; level++)
      for (let seed = 0; seed < 100; seed++) {
        const r = j.newRound(j.stageFor(kind, level), seed);
        assert.equal(r.tasks.length, 6);
        for (const q of r.tasks) {
          assert.equal(new Set(q.choices).size, q.choices.length);
          assert.ok(q.choices.includes(q.answer));
          if (kind === "fishing") {
            assert.ok(q.answer >= 1 && q.answer <= 10);
            assert.ok(q.choices.every((n) => n >= 1 && n <= 10));
            assert.equal(q.choices.length, level <= 2 ? 2 : level <= 6 ? 3 : 4);
            if (level === 1) assert.ok(q.answer <= 3);
          } else {
            assert.equal(q.answer, q.a > q.b ? ">" : q.a < q.b ? "<" : "=");
            assert.ok(q.a >= 1 && q.a <= 10 && q.b >= 1 && q.b <= 10);
            if (level <= 2) {
              assert.notEqual(q.a, q.b);
              assert.equal(q.choices.includes("="), false);
            }
            if (level === 1) assert.ok(q.a <= 3 && q.b <= 3);
          }
        }
      }
});
test("every new game answer history survives reload, ends after six, and needs four successes", () => {
  for (const kind of ["fishing", "balloon"])
    for (let level = 1; level <= 10; level++)
      for (let mask = 0; mask < 64; mask++) {
        const s = j.freshSave();
        s.unlockedByKind[kind] = level;
        s.selected = j.stageFor(kind, level);
        s.round = j.newRound(s.selected, mask + 1);
        let points = 0;
        for (let i = 0; i < 6; i++) {
          s.round.index = i;
          const q = s.round.tasks[i],
            correct = !!(mask & (1 << i)),
            answer = correct ? q.answer : q.choices.find((n) => n !== q.answer);
          assert.equal(j.submit(s.round, answer).correct, correct);
          assert.equal(j.submit(s.round, answer).accepted, false);
          if (correct) points++;
          assert.deepEqual(j.normalizeSave(structuredClone(s)).round, s.round);
        }
        assert.equal(s.round.status, "finished");
        assert.equal(e.exploreScore(s.round), points);
        assert.equal(j.wonRound(s.round), points >= 4);
        j.completeRound(s);
        j.completeRound(s);
        assert.equal(s.completed.length, points >= 4 ? 1 : 0);
        assert.equal(
          s.unlockedByKind[kind],
          Math.min(10, level + (points >= 4 ? 1 : 0)),
        );
      }
});
test("v5 migration preserves all existing IDs, exact unfinished questions, scores and earned access", () => {
  for (let stage = 1; stage <= 44; stage++) {
    const s = j.freshSave();
    s.version = 5;
    s.unlocked = stage;
    s.selected = stage;
    s.completed = [1, 2];
    s.best = { 1: 8, 2: 9 };
    s.round = j.newRound(stage, 91);
    const q = s.round.tasks[0];
    if (s.round.kind === "pancake") j.submit(s.round, q.plates[0].id);
    else
      j.submit(
        s.round,
        q.choices.find((n) => n !== q.answer),
      );
    delete s.unlockedByKind;
    const before = JSON.stringify(s),
      m = j.migrateJourneySave(s);
    assert.equal(JSON.stringify(s), before);
    assert.equal(m.version, 6);
    assert.equal(m.selected, stage);
    assert.deepEqual(m.round, s.round);
    assert.deepEqual(m.completed, [1, 2]);
    assert.deepEqual(m.best, { 1: 8, 2: 9 });
    assert.equal(m.unlockedByKind.fishing, 1);
    assert.equal(m.unlockedByKind.balloon, 1);
    assert.ok(j.isStageUnlocked(m, stage));
    assert.deepEqual(j.normalizeSave(m), m);
  }
});
test("cross-path tampering cannot unlock or resume locked levels; malformed new questions are rejected", () => {
  const s = j.freshSave();
  s.unlocked = 64;
  s.selected = j.stageFor("balloon", 8);
  s.round = j.newRound(s.selected, 18);
  assert.equal(j.normalizeSave(s).round, null);
  assert.equal(j.normalizeSave(s).unlockedByKind.balloon, 1);
  for (const kind of ["fishing", "balloon"]) {
    const a = j.freshSave();
    a.selected = j.stageFor(kind, 1);
    a.round = j.newRound(a.selected, 18);
    for (const change of [
      (r) => (r.tasks[0].answer = "wrong"),
      (r) => (r.index = 2),
      (r) => (r.status = "finished"),
      (r) => (r.tasks[1].resolved = true),
      (r) => (r.tasks[0].rejected = [null]),
    ]) {
      const b = structuredClone(a);
      change(b.round);
      assert.equal(j.normalizeSave(b).round, null);
    }
  }
});
