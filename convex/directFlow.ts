import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  getDropById,
  getLiveDrop,
  getQuestionById,
  isDropLive,
  toPublicDrop,
  toPublicQuestion,
} from "../content/drops";

type AnswerDoc = Doc<"answers">;
type InviteDoc = Doc<"invites">;

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

async function getAttempt(
  ctx: QueryCtx | MutationCtx,
  playerId: string,
  dropId: string,
) {
  return await ctx.db
    .query("attempts")
    .withIndex("by_playerId_dropId", (q) =>
      q.eq("playerId", playerId).eq("dropId", dropId),
    )
    .unique();
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
  inviterPlayerId: string,
  dropId: string,
) {
  return await ctx.db
    .query("invites")
    .withIndex("by_inviter_drop", (q) =>
      q.eq("inviterPlayerId", inviterPlayerId).eq("dropId", dropId),
    )
    .unique();
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
    displayName: player.displayName,
  };
}

function makeRevealPayload(answer: AnswerDoc) {
  const drop = getDropById(answer.dropId);
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
    source: {
      label: question.reveal.sourceLabel,
      url: question.reveal.sourceUrl,
    },
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
  const drop = getDropById(attempt.dropId);
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

async function getInviteContext(
  ctx: QueryCtx | MutationCtx,
  inviteId: string,
) {
  const invite = await getInviteByString(ctx, inviteId);

  if (!invite) {
    return null;
  }

  const drop = getDropById(invite.dropId);

  if (!drop || !isDropLive(drop)) {
    return null;
  }

  const inviter = await getPlayerByLocalId(ctx, invite.inviterPlayerId);

  if (!inviter?.displayName) {
    return null;
  }

  const inviterAttempt = await getAttempt(ctx, invite.inviterPlayerId, drop.id);

  if (!inviterAttempt || inviterAttempt.stage !== "result") {
    return null;
  }

  const inviterAnswers = await getAnswers(ctx, inviterAttempt._id);

  return {
    invite,
    drop,
    challenger: {
      playerId: inviter.playerId,
      displayName: inviter.displayName,
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
    playerId: string;
    displayName: string;
    result: { score: number; total: number };
  } | null;
}) {
  const drop = getDropById(dropId);

  if (!drop) {
    return {
      drop: null,
      player: null,
      attemptState: null,
      invite: null,
      challenger: null,
    };
  }

  const player = await getPlayerByLocalId(ctx, playerId);
  const attempt = await getAttempt(ctx, playerId, drop.id);

  if (!attempt) {
    return {
      drop: toPublicDrop(drop),
      player: getPublicPlayer(player),
      attemptState: null,
      invite: invite ? { id: invite._id } : null,
      challenger,
    };
  }

  const answers = await getAnswers(ctx, attempt._id);

  return {
    drop: toPublicDrop(drop),
    player: getPublicPlayer(player),
    attemptState: getAttemptPayload(attempt, answers),
    invite: invite ? { id: invite._id } : null,
    challenger,
  };
}

export const getFlowState = query({
  args: {
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const drop = getLiveDrop();

    if (!drop) {
      return {
        drop: null,
        player: null,
        attemptState: null,
        invite: null,
        challenger: null,
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

export const startAttempt = mutation({
  args: {
    playerId: v.string(),
    inviteId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviteContext = args.inviteId
      ? await getInviteContext(ctx, args.inviteId)
      : null;

    if (args.inviteId && !inviteContext) {
      throw new Error("This challenge link is not available.");
    }

    const drop = inviteContext?.drop ?? getLiveDrop();

    if (!drop) {
      throw new Error("No live Drop is available.");
    }

    await ensurePlayer(ctx, args.playerId);

    const existingAttempt = await getAttempt(ctx, args.playerId, drop.id);

    if (existingAttempt) {
      const answers = await getAnswers(ctx, existingAttempt._id);
      return {
        drop: toPublicDrop(drop),
        attemptState: getAttemptPayload(existingAttempt, answers),
      };
    }

    const attemptId = await ctx.db.insert("attempts", {
      playerId: args.playerId,
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
    const drop = getDropById(args.dropId);

    if (!drop || !isDropLive(drop)) {
      throw new Error("This Drop is not available.");
    }

    const attempt = await getAttempt(ctx, args.playerId, drop.id);

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
      playerId: args.playerId,
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
    const drop = getDropById(args.dropId);

    if (!drop || !isDropLive(drop)) {
      throw new Error("This Drop is not available.");
    }

    const attempt = await getAttempt(ctx, args.playerId, drop.id);

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

export const setDisplayName = mutation({
  args: {
    playerId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.displayName.trim();

    if (trimmedName.length < 1 || trimmedName.length > 32) {
      throw new Error("Enter a first name between 1 and 32 characters.");
    }

    const player = await ensurePlayer(ctx, args.playerId);

    await ctx.db.patch(player._id, {
      displayName: trimmedName,
      updatedAt: Date.now(),
    });

    return {
      player: {
        playerId: player.playerId,
        displayName: trimmedName,
      },
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
    const drop = getDropById(args.dropId);

    if (!drop || !isDropLive(drop)) {
      throw new Error("This Drop is not available.");
    }

    const player = await getPlayerByLocalId(ctx, args.playerId);

    if (!player?.displayName) {
      throw new Error("Add a display name before creating an Invite.");
    }

    const attempt = await getAttempt(ctx, args.playerId, drop.id);

    if (!attempt || attempt.stage !== "result") {
      throw new Error("Complete this Drop before creating an Invite.");
    }

    const answers = await getAnswers(ctx, attempt._id);
    const existingInvite = await getReusableInvite(ctx, player.playerId, drop.id);
    const inviteId =
      existingInvite?._id ??
      (await ctx.db.insert("invites", {
        inviterPlayerId: player.playerId,
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
          topicTitle: drop.topic.title,
          inviteUrl,
        }),
      },
    };
  },
});
