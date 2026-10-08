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

- Read has been refined (see below); review Study next, followed by Statistics, Account, and the information pages.
- Read uses a dark, warm reader variant (see below). Study's passage drawer still uses the light `.reading-surface` and should be reconsidered in the Study review.
- The map library handles its own canvas interaction and accessibility. A full keyboard and screen-reader gameplay audit needs separate work, including a way to select chapters without relying on canvas gestures.

## Implemented Alignment

### 1. Shared Foundation and Navigation

`ui-theme.ts` defines the application palette. `app-header.tsx` shares the Play
navigation across all routes, including active destinations and account controls.
`globals.sass` provides responsive content widths, buttons, inputs, reading surfaces,
focus styles, and reduced motion. The old fixed widths, universal heading rules,
and background gradient have been replaced. Migrated controls use HeroUI.

### 2. Read

Read is a dark, warm reading room: a deliberate task-specific variant inspired by
editorial reading apps. Its tokens live under `.reader` in `globals.sass`: warm
off-white text, a soft amber wash at the top, and the `uiTheme` amber and gold
for accents, with a restrained glow on progress and active controls.

The shared header carries the passage title and translation in its centre, which
open Contents. A glowing line along its lower edge shows progress through the
chapter. Verses flow as one serif paragraph with amber verse numbers and a
two-line gold initial. Dimming is gentle: verses within the reading band of the
screen stay fully lit, and only those beyond it soften to 60%. Everything in view
is lit at the top and the end of the page.

A bottom toolbar holds four controls: Text, Contents, Listen, and Mark as read.
It tucks away while reading down and returns on scroll up or at the end. The audio
player sits above the controls while open. The Text sheet sets translation,
typeface (Newsreader, Literata, EB Garamond, Inter), size, and line spacing,
remembered per browser. The Contents sheet offers passage search and a book list
with chapter grids that mark the current and read chapters. The address follows
the passage, and the chapter ends with the next chapter and Study.

### 3. Study

Study uses compact headings, segmented testament filters, shared inputs, and
unframed question groups. Selected and graded answers have clear outlines and
status colours. Radios support keyboard selection. The passage drawer uses HeroUI
for focus management and dismissal. Changing testament keeps the chosen book valid.

### 4. Statistics

Statistics uses unframed figures, a tabular leaderboard, the shared progress colours,
and touch-sized chapter controls. Book/chapter expansion exposes its state to
assistive technology. The login reminder uses the normal page treatment.

### 5. Account

Login, registration, recovery, and password reset share their labels, input surfaces,
validation appearance, and submit buttons. The account layout provides common
navigation. Existing submission and success flows remain.

### 6. Home and Information

Home is a compact index of the four main destinations, with the Bible Game mark.
About, Privacy, and Cookies use shared navigation and readable, unframed content.
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
