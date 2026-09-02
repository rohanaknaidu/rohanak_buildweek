# M3 Guided Exploration Implementation Plan

> **For agentic workers:** implement this plan task-by-task and keep scope alarms active. Do not expand into Journey 3, Knowledge Map, CMS/admin tooling, AI generation, XP, mastery, streaks, friend graph, replay, or recommendation systems.

**Goal:** Build M3 so one surprising Drop opens into another, creating the first visible guided Trail through the Did You Know? world.

**Product contract:** Be ambitious about the user experience and conservative about unnecessary systems. Home should feel like a connected thread of curiosity, not a quiz catalog. Trails guide but never gate. Every Drop remains directly playable and shareable.

**Architecture contract:** Content can change without product-engine code changing. Topic, Area, Drop, Question, Option, Reveal, Source, and Trail records must remain plain serializable data that could later be supplied by a CMS or database.

## Scope

In scope:

- Update `PRODUCT_SPEC.md` to lock M3 Guided Exploration.
- Add a lightweight `Trail` content model: `id`, `title`, `description`, `dropIds[]`.
- Add two real source-backed Drops connected from the existing Solar System Drop.
- Keep all M3 production Drops at five Questions as an editorial choice.
- Make the play/result/invite/Home engine derive Question totals from each Drop.
- Add a single Home-state query summarizing all LIVE Drops in the visible Trail for the current anonymous Player or authenticated Profile.
- Render Home as a guided exploration Trail with `Explore`, `Continue - N/total questions`, and `Explored - X/total correct`.
- Allow direct selected-Drop play from Home.
- Show Trail continuation on Result while preserving social comparison as primary for challenged play.
- Verify local behavior, commit, push, and deploy Convex because Convex imports content and backend code changes.

Out of scope:

- CMS UI, editor permissions, scheduling, preview, archive workflow, editorial analytics, or database-backed content.
- Knowledge Map, Concept graph, prerequisites, locks/unlocks, coordinates, branching algorithms, recommendation logic.
- New auth/Profile/Invite ownership architecture.
- XP, mastery, streaks, leaderboard, friend graph/feed, replay.
- Browse Topics, Categories, All Drops, topic marketplace, global content library navigation.

## Implementation Steps

- [x] Update `PRODUCT_SPEC.md` for M3 Guided Exploration, narrow CMS-ready meaning, variable Question count, Trail model, and scope alarms.

- [ ] Add Trail/content records:
  - Add `content/trails.ts`.
  - Add Topics/Areas for the two new Drops.
  - Add two source-backed Drop files.
  - Keep content records JSON-serializable: no functions, callbacks, React, or product-engine behavior.
  - Register content in `content/registry.ts`.
  - Add registry helpers only when consumed by Home/Result.

- [ ] Generalize Question-count assumptions:
  - Audit literal `5`, `4`, `/5`, final-question logic, progress, scoring, share/result copy, Invite copy, Home status, and server validation.
  - Ensure a Drop completes when its ordered Question set is exhausted.
  - Derive `X/N` everywhere from the resolved Drop.

- [ ] Add multi-Drop Home state:
  - Add `getHomeState` in `convex/directFlow.ts`.
  - Summarize each LIVE Trail Drop as `unstarted`, `inProgress`, or `completed`.
  - Use existing ownership-aware canonical Attempt lookup.
  - Preserve anonymous/Profile boundaries from M2.2.

- [ ] Support selected-Drop direct play:
  - Let `startAttempt` accept optional `dropId`.
  - Let `getFlowState` accept optional `dropId`.
  - Keep Invite context authoritative when an `inviteId` exists.
  - Reject non-LIVE selected Drops.

- [ ] Build Guided Exploration Home:
  - Render the visible Trail from structured content.
  - Show Topic, Area, Drop title, description, Question count, and state/action.
  - Make explored state visibly different from unexplored without making a course dashboard.
  - Completed Drops open Result, not replay.

- [ ] Add Result Trail continuation:
  - Derive previous/next from Trail order.
  - For direct/Home play, make continuation prominent.
  - For challenged play, keep challenger comparison/social action primary and Trail continuation secondary.
  - Keep `Back to Home`.

- [ ] Verify:
  - `npm.cmd run typecheck`
  - `npm.cmd run lint`
  - `npm.cmd run build`
  - Local browser path: Home shows Trail, non-Space Drop starts, in-progress state resumes, Result renders, Back to Home records explored state.
  - Challenge path for a non-Space Drop: signed-in challenger creates Invite, fresh recipient lands on the correct Drop, challenged Result compares against the correct challenger/Drop.
  - Narrow ownership check: Profile-owned Home state does not leak after sign-out, and signing back in restores Profile-owned summaries.

- [ ] Checkpoint:
  - Review diff for accidental secrets/unrelated files.
  - Commit coherent implementation checkpoint(s).
  - Push `origin/main`.
  - Run `npx.cmd convex deploy --yes`.
  - Production smoke check: Home loads, Trail/Drops visible, non-Space Drop starts, Result renders, Back to Home works, non-Space Challenge landing shows correct Topic.
  - Report M3 status and stop.

## Scope Alarm

Stop and report before continuing if implementation starts requiring CMS/admin infrastructure, persistence/schema redesign, new auth/ownership architecture, Knowledge Map/graph systems, AI generation, recommendation systems, replay semantics, or other major machinery outside the M3 Guided Exploration experience.
