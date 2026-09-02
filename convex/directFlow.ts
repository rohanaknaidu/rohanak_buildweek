import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  getDrop,
  getLiveDrops,
  getQuestionById,
  getTrailContextForDrop,
  getTrails,
  toPublicDrop,
  toPublicQuestion,
  toPublicTrail,
  toPublicTrailContext,
} from "../content/registry";
import type { Drop } from "../content/registry";
import { getDefaultPlayableDrop } from "../product/dropSelection";

type AnswerDoc = Doc<"answers">;
type InviteDoc = Doc<"invites">;
type KnowledgePairDoc = Doc<"knowledgePairs">;
type ProfileDoc = Doc<"profiles">;
type InviteChallenger = {
  profileId: Id<"profiles">;
  displayName: string;
  result: { score: number; total: number };
  answers: AnswerDoc[];
};

async function getPlayerByLocalId(ctx: QueryCtx | MutationCtx, playerId: string) {
  return await ctx.db
    .query("players")
    .withIndex("by_playerId", (q) => q.eq("playerId", playerId))
    .unique();
}

async function ensurePlayer(ctx: MutationCtx, playerId: string) {
  const existingPlayer = await getPlayerByLocalId(ctx, playerId);

  if (existingPlayer) {
    return existingPlayer;
  }

  const playerDocId = await ctx.db.insert("players", {
    playerId,
    createdAt: Date.now(),
  });
  const player = await ctx.db.get(playerDocId);

  if (!player) {
    throw new Error("Player could not be created.");
  }

  return player;
}

async function getProfileByAuthUserId(
  ctx: QueryCtx | MutationCtx,
  authUserId: Id<"users">,
) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

async function getCurrentProfile(ctx: QueryCtx | MutationCtx) {
  const authUserId = await getAuthUserId(ctx);

  if (!authUserId) {
    return null;
  }

  return await getProfileByAuthUserId(ctx, authUserId);
}

function getInitialDisplayName(user: Doc<"users"> | null) {
  const googleName = user?.name?.trim();

  if (googleName) {
    return googleName.slice(0, 48);
  }

  return "A friend";
}

async function ensureProfile(ctx: MutationCtx) {
  const authUserId = await getAuthUserId(ctx);

  if (!authUserId) {
    throw new Error("Continue with Google before saving this journey.");
  }

  const existingProfile = await getProfileByAuthUserId(ctx, authUserId);

  if (existingProfile) {
    return existingProfile;
  }

  const authUser = await ctx.db.get(authUserId);
  const profileId = await ctx.db.insert("profiles", {
    authUserId,
    email: authUser?.email,
    displayName: getInitialDisplayName(authUser),
    createdAt: Date.now(),
  });
  const profile = await ctx.db.get(profileId);

  if (!profile) {
    throw new Error("Profile could not be created.");
  }

  return profile;
}

async function getAnonymousAttempt(
  ctx: QueryCtx | MutationCtx,
  playerId: string,
  dropId: string,
) {
  const attempts = await ctx.db
    .query("attempts")
    .withIndex("by_playerId_dropId", (q) =>
      q.eq("playerId", playerId).eq("dropId", dropId),
    )
    .collect();

  return attempts.find((attempt) => !attempt.profileId) ?? null;
}

async function getProfileAttempt(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
  dropId: string,
) {
  return await ctx.db
    .query("attempts")
    .withIndex("by_profileId_dropId", (q) =>
      q.eq("profileId", profileId).eq("dropId", dropId),
    )
    .unique();
}

async function getCanonicalAttempt({
  ctx,
  playerId,
  dropId,
  profile,
}: {
  ctx: QueryCtx | MutationCtx;
  playerId: string;
  dropId: string;
  profile: ProfileDoc | null;
}) {
  if (profile) {
    const profileAttempt = await getProfileAttempt(ctx, profile._id, dropId);
    if (profileAttempt) {
      return profileAttempt;
    }
  }

  return await getAnonymousAttempt(ctx, playerId, dropId);
}

async function getAnswers(ctx: QueryCtx | MutationCtx, attemptId: Id<"attempts">) {
  return await ctx.db
    .query("answers")
    .withIndex("by_attempt", (q) => q.eq("attemptId", attemptId))
    .collect();
}

async function getCompletedChallengedAttempt({
  ctx,
  playerId,
  profileId,
  invite,
}: {
  ctx: QueryCtx | MutationCtx;
  playerId: string;
  profileId: Id<"profiles">;
  invite: InviteDoc;
}) {
  const [playerAttempts, profileAttempt] = await Promise.all([
    ctx.db
      .query("attempts")
      .withIndex("by_playerId_dropId", (q) =>
        q.eq("playerId", playerId).eq("dropId", invite.dropId),
      )
      .collect(),
    getProfileAttempt(ctx, profileId, invite.dropId),
  ]);
  const attemptsById = new Map<Id<"attempts">, Doc<"attempts">>();

  for (const attempt of playerAttempts) {
    attemptsById.set(attempt._id, attempt);
  }

  if (profileAttempt) {
    attemptsById.set(profileAttempt._id, profileAttempt);
  }

  return (
    [...attemptsById.values()].find(
      (attempt) =>
        attempt.stage === "result" &&
        attempt.sourceInviteId === invite._id &&
        attempt.dropId === invite.dropId &&
        (attempt.playerId === playerId || attempt.profileId === profileId),
    ) ?? null
  );
}

async function getInviteByString(ctx: QueryCtx | MutationCtx, inviteId: string) {
  const normalizedId = ctx.db.normalizeId("invites", inviteId);

  if (!normalizedId) {
    return null;
  }

  return await ctx.db.get(normalizedId);
}

async function getReusableInvite(
  ctx: QueryCtx | MutationCtx,
  inviterProfileId: Id<"profiles">,
  dropId: string,
) {
  return await ctx.db
    .query("invites")
    .withIndex("by_inviter_profile_drop", (q) =>
      q.eq("inviterProfileId", inviterProfileId).eq("dropId", dropId),
    )
    .unique();
}

function getPairKey(profileAId: Id<"profiles">, profileBId: Id<"profiles">) {
  return [profileAId, profileBId].sort().join(":");
}

function orderPairProfileIds(
  profileAId: Id<"profiles">,
  profileBId: Id<"profiles">,
) {
  return profileAId < profileBId
    ? { profileAId, profileBId }
    : { profileAId: profileBId, profileBId: profileAId };
}

async function getKnowledgePairByProfiles(
  ctx: QueryCtx | MutationCtx,
  profileAId: Id<"profiles">,
  profileBId: Id<"profiles">,
) {
  return await ctx.db
    .query("knowledgePairs")
    .withIndex("by_pairKey", (q) => q.eq("pairKey", getPairKey(profileAId, profileBId)))
    .unique();
}

async function ensureKnowledgePair({
  ctx,
  profileAId,
  profileBId,
  inviteId,
}: {
  ctx: MutationCtx;
  profileAId: Id<"profiles">;
  profileBId: Id<"profiles">;
  inviteId: Id<"invites">;
}) {
  if (profileAId === profileBId) {
    return null;
  }

  const existingPair = await getKnowledgePairByProfiles(
    ctx,
    profileAId,
    profileBId,
  );

  if (existingPair) {
    return existingPair;
  }

  const orderedIds = orderPairProfileIds(profileAId, profileBId);
  const pairId = await ctx.db.insert("knowledgePairs", {
    ...orderedIds,
    pairKey: getPairKey(profileAId, profileBId),
    createdFromInviteId: inviteId,
    createdAt: Date.now(),
  });
  const pair = await ctx.db.get(pairId);

  if (!pair) {
    throw new Error("Knowledge pair could not be created.");
  }

  return pair;
}

async function claimAnonymousAttempts(
  ctx: MutationCtx,
  playerId: string,
  profile: ProfileDoc,
) {
  const playerAttempts = await ctx.db
    .query("attempts")
    .withIndex("by_playerId_dropId", (q) => q.eq("playerId", playerId))
    .collect();
  let claimedCount = 0;

  for (const attempt of playerAttempts) {
    if (attempt.profileId) {
      continue;
    }

    const existingProfileAttempt = await getProfileAttempt(
      ctx,
      profile._id,
      attempt.dropId,
    );

    if (existingProfileAttempt) {
      continue;
    }

    await ctx.db.patch(attempt._id, {
      profileId: profile._id,
    });
    claimedCount += 1;
  }

  return claimedCount;
}

function getScore(answers: AnswerDoc[]) {
  return answers.filter((answer) => answer.correct).length;
}

function getCorrectnessByQuestionId(answers: AnswerDoc[]) {
  return new Map(answers.map((answer) => [answer.questionId, answer.correct]));
}

function getAnswerOverlap({
  drop,
  myAnswers,
  theirAnswers,
}: {
  drop: Drop;
  myAnswers: AnswerDoc[];
  theirAnswers: AnswerDoc[];
}) {
  const myCorrectness = getCorrectnessByQuestionId(myAnswers);
  const theirCorrectness = getCorrectnessByQuestionId(theirAnswers);
  const overlap = {
    bothKnew: 0,
    youKnewTheyMissed: 0,
    theyKnewYouMissed: 0,
    neitherKnew: 0,
    youKnewTheyMissedDiscoveries: [] as {
      questionId: string;
      prompt: string;
      explanation: string;
      source: { label: string; url: string };
    }[],
    theyKnewYouMissedDiscoveries: [] as {
      questionId: string;
      prompt: string;
      explanation: string;
      source: { label: string; url: string };
    }[],
    bothKnewDiscoveries: [] as {
      questionId: string;
      prompt: string;
      explanation: string;
      source: { label: string; url: string };
    }[],
    neitherKnewDiscoveries: [] as {
      questionId: string;
      prompt: string;
      explanation: string;
      source: { label: string; url: string };
    }[],
  };

  for (const question of drop.questions) {
    const iKnew = myCorrectness.get(question.id) === true;
    const theyKnew = theirCorrectness.get(question.id) === true;

    if (iKnew && theyKnew) {
      overlap.bothKnew += 1;
      overlap.bothKnewDiscoveries.push({
        questionId: question.id,
        prompt: question.prompt,
        explanation: question.reveal.explanation,
        source: question.reveal.source,
      });
    } else if (iKnew) {
      overlap.youKnewTheyMissed += 1;
      overlap.youKnewTheyMissedDiscoveries.push({
        questionId: question.id,
        prompt: question.prompt,
        explanation: question.reveal.explanation,
        source: question.reveal.source,
      });
    } else if (theyKnew) {
      overlap.theyKnewYouMissed += 1;
      overlap.theyKnewYouMissedDiscoveries.push({
        questionId: question.id,
        prompt: question.prompt,
        explanation: question.reveal.explanation,
        source: question.reveal.source,
      });
    } else {
      overlap.neitherKnew += 1;
      overlap.neitherKnewDiscoveries.push({
        questionId: question.id,
        prompt: question.prompt,
        explanation: question.reveal.explanation,
        source: question.reveal.source,
      });
    }
  }

  return overlap;
}

function getPublicPlayer(player: Doc<"players"> | null) {
  if (!player) {
    return null;
  }

  return {
    playerId: player.playerId,
  };
}

function getPublicProfile(profile: ProfileDoc | null) {
  if (!profile) {
    return null;
  }

  return {
    id: profile._id,
    displayName: profile.displayName,
    email: profile.email,
  };
}

function getOtherProfileId(pair: KnowledgePairDoc, profileId: Id<"profiles">) {
  if (pair.profileAId === profileId) {
    return pair.profileBId;
  }

  if (pair.profileBId === profileId) {
    return pair.profileAId;
  }

  return null;
}

async function getProfilePairs(ctx: QueryCtx, profileId: Id<"profiles">) {
  const [asA, asB] = await Promise.all([
    ctx.db
      .query("knowledgePairs")
      .withIndex("by_profileA", (q) => q.eq("profileAId", profileId))
      .collect(),
    ctx.db
      .query("knowledgePairs")
      .withIndex("by_profileB", (q) => q.eq("profileBId", profileId))
      .collect(),
  ]);

  return [...asA, ...asB];
}

async function getCompletedProfileAttempts(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
) {
  const attempts = await ctx.db
    .query("attempts")
    .withIndex("by_profileId_dropId", (q) => q.eq("profileId", profileId))
    .collect();

  return attempts.filter((attempt) => attempt.stage === "result");
}

async function makePairSummary(
  ctx: QueryCtx,
  pair: KnowledgePairDoc,
  currentProfile: ProfileDoc,
) {
  const otherProfileId = getOtherProfileId(pair, currentProfile._id);

  if (!otherProfileId) {
    return null;
  }

  const otherProfile = await ctx.db.get(otherProfileId);

  if (!otherProfile) {
    return null;
  }

  const [myAttempts, theirAttempts] = await Promise.all([
    getCompletedProfileAttempts(ctx, currentProfile._id),
    getCompletedProfileAttempts(ctx, otherProfile._id),
  ]);
  const theirDropIds = new Set(theirAttempts.map((attempt) => attempt.dropId));
  const sharedExplorationCount = myAttempts.filter((attempt) =>
    theirDropIds.has(attempt.dropId),
  ).length;

  return {
    id: pair._id,
    otherProfile: {
      id: otherProfile._id,
      displayName: otherProfile.displayName,
    },
    sharedExplorationCount,
  };
}

async function makePairDetail(
  ctx: QueryCtx,
  pair: KnowledgePairDoc,
  currentProfile: ProfileDoc,
) {
  const otherProfileId = getOtherProfileId(pair, currentProfile._id);

  if (!otherProfileId) {
    return null;
  }

  const otherProfile = await ctx.db.get(otherProfileId);

  if (!otherProfile) {
    return null;
  }

  const [myAttempts, theirAttempts] = await Promise.all([
    getCompletedProfileAttempts(ctx, currentProfile._id),
    getCompletedProfileAttempts(ctx, otherProfile._id),
  ]);
  const myAttemptsByDropId = new Map(
    myAttempts.map((attempt) => [attempt.dropId, attempt]),
  );
  const theirAttemptsByDropId = new Map(
    theirAttempts.map((attempt) => [attempt.dropId, attempt]),
  );

  const dropSummaries = await Promise.all(
    getLiveDrops().map(async (drop) => {
      const myAttempt = myAttemptsByDropId.get(drop.id) ?? null;
      const theirAttempt = theirAttemptsByDropId.get(drop.id) ?? null;

      if (!myAttempt && !theirAttempt) {
        return null;
      }

      const [myAnswers, theirAnswers] = await Promise.all([
        myAttempt ? getAnswers(ctx, myAttempt._id) : Promise.resolve([]),
        theirAttempt ? getAnswers(ctx, theirAttempt._id) : Promise.resolve([]),
      ]);

      return {
        drop: toPublicDrop(drop),
        myScore: myAttempt ? getScore(myAnswers) : null,
        theirScore: theirAttempt ? getScore(theirAnswers) : null,
        total: drop.questions.length,
        overlap:
          myAttempt && theirAttempt
            ? getAnswerOverlap({ drop, myAnswers, theirAnswers })
            : null,
      };
    }),
  );

  return {
    id: pair._id,
    otherProfile: {
      id: otherProfile._id,
      displayName: otherProfile.displayName,
    },
    drops: dropSummaries.filter((summary) => summary !== null),
  };
}

function makeRevealPayload(answer: AnswerDoc) {
  const drop = getDrop(answer.dropId);
  if (!drop) {
    throw new Error("Drop not found for answer.");
  }

  const question = getQuestionById(drop, answer.questionId);
  if (!question) {
    throw new Error("Question not found for answer.");
  }

  return {
    questionId: question.id,
    selectedOptionId: answer.selectedOptionId,
    correctOptionId: question.correctOptionId,
    correct: answer.correct,
    explanation: question.reveal.explanation,
    source: question.reveal.source,
  };
}

async function makePublicChallenger({
  ctx,
  challenger,
  currentAnswers,
  currentProfile,
  drop,
}: {
  ctx: QueryCtx | MutationCtx;
  challenger: InviteChallenger;
  currentAnswers?: AnswerDoc[];
  currentProfile: ProfileDoc | null;
  drop?: Drop;
}) {
  const existingPair =
    currentProfile && currentProfile._id !== challenger.profileId
      ? await getKnowledgePairByProfiles(
          ctx,
          currentProfile._id,
          challenger.profileId,
        )
      : null;

  return {
    profileId: challenger.profileId,
    displayName: challenger.displayName,
    pairId: existingPair?._id ?? null,
    result: challenger.result,
    overlap:
      currentAnswers && drop
        ? getAnswerOverlap({
            drop,
            myAnswers: currentAnswers,
            theirAnswers: challenger.answers,
          })
        : null,
  };
}

function makeShareText({
  score,
  total,
  topicTitle,
  inviteUrl,
}: {
  score: number;
  total: number;
  topicTitle: string;
  inviteUrl: string;
}) {
  const comparisonVerb = score === total ? "match" : "beat";
  return `I got ${score}/${total} on this ${topicTitle} challenge. Think you can ${comparisonVerb} me? ${inviteUrl}`;
}

function getAttemptPayload(attempt: Doc<"attempts">, answers: AnswerDoc[]) {
  const drop = getDrop(attempt.dropId);
  if (!drop) {
    throw new Error("Drop not found for attempt.");
  }

  const currentQuestion = drop.questions[attempt.currentQuestionIndex] ?? null;
  const currentAnswer =
    currentQuestion === null
      ? null
      : (answers.find((answer) => answer.questionId === currentQuestion.id) ??
        null);

  return {
    attempt: {
      stage: attempt.stage,
      currentQuestionIndex: attempt.currentQuestionIndex,
      completedAt: attempt.completedAt,
      resultViewedAt: attempt.resultViewedAt,
      sourceInviteId: attempt.sourceInviteId,
      profileId: attempt.profileId,
    },
    currentQuestion: currentQuestion ? toPublicQuestion(currentQuestion) : null,
    reveal: currentAnswer ? makeRevealPayload(currentAnswer) : null,
    result:
      attempt.stage === "result"
        ? {
            score: getScore(answers),
            total: drop.questions.length,
          }
        : null,
  };
}

async function getInviteContext(ctx: QueryCtx | MutationCtx, inviteId: string) {
  const invite = await getInviteByString(ctx, inviteId);

  if (!invite?.inviterProfileId) {
    return null;
  }

  const drop = getDrop(invite.dropId);

  if (!drop || drop.status !== "live") {
    return null;
  }

  const inviterProfile = await ctx.db.get(invite.inviterProfileId);

  if (!inviterProfile) {
    return null;
  }

  const inviterAttempt = await getProfileAttempt(
    ctx,
    inviterProfile._id,
    drop.id,
  );

  if (!inviterAttempt || inviterAttempt.stage !== "result") {
    return null;
  }

  const inviterAnswers = await getAnswers(ctx, inviterAttempt._id);

  return {
    invite,
    drop,
    challenger: {
      profileId: inviterProfile._id,
      displayName: inviterProfile.displayName,
      result: {
        score: getScore(inviterAnswers),
        total: drop.questions.length,
      },
      answers: inviterAnswers,
    },
  };
}

async function getFlowPayload({
  ctx,
  playerId,
  dropId,
  invite,
  challenger,
}: {
  ctx: QueryCtx | MutationCtx;
  playerId: string;
  dropId: string;
  invite: InviteDoc | null;
  challenger: InviteChallenger | null;
}) {
  const drop = getDrop(dropId);

  if (!drop) {
    return {
      drop: null,
      player: null,
      profile: null,
      attemptState: null,
      invite: null,
      challenger: null,
      trailContext: null,
    };
  }

  const player = await getPlayerByLocalId(ctx, playerId);
  const profile = await getCurrentProfile(ctx);
  const attempt = await getCanonicalAttempt({
    ctx,
    playerId,
    dropId: drop.id,
    profile,
  });

  if (!attempt) {
      return {
        drop: toPublicDrop(drop),
        player: getPublicPlayer(player),
        profile: getPublicProfile(profile),
        attemptState: null,
        invite: invite ? { id: invite._id } : null,
        challenger: challenger
          ? await makePublicChallenger({
              ctx,
              challenger,
              currentProfile: profile,
            })
          : null,
        trailContext: toPublicTrailContext(getTrailContextForDrop(drop.id)),
      };
    }

  const answers = await getAnswers(ctx, attempt._id);

  return {
    drop: toPublicDrop(drop),
    player: getPublicPlayer(player),
    profile: getPublicProfile(profile),
    attemptState: getAttemptPayload(attempt, answers),
    invite: invite ? { id: invite._id } : null,
    challenger: challenger
      ? await makePublicChallenger({
          ctx,
          challenger,
          currentAnswers: attempt.stage === "result" ? answers : undefined,
          currentProfile: profile,
          drop,
        })
      : null,
    trailContext: toPublicTrailContext(getTrailContextForDrop(drop.id)),
  };
}

export const getFlowState = query({
  args: {
    playerId: v.string(),
    dropId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const drop = args.dropId ? getDrop(args.dropId) : getDefaultPlayableDrop();

    if (!drop || drop.status !== "live") {
      return {
        drop: null,
        player: null,
        profile: null,
        attemptState: null,
        invite: null,
        challenger: null,
        trailContext: null,
      };
    }

    return await getFlowPayload({
      ctx,
      playerId: args.playerId,
      dropId: drop.id,
      invite: null,
      challenger: null,
    });
  },
});

export const getHomeState = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await getPlayerByLocalId(ctx, args.playerId);
    const profile = await getCurrentProfile(ctx);
    const liveDropIds = new Set(getLiveDrops().map((drop) => drop.id));
    const trailSummaries = await Promise.all(
      getTrails().map(async (trail) => {
        const dropSummaries = await Promise.all(
          trail.dropIds
            .map((dropId) => getDrop(dropId))
            .filter(
              (drop): drop is Drop => drop !== null && liveDropIds.has(drop.id),
            )
            .map(async (drop) => {
              const attempt = await getCanonicalAttempt({
                ctx,
                playerId: args.playerId,
                dropId: drop.id,
                profile,
              });
              const total = drop.questions.length;

              if (!attempt) {
                return {
                  drop: toPublicDrop(drop),
                  status: "unstarted" as const,
                  currentQuestionNumber: null,
                  score: null,
                  total,
                };
              }

              const answers = await getAnswers(ctx, attempt._id);

              if (attempt.stage === "result") {
                return {
                  drop: toPublicDrop(drop),
                  status: "completed" as const,
                  currentQuestionNumber: null,
                  score: getScore(answers),
                  total,
                };
              }

              return {
                drop: toPublicDrop(drop),
                status: "inProgress" as const,
                currentQuestionNumber: Math.min(
                  attempt.currentQuestionIndex + 1,
                  total,
                ),
                score: null,
                total,
              };
            }),
        );

        return {
          ...toPublicTrail(trail),
          drops: dropSummaries,
        };
      }),
    );
    const dropSummaries = trailSummaries.flatMap((trail) => trail.drops);
    const pairSummaries = profile
      ? (
          await Promise.all(
            (await getProfilePairs(ctx, profile._id)).map((pair) =>
              makePairSummary(ctx, pair, profile),
            ),
          )
        ).filter((summary) => summary !== null)
      : [];

    return {
      trails: trailSummaries,
      exploredCount: dropSummaries.filter(
        (summary) => summary.status === "completed",
      ).length,
      totalCount: dropSummaries.length,
      player: getPublicPlayer(player),
      profile: getPublicProfile(profile),
      pairs: pairSummaries,
    };
  },
});

export const getPairState = query({
  args: {
    pairId: v.id("knowledgePairs"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);

    if (!profile) {
      return null;
    }

    const pair = await ctx.db.get(args.pairId);

    if (!pair || !getOtherProfileId(pair, profile._id)) {
      return null;
    }

    return await makePairDetail(ctx, pair, profile);
  },
});

export const getInviteFlowState = query({
  args: {
    playerId: v.string(),
    inviteId: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await getInviteContext(ctx, args.inviteId);

    if (!context) {
      return {
        invalidInvite: true,
        drop: null,
        player: null,
        profile: null,
        attemptState: null,
        invite: null,
        challenger: null,
      };
    }

    return {
      invalidInvite: false,
      ...(await getFlowPayload({
        ctx,
        playerId: args.playerId,
        dropId: context.drop.id,
        invite: context.invite,
        challenger: context.challenger,
      })),
    };
  },
});

export const ensureProfileAndClaim = mutation({
  args: {
    playerId: v.string(),
    pairFromInviteId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ensurePlayer(ctx, args.playerId);
    const profile = await ensureProfile(ctx);
    const claimedCount = await claimAnonymousAttempts(ctx, args.playerId, profile);
    const inviteContext = args.pairFromInviteId
      ? await getInviteContext(ctx, args.pairFromInviteId)
      : null;
    const completedChallengedAttempt = inviteContext
      ? await getCompletedChallengedAttempt({
          ctx,
          playerId: args.playerId,
          profileId: profile._id,
          invite: inviteContext.invite,
        })
      : null;
    const pair =
      inviteContext &&
      completedChallengedAttempt &&
      inviteContext.challenger.profileId !== profile._id
        ? await ensureKnowledgePair({
            ctx,
            profileAId: profile._id,
            profileBId: inviteContext.challenger.profileId,
            inviteId: inviteContext.invite._id,
          })
        : null;

    return {
      profile: getPublicProfile(profile),
      claimedCount,
      pair: pair
        ? {
            id: pair._id,
            otherProfile: {
              id: inviteContext?.challenger.profileId,
              displayName: inviteContext?.challenger.displayName,
            },
          }
        : null,
    };
  },
});

export const startAttempt = mutation({
  args: {
    playerId: v.string(),
    inviteId: v.optional(v.string()),
    dropId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviteContext = args.inviteId
      ? await getInviteContext(ctx, args.inviteId)
      : null;

    if (args.inviteId && !inviteContext) {
      throw new Error("This challenge link is not available.");
    }

    const requestedDrop = args.dropId ? getDrop(args.dropId) : null;

    if (args.dropId && (!requestedDrop || requestedDrop.status !== "live")) {
      throw new Error("This Drop is not available.");
    }

    const drop = inviteContext?.drop ?? requestedDrop ?? getDefaultPlayableDrop();

    if (!drop) {
      throw new Error("No live Drop is available.");
    }

    await ensurePlayer(ctx, args.playerId);

    const profile = await getCurrentProfile(ctx);
    if (profile) {
      await claimAnonymousAttempts(ctx, args.playerId, profile);
    }

    const existingAttempt = await getCanonicalAttempt({
      ctx,
      playerId: args.playerId,
      dropId: drop.id,
      profile,
    });

    if (existingAttempt) {
      const answers = await getAnswers(ctx, existingAttempt._id);
      return {
        drop: toPublicDrop(drop),
        attemptState: getAttemptPayload(existingAttempt, answers),
      };
    }

    const attemptId = await ctx.db.insert("attempts", {
      playerId: args.playerId,
      profileId: profile?._id,
      dropId: drop.id,
      currentQuestionIndex: 0,
      stage: "answering",
      sourceInviteId: inviteContext?.invite._id,
      startedAt: Date.now(),
    });

    const attempt = await ctx.db.get(attemptId);

    if (!attempt) {
      throw new Error("Attempt could not be started.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(attempt, []),
    };
  },
});

export const submitAnswer = mutation({
  args: {
    playerId: v.string(),
    dropId: v.string(),
    questionId: v.string(),
    selectedOptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getDrop(args.dropId);

    if (!drop || drop.status !== "live") {
      throw new Error("This Drop is not available.");
    }

    const profile = await getCurrentProfile(ctx);
    if (profile) {
      await claimAnonymousAttempts(ctx, args.playerId, profile);
    }

    const attempt = await getCanonicalAttempt({
      ctx,
      playerId: args.playerId,
      dropId: drop.id,
      profile,
    });

    if (!attempt) {
      throw new Error("Start the Drop before answering.");
    }

    if (attempt.stage === "result") {
      throw new Error("This Attempt is already complete.");
    }

    const question = drop.questions[attempt.currentQuestionIndex];

    if (!question || question.id !== args.questionId) {
      throw new Error("This Question is not currently answerable.");
    }

    const selectedOption = question.options.find(
      (option) => option.id === args.selectedOptionId,
    );

    if (!selectedOption) {
      throw new Error("Selected option does not exist for this Question.");
    }

    const existingAnswer = await ctx.db
      .query("answers")
      .withIndex("by_attempt_question", (q) =>
        q.eq("attemptId", attempt._id).eq("questionId", question.id),
      )
      .unique();

    if (existingAnswer) {
      const answers = await getAnswers(ctx, attempt._id);
      return {
        drop: toPublicDrop(drop),
        attemptState: getAttemptPayload(attempt, answers),
      };
    }

    await ctx.db.insert("answers", {
      attemptId: attempt._id,
      playerId: attempt.playerId,
      dropId: drop.id,
      questionId: question.id,
      selectedOptionId: selectedOption.id,
      correct: selectedOption.id === question.correctOptionId,
      answeredAt: Date.now(),
    });

    await ctx.db.patch(attempt._id, {
      stage: "revealing",
      completedAt:
        attempt.currentQuestionIndex === drop.questions.length - 1
          ? Date.now()
          : attempt.completedAt,
    });

    const updatedAttempt = await ctx.db.get(attempt._id);
    const answers = await getAnswers(ctx, attempt._id);

    if (!updatedAttempt) {
      throw new Error("Attempt not found after answer.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(updatedAttempt, answers),
    };
  },
});

export const continueAfterReveal = mutation({
  args: {
    playerId: v.string(),
    dropId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getDrop(args.dropId);

    if (!drop || drop.status !== "live") {
      throw new Error("This Drop is not available.");
    }

    const profile = await getCurrentProfile(ctx);
    if (profile) {
      await claimAnonymousAttempts(ctx, args.playerId, profile);
    }

    const attempt = await getCanonicalAttempt({
      ctx,
      playerId: args.playerId,
      dropId: drop.id,
      profile,
    });

    if (!attempt) {
      throw new Error("Start the Drop first.");
    }

    const answers = await getAnswers(ctx, attempt._id);
    const question = drop.questions[attempt.currentQuestionIndex];
    const answerForCurrentQuestion = question
      ? answers.find((answer) => answer.questionId === question.id)
      : null;

    if (!answerForCurrentQuestion) {
      throw new Error("Answer the current Question before continuing.");
    }

    const nextQuestionIndex = attempt.currentQuestionIndex + 1;

    if (nextQuestionIndex >= drop.questions.length) {
      await ctx.db.patch(attempt._id, {
        stage: "result",
        resultViewedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(attempt._id, {
        stage: "answering",
        currentQuestionIndex: nextQuestionIndex,
      });
    }

    const updatedAttempt = await ctx.db.get(attempt._id);

    if (!updatedAttempt) {
      throw new Error("Attempt not found after continuing.");
    }

    return {
      drop: toPublicDrop(drop),
      attemptState: getAttemptPayload(updatedAttempt, answers),
    };
  },
});

export const getOrCreateInvite = mutation({
  args: {
    playerId: v.string(),
    dropId: v.string(),
    origin: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getDrop(args.dropId);

    if (!drop || drop.status !== "live") {
      throw new Error("This Drop is not available.");
    }

    await ensurePlayer(ctx, args.playerId);
    const profile = await ensureProfile(ctx);
    await claimAnonymousAttempts(ctx, args.playerId, profile);

    const attempt = await getProfileAttempt(ctx, profile._id, drop.id);

    if (!attempt || attempt.stage !== "result") {
      throw new Error("Complete this Drop before creating an Invite.");
    }

    const answers = await getAnswers(ctx, attempt._id);
    const existingInvite = await getReusableInvite(ctx, profile._id, drop.id);
    const inviteId =
      existingInvite?._id ??
      (await ctx.db.insert("invites", {
        inviterProfileId: profile._id,
        dropId: drop.id,
        createdAt: Date.now(),
      }));
    const inviteUrl = `${args.origin.replace(/\/$/, "")}/i/${inviteId}`;
    const score = getScore(answers);

    return {
      invite: {
        id: inviteId,
        url: inviteUrl,
        message: makeShareText({
          score,
          total: drop.questions.length,
          topicTitle: drop.topic.name,
          inviteUrl,
        }),
      },
    };
  },
});
