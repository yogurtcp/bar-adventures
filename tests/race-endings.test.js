import { test } from "node:test";
import assert from "node:assert/strict";
import { ENDINGS, createEndingPicker } from "../src/race-endings.js";
import { seeded } from "../src/race-model.js";

test("six distinct endings per outcome play without repeats, even at a shuffle boundary", () => {
  for (const outcome of ["win", "lose"]) {
    const pick = createEndingPicker(seeded(418));
    const heard = Array.from({ length: 60 }, () => pick(outcome).id);
    for (let i = 0; i < heard.length; i += 6)
      assert.equal(new Set(heard.slice(i, i + 6)).size, 6);
    for (let i = 1; i < heard.length; i++)
      assert.notEqual(heard[i], heard[i - 1]);
  }
  const pick = createEndingPicker(seeded(551));
  const wins = [],
    losses = [];
  for (let i = 0; i < 6; i++) {
    wins.push(pick("win").id);
    losses.push(pick("lose").id);
  }
  assert.equal(new Set(wins).size, 6);
  assert.equal(new Set(losses).size, 6);
});
test("all twelve scores are different and finish comfortably before the victory screen returns", () => {
  const all = Object.values(ENDINGS).flat();
  assert.equal(all.length, 12);
  assert.equal(new Set(all.map((e) => e.id)).size, 12);
  assert.equal(new Set(all.map((e) => JSON.stringify(e.events))).size, 12);
  for (const ending of all) {
    const duration = Math.max(
      ...ending.events.map((e) => e.start + e.duration),
    );
    assert.ok(duration > 0.8 && duration < 2.5, ending.id);
    for (const e of ending.events) {
      assert.ok(
        e.start >= 0 && e.duration > 0.05 && e.note >= 30 && e.note <= 96,
      );
      assert.ok(e.level > 0 && e.level <= 0.2);
      assert.ok(e.slide === undefined || e.slide >= 30);
    }
  }
});
