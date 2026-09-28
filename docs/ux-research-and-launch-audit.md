# QUITify — UX Research & Launch Audit

**Review date:** 2026-09-29  
**Scope:** Current main-branch product, supplied UX case studies, and published digital-behavior-change research.  
**Evidence note:** Vendor/portfolio case studies describe their own projects and are not independent efficacy evaluations. Findings below separate published research from design examples and product hypotheses.

## 1. Product definition

QUITify is a local-first, single-user habit-change prototype. Its core loop is: choose one focus → check in today → pause when useful → review progress → start again without erasing prior history.

The product's strongest differentiators are a low-friction daily action, no required account, a non-punitive reset model, and an intentionally small information architecture. It should not claim to diagnose, treat, or clinically improve addiction.

## 2. Research reviewed

### Digital behavior-change systematic review

Zhu et al., *Digital Behavior Change Intervention Designs for Habit Formation: Systematic Review*, Journal of Medical Internet Research, 2024. The review covered 41 studies of digital interventions for physical activity, with self-monitoring, goal setting, and prompts/cues among the most commonly applied techniques. The authors also discuss personalization and descriptive feedback.

Source: https://www.jmir.org/2024/1/e54375

**Applicability limit:** This review concerns physical-activity habit formation, not a direct clinical evaluation of addiction-cessation apps. It supports considering simple self-monitoring and goal clarity as interaction patterns; it does not prove QUITify's effectiveness.

### QuitSip UX/UI case study

The case study describes goal-setting, consumption tracking, progress dashboards, mood tracking, motivation content, privacy concerns, and user research/prototyping as part of its design process.

Source: https://medium.com/@ghonche.bahare/quitsip-a-ux-ui-case-study-on-revolutionizing-well-being-and-alcohol-monitoring-75ee373be479

**Design takeaway:** A user's context and surroundings can matter as much as the metric. QUITify should keep the main flow light rather than copying an all-in-one wellness dashboard. Mood tracking or richer content should only be added if research shows that they help the core task.

### Quittercheck case study

The case study describes a smoking-cessation product based on timed commitments, user-recorded nicotine-test videos, verification, and financial consequences.

Source: https://leancode.co/case-studies/quittercheck

**Design takeaway:** Verification and penalties create operational and emotional overhead. QUITify's private, non-punitive approach is intentionally different; it should not add coercive penalties or make unsupported efficacy claims.

### Addiction recovery mobile-app case study

The vendor case study describes daily check-ins, progress visualization, guided exercises, community support, authentication, and behavioral analytics.

Source: https://ciphernutz.com/case-studies/addiction-recovery-mobile-app

**Evidence caution:** The page publishes engagement and outcome percentages but does not provide enough methodology on the page to independently validate them. They are treated as vendor-reported claims, not as proof that gamification or community features cause better outcomes.

### Habitude habit-tracker portfolio case study

Source: https://www.behance.net/gallery/162229477/UX-Case-Study-Habitude-A-Habit-Tracker-App

**Evidence caution:** The page is primarily a portfolio presentation; it should be used for visual/interaction inspiration, not as clinical or efficacy evidence.

## 3. Pattern comparison

| Pattern | Seen in research/examples | QUITify decision |
|---|---|---|
| One clear goal | Goal-setting is common in digital behavior-change research | Keep one active focus prominent; avoid a dense multi-goal dashboard |
| Self-monitoring | Common in the systematic review and the reviewed case studies | Keep a fast daily check-in and simple recent-history views |
| Prompts/cues | Common in the systematic review | Consider optional, user-controlled reminders only after privacy, browser support, and consent behavior are designed and tested |
| Progress feedback | Present across the reviewed products | Show current run, personal best, and weekly consistency; avoid implying a streak is a clinical outcome |
| Mood/craving journals | Present in some recovery concepts | Do not add by default; collect sensitive information only with a clear user benefit and explicit control |
| Community/accountability | Present in some concepts | Out of scope for a local-first v1; community introduces moderation, safety, privacy, and operational requirements |
| Penalties/financial stakes | Used by one cessation case study | Deliberately excluded to preserve autonomy and avoid shame/coercion |
| Privacy claims | Repeated theme in the reviewed material | Be precise: browser local storage is local-first, not encryption; browser data can be lost or accessed by someone using the same device/profile |

## 4. Code audit findings addressed in the current hardening pass

- Wrapped local-storage reads/writes/removals so blocked or full browser storage does not crash the app.
- Added a visible “Storage unavailable” state and settings copy warning users that changes may not persist.
- Validated real calendar dates rather than accepting date-shaped strings such as impossible calendar dates.
- Sanitized restored goals, bounded counters and user-controlled text fields, and limited backup file size to 5 MB.
- Deduplicated restored goals and check-ins; when duplicates exist, the latest check-in record wins.
- Preserved the existing design direction and wrote all changes directly to `main`.

## 5. Remaining launch risks

### Must pass before calling this 1.0

1. **Real-device smoke test:** Android Chrome, narrow viewport, light/dark theme, onboarding, add/select focus, check-in/undo, fresh start, pause timer, restore, export, and clear-data confirmation.
2. **Data lifecycle test:** valid backup, malformed JSON, impossible dates, duplicate IDs/check-ins, orphan check-ins, oversized file, and storage quota/unavailable scenarios.
3. **Accessibility pass:** keyboard-only navigation, focus placement/return for modal sheets, screen-reader labels, contrast, text zoom, and reduced-motion behavior.
4. **Deployment verification:** confirm the latest production deployment serves the latest main commit; the Vercel status can lag behind CI.
5. **Safety/content pass:** keep language non-judgmental and make clear that QUITify is a self-guided prototype, not medical treatment. Keep the existing note about professional support where dependence or withdrawal may create medical risk.
6. **Reproducible dependencies:** repository currently has no committed lockfile in its file tree. Add a generated npm lockfile in a controlled environment before a stable public release.
7. **Automated regression coverage:** CI currently runs install and Next.js production build; it does not run a dedicated unit, interaction, or accessibility test suite.

### Should not block a small, clearly labeled prototype release if documented

- No accounts, sync, or cross-device restore (intentional local-first scope).
- No reminder/notification system (avoid adding notification permission complexity without validated need).
- No clinical outcome claims or analytics-driven efficacy claims.
- No user research evidence yet demonstrating retention, accessibility, or behavior-change outcomes.

## 6. Release recommendation

Treat the current product as a **release candidate**, not a fully validated 1.0. The current main-branch production build has passed automated CI, and the latest Vercel status was reported successful after the hardening commits. That confirms a successful build/deployment status, not hands-on browser QA.

**Recommended remaining sequence:**
- **Build A — reliability hardening:** complete; local persistence and backup parsing safeguards are committed.
- **Build B — launch-candidate QA:** add deterministic dependency management and regression checks, then run device and accessibility checks.
- **Build C — 1.0 release:** only if Build B uncovers defects; fix them, verify production deployment, and tag the release.

Do not add more features merely to increase scope. The next highest-value work is verification, deterministic builds, and evidence that the core loop works reliably on a real phone.
