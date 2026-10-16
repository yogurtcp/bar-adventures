// Small, wordless cartoon voices. Three contours per animal, synthesized locally.
export function renderAnimal(
  context,
  destination,
  id,
  start,
  variant = 0,
  surprised = false,
) {
  const profiles = {
    bunny: [760, "sine", 3],
    fox: [430, "triangle", 2],
    panda: [125, "triangle", 2],
    cat: [530, "sawtooth", 1],
    dog: [170, "sawtooth", 2],
    penguin: [950, "sine", 3],
  };
  const [base, type, count] = profiles[id] || profiles.bunny;
  const sources = [];
  for (let i = 0; i < count; i++) {
    const t = start + i * 0.15,
      length = id === "cat" ? 0.56 : 0.19;
    const osc = context.createOscillator(),
      filter = context.createBiquadFilter(),
      gain = context.createGain();
    osc.type = type;
    const f = base * (1 + variant * 0.08) * (surprised ? 1.25 : 1);
    osc.frequency.setValueAtTime(f * 0.72, t);
    osc.frequency.exponentialRampToValueAtTime(
      f * (id === "cat" ? 1.4 : 1.13),
      t + length * 0.38,
    );
    osc.frequency.exponentialRampToValueAtTime(
      f * (surprised ? 0.9 : 0.6),
      t + length,
    );
    filter.type = "lowpass";
    filter.frequency.value = id === "dog" ? 700 : id === "panda" ? 460 : 2200;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + length + 0.01);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    sources.push(osc);
  }
  return sources;
}
