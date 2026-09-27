# QUITify — Product & Design Case Study

## The brief

QUITify is a design-first case study, not a startup exercise.

The objective is to explore how a private habit-change product can feel **familiar, trustworthy, calm, and genuinely pleasant to use** without becoming a gamified dashboard, a clinical health product, or a decorative UI concept.

The product should solve a real interface problem:

> When someone opens the app at a difficult or ordinary moment, what is the smallest amount of information and interaction that helps them make the next useful choice?

Business scale, monetization, social growth, and feature breadth are intentionally secondary. The UI and interaction quality are the product.

---

## Research synthesis

Research was conducted across current platform guidance and public product/case-study work spanning habit trackers, wellness products, focus tools, behavior-change concepts, branding projects, Dribbble, Behance, Medium, LinkedIn, and Google Design material.

The research set included examples such as Streaks, Fabulous, Habitify-style trackers, multiple 2025–2026 habit-tracker case studies, wellness identity systems, and contemporary mobile UI explorations.

The strongest recurring lessons were not about adding features.

### 1. Familiarity beats novelty

Apple's current HIG explicitly recommends building on concepts people already understand and using established interaction patterns consistently. Tabs should navigate top-level sections; buttons should communicate clear actions; sheets should handle scoped temporary tasks. citeturn1search0turn1search1turn1search4turn1search5

**QUITify decision**

Use:
- a conventional top bar
- three persistent navigation destinations
- obvious buttons
- short modal/sheet tasks
- predictable back/close behavior
- one primary action per context

Do not invent navigation merely to make the portfolio shot look original.

---

### 2. The home screen should answer “what matters now?”

Recent habit-tracker case studies repeatedly identify dashboard overload and weak daily focus as problems. One current Dribbble case study frames its central loop as daily clarity → small action → visible progress → return, while another recent Behance case study explicitly reduces navigation depth and focuses the redesign around the core daily flow. citeturn4search2turn0search11

**QUITify decision**

The Today screen has a strict hierarchy:

1. Today / current context
2. Current run
3. One-tap daily check-in
4. One short pause/reset tool
5. Seven-day pattern
6. Secondary actions

Anything that does not support that sequence belongs elsewhere.

---

### 3. Onboarding is a product moment, not a slideshow

Research across current habit concepts repeatedly points toward reducing decisions, progressive disclosure, and getting users to the first meaningful action quickly. The Ritual case study specifically describes minimal onboarding and familiar iOS patterns; recent LinkedIn UX work similarly identifies multiple simultaneous decisions as a source of cognitive load. citeturn0search4turn2search0

Fabulous is a useful counterexample in a different direction: its onboarding is highly intentional and makes the user commit to a concrete routine rather than merely reading tutorial screens. citeturn1search10

**QUITify decision**

The first run is deliberately short:

Welcome → choose one goal → arrive at Today.

No account creation, profile setup, notification permission wall, personality quiz, subscription wall, or tutorial carousel.

---

### 4. Progress should be legible, not theatrical

Streaks demonstrates the power of an extremely constrained visual status model: the product makes completion immediately legible and limits the number of tracked habits. citeturn1search8

At the other extreme, many UI-kit concepts accumulate charts, badges, levels, rewards, moods, subscriptions, and dozens of screens. Habitly is a useful example of how quickly the category can become feature-heavy. citeturn4search6

**QUITify decision**

Progress is intentionally reduced to:
- current run
- best run
- seven-day check-ins
- total check-ins
- fresh starts
- recent history

No XP.
No leaderboard.
No fake achievement economy.
No confetti wall.
No “level 37” layer.

---

### 5. Calm does not mean generic

Recent wellness branding work repeatedly uses warm neutrals, restrained greens, generous whitespace, and soft typography. That direction is effective but also highly saturated. Morrow and Stillflow demonstrate the popularity of this visual language, while the Stillflow case study explicitly describes the challenge of avoiding generic wellness conventions. citeturn2search2turn2search17

**QUITify decision**

The visual identity is therefore not “pastel wellness”.

It uses:
- paper-like warm neutral background
- near-black typography
- deep botanical green as the functional brand color
- restrained violet/peach only for category differentiation
- hard-edged surfaces
- modest radius
- thin borders
- very restrained shadows
- no gradients as the primary visual device
- no glass
- no decorative ambient blobs

The interface should feel like a carefully designed utility, not a meditation poster.

---

## Brand direction

### Name

**QUITify**

The name is intentionally direct. It communicates the behavioral purpose immediately while the visual identity softens the command.

### Brand idea

**Make room for your life.**

The metaphor is not “winning against a habit”.

It is creating enough distance between impulse and action to make another choice possible.

### Brand mark

The Q is used as the primary mark.

The open interior/letterform is treated as the brand's visual metaphor: **space created inside something that used to feel closed**.

This is deliberately more ownable than the generic leaf/lotus/spark/heart vocabulary common in wellness concepts.

### Voice

Short.
Adult.
Non-clinical.
Non-cheerleader.
Non-judgmental.

Prefer:
- “Check in for today.”
- “Start a fresh run.”
- “See the pattern.”
- “You don't need to decide yet.”

Avoid:
- “Crush your goals!”
- “You're on fire!”
- “Don't break the chain!”
- shame-based copy
- exaggerated motivational language

---

## Information architecture

### Today

The default destination.

It answers:
- What am I working on?
- Where am I in the run?
- Have I checked in today?
- What can I do during a difficult moment?
- What has the last week looked like?

### Progress

Reflection rather than analytics.

It answers:
- What pattern is emerging?
- How consistent have I been?
- What does my recent history look like?

### Settings

Trust and control.

It answers:
- Where is my data?
- Can I back it up?
- Can I restore it?
- Can I erase it?

Three destinations are enough for the case study.

---

## Interaction principles

### One primary action

Every important state has one obvious next action.

### Reversibility

Actions such as check-in and reset should not feel irreversible. The user should understand what happened and how to recover.

### Progressive disclosure

Do not show every possible configuration up front.

### No decorative interaction

Animation and visual effects must explain state, feedback, or hierarchy. They do not exist to make a portfolio screenshot more impressive.

### No punishment loop

A fresh start changes the current run but preserves history and the previous best.

---

## Current design system

### Surface

- Warm paper background
- Solid cards
- Thin neutral borders
- Low-elevation shadows
- No translucent content surfaces

### Typography

Inter/system sans for reliable rendering and familiar utility-app readability.

Large typography is reserved for:
- page titles
- current run
- major progress values

Small text is used sparingly and never as the only carrier of meaning.

### Shape

Moderate radii, not excessive pillification.

Pills are reserved for compact filters/statuses. Cards and sheets use conventional rounded rectangles.

### Color semantics

Green = primary action / positive recorded state.

Violet = one category family.

Peach = one category family.

Neutral = secondary information.

Color is never the only signal for an important state; icons, labels, or shape also communicate status.

---

## Why the Liquid Glass direction was rejected

The earlier exploration over-indexed on material treatment.

That created three problems:

1. The interface started looking like a visual concept rather than a dependable product.
2. Blur/transparency competed with the actual content hierarchy.
3. The visual language became more memorable than the interaction model.

Current platform guidance also emphasizes familiarity, clarity, accessibility, and using familiar components rather than letting branding override platform conventions. citeturn3search3turn3search5

QUITify now uses **solid surfaces, typography, spacing, borders, and semantic color** as the visual system.

---

## What was deliberately left out

This case study does not need:

- social feeds
- public profiles
- community leaderboards
- AI chat
- subscription/paywall flows
- excessive reminders
- mood journaling
- dozens of habit categories
- elaborate achievements
- decorative mascots
- complex analytics
- account infrastructure
- cloud sync
- “streak insurance” mechanics

Those may make a larger product, but they do not make this case study better.

---

## Case-study quality bar

Before adding a feature, ask:

1. Does it solve a real user problem?
2. Does it reduce or increase cognitive load?
3. Is the interaction familiar?
4. Is the hierarchy obvious in two seconds?
5. Does it belong on Today, Progress, or Settings?
6. Can it be removed without making the core experience worse?
7. Does it strengthen the visual identity?
8. Does it make the product feel more trustworthy?
9. Does it work on a small phone screen?
10. Would the screen still be good if the brand logo were removed?

If the answer to the last question is no, the UI is probably doing too much branding and not enough product design.

---

## Research references

- Apple Human Interface Guidelines — design principles, familiarity, agency, simplicity, craft, and delight.
- Apple Human Interface Guidelines — tabs, sheets, buttons, layout, accessibility, color, and branding.
- Google Design — Fabulous engagement and habit-formation design.
- Behance — contemporary habit tracker and wellness case studies.
- Dribbble — contemporary habit-tracker dashboard, onboarding, focus-timer, and mobile UI explorations.
- Medium — habit-tracker engagement and product-design case studies.
- LinkedIn — recent UX case-study discussions around onboarding, cognitive load, habit formation, and longitudinal research.

The research is used to synthesize patterns, not to copy any individual project's visual language.
