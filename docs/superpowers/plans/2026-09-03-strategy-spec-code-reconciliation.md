# Strategy Spec Code Reconciliation Plan

**Goal:** Align current product strategy, `PRODUCT_SPEC.md`, supporting docs, and implementation before freezing product systems for content production.

**Scope:** Audit and fix only clear contradictions or contained correctness gaps. Product decisions with multiple valid answers are reported as open, not silently decided.

## Checklist

- [x] Add a compact Current Product Contract near the top of `PRODUCT_SPEC.md` so future agents do not have to reconcile M1-M5 chronology from memory.
- [x] Mark older Result/default-exclusion language as superseded where M4.1/M5 deliberately changed challenged Result and caught-up Result behavior.
- [x] Document M5 pair-action ranking: newest released Drop with meaningful pair state wins.
- [x] Fix code to implement that ranking instead of category-first action selection.
- [x] Remove or clarify stale release helper naming if it risks confusing future implementation.
- [x] Run invariant scans for question-count, Drop/Topic-specific rendering, release enforcement, pair privacy/integrity, and stale TODO/current-language conflicts.
- [x] Run typecheck, lint, and build.
- [x] Report aligned, fixed, open, and unverified items.
