# Drop Experience System

M3.2 turns a Drop from quiz content into a complete Did You Know? experience.

Principle:

`Consistent experience grammar, variable knowledge identity.`

## Ownership Boundary

Content/editorial owns:

* Topic, Area, Drop title, and Drop description;
* Questions, options, correct answers, Reveals, and sources;
* internal editorial metadata: central idea and exit understanding;
* Trail placement and bridge questions;
* visual identity selection from the approved vocabulary.

Product/engineering owns:

* Home, Invite, Question, Reveal, and Result rendering;
* scoring, progress, Attempt, Answer, Invite, auth, and ownership logic;
* responsive behavior, accessibility, and motion grammar;
* the approved visual vocabulary and how each family/motif renders.

Content must remain plain serializable data. It must not include React, callbacks, CSS, layout rules, auth behavior, or scoring behavior.

## Drop Experience Contract

Every production Drop should include:

* player-facing content: `title`, `description`, `questions`, `options`, `reveal`, `source`;
* editorial metadata: `experience.centralIdea`, `experience.exitUnderstanding`;
* visual identity: `experience.visualIdentity.family`, `experience.visualIdentity.motif`, optional semantic artwork IDs.

Visual identity selects from the product-owned vocabulary. It does not define raw colors, fonts, layouts, CSS, or animations.

Generic rendering may switch on visual vocabulary keys only. It must not branch on Drop ID or Topic ID.

## Standard Surfaces

Each Drop must work on:

* Home / Trail: position, territory identity, state, and bridge context are clear.
* Invite landing: the Drop works as a first impression without requiring Trail context.
* Question: the challenge is readable, focused, and count-agnostic.
* Reveal: the insight is the payoff; correctness is secondary but clear.
* Result: the player sees score, social meaning when relevant, Challenge, Home, and Trail continuation when relevant.

## Motion Grammar

The renderer owns a small reusable motion grammar:

* enter territory;
* commit answer;
* reveal discovery;
* mark explored;
* continue Trail.

Drops do not choose arbitrary animations.

## Quality Gates

Content gate:

* central idea is coherent;
* every Question supports the Drop;
* every Reveal is worth knowing even when answered correctly;
* every claim has a source;
* answers are unambiguous;
* Trail bridges feel natural when the Drop participates in a Trail.

Experience gate:

* surfaces feel like Did You Know?, not a generic quiz app;
* territory identity is visible without becoming a separate mini-app;
* Invite, Reveal, and Result feel intentional.

Technical gate:

* adding a Drop with an existing visual family/motif does not require engine edits;
* variable Question count is derived from content;
* direct play, Invite play, resume, Result, Challenge, Home state, mobile, and desktop still work;
* typecheck, lint, and build pass.

M3.2 proof:

`A temporary fourth Drop using existing vocabulary can be added through content-only changes, render across the standard surfaces, and then be removed before commit.`
