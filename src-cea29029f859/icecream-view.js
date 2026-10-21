import { icon } from "./race-art.js";
import { animalButton } from "./animal-view.js";
import { ICECREAM_GOAL, icecreamScore } from "./icecream-model.js";
export const ICECREAM_ASSET = new URL(
  "../assets/icecream-v1/bar.png",
  import.meta.url,
).href;
export const icecreamSprite = (mood = "ready", cls = "") =>
  `<span class="ice-bar mood-${mood} ${cls}" style="--ice-image:url('${ICECREAM_ASSET}')" role="img" aria-label="Bar the ice cream maker, ${mood}"></span>`;
export const scoop = (flavor, cls = "") =>
  `<span class="ice-scoop flavor-${flavor} ${cls}" role="img" aria-label="${flavor} scoop"><i></i><i></i><i></i><i></i><i></i></span>`;
// Recipes and selections are both stored bottom-to-top. Geometry shares that order.
export function cone(
  flavors,
  slots = flavors.length,
  numbered = false,
  cls = "",
) {
  return `<span class="ice-cone ${cls}" style="--scoops:${slots}" role="img" aria-label="Cone: ${flavors.length ? flavors.join(", then ") : "empty"}, bottom to top"><span class="ice-wafer"></span>${Array.from({ length: slots }, (_, i) => `<span class="ice-layer ${flavors[i] ? "filled" : "empty"} ${i === flavors.length - 1 ? "latest" : ""}" style="--layer:${i}">${flavors[i] ? scoop(flavors[i]) : '<span class="ice-outline"></span>'}${numbered ? `<b class="ice-step">${i + 1}</b>` : ""}</span>`).join("")}</span>`;
}
export function icecreamScene(round, feedback = "", finale = false) {
  const q = round.tasks[round.index],
    points = icecreamScore(round),
    won = points >= ICECREAM_GOAL;
  const mood = finale
    ? won
      ? "happy"
      : "ready"
    : feedback === "correct"
      ? "happy"
      : feedback === "wrong"
        ? "surprised"
        : "ready";
  return `<section class="ice-stage ${feedback ? "ice-" + feedback : ""} ${finale ? "ice-finale" : ""}" aria-label="Ice cream shop, ${points} happy customers">
  <div class="ice-window" aria-hidden="true"><i></i><i></i><i></i></div><div class="ice-awning" aria-hidden="true"></div><div class="ice-counter" aria-hidden="true"><span></span></div>
  <div class="ice-shopkeeper">${icecreamSprite(mood)}</div>
  ${
    !finale
      ? `<div class="ice-order" aria-label="Customer's order; build from scoop one at the bottom">${cone(q.recipe, q.recipe.length, true)}${q.resolved ? `<span class="ice-order-verdict">${icon(q.firstTry ? "check" : "replay")}</span>` : ""}</div>
  <div class="ice-workspace ${q.selected.length ? "has-scoops" : ""}" aria-label="Your cone">${cone(q.selected, q.recipe.length, true)}<span class="ice-cone-stand"></span></div>
  ${animalButton(q.animal, "ice-customer", mood)}${feedback === "correct" ? `<div class="ice-delivery" aria-hidden="true">${cone(q.selected)}</div><div class="ice-sparkles" aria-hidden="true">✦<i>✦</i><b>✦</b></div>` : ""}`
      : `<div class="ice-party">${["bunny", "fox", "penguin"].map((id) => `<div>${animalButton(id, "", won ? "happy" : "ready")}${won ? cone(["strawberry", "vanilla"]) : ""}</div>`).join("")}</div>`
  }
  <div class="ice-goal" aria-label="${points} of four happy customers">${icon("trophy")}${Array.from({ length: 4 }, (_, i) => `<span class="${i < points ? "earned" : ""}">${icon("star")}</span>`).join("")}</div>
  ${feedback && !finale ? `<div class="ice-portrait" aria-hidden="true">${icecreamSprite(mood)}</div>` : ""}
  </section>`;
}
export function icecreamQuestion(round, feedback, locked) {
  const q = round.tasks[round.index],
    disabled = locked || q.resolved ? "disabled" : "";
  return `<section class="ice-dock" aria-label="Choose scoops in the same order as the customer's cone, bottom first">
  <div class="ice-build-guide" aria-hidden="true">${cone(q.recipe)}${icon("next")}${cone(q.selected, q.recipe.length)}</div>
  <div class="ice-flavors">${q.choices.map((flavor) => `<button type="button" class="ice-flavor" data-icecream="${flavor}" aria-label="Add ${flavor} scoop" ${disabled}>${scoop(flavor)}<span class="ice-tub"></span></button>`).join("")}</div>
  <button type="button" class="ice-undo" data-icecream="undo" aria-label="Undo last scoop" ${disabled || !q.selected.length ? "disabled" : ""}>${icon("replay")}</button>
  ${feedback === "wrong" ? `<div class="ice-correction" aria-label="Matching cone, bottom first">${cone(q.recipe, q.recipe.length, true)}${icon("check")}</div>` : ""}
  </section>`;
}
export function icecreamTutorial(step) {
  return `<div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="Copy the customer's cone, starting at the bottom"><div class="tutorial-card ice-example step-${step}"><div class="ice-example-cones">${cone(["strawberry", "vanilla"], 2, true)}${icon("next")}${cone(step >= 3 ? ["strawberry", "vanilla"] : step >= 2 ? ["strawberry"] : [], 2, true)}</div><div class="ice-example-flavors"><span>${scoop("strawberry")}${step === 1 || step === 2 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span><span>${scoop("vanilla")}${step >= 3 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span></div><div class="ice-demo-bar">${icecreamSprite(step >= 3 ? "happy" : "ready")}</div><button class="demo-continue" id="demo-continue" aria-label="Start playing">${icon("play")}</button></div></div>`;
}
export function icecreamResult(round, buttons) {
  const won = icecreamScore(round) >= ICECREAM_GOAL;
  return `<section class="result-screen ice-result ${won ? "won" : "try-again"}">${icecreamScene(round, "", true)}<div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "heart")}</div><div class="result-score" aria-label="${icecreamScore(round)} of five orders correct">${round.tasks.map((q) => `<i class="${q.firstTry ? "passed" : "missed"}">${icon(q.firstTry ? "star" : "replay")}</i>`).join("")}</div><div class="result-actions">${buttons}</div></div></section>`;
}
