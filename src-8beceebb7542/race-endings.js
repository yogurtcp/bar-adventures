// Short musical cartoons. Events: instrument, MIDI note, start, duration, level, optional slide-to note.
const e = (instrument, note, start, duration = 0.3, level = 0.13, slide) => ({
  instrument,
  note,
  start,
  duration,
  level,
  slide,
});
export const ENDINGS = {
  win: [
    {
      id: "trumpet-parade",
      label: "Trumpet parade",
      events: [
        e("brass", 60, 0, 0.17),
        e("brass", 60, 0.2, 0.17),
        e("brass", 67, 0.4, 0.25),
        e("brass", 72, 0.72, 0.7, 0.12),
        e("brass", 64, 0.74, 0.68, 0.07),
        e("brass", 67, 0.74, 0.68, 0.07),
      ],
    },
    {
      id: "string-sprint",
      label: "Plucky string sprint",
      events: [
        ...[60, 64, 67, 72, 76, 79].map((n, i) =>
          e("pluck", n, i * 0.12, 0.55, 0.17),
        ),
        e("strings", 72, 0.78, 0.9, 0.12),
        e("pluck", 48, 0.8, 0.6, 0.17),
        e("bell", 84, 1.02, 0.65, 0.09),
      ],
    },
    {
      id: "spring-party",
      label: "Boing party",
      events: [
        e("boing", 55, 0, 0.42, 0.17),
        e("boing", 62, 0.32, 0.43, 0.16),
        e("boing", 67, 0.66, 0.55, 0.17),
        e("marimba", 79, 0.95, 0.35),
        e("bell", 84, 1.1, 0.7, 0.09),
      ],
    },
    {
      id: "disco-dash",
      label: "Disco dash",
      events: [
        e("bass", 36, 0, 0.2, 0.2),
        e("bass", 36, 0.27, 0.18, 0.17),
        e("bass", 43, 0.54, 0.18, 0.17),
        e("bass", 48, 0.81, 0.4, 0.2),
        ...[60, 64, 67].flatMap((n) => [
          e("pluck", n, 0.15, 0.24, 0.1),
          e("brass", n, 0.68, 0.18, 0.06),
        ]),
        e("bell", 84, 1.05, 0.6, 0.09),
      ],
    },
    {
      id: "tiny-orchestra",
      label: "Tiny orchestra",
      events: [
        e("strings", 60, 0, 1.25, 0.08),
        e("strings", 64, 0.08, 1.2, 0.07),
        e("strings", 67, 0.16, 1.15, 0.07),
        e("brass", 67, 0.32, 0.23, 0.11),
        e("brass", 72, 0.62, 0.6, 0.11),
        e("marimba", 84, 1.05, 0.5, 0.1),
        e("bell", 88, 1.22, 0.65, 0.07),
      ],
    },
    {
      id: "magic-confetti",
      label: "Magic confetti",
      events: [
        ...[60, 64, 67, 72, 76, 79, 84].map((n, i) =>
          e("pluck", n, i * 0.085, 0.5, 0.12),
        ),
        ...[88, 84, 79, 76].map((n, i) =>
          e("bell", n, 0.65 + i * 0.13, 0.7, 0.08),
        ),
        e("bass", 48, 0.65, 0.6, 0.1),
      ],
    },
  ],
  lose: [
    {
      id: "trombone-detour",
      label: "Wobbly trombone",
      events: [
        e("trombone", 62, 0, 0.32, 0.15, 58),
        e("trombone", 58, 0.36, 0.6, 0.15, 48),
        e("boing", 55, 1.02, 0.45, 0.13),
      ],
    },
    {
      id: "tiptoe-strings",
      label: "Tiptoe strings",
      events: [
        ...[67, 65, 63, 60, 55].map((n, i) =>
          e("pluck", n, i * 0.17, 0.4, 0.17),
        ),
        e("pluck", 67, 1, 0.6, 0.14),
        e("marimba", 72, 1.18, 0.4, 0.09),
      ],
    },
    {
      id: "rubber-wheels",
      label: "Rubber wheels",
      events: [
        e("boing", 60, 0, 0.58, 0.18),
        e("boing", 48, 0.48, 0.65, 0.17),
        e("marimba", 72, 1.14, 0.35, 0.1),
      ],
    },
    {
      id: "kazoo-pitstop",
      label: "Kazoo pit stop",
      events: [
        e("kazoo", 67, 0, 0.17, 0.13),
        e("kazoo", 65, 0.22, 0.17, 0.13),
        e("kazoo", 60, 0.44, 0.4, 0.14, 57),
        e("kazoo", 64, 0.93, 0.2, 0.1),
        e("boing", 60, 1.16, 0.45, 0.12),
      ],
    },
    {
      id: "cartoon-tumble",
      label: "Xylophone tumble",
      events: [
        ...[84, 79, 76, 72, 67, 64].map((n, i) =>
          e("marimba", n, i * 0.115, 0.3, 0.12),
        ),
        e("bass", 43, 0.72, 0.3, 0.19),
        e("boing", 60, 0.92, 0.52, 0.14),
      ],
    },
    {
      id: "tiny-violin",
      label: "Tiny dramatic violin",
      events: [
        e("strings", 76, 0, 0.42, 0.12),
        e("strings", 74, 0.36, 0.42, 0.12),
        e("strings", 71, 0.72, 0.56, 0.12),
        e("pluck", 72, 1.3, 0.5, 0.16),
        e("bell", 79, 1.43, 0.45, 0.07),
      ],
    },
  ],
};
export function createEndingPicker(random = Math.random) {
  const bags = { win: [], lose: [] },
    previous = {};
  return (outcome) => {
    if (!ENDINGS[outcome]) throw new Error("Unknown race outcome");
    if (!bags[outcome].length) {
      const bag = [...ENDINGS[outcome]];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag.at(-1).id === previous[outcome])
        [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
      bags[outcome] = bag;
    }
    const ending = bags[outcome].pop();
    previous[outcome] = ending.id;
    return ending;
  };
}
const hz = (note) => 440 * 2 ** ((note - 69) / 12);

// Also used with OfflineAudioContext for waveform/peak verification.
export function renderEnding(
  context,
  output,
  ending,
  when = context.currentTime,
) {
  const sources = [];
  const register = (source, cleanup) => {
    sources.push(source);
    source.onended = () => {
      source.disconnect();
      cleanup();
    };
  };
  for (const event of ending.events) {
    const { instrument, start, duration, level } = event;
    const at = when + start,
      frequency = hz(event.note),
      end = hz(event.slide ?? event.note);
    const amp = context.createGain();
    amp.connect(output);
    amp.gain.setValueAtTime(0, at);
    const attack =
      instrument === "strings"
        ? 0.09
        : instrument === "brass" || instrument === "trombone"
          ? 0.025
          : 0.006;
    amp.gain.linearRampToValueAtTime(level, at + attack);
    if (
      instrument === "strings" ||
      instrument === "brass" ||
      instrument === "trombone"
    )
      amp.gain.setValueAtTime(level * 0.8, at + duration * 0.55);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    if (instrument === "pluck") {
      const length = Math.ceil(context.sampleRate * duration),
        period = Math.max(2, Math.round(context.sampleRate / frequency));
      const buffer = context.createBuffer(1, length, context.sampleRate),
        data = buffer.getChannelData(0);
      let seed = (event.note * 997 + Math.round(start * 1000) + 17) >>> 0;
      for (let i = 0; i < Math.min(period, length); i++) {
        seed = (1664525 * seed + 1013904223) >>> 0;
        data[i] = ((seed / 4294967296) * 2 - 1) * 0.9;
      }
      for (let i = period; i < length; i++)
        data[i] = 0.995 * (data[i - period] + data[i - period + 1]) * 0.5;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(amp);
      register(source, () => amp.disconnect());
      source.start(at);
      source.stop(at + duration);
      continue;
    }
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value =
      instrument === "kazoo" ? 1450 : instrument === "strings" ? 2300 : 3200;
    filter.Q.value = 0.65;
    filter.connect(amp);
    if (instrument === "brass" || instrument === "trombone") {
      filter.frequency.setValueAtTime(800, at);
      filter.frequency.linearRampToValueAtTime(
        instrument === "brass" ? 2800 : 1500,
        at + 0.06,
      );
      filter.frequency.exponentialRampToValueAtTime(
        instrument === "brass" ? 1800 : 450,
        at + duration,
      );
    }
    const partials =
      instrument === "bell"
        ? [
            [1, 0.7],
            [2.76, 0.2],
            [5.4, 0.1],
          ]
        : instrument === "marimba"
          ? [
              [1, 0.83],
              [4, 0.17],
            ]
          : instrument === "strings"
            ? [
                [1, 0.5, -7],
                [1, 0.5, 7],
              ]
            : [[1, 1]];
    let remaining = partials.length;
    const cleanup = () => {
      if (--remaining === 0) {
        filter.disconnect();
        amp.disconnect();
      }
    };
    for (const [ratio, weight, detune = 0] of partials) {
      const source = context.createOscillator(),
        mix = context.createGain();
      mix.gain.value = weight;
      source.type = ["brass", "trombone", "strings", "kazoo"].includes(
        instrument,
      )
        ? "sawtooth"
        : instrument === "bass"
          ? "triangle"
          : "sine";
      source.detune.value = detune;
      source.frequency.setValueAtTime(frequency * ratio, at);
      if (instrument === "boing") {
        source.frequency.setValueAtTime(frequency * 2.1, at);
        source.frequency.exponentialRampToValueAtTime(
          frequency * 0.64,
          at + duration * 0.27,
        );
        source.frequency.exponentialRampToValueAtTime(
          frequency * 1.22,
          at + duration * 0.52,
        );
        source.frequency.exponentialRampToValueAtTime(
          end * 0.95,
          at + duration,
        );
      } else
        source.frequency.exponentialRampToValueAtTime(
          end * ratio,
          at + duration,
        );
      let vibrato, depth;
      if (["strings", "trombone", "kazoo"].includes(instrument)) {
        vibrato = context.createOscillator();
        depth = context.createGain();
        vibrato.frequency.value = instrument === "kazoo" ? 9 : 5.4;
        depth.gain.value = instrument === "kazoo" ? 24 : 12;
        vibrato.connect(depth);
        depth.connect(source.detune);
        register(vibrato, () => depth.disconnect());
        vibrato.start(at);
        vibrato.stop(at + duration);
      }
      source.connect(mix);
      mix.connect(filter);
      register(source, () => {
        mix.disconnect();
        cleanup();
      });
      source.start(at);
      source.stop(at + duration + 0.02);
    }
  }
  return {
    sources,
    duration:
      Math.max(...ending.events.map((e) => e.start + e.duration)) + 0.04,
  };
}
