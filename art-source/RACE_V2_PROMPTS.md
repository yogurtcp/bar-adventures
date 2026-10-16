# Race v2 generated artwork

Generated on 2026-10-15 with the **built-in imagegen tool**. Four sprite calls and four ending calls. Original outputs remain in `/home/yevgeny/.codex/generated_images/01a14011-890d-7c00-ab7c-58091e968770/`; the selected, unmodified PNGs were copied into this project’s `public/assets/race-v2/` directory. No API-key CLI or substitute image model was used.

The original `/home/yevgeny/Pictures/bar1.png` was inspected and used as an identity reference for Bar only. It is not a runtime asset. Existing `public/assets/scenes/race-win.webp` was a style/palette reference for sprites; the new sprites were references for the ending scenes.

## Shared sprite prompt

> Use case: illustration-story. Asset type: transparent sprite for a tablet racing game. One isolated cute chunky pixel-art go-kart facing RIGHT, nearly side-on but with a little front three-quarter visibility so the driver's face is clearly readable. Full car and wheels in frame, no shadow extending far away, no track, no floor, no lettering or numbers, no watermark. Truly transparent background. Cohesive 32-bit pixel game art: crisp stepped pixel edges, dark navy 2-pixel outlines, clean clusters, limited color shading, NOT soft painted or 3D art. Vehicle much wider than tall, large readable driver head above the open cockpit, visible hands on steering wheel, small front nose pointing right, two chunky black wheels. The whole sprite has approx 160x120 logical pixels, centered in the canvas with transparent margin. White sporty racing stripes on hood.

Each call appended its driver specification:

- **bar.png**: “Driver is Bar, the same very young boy in reference photo, preserve his short tousled dark-brown hair, huge grey-green eyes, small nose and slim youthful face. White T-shirt. Happy focused driving expression, both hands gripping wheel, clearly visible face turned slightly toward viewer. Bright cherry RED kart.” References: original photograph and prior race victory scene. Source `exec-0f41a424-75a0-45a2-a944-9da94ba6ea89.png`.
- **bunny.png**: “Driver is an adorable small WHITE BUNNY with tall ears, pink inner ears, black shiny eyes and cheerful focused face. Bubblegum PINK kart. No human.” Reference: prior race victory scene. Source `exec-e310dc38-4819-49b2-919e-5abfff113933.png`.
- **fox.png**: “Driver is an adorable small ORANGE FOX with pointed ears, cream muzzle, black shiny eyes and cheerful focused face. Golden YELLOW kart. No human.” Reference: prior race victory scene. Source `exec-39e62a8f-938b-4d72-a9bb-45c6331ae3de.png`.
- **panda.png**: “Driver is an adorable small PANDA with black round ears, black eye patches, black shiny eyes and cheerful focused face. Bright sky BLUE kart. No human.” Reference: prior race victory scene. Source `exec-13e4bd31-bf43-4af0-bc33-4db1bb3515f6.png`.

Each ended: “Reference images are for character identity and palette only, not camera angle: create the requested side-view right-facing racing sprite.” Transparent background enabled. All four are 1448 × 1086 RGBA PNGs with alpha ranging from 0 to 255.

## Shared ending prompt

> Use case: illustration-story. Asset type: end-of-race illustration for a speech-free children's tablet game. A polished wide LANDSCAPE 3:2 composition in the same cute chunky pixel art as the provided four driver sprite references, with crisp stepped edges, bright limited palette and consistent character likeness. Sunny woodland raceway, spectators, red-and-cream track curbs, a large black-and-white checkered finish banner with NO letters. Four racers: Bar the young boy with short tousled dark-brown hair, grey-green eyes, white shirt in RED kart; white bunny in PINK kart; orange fox in YELLOW kart; panda in BLUE kart. Each driver must be clearly visible in an open cockpit. Keep car colors and characters consistent with input sprites. All cars face diagonally to the RIGHT, foreground winner larger, others clearly behind left. Full cars and heads visible, no cropped faces. No written words, numbers, logos, watermark, speech bubbles, crying, humiliation, crashes or danger.

References for every ending: original photograph and all four new sprite PNGs. Opaque background. Outputs are 1536 × 1024 RGB PNGs.

- **victory.png** appended: “Bar is the winner, crossing the finish in the foreground red car. Bar beams with delight and lifts one hand in a fist pump, the other on the steering wheel. Bunny, fox and panda behind cheer. A little golden trophy is on the track edge. A few tasteful confetti pixels. Warm happy victory.” Source `exec-fd4fe132-5db6-4416-96d9-17b092edde6f.png`.
- **finish-bunny.png** appended: “The WHITE BUNNY in the PINK kart is the clear winner, crossing the finish first in the foreground, raising a paw. Bar in his RED kart is visibly behind, smiling warmly and waving to congratulate the bunny, a little determined for a rematch. Fox and panda cheer further behind. This is a friendly sportsmanlike finish. No trophy for Bar, no second human.” Source `exec-79349c98-f391-4d4c-99f2-7a913992a94a.png`.
- **finish-fox.png** appended: “The ORANGE FOX in the YELLOW kart is the clear winner, crossing the finish first in the foreground, raising a paw. Bar in his RED kart is visibly behind, smiling warmly and waving to congratulate the fox, a little determined for a rematch. Bunny and panda cheer further behind. This is a friendly sportsmanlike finish. No trophy for Bar, no second human.” Source `exec-0e49dda7-3dc7-4161-82fb-7b330284ca3c.png`.
- **finish-panda.png** appended: “The PANDA in the BLUE kart is the clear winner, crossing the finish first in the foreground, raising a paw. Bar in his RED kart is visibly behind, smiling warmly and waving to congratulate the panda, a little determined for a rematch. Bunny and fox cheer further behind. This is a friendly sportsmanlike finish. No trophy for Bar, no second human.” Source `exec-8935a2e4-28c8-40b1-a559-aec821da27b1.png`.

## Rendering

Sprites are independent `<img>` elements; code controls their actual positions, lane placement, acceleration, exhaust, and reactions. Endings appear only after the animated finish. The track, flags, icons and scenery are native code graphics, not generated screenshots. No original photo or generated contact sheet is needed at runtime.

## Bar reaction variants — 2026-10-16

Two additional **built-in imagegen edits**, each referencing `bar.png` as the edit target and the original photograph as an identity reference. Transparent background preserved. Selected PNGs copied unchanged into `public/assets/race-v2/`.

Shared prompt:

> Use case: identity-preserve. Edit target: reference image 1 is the finished transparent Bar/red-car game sprite. Reference image 2 is his original photograph for identity only. Make a matching expression variant for use as an animation keyframe. Preserve the EXACT same full red car, wheels, white stripes, lighting, outline, camera angle, silhouette of the car, right-facing direction, canvas dimensions and transparent background. Preserve Bar's apparent age, short tousled brown hair, grey-green eyes, white shirt and recognizable facial proportions. Same cute crisp pixel-art style. Keep his head in approximately the same location and both hands on the steering wheel. Change only his facial expression and a very small upper-body gesture. No text, no symbols, no extra scenery, no new props.

- **bar-boost.png** appended: “Bar has an excited acceleration expression: bright delighted eyes and a bigger joyful open grin, leaning forward just a little, focused on the race. It must read as a happy speed burst.” Source `exec-799bfb62-a321-4d51-9b15-bd853b0ae0fc.png` in the same generated output directory.
- **bar-oops.png** appended: “Bar has a gentle puzzled expression after an engine sputter: one slightly raised eyebrow, eyes looking toward the animal ahead, small round surprised mouth. Friendly and recoverable, no tears, no shame, no frightened expression. It must clearly differ from the happy default smile.” Source `exec-5b28b51e-c55d-403e-afb2-7ef557b44cb2.png`.

Both images were visually checked against the base car before wiring them into the answer/retry flow.
