import { GAME_TYPES, stageFor, isStageUnlocked } from "./journey-model.js";
import { icon } from "./race-art.js";
export function trailsScreen(save, picture, unlockAllLevels = false) {
  return `<section class="route-screen journey-route trails"><div class="route-scroll" tabindex="0" aria-label="Explore each game’s own level path"><div class="trail-cards">${GAME_TYPES.map(
    (game) => {
      const current = save.unlockedByKind[game.kind],
        points = Array.from({ length: game.levels }, (_, i) => ({
          x: 60 + i * 110,
          y: i % 2 ? 85 : 55,
        })),
        width = game.levels * 110 + 10;
      const path = points
        .map((p, i) =>
          i
            ? `C${p.x - 65} ${points[i - 1].y},${p.x - 45} ${p.y},${p.x} ${p.y}`
            : `M${p.x} ${p.y}`,
        )
        .join(" ");
      return `<section class="trail-card trail-${game.kind}" data-trail-kind="${game.kind}" aria-label="${game.name}" style="--trail-color:${game.color}"><header class="trail-heading"><span class="trail-picture">${picture(game.kind)}</span><span class="trail-progress" aria-label="Level ${current} of ${game.levels}"><b>${current}</b><small>/ ${game.levels}</small></span>${game.kind === "pancake" ? `<div class="cafe-style-toggle" aria-label="Choose pancakes or waffles">${["pancake", "waffle"].map((style) => `<button type="button" data-cafe-style="${style}" class="${save.cafeStyle === style ? "chosen" : ""}" aria-label="Serve ${style === "waffle" ? "waffles" : "pancakes"}" aria-pressed="${save.cafeStyle === style}"><span class="cafe-style-picture ${style}-picture" aria-hidden="true"><i></i><i></i><i></i></span></button>`).join("")}</div>` : `<span class="trail-badge">${icon("flag")}</span>`}</header><div class="trail-scroll" tabindex="0" data-trail-scroll="${game.kind}" aria-label="${game.name} levels, swipe to explore"><div class="trail-line" style="width:${width}px"><svg class="trail-road" viewBox="0 0 ${width} 150" aria-hidden="true"><path d="${path}" stroke="${game.color}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".32"/><path d="${path}" stroke="#fffdf5" stroke-width="3" stroke-dasharray="6 9" fill="none"/></svg>${points
        .map((p, i) => {
          const level = i + 1,
            stage = stageFor(game.kind, level),
            done = save.completed.includes(stage),
            locked = !isStageUnlocked(save, stage, { unlockAllLevels }),
            active = level === current;
          return `<button type="button" class="trail-node ${done ? "complete" : ""} ${active ? "current" : ""} ${save.selected === stage ? "selected" : ""} ${locked ? "locked" : ""}" style="left:${p.x}px;top:${p.y}px" data-level="${stage}" data-activity="${game.kind}" data-activity-level="${level}" data-stage-state="${locked ? "locked" : done ? "passed" : active ? "current" : "available"}" ${locked ? "disabled" : ""} ${active ? 'aria-current="step"' : ""} aria-label="${game.name}, level ${level}${done ? ", passed" : ""}${active ? ", current level" : ""}${locked ? ", locked" : ""}"><b>${level}</b>${done ? `<span>${icon("check")}</span>` : locked ? `<span>${icon("lock")}</span>` : active ? `<span>${icon("flag")}</span>` : ""}</button>`;
        })
        .join("")}</div></div></section>`;
    },
  ).join(
    "",
  )}</div></div><div class="map-scroll-hint" aria-hidden="true">${icon("next")}</div></section>`;
}
