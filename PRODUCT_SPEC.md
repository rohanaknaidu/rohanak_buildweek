# DID YOU KNOW? - PRODUCT SPEC

> **Status:** Active working product specification
> **Purpose:** This document is the current source of truth for product reasoning and V1 implementation.
> **Rule:** When a product decision changes, update this document rather than relying on conversational memory.

---

# 0. How To Use This Document

This document separates decisions into three categories.

## LOCKED

We have deliberately made this decision for V1. Do not reinterpret it without explicitly changing this document.

## CURRENT DIRECTION

This is our strongest current product direction but may still change as we work through the detailed experience.

## OPEN

This has not yet been decided. Do not silently invent an answer during implementation.

When implementation or further reasoning exposes an inconsistency, update this document first.

---

# 1. Product Thesis

## LOCKED

**Did You Know? is an asynchronous social knowledge game built around recurring curated knowledge challenges.**

A Player:

1. plays a fixed set of 5 Questions about a Topic;
2. learns something immediately after every Answer;
3. receives a score out of 5;
4. can Challenge a friend to the exact same set of Questions;
5. the friend plays independently, at their own time;
6. the friend compares their Result directly with the Challenger;
7. the friend can then Challenge someone else;
8. over time, Players build progress through an expanding knowledge universe as new content is released.

V1 is **not** a synchronous multiplayer quiz.

There are no synchronous live-session concepts in V1.

A synchronous live multiplayer mode is not ruled out as a future product direction.

It is simply **not V1** and should not influence V1 architecture.

---

# 2. Product Inspirations

## CURRENT DIRECTION

The product draws from three systems.

## Civilization-Style Research

Knowledge should eventually feel explorable.

Players should be able to see:

* what they have explored;
* Areas they have barely touched;
* Areas with new content;
* Areas still ahead of them.

The inspiration is a Civilization research tree, but V1 does not require a complex prerequisite graph.

## Live-Service Games

Knowledge content continues expanding after launch.

Players can become Caught Up with everything currently available and then receive new content later.

The product should feel alive rather than like a finite database of trivia.

## Episodic Media

New knowledge content can arrive on a predictable cadence.

Example:

`New Space Drop - Tuesday`

Eventually the behavior could become:

`I play the Tuesday Space Drop.`

Different Topics could eventually have different recurring release days.

This creates anticipation and shared cultural moments around the same content.

---

# 3. Locked Vocabulary

Use these terms consistently in product reasoning, code, and documentation unless this document explicitly changes them.

## Topic

### LOCKED

A **Topic** is a persistent broad knowledge territory.

Examples:

* Space
* History
* Cricket
* Economics
* Cinema

V1 has exactly one Topic:

**Space**

A Topic can continue receiving new content indefinitely.

A Player does not permanently complete a Topic.

A Player can instead become:

**Caught Up**

with everything currently released in that Topic.

## Area

### LOCKED

An **Area** is a conceptual region inside a Topic.

Initial candidate Areas within Space:

* Earth
* Solar System
* Gravity
* Stars
* Black Holes

An Area is NOT:

* one quiz;
* one Drop;
* one one-time completion unit.

An Area may eventually contain dozens or hundreds of Questions distributed across many Drops.

New Drops may return to an Area that has already received previous Drops.

Therefore:

**knowledge structure and content release order are separate concepts.**

## Drop

### LOCKED

A **Drop** is one fixed, scheduled content release.

Every V1 Drop contains exactly:

**5 curated Questions**

Example:

Topic:

`Space`

Area:

`Solar System`

Drop:

`How Strange Is Our Solar System?`

Questions:

`5`

A Drop is the atomic unit of:

* play;
* scoring;
* social comparison;
* sharing;
* release scheduling;
* completion;
* analytics.

Everyone being compared on a Drop receives the exact same five Questions.

A released Drop remains playable after newer Drops release.

Use **Drop** for this concept.

## Question

### LOCKED

A **Question** is one curated multiple-choice knowledge test within a Drop.

Each Question includes:

* stable ID;
* prompt;
* 2-4 options;
* exactly one correct answer;
* Reveal content;
* editorial source.

Production Questions are curated.

They are NOT generated live by AI in V1.

## Question State

### LOCKED

The reusable V1 play surface should show only what helps the Player answer the current Question.

Before the Player answers, the Question state should show:

* quiet Area context;
* compact progress;
* Question prompt;
* 2-4 answer options.

Because V1 has only one Topic, do not repeat the Topic on every Question.

The Drop title also does not need to repeat on every Question.

The progress treatment should combine:

* five-step visual progress;
* explicit `N/5` text.

Progress must distinguish conceptually between:

* completed Questions;
* the current Question;
* upcoming Questions.

While the Player is answering Question 2 of 5, the visual should not imply that Question 2 has already been completed.

The explicit `2/5` text means:

`currently on Question 2 of 5`

not:

`2 Questions already completed`

Exact progress symbols, colors, and styling are visual-design decisions.

Answer options should be:

* vertically stacked;
* full-width on mobile;
* large enough to tap comfortably;
* visually consistent for 2, 3, and 4-option Questions.

No answer option is preselected.

## Reveal

### LOCKED

A **Reveal** happens immediately after a Player commits an Answer by activating an answer option.

The Reveal shows:

* whether the Player knew it;
* the Player's Answer;
* the correct Answer;
* a short explanation of the underlying fact;
* a quiet user-visible source affordance.

The repeated learning loop is:

`Question -> tap option -> Answer commits -> Reveal -> Next Question`

Do not postpone all explanations until the end of the Drop.

The Reveal should transform the same play surface rather than replace it entirely.

During the Reveal:

* the Question remains visible;
* answer options remain visible;
* the Player's Answer is identified;
* the correct Answer is identified;
* all answer options are non-interactive;
* correctness does not rely on color alone.

Preferred language:

`You knew it.`

or:

`You didn't know.`

Avoid:

* smart;
* dumb;
* intelligent;
* IQ;
* expert.

The Reveal explanation should be concise but meaningful:

* 2-4 sentences;
* one main idea;
* enough context to make the answer memorable;
* ideally why the answer is interesting, surprising, or counterintuitive;
* connection to the broader Area when useful.

The Reveal should produce:

`Oh, that's interesting.`

rather than feeling like a lesson page.

Every Reveal should include a quiet user-visible source affordance, such as:

`Source: NASA`

Do not show citation blocks or academic formatting in V1.

The exact source-link interaction remains OPEN.

For Questions 1-4, the Reveal CTA should be:

`Next question`

For Question 5, the Reveal CTA should be:

`See result`

Do not insert an interstitial state between a Reveal and the next Question.

Reveal 5 still appears before the Result.

During Question and Reveal states, do not show:

* score-so-far;
* global statistics;
* Journey progress;
* timer;
* countdown;
* social comparison;
* sharing actions.

Refresh behavior:

* refreshing on an unanswered Question returns to that unanswered Question;
* refreshing after a committed Answer returns to the Reveal for that committed Answer;
* refreshing while viewing a Reveal returns to that Reveal;
* a committed Answer can never become editable again.

Still OPEN:

* exact visual design of progress;
* exact visual correctness treatment;
* exact animation timing;
* exact source-link interaction.

## Player

### LOCKED

A **Player** is one V1 browser-local identity representing a person using the product.

V1 has no authenticated accounts.

A Player may have:

* browser-local `playerId`;
* optional first-name `displayName`.

Duplicate display names are acceptable.

Player identity is convenience identity, not secure proof of a human being.

`displayName` is intentionally optional.

An unnamed Player is still a valid Player with valid Attempts, Answers, Results, and Journey progress.

## Attempt

### LOCKED

An **Attempt** is one Player's canonical play-through of one Drop.

Conceptual invariant:

`playerId + dropId`

has one canonical Attempt.

An Attempt can be:

* in progress;
* completed.

Every committed Answer should be persisted as it occurs.

Refreshing midway through a Drop should resume the existing Attempt rather than restarting it.

A Player cannot replay the same Drop to create a different canonical Result.

No-auth means the same human using another browser/device may appear as another Player. This is acceptable for V1.

## Answer

### LOCKED

An **Answer** is one committed Player response to one Question within an Attempt.

A Player submits an Answer by tapping or clicking an answer option.

Interaction:

`Question -> tap option -> Answer immediately commits -> brief visual acknowledgement -> Reveal`

There is no separate:

`Lock answer`

button in V1.

Once an option is activated:

* the Answer cannot be edited;
* correctness is determined server-side;
* the Answer is persisted.
* the selected option becomes visibly committed;
* other answer options become non-interactive;
* the Reveal follows.

The brief acknowledgement is interaction feedback, not a separate confirmation decision or screen.

Do not specify a fixed animation duration yet.

V1 chooses direct commit because:

* this is a casual five-Question social challenge, not an exam;
* the interaction should be fast and mobile-native;
* a confirmation button doubles the number of answering actions;
* immediate commitment creates a useful `guess -> consequence -> Reveal` rhythm.

Do not solve accidental taps with an extra confirmation step.

Instead, V1 Question UI should use:

* large answer tap targets;
* sufficient spacing;
* no overlapping navigation controls;
* clear focus, pressed, and committed states;
* intentional activation on the answer control itself;
* accessible keyboard and assistive-technology behavior.

Do not add undo or replay mechanics for submitted Answers in V1.

Do not trust the client to calculate correctness.

Do not expose future answer keys to an unanswered client.

## Result

### LOCKED

A **Result** is the outcome of one completed Attempt.

The primary representation is:

`correct answers / 5`

Example:

`4/5`

Do not introduce points, XP, or arbitrary scoring in V1.

The Result's default job hierarchy is:

1. tell the Player how they did;
2. if relevant, tell the Player how they compared with their direct Challenger;
3. make the Player's own Result feel worth challenging someone with;
4. provide one quiet path into the long-term Journey.

The Result should not become a report card, social leaderboard, Knowledge Map, or release calendar.

## Direct Result

### LOCKED

A **Direct Result** is shown when the Player did not arrive through a current direct Challenger context.

Default hierarchy:

1. Player score;
2. plain interpretation scoped to this Drop;
3. Drop title;
4. social provocation around the Player's own Result;
5. `Challenge a friend`;
6. quiet `Your Space Journey` action.

Example intent:

`3/5`

`You knew 3 of 5 on this Space challenge.`

`How Strange Is Our Solar System?`

`Think someone can beat your 3/5?`

`Challenge a friend`

`Your Space Journey ->`

Core Result semantics must work for any LIVE historical Drop.

Language such as `this week's` may be used only when the Drop is genuinely the current/latest release.

Do not hardcode `this week's` into Result copy that also serves older LIVE Drops.

## Challenged Result

### LOCKED

A **Challenged Result** is shown when the Player has a current direct Challenger comparison context.

Default hierarchy:

1. Player score;
2. win / loss / tie against the direct Challenger;
3. compact score comparison;
4. Drop title;
5. social provocation around the current Player's own Result;
6. `Challenge a friend`;
7. quiet `Your Space Journey` action.

Win means:

the Player scored higher than the Challenger.

Loss means:

the Challenger scored higher than the Player.

Tie means:

the Player and Challenger scored equally.

Win / loss / tie are determined only by comparing Results out of 5.

Win copy should clearly communicate that the Player scored higher than the Challenger.

Loss copy should clearly communicate that the Challenger scored higher, using light and non-shaming language.

Tie copy should clearly communicate equal scores.

Exact win / loss / tie phrasing is a copy/design decision.

Example win intent:

`4/5`

`You beat Rohanak.`

`You 4/5 · Rohanak 3/5`

`How Strange Is Our Solar System?`

`Think someone can beat your 4/5?`

`Challenge a friend`

`Your Space Journey ->`

The Challenger gets the Player into the Drop.

The Player's own Result is what they Challenge the next person with.

Outgoing Invites always represent the current Player and their canonical Result, regardless of whether they won, lost, or tied against their Challenger.

Do not imply that the Player is forwarding their Challenger's Result or Challenge on the Challenger's behalf.

## Perfect Score Challenge Copy

### LOCKED

A Player with `5/5` cannot logically ask someone else to beat that Result.

For scores `0-4/5`, Result and Invite copy may use the semantic idea:

`beat`

Example Result intent:

`Think someone can beat your 3/5?`

Example Invite intent:

`I got 3/5 on this Space challenge. Think you can beat me?`

For score `5/5`, Result and Invite copy should use the semantic idea:

`match`

Example Result intent:

`Think someone can match your 5/5?`

Example Invite intent:

`I got 5/5 on this Space challenge. Think you can match me?`

Do not create elaborate copy variations for every score in V1.

## Default Result Exclusions

### LOCKED

Do not show these on the default V1 Result:

* Area;
* aggregate statistics;
* player counts;
* average score;
* percentile;
* hardest Question;
* Question-by-Question recap;
* Knowledge Map;
* upcoming Drop or release information;
* public participant lists;
* post-Drop synthesis lesson.

These may live in Journey or later experiments where appropriate.

`Challenge a friend` remains the primary Result action.

`Your Space Journey` remains the secondary Result action.

## Challenge

### LOCKED

**Challenge** is primarily a user-facing action.

Meaning:

> I completed this Drop and want somebody else to play the exact same Drop and compare their Result with mine.

Primary CTA:

`Challenge a friend`

Do not assume Challenge needs its own persistent database entity.

## Invite

### LOCKED

An **Invite** is the shareable object created when a Player challenges someone.

An Invite belongs to:

* one inviter Player;
* one Drop.

An Invite produces a unique share URL.

An Invite does NOT belong to a predetermined recipient.

Creating an Invite requires the inviter Player to have a `displayName`, because the recipient needs to know who challenged them.

Did You Know? never asks:

`Who are you sending this to?`

Recipient selection happens outside the product.

One Invite may be sent to:

* one person;
* several people;
* a WhatsApp chat;
* any other destination chosen by the sender.

One Invite may therefore cause multiple Players to start Attempts.

## Challenger

### LOCKED

The **Challenger** is the Player whose Invite creates the current direct comparison context.

Example:

Rohanak sends Hira an Invite.

For Hira:

`Rohanak = Challenger`

Hira later sends Varun an Invite.

For Varun:

`Hira = Challenger`

The recipient-facing experience should prioritize this direct relationship.

## Source Invite

### LOCKED

A **Source Invite** is an internal attribution concept.

Opening an Invite alone does not establish attribution.

When a Player first starts their canonical Attempt for a Drop through an Invite:

that Invite becomes the Attempt's:

`sourceInviteId`

Once assigned, it never changes.

Example:

Hira opens Rohanak's Invite but does not start.

Later she opens Varun's Invite and starts the Drop.

Her Attempt is attributed to Varun.

Conceptually:

`Varun -> Hira`

Rohanak receives an Invite-open analytics event but does not receive completion attribution.

## Journey

### LOCKED

A **Journey** is a Player's ongoing exploration of a Topic.

User-facing example:

`Your Space Journey`

A Journey continues as new Drops release.

## Knowledge Map

### CURRENT DIRECTION

The **Knowledge Map** is the visual representation of a Player's Journey through a Topic.

It may show Areas such as:

```text
Earth
|
Solar System
|
Gravity
|
Stars
|
Black Holes
```

The Civilization research tree is inspiration, not a literal V1 technical requirement.

The Knowledge Map should eventually communicate:

* what Areas exist;
* what the Player has explored;
* which Areas have available Drops;
* what is coming next.

Do not persist separate mutable Knowledge Map state when it can be derived from Drops + Attempts.

## Exploration Progress

### LOCKED

**Exploration Progress** means how much currently released content the Player has played.

Example:

`7 of 9 Space Drops explored`

This is different from correctness.

## Knowledge Score

### CURRENT DIRECTION

**Knowledge Score** means the Player's correctness across some explicitly defined set of Questions.

Example:

`31 / 45 knew`

Do NOT translate this into unsupported claims such as:

`You know 69% of Space.`

The product is measuring performance on the content it has shown, not total human knowledge of the Topic.

Whether aggregate Knowledge Score is prominently user-facing in V1 remains open.

## Caught Up

### LOCKED

A Player is **Caught Up** when they have completed every currently released Drop within a Topic.

Example:

`You're caught up with Space.`

When a new Drop releases, the Player is no longer Caught Up until they play it.

Never say:

`You completed Space.`

## Release

### LOCKED

A **Release** is the moment a Drop becomes playable.

A Drop has a scheduled release time.

Before release:

`Coming Tuesday`

After release:

`Play now`

Released Drops remain available permanently in V1.

---

# 4. Content Hierarchy

## LOCKED

The content hierarchy is:

`Topic -> Area -> Drop -> Question`

For example:

```text
Space
|
|-- Earth
|   |-- Drop A
|   |-- Drop D
|   `-- future Drops
|
|-- Solar System
|   |-- Drop B
|   |-- Drop E
|   `-- future Drops
|
|-- Gravity
|-- Stars
`-- Black Holes
```

A Drop belongs to one Topic and one Area.

Release order does not have to follow Area order.

---

# 5. Player Activity Hierarchy

## LOCKED

The Player activity model is:

`Player -> Attempt -> Answers -> Result`

The Attempt is the canonical unit of one Player playing one Drop.

Score, completion, and other Result information should be derived from persisted Answers whenever practical.

---

# 6. Social Distribution Model

## LOCKED

V1 social interaction is built around direct invitations, not synchronous live-session concepts or persistent visible social collections.

The basic propagation is:

`A completes Drop`

-> `A creates Invite`

-> `B starts through A's Invite`

-> `B completes`

-> `B compares against A`

-> `B creates Invite`

-> `C starts through B's Invite`

Conceptually:

`A -> B -> C`

But this can branch.

Example:

```text
      A
    / | \
   B  C  D
   |
   E
```

Do not create a visible giant social collection from this.

Do not persist a generic graph object merely because propagation forms a graph.

Persist the underlying facts and derive propagation analytics later.

---

# 7. Social Visibility Principle

## LOCKED

**Direct relationships create intimacy. Aggregate statistics create scale.**

Before completing a challenged Drop, the Player should care primarily about:

* who challenged them;
* the Topic;
* the Challenger's score;
* the Drop.

Example:

`Rohanak challenged you on Space.`

`Rohanak got 3/5.`

`Can you beat that?`

Do not show a large list of unrelated Players.

After completion, direct comparison remains primary:

`You 4/5`

`Rohanak 3/5`

`You beat Rohanak.`

Broader context, when useful, should generally become aggregate:

* number of Players;
* average Result;
* percentile;
* challenge propagation statistics.

Which of these belong in V1 is still OPEN.

---

# 8. Privacy And Scale Behavior

## LOCKED

Sending the same Invite to 100 people does not create a visible 100-person social collection.

If Rohanak broadcasts one Invite and 100 people complete through it:

each recipient may reasonably see:

`Rohanak challenged you.`

Rohanak should not automatically receive a roster containing 100 names and scores.

If sender-facing feedback is introduced, it should scale through aggregates such as:

`12 people took your challenge`

`7 matched or beat your score`

rather than exposing a giant participant list.

A Player's first name and score should not automatically become visible to unrelated Players many hops downstream.

---

# 9. Invite Attribution Rules

## LOCKED

## Opening

Opening an Invite can produce:

`invite_opened`

for analytics.

It does NOT establish durable attribution.

## Starting

The Invite through which a Player first starts their canonical Attempt becomes:

`sourceInviteId`

for that Attempt.

Once assigned, it is immutable.

## Existing In-Progress Attempt

If a Player already started the Drop and later opens another Invite:

* resume existing Attempt;
* do not restart;
* do not replace attribution.

## Existing Completed Attempt

If a Player already completed the Drop and later opens another Invite:

* do not replay;
* do not create a new canonical Result;
* do not rewrite original attribution;
* allow comparison with the new Challenger using the existing Result.

Therefore:

**comparison context is different from acquisition attribution.**

---

# 10. Canonical Attempt Behavior

## LOCKED

Canonical means:

**one canonical Attempt per `playerId + dropId`.**

The invariant is independent of entry path.

If a Player completes a Drop through an Invite and later opens the same Drop directly:

* do not create a new scored Attempt;
* show or use the existing Result.

If a Player starts a Drop directly and later opens an Invite for the same Drop:

* resume the existing Attempt if in progress;
* use the existing Result if completed;
* do not rewrite Source Invite.

No-auth means this is enforced only for the same browser-local Player identity.

---

# 11. Identity Timing

## LOCKED

V1 does not require identity to consume the product.

Identity is required only when a Player wants to become socially visible by creating an Invite.

A Player may therefore:

* start a Drop anonymously;
* answer Questions anonymously;
* receive Reveals anonymously;
* complete a canonical Attempt anonymously;
* receive a Result anonymously;
* compare their Result with a Challenger anonymously;
* accumulate browser-local Journey progress anonymously.

A `displayName` is required only when the Player taps:

`Challenge a friend`

and does not already have one.

At that moment ask:

`What should your friend see your name as?`

Then save the `displayName` to the existing Player and continue to the V1 sharing options:

* `Challenge on WhatsApp`
* `Copy Invite`

Do not create a new Player merely because the name is added.

## Fresh Direct Player

No name is required before play.

Desired sequence:

`Home`

-> `play`

-> `five Questions`

-> `Result`

-> `Challenge a friend`

-> `name capture if unnamed`

-> `WhatsApp / Copy Invite`

## Fresh Invited Player

Do NOT ask for their name before playing.

Do NOT require their name between Question 5 and Result.

Desired sequence:

`Challenge curiosity`

-> `start`

-> `five Questions`

-> `Result vs Challenger`

-> `Challenge a friend`

-> `name capture if unnamed`

-> `WhatsApp / Copy Invite`

The anonymous Player can still see:

`You got 4/5`

`Rohanak got 3/5`

`You beat Rohanak.`

## Returning Named Player

If the browser-local Player already has a `displayName`:

* do not ask again during normal V1 sharing;
* Challenge can proceed directly to the V1 sharing options.

## Privacy And Analytics Implication

Players who never share may remain unnamed.

V1 does not need named completion data for every Player.

Analytics and aggregate Drop statistics must work using stable Player IDs rather than requiring display names.

---

# 12. Sharing

## LOCKED

Sharing contains exactly two V1 options.

## Challenge On WhatsApp

Open WhatsApp with challenge text + unique URL prefilled.

Recipient selection happens inside WhatsApp.

## Copy Invite

Copy the complete message + URL.

The Player may paste it into any other platform.

Do not build:

* contacts access;
* phone number entry;
* recipient-name entry;
* Instagram integration;
* Telegram integration;
* WhatsApp Business API.

## Invitation Copy Principle

### LOCKED

Invitation copy should sound like something the Player could naturally have sent.

Bad:

`Rohanak has challenged you to play Did You Know?`

Evergreen default:

`I got 4/5 on this Space challenge. Think you can beat me?`

`[URL]`

The Topic must be present.

The recipient's interest in the Topic is part of the acquisition mechanism.

Core Invite semantics must work for any LIVE historical Drop.

Language such as `this week's` may be used only when the Drop is genuinely the current/latest release.

Do not hardcode `this week's` into Invite copy that also serves older LIVE Drops.

Invite copy must follow the score-aware perfect-score rule:

* scores `0-4/5` may ask whether the recipient can beat the Player;
* score `5/5` should ask whether the recipient can match the Player.

---

# 13. Episodic Release Model

## LOCKED

Drops are deliberately finite curated releases.

The product is not an infinite question generator.

Example:

`New Space Drop every Tuesday`

A Player may see:

`You're caught up with Space.`

`Next Drop Tuesday.`

When the next Drop releases:

* it becomes playable automatically;
* previous Drops remain available;
* previously Caught Up Players have something new to explore.

For V1, releases happen at one configured global moment.

Do not implement per-user rolling release times.

Exact release cadence is still OPEN.

---

# 14. Content Creation / CMS Principle

## LOCKED

V1 does NOT need a graphical CMS.

It DOES need a rigid content contract.

Source-controlled typed content is the canonical V1 source of truth for:

* Topic;
* Areas;
* Drops;
* Questions;
* answer choices;
* correct answers;
* Reveals;
* sources;
* release metadata.

A creator should eventually be able to:

`create Drop`

-> `fill metadata`

-> `add exactly 5 Questions`

-> `add explanations`

-> `add sources`

-> `schedule`

-> `validate`

-> `publish`

Once valid content exists, normal application behavior should already understand how to:

* release it;
* display it;
* let Players play it;
* score it;
* share it;
* update Journey progress;
* generate Topic-aware invitation copy;
* collect analytics.

Publishing an ordinary new Drop should not require new product logic.

The eventual graphical CMS should be a UI over this same content contract rather than a different content system.

---

# 15. Source-Of-Truth Principle

## LOCKED

**Persist facts. Derive consequences.**

## Source-Controlled Content

Canonical for:

* Topic;
* Area;
* Drop;
* Questions;
* correct answers;
* Reveal copy;
* editorial sources;
* release metadata.

## Persistent Runtime State

The backend should eventually persist facts such as:

* Player;
* Attempt;
* Answer;
* Invite;
* Attempt's Source Invite;
* relevant analytics events.

## Derived State

Do not persist mutable duplicates where they can reliably be calculated.

Examples:

* Result;
* Drop completion;
* Topic Exploration Progress;
* Caught Up status;
* average Drop score;
* direct comparison;
* propagation depth;
* descendant counts;
* viral coefficient.

Exact backend schema is NOT yet defined.

---

# 16. LIVE Drop Immutability

## LOCKED

Once a Drop is LIVE, its scoring object should be treated as immutable.

Do not materially change:

* Question membership;
* Question IDs;
* option meaning;
* correct answers;
* scoring.

Typographical or source-link corrections that do not affect meaning/scoring are acceptable.

A material factual correction should be handled as a new revision or release rather than silently changing historical comparisons.

Detailed revision mechanics are not required in V1.

---

# 17. Timer

## OPEN

We have discussed:

* timed quiz energy;
* 3-2-1 countdown;
* elapsed time;
* timed Questions.

Nothing is locked.

Do NOT currently assume:

* speed contributes to score;
* individual Questions have time limits;
* the Drop has a countdown clock.

This should be resolved from the actual UX journey.

---

# 18. Post-Drop Lesson

## OPEN

We have discussed a possible 30-60 second synthesis after completing the five Questions.

Potential purpose:

connect the five individual facts into a more coherent understanding of the Area.

However:

every Question already includes an immediate Reveal and explanation.

We have not yet decided whether a separate synthesis materially improves V1.

Do not assume it exists.

---

# 19. Aggregate Social Context

## OPEN

Potential post-Result context includes:

* total Players;
* average Result;
* percentile;
* hardest Question;
* percentage who knew each Question.

We have deliberately rejected giant public participant lists.

Which aggregates genuinely improve V1 remains unresolved.

---

# 20. Home Prioritization

## CURRENT DIRECTION

If a returning Player has:

* a newly released Drop;
* older unplayed Drops;

the newest/current Drop should probably receive priority because it represents the current shared social moment.

Older Drops remain available through the Journey.

This is not fully locked until the returning-Player journey is specified.

---

# 21. Initial V1 Technology Direction

## LOCKED

Current engineering stack:

| Area | Decision |
| --- | --- |
| Frontend/framework | Next.js App Router |
| Language | TypeScript |
| UI | React through Next.js |
| Styling | Tailwind CSS |
| Backend/database | Convex |
| Deployment | Vercel |
| Package manager | npm |
| Source control | Git + GitHub |
| Authentication | None |
| Content | Source-controlled typed data |
| Runtime state | Convex |
| Mobile target | Design around ~375px first |
| Browser support | Modern Chrome / Safari / mobile browsers |
| Architecture | Minimal, V1-specific, no speculative abstractions |

The repository/application has not yet been scaffolded.

Detailed engineering setup will be defined after the user journeys and product states are clearer.

---

# 22. Explicitly Retired V1 Concepts

## LOCKED

Do not currently design around:

* Pack;
* Room;
* Group;
* Lobby;
* Host;
* Round;
* Level;
* Module;
* Course;
* Challenge Thread;
* Challenge Chain;
* persisted / visible Propagation Graph;
* friend recruitment unlocking knowledge.

These concepts may be reconsidered in future versions but do not describe the immediate product.

A future synchronous multiplayer / Kahoot-style mode is not prohibited; it is simply outside V1 and must not influence V1 architecture.

---

# 23. Current Product Model Summary

## Content

`Topic -> Area -> Drop -> Question`

## Player Activity

`Player -> Attempt -> Answers -> Result`

## Social Distribution

`Player -> Invite -> another Player's Source Invite`

## Long-Term Experience

`Topic -> Journey -> Knowledge Map`

## Core Social Principle

`Direct relationships create intimacy.`

`Aggregate statistics create scale.`

## Core Content Principle

`Curated episodic Drops create anticipation and shared context.`

## Core Data Principle

`Persist facts. Derive consequences.`

---

# 24. Next Section To Define

## TODO - Concrete V1 User Journeys

The next product-design work should explicitly document:

## Journey 1

Fresh Player starts directly.

## Journey 2

Fresh Player arrives through a Challenger's Invite.

## Journey 3

Returning Player comes back when:

* a new Drop exists;
* they are Caught Up;
* older unplayed Drops exist.

## Journey 4

Player who already completed a Drop receives a new Invite for that same Drop.

These journeys should determine:

* minimum screens;
* screen versus state boundaries;
* Drop intro behavior;
* name capture;
* Result variants;
* timer decision;
* post-Drop lesson decision;
* Journey experience;
* aggregate social proof;
* sharing behavior.

Do not define implementation architecture from assumptions before these flows are specified.
