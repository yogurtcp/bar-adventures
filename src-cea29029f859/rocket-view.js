import { animalButton } from "./animal-view.js";
import { icon } from "./race-art.js";
import {
  rocketProgress,
  rocketDifficulty,
  ROCKET_GOAL,
  ROCKET_MISTAKES,
} from "./rocket-model.js";
export const ROCKET_ASSET = new URL("../assets/rocket-v1/", import.meta.url)
  .href;
export const FLIGHT_POINTS = [
  { x: 16, y: 69 },
  { x: 28, y: 57 },
  { x: 39, y: 65 },
  { x: 50, y: 44 },
  { x: 62, y: 50 },
  { x: 72, y: 30 },
  { x: 84, y: 30 },
];
export function rocketPoint(round) {
  return FLIGHT_POINTS[Math.min(ROCKET_GOAL, rocketProgress(round).cells)];
}
const palette = ["#cbb8f0", "#f4bb9b", "#b9e5c2", "#f5d38c", "#a9d6f1"];
function planet(level) {
  const color = palette[(level - 1) % palette.length];
  return `<svg viewBox="0 0 160 160" aria-hidden="true" shape-rendering="crispEdges"><path fill="${color}" d="M54 9h52v9h20v12h15v21h9v57h-9v20h-15v14h-20v9H54v-9H34v-14H19v-20h-9V51h9V30h15V18h20z"/><path fill="#51447533" d="M116 24h10v10h15v20h9v53h-9v20h-15v15h-20v9H54v-9H34v-14h31v9h31v-10h20v-20h10V54h-10z"/><g fill="#51447533"><path d="M35 50h22v7h7v19h-7v7H35v-7h-7V57h7zm57-13h13v7h7v12h-7v7H92v-7h-7V44h7zM73 100h19v7h7v17h-7v7H73v-7h-7v-17h7z"/></g><g fill="#fff5ee55"><path d="M40 48h18v6H40zm49-13h17v6H89zm-18 63h21v6H71z"/></g></svg>`;
}
function earth() {
  return `<svg viewBox="0 0 160 160" aria-hidden="true" shape-rendering="crispEdges"><path fill="#76b9d1" d="M54 9h52v9h20v12h15v21h9v57h-9v20h-15v14h-20v9H54v-9H34v-14H19v-20h-9V51h9V30h15V18h20z"/><path fill="#8ec299" d="M35 30h36v10h18v22H69v18H49v20H28V79H14V54h12V40h9zm70 54h33v20h-12v24h-21v14H87v-24H77v-20h28z"/><path fill="#fff9e19c" d="M54 10h52v9H54zm-20 17h31v8H34zm59 112h13v11H61v-7h32z"/></svg>`;
}
function spaceBackground(level) {
  return `<div class="space-background" aria-hidden="true"><div class="space-nebula"></div>${Array.from({ length: 46 }, (_, i) => `<i class="space-star ${i % 7 === 0 ? "bright" : ""}" style="left:${(i * 37 + 7) % 100}%;top:${(i * 23 + 13) % 95}%;--delay:${i % 5}s"></i>`).join("")}<div class="earth-origin">${earth()}</div><div class="destination-planet">${planet(level)}<span class="destination-flag">${icon("flag")}</span></div><div class="tiny-orbit-planet"></div></div>`;
}
export function rocketScene(
  round,
  feedback = "",
  from = null,
  finishing = false,
) {
  const progress = rocketProgress(round),
    point = from || rocketPoint(round),
    good = progress.cells >= ROCKET_GOAL;
  const sprite =
    feedback === "correct" || (finishing && good)
      ? "ship-boost"
      : feedback === "wrong" || (finishing && !good)
        ? "ship-oops"
        : "ship";
  const pts = FLIGHT_POINTS.map((p) => `${p.x * 10},${p.y * 5}`).join(" ");
  return `<section class="rocket-stage ${feedback ? "rocket-" + feedback : ""} ${finishing ? "rocket-finishing" : ""}" data-cells="${progress.cells}" data-mistakes="${progress.mistakes}" aria-label="Rocket journey: ${progress.cells} of ${ROCKET_GOAL} power cells, ${progress.mistakes} of ${ROCKET_MISTAKES} engine mishaps">
 ${spaceBackground(round.level)}${animalButton(round.level % 2 ? "penguin" : "dog", "rocket-companion")}
 <svg class="flight-path" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="#b8c6ec44" stroke-width="3" stroke-dasharray="7 10"/></svg>
 ${FLIGHT_POINTS.slice(1)
   .map(
     (p, i) =>
       `<span class="flight-checkpoint ${i < progress.cells ? "visited" : ""}" style="left:${p.x}%;top:${p.y}%" aria-hidden="true">${icon(i < progress.cells ? "check" : "star")}</span>`,
   )
   .join("")}
 <div class="rocket-power" aria-label="${progress.cells} of six power cells">${icon("bolt")}<div>${Array.from({ length: 6 }, (_, i) => `<span class="power-cell ${i < progress.cells ? "charged" : ""}"><i></i></span>`).join("")}</div></div>
 <div class="engine-lives" aria-label="${ROCKET_MISTAKES - progress.mistakes} engine chances remaining">${Array.from({ length: 3 }, (_, i) => `<span class="${i < progress.mistakes ? "faulty" : ""}">${icon(i < progress.mistakes ? "close" : "rocket")}</span>`).join("")}</div>
 <div class="rocket-craft ${feedback || ""}" data-rocket style="left:${point.x}%;top:${point.y}%"><div class="rocket-flame" aria-hidden="true"><i></i><i></i><i></i></div><div class="rocket-capsule"><img src="${ROCKET_ASSET}${sprite}.png" alt="Bar ${feedback === "correct" ? "celebrating" : feedback === "wrong" ? "looking puzzled" : "piloting"} inside his rocket" draggable="false"/></div>${feedback ? `<div class="pilot-zoom ${feedback}" aria-hidden="true"><img src="${ROCKET_ASSET}${sprite}.png" alt=""/><span>${icon(feedback === "correct" ? "star" : "replay")}</span></div>` : ""}</div>
 ${feedback === "correct" ? `<div class="charging-cell" style="--target-x:${rocketPoint(round).x}%;--target-y:${rocketPoint(round).y}%" aria-hidden="true">${icon("bolt")}</div><div class="rocket-sparks" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i};left:${rocketPoint(round).x}%;top:${rocketPoint(round).y}%"></i>`).join("")}</div>` : ""}
 </section>`;
}
export function rocketQuestion(q, entry, locked) {
  const part = (key) =>
    q.blank === key
      ? `<span class="answer-slot rocket-blank ${q.resolved ? "filled" : ""}">${q.resolved ? q.answer : "?"}</span>`
      : `<span class="operand-${key}">${q[key]}</span>`;
  const help = rocketDifficulty(entry.level).dots || q.rejected.length;
  let quantities = "";
  if (help) {
    if (q.op === "+") {
      const known = q.blank === "a" ? q.b : q.a;
      quantities = `<span class="rocket-dot-frame" aria-hidden="true">${Array.from({ length: q.total }, (_, i) => `<i class="${i < known ? "known" : "missing"}"></i>`).join("")}</span>`;
    } else
      quantities = `<span class="rocket-dot-frame" aria-hidden="true">${Array.from({ length: q.a }, (_, i) => `<i class="${i >= q.total ? "taken" : "known"}"></i>`).join("")}</span>`;
  }
  return `<div class="question-block"><div class="equation rocket-equation" aria-label="${q.blank === "a" ? "Missing number" : q.a} ${q.op === "+" ? "plus" : "minus"} ${q.blank === "b" ? "missing number" : q.b} equals ${q.total}">${part("a")}<span class="operator">${q.op}</span>${part("b")}<span class="operator">=</span><span class="rocket-total">${q.total}</span></div><div class="quantity-space">${quantities}</div></div><div class="answer-grid choices-${q.choices.length}">${q.choices.map((value) => `<button class="answer-button ${q.rejected.includes(value) ? "rejected" : ""} ${q.resolved && value === q.answer ? "correct" : ""}" data-answer="${value}" ${locked || q.resolved ? "disabled" : ""} aria-label="Answer ${value}">${value}${q.rejected.includes(value) ? `<span class="rejected-mark">${icon("close")}</span>` : ""}</button>`).join("")}</div>`;
}
export function rocketTutorial(step) {
  return `<div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="Silent example: one plus one equals two, choose the missing one"><div class="tutorial-card rocket-example step-${step}"><div class="example-equation"><span class="answer-slot ${step >= 2 ? "filled" : ""}">${step >= 2 ? 1 : "?"}</span><b>+</b><span>1</span><b>=</b><span>2</span></div><div class="example-dots"><span class="rocket-dot-frame"><i class="known"></i><i class="missing"></i></span></div><div class="example-options"><span class="example-answer ${step >= 2 ? "correct" : ""}">1${step >= 1 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span><span class="example-answer">3</span></div><div class="demo-reward"><img src="${ROCKET_ASSET}${step >= 3 ? "ship-boost" : "ship"}.png" alt=""/><span class="tutorial-cell">${icon("bolt")}</span></div><button class="demo-continue" id="demo-continue" aria-label="Start playing">${icon("play")}</button></div></div>`;
}
export function rocketResult(round, buttons) {
  const p = rocketProgress(round),
    won = p.cells >= ROCKET_GOAL;
  return `<section class="result-screen rocket-result ${won ? "won" : "try-again"}"><div class="result-art"><img src="${ROCKET_ASSET}${won ? "landing" : "return"}.png" alt="${won ? "Bar plants a flag on the moon beside his rocket and a cheering little alien" : "Bar returns safely to Earth and a friendly alien mechanic helps with his rocket"}"/></div><div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "rocket")}</div><div class="result-score" aria-label="${p.cells} power cells, ${p.mistakes} mishaps">${round.tasks
    .filter((q) => q.resolved)
    .map(
      (q) =>
        `<i class="${q.firstTry ? "passed" : "missed"}">${icon(q.firstTry ? "bolt" : "replay")}</i>`,
    )
    .join(
      "",
    )}</div><div class="result-actions">${buttons}</div></div></section>`;
}
