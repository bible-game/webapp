# Bible Game UI Alignment

The target look and feel is `look-and-feel.md` (the wayfinding theme); the rules below record what the code does today and were brought in line with it on 13 October 2026.

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
| Colour | Colour means region: the map's teal, purple, rose, green and gold mark the book on screen. Guess closeness is the exception: a traffic light of the status colours `success`, `warning` and `error`, which are separate from the region hues (the found chapter is a solid `success`). Utility colours: `help` (blue) and `notice` (yellow). See `look-and-feel.md`. |
| Primary action | When the screen has a book (Play's guess button, the end screen's Read link, Read's Mark as read), the action takes that book's region colour with a dimensional highlight and restrained glow. Otherwise it is a high-contrast white fill. |
| Typography | IBM Plex Sans for navigation, controls, labels and page titles (including the Home tagline); IBM Plex Mono for addresses (guess tiles, book codes, distances) and the map's labels; Literata for scripture (the clue, passages, quiz questions), exposed as `--font-reading`. Optional reader faces live in `reading-fonts.ts`. |
| Letter spacing | Normal spacing for UI text. Avoid decorative, widely spaced uppercase headings. |
| Corners | One 8px radius on every rectangular control, tile, menu and panel; 16px on bottom sheets. Circles only for avatars, dots and calendar days. No pills. |
| Spacing | Use 4px increments, principally 8/12/16/24px. Keep related controls together and use space or borders to divide sections. |
| Controls | Lucide icons at one stroke weight (1.75px), set globally. Accessible names, visible keyboard focus, hover feedback, and explicit disabled states. Main touch controls are 44-48px. |
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

Home opens on a deliberately quiet first screen: a small glowing emblem, the tagline
set quietly in the reading serif ("Explore the Bible" light and muted, then "with a
daily passage guessing game" smaller and fainter, close beneath the emblem), a
single "Play today's chapter" button, and a gently bouncing "How it works" cue at the screen's foot.

The emblem (`home/glowing-cross.tsx`) is always in motion. It opens and rests on the
logo's stained-glass "B", which becomes a mosaic Latin cross and returns. The cross is a jittered lattice of cells;
the B is the logo cell for cell, traced from `public/icon-bright.png` (`home/mosaic.ts`).
Each cell drifts and reshapes into its partner in a wave out from the centre, and the
B's ten extra cells fold into their nearest cross cells (`home/use-mosaic-morph.ts`:
3s on each shape, 2.2s to change). The cells are tinted through the map's divisions in
canonical order with a white neon core; the colours run down the cross and across the
B. Behind it a blurred ring of the division colours turns slowly and a soft white light
breathes. Only the cells' shapes, opacity, scale, and rotation animate; the morph pauses
off-screen and in hidden tabs, and reduced motion leaves the B still.

"How it works" follows the life of a day's game in five steps (clue, map, guesses, read
and study, progress), illustrated with Play's own guess tiles, a sketch of the map, and
example Statistics figures; Read, Study, and Statistics are reached from these steps.
The cross, drawn as a static image, is still the site's share image (`opengraph-image.tsx`).

The shared header holds only the menu and account controls; Play, Read, and Study put
their own title in its centre. The name and logo appear in the menu drawer.

The menu drawer (`core/component/app-header.tsx`) shares the page's 16px gutter. Its
header carries the logo as a crisp SVG (`core/component/logo-mark.tsx`, drawn from the
same traced cells as Home's emblem, so no dark square), the centred name, and Close.
The four destinations are two-line rows (name and a short description) with their
icons in a division colour: Play green, Read teal, Study purple, Statistics gold. The
current destination is tinted in its colour with a restrained glow. At the foot sit the
account (Log in with the gold dot when signed out; initials, name, and Log out when
signed in), then About, Privacy, and Cookies with GitHub and Discord as icons. Rows
rise in a short stagger as it opens. About, Privacy, and Cookies use shared navigation and readable, unframed content.
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

## Figma 1.1.0 refinement (13 October 2026)

Implemented from the refined Figma (see `look-and-feel.md`, Glow and Region key):

- Glow only on the map, stars and emblem: Play's region primary is a flat fill; Read's
  `--reader-glow` is gone (primary, drop cap, scroll progress, chapter, audio, tools).
- Play's help and notice buttons are neutral outlines with a coloured glyph;
  `notice` shares the warning gold.
- Study quiz: five ruled progress cells and a "Question n of 5" row above the
  question (the summary counts as the fifth); disabled Next is neutral. The header
  shows only the passage name.
- Mono chapter numbers (Read sheet, Study chapters) and step numbers `01`–`05` on
  How it works; neutral Read/Study/Statistics icons.
- Welcome sheet: "Welcome to Bible Game" and a five-colour region key.
- Statistics: sentence-case division names with a 4px region key edge, "Bible
  completion", whole percentages ("<1%" for any progress below 1%), neutral Games icon.
- Account pages: sentence case, left-aligned headings, 16px gutter on phones.
- "Chapter-guessing game" in the tagline, metadata, OG image and About.

Checked at 375px against the mock passage service: Play (welcome, select),
Study quiz, Statistics, Home and How it works, Read, Forgot password.
The leaderboard and logged-in states need the user service (:8082), which was off.

Follow-up: required-field asterisks use `ui-notice` (gold), as in Figma. The Read drop cap
now takes the reader's chosen typeface and is sized and placed from that face's metrics
(`reading-fonts.ts`), so it spans from the first line's cap height to the second line's
baseline in Literata, Newsreader, Garamond and Plex Sans at every size and spacing
(measured within 1px), and the third line always runs the full width.

Follow-up: the drop cap rises 0.2em above the first line (`--dc-rise`), foot still on the second
line's baseline (measured: 4–5px rise, 0px at the foot, in every typeface). Play's subline reads
"Paul's letters, New Testament" (`DivisionUtil`, shared with Statistics). Sign up and Log in forms
and their footnote links are left-aligned, as in Figma.
