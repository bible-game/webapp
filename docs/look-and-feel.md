# Bible Game Look and Feel

Status: agreed direction, 12 October 2026. This is the **target** theme. `ui-design-alignment.md` records what is already implemented in code; where the two differ, this document is where the code is heading. The Figma file (Style Guide page, components `1.1.0+`, hi-fi wireframes) is built from it.

## The theme: wayfinding

Bible Game is a map, and the interface is the equipment you use to read it. The Bible is the territory. Every screen should make clear where you are, what you have seen and what is left. Colour says where you are. Light says what you know. Everything else stays quiet so the map can be the thing people remember.

## Four ideas

**Place: colour means region.** The five division hues (teal, purple, rose, green, gold) are wayfinding, not decoration. A screen has at most one region colour: the colour of the book you are in. Play, Read, Study and the Study book chips are filled in their division colour. Screens with no book (Home, Log In, Statistics) are neutral. All five colours appear together only where the whole territory is visible: the map, its legend and coverage.

**Address: everything has a coordinate.** Short book codes (`MAT 5`, `40.MAT`) are how the interface names a place in the map, the guess row and the share result. Full names ("Numbers 9") are for prose. Distances are readings: signed, in verses, in tabular figures. Numbers are the data, so they are set carefully and never used as ornament.

**Light: known territory is lit.** What the player has ruled out dims; what they find glows. The same rule runs through the interface: lit means you have been here or you are acting here. Light is a brightness, not a new hue. The mosaic B and cross are the map's cells lighting up.

**Furniture: the interface behaves like map equipment.** The header is a title block, the five guess slots are a key of readings, sheets are insets, and the legend explains the colours.

## Decisions

| Question | Decision |
| --- | --- |
| Closeness | A traffic light in the status colours: `ui/success` (Close), `ui/warning` (Near), `ui/error` (Far). The found chapter is a solid `ui/success`. Decided 13 October 2026, after the brightness-only version was tried and dropped: the steps were too subtle to read. This is the one place colour does not mean region. |
| Primary action | Takes the region colour when the screen has a book (Select on Play, Mark as read on Read). Otherwise it is a high-contrast white fill. |
| Home tagline | Interface sans, not serif. Serif is reserved for scripture. |
| Shape | One small radius, 8px, on every rectangular control, panel and chip. Sheets use 16px. Circles only for avatars, dots and calendar days. No pills. |
| Typefaces | IBM Plex Sans (interface), IBM Plex Mono (addresses and distances), Literata (scripture). Replaces Inter and Newsreader. |
| Utility colours | Blue `#4cc9ff` means help. Notice (not logged in) shares `ui/warning`: one gold for "needs attention" (merged 13 October 2026). The help and notice buttons on Play are neutral outlines with only the glyph coloured, so no extra hue competes with the map. |
| Glow | Light, not decoration. Only the map's selected or found cell, the stars and the emblem glow. Buttons (including region-colour primaries) and the drop cap are flat. Decided 13 October 2026. |
| Region key | On a neutral cell, a 4px edge in the division colour names the place, like the map's legend. Used for the Statistics division headings. Study book chips stay solid region fills with dark text (the user's choice). Decided 13 October 2026. |
| Stars | Stay gold, as the reward. This is the one accepted overlap with the gold region. |

## Colour

| Group | Tokens | Use |
| --- | --- | --- |
| Surfaces | `ui/bg`, `ui/surface`, `ui/raised`, `ui/line` | Ground, panels, selected or hover, 1px lines. Neutral charcoal. |
| Text | `ui/text`, `ui/muted`, `ui/faint` | Primary, secondary, placeholder. |
| Regions | `play/teal`, `play/purple`, `play/rose`, `play/green`, `play/gold` | The book's division. Never decorative. |
| Light | `light/1`, `light/2`, `light/3` | `ui/text` at 8%, 18% and 34%. The brightness steps for hover, selected and current states, and quiz answers. |
| Utility | `ui/help`, `ui/notice` (alias of `ui/warning`), `ui/accent` (stars) | Help, not-logged-in notice, star reward. |
| Status | `ui/success`, `ui/warning`, `ui/error` | Named separately from the region hues so they can diverge, but currently the same sage green, gold and rose as the map (the original traffic light, kept after a brighter set was tried and rejected as ugly). Success is Close guesses, the found chapter and "logged in"; warning is Near guesses; error is Far guesses and form errors. `ui/orange` is the streak flame and the fourth dot step. |

### Closeness slots

| State | Fill | Text | Edge |
| --- | --- | --- | --- |
| Empty | none | n/a | dashed `ui/line` |
| Far | `closeness/far-fill` (`ui/error` at 14%) | `ui/error` | `closeness/far-edge` (45%) |
| Near | `closeness/near-fill` (`ui/warning` at 14%) | `ui/warning` | `closeness/near-edge` (45%) |
| Close | `closeness/close-fill` (`ui/success` at 14%) | `ui/success` | `closeness/close-edge` (45%) |
| Found | solid `ui/success` | `ui/bg` | `ui/success` |
| Answer (lost game) | `light/1` | `ui/text` | `ui/text` |

Distance bands: up to 500 verses is Close, up to 2,000 is Near, beyond is Far. The guess counter's dots add a fourth step (`ui/orange`, up to 5,000 verses), in step with the share text's squares.

## Typography

| Role | Face | Rule |
| --- | --- | --- |
| The page | Literata | Anything from, or about, a specific passage: the clue, reading text, quiz questions, the model summary and the drop cap. Titles and headings, including passage names, stay in Plex Sans. |
| The chart | IBM Plex Sans | Everything that is interface: page titles (Study, Statistics), buttons, labels, the Home tagline. |
| Addresses | IBM Plex Mono | Book codes, chapter numbers, step numbers (`01`–`05`) and distances, so figures line up. Map labels use the same face. |

One scale: 12, 14, 16, 18, 20, 22, 24 and 32, plus 72 for the drop cap. Headings keep normal letter spacing. No all-caps eyebrows.

## Shape, spacing, icons

- Cells are ruled by hairlines (1px `ui/line`). No drop shadows. Glow is permitted only as light (see Glow above).
- Progress is a row of ruled cells: the guess slots, the Study quiz steps (five: four questions and the summary, which counts as a question, so "Question 1 of 5") and coverage. Calendar days use the guess slots' tint and edge for won, lost and started.
- A dot grid is the only texture, reserved for the map and coverage areas.
- Spacing on a 4px grid: 4, 8, 12, 16, 24. Touch targets 44px, fields and primary buttons 48px.
- Icons are Lucide at one stroke weight (1.75px) until a custom set exists.

## Motion

Nothing moves on its own except the emblem. Movement answers an action: a reading arrives (a slot fills), territory lights (the map), a find blooms, stars light one at a time. Transitions are short and respect reduced motion.

## Voice

Plain, steady and a little reverent. Sentence case, active verbs (Guess, Read, Study), exact names. On touch devices say "Tap"; "Click" appears only for pointer devices, as it does today. "Chapter" is the unit of the game; "passage" is only for free selection in Read. Errors say what to do next. No sparkles or emoji in the interface (the party-popper icon on the found slot is a deliberate exception); the share text keeps its colour squares.

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
- `closeness.ts`: tinted traffic-light bands, plus a solid green for the found chapter.
- `layout.tsx` and `globals.sass`: swap the fonts; reduce radii to 8 and 16; remove pills.
- Headings: serif only on scripture-bound text; page titles and the Home tagline move to the sans.
- Statistics: keep the current layout (figures, leaderboard, per-book completion). Restyle the per-book bars as rows of coverage cells in the book's region colour, as in the Figma wireframe.
- Drawer and Stats icons: neutral, with the current page lit, instead of a hue per page.
- Refinement pass (13 October 2026, Figma 1.1.0): flat buttons and drop cap; neutral help/notice buttons; `ui/notice` aliases `ui/warning`; region key on Statistics division headings; Read and Study headers in Plex Sans; quiz progress as five cells (new `Quiz Progress` component); mono step numbers on How it works (no numbered circles); Region Key strip on the welcome sheet; calendar day states shown; sentence case on account screens and Statistics; 16px gutter on account screens; Home tagline says "chapter-guessing".
