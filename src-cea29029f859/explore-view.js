import { icon } from "./race-art.js";
import { animalButton } from "./animal-view.js";
import { objectImage } from "./food-view.js";
import { exploreScore, EXPLORE_GOAL } from "./explore-model.js";
export const EXPLORE_ASSET = new URL("../assets/explore-v1/", import.meta.url)
  .href;
export function exploreSprite(kind, mood = "ready", cls = "") {
  return `<span class="explore-sprite ${kind}-sprite mood-${mood} ${cls}" style="--explore-image:url('${EXPLORE_ASSET}${kind}.png')" role="img" aria-label="Bar ${kind === "fishing" ? "fishing with his rod in a boat" : "riding in his hot-air balloon"}, ${mood}"></span>`;
}
export function fishSprite(species = 0, cls = "") {
  return `<span class="fish-sprite ${cls}" style="--fish-x:${(species % 3) * 50}%;--fish-y:${species < 3 ? 0 : 100}%;--fish-image:url('${EXPLORE_ASSET}fish.png')" aria-hidden="true"></span>`;
}
export const fishSchool = (n, species = 0) =>
  `<span class="fish-school" role="img" aria-label="${n} fish">${Array.from({ length: n }, (_, i) => `<span style="--fish-i:${i}">${fishSprite(species)}</span>`).join("")}</span>`;
const clouds = () =>
  `<div class="explore-cloud cloud-one"></div><div class="explore-cloud cloud-two"></div><div class="explore-cloud cloud-three"></div>`;
const goal = (points) =>
  `<div class="explore-goal" aria-label="${points} of four rewards">${icon("trophy")}${Array.from({ length: 4 }, (_, i) => `<span class="${i < points ? "earned" : ""}">${icon("star")}</span>`).join("")}</div>`;
export function exploreScene(
  round,
  feedback = "",
  from = null,
  finale = false,
) {
  const fishing = round.kind === "fishing",
    points = exploreScore(round),
    q = round.tasks[round.index],
    won = points >= EXPLORE_GOAL;
  const mood = finale
    ? won
      ? "happy"
      : "ready"
    : feedback === "correct"
      ? "happy"
      : feedback === "wrong"
        ? "surprised"
        : "ready";
  return `<section class="explore-stage ${round.kind}-stage ${feedback ? "explore-" + feedback : ""} ${finale ? "explore-finale" : ""}" data-rewards="${points}" aria-label="${fishing ? "Fishing pond" : "Balloon adventure"}, ${points} of four rewards">
 <div class="explore-sky" aria-hidden="true">${clouds()}<span class="explore-sun"></span><div class="explore-mountains"></div></div>
 ${
   fishing
     ? `<div class="pond-bank" aria-hidden="true"></div><div class="pond-water" aria-hidden="true"><i></i><i></i><i></i></div><div class="pond-reeds" aria-hidden="true"><i></i><i></i><i></i></div><div class="fishing-boat">${exploreSprite("fishing", mood)}</div><div class="rod-line" aria-hidden="true"></div><div class="pond-rock" aria-hidden="true"></div>${animalButton(round.level % 2 ? "cat" : "dog", "fishing-buddy", mood)}
 ${feedback ? `<div class="reeled-catch ${feedback}" aria-hidden="true">${feedback === "correct" ? fishSchool(q.answer, q.species) : objectImage("shoe", "caught-shoe")}</div><div class="pond-splash" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--splash-i:${i}"></i>`).join("")}</div>` : ""}
 <div class="catch-aquarium" aria-label="${points} successful catches">${round.tasks
   .filter((t) => t.firstTry === true)
   .map((t) => fishSprite(t.species))
   .join("")}</div>`
     : `<div class="cloud-castle" aria-hidden="true"><i></i><i></i><i></i><span>${icon("flag")}</span></div><div class="balloon-waypoints" aria-label="Balloon progress">${Array.from({ length: 4 }, (_, i) => `<span class="${i < points ? "visited" : ""}">${icon(i < points ? "check" : "star")}</span>`).join("")}</div><div class="balloon-rider" data-balloon style="bottom:${8 + Math.min(4, from ?? points) * 7}%">${exploreSprite("balloon", mood)}</div><div class="buddy-cloud" aria-hidden="true"></div>${animalButton(round.level % 2 ? "bunny" : "penguin", "balloon-buddy", mood)}${feedback === "correct" ? `<div class="balloon-star-burst" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<i style="--burst-i:${i}">${icon("star")}</i>`).join("")}</div>` : feedback === "wrong" ? '<div class="balloon-puff" aria-hidden="true">✦</div>' : ""}`
 }
 ${goal(points)}${feedback && !finale ? `<div class="explore-portrait" aria-hidden="true">${exploreSprite(round.kind, mood)}</div>` : ""}
 ${finale && won ? `<div class="explore-friends">${["fox", "panda", "penguin"].map((id) => animalButton(id, "", "happy")).join("")}</div>` : ""}
 </section>`;
}
export function exploreQuestion(round, feedback, locked) {
  const q = round.tasks[round.index],
    disabled = locked || q.resolved ? "disabled" : "";
  if (round.kind === "fishing")
    return `<section class="explore-dock fishing-dock" aria-label="Find a group of ${q.answer} fish"><div class="fishing-request"><b>${q.answer}</b>${fishSprite(q.species)}<span>${icon("next")}</span></div><div class="school-choices">${q.choices.map((n) => `<button type="button" class="school-choice ${q.resolved && n === q.answer ? "school-answer" : ""} ${q.rejected.includes(n) ? "school-miss" : ""}" data-explore-answer="${n}" aria-label="Catch this group of ${n} fish" ${disabled}>${fishSchool(n, q.species)}${q.resolved && n === q.answer ? `<span class="school-check">${icon("check")}</span>` : ""}</button>`).join("")}</div></section>`;
  const quantity = (n) =>
    `<span class="balloon-quantity" aria-hidden="true">${Array.from({ length: n }, () => objectImage("apple")).join("")}</span>`;
  return `<section class="explore-dock comparison-dock" aria-label="Compare ${q.a} and ${q.b}"><div class="comparison-prompt"><div class="comparison-number"><b>${q.a}</b>${quantity(q.a)}</div><span class="comparison-slot ${q.resolved ? "filled" : ""}">${q.resolved ? q.answer : "?"}</span><div class="comparison-number"><b>${q.b}</b>${quantity(q.b)}</div></div><div class="comparison-choices">${q.choices.map((symbol) => `<button type="button" data-explore-answer="${symbol}" class="comparison-choice ${q.resolved && symbol === q.answer ? "correct" : ""} ${q.rejected.includes(symbol) ? "rejected" : ""}" aria-label="${symbol === ">" ? "Greater than" : symbol === "<" ? "Less than" : "Equal to"}" ${disabled}>${symbol}</button>`).join("")}</div></section>`;
}
export function exploreTutorial(kind, step) {
  const fishing = kind === "fishing";
  return `<div class="tutorial-backdrop" role="dialog" aria-modal="true" aria-label="${fishing ? "Find the group of two fish" : "The open side faces the larger group"}"><div class="tutorial-card explore-example step-${step}">${fishing ? `<div class="fishing-request"><b>2</b>${fishSprite(0)}</div><div class="example-options">${[2, 1].map((n, i) => `<span class="example-school ${i === 0 && step >= 2 ? "chosen" : ""}">${fishSchool(n, 0)}${i === 0 && step >= 1 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span>`).join("")}</div>` : `<div class="example-equation"><span>3</span><b>${step >= 2 ? ">" : "?"}</b><span>1</span></div><div class="example-dots"><span class="dot-group red"><i></i><i></i><i></i></span><span class="comparison-mouth">&gt;</span><span class="dot-group blue"><i></i></span></div><div class="example-options"><span class="example-answer ${step >= 2 ? "correct" : ""}">&gt;${step >= 1 ? `<span class="demo-hand">${icon("hand")}</span>` : ""}</span><span class="example-answer">&lt;</span></div>`}<div class="explore-demo-reward">${exploreSprite(kind, step >= 3 ? "happy" : "ready")}</div><button class="demo-continue" id="demo-continue" aria-label="Start playing">${icon("play")}</button></div></div>`;
}
export function exploreResult(round, buttons) {
  const won = exploreScore(round) >= EXPLORE_GOAL;
  return `<section class="result-screen explore-result ${won ? "won" : "try-again"}">${exploreScene(round, "", null, true)}<div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "heart")}</div><div class="result-score" aria-label="${exploreScore(round)} of six correct">${round.tasks.map((q) => `<i class="${q.firstTry ? "passed" : "missed"}">${icon(q.firstTry ? "star" : "replay")}</i>`).join("")}</div><div class="result-actions">${buttons}</div></div></section>`;
}
