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
type ProfileDoc = Doc<"profiles">;

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
  challenger: {
    profileId: Id<"profiles">;
    displayName: string;
    result: { score: number; total: number };
  } | null;
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
      challenger,
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
    challenger,
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

    return {
      trails: trailSummaries,
      exploredCount: dropSummaries.filter(
        (summary) => summary.status === "completed",
      ).length,
      totalCount: dropSummaries.length,
      player: getPublicPlayer(player),
      profile: getPublicProfile(profile),
    };
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
  },
  handler: async (ctx, args) => {
    await ensurePlayer(ctx, args.playerId);
    const profile = await ensureProfile(ctx);
    const claimedCount = await claimAnonymousAttempts(ctx, args.playerId, profile);

    return {
      profile: getPublicProfile(profile),
      claimedCount,
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
