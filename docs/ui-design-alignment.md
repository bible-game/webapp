# Bible Game UI Alignment

## Reference: Play

Play is the agreed reference experience. The first application-wide alignment is
implemented and ready for page-by-page review.

The distinctive part of the page is the Bible itself: a coloured, navigable map,
a short reading-style clue, and a compact row of guesses. The hierarchy is clear:
date and navigation, clue, feedback, map, action. The fixed footer and flexible map
keep the interface steady as the player selects, guesses, and finishes.

No font or colour establishes which AI authored a design. We assess choices by
their purpose, consistency, legibility, and fit with Bible Game.

## Design Rules

| Element | Rule |
| --- | --- |
| Page chrome | Neutral charcoal, solid surfaces, restrained borders. Values live in `src/core/style/ui-theme.ts`; Play extends these with its division palette. |
| Colour | Preserve the map's teal, purple, rose, green, and gold division colours. Use colour for book identity, progress, or feedback. |
| Primary action | During play, use the selected book's colour with a dimensional highlight and restrained glow. Other primary actions use a high-contrast fill. |
| Typography | Inter for navigation, controls, labels, and numbers; Newsreader (self-hosted via `next/font`, `--font-reading`) for the clue and passages, with optional reader faces in `reading-fonts.ts`; monospace for the map. Keep serif display text tied to reading content. |
| Letter spacing | Normal spacing for UI text. Avoid decorative, widely spaced uppercase headings. |
| Corners | 8px on tiles, menus, popovers, and sheets; retain the calendar's softer 24px corners. Circles for icon controls and days; pills for the existing compact action row and date control. |
| Spacing | Use 4px increments, principally 8/12/16/24px. Keep related controls together and use space or borders to divide sections. |
| Controls | Lucide icons by default, retaining the chosen bare info/alert glyphs and horizon icon without an arrow. Accessible names, visible keyboard focus, hover feedback, and explicit disabled states. Main touch controls are 44-48px. |
| Motion | Short feedback transitions, stable control dimensions, and respect for reduced motion. |
| Panels | Frame overlays and individual guess tiles. Avoid framing every section or placing metric cards inside a popover. |
| Responsive layout | Play retains its 640px content width, dynamic viewport height, safe-area padding, and fixed footer. Other tasks need their own content widths and normal document scrolling. |

The refinement neutralises the brown tint in chrome, softens the guess button's
glass reflection and glow, normalises panel corners and heading treatments, and
adds scoped focus and motion styling. The chosen blue help, yellow anonymous
account, and green logged-in statistics controls remain part of the design.
The calendar retains its original compact trigger, rounded sheet, blurred backdrop,
and month-first layout. Calendar loss text is
lighter so it reads more clearly on dark surfaces. Stats figures are unframed and
use the same UI type as other numeric controls.

The map colours, serif clue, gameplay layout, five guesses, and daily play flow
remain the foundation. Scoped `.play-ui` styling also covers the Play overlays
rendered outside the page container by HeroUI.

## Follow-up Review

- Read and Study have been refined (see below); review Statistics next, followed by Account and the information pages.
- Read and Study use Play's charcoal with division-coloured accents (see below).
- The map library handles its own canvas interaction and accessibility. A full keyboard and screen-reader gameplay audit needs separate work, including a way to select chapters without relying on canvas gestures.

## Implemented Alignment

### 1. Shared Foundation and Navigation

`ui-theme.ts` defines the application palette. `app-header.tsx` shares the Play
navigation across all routes, including active destinations and account controls.
`globals.sass` provides responsive content widths, buttons, inputs, reading surfaces,
focus styles, and reduced motion. The old fixed widths, universal heading rules,
and background gradient have been replaced. Migrated controls use HeroUI.

### 2. Read

Read shares Play's charcoal (`--ui-bg`) and neutral text, and takes its accent
from the division of the passage being read, using the map's colours
(`map/config/colours.json` via `divisionColour` in `core/model/bible/books.ts`):
1 John is rose, Isaiah green, and so on. The accent is set as `--division` on the
root so the sheets share it, and glows are derived from it with `color-mix`.

The shared header carries just the passage title, larger than other header text,
as a button. It opens a deliberately small passage sheet: a search to go to any
reference, and the current book's chapters (current filled, read ones dotted).
A glowing line along the header's lower edge shows progress through the chapter.
The estimated reading time sits on the right of the "What comes before" line. Verses flow as one serif
paragraph with accented verse numbers and a two-line initial in the division
colour. Dimming is gentle: verses within the reading band of the screen stay fully
lit, and only those beyond it soften to 60%. Everything in view is lit at the top
and the end of the page.

A bottom toolbar holds Text (typeface, size, spacing), the translation's name in
the centre, which opens a searchable list of translations, and Listen. It tucks
away while reading down and returns on scroll up or at the end; the audio player
sits above it while open. Settings are remembered per browser, and the address
follows the passage.

The chapter ends with Mark as read and Study. Mark as read confirms in its own
label, as Play's share button does, then stays disabled as Read, with a tooltip
saying the passage is already tracked; Study then takes the primary style.

### 3. Study

Study shares Read's charcoal and division-coloured accent (`useDivisionAccent`).

The home lists your latest studies (stars and date) above a grid of books, each
tinted in its division's colour, with an Old/New filter and search. Choosing a book
shows its chapters, with studied chapters tinted and starred. Random opens a study
within the current filter.

A study runs one step at a time: four questions, then a summary. The header carries
the passage and "Question n of 5", with the progress line beneath. Questions are set
in Newsreader; answers are lettered cards in a radio group (arrow keys move the
choice), and the selected card takes the division colour. A pill Next (and Back)
sit in a fixed footer. The summary is graded live, as before. The passage opens in
Read's dark bottom sheet.

Once submitted, the study opens on its result: the stars, a row of figures (stars,
correct answers, summary score), and an answers review in a raised panel. Right and
wrong answers use the app's green and red, always with an icon and a label, and the
model summary follows yours. The API has no per-question explanations.

### 4. Statistics

Statistics uses unframed figures, a tabular leaderboard, the shared progress colours,
and touch-sized chapter controls. Book/chapter expansion exposes its state to
assistive technology. The login reminder uses the normal page treatment.

### 5. Account

Login, registration, recovery, and password reset share their labels, input surfaces,
validation appearance, and submit buttons. The account layout provides common
navigation. Existing submission and success flows remain.

### 6. Home and Information

Home opens on a full-height hero around a small glowing cross (`home/glowing-cross.tsx`):
an SVG Latin cross laid as a mosaic of cells, like the stained-glass logo, tinted
through the map's divisions in canonical order (teal Law to gold Gospels) with a
white neon core. Behind it a blurred ring of the division colours turns slowly and a
soft white light breathes where the beams meet; only opacity, scale, and rotation
animate, and reduced motion leaves it still. Beneath it sit the title, John 8:12 in
the reading serif, a high-contrast "Play today's chapter" button, and quiet links to
Read, Study, and Statistics. The index of destinations and the footer follow below
the fold. About, Privacy, and Cookies use shared navigation and readable, unframed content.
The information pages retain their existing policy text.

## Review Process

The alignment establishes consistency; individual page refinement is the next step.
Review each page on desktop and phone, including text fitting, keyboard focus,
safe areas, and its loading, empty, selected, disabled, and completed states.

Browser checks cover twelve routes at 1440px, 390px, and 320px, plus Play's map
rendering, selection, calendar, and completion states. Interaction checks cover
testament filtering, chapter bounds, keyboard answers, saved guest study completion,
passage drawer focus, translation menus, saved guest reading progress, empty search,
and password visibility. Build and TypeScript checks pass. Existing lint and
framework deprecation warnings remain.

Authenticated server submissions, password email delivery, and live audio playback
were not exercised by these UI checks.
