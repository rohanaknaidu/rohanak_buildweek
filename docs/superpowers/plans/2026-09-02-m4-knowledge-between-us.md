# M4 Knowledge Between Us Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** A direct Challenge can create a persistent knowledge relationship between two authenticated Profiles, then show what they explored and knew differently.

**Architecture:** Add one minimal symmetric `knowledgePairs` table. Persist the pair only after the challenged recipient authenticates and their challenged Attempt is claimed. Derive all scores and answer-overlap summaries from canonical Attempts and Answers.

**Tech Stack:** Next.js, React, Convex, Convex Auth, TypeScript.

**Spec:** `PRODUCT_SPEC.md`

## Global Constraints

* No friend requests, contact import, feed, chat, notifications, public profiles, leaderboard, intelligence score, XP, mastery, replay, AI, or Knowledge Map.
* Invite URLs stay authoritative and keep existing invalid Invite semantics.
* Compare correctness, not selected wrong-option identity.
* Persist relationship facts; derive comparison data.

---

### Task 1: Record M4 Product Contract

**Files:**
* Modify: `PRODUCT_SPEC.md`

- [x] Add `M4 - Knowledge Between Us` with lifecycle, scope, exclusions, privacy rule, and acceptance criterion.

### Task 2: Add Minimal Pair Persistence

**Files:**
* Modify: `convex/schema.ts`
* Modify: `convex/directFlow.ts`

- [x] Add `knowledgePairs` with `profileAId`, `profileBId`, `createdFromInviteId`, `createdAt`.
- [x] Canonically order Profile IDs before insert/lookup so `A/B` and `B/A` cannot duplicate.
- [x] Create/reuse the pair only after a challenged recipient authenticates through the social preservation path.

### Task 3: Derive Pair Comparison

**Files:**
* Modify: `convex/directFlow.ts`

- [x] Add a current-user-only pair query that verifies the authenticated Profile belongs to the pair.
- [x] Return shared completed Drops and one-sided explored Drops.
- [x] For shared Drops, return both scores and correctness overlap counts: both knew, you knew they missed, they knew you missed, neither knew.

### Task 4: Add Product UI

**Files:**
* Modify: `src/app/DirectDropFlow.tsx`

- [x] On challenged Result, show question-level difference counts when available.
- [x] For challenged anonymous Result, change social auth copy to `Keep comparing with {name}`.
- [x] After social auth, route to a `You & {name}` surface instead of Home.
- [x] Add a lightweight Home re-entry section for existing pairs.
- [x] On the pair surface, show shared explorations and one next challenge action using existing share mechanics.

### Task 5: Verify

**Files:**
* No new files expected.

- [x] Run `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run build`, and `npx.cmd convex dev --once`.
- [ ] Browser-check true two-Profile pair creation, pair surface, and Home re-entry.
- [x] Browser-check local Home and challenged Result overlap UI with an existing Invite.
- [x] Commit, push, and run Convex production deploy because Convex schema/functions changed.
