# RECLAIM

**Make room for your life.**

RECLAIM is a design-first, offline/local-data habit-change case study. The product is intentionally private: core progress data lives in the browser's local storage instead of a required account or cloud database.

## Product thesis

Changing a habit is already cognitively expensive. The interface should therefore reduce decisions, avoid shame, keep the next useful action visible, and make progress legible without turning the experience into a noisy analytics dashboard.

## RECLAIM / SPACE design language

- **Calm over clinical** — warm neutrals, soft green, restrained violet, generous whitespace.
- **One thing at a time** — the current goal and current run lead the hierarchy.
- **Progress without punishment** — a reset does not erase the previous best.
- **Private by default** — no login, no analytics requirement, local browser persistence.
- **Familiar interaction grammar** — chips, cards, bottom actions, modal sheets, clear primary action.
- **Solid surfaces, strong hierarchy** — paper, ink, borders, spacing, and restrained color do the visual work without decorative effects.

## Inspiration research

The design direction was informed by public UX/UI case studies across recovery, habit tracking, and cessation products. Recurring patterns included streak/progress visibility, craving/urge support, journaling, milestones, and simple predictable navigation. Research also showed that many concept designs over-index on gamification, gradients, and dense dashboards.

The visual system is intentionally independent of liquid-glass or frosted-glass patterns. Depth comes from spacing, typography, borders, surface contrast, and restrained shadows.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deployment

The app is designed to deploy directly to Vercel as a standard Next.js project.

## Privacy note

This is a design/case-study prototype, not medical treatment. It should not replace professional support, especially where withdrawal or dependence can create medical risk.
