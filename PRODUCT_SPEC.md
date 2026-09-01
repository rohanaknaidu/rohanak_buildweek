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
4. provide a real exit back to Space;
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
6. `Back to Space`;
7. quiet `Save my journey` prompt when the Player is anonymous.

Example intent:

`3/5`

`You knew 3 of 5 on this Space challenge.`

`How Strange Is Our Solar System?`

`Think someone can beat your 3/5?`

`Challenge a friend`

`Back to Space ->`

`Save my journey`

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
7. `Back to Space`;
8. quiet `Save my journey` prompt when the Player is anonymous.

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

`Back to Space ->`

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

`Back to Space` remains the secondary Result action.

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

Anonymous Result / Space Home:

`Save my journey`

-> Profile / auth flow

-> successful Google authentication

-> claim eligible anonymous progress

-> return to Space

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
* Back to Space without authentication;
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
* Back to Space without authentication;
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

Do not hardcode `this week's` into Invite copy that also serves older LIVE Drops.

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

* sell the immediate Space challenge;
* lightly hint that the Result can become social;
* avoid explaining the full Challenge mechanics;
* use familiar first-time language such as `Space challenge`;
* proceed directly into Question 1.

`Drop` remains the canonical domain/content term, but a fresh Player does not need to understand that term before playing.

Required semantic hierarchy:

1. `Did You Know?`;
2. short proposition combining knowledge and social comparison;
3. `Space`;
4. current/latest LIVE Drop title;
5. `5 questions`;
6. primary CTA: `Play`.

Exact marketing copy remains a design/copy decision.

Fresh Direct Home should not require:

* name;
* authentication / Profile creation;
* Area;
* Journey;
* upcoming Drop;
* aggregate statistics;
* share options;
* detailed explanation of Invites.

Approximate duration remains optional and should only be shown if honest for the actual content.

Do not create a separate Drop-intro screen in V1.

---

# 23. Result Escape And Minimal Space Home

## LOCKED

The Result screen must not be a dead end.

Every Result should provide:

* primary action: `Challenge a friend`;
* secondary action: `Back to Space`;
* quiet persistence prompt for anonymous Players: `Save my journey`.

`Back to Space` must work without authentication.

It must not route a completed Player back into the same completed Result forever.

For a Player or Profile who has completed all currently released Space content, the minimal Space Home may show:

* `DID YOU KNOW?`;
* `SPACE`;
* `You're caught up.`;
* completed Drop title;
* `Completed · X/5`;
* `View result`;
* `More Space coming soon.`

For an anonymous Player, the minimal Space Home should also quietly communicate:

* progress is saved on this device;
* `Save my journey`.

For an authenticated Profile, do not show the saved-on-this-device warning.

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

Journey 1 covers a brand-new Player who opens Did You Know? directly and plays the current/latest LIVE Space Drop.

## Step 1 - Home

An anonymous new Player opens Did You Know?.

Fresh Direct Home follows the locked Fresh Direct Home principles:

* immediate Space challenge;
* light social promise;
* current/latest LIVE Drop title;
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
* `Back to Space`;
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

`Back to Space`

show the minimal Space Home / caught-up state when appropriate.

Do not define the full Journey destination here. Journey 3 will define the richer Journey experience.

## Step 8C - Persistence Path

If an anonymous Player chooses:

`Save my journey`

follow the locked Profile / auth flow, claim eligible anonymous progress, and return to Space.

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

Historical LIVE Drops remain fully playable.

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

`Play the latest Space challenge`

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
* `Back to Space`;
* minimal caught-up Space Home;
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

# 30. Next Section To Define

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
