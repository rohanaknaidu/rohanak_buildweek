# M5 Daily Social Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make each newly released Drop reactivate existing knowledge pairs through Challenge, Explore, Compare, and caught-up anticipation states.

**Architecture:** Add `releaseAt` to plain Drop content and derive released/upcoming state from server time. Backend mutations remain authoritative for play and invite availability. Frontend renders current release, pair actions, Trail availability, and countdowns from returned state without Drop/Topic-specific logic.

**Tech Stack:** Next.js, React, Convex, TypeScript, source-controlled content.

**Spec:** `PRODUCT_SPEC.md`

## Global Constraints

* A new Drop makes existing knowledge relationships useful again.
* Each person's exploration can create a useful next action for the other.
* Pair state is current truth, not notification/read state.
* `releaseAt` is an absolute timestamp; daily midnight IST is editorial cadence, not an engine invariant.
* Future Drops cannot be started, answered, invited, or opened through `dykDropId` before release.
* No notifications, feeds, friend system, streaks, replay, prerequisite Trails, anonymous gating, AI, or complex release calendars.

---

### Task 1: Spec And Content Contract

**Files:**
* Modify: `PRODUCT_SPEC.md`
* Modify: `content/registry.ts`
* Modify: `content/drops/*.ts`
* Modify: `docs/DROP_EXPERIENCE_SYSTEM.md`
* Modify: `docs/templates/DROP_BRIEF.md`

**Steps:**

- [x] Add concise M5 spec language defining scheduled episodic release, reciprocity, pair-state actions, countdown placement, and exclusions.
- [x] Add `releaseAt` to `DropContent` as a serializable ISO string.
- [x] Set existing three Drops to past release dates so production behavior remains available.
- [x] Add helpers for released/upcoming Drops using a `now` timestamp.
- [x] Update Drop Experience docs/templates to include release timing and content-stability guidance.

### Task 2: Backend Availability And Pair State

**Files:**
* Modify: `convex/directFlow.ts`
* Modify: `product/dropSelection.ts`

**Steps:**

- [x] Replace raw `getLiveDrops()` availability checks with released-at-server-time checks.
- [x] Prevent `startAttempt`, `submitAnswer`, `continueAfterReveal`, `getOrCreateInvite`, and Invite resolution from using unreleased Drops.
- [x] Return Home Trail nodes with `available` / `upcoming` release state, including `releaseAt`.
- [x] Return the next upcoming Drop and caught-up booleans based on released Drops.
- [x] Add pair-state fields for best action: challenge, explore, compare, or none.

### Task 3: Frontend Recurrence UX

**Files:**
* Modify: `src/app/DirectDropFlow.tsx`

**Steps:**

- [x] Update TypeScript types for release state and pair action state.
- [x] Render upcoming Trail nodes as locked-by-time, not hidden.
- [x] Show countdown only when the user or pair is caught up and no immediate released action is more valuable.
- [x] Add Home social action copy based on pair state without claiming unread/notification behavior.
- [x] Keep Invite, Question, and Reveal free of countdown UI.
- [x] Ensure countdown reaches zero by causing client re-query/refresh of available state.

### Task 4: Verification, Commit, Deploy

**Files:**
* Existing verification only.

**Steps:**

- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run targeted static checks for no Drop/Topic-specific renderer branching.
- [ ] Commit and push.
- [ ] Deploy Convex production because content imported by Convex and backend availability code change.
