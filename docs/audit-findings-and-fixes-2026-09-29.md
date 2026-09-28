# QUITify — Audit Findings & Fixes (2026-09-29)

## Scope and evidence

- Repository: https://github.com/madebykraman/QUITify
- Target branch: `main`
- Audit mode: source inspection through GitHub repository tools plus current public guidance.
- No local checkout, npm install, build, automated test run, or browser/device session was available in this run. Do not interpret source-level fixes as runtime-verified.
- Research reviewed: Next.js security release notes and WCAG 2.2 target-size guidance. Product research in the existing `docs/ux-research-and-launch-audit.md` was also reviewed.

## Bugs and risks found

### Fixed in this run

1. **Pause timer never counted down — reproducible by source inspection**
   - The pause UI rendered a 10:00 timer, but no interval/timeout updated `timer`.
   - Added a one-second timeout loop while the pause sheet is open, clamping at zero and cleaning up when the sheet closes or reaches zero.
2. **Pause close control had no accessible name**
   - The pause dialog's icon-only close button lacked a text alternative/accessible name.
   - Added `aria-label="Close pause"`.
3. **Calendar-derived UI could remain stale after midnight**
   - The seven-day strip was memoized only once at mount, and calendar-dependent UI had no day-boundary refresh.
   - Added a 30-second local-calendar day check and made the weekly date list recompute when the day key changes.
4. **Next.js minimum version**
   - The manifest allowed resolution below the current patched maintenance release.
   - Raised the declared minimum from `^15.5.0` to `^15.5.26`, the patched maintenance release available on the audit date. Re-check Next.js security announcements before release because another release was scheduled for September 30, 2026.

### Previously reviewed safeguards that remain in the code

- Local-storage reads/writes/removals are wrapped in exception handling.
- Storage failure is surfaced in the UI.
- Date keys are checked as real local calendar dates.
- Imported goals and check-ins are normalized, deduplicated, bounded, and orphan check-ins are filtered.
- Backup file size is limited to 5 MB.
- Restore asks for confirmation before replacing local data.
- Fresh start preserves previous history and best run.

## Changes committed directly to main

1. **`ce033670e24fdc5a483fdadc6e9c6ed0bd9e461b`** — Fix pause timer, accessible close label, and day rollover
   - File: `app/page.tsx`
2. **`48660abc0fcc2514cddef4daffd9fa2721598dfb`** — Raise Next.js minimum to patched maintenance release
   - File: `package.json`

No branch was created.

## Tests and deployment

- **Build/tests:** Not run in this environment. No claim of passing build or runtime behavior.
- **Browser/device accessibility QA:** Not performed.
- **Pre-change CI evidence:** The last checked commit `ff8414708af99e028c0f6949360011af9e8ef84c` reported Vercel status `success`. This predates the two code changes above and does not verify them.
- **Post-change CI/deployment:** Must be checked after the commits propagate; do not assume success from the previous deployment.

## Pending / recommended next

### Release-blocking verification
1. Run `npm install` and `npm run build` on a clean checkout of current `main`.
2. Add and commit a generated npm lockfile from a controlled environment; this repository currently has no committed lockfile, so dependency resolution is not fully reproducible.
3. Confirm Vercel production deployment points to the latest main commit.
4. Test the pause timer end-to-end: start at 10:00, observe decrement, close/reopen, and confirm it resets to 10:00 as intended.
5. Test day rollover with the app left open across local midnight.
6. Test backup restore with valid, malformed, oversized, duplicate, impossible-date, and orphan-check-in fixtures.
7. Run keyboard/screen-reader checks for dialog focus placement, focus return, and all icon-only controls; the accessible name fix does not by itself establish full dialog accessibility.
8. Test narrow mobile widths, text zoom, dark mode, and reduced-motion preferences on real browsers/devices.

### Product/design follow-up
- Improve the pause intervention with a few concrete, user-selectable coping options while keeping language non-judgmental and avoiding clinical claims.
- Keep the existing local-first privacy model, but continue to describe browser local storage accurately: it is not encryption and does not guarantee cross-device backup.
- Avoid adding streak penalties or shame-oriented language; retain the non-punitive fresh-start/history model.

## Public guidance consulted

- Next.js official release/security update index: https://nextjs.org/blog
- Next.js security advisory for the August 2026 release: https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36
- WCAG 2.2: https://www.w3.org/TR/wcag/
- WCAG 2.2 target size minimum explanation: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum

## Release assessment

**Status: fixes committed; not yet verified as launch-ready.** The pause timer, accessible close label, local-day refresh, and Next.js minimum-version floor have source-level fixes on `main`. Build, lockfile generation, production deployment verification, and hands-on accessibility/device checks remain pending.
