// A short cartoon "eeew" vocal gesture: a descending buzz with moving vowel formants.
// This is synthesized locally; there is no speech service or downloaded recording.
export function renderEww(
  context,
  output,
  when = context.currentTime,
  variant = 0,
) {
  const source = context.createOscillator();
  const wobble = context.createOscillator();
  const depth = context.createGain();
  const amp = context.createGain();
  const variants = [190, 225, 170];
  const pitch = variants[variant % variants.length];
  const duration = 0.78;
  source.type = "sawtooth";
  source.frequency.setValueAtTime(pitch, when);
  source.frequency.linearRampToValueAtTime(pitch * 1.12, when + 0.12);
  source.frequency.exponentialRampToValueAtTime(pitch * 0.63, when + duration);
  wobble.frequency.value = 7 + (variant % 3);
  depth.gain.value = 23;
  wobble.connect(depth);
  depth.connect(source.detune);
  amp.gain.setValueAtTime(0, when);
  amp.gain.linearRampToValueAtTime(0.48, when + 0.045);
  amp.gain.setValueAtTime(0.42, when + 0.42);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  amp.connect(output);
  const nodes = [];
  for (const [from, to, level, q] of [
    [320, 390, 1, 4],
    [2400, 760, 0.75, 7],
    [3100, 2200, 0.35, 9],
  ]) {
    const filter = context.createBiquadFilter();
    const mix = context.createGain();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, when);
    filter.frequency.exponentialRampToValueAtTime(to, when + 0.58);
    mix.gain.value = level;
    source.connect(filter);
    filter.connect(mix);
    mix.connect(amp);
    nodes.push(filter, mix);
  }
  source.onended = () => {
    source.disconnect();
    amp.disconnect();
    nodes.forEach((n) => n.disconnect());
  };
  wobble.onended = () => {
    wobble.disconnect();
    depth.disconnect();
  };
  source.start(when);
  wobble.start(when);
  source.stop(when + duration + 0.02);
  wobble.stop(when + duration + 0.02);
  return { sources: [source, wobble], duration: duration + 0.02 };
}
