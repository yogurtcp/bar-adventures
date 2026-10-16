import { renderAnimal } from "./animal-sound.js";
import { createEndingPicker, renderEnding } from "./race-endings.js";
import { renderEww } from "./food-sound.js";

// Short, nonverbal sounds only. One shared master makes mute immediate.
let animalBus,
  animalSources = [],
  animalVariation = 0;
let context;
let master;
let noise;
let endingBus;
let endingSources = [];
let ewwVariation = 0;
const nextEnding = createEndingPicker();
export function updateSoundOptions(options) {
  if (!context) return;
  const value = options.sound ? Math.max(0, Math.min(0.7, options.volume)) : 0;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(value, context.currentTime, 0.012);
}
export function playSound(kind, options) {
  if (!options.sound || options.volume <= 0) {
    updateSoundOptions(options);
    return;
  }
  try {
    if (!context) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      context = new Audio();
      master = context.createGain();
      master.gain.value = 0;
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.knee.value = 18;
      limiter.ratio.value = 6;
      limiter.attack.value = 0.005;
      limiter.release.value = 0.12;
      master.connect(limiter);
      limiter.connect(context.destination);
      noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    context.resume().catch(() => {});
    updateSoundOptions(options);
    const now = context.currentTime;
    const envelope = (gain, start, length, peak) => {
      gain.setValueAtTime(0, now + start);
      gain.linearRampToValueAtTime(peak, now + start + 0.012);
      gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    };
    const tone = (
      frequency,
      start,
      length,
      type = "sine",
      end = frequency,
      level = 0.12,
    ) => {
      const source = context.createOscillator(),
        amp = context.createGain();
      source.type = type;
      source.frequency.setValueAtTime(frequency, now + start);
      source.frequency.exponentialRampToValueAtTime(end, now + start + length);
      envelope(amp.gain, start, length, level);
      source.connect(amp);
      amp.connect(master);
      source.onended = () => {
        source.disconnect();
        amp.disconnect();
      };
      source.start(now + start);
      source.stop(now + start + length + 0.02);
    };
    const whoosh = (length = 0.35, level = 0.055, low = 480, high = 2200) => {
      const source = context.createBufferSource(),
        filter = context.createBiquadFilter(),
        amp = context.createGain();
      source.buffer = noise;
      filter.type = "bandpass";
      filter.Q.value = 0.65;
      filter.frequency.setValueAtTime(low, now);
      filter.frequency.exponentialRampToValueAtTime(high, now + length);
      envelope(amp.gain, 0, length, level);
      source.connect(filter);
      filter.connect(amp);
      amp.connect(master);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        amp.disconnect();
      };
      source.start(now);
      source.stop(now + length + 0.02);
    };
    if (kind.startsWith("animal:")) {
      if (animalBus) {
        const old = animalBus;
        old.gain.setTargetAtTime(0, now, 0.008);
        for (const source of animalSources) {
          try {
            source.stop(now + 0.04);
          } catch {}
        }
        setTimeout(() => old.disconnect(), 100);
      }
      animalBus = context.createGain();
      animalBus.connect(master);
      const [, id, mood] = kind.split(":");
      animalSources = renderAnimal(
        context,
        animalBus,
        id,
        now + 0.01,
        animalVariation++ % 3,
        mood === "surprised",
      );
      return { id: `animal-${id}`, label: id };
    }
    if (kind === "eww") {
      // Let the vowel sound stand out from the musical wrong-answer feedback.
      if (endingBus) {
        endingBus.gain.setTargetAtTime(0.22, now, 0.025);
        endingBus.gain.setTargetAtTime(1, now + 0.82, 0.04);
      }
      renderEww(context, master, now + 0.01, ewwVariation++ % 3);
      return;
    }
    if (kind === "win" || kind === "lose") {
      const ending = nextEnding(kind);
      // Another answer sound or parent preview replaces the previous clip.
      if (endingBus) {
        const oldBus = endingBus;
        oldBus.gain.setTargetAtTime(0, now, 0.008);
        for (const source of endingSources) {
          try {
            source.stop(now + 0.04);
          } catch {}
        }
        setTimeout(() => oldBus.disconnect(), 100);
      }
      endingBus = context.createGain();
      endingBus.connect(master);
      const rendered = renderEnding(context, endingBus, ending, now + 0.015);
      endingSources = rendered.sources;
      return { id: ending.id, label: ending.label };
    }
    if (kind === "rocket-boost") {
      whoosh(0.65, 0.045, 180, 1900);
      tone(85, 0, 0.6, "triangle", 310, 0.12);
      [880, 1320, 1760].forEach((f, i) =>
        tone(f, 0.15 + i * 0.09, 0.18, "sine", f * 1.04, 0.035),
      );
    } else if (kind === "rocket-sputter") {
      tone(220, 0, 0.15, "triangle", 90, 0.1);
      tone(320, 0.2, 0.26, "sine", 160, 0.075);
      tone(190, 0.5, 0.18, "triangle", 95, 0.07);
    } else if (kind === "rocket-land" || kind === "rocket-return") {
      whoosh(0.75, 0.04, 1300, 200);
      const notes =
        kind === "rocket-land" ? [523, 659, 784, 1047] : [660, 523, 440];
      notes.forEach((f, i) => tone(f, i * 0.13, 0.35, "sine", f, 0.07));
    } else if (kind === "boost") {
      whoosh(0.48, 0.075, 380, 2400);
      tone(95, 0, 0.55, "triangle", 330, 0.2);
      [740, 988, 1244].forEach((f, i) =>
        tone(f, 0.1 + i * 0.085, 0.22, "sine", f * 1.025, 0.085),
      );
    } else if (kind === "sputter") {
      tone(240, 0, 0.16, "triangle", 115, 0.16);
      tone(170, 0.13, 0.13, "sine", 85, 0.12);
    } else if (kind === "bonus") {
      [659, 880, 1318].forEach((f, i) =>
        tone(f, i * 0.1, 0.3, "sine", f, 0.075),
      );
    } else if (kind === "question") {
      whoosh(0.13, 0.027, 1300, 550);
      tone(610, 0.025, 0.07, "sine", 530, 0.035);
    } else if (kind === "light") tone(440, 0, 0.11, "sine", 440, 0.09);
    else if (kind === "go") {
      whoosh(0.25, 0.05);
      [523, 659, 784].forEach((f) => tone(f, 0, 0.26, "triangle", f, 0.075));
    } else if (kind === "finish") {
      whoosh(0.65, 0.065, 500, 2800);
      tone(120, 0, 0.65, "triangle", 410, 0.17);
      tone(440, 0.25, 0.23, "sine", 440, 0.065);
      tone(554, 0.25, 0.23, "sine", 554, 0.055);
    } else tone(640, 0, 0.085, "sine", 430, 0.1);
  } catch {
    // Audio is optional; browser audio restrictions must not interrupt play.
  }
}
