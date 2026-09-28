# RECLAIM

**Make room for your life.**

RECLAIM is a design-first, local-first habit-change product prototype. It is built around one behavioral loop: notice the pattern, create a pause, choose the next action, check in, and look back without punishment.

## Product thesis

Changing a habit is cognitively expensive. RECLAIM therefore keeps the current focus visible, makes the daily action obvious, preserves history through fresh starts, and avoids gamification that turns behavior change into a score-chasing exercise.

## RECLAIM / SPACE

The current visual language is built around:

- **One focus, one scene** — each focus is represented by a behavior-specific visual scene rather than a generic category icon.
- **Expressive, not decorative** — motion communicates active state, a recorded check-in, or an intervention.
- **Progress without punishment** — current run, personal best, weekly consistency, recent history, and fresh starts remain legible without XP, leaderboards, or fake achievement economies.
- **Private by default** — goals, check-ins, and preferences are stored locally in the browser; there is no account requirement.
- **One type system** — Google Sans is the single product typeface across landing, onboarding, Today, Progress, Pause, Insights, and Settings.
- **Familiar navigation** — five persistent destinations: Today, Progress, Pause, Insights, and Settings.
- **Responsive by construction** — mobile bottom navigation, desktop navigation rail, fixed contextual top bar, safe-area handling, keyboard focus, and reduced-motion support.

## Core experience

### Today
The current focus leads the page. Users can swipe between focus cards, see a behavior-specific scene, check in for the day, review the last seven days, and start a fresh run without deleting history.

### Progress
Shows the current run, personal best, weekly consistency, 14-day history, total check-ins, fresh starts, and milestones.

### Pause
A timestamp-driven ten-minute intervention. The timer is based on elapsed wall-clock time rather than render ticks, so it remains accurate when the tab is backgrounded.

### Insights
Uses only recorded check-ins. The screen deliberately avoids fabricated mood/trigger data and instead shows a real 14-day rhythm, a 28-day weekday pattern, check-in history, and fresh-start context.

### Settings
Controls appearance, backup/restore, privacy information, and local-data deletion.

## Data model

The app persists:

- `reclaim-goals`
- `reclaim-checkins`
- `reclaim-theme`

Existing QUITify storage keys are read once as a compatibility migration path. New writes use RECLAIM keys.

Backups are JSON files containing goals, check-ins, product name, version, and export timestamp.

## Quality bar

Every feature is reviewed against:

1. Real user value.
2. Cognitive-load impact.
3. Familiar interaction patterns.
4. Two-second hierarchy.
5. Mobile usability.
6. Desktop usability.
7. Keyboard and reduced-motion accessibility.
8. Data integrity and reversibility.
9. Visual identity consistency.
10. Whether the feature strengthens the core behavioral loop.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deployment

The app is a standard Next.js project and is intended for Vercel deployment.

## Privacy note

RECLAIM is a product/design prototype, not medical treatment. It should not replace professional support, especially where withdrawal or dependence can create medical risk.
