# Bible Game Look and Feel

Status: agreed direction, 12 October 2026. This is the **target** theme. `ui-design-alignment.md` records what is already implemented in code; where the two differ, this document is where the code is heading. The Figma file (Style Guide page, components `1.1.0+`, hi-fi wireframes) is built from it.

## The theme: wayfinding

Bible Game is a map, and the interface is the equipment you use to read it. The Bible is the territory. Every screen should make clear where you are, what you have seen and what is left. Colour says where you are. Light says what you know. Everything else stays quiet so the map can be the thing people remember.

## Four ideas

**Place: colour means region.** The five division hues (teal, purple, rose, green, gold) are wayfinding, not decoration. A screen has at most one region colour: the colour of the book you are in. Play, Read, Study and the Study book chips take it from the book on screen. Screens with no book (Home, Log In, Statistics) are neutral. All five colours appear together only where the whole territory is visible: the map, its legend and coverage.

**Address: everything has a coordinate.** Short book codes (`MAT 5`, `40.MAT`) are how the interface names a place in the map, the guess row and the share result. Full names ("Numbers 9") are for prose. Distances are readings: signed, in verses, in tabular figures. Numbers are the data, so they are set carefully and never used as ornament.

**Light: known territory is lit.** What the player has ruled out dims; what they find glows. The same rule runs through the interface: lit means you have been here or you are acting here. Light is a brightness, not a new hue. The mosaic B and cross are the map's cells lighting up.

**Furniture: the interface behaves like map equipment.** The header is a title block, the five guess slots are a key of readings, sheets are insets, and the legend explains the colours.

## Decisions

| Question | Decision |
| --- | --- |
| Closeness | Shown as how brightly a slot is lit, not as a hue. Region colour appears only on the found chapter. Closeness no longer reuses the division hues. |
| Primary action | Takes the region colour when the screen has a book (Select on Play, Mark as read on Read). Otherwise it is a high-contrast white fill. |
| Home tagline | Interface sans, not serif. Serif is reserved for scripture. |
| Shape | One small radius, 8px, on every rectangular control, panel and chip. Sheets use 16px. Circles only for avatars, dots and calendar days. No pills. |
| Typefaces | IBM Plex Sans (interface), IBM Plex Mono (addresses and distances), Literata (scripture). Replaces Inter and Newsreader. |
| Utility colours | Blue `#4cc9ff` means help; yellow `#e8b04f` means a notice (not logged in). They are a separate category and are never used for regions. |
| Stars | Stay gold, as the reward. This is the one accepted overlap with the gold region. |

## Colour

| Group | Tokens | Use |
| --- | --- | --- |
| Surfaces | `ui/bg`, `ui/surface`, `ui/raised`, `ui/line` | Ground, panels, selected or hover, 1px lines. Neutral charcoal. |
| Text | `ui/text`, `ui/muted`, `ui/faint` | Primary, secondary, placeholder. |
| Regions | `play/teal`, `play/purple`, `play/rose`, `play/green`, `play/gold` | The book's division. Never decorative. |
| Light | `light/1`, `light/2`, `light/3` | `ui/text` at 8%, 18% and 34%. The brightness steps for closeness and selection. |
| Utility | `ui/help`, `ui/notice`, `ui/accent` (stars) | Help, not-logged-in notice, star reward. |
| Feedback | `ui/won`, `ui/lost` | Reserved for small marks (a tick or cross) only. Neither is used as a fill, because green and red overlap the region hues. |

### Closeness slots

| State | Fill | Text | Edge |
| --- | --- | --- | --- |
| Empty | none | n/a | dashed `ui/line` |
| Far | `light/1` | `ui/faint` | `ui/line` |
| Near | `light/2` | `ui/muted` | `ui/line` |
| Close | `light/3` | `ui/text` | `ui/line` |
| Found | the chapter's region colour | `ui/bg` | none |
| Answer (lost game) | `light/1` | `ui/text` | `ui/text` |

Distance bands are unchanged: up to 500 verses is Close, up to 2,000 is Near, beyond is Far.

## Typography

| Role | Face | Rule |
| --- | --- | --- |
| The page | Literata | Anything from, or about, a specific passage: the clue, passage titles, reading text, quiz questions and the drop cap. |
| The chart | IBM Plex Sans | Everything that is interface: page titles (Study, Statistics), buttons, labels, the Home tagline. |
| Addresses | IBM Plex Mono | Book codes, chapter numbers and distances, so figures line up. Map labels use the same face. |

One scale: 12, 14, 16, 18, 20, 22, 24 and 32, plus 72 for the drop cap. Headings keep normal letter spacing. No all-caps eyebrows.

## Shape, spacing, icons

- Cells are ruled by hairlines (1px `ui/line`). No drop shadows. Glow is permitted only as light, on the one lit thing per screen.
- A dot grid is the only texture, reserved for the map and coverage areas.
- Spacing on a 4px grid: 4, 8, 12, 16, 24. Touch targets 44px, fields and primary buttons 48px.
- Icons are Lucide at one stroke weight (1.75px) until a custom set exists.

## Motion

Nothing moves on its own except the emblem. Movement answers an action: a reading arrives (a slot fills), territory lights (the map), a find blooms, stars light one at a time. Transitions are short and respect reduced motion.

## Voice

Plain, steady and a little reverent. Sentence case, active verbs (Guess, Read, Study), exact names. On touch devices say "Tap"; "Click" appears only for pointer devices, as it does today. "Chapter" is the unit of the game; "passage" is only for free selection in Read. Errors say what to do next. No sparkles or emoji in the interface; the share text keeps its colour squares.

## What it is not

Cream and terracotta. Piles of identical rounded cards. Gradient mood washes. Frosted-glass blur. Mascots or sparkles. All-caps eyebrows. A hue that means two things on one screen.

## One memorable thing

The lit map. The rest of the interface stays disciplined so the map, and the emblem that echoes it, are the only places the product raises its voice.

## Tests

- **Cover the map.** Is it still recognisably Bible Game?
- **Colour audit.** On any screen without a book, is there more than one region colour? Is any hue carrying two meanings?
- **Swap test.** Replace the logo: could this be another app?
- **Scales.** One type scale, one radius, one icon stroke weight.

## Implementation notes (for the code pass)

- `ui-theme.ts`: add the light levels, `help` and `notice`; stop using `accent` for anything but stars.
- `closeness.ts` and `guess.tsx`: replace tinted hue bands with the light levels above; keep the distance thresholds.
- `layout.tsx` and `globals.sass`: swap the fonts; reduce radii to 8 and 16; remove pills.
- Headings: serif only on scripture-bound text; page titles and the Home tagline move to the sans.
- Statistics: keep the current layout (figures, leaderboard, per-book completion). Restyle the per-book bars as rows of coverage cells in the book's region colour, as in the Figma wireframe.
- Drawer and Stats icons: neutral, with the current page lit, instead of a hue per page.
