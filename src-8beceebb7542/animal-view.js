import { ANIMALS } from "./pancake-model.js";
export { ANIMALS };
export const ANIMAL_ASSET = new URL("../assets/cafe-v1/", import.meta.url).href;
export function animalSprite(id, mood = "ready") {
  return `<span class="animal-sprite mood-${mood}" style="--animal-image:url('${ANIMAL_ASSET}${id}.png')" aria-hidden="true"></span>`;
}
export function animalButton(id, cls = "", mood = "ready") {
  return `<button type="button" class="animal-button ${cls}" data-animal="${id}" data-mood="${mood}" aria-label="Play with ${id}">${animalSprite(id, mood)}<span class="animal-pop" aria-hidden="true">✦</span></button>`;
}
export function bindAnimalTaps(root, sound) {
  const timers = [];
  root.querySelectorAll("[data-animal]").forEach((button) => {
    let count = 0,
      last = 0;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const now = performance.now();
      if (now - last < 450) return;
      last = now;
      const mood = count++ % 3 === 2 ? "surprised" : "happy";
      const sprite = button.querySelector(".animal-sprite");
      sprite.className = `animal-sprite mood-${mood}`;
      button.classList.remove("animal-playing");
      void button.offsetWidth;
      button.classList.add("animal-playing");
      sound(`animal:${button.dataset.animal}:${mood}`);
      const generation = count;
      timers.push(
        setTimeout(() => {
          if (count !== generation) return;
          button.classList.remove("animal-playing");
          sprite.className = `animal-sprite mood-${button.dataset.mood || "ready"}`;
        }, 1400),
      );
    });
  });
  return () => timers.forEach(clearTimeout);
}
