import { icon } from "./race-art.js";
import { animalButton, ANIMALS, ANIMAL_ASSET } from "./animal-view.js";
import { pancakeScore, PANCAKE_GOAL, correctPair } from "./pancake-model.js";
export const CAFE_ASSET = ANIMAL_ASSET;
let cafeStyle = "waffle";
export function setCafeStyle(style) {
  cafeStyle = style;
}
export function pancakeStack(n, cls = "", style = cafeStyle) {
  return `<span class="pancake-stack ${style === "waffle" ? "waffle-stack" : ""} ${cls}" style="--count:${n}" role="img" aria-label="${n} pancakes">${Array.from({ length: n }, (_, i) => `<i style="--p:${i}"></i>`).join("")}<span class="pancake-plate"></span></span>`;
}
const selectedPlates = (q) =>
  q.selected.map((id) => q.plates.find((p) => p.id === id));
export function pancakeScene(round, feedback = "", finale = false) {
  const q = round.tasks[round.index],
    points = pancakeScore(round),
    won = points >= PANCAKE_GOAL;
  const selected = selectedPlates(q),
    total = selected.reduce((n, p) => n + p.value, 0);
  const mood = finale
    ? won
      ? "happy"
      : "ready"
    : feedback === "correct"
      ? "happy"
      : feedback === "wrong"
        ? "surprised"
        : "ready";
  const pose = finale
    ? won
      ? "happy"
      : "ready"
    : feedback === "correct"
      ? "happy"
      : feedback === "wrong"
        ? "oops"
        : "ready";
  return `<section class="cafe-stage ${feedback ? "cafe-" + feedback : ""} ${finale ? "cafe-finale" : ""}" aria-label="Bar’s pancake café, ${points} of ${PANCAKE_GOAL} happy orders">
 <div class="cafe-wall" aria-hidden="true"><div class="cafe-awning"></div><div class="cafe-window"><span></span></div><div class="cafe-shelf"><i></i><i></i><i></i></div><div class="cafe-counter"></div><div class="cafe-floor"></div></div>
 <div class="cafe-goal" aria-label="${points} of four happy customers">${icon("trophy")}${Array.from({ length: 4 }, (_, i) => `<span class="${i < points ? "earned" : ""}">${icon("heart")}</span>`).join("")}</div>
 <div class="bar-chef ${feedback ? "chef-reacting" : ""}"><img src="${CAFE_ASSET}chef-${pose}.png" alt="Bar ${pose === "happy" ? "grinning and serving pancakes" : pose === "oops" ? "surprised with a pancake on his chef hat" : "ready to serve pancakes"}" draggable="false"/></div>${feedback && !finale ? `<div class="chef-portrait ${feedback}" aria-hidden="true"><img src="${CAFE_ASSET}chef-${pose}.png" alt=""/></div>` : ""}
 ${
   !finale
     ? `<div class="cafe-order" aria-label="Order: ${q.target} pancakes">${pancakeStack(q.target)}<b>${q.target}</b></div>${animalButton(q.animal, "cafe-customer", mood)}<div class="customer-table" aria-hidden="true"></div>
 <div class="chef-serving ${feedback === "correct" ? "delivering" : feedback === "wrong" ? "wobbling" : ""}">${round.level <= 2 && !q.resolved ? pancakeStack(q.target, "ghost-stack") : ""}${pancakeStack(total)}</div>
 ${feedback === "correct" ? '<div class="customer-hearts" aria-hidden="true">♥ ✦ ♥</div>' : ""}
 <div class="cafe-queue" aria-label="Next customers">${round.tasks
   .slice(round.index + 1, round.index + 3)
   .map((t) => animalButton(t.animal, "queued-animal"))
   .join("")}</div>`
     : `<div class="cafe-party">${ANIMALS.map((id) => animalButton(id, "party-animal", won ? "happy" : "ready")).join("")}</div>`
 }
 </section>`;
}
export function pancakeQuestion(round, feedback, locked) {
  const q = round.tasks[round.index],
    sel = selectedPlates(q),
    pair = correctPair(q),
    sum = sel.reduce((n, p) => n + p.value, 0);
  const equation = (values, target) =>
    `<span>${values[0] ?? "□"}</span><b>+</b><span>${values[1] ?? "□"}</span><b>=</b><span>${target}</span>`;
  return `<section class="cafe-dock ${feedback ? "feedback-" + feedback : ""}" aria-label="Choose two plates to make ${q.target} pancakes">
 <div class="cafe-equations"><div class="cafe-equation ${feedback === "wrong" ? "wrong-sum" : ""}" aria-label="${sel.map((p) => p.value).join(" plus ")} ${q.resolved ? "equals " + sum : "to make " + q.target}">${equation(
   sel.map((p) => p.value),
   q.resolved ? sum : q.target,
 )}${q.resolved ? icon(feedback === "correct" ? "check" : "close") : ""}</div>${
   feedback === "wrong"
     ? `<div class="cafe-correction" role="status" aria-label="${pair[0].value} plus ${pair[1].value} equals ${q.target}">${equation(
         pair.map((p) => p.value),
         q.target,
       )}${icon("check")}</div>`
     : ""
 }</div>
 <div class="pancake-choices">${q.plates.map((p) => `<button type="button" class="pancake-choice ${feedback !== "wrong" && q.selected.includes(p.id) ? "selected" : ""} ${feedback === "wrong" && pair.some((x) => x.id === p.id) ? "worked-pair" : ""}" data-plate="${p.id}" aria-pressed="${q.selected.includes(p.id)}" aria-label="${p.value} pancakes${!q.resolved && q.selected.includes(p.id) ? ", tap to undo" : ""}" ${locked || q.resolved ? "disabled" : ""}>${pancakeStack(p.value)}<b>${p.value}</b><span class="plate-check">${icon("check")}</span></button>`).join("")}</div>
 </section>`;
}
export function pancakeResult(round, buttons) {
  const won = pancakeScore(round) >= PANCAKE_GOAL;
  return `<section class="result-screen cafe-result ${won ? "won" : "try-again"}">${pancakeScene(round, "", true)}<div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "heart")}</div><div class="result-score" aria-label="${pancakeScore(round)} of five orders correct">${round.tasks.map((q) => `<i class="${q.firstTry ? "passed" : "missed"}">${icon(q.firstTry ? "heart" : "replay")}</i>`).join("")}</div><div class="result-actions">${buttons}</div></div></section>`;
}
export function pancakeTutorial(step) {
  return `<div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="Choose one pancake, then two pancakes, to serve three"><div class="tutorial-card cafe-example step-${step}"><div class="example-equation"><span>${step >= 1 ? "1" : "□"}</span><b>+</b><span>${step >= 2 ? "2" : "□"}</span><b>=</b><span>3</span></div><div class="example-options">${[1, 2, 1].map((n, i) => `<span class="example-plate ${step >= (i === 0 ? 1 : 2) && i < 2 ? "chosen" : ""}">${pancakeStack(n)}<b>${n}</b>${(step === 1 && i === 0) || (step >= 2 && i === 1) ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span>`).join("")}</div><div class="cafe-demo-customer">${animalButton("bunny", "", step >= 3 ? "happy" : "ready")}${step >= 3 ? pancakeStack(3) : ""}</div><button class="demo-continue" id="demo-continue" aria-label="Start playing">${icon("play")}</button></div></div>`;
}
