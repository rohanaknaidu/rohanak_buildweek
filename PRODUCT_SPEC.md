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

## Current Product Contract

### LOCKED

Did You Know? turns surprising knowledge into a social object:

`discover -> accumulate -> compare with people you know -> pass onward -> return when new knowledge arrives`

Current system model:

* A **Drop** is one curated, scheduled knowledge challenge.
* A **Question** creates prediction / commitment.
* A **Reveal** is the learning payoff.
* A **Discovery** is the concise knowledge object that travels socially between Result and Pair surfaces.
* An **Attempt** is the canonical play-through for one Player/Profile and one Drop.
* An **Invite** lets a completed Drop move from one authenticated Profile to another person.
* A **Trail** is editorial guidance through Drops, not a prerequisite graph.
* A **knowledge pair** is a symmetric `You & {person}` relationship created from an intentional challenged-completion flow.
* A **release** makes a Drop available over time and reactivates existing pairs.

Current invariants:

* Content remains plain serializable data.
* Question count is derived from Drop content, not hardcoded to five.
* Every Question has a required social `discovery` sentence separate from the longer Reveal explanation.
* The generic renderer may branch on visual vocabulary keys, never Drop ID or Topic ID.
* Backend release checks use server time; upcoming Drops cannot be played or invited early.
* Anonymous play remains possible for released open-Trail Drops.
* Google Profile identity is required for durable progress, Challenge identity, and persistent knowledge pairs.
* Friends see `displayName`, including full names when available; friends never see email.
* Pair comparison is derived from canonical Attempts and Answers; do not persist scores or knowledge summaries.
* Pair state is current truth, not notification/read state.
* Current Trails are open/guided. Future prerequisite Trails are a separate product decision.
* Replay/reset, feeds, friend requests, leaderboards, XP/streaks, AI recommendations, and CMS/admin tooling are out of scope for Build Week.

Current open decisions:

* **Anonymous access policy:** anonymous users can currently explore all released open-Trail Drops; whether to add soft or hard conversion limits later remains open.
* **Trail access modes:** sequential/prerequisite Trails may exist later, but current Trails remain open/guided.
* **Replay:** canonical first Attempt remains the only Attempt; a future replay model must preserve historical/social meaning.
* **Pair list scaling:** no hard pair limit exists; future Home ranking should likely use current relevance rather than arbitrary caps.

### Historical Thesis Language

**Did You Know? is an asynchronous social knowledge game built around recurring curated knowledge challenges.**

A Player:

1. plays an ordered set of Questions in a Drop;
2. learns something immediately after every Answer;
3. receives a score out of that Drop's Question count;
4. can Challenge a friend to the exact same ordered set of Questions;
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

M3 production has multiple Topics represented through released LIVE Drops.

**Space** is the first Topic, not the identity of the product.

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

Each Drop determines its own Question count.

The editorial rule is:

* include as many Questions as the Drop needs to deliver its central idea well;
* usually aim for 5-7 Questions;
* roughly 4-9 Questions is normal;
* 10+ Questions requires unusually strong editorial justification;
* never add a weak Question merely to hit a target count.

The product engine must derive the total Question count from the Drop content
and support variable Question counts without changing play, Result, Invite,
Profile, ownership, Pair, or generic Home logic.

Example:

Topic:

`Space`

Area:

`Solar System`

Drop:

`How Strange Is Our Solar System?`

Questions:

`N`, derived from the authored Drop content.

A Drop is the atomic unit of:

* play;
* scoring;
* social comparison;
* sharing;
* release scheduling;
* completion;
* analytics.

Everyone being compared on a Drop receives the exact same ordered Questions.

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

M3 Home and Invite surfaces should make Topic legible.

During Question play, do not repeat Topic unless it materially improves orientation.

The Drop title also does not need to repeat on every Question.

The progress treatment should combine:

* one visual step per Question in the Drop;
* explicit `current Question / total Questions` text.

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

For every non-final Question, the Reveal CTA should be:

`Next question`

For the final Question, the Reveal CTA should be:

`See result`

Do not insert an interstitial state between a Reveal and the next Question.

The final Reveal still appears before the Result.

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

A **Player** is one V1 browser/device-local identity representing a person using the product before authentication.

A Player exists before authentication.

A Player allows Did You Know? to:

* play without authentication;
* persist anonymous Attempts immediately;
* resume on the same browser;
* retain provenance for where an Attempt originated.

The browser-local `playerId` remains after successful Profile authentication as provenance.

Do not erase the originating Player merely because a Profile is created.

Player identity is convenience identity, not secure proof of a human being.

An anonymous Player is still valid and may have valid Attempts, Answers, Results, and browser-local Journey progress.

## Auth Identity

### LOCKED

V1 uses **Google-only authentication via Convex Auth** for durable authentication.

Convex Auth establishes:

> This is a verified authenticated user / email.

Authentication proves identity and maintains the durable session.

Use:

* Google OAuth through Convex Auth;
* no password;
* no username;
* no email OTP;
* no magic links;
* no password reset;
* no Resend or transactional email provider for authentication;
* no Clerk;
* no Better Auth;
* no additional OAuth providers.

Convex Auth is the only V1 authentication provider.

Google is the external identity provider.

Convex Auth remains the app authentication and session system.

The stack is:

`Next.js -> Convex Auth using Google OAuth -> Convex Profile / game data -> Vercel`

Google proves identity.

Convex Auth maintains the authenticated session.

Convex product data owns Profile, Journey, Attempts, Answers, Invites, scores, and claiming.

Do not make M2.1 depend on authenticated Next.js middleware, authenticated Server Components, SSR auth, or API-route auth.

Use client-side authentication for this milestone.

Before substantial implementation, verify the official Convex Auth Google OAuth setup for the existing Next.js App Router project.

If Google OAuth setup presents a concrete blocker, stop and report it before proposing another auth model.

The Google OAuth callback should use the Convex HTTP Actions URL:

`https://<convex-deployment>.convex.site/api/auth/callback/google`

The exact development and production callback URLs are deployment configuration, not durable product semantics.

Before configuring Google Cloud, retrieve the exact dev and prod Convex HTTP Actions URLs from the actual deployments or dashboard rather than guessing them.

`@convex-dev/auth` is required for implementation.

Do not lock speculative npm dependencies such as `jose` or an arbitrary `@auth/core` version into the product spec.

During implementation, determine exact compatible peer / package requirements from the installed current Convex Auth version and official setup instructions.

Do not independently upgrade or pin auth dependencies without compatibility evidence.

## Profile

### LOCKED

A **Profile** is the Did You Know product identity associated with an authenticated Convex Auth user.

At minimum, a Profile owns:

* authenticated user identity reference;
* email from Google identity;
* `displayName`;
* creation / update timestamps.

`displayName` belongs to the Did You Know product model because it is the identity friends see in Challenges.

On first successful Google authentication, initialize `Profile.displayName` from Google name / profile data when available.

Do not permanently derive `displayName` from Google on every request.

`Profile.displayName` is product-owned so it can become editable later.

Friends see the Profile display name.

Friends never see the Profile email.

The same Google / Convex Auth identity must always resolve to the same Profile.

Do not create duplicate Profiles for repeated sign-ins with the same authenticated user.

Do not store Journey, Attempt, Answer, Invite, or progress state inside auth-user metadata merely because auth provides a user record.

## Attempt

### LOCKED

An **Attempt** is one canonical play-through of one Drop.

Before authentication, the canonical invariant is:

`playerId + dropId`

has one canonical Attempt.

Anonymous current progress is only an Attempt where:

`playerId + dropId + no profileId`

Once an Attempt has been claimed into a Profile, its historical `playerId` remains provenance only.

That `playerId` must not grant anonymous access to the claimed Attempt.

After authentication, the canonical invariant is:

`profileId + dropId`

has one canonical Attempt.

An Attempt can be:

* in progress;
* completed.

Every committed Answer should be persisted as it occurs.

Refreshing midway through a Drop should resume the existing Attempt rather than restarting it.

A Player or Profile cannot replay the same Drop to create a different canonical Result.

If a Profile does not already own an Attempt for the Drop, eligible anonymous progress should be claimed into that Profile after successful authentication.

If a Profile already owns an Attempt for the Drop, the existing Profile Attempt wins.

Do not:

* merge scores;
* replace Profile progress with anonymous progress;
* choose the higher score;
* create a score picker;
* create two canonical Profile Attempts.

The anonymous Attempt may remain as provenance / history if needed, but it must not become a second canonical Profile score.

The originating `playerId` should remain preserved for provenance.

Do not remove the originating `playerId` from claimed Attempts merely to enforce ownership.

Ownership-aware queries and mutations must enforce the boundary.

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

`correct answers / total Questions in this Drop`

Example:

`4/5`

Do not introduce points, XP, or arbitrary scoring in V1.

The Result's default job hierarchy is:

1. tell the Player how they did;
2. if relevant, tell the Player how they compared with their direct Challenger;
3. make the Player's own Result feel worth challenging someone with;
4. provide a real exit back to Home;
5. offer anonymous Players a quiet way to save their Journey.

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
6. `Back to Home`;
7. quiet `Save my journey` prompt when the Player is anonymous.

Example intent:

`3/5`

`You knew 3 of 5 on this Space challenge.`

`How Strange Is Our Solar System?`

`Think someone can beat your 3/5?`

`Challenge a friend`

`Back to Home ->`

`Save my journey`

Core Result semantics must work for any LIVE historical Drop.

Language such as `this week's` may be used only when the Drop is genuinely the current/latest release.

Do not hardcode `this week's` into Result copy that also serves older released
LIVE Drops.

## Challenged Result

### LOCKED

This baseline V1 challenged-Result contract is superseded by
`M4.1 Challenged Result Hierarchy` where they conflict.

A **Challenged Result** is shown when the Player has a current direct Challenger comparison context.

Default hierarchy:

1. Player score;
2. win / loss / tie against the direct Challenger;
3. compact score comparison;
4. Drop title;
5. social provocation around the current Player's own Result;
6. `Challenge a friend`;
7. `Back to Home`;
8. quiet `Save my journey` prompt when the Player is anonymous.

Win means:

the Player scored higher than the Challenger.

Loss means:

the Challenger scored higher than the Player.

Tie means:

the Player and Challenger scored equally.

Win / loss / tie are determined only by comparing Results for the same Drop, using that Drop's total Question count.

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

`Back to Home ->`

The Challenger gets the Player into the Drop.

The Player's own Result is what they Challenge the next person with.

Outgoing Invites always represent the current Player and their canonical Result, regardless of whether they won, lost, or tied against their Challenger.

Do not imply that the Player is forwarding their Challenger's Result or Challenge on the Challenger's behalf.

## Perfect Score Challenge Copy

### LOCKED

A Player with a perfect score cannot logically ask someone else to beat that Result.

For non-perfect scores, Result and Invite copy may use the semantic idea:

`beat`

Example Result intent:

`Think someone can beat your 3/5?`

Example Invite intent:

`I got 3/5 on this Space challenge. Think you can beat me?`

For a perfect score, Result and Invite copy should use the semantic idea:

`match`

Example Result intent:

`Think someone can match your 5/5?`

Example Invite intent:

`I got 5/5 on this Space challenge. Think you can match me?`

Do not create elaborate copy variations for every score in V1.

## Default Result Exclusions

### LOCKED

These exclusions apply to the default pre-M5 Result surface. M5 deliberately
allows upcoming release information on Result only when there is no released
next Trail Drop and anticipation is the most valuable available action.

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

`Back to Home` remains the secondary Result action.

For anonymous Players, `Save my journey` is a quiet persistence prompt, not an authentication wall before seeing the Result.

## Challenge

### LOCKED

**Challenge** is primarily a user-facing action.

Meaning:

> I completed this Drop and want somebody else to play the exact same Drop and compare their Result with mine.

Primary CTA:

`Challenge a friend`

If the Player is anonymous, this action routes through the Profile / auth flow before an Invite is created.

If the Player already has an authenticated Profile, this action proceeds directly to sharing.

Do not assume Challenge needs its own persistent database entity.

## Invite

### LOCKED

An **Invite** is the shareable object created when a Player challenges someone.

An Invite belongs to:

* one inviter Profile;
* one Drop.

An Invite produces a unique share URL.

An Invite does NOT belong to a predetermined recipient.

Creating an Invite requires an authenticated Profile, because social identity should be durable and trustworthy.

Did You Know? never asks:

`Who are you sending this to?`

Recipient selection happens outside the product.

One Invite may be sent to:

* one person;
* several people;
* a WhatsApp chat;
* any other destination chosen by the sender.

One Invite may therefore cause multiple Players to start Attempts.

A Profile has at most one reusable Invite per Drop in V1.

Conceptually:

`Profile + Drop -> reusable Invite`

The same Invite URL may be shared repeatedly with one or many recipients.

Implications:

* Invite is not recipient-specific;
* Invite existence does not mean it was sent;
* reopening the share flow reuses the existing Invite;
* `Challenge on WhatsApp` and `Copy Invite` actions are separate share-action / analytics concepts;
* an attributed Attempt is stronger evidence of propagation than Invite creation.

This is a V1 simplification, not a claim that future versions can never support multiple Invites per Profile + Drop.

Do not introduce future multi-Invite architecture in V1.

## Challenger

### LOCKED

The **Challenger** is the Profile whose Invite creates the current direct comparison context.

Example:

Rohanak sends Hira an Invite.

For Hira:

`Rohanak = Challenger`

Hira later sends Varun an Invite.

For Varun:

`Hira = Challenger`

The recipient-facing experience should prioritize this direct relationship.

## Invite Landing

### LOCKED

The **Invite landing** is the experience shown when a Player opens an Invite URL.

Its primary product principle is:

**friend -> Topic -> friend's Result -> curiosity -> product**

The meaningful content hierarchy should begin with the Challenger, not with the Did You Know? brand.

The product brand or logo may still be visible as normal page chrome, but it should not displace the social challenge as the primary message.

Recommended semantic hierarchy:

1. Challenger challenged the Player on the Topic;
2. Challenger's Result;
3. score-aware challenge prompt;
4. Drop title;
5. `5 questions`;
6. short immediate-learning promise;
7. primary CTA semantically equivalent to `Take the challenge`.

For Challenger scores `0-4/5`, the challenge prompt may use the semantic idea:

`Can you beat that?`

For Challenger score `5/5`, the challenge prompt should use the semantic idea:

`Can you match that?`

Exact final copy and visual typography remain design decisions.

Invite landing should not show:

* name field;
* authentication / Profile creation;
* Journey;
* Knowledge Map;
* upcoming Drops;
* aggregate statistics;
* propagation explanation;
* Source Invite mechanics;
* share options.

Opening an Invite alone does not create Source Invite attribution.

Starting from the Invite landing follows the locked Invite Attribution Rules.

Do not create a separate Drop-intro state after Invite landing.

`No authentication required before play` is not a required Invite landing element.

It may be tested later as trust / friction copy.

The locked behavior remains:

* no authentication is required before play;
* no identity is requested before play;
* no permissions are requested.

Link / social-preview treatment is a later design and implementation consideration, not a Journey 2 blocker.

Future implementation should avoid a broken or suspicious-looking link preview.

Whether preview metadata is generic or dynamically Challenger-specific is NOT yet locked.

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

A **Journey** is a Player or Profile's ongoing exploration of a Topic.

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

Before authentication, the Player activity model is:

`Player -> Attempt -> Answers -> Result`

After authentication, eligible progress is associated with:

`Profile -> Attempt -> Answers -> Result`

The Attempt is the canonical unit of a Player or Profile playing one Drop.

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

A Profile's display name and score should not automatically become visible to unrelated Players many hops downstream.

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

Before authentication, canonical means:

**one canonical Attempt per `playerId + dropId`.**

After authentication, canonical means:

**one canonical Attempt per `profileId + dropId`.**

The invariant is independent of entry path.

If a Player completes a Drop through an Invite and later opens the same Drop directly:

* do not create a new scored Attempt;
* show or use the existing Result.

If a Player starts a Drop directly and later opens an Invite for the same Drop:

* resume the existing Attempt if in progress;
* use the existing Result if completed;
* do not rewrite Source Invite.

Before authentication, this is enforced only for the same browser-local Player identity.

After successful authentication, eligible anonymous progress should be claimed into the authenticated Profile according to the Profile claim rules.

---

# 11. Identity And Profile Timing

## LOCKED

V1 does not require identity to consume the product.

Identity is required when a Player wants durable identity:

* saving their Space Journey across browsers / devices;
* creating an Invite and becoming socially visible as Challenger.

A Player may therefore:

* start a Drop anonymously;
* answer Questions anonymously;
* receive Reveals anonymously;
* complete a canonical Attempt anonymously;
* receive a Result anonymously;
* compare their Result with a Challenger anonymously;
* accumulate browser-local Journey progress anonymously.

Do not put authentication before the first quiz.

Use one Profile / auth flow with two entry points:

* `Save my journey`;
* `Challenge a friend` from an anonymous Player.

## Save My Journey

Anonymous Result / caught-up Home:

`Save my journey`

-> Profile / auth flow

-> successful Google authentication

-> claim eligible anonymous progress

-> return to Home

## Challenge A Friend While Anonymous

Anonymous Result:

`Challenge a friend`

-> same Profile / auth flow

-> successful Google authentication

-> claim eligible anonymous progress

-> return directly to Challenge / share choices

For an already-authenticated Profile:

`Challenge a friend`

-> share choices immediately

No repeated Profile creation, name entry, or email entry during normal sharing.

## Profile Creation UX

Conceptual flow:

`Create your profile`

`Continue with Google`

After successful Google authentication, complete the Profile / claim operation and return to the original intended action.

Do not ask for passwords.

Do not ask for email OTP.

Do not ask for a typed display name in M2.1.

Do not create separate confusing product flows for "sign up" and "sign in."

The user authenticates with Google.

After authentication:

* if this auth identity has no Profile, create one;
* if it already has a Profile, load it;
* run the same claim / reconciliation rules.

The user should not need to understand whether they just "signed up," "signed in," or "claimed an anonymous Player."

Do not call a user signed in unless Google authentication actually succeeded.

## Fresh Direct Player

No authentication or name is required before play.

Desired sequence:

`Home`

-> `play`

-> `five Questions`

-> `Result`

At Result, the Player may:

* Challenge a friend, which requires Profile creation if anonymous;
* Back to Home without authentication;
* Save my journey.

## Fresh Invited Player

Do NOT ask for identity before playing.

Do NOT require identity between Question 5 and Result.

Desired sequence:

`Challenge curiosity`

-> `start`

-> `five Questions`

-> `Result vs Challenger`

At Result, the Player may:

* Challenge a friend, which requires Profile creation if anonymous;
* Back to Home without authentication;
* Save my journey.

The anonymous Player can still see:

`You got 4/5`

`Rohanak got 3/5`

`You beat Rohanak.`

## Authenticated Profile

If the Player is authenticated and has a Profile:

* do not ask for name / email again during normal V1 sharing;
* Challenge can proceed directly to the V1 sharing options;
* signed-in return should restore Profile-owned progress across browsers / devices.

## Privacy And Analytics Implication

Players who never save their Journey or Challenge someone may remain anonymous.

Anonymous analytics and aggregate Drop statistics must work using stable Player IDs rather than requiring Profiles.

Email notifications are not part of M2.1.

Email is introduced first as the durable authentication / recovery identity.

Notifications are future behavior.

---

# 12. Claiming Anonymous Progress

## LOCKED

Claiming anonymous progress is mandatory after successful Profile authentication.

Suppose:

`Player ABC`

-> completed Drop

-> `1/5`

Then the user authenticates.

The resulting durable Profile must retain that completed progress.

Do not produce:

`anonymous Player ABC -> 1/5`

and separately:

`new Profile -> no history`

Conceptually, the Profile becomes the durable owner of eligible Attempts while each Attempt still preserves its originating Player / browser provenance.

Do not delete or rewrite the originating `playerId`.

If the anonymous Attempt has a `sourceInviteId`, claiming must preserve it.

Authentication / claiming must never erase or overwrite acquisition attribution.

Anonymous progress may only be claimed by the currently authenticated Convex Auth identity.

Client code must never be trusted to supply or choose an arbitrary `profileId`, auth user ID, or ownership target.

Convex functions must derive the authenticated identity from the auth session, resolve or create that identity's Profile internally, and perform claiming against that Profile.

The same rule applies to authenticated Invite creation and any Profile-owned mutation.

If the Profile already owns an Attempt for the Drop:

* existing Profile Attempt wins;
* anonymous progress is not merged into the canonical Profile score;
* anonymous progress does not replace Profile progress;
* the higher score is not chosen;
* no score picker is shown.

Make this behavior explicit in the data model rather than relying on frontend convention.

Once authenticated, Profile-owned progress is canonical in all Result, Home, Journey, and Challenge views.

An unclaimed browser-local Attempt for the same Drop must not continue appearing as the user's current score merely because it belongs to the current browser.

When no Profile is authenticated, anonymous canonical progress queries must exclude claimed Attempts.

Conceptually, anonymous lookup is:

`playerId + dropId + no profileId`

Authenticated lookup is:

`profileId + dropId`

A browser-local `playerId` is client-held and may be stale, restored, or intentionally supplied again.

Therefore rotating the browser `playerId` is not the authorization mechanism.

The backend ownership rule is the authorization boundary.

Do not surface two canonical scores.

The originating anonymous Attempt may remain stored for provenance / history according to the data model, but it is not the authenticated Profile's canonical progress.

## Signed-In Return Acceptance

### LOCKED

V1 durable identity is only successful if signed-in return works across browsers / devices.

Required acceptance test:

1. Browser A plays a Drop anonymously.
2. User continues with Google.
3. Existing score is claimed.
4. Browser B starts without Browser A's local `playerId`.
5. User continues with the same Google account.
6. Did You Know restores the same Profile.
7. The previously completed Drop appears completed with the original score.

If this does not work, the milestone has not solved durable Journey continuity.

## Sign-Out Boundary

### LOCKED

Sign-out must make the account boundary visible and real.

Successful sign-out:

1. Convex Auth `signOut()` succeeds.
2. Authenticated / Profile UI state is cleared.
3. Pending auth, share, and continuation state is cleared.
4. A new browser-local anonymous `playerId` is generated.
5. The new `playerId` is persisted for future anonymous play.
6. The app renders anonymous Home.

If Convex Auth sign-out fails, do not rotate the browser identity and do not visually present the user as signed out.

Do not delete Profile, Attempt, Answer, Invite, or provenance data from Convex during sign-out.

Previously claimed Profile-owned progress must not remain visible anonymously after sign-out merely because the browser once supplied the originating `playerId`.

Signing back in with the same Google Profile must restore the Profile-owned canonical progress.

Shared-device acceptance test:

`Rohanak signed in`

-> Profile score visible

-> `Sign out`

-> anonymous state, no Rohanak / Profile score

-> fresh anonymous `playerId`

-> `Continue with Google`

-> same Profile restored

-> original Profile score visible.

---

# 13. Sharing

## LOCKED

Sharing contains exactly two V1 options:

* `Challenge on WhatsApp`
* `Copy Invite`

## Challenge On WhatsApp

Open WhatsApp with challenge text + unique URL prefilled.

Recipient selection happens inside WhatsApp.

If the Player returns to Did You Know? after opening WhatsApp, preserve the existing Result / share context.

## Copy Invite

Copy the complete message + URL.

After the complete message and URL are copied, show:

`Invite copied`

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

Do not hardcode `this week's` into Invite copy that also serves older released
LIVE Drops.

Invite copy must follow the score-aware perfect-score rule:

* scores `0-4/5` may ask whether the recipient can beat the Player;
* score `5/5` should ask whether the recipient can match the Player.

## Challenge To Share Flow

### LOCKED

After a Result, the primary CTA is:

`Challenge a friend`

For an anonymous Player without an authenticated Profile:

`Challenge a friend`

-> Profile / auth flow

-> successful Google authentication

-> claim eligible anonymous progress

-> reuse or create the Profile's reusable Invite for this Drop

-> share choices

For an authenticated Profile:

`Challenge a friend`

-> reuse or create the Profile's reusable Invite for this Drop

-> share choices

Share choices are exactly:

* `Challenge on WhatsApp`
* `Copy Invite`

No recipient selection occurs inside Did You Know?.

Full generated-message preview is not a V1 product requirement.

It may be used during visual design if helpful.

Generated Invite copy is fixed by the product and non-editable in V1.

Default Invite copy does not need the Drop title.

---

# 14. Episodic Release Model

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

# 15. Content Creation / CMS Principle

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
* Discoveries;
* sources;
* release metadata.

A creator should eventually be able to:

`create Drop`

-> `fill metadata`

-> `add the Questions that earn their place`

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

# 16. Source-Of-Truth Principle

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
* Profile;
* Attempt;
* Answer;
* Invite;
* Attempt's Source Invite;
* Profile claim / ownership facts;
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

# 17. LIVE Drop Immutability

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

# 18. Timer

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

# 19. Post-Drop Lesson

## OPEN

We have discussed a possible 30-60 second synthesis after completing the five Questions.

Potential purpose:

connect the five individual facts into a more coherent understanding of the Area.

However:

every Question already includes an immediate Reveal and explanation.

We have not yet decided whether a separate synthesis materially improves V1.

Do not assume it exists.

---

# 20. Aggregate Social Context

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

# 21. Home Prioritization

## CURRENT DIRECTION

If a returning Player has:

* a newly released Drop;
* older unplayed Drops;

the newest/current Drop should probably receive priority because it represents the current shared social moment.

Older Drops remain available through the Journey.

This is not fully locked until the returning-Player journey is specified.

---

# 22. Fresh Direct Home

## LOCKED

Fresh Direct Home is the experience for a new Player who opens Did You Know? directly.

It should:

* make Did You Know? feel like a small guided world of surprising knowledge;
* show the current visible Trail;
* make Topic and Area legible as content context;
* show per-Drop exploration state;
* lightly hint that the Result can become social;
* avoid explaining the full Challenge mechanics;
* let the Player choose any released LIVE Drop in the visible Trail.

`Drop` remains the canonical domain/content term, but a fresh Player does not need to understand that term before playing.

Required semantic hierarchy:

1. `Did You Know?`;
2. a curiosity-led proposition such as `Follow a thread of curiosity`;
3. visible Trail title / description;
4. quiet explored count such as `1 of 3 explored`;
5. released LIVE Drop entries in Trail order;
6. each Drop's Topic, Area, title, Question count, and state/action.

Drop states on Home:

* `Explore` for an unstarted released LIVE Drop;
* `Continue - N/total questions` for an in-progress Drop;
* `Explored - X/total correct` for a completed Drop.

Home actions:

* `Explore` starts that Drop;
* `Continue` resumes that Drop;
* `Explored` opens that Drop's Result;
* completed Drops do not replay in M3.

Exact marketing copy remains a design/copy decision.

Fresh Direct Home should not require:

* name;
* authentication / Profile creation;
* upcoming Drop;
* aggregate statistics;
* share options;
* detailed explanation of Invites.

Approximate duration remains optional and should only be shown if honest for the actual content.

Do not create a separate Drop-intro screen in V1.

Do not turn M3 Home into:

* Browse Topics;
* Categories;
* All Drops;
* a content marketplace;
* a Knowledge Map;
* a course completion dashboard;
* a recommendation feed.

---

# 23. Result Escape And Minimal Caught-Up Home

## LOCKED

The Result screen must not be a dead end.

Every Result should provide:

* primary action: `Challenge a friend`;
* secondary action: `Back to Home`;
* quiet persistence prompt for anonymous Players: `Save my journey`.

`Back to Home` must work without authentication.

It must not route a completed Player back into the same completed Result forever.

M3 supersedes the one-Drop caught-up Home with Guided Exploration Home.

For a Player or Profile who has completed one released LIVE Drop but not all
released LIVE Drops, Home should show that Drop as explored and leave the other
visible Trail entries available.

For a Player or Profile who has completed all currently released LIVE Drops,
Home may quietly communicate that the Player has explored the available Trail
without introducing mastery, XP, streaks, leaderboard, or Knowledge Map claims.

For an anonymous Player, the minimal caught-up Home should also quietly communicate:

* progress is saved on this device;
* `Save my journey`.

For an authenticated Profile, do not show the saved-on-this-device warning.

Authenticated Home, caught-up Home, and Result should show a quiet account affordance using `Profile.displayName`.

Example semantic intent:

`Rohanak Naidu v`

The account affordance should not compete with the Question, Result, or Challenge hierarchy.

Tapping it opens a minimal account sheet containing:

* Profile display name;
* Profile email, visible only to the signed-in user;
* `Your progress is saved to your profile.`;
* `Sign out`.

Do not show Profile email in Invite, share, social, or public comparison surfaces.

Do not add account settings, profile pages, name editing, account deletion, avatars, or Journey 3 navigation in M2.2.

After the first successful authentication that meaningfully claims / saves progress, show a small transient confirmation:

`Journey saved`

`Your progress is now connected to your Google account.`

Do not show this confirmation on every later returning sign-in unless a new claim or save action actually occurred.

This is intentionally not the full Journey 3 experience.

Do not add yet:

* Knowledge Map;
* exploration percentages;
* back-catalog redesign;
* release countdowns;
* full returning-player Home behavior;
* aggregate social statistics.

---

# 24. Initial V1 Technology Direction

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
| Authentication | Convex Auth, client-side Google-only OAuth |
| Content | Source-controlled typed data |
| Runtime state | Convex |
| Mobile target | Design around ~375px first |
| Browser support | Modern Chrome / Safari / mobile browsers |
| Architecture | Minimal, V1-specific, no speculative abstractions |

The repository/application has been scaffolded with the M0 foundation.

M3.0 established a content-scalability foundation without changing the user journey:

* Topic and Area are first-class source-controlled content records.
* Drops reference Topic and Area by ID rather than embedding Space as generic app structure.
* Space is current content, not the identity of Did You Know?.
* Superseded by M3/M5: production now has multiple released and scheduled LIVE Drops.
* Direct Home selects the highest `releaseOrder` released LIVE Drop.
* That policy is NOT the long-term Journey 3 / returning-player rule.
* Multiple-Drop Home / Journey behavior remains intentionally undefined.
* No Knowledge Map, Concepts, mastery, XP, recommendation, second production Topic, or new social mechanics were introduced.
* M3.0 was an architectural foundation checkpoint; the user journey intentionally remained essentially unchanged.

M2.1 introduces durable authentication.

Use Convex Auth directly for V1.

Do not introduce Clerk, Better Auth, or another auth platform unless Convex Auth Google OAuth presents a concrete blocker and the blocker is explicitly reviewed.

---

# 25. Explicitly Retired V1 Concepts

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

# 26. Current Product Model Summary

## Content

`Topic -> Area -> Drop -> Question`

## Player Activity

Anonymous:

`Player -> Attempt -> Answers -> Result`

Authenticated:

`Profile -> Attempt -> Answers -> Result`

## Social Distribution

`Profile -> Invite -> another Player/Profile's Source Invite`

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

# 27. Journey 1 - Fresh Player Starts Directly

## LOCKED

Journey 1 covers a brand-new Player who opens Did You Know? directly and plays
the current/latest released LIVE Drop.

## Step 1 - Home

An anonymous new Player opens Did You Know?.

Fresh Direct Home follows the locked Fresh Direct Home principles:

* immediate Space challenge;
* light social promise;
* current/latest released LIVE Drop title;
* `5 questions`;
* `Play`.

No identity is required.

Primary action:

`Play`

Home proceeds directly into Question 1.

There is no separate Drop-intro screen.

## Steps 2-6 - Five Questions

Use the locked Question State, Answer, and Reveal contracts.

The repeated flow is:

`Question -> tap Answer -> Answer commits -> Reveal -> Next question`

Repeat through Question 5.

Question 5 Reveal ends with:

`See result`

## Step 7 - Direct Result

Use the locked Direct Result contract:

* score;
* plain interpretation scoped to this Drop;
* Drop title;
* social provocation around the Player's own Result;
* `Challenge a friend`;
* `Back to Home`;
* quiet `Save my journey` prompt when the Player is anonymous.

Do not show aggregate statistics or Question-by-Question recap on the default Direct Result.

## Step 8A - Social Path

If the Player chooses:

`Challenge a friend`

follow the locked Challenge To Share Flow.

Journey 1's social handoff is complete when:

* WhatsApp is opened with the generated message and Invite URL prefilled;
* or the complete generated message and Invite URL are copied.

## Step 8B - Knowledge Path

If the Player chooses:

`Back to Home`

show the minimal caught-up Home state when appropriate.

Do not define the full Journey destination here. Journey 3 will define the richer Journey experience.

## Step 8C - Persistence Path

If an anonymous Player chooses:

`Save my journey`

follow the locked Profile / auth flow, claim eligible anonymous progress, and return to Home.

## Screen / State Inventory

Major surfaces:

1. Home;
2. Play surface;
3. Result.

Transient states:

4. committed-Answer acknowledgement;
5. Profile / auth flow, only when required for sharing or saving Journey;
6. share choice.

Question and Reveal are states of the same play experience.

Do not create a separate Drop-intro state.

## Still OPEN

Do not resolve these from Journey 1:

* exact Home marketing copy;
* exact visual design;
* whether Home shows approximate duration;
* exact Profile / auth UI styling;
* exact share-sheet layout;
* optional Invite-copy preview;
* full Journey destination.

---

# 28. Journey 2 - Fresh Player Arrives Through An Invite

## LOCKED

Journey 2 covers a fresh Player who receives an Invite from a Challenger, opens it, plays the same Drop, sees a Challenged Result, and may Challenge someone else.

## Step 0 - Invitation Received

The Challenger has completed the Drop and has a reusable Invite.

The recipient receives an Invite message through WhatsApp.

For scores `0-4/5`, evergreen message intent:

`I got 3/5 on this Space challenge. Think you can beat me?`

`[Invite URL]`

For score `5/5`, use `match`, not `beat`.

The message is:

* first-person;
* Topic-aware;
* score-aware;
* short;
* non-promotional;
* fixed and non-editable in V1.

Drop title is not required in default message copy.

## Step 1 - Invite Landing

The recipient opens the Invite.

Invite landing follows the locked Invite Landing hierarchy:

* Challenger first;
* Topic;
* Challenger's Result;
* score-aware challenge prompt;
* Drop title;
* `5 questions`;
* immediate-learning promise;
* CTA semantically equivalent to `Take the challenge`.

Opening alone does not create Attempt attribution.

The primary action is semantically:

`Take the challenge`

Do not show:

* name field;
* authentication / Profile creation;
* Journey;
* Knowledge Map;
* upcoming Drops;
* aggregate statistics;
* propagation explanation;
* Source Invite mechanics;
* share options.

## Step 2 - Start

When the recipient intentionally activates the Invite landing CTA:

* they may remain anonymous and unauthenticated;
* their canonical Attempt for this Drop begins or resumes according to existing Attempt rules;
* if this is the first start of that Attempt, the Challenger's Invite becomes the Attempt's Source Invite;
* they proceed directly to Question 1.

No separate Drop intro.

## Steps 3-7 - Five Questions

Use the existing locked Question State, Answer, and Reveal contracts unchanged.

Do not persistently show during gameplay:

* Challenger score;
* social comparison;
* score-so-far.

The social context was established on Invite landing and returns at Result.

## Step 8 - Challenged Result

Use the locked Challenged Result contract.

M4.1 supersedes the action hierarchy for challenged Results: preserving or
opening `You & {challenger}` is now the primary relationship action, while
Trail continuation and `Challenge someone else` remain secondary / tertiary.

The Result must answer the acquisition question:

`Did I beat / lose to / tie my Challenger?`

Then it pivots to the current Player's own Result as the next social object.

No identity is required before the Player sees this Result.

## Step 9 - Propagate Onward

If the Player chooses:

`Challenge a friend`

follow the locked Challenge To Share Flow.

The Player's outgoing Invite uses the Player's canonical Result.

The next recipient sees the current Player as Challenger, not the previous Challenger.

Conceptual propagation:

`Rohanak -> Hira -> Varun`

No visible group, thread, or graph is created.

## Current Vs Historical Drops

A valid Invite remains valid when newer Drops release.

Historical released LIVE Drops remain fully playable.

Do not label them:

* old;
* expired;
* stale.

Current/latest framing may be used when accurate but is never required for the core Invite journey.

## Invalid Invite

Valid V1 Invites do not expire merely because time passes or newer Drops release.

Invalid Invite primarily means malformed, deleted/corrupt, missing content, or otherwise unresolvable.

Minimum recovery state:

`This challenge link isn't available.`

Primary CTA:

`Play the latest challenge`

Do not create an elaborate recovery system.

## Existing Player, Unplayed Drop

If the browser already contains a Player identity but that Player has not started this Drop:

* Invite landing still uses the direct Challenger context;
* starting follows the normal canonical Attempt / Source Invite rules;
* authenticated Profiles retain their existing display name;
* anonymous Players remain anonymous until they choose to Challenge someone or save their Journey later.

Do not expand already-completed behavior here; Journey 4 will cover it.

## Screen / State Inventory

Major experiences:

1. external WhatsApp Invite;
2. Invite landing;
3. existing Play surface;
4. existing Challenged Result.

Transient states:

5. committed-Answer acknowledgement;
6. Profile / auth flow only on onward Challenge or Save my journey when required;
7. share choice;
8. invalid Invite recovery.

Do not invent additional screens.

## Still OPEN

Do not resolve these from Journey 2:

* exact landing copy;
* exact CTA wording beyond semantic intent;
* whether `No authentication required before play` appears visibly;
* exact current/latest badge treatment;
* exact Open Graph / social-preview implementation;
* invalid-link final copy polish.

---

# 29. M2.1 - Persistent Profile + Result Escape

## LOCKED

M2.1 is a focused product correction and foundation milestone.

It exists to establish:

* anonymous play remains possible;
* Result is no longer a dead end;
* durable Profile identity exists for saving progress across browsers / devices;
* Challenge identity belongs to an authenticated Profile;
* eligible anonymous progress is claimed after successful authentication.

M2.1 should not become Journey 3.

## In Scope

M2.1 includes:

* Convex Auth client-side Google-only OAuth authentication;
* Profile creation / loading after successful authentication;
* claim of eligible anonymous Attempts into the authenticated Profile;
* server-authorized Profile ownership and claiming;
* preservation of originating `playerId` provenance;
* preservation of `sourceInviteId` attribution;
* Profile-owned progress taking precedence after authentication;
* `Save my journey`;
* `Challenge a friend` requiring Profile authentication when the Player is anonymous;
* Profile-owned reusable Invites;
* `Back to Home`;
* minimal caught-up Home;
* signed-in cross-browser / cross-device return acceptance.

## Out Of Scope

Do not implement in M2.1:

* Knowledge Map;
* exploration percentages;
* back-catalog redesign;
* scheduled next-Drop countdowns;
* email notifications;
* lifecycle email campaigns;
* account settings;
* email OTP;
* magic links;
* password creation;
* password reset;
* usernames;
* additional OAuth providers;
* Clerk;
* Better Auth;
* Resend or other transactional email providers;
* authenticated Next.js middleware;
* authenticated Server Components;
* SSR auth;
* API-route auth;
* aggregate statistics;
* public participant lists;
* visible propagation graph.

---

# 30. M2.2 - Account Boundary + Account State

## LOCKED

M2.2 is a focused correction after M2.1.

It exists to ensure:

* Profile-owned progress cannot leak through historical browser `playerId` values;
* sign-out creates a real anonymous boundary;
* authenticated state is visible and reversible;
* M1, M2, and M2.1 behavior remains intact.

## In Scope

M2.2 includes:

* ownership-aware anonymous Attempt lookup;
* prevention of anonymous reads or mutations against claimed Profile-owned Attempts;
* sign-out through Convex Auth;
* new browser-local `playerId` generation after successful sign-out;
* clearing transient auth / share / Profile UI state on sign-out;
* authenticated account chip on Home, caught-up Home, and Result;
* minimal account sheet;
* one-time `Journey saved` confirmation after meaningful auth + claim;
* shared-device sign-out / sign-in acceptance testing.

## Out Of Scope

Do not implement in M2.2:

* Profile editing;
* account settings;
* delete-account behavior;
* avatars;
* email visibility in social surfaces;
* Knowledge Map;
* Journey 3;
* returning-player content cadence beyond the existing minimal caught-up Home;
* new authentication providers;
* email notifications;
* analytics events.

---

# 31. M3 - Guided Exploration

## CURRENT DIRECTION

M3 should make Did You Know? feel, for the first time, like a small living world of surprising knowledge rather than a single quiz with more content.

Strategic thesis:

`Did You Know? turns surprising knowledge into a social object: something you can discover, accumulate, compare with people you know, and pass onward.`

Product guardrail:

`Every feature should make knowledge more valuable personally, persistently, or socially, not merely make the quiz more elaborate.`

M3's product milestone:

`One surprising Drop naturally opens into another, creating a connected Trail through the Did You Know? world.`

Trails are:

* editorially ordered;
* visible to the user;
* guided, never gated;
* independent of Topic / Area hierarchy;
* not a Knowledge Map or prerequisite system.

Every Drop remains independently playable and independently challengeable through its Invite URL.

## M3 Content Contract

CMS-ready means only:

`Content can change without product-engine code changing.`

A future content operator should eventually be able to change:

* Topics;
* Areas;
* Drops;
* Drop titles / descriptions;
* Question count;
* Question order;
* prompts / options;
* correct answers;
* Reveals;
* sources;
* Trail membership / order;

without changing:

* play engine;
* Attempt / Answer logic;
* Result / scoring;
* Invite / challenge behavior;
* Profile / auth;
* ownership / claiming;
* generic Home / Trail rendering.

M3 uses source-controlled structured content.

Do not build CMS/admin/editor infrastructure in M3.

Content records must be plain serializable data: strings, IDs, arrays, numbers, booleans, and simple metadata.

Topic, Area, Drop, Question, Option, Reveal, Source, and Trail content records must not contain:

* React components;
* callbacks;
* functions;
* product-engine behavior;
* application-specific rendering logic;
* auth / ownership / social behavior.

Acceptance test:

`Could the production content corpus be represented as JSON and later supplied by a CMS/database without losing product meaning or requiring play/result/invite logic to change?`

## M3 Question Count Contract

Question count is editorially determined per Drop.

The product engine must derive total Question count from Drop content and support variable `N` without engine changes.

Current editorial guidance:

* 5-7 Questions is the normal target range;
* 4-9 Questions is acceptable when the episode quality supports it;
* 10+ Questions requires explicit editorial justification;
* shorter is better than padded;
* every Question should make the episode meaningfully better.

Derive these from the resolved Drop:

* question progress;
* current Question number;
* completion condition;
* final `See result` condition;
* Result `X/N`;
* challenger `X/N` comparison;
* Home `Continue` state;
* Home `Explored` state;
* share copy;
* Invite / result copy;
* server validation.

A Drop completes when its ordered Question set is exhausted.

Do not change existing released Drop length merely for abstraction purity.
Change a released Drop's Question set only when the content improvement is worth
the historical-comparison/versioning tradeoff.

## M3 Trail Contract

Add a lightweight source-controlled Trail model:

```text
Trail
- id
- title
- description
- dropIds[]
```

The ordered `dropIds[]` is the editorial sequence.

Do not put `nextDropId` or `previousDropId` onto Drops.

Derive previous / next Trail position from Trail order so a Drop is not structurally coupled to a single editorial sequence.

Design so a Drop could theoretically appear in another Trail later, but do not build multi-Trail UX unless it is naturally trivial.

Do not add:

* graph edges;
* prerequisites;
* locks / unlocks;
* coordinates;
* branching algorithms;
* recommendation logic.

## M3 Experience

Build boldly toward this experience:

`The user finishes one Drop, sees that exploration recorded, and naturally understands where the thread can lead next.`

Home should render the visible Trail from structured Trail / Drop / Topic / Area content.

Home should feel like a connected thread of curiosity, not a category grid, quiz library, or course dashboard.

Home states:

* `Explore`;
* `Continue - N/total questions`;
* `Explored - X/total correct`.

Result should understand Trail context.

For direct / Home play:

* Trail continuation may be prominent.

For challenged play:

* challenger comparison / social context remains primary;
* Trail continuation remains available but secondary.

`Back to Home` remains available.

## M3 Content

Use real editable content, not placeholders.

The first M3 Trail should start from the existing Space / Solar System Drop and guide naturally into adjacent knowledge territory.

Do not block implementation on perfecting the final Trail wording or every discovery premise. The content model must make later editorial refinement cheap.

Maintain the Reveal-first quality standard:

* the underlying fact is worth knowing;
* a reliable source verifies it;
* there is a common intuition, misconception, or prediction the Question can surface;
* the Reveal explains why the answer matters, not merely what the answer is;
* a Player could plausibly tell someone else the fact afterward;
* the Reveal is still rewarding if the Player answered correctly.

## M3 Scope Alarms

Stop and report before proceeding if implementation starts requiring:

* CMS / admin infrastructure;
* new auth architecture;
* Profile / Invite ownership redesign;
* Knowledge Map;
* Concept graph;
* XP / mastery / streaks;
* friend graph / feed;
* recommendation engine;
* AI question generation;
* substantial new infrastructure that does not improve the M3 Guided Exploration experience.

## M3 Out Of Scope

Do not implement in M3:

* CMS UI;
* editor permissions;
* scheduling;
* preview system;
* archive workflow;
* editorial analytics;
* database-backed content migration;
* Knowledge Map;
* Concepts / knowledge graph;
* mastery;
* XP;
* streaks;
* leaderboard;
* recommendation engine;
* friend graph;
* AI-generated live questions;
* creator tools;
* replay;
* Browse Topics;
* Categories;
* All Drops;
* topic marketplace;
* global content library navigation.

---

# 32. M3.1 - Make The World Feel Real

## CURRENT DIRECTION

M3.1 is a focused visual product-expression milestone.

It exists because M3 established Guided Exploration structurally, but the product must also visually communicate:

* Wonder;
* Journey;
* Discovery.

Goal:

`Make Guided Exploration visually and emotionally legible without changing the underlying product model.`

M3.1 should make Did You Know? feel less like a clean quiz form and more like a connected world of surprising knowledge.

## M3.1 In Scope

M3.1 may change:

* Home / Trail visual composition;
* Trail bridge-question presentation;
* territory-specific visual identity for current Topics;
* Question surface atmosphere and hierarchy;
* Reveal hierarchy so the insight feels like the payoff;
* Result visual treatment so it feels like completion, social object, and doorway onward;
* account / share sheet styling only enough to fit the new visual system;
* loading / empty / invalid-link styling only enough to avoid the old visual system.

Trail bridge curiosities are content, not product-engine behavior.

They should live in source-controlled content data and be rendered generically.

## M3.1 Out Of Scope

Do not change:

* Attempt / replay model;
* auth;
* Profile ownership;
* Invite semantics;
* Convex schema;
* Trail semantics;
* scoring;
* content architecture;
* social logic.

Do not add:

* Reset;
* replay;
* XP;
* mastery;
* streaks;
* leaderboard;
* Knowledge Map;
* social graph;
* recommendation system;
* AI generation;
* CMS / admin infrastructure.

Known product gap:

`Completed Drops cannot currently be replayed. Do not implement destructive reset. Design multi-attempt replay deliberately later.`

---

# 33. M3.2 - Drop Experience System

## CURRENT DIRECTION

M3.2 creates the reusable contract that turns structured Drop content into a complete Did You Know? experience.

Principle:

`Consistent experience grammar, variable knowledge identity.`

M3.2 acceptance criterion:

`A new Drop can become a complete Did You Know? experience by filling the Drop Brief and structured content fields, without editing play, Result, Invite, auth, ownership, or other product-engine logic.`

## M3.2 In Scope

M3.2 may add:

* `docs/DROP_EXPERIENCE_SYSTEM.md`;
* `docs/templates/DROP_BRIEF.md`;
* internal editorial metadata on Drops, including central idea and exit understanding;
* Drop-level visual identity selection from a product-owned vocabulary;
* optional semantic artwork IDs;
* a generic visual vocabulary registry used by standard surfaces;
* migration of the three LIVE M3 Drops onto the contract;
* an ephemeral fourth-Drop proof that is removed before commit.

Generic rendering may switch on visual vocabulary keys only.

Do not branch visual or product behavior on Drop ID or Topic ID.

Restored local browser Drop selection must be resilient to content changes. If
the stored active Drop no longer resolves to a released playable Drop, the app clears that
local navigation state and returns to Home. Invalid Invite URLs keep their
explicit Invite error semantics.

## M3.2 Out Of Scope

Do not add:

* CMS / admin infrastructure;
* database content migration;
* Reset / replay;
* Knowledge Map;
* Concept graph;
* XP / mastery / streaks;
* leaderboard;
* friend graph / feed;
* recommendation engine;
* AI generation;
* new social systems.

## M3.2 Proof

M3.2 passes if a temporary fourth Drop can be created by changing only content and Trail configuration, using an existing visual family / motif, and automatically receives:

* Home representation;
* territory identity;
* Question experience;
* Reveal experience;
* Result experience;
* Invite landing;
* Challenge support;
* resume / progress;
* responsive behavior.

M3.2 fails if that ordinary Drop requires edits to:

* `DirectDropFlow.tsx`;
* Attempt / Answer logic;
* Result logic;
* Invite logic;
* auth / ownership;
* bespoke CSS for the Drop;
* layout conditionals based on Drop or Topic identity.

Adding a genuinely new visual family or interaction primitive is a product/design-system extension, not ordinary Drop authoring.

---

# 34. M4 - Knowledge Between Us

## CURRENT DIRECTION

M4 turns Challenge from social distribution into persistent social knowledge.

Milestone:

`A direct Challenge can create a lasting knowledge relationship between two authenticated Profiles.`

Lifecycle:

1. Authenticated A completes a Drop.
2. A challenges B.
3. B can play anonymously and receives the full challenged Result.
4. B chooses `Keep discovering with A`.
5. B authenticates.
6. B's challenged Attempt is claimed into B's Profile.
7. The app creates or reuses the symmetric `A & B` knowledge pair.
8. B lands on `You & A`, not generic Home.

The pair is born from a direct Challenge only after both people are identified.
Opening a link alone does not create a durable relationship.

## M4 Product Rules

The persistent object is not platform friendship.

User-facing language may say `You & Hira`.

Internally, this is a knowledge pair / relationship:

* symmetric: `A <-> B`;
* created from a directional Challenge;
* derived from canonical Profile Attempts and Answers.

Persist the relationship. Derive comparisons.

Do not persist:

* scores;
* wins;
* topic strengths;
* inferred expertise;
* question-overlap summaries.

Question-level comparison compares correctness only:

* both knew;
* you knew, they missed;
* they knew, you missed;
* neither knew.

If both people selected different wrong answers, that still counts as `neither knew`.

## M4 Privacy Rule

A pair comparison may only be queried by an authenticated Profile that belongs to
that pair.

The client must not be able to ask for arbitrary `Hira vs Varun` comparisons
unless the current user is Hira or Varun.

## M4 In Scope

M4 may add:

* one minimal `knowledgePairs` table;
* pair creation/reuse after challenged-recipient authentication;
* challenged Result question-overlap counts;
* discovery-level examples of what each person knew differently;
* contextual auth copy: `Keep discovering with {challenger}`;
* a lightweight `You & {name}` pair surface;
* Home re-entry for existing pairs;
* one next Challenge action when one person has explored a Drop and the other has not.

## M4 Out Of Scope

Do not add:

* friend requests;
* contact import;
* people search;
* feed;
* chat;
* notifications;
* public profiles;
* global leaderboard;
* intelligence score;
* inferred expertise labels;
* XP / mastery / streaks;
* replay / reset;
* Knowledge Map;
* recommendation engine;
* AI.

## M4 Acceptance Criterion

After Hira challenges Rohanak once, Hira remains meaningful inside Rohanak's Did
You Know? experience after the original Result screen is gone.

The accumulated difference between Rohanak and Hira should create a natural
reason for another Challenge.

## M4 Strategy-Completion Gate

Before M4 is treated as closed, verify:

1. Pair creation requires a completed challenged Attempt for the current
   authenticated Profile/browser and the supplied Invite.
2. Pair reads verify the authenticated Profile belongs to the requested pair.
3. The other person's public pair identity exposes `displayName`, not email.
4. Already-authenticated challenged recipients can create/reuse the pair without
   an unnecessary second auth step.
5. One real two-Profile production flow proves:
   * anonymous challenged play;
   * `Keep discovering with {challenger}`;
   * pair creation after auth;
   * `You & {challenger}`;
   * Home re-entry;
   * refresh/sign-out/sign-in persistence;
   * one symmetric pair, not duplicate directional pairs;
   * shared Drops accumulate from canonical Profile progress, not only Challenge
     history.

Counts alone are not enough to express the thesis. At least one shared Drop
should show the actual discovery moments behind the difference:

* `You knew this. Hira didn't.`
* `Hira knew this. You didn't.`

This must remain specific to Drops and Questions. Do not generalize into
expertise labels or intelligence claims.

## M4.1 Challenged Result Hierarchy

A challenged Result has one primary job:

`turn the completed Challenge into a persistent knowledge relationship.`

For challenged Results, order the page around:

1. what was compared: Topic / Area / Drop title;
2. how the recipient compared with the Challenger;
3. what each person knew differently;
4. preserving or opening `You & {challenger}` through `Keep discovering with
   {challenger}` or `See You & {challenger}`;
5. continuing curiosity through the next Trail bridge;
6. challenging someone else;
7. quiet escape to Home.

Trail continuation and onward Challenge remain available, but they must not
visually outrank the relationship action on challenged Results.

For direct/Home Results, Trail continuation may remain the primary next action.

## Future Trail Access Modes

Current M3/M4 Trails are open/guided:

* Trail order tells an editorial story.
* Every released LIVE Drop remains independently playable.
* Every released LIVE Drop remains independently challengeable.
* A recipient may enter a later Trail Drop directly from an Invite.

This is intentional for the current social-discovery product because frictionless
Challenge entry matters.

A future product may introduce sequential/prerequisite Trails for content where
later Drops genuinely depend on earlier Drops. That would be a separate product
decision, not an accidental consequence of Trail order.

Possible future rule:

* A Challenge may point at a later Drop.
* If the recipient has unmet prerequisites, the recipient starts at the first
  unmet prerequisite.
* The original Challenge target is preserved as the eventual destination.

Do not implement sequential gating until a specific Trail requires it.

---

# 35. M5 - The Daily Social Loop

## CURRENT DIRECTION

M5 turns one successful social knowledge relationship into a recurring loop.

Milestone:

`A new Drop reactivates an existing knowledge relationship, and each person's exploration can create a useful next action for the other.`

M5 exists because M1-M4 made the thesis work for one interaction:

`Discovery -> Propagation -> Exploration -> Relationship`

M5 adds:

`Recurrence`

## M5 Product Rules

New knowledge arrives over time.

Each Drop has an absolute `releaseAt` timestamp.

The engine derives:

* `Upcoming`: now is before `releaseAt`;
* `Available`: now is at or after `releaseAt` and the Drop is editorially live.

Daily midnight IST is the initial editorial cadence, not a permanent engine
assumption. The product supports scheduled episodic release through `releaseAt`.

Released Drops remain available indefinitely.

Release timing does not create prerequisite gating. Current Trails remain
open/guided.

## M5 Pair State

For each released Drop and established knowledge pair, derive the current pair
state from canonical Profile Attempts:

* neither explored -> no pair-specific action;
* I explored, they have not -> `Challenge {name}`;
* they explored, I have not -> `Explore and compare`;
* both explored -> `See what you knew`.

When a compact surface can show only one pair action, prefer the newest released
Drop with meaningful pair state. This keeps the latest release from being hidden
behind older unfinished gaps while preserving older Drops inside the full pair
surface.

Pair state is current truth, not notification state.

Do say:

* `Hira has explored Gravity. Explore and compare.`
* `Gravity: you both explored this. See what you knew.`

Do not say:

* `Hira just finished Gravity.`

unless read/unread or last-seen semantics are deliberately built later.

## M5 Anticipation

Countdowns support the loop; they are not the loop.

Only show anticipation prominently when there is no more valuable released action
available right now.

Good countdown surfaces:

* Home when the Player is caught up on all released Drops in the primary Trail;
* Pair surface when both people are caught up together;
* Result when there is no released next Trail Drop.

Do not show countdowns on:

* Invite landing;
* Question;
* Reveal.

When a countdown reaches zero, the client should refresh/re-query so the newly
released Drop becomes available without requiring a manual browser refresh.
Backend availability remains authoritative.

## M5 Backend Availability

Future Drops must not be playable merely because content exists in source.

Before `releaseAt`, a Drop cannot be:

* started through direct play;
* started through an Invite;
* answered;
* continued after Reveal;
* used to create a new Invite;
* opened through `dykDropId` as a playable Drop.

Invalid Invite semantics remain separate.

## M5 Home Direction

Home should answer three questions:

1. What's new in the knowledge world?
2. What's active between me and people?
3. Where am I in the Trail?

This is not a feed, friend list, or notification center.

Home may show current pair actions such as:

* `Gravity: you both explored this`;
* `You've explored today's Drop. Challenge Hira`;
* `Hira has explored today's Drop. Explore and compare`.

## M5 Acceptance Criterion

M5 is complete when this sequence works:

1. Rohanak and Hira already have a knowledge pair.
2. A future Drop visibly counts down.
3. The Drop releases.
4. Rohanak explores it.
5. `You & Hira` now says Hira has not explored it and offers `Challenge Hira`.
6. Hira explores later.
7. Rohanak now has a comparison available.
8. Both can compare what they knew differently.
9. When both are caught up, the next scheduled Drop creates anticipation.

## M5 Out Of Scope

Do not add:

* push notifications;
* email notifications;
* WhatsApp automation;
* activity feed;
* read/unread event infrastructure;
* friend requests;
* contact import;
* people search;
* groups;
* chat;
* leaderboard;
* streaks;
* XP;
* replay / reset;
* prerequisite Trails;
* anonymous access gating;
* AI recommendations;
* complex multiple release calendars.

After M5, major product mechanics should freeze for Build Week and effort should
shift toward content quality and release runway.

---

# 36. Remaining Journey Work

## TODO - Concrete V1 User Journeys

The next product-design work should explicitly document the remaining journeys.

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
* Profile / auth behavior where relevant;
* Result variants;
* timer decision;
* post-Drop lesson decision;
* Journey experience;
* aggregate social proof;
* sharing behavior.

Do not define implementation architecture from assumptions before these flows are specified.
