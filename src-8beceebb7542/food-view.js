import { animalButton } from "./animal-view.js";
import { icon } from "./race-art.js";
import { foodProgress, mealFor, MISHAPS, FOOD_GOAL } from "./journey-model.js";
export const FOOD_ASSET = new URL("../assets/food-v1/", import.meta.url).href;
const OBJECT_ASSET = new URL("../assets/objects/", import.meta.url).href;
export const objectImage = (item, cls = "") =>
  `<img class="food-item ${cls}" src="${OBJECT_ASSET}${item}.webp" alt="${item}" draggable="false"/>`;
export function foodPose(round) {
  const { energy } = foodProgress(round);
  return energy >= 7 ? "strong" : energy <= 2 ? "tired" : "ready";
}
function kitchen() {
  return `<div class="kitchen-backdrop" aria-hidden="true"><div class="kitchen-window"><i></i><i></i></div><div class="kitchen-shelf">${objectImage("milk")}${objectImage("carrot")}${objectImage("apple")}</div><div class="kitchen-tiles"></div><div class="kitchen-counter"></div></div>`;
}
export function foodScene(round, feedback = "", result = false) {
  const progress = foodProgress(round),
    meal = mealFor(round);
  const bad = MISHAPS[(round.seed + round.index) % MISHAPS.length];
  const pose = result
    ? progress.points >= FOOD_GOAL
      ? "strong"
      : "tired"
    : foodPose(round);
  const reaction = feedback === "correct" ? "eating" : "eww";
  return `<section class="food-stage ${feedback ? "food-" + feedback : ""} ${meal.bonus && !result ? "bonus-meal" : ""} ${result ? "food-finale" : ""}" data-energy="${progress.energy}" data-points="${progress.points}" aria-label="Bar’s kitchen, ${progress.points} of ${FOOD_GOAL} food points collected, energy ${progress.energy} of 10">
    ${kitchen()}${animalButton(["cat", "dog", "bunny", "fox", "panda", "penguin"][(round.level - 1) % 6], "food-companion")}
    <div class="energy-meter" aria-label="Bar’s energy">${icon("bolt")}<div>${Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.floor(progress.energy) ? "charged" : ""}"></i>`).join("")}</div>${icon(pose === "strong" ? "strong" : pose === "tired" ? "moon" : "heart")}</div>
    <div class="meal-goal" aria-label="Collect ${FOOD_GOAL} food points to finish">${icon("trophy")}<b>${progress.points}<small> / ${FOOD_GOAL}</small></b></div>
    <div class="bar-diner ${pose}" data-pose="${pose}"><div class="strength-glow"></div><img class="bar-body" src="${FOOD_ASSET}${pose}.png" alt="Bar ${pose === "strong" ? "flexing his arms and smiling" : pose === "tired" ? "looking tired and sad" : "ready for a meal"}" draggable="false"/>${feedback && !result ? `<img class="bar-reaction" src="${FOOD_ASSET}${reaction}.png" alt="Bar ${reaction === "eating" ? "happily chewing" : "making a funny eww face"}" draggable="false"/>` : ""}${pose === "strong" ? `<span class="strength-star one">✦</span><span class="strength-star two">✦</span>` : ""}</div>
    ${!result ? `<div class="meal-preview ${feedback === "correct" ? "served" : feedback === "wrong" ? "spoiled" : ""}" aria-label="${meal.bonus ? "Double bonus: " : ""}${meal.item}"><div class="meal-plate"></div>${objectImage(feedback === "wrong" ? bad : meal.item)}${meal.bonus ? `<span class="double-bonus">×2 ${icon("star")}</span>` : ""}</div>${feedback ? `<div class="food-reward ${feedback}" aria-hidden="true">${objectImage(feedback === "wrong" ? bad : meal.item)}<span>${feedback === "correct" ? (meal.bonus ? "+2" : "+1") : icon("close")}</span></div>` : ""}` : ""}
    <div class="food-collection" aria-label="Collected food, ${progress.points} of 10 possible">${Array.from({ length: 10 }, (_, i) => `<span class="${i < progress.collected.length ? "collected" : ""} ${i === FOOD_GOAL - 1 ? "goal-slot" : ""}">${progress.collected[i] ? objectImage(progress.collected[i]) : icon(i === FOOD_GOAL - 1 ? "flag" : "plate")}</span>`).join("")}</div>
    ${result && progress.points >= FOOD_GOAL ? `<div class="food-confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i};--x:${(i * 37) % 100}%"></i>`).join("")}</div>` : ""}
    </section>`;
}
export function foodResult(round, buttons) {
  const progress = foodProgress(round),
    won = progress.points >= FOOD_GOAL;
  return `<section class="result-screen food-result ${won ? "won" : "try-again"}">${foodScene(round, "", true)}<div class="result-dock"><div class="result-medal">${icon(won ? "trophy" : "heart")}</div><div class="result-score" aria-label="${progress.points} food points, target ${FOOD_GOAL}">${round.tasks.map((q, i) => `<i class="${q.firstTry ? "passed" : "missed"}">${q.firstTry ? objectImage(mealFor(round, i).item) : icon("replay")}</i>`).join("")}</div><div class="result-actions">${buttons}</div></div></section>`;
}
