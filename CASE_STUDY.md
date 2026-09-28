# RECLAIM — Product & Design Case Study

## The brief

RECLAIM is a design-first habit-change product prototype. The objective is not feature breadth; it is to make the moment of behavior change feel clear, private, reversible, and genuinely usable.

The central question is:

> When someone opens the app at a difficult or ordinary moment, what is the smallest amount of information and interaction that helps them make the next useful choice?

## Product thesis

Habit change is already cognitively expensive. The interface should therefore reduce decisions, avoid shame, keep the next useful action visible, and make progress legible without turning the experience into a game or a clinical dashboard.

The core loop is:

**Notice → Pause → Choose → Check in → See progress**

## Current information architecture

RECLAIM now uses five persistent destinations because the product evolved beyond the original three-destination case-study scope:

### Today
The operational home screen.

It answers:
- What am I working on?
- What is my current run?
- Have I checked in today?
- What does this behavior look like?
- What can I do in a difficult moment?
- What has the last week looked like?

The focus carousel is the visual centerpiece. It uses a behavior-specific scene for each supported focus rather than a generic icon.

### Progress
Reflection rather than analytics.

It answers:
- What is my current run?
- What is my personal best?
- How consistent was this week?
- What happened over the last 14 days?
- What milestone comes next?

### Pause
A dedicated ten-minute intervention.

The timer is timestamp-driven, so elapsed time remains accurate if the browser throttles or backgrounds the tab. The screen provides a simple sequence: breathe, let the urge pass, do something else, then return.

### Insights
A data-derived reflection layer.

Earlier concept work contained static mood and trigger content. That was removed because the data model never collected mood or triggers. Insights now uses only actual check-ins and computes:
- 14-day rhythm
- 28-day weekday consistency
- total recorded check-ins
- fresh starts

The interface explicitly avoids inventing behavioral data.

### Settings
Trust and control.

It covers:
- appearance
- local privacy
- backup export
- backup restore
- destructive local-data reset

## Behavioral model

A goal is represented by:
- id
- label
- visual category/accent
- startedAt
- personal best
- check-in count
- fresh-start count
- active state
- optional reason

A check-in is represented by:
- date
- goal id
- stayed-on-track state

The data model intentionally stays small. It is enough to create useful longitudinal feedback without pretending to measure psychological state.

## Fresh starts

A fresh start is reversible in meaning even though it changes the active run.

It:
- preserves previous check-ins
- preserves the best run
- increments fresh-start history
- moves the active run start date to now
- clears only today's active check-in

The product language is deliberately non-punitive: restarting is part of the loop, not a failure state.

## Navigation

Mobile uses a persistent five-item bottom navigation:

**Today · Progress · Pause · Insights · Settings**

The navigation is viewport-level and safe-area aware. The active state is represented by surface contrast, semantic color, icon, label, and a small position indicator rather than hover-only treatment.

Desktop switches to a fixed navigation rail at wide widths.

The top bar is fixed and contextual. It shows:
- current destination
- current context
- current focus and run
- privacy status
- settings

## RECLAIM / SPACE visual language

The current system intentionally moves away from the earlier liquid-glass exploration.

### Expressive, not decorative
Visual treatment should explain behavior or state.

A smoking focus shows a broken loop and dissipating smoke.
A scrolling focus shows a feed and interrupted interaction.
A shopping focus shows a cart and a closed purchase path.
A caffeine focus shows the reflex and its interruption.

The exact visual metaphor changes, but the grammar remains constant.

### One focus, one scene
The current focus card has:
- a scene
- active-state treatment
- behavior statement
- optional reason
- current run
- weekly rhythm
- personal best
- today's recorded state

The next card remains partially visible so horizontal interaction is discoverable without a tutorial.

### Calm depth
The current system uses solid surfaces, semantic contrast, restrained gradients, borders, and controlled ambient light. Effects are subordinate to hierarchy.

### Typography
Google Sans is the single product typeface. The previous Work Sans/Cotham split was removed because two unrelated display systems made the product feel assembled rather than authored.

Typography uses:
- 700 for primary headings
- 600 for strong labels
- 500 for controls
- 400 for body/supporting copy

### Color semantics
- Violet: primary RECLAIM interaction/accent
- Coral: behavioral interruption and expressive scene energy
- Mint: recorded/positive state
- Neutral: secondary information

Important state is never communicated by color alone.

## Interaction principles

### One primary action
Every important state has one obvious next action.

### Reversibility
Check-ins and focus selection are directly reversible. Fresh starts preserve history.

### Progressive disclosure
Configuration is kept in sheets and onboarding rather than occupying the Today hierarchy.

### Motion has a job
Motion communicates selection, elapsed time, active focus, completion, or navigation. Reduced-motion preferences suppress nonessential movement.

### Keyboard parity
Focus cards, navigation, modal controls, and settings actions remain keyboard reachable. Focus-visible outlines are intentionally visible.

### Safe-area awareness
The mobile navigation and bottom content spacing account for device safe areas rather than relying on fixed viewport assumptions.

## Local-first architecture

No account or cloud database is required.

The app reads legacy QUITify storage keys for migration, then writes only RECLAIM keys:

- `reclaim-goals`
- `reclaim-checkins`
- `reclaim-theme`

Storage access is guarded so environments where browser storage is unavailable do not immediately crash the interface.

Backups are local JSON files. Restore validates the basic data shape before replacing local state.

## Deliberately excluded

The current product does not need:
- social feeds
- public profiles
- leaderboards
- XP or levels
- subscription/paywall flows
- AI chat
- fake mood or trigger measurements
- decorative mascots
- complex analytics
- cloud accounts
- gamified punishment/reward loops

Feature additions should strengthen the behavioral loop rather than expand the product surface for its own sake.

## Quality bar

Before adding or keeping a feature:

1. Does it solve a real user problem?
2. Does it reduce or increase cognitive load?
3. Is the interaction familiar?
4. Is the hierarchy obvious within two seconds?
5. Does it belong in the current information architecture?
6. Is the state reversible or clearly explained?
7. Does it strengthen RECLAIM's visual identity?
8. Does it remain usable on a small phone?
9. Does it work with keyboard navigation and reduced motion?
10. Is every displayed data point grounded in the actual data model?

That last criterion is now explicit: the product must not display fabricated behavioral analytics simply because a concept screen looks better with them.

## Next growth direction

Future iterations should grow depth before breadth:

1. Complete visual QA across mobile, tablet, desktop, and light/dark themes.
2. Tighten interaction feedback on focus selection, check-in, Pause, sheets, and navigation.
3. Improve backup/restore validation and migration handling.
4. Add richer but still local data-derived insights only when the underlying data is actually collected.
5. Continue expanding behavior-specific focus scenes without changing the interaction grammar.
6. Consolidate the accumulated CSS override layers when visual behavior is stable, reducing maintenance risk.
7. Keep every new feature subordinate to the core loop.

