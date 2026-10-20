export const ASSET = new URL("../assets/race-v2/", import.meta.url).href;
export const ICONS = {
  install: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  share: '<path d="M12 16V2m-4 4 4-4 4 4M6 10H3v12h18V10h-3"/>',
  rocket:
    '<path d="M9 15c-3-5 1-10 10-12 2 9-1 14-6 14z"/><circle cx="15" cy="8" r="2"/><path d="m8 10-5 3 5 1m7 2-2 5-1-5M7 17l-3 3m1-5-3 3m7 1-3 3"/>',

  plate:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M1 3v6m2-6v6m-1 0v12M23 3v18"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  heart: '<path d="M12 21 3 12C-3 4 7-1 12 6c5-7 15-2 9 6z"/>',
  moon: '<path d="M19 15A8 8 0 0 1 9 4a9 9 0 1 0 10 11Z"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  strong:
    '<path d="m3 15 2-7 5-2 2 3-3 2-2-1-1 5c6-4 10-4 13-1l2 5c-5 4-13 4-18-1z"/>',

  play: '<path d="m9 5 11 7-11 7z"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15m6-12v15"/>',
  sound:
    '<path d="M3 9v6h4l5 4V5L7 9z"/><path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="M3 9v6h4l5 4V5L7 9z"/><path d="m17 9 5 6m0-6-5 6"/>',
  settings:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m9 12 2 2 4-5"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  replay: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  trophy:
    '<path d="M7 3h10v6a5 5 0 0 1-10 0zM12 14v6m-4 1h8M7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4"/>',
  hand: '<path d="M8 12V5a2 2 0 0 1 4 0v6-2a2 2 0 0 1 4 0v3-1a2 2 0 0 1 4 0v6c0 3-2 5-5 5h-3c-3 0-4-2-5-3l-4-5a2 2 0 0 1 3-2l2 2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  flag: '<path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
};
export function icon(id, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] || ICONS.flag}</svg>`;
}
export function scenery(level = 1) {
  const sunset = level >= 10;
  const sky = sunset ? "#f5d3ae" : "#bce3eb";
  const hill = sunset ? "#b9cba1" : "#a6d2ad";
  const tree = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path fill="#9c8060" d="M-6-4H6v35H-6z"/><path fill="#547d61" d="M-26-20h52V8h-52zM-18-36h36v52h-36zM-34-11h68v22h-68z"/><path fill="#7ba873" d="M-20-28h33v29h-33zM-28-12h28v16h-28z"/><path fill="#97bf82" d="M-12-27h12v8h-12z"/></g>`;
  return `<svg class="scenery" viewBox="0 0 1200 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true" shape-rendering="crispEdges"><rect width="1200" height="250" fill="${sky}"/><g fill="#ffffffb5"><path d="M86 38h61v11h18v15H65V49h21zM462 17h42v10h23v17h-82V30h17zM981 31h58v12h20v16h-98V44h20z"/></g><path fill="#d9e4b8" d="M0 135h64v-17h70V99h80v17h60v23h68v-16h80V94h88v18h70v20h86v-29h80V85h80v23h80v22h86v-20h75V91h85v18h80v26h96v115H0z"/><path fill="${hill}" d="M0 176h78v-22h89v-17h73v18h86v25h85v-20h82v-19h83v18h91v19h91v-23h83v-17h76v19h82v23h96v-25h92v-17h93v112H0z"/>${tree(27, 162, 1.05)}${tree(145, 173, 0.7)}${tree(350, 168, 0.84)}${tree(795, 163, 0.9)}${tree(1040, 167, 0.72)}${tree(1177, 166, 1.12)}<g transform="translate(460 118)"><path fill="#f4eddb" d="M0 0h270v16H0z"/><path fill="#7e9e98" d="M10 16h250v80H10z"/><path fill="#e0dbcc" d="M0 83h270v17H0z"/><path fill="#f6d299" d="M14 4h24v12H14zm48 0h24v12H62zm48 0h24v12h-24zm48 0h24v12h-24zm48 0h24v12h-24z"/><g fill="#edaf8c"><path d="M28 35h12v12H28zm49 0h12v12H77zm45 0h12v12h-12zm49 0h12v12h-12zm48 0h12v12h-12z"/></g><g fill="#f2e6b9"><path d="M23 50h22v16H23zm49 0h22v16H72zm45 0h22v16h-22zm49 0h22v16h-22zm48 0h22v16h-22z"/></g></g><path stroke="#f7f1d8" stroke-width="3" fill="none" d="M0 73Q170 137 350 79M840 75q180 70 360-3"/><g fill="#e38879"><path d="m14 78 19 5-14 15zm89 23 19 3-11 15zm92 1 20-3-6 18zm90-13 19-5-3 18zm584-7 19 5-14 15zm89 23 19 3-11 15zm92-1 20-3-6 18zm90-13 19-5-3 18z"/></g><path fill="#a3c693" d="M0 218h1200v32H0z"/></svg>`;
}
export function checkers() {
  return `<span class="checkers" aria-hidden="true"></span>`;
}
